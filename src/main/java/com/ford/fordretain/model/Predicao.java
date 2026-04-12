package com.ford.fordretain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "predicoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Predicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "perfil_previsto", nullable = false, length = 30)
    private String perfilPrevisto;

    @Column(name = "prob_fiel", nullable = false, precision = 5, scale = 4)
    private BigDecimal probFiel;

    @Column(name = "prob_abandono", nullable = false, precision = 5, scale = 4)
    private BigDecimal probAbandono;

    @Column(name = "prob_esquecido", nullable = false, precision = 5, scale = 4)
    private BigDecimal probEsquecido;

    @Column(name = "prob_economico", nullable = false, precision = 5, scale = 4)
    private BigDecimal probEconomico;

    @Column(name = "acao_sugerida", columnDefinition = "TEXT")
    private String acaoSugerida;

    @Column(name = "score_risco", nullable = false)
    private Integer scoreRisco;

    @Column(name = "data_predicao")
    private LocalDateTime dataPredicao;

    @PrePersist
    protected void onCreate() {
        dataPredicao = LocalDateTime.now();
    }
}
