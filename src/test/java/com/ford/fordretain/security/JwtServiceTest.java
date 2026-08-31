package com.ford.fordretain.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes do JwtService: geração, validação e expiração do token.
 * Cobre o critério "JWT — Geração e validação, expiração e uso adequado das informações do token".
 */
class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET = "ford-retain-fiap-2026-chave-secreta-muito-longa-e-segura-256bits";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", 86_400_000L); // 24h
    }

    @Test
    @DisplayName("Deve gerar um token JWT válido e não vazio")
    void deveGerarTokenValido() {
        String token = jwtService.generateToken("gerente@ford.com", "GERENTE");

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }

    @Test
    @DisplayName("Deve extrair corretamente o email (subject) do token")
    void deveExtrairEmailDoToken() {
        String token = jwtService.generateToken("analista@ford.com", "ANALISTA");

        assertThat(jwtService.extractEmail(token)).isEqualTo("analista@ford.com");
    }

    @Test
    @DisplayName("Deve extrair corretamente o perfil (role) do token")
    void deveExtrairRoleDoToken() {
        String token = jwtService.generateToken("admin@ford.com", "ADMIN");

        assertThat(jwtService.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Token recém-gerado com expiração futura deve ser válido")
    void tokenValidoDentroDaExpiracao() {
        String token = jwtService.generateToken("gerente@ford.com", "GERENTE");

        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Token expirado deve ser inválido")
    void tokenExpiradoDeveSerInvalido() {
        // Expiração negativa força um token já vencido no momento da criação
        ReflectionTestUtils.setField(jwtService, "expiration", -1_000L);
        String tokenExpirado = jwtService.generateToken("gerente@ford.com", "GERENTE");

        assertThat(jwtService.isTokenValid(tokenExpirado)).isFalse();
    }

    @Test
    @DisplayName("Token malformado/adulterado deve ser inválido")
    void tokenMalformadoDeveSerInvalido() {
        String token = jwtService.generateToken("gerente@ford.com", "GERENTE");
        String tokenAdulterado = token.substring(0, token.length() - 5) + "aaaaa";

        assertThat(jwtService.isTokenValid(tokenAdulterado)).isFalse();
    }
}