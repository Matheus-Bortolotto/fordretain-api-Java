package com.ford.fordretain.repository;

import com.ford.fordretain.model.Predicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredicaoRepository extends JpaRepository<Predicao, Long> {

    // Última predição de um cliente
    Optional<Predicao> findTopByClienteIdOrderByDataPredicaoDesc(Long clienteId);

    // Leads em risco — score acima do mínimo, ordenados por prioridade
    @Query("""
        SELECT p FROM Predicao p
        JOIN FETCH p.cliente c
        WHERE p.scoreRisco >= :scoreMinimo
        ORDER BY p.scoreRisco DESC
    """)
    List<Predicao> findLeadsEmRisco(@Param("scoreMinimo") int scoreMinimo);

    // Contagem por perfil para o dashboard
    @Query("""
        SELECT p.perfilPrevisto, COUNT(p)
        FROM Predicao p
        WHERE p.id IN (
            SELECT MAX(p2.id) FROM Predicao p2 GROUP BY p2.cliente.id
        )
        GROUP BY p.perfilPrevisto
    """)
    List<Object[]> countByPerfil();

    // VIN Share por região (% de clientes FIEL ou ECONOMICO por UF)
    @Query(value = """
        SELECT c.regiao,
               SUM(CASE WHEN p.perfil_previsto IN ('FIEL','ECONOMICO') THEN 1 ELSE 0 END) * 1.0
               / COUNT(*) AS vin_share
        FROM predicoes p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE p.id IN (
            SELECT MAX(p2.id) FROM predicoes p2 GROUP BY p2.cliente_id
        )
        GROUP BY c.regiao
    """, nativeQuery = true)
    List<Object[]> vinSharePorRegiao();

    // VIN Share por modelo
    @Query(value = """
        SELECT c.modelo_veiculo,
               SUM(CASE WHEN p.perfil_previsto IN ('FIEL','ECONOMICO') THEN 1 ELSE 0 END) * 1.0
               / COUNT(*) AS vin_share
        FROM predicoes p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE p.id IN (
            SELECT MAX(p2.id) FROM predicoes p2 GROUP BY p2.cliente_id
        )
        GROUP BY c.modelo_veiculo
    """, nativeQuery = true)
    List<Object[]> vinSharePorModelo();
}
