package com.ford.fordretain.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

@Slf4j
@Component
public class CryptoUtils {

    private static final int GCM_IV_LENGTH = 12;    // bytes
    private static final int GCM_TAG_LENGTH = 128;  // bits
    private static final int KEY_LENGTH = 256;      // bits
    private static final int PBKDF2_ITERATIONS = 65536;

    // Chave DEDICADA para criptografia de dados em repouso — nunca reutiliza o
    // jwt.secret. Chaves com propósitos diferentes devem ser independentes:
    // vazar uma não pode comprometer a outra.
    @Value("${app.crypto.secret}")
    private String secret;

    // "Salt" da derivação de chave (não é sigiloso, mas também vem de config/env,
    // nunca hardcoded).
    @Value("${app.crypto.salt}")
    private String salt;

    private SecretKeySpec deriveKey() {
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            PBEKeySpec spec = new PBEKeySpec(secret.toCharArray(), salt.getBytes(), PBKDF2_ITERATIONS, KEY_LENGTH);
            byte[] keyBytes = factory.generateSecret(spec).getEncoded();
            return new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao derivar chave de criptografia", e);
        }
    }

    /**
     * AES/GCM com IV aleatório por mensagem (nunca reaproveitado — reaproveitar
     * IV no GCM quebra a confidencialidade). O IV não é sigiloso, por isso vai
     * junto com o ciphertext, prefixado, dentro do mesmo valor Base64.
     */
    public String encrypt(String data) {
        if (data == null) return null;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, deriveKey(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] ciphertext = cipher.doFinal(data.getBytes());

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv).put(ciphertext);
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception e) {
            log.error("Erro ao criptografar dado sensível");
            throw new RuntimeException("Erro de criptografia");
        }
    }

    /**
     * Tolerante a dados legados: linhas gravadas ANTES desta correção (ex.: o
     * seed de V2__insert_sample_data.sql) têm telefone em texto puro, sem
     * criptografia. Se a descriptografia falhar (Base64 inválido ou falha de
     * autenticação do GCM), assume-se que o valor é legado e é devolvido como
     * está, em vez de quebrar a requisição com 500.
     *
     * Isso é uma medida de transição, não o estado final desejado — o ideal é
     * rodar uma migração de dados que re-grave os valores legados já
     * criptografados. Documentado no relatório de segurança para o time de Cyber.
     */
    public String decrypt(String encrypted) {
        if (encrypted == null) return null;
        try {
            byte[] decoded = Base64.getDecoder().decode(encrypted);
            ByteBuffer buffer = ByteBuffer.wrap(decoded);

            byte[] iv = new byte[GCM_IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, deriveKey(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return new String(cipher.doFinal(ciphertext));
        } catch (Exception e) {
            log.warn("Valor não criptografado (dado legado) ou corrompido — retornando como está");
            return encrypted;
        }
    }

    public String anonymize(String email) {
        if (email == null) return null;
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) return "***@" + email.substring(atIndex + 1);
        return email.charAt(0) + "***" + email.charAt(atIndex - 1) + email.substring(atIndex);
    }
}