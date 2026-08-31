package com.ford.fordretain.controller;

import com.ford.fordretain.dto.LoginRequestDTO;
import com.ford.fordretain.dto.LoginResponseDTO;
import com.ford.fordretain.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Autenticação e geração de token JWT")
public class AuthController {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // Usuários mockados — em produção viriam do banco (tabela usuarios)
    // Hash BCrypt real da senha "ford2026", gerado com BCryptPasswordEncoder
    private static final String SENHA_HASH =
            "$2b$10$UhY5a/ojCNHkvkkdxdDCOOLnBWIzjYfSl8sLRVUa1/l7wfDJ0eVIW";

    private static final Map<String, String[]> USUARIOS = Map.of(
            "admin@ford.com",    new String[]{ SENHA_HASH, "ADMIN" },
            "analista@ford.com", new String[]{ SENHA_HASH, "ANALISTA" },
            "gerente@ford.com",  new String[]{ SENHA_HASH, "GERENTE" }
    );

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica o usuário e retorna um token JWT com expiração de 24h")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        log.info("Tentativa de login: {}", request.getEmail());

        String[] userData = USUARIOS.get(request.getEmail());

        // Credenciais inválidas — mensagem genérica (não revela se email existe)
        if (userData == null) {
            log.warn("[SECURITY] Login falhou para email: {}", request.getEmail());
            return ResponseEntity.status(401).body(
                    Map.of("erro", "Credenciais inválidas")
            );
        }

        // Verificação real do hash — nunca comparar senha em texto puro
        String hashArmazenado = userData[0];
        if (!passwordEncoder.matches(request.getSenha(), hashArmazenado)) {
            log.warn("[SECURITY] Senha incorreta para: {}", request.getEmail());
            return ResponseEntity.status(401).body(
                    Map.of("erro", "Credenciais inválidas")
            );
        }

        String role = userData[1];
        String token = jwtService.generateToken(request.getEmail(), role);

        log.info("Login realizado: {} | role={}", request.getEmail(), role);

        return ResponseEntity.ok(LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .email(request.getEmail())
                .role(role)
                .expiresIn(86400000L)
                .build());
    }
}