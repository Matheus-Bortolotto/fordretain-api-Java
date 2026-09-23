package com.ford.fordretain.service;

import com.ford.fordretain.dao.UsuarioDAO;
import com.ford.fordretain.dto.RegisterRequestDTO;
import com.ford.fordretain.exception.OperacaoUsuarioException;
import com.ford.fordretain.exception.UsuarioJaCadastradoException;
import com.ford.fordretain.exception.UsuarioNaoEncontradoException;
import com.ford.fordretain.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    public static final List<String> ROLES_VALIDAS = List.of("ADMIN", "GERENTE", "ANALISTA");
    private final UsuarioDAO usuarioDAO;
    private final PasswordEncoder passwordEncoder;

    public Usuario registrar(RegisterRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (usuarioDAO.existsByEmail(email)) throw new UsuarioJaCadastradoException("Já existe um usuário com este e-mail");
        try {
            return usuarioDAO.save(Usuario.builder().nome(request.getNome().trim()).email(email)
                    .senhaHash(passwordEncoder.encode(request.getSenha())).role("ANALISTA").ativo(true).build());
        } catch (DataIntegrityViolationException ex) {
            throw new UsuarioJaCadastradoException("Já existe um usuário com este e-mail");
        }
    }

    public Usuario autenticar(String email, String senha) {
        Usuario usuario = usuarioDAO.findByEmail(normalizeEmail(email)).orElse(null);
        if (usuario == null || !usuario.isAtivo() || !passwordEncoder.matches(senha, usuario.getSenhaHash())) return null;
        return usuario;
    }

    public List<Usuario> listar() { return usuarioDAO.findAll(); }

    public Usuario buscar(Long id) { return usuarioDAO.findById(id).orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado")); }

    public Usuario alterarRole(Long id, String role) {
        String normalized = role == null ? "" : role.trim().toUpperCase();
        if (!ROLES_VALIDAS.contains(normalized)) throw new OperacaoUsuarioException("Role inválida. Use ADMIN, GERENTE ou ANALISTA");
        Usuario atual = buscar(id);
        if ("ADMIN".equals(atual.getRole()) && !"ADMIN".equals(normalized) && atual.isAtivo() && usuarioDAO.countActiveAdmins() <= 1) {
            throw new OperacaoUsuarioException("O sistema precisa manter pelo menos um administrador ativo");
        }
        usuarioDAO.updateRole(id, normalized);
        atual.setRole(normalized);
        return atual;
    }

    public Usuario alterarStatus(Long id, boolean ativo) {
        Usuario atual = buscar(id);
        if (!ativo && "ADMIN".equals(atual.getRole()) && atual.isAtivo() && usuarioDAO.countActiveAdmins() <= 1) {
            throw new OperacaoUsuarioException("O sistema precisa manter pelo menos um administrador ativo");
        }
        usuarioDAO.updateAtivo(id, ativo);
        atual.setAtivo(ativo);
        return atual;
    }

    public static String normalizeEmail(String email) { return email == null ? "" : email.trim().toLowerCase(); }
}
