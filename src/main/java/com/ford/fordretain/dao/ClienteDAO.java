package com.ford.fordretain.dao;

import com.ford.fordretain.model.Cliente;

import java.util.Optional;

public interface ClienteDAO {
    Cliente save(Cliente cliente);
    boolean existsByEmail(String email);
    Optional<Cliente> findByEmail(String email);
    long count();
}