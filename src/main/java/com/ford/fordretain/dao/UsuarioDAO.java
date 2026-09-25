package com.ford.fordretain.dao;

import com.ford.fordretain.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioDAO {
    Usuario save(Usuario usuario);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findById(Long id);
    List<Usuario> findAll();
    boolean existsByEmail(String email);
    boolean updateRole(Long id, String role);
    boolean updateAtivo(Long id, boolean ativo);
    long countActiveAdmins();
}
