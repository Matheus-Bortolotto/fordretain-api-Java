package com.ford.fordretain.service;

import com.ford.fordretain.dto.ClienteRequestDTO;
import com.ford.fordretain.dto.DashboardDTO;
import com.ford.fordretain.dto.LeadDTO;
import com.ford.fordretain.dto.PredicaoResponseDTO;
import com.ford.fordretain.exception.ClienteJaCadastradoException;
import com.ford.fordretain.exception.ClienteNaoEncontradoException;
import com.ford.fordretain.model.Cliente;
import com.ford.fordretain.model.Predicao;
import com.ford.fordretain.repository.ClienteRepository;
import com.ford.fordretain.repository.PredicaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {

    private final ClienteRepository clienteRepository;
    private final PredicaoRepository predicaoRepository;

    /**
     * Recebe os dados do cliente, persiste e executa a predição de perfil.
     * 
     * NOTA: O método mockPredict() abaixo simula o modelo de ML.
     * Quando o modelo Python estiver pronto, basta substituir essa chamada
     * por uma requisição HTTP ao microsserviço Python (FastAPI).
     */
    @Transactional
    public PredicaoResponseDTO predict(ClienteRequestDTO request) {
        log.info("Iniciando predição para o cliente: {}", request.getEmail());

        if (clienteRepository.existsByEmail(request.getEmail())) {
            throw new ClienteJaCadastradoException(request.getEmail());
        }

        // Persistir o cliente
        Cliente cliente = clienteRepository.save(Cliente.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .telefone(request.getTelefone())
                .regiao(request.getRegiao())
                .idade(request.getIdade())
                .canalCompra(request.getCanalCompra())
                .formaPagamento(request.getFormaPagamento())
                .modeloVeiculo(request.getModeloVeiculo())
                .dataCompra(request.getDataCompra())
                .historicoMarca(request.getHistoricoMarca())
                .build());

        // =====================================================
        // PONTO DE INTEGRAÇÃO COM O MODELO ML (Python/FastAPI)
        // Substituir mockPredict() pela chamada ao microsserviço
        // quando o modelo estiver treinado.
        // =====================================================
        Map<String, BigDecimal> probs = mockPredict(request);
        String perfil = perfilMaisProvavel(probs);
        int scoreRisco = calcularScoreRisco(perfil, probs);
        String acao = sugerirAcao(perfil);

        // Persistir a predição
        Predicao predicao = predicaoRepository.save(Predicao.builder()
                .cliente(cliente)
                .perfilPrevisto(perfil)
                .probFiel(probs.get("FIEL"))
                .probAbandono(probs.get("ABANDONO"))
                .probEsquecido(probs.get("ESQUECIDO"))
                .probEconomico(probs.get("ECONOMICO"))
                .acaoSugerida(acao)
                .scoreRisco(scoreRisco)
                .build());

        log.info("Predição concluída. Cliente {} → perfil: {}, score: {}", cliente.getId(), perfil, scoreRisco);

        return PredicaoResponseDTO.builder()
                .predicaoId(predicao.getId())
                .clienteId(cliente.getId())
                .nomeCliente(cliente.getNome())
                .perfilPrevisto(perfil)
                .probabilidades(probs)
                .scoreRisco(scoreRisco)
                .acaoSugerida(acao)
                .dataPredicao(predicao.getDataPredicao())
                .build();
    }

    /**
     * Retorna métricas agregadas de VIN Share para o dashboard.
     */
    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        long total = clienteRepository.count();

        // Distribuição de perfis
        Map<String, Long> distribuicao = predicaoRepository.countByPerfil()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        long clientes_fiel = distribuicao.getOrDefault("FIEL", 0L);
        long clientes_eco  = distribuicao.getOrDefault("ECONOMICO", 0L);
        double vinShare = total > 0 ? (double)(clientes_fiel + clientes_eco) / total : 0.0;

        long riscoAlto = predicaoRepository.findLeadsEmRisco(70).size();

        // VIN Share por região
        Map<String, Double> vinRegiao = predicaoRepository.vinSharePorRegiao()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).doubleValue()
                ));

        // VIN Share por modelo
        Map<String, Double> vinModelo = predicaoRepository.vinSharePorModelo()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).doubleValue()
                ));

        return DashboardDTO.builder()
                .totalClientes(total)
                .vinShareGeral(Math.round(vinShare * 10000.0) / 10000.0)
                .clientesRiscoAlto(riscoAlto)
                .distribuicaoPerfis(distribuicao)
                .vinSharePorRegiao(vinRegiao)
                .vinSharePorModelo(vinModelo)
                .geradoEm(LocalDateTime.now())
                .build();
    }

    /**
     * Lista clientes em risco de evasão, ordenados por prioridade (score DESC).
     */
    @Transactional(readOnly = true)
    public List<LeadDTO> getLeads(int scoreMinimo) {
        return predicaoRepository.findLeadsEmRisco(scoreMinimo)
                .stream()
                .map(p -> {
                    Cliente c = p.getCliente();
                    BigDecimal probPrincipal = switch (p.getPerfilPrevisto()) {
                        case "FIEL"      -> p.getProbFiel();
                        case "ABANDONO"  -> p.getProbAbandono();
                        case "ESQUECIDO" -> p.getProbEsquecido();
                        default          -> p.getProbEconomico();
                    };
                    return LeadDTO.builder()
                            .clienteId(c.getId())
                            .nome(c.getNome())
                            .email(c.getEmail())
                            .telefone(c.getTelefone())
                            .regiao(c.getRegiao())
                            .modeloVeiculo(c.getModeloVeiculo())
                            .perfilPrevisto(p.getPerfilPrevisto())
                            .scoreRisco(p.getScoreRisco())
                            .probabilidadePrincipal(probPrincipal)
                            .acaoSugerida(p.getAcaoSugerida())
                            .dataPredicao(p.getDataPredicao())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ================================================================
    // MÉTODOS AUXILIARES — Lógica simulada (substituir pelo modelo ML)
    // ================================================================

    /**
     * Simula a resposta do modelo de ML.
     * Quando o modelo Python estiver disponível, este método deve ser
     * substituído por uma chamada HTTP (RestTemplate / WebClient) para
     * o microsserviço FastAPI em http://localhost:5000/predict
     */
    private Map<String, BigDecimal> mockPredict(ClienteRequestDTO req) {
        Map<String, BigDecimal> probs = new LinkedHashMap<>();

        // Lógica simples baseada em regras de negócio como placeholder
        if ("PRIMEIRA_COMPRA".equals(req.getHistoricoMarca()) && "ONLINE".equals(req.getCanalCompra())) {
            probs.put("FIEL",      new BigDecimal("0.0800"));
            probs.put("ABANDONO",  new BigDecimal("0.6800"));
            probs.put("ESQUECIDO", new BigDecimal("0.1500"));
            probs.put("ECONOMICO", new BigDecimal("0.0900"));
        } else if ("RECOMPRA".equals(req.getHistoricoMarca())) {
            probs.put("FIEL",      new BigDecimal("0.6500"));
            probs.put("ABANDONO",  new BigDecimal("0.0800"));
            probs.put("ESQUECIDO", new BigDecimal("0.1200"));
            probs.put("ECONOMICO", new BigDecimal("0.1500"));
        } else if ("CONSORCIO".equals(req.getFormaPagamento())) {
            probs.put("FIEL",      new BigDecimal("0.1500"));
            probs.put("ABANDONO",  new BigDecimal("0.1000"));
            probs.put("ESQUECIDO", new BigDecimal("0.6000"));
            probs.put("ECONOMICO", new BigDecimal("0.1500"));
        } else {
            probs.put("FIEL",      new BigDecimal("0.2000"));
            probs.put("ABANDONO",  new BigDecimal("0.1500"));
            probs.put("ESQUECIDO", new BigDecimal("0.1500"));
            probs.put("ECONOMICO", new BigDecimal("0.5000"));
        }
        return probs;
    }

    private String perfilMaisProvavel(Map<String, BigDecimal> probs) {
        return probs.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("ECONOMICO");
    }

    private int calcularScoreRisco(String perfil, Map<String, BigDecimal> probs) {
        return switch (perfil) {
            case "ABANDONO"  -> (int)(probs.get("ABANDONO").doubleValue() * 100);
            case "ESQUECIDO" -> (int)(probs.get("ESQUECIDO").doubleValue() * 70);
            case "ECONOMICO" -> (int)(probs.get("ECONOMICO").doubleValue() * 50);
            default          -> (int)((1 - probs.get("FIEL").doubleValue()) * 20);
        };
    }

    private String sugerirAcao(String perfil) {
        return switch (perfil) {
            case "FIEL"      -> "Programa de fidelidade premium — oferecer revisão com desconto exclusivo.";
            case "ABANDONO"  -> "Contato imediato — pacote de 3 revisões com desconto progressivo.";
            case "ESQUECIDO" -> "Enviar lembrete com agendamento fácil e link direto para a concessionária.";
            case "ECONOMICO" -> "Enviar cupom de desconto de 20% na próxima revisão agendada.";
            default          -> "Monitorar comportamento nas próximas semanas.";
        };
    }
}
