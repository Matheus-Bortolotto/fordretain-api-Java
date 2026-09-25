package com.ford.fordretain.dao.impl;

import com.ford.fordretain.config.OracleConnectionFactory;
import com.ford.fordretain.dao.UsuarioDAO;
import com.ford.fordretain.exception.DatabaseException;
import com.ford.fordretain.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UsuarioDAOImpl implements UsuarioDAO {
    private final OracleConnectionFactory connectionFactory;

    @Override
    public Usuario save(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = connectionFactory.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, new String[]{"id"})) {
            ps.setString(1, usuario.getNome());
            ps.setString(2, usuario.getEmail());
            ps.setString(3, usuario.getSenhaHash());
            ps.setString(4, usuario.getRole());
            ps.setInt(5, usuario.isAtivo() ? 1 : 0);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) usuario.setId(rs.getLong(1));
            }
            usuario.setDataCriacao(LocalDateTime.now());
            return usuario;
        } catch (SQLException e) {
            throw new DatabaseException("Erro ao salvar usuário", e);
        }
    }

    @Override
    public Optional<Usuario> findByEmail(String email) {
        return findOne("SELECT id, nome, email, senha_hash, role, ativo, data_criacao FROM usuarios WHERE email = ?", email);
    }

    @Override
    public Optional<Usuario> findById(Long id) {
        return findOne("SELECT id, nome, email, senha_hash, role, ativo, data_criacao FROM usuarios WHERE id = ?", id);
    }

    private Optional<Usuario> findOne(String sql, Object parameter) {
        try (Connection conn = connectionFactory.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            if (parameter instanceof Long value) ps.setLong(1, value); else ps.setString(1, (String) parameter);
            try (ResultSet rs = ps.executeQuery()) { return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty(); }
        } catch (SQLException e) { throw new DatabaseException("Erro ao buscar usuário", e); }
    }

    @Override
    public List<Usuario> findAll() {
        String sql = "SELECT id, nome, email, senha_hash, role, ativo, data_criacao FROM usuarios ORDER BY id";
        List<Usuario> usuarios = new ArrayList<>();
        try (Connection conn = connectionFactory.getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) usuarios.add(mapRow(rs));
            return usuarios;
        } catch (SQLException e) { throw new DatabaseException("Erro ao listar usuários", e); }
    }

    @Override
    public boolean existsByEmail(String email) {
        try (Connection conn = connectionFactory.getConnection(); PreparedStatement ps = conn.prepareStatement("SELECT COUNT(1) FROM usuarios WHERE email = ?")) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) { return rs.next() && rs.getLong(1) > 0; }
        } catch (SQLException e) { throw new DatabaseException("Erro ao verificar usuário", e); }
    }

    @Override
    public boolean updateRole(Long id, String role) { return update("UPDATE usuarios SET role = ? WHERE id = ?", role, id); }

    @Override
    public boolean updateAtivo(Long id, boolean ativo) { return update("UPDATE usuarios SET ativo = ? WHERE id = ?", ativo ? 1 : 0, id); }

    private boolean update(String sql, Object first, Long id) {
        try (Connection conn = connectionFactory.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            if (first instanceof Integer value) ps.setInt(1, value); else ps.setString(1, (String) first);
            ps.setLong(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { throw new DatabaseException("Erro ao atualizar usuário", e); }
    }

    @Override
    public long countActiveAdmins() {
        try (Connection conn = connectionFactory.getConnection(); PreparedStatement ps = conn.prepareStatement("SELECT COUNT(1) FROM usuarios WHERE role = 'ADMIN' AND ativo = 1"); ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getLong(1) : 0;
        } catch (SQLException e) { throw new DatabaseException("Erro ao contar administradores", e); }
    }

    private Usuario mapRow(ResultSet rs) throws SQLException {
        Timestamp timestamp = rs.getTimestamp("data_criacao");
        return Usuario.builder().id(rs.getLong("id")).nome(rs.getString("nome")).email(rs.getString("email"))
                .senhaHash(rs.getString("senha_hash")).role(rs.getString("role")).ativo(rs.getInt("ativo") == 1)
                .dataCriacao(timestamp == null ? null : timestamp.toLocalDateTime()).build();
    }
}
