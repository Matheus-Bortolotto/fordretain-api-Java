package com.ford.fordretain.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final com.ford.fordretain.dao.UsuarioDAO usuarioDAO;
    @org.springframework.beans.factory.annotation.Value("${monitoring.token:}")
    private String monitoringToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        if ("/actuator/prometheus".equals(request.getRequestURI())) {
            if (monitoringToken == null || monitoringToken.length() < 32 ||
                !java.security.MessageDigest.isEqual(token.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    monitoringToken.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                response.sendError(401); return;
            }
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "metrics-collector", null, List.of(new SimpleGrantedAuthority("ROLE_MONITORING"))));
            chain.doFilter(request, response); return;
        }

        if (!jwtService.isTokenValid(token)) {
            log.warn("Token inválido rejeitado");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"erro\":\"Token inválido ou expirado\"}");
            return;
        }

        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);

        com.ford.fordretain.model.Usuario usuario;
        try { usuario = usuarioDAO.findByEmail(email).orElse(null); }
        catch (RuntimeException e) { response.sendError(503, "Autenticação indisponível"); return; }
        if (usuario == null || !usuario.isAtivo() || role == null || !role.equals(usuario.getRole())) {
            response.sendError(401, "Sessão revogada"); return;
        }
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );

        SecurityContextHolder.getContext().setAuthentication(auth);
        chain.doFilter(request, response);
    }
}