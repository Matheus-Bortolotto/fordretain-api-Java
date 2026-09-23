package com.ford.fordretain.controller;

import com.ford.fordretain.dto.LoginRequestDTO;
import com.ford.fordretain.dto.LoginResponseDTO;
import com.ford.fordretain.dto.RegisterRequestDTO;
import com.ford.fordretain.dto.UsuarioResponseDTO;
import com.ford.fordretain.model.Usuario;
import com.ford.fordretain.security.JwtService;
import com.ford.fordretain.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Autenticação e geração de token JWT")
public class AuthController {
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    @PostMapping("/register")
    @Operation(summary = "Cadastrar usuário", description = "Cria uma conta com role ANALISTA e status ativo")
    public ResponseEntity<UsuarioResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(201).body(UsuarioResponseDTO.from(usuarioService.registrar(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica o usuário e retorna um token JWT com expiração de 24h")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        String email = UsuarioService.normalizeEmail(request.getEmail());
        Usuario usuario = usuarioService.autenticar(email, request.getSenha());
        if (usuario == null) {
            log.warn("[SECURITY] Login falhou para email: {}", email);
            return ResponseEntity.status(401).body(Map.of("erro", "Credenciais inválidas"));
        }
        String token = jwtService.generateToken(usuario.getEmail(), usuario.getRole());
        return ResponseEntity.ok(LoginResponseDTO.builder().token(token).tipo("Bearer")
                .email(usuario.getEmail()).nome(usuario.getNome()).role(usuario.getRole()).expiresIn(86400000L).build());
    }
}
