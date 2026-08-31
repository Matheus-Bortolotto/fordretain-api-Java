package com.ford.fordretain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ford.fordretain.dto.ClienteRequestDTO;
import com.ford.fordretain.dto.DashboardDTO;
import com.ford.fordretain.dto.PredicaoResponseDTO;
import com.ford.fordretain.security.JwtService;
import com.ford.fordretain.security.SecurityConfig;
import com.ford.fordretain.service.PredictionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração (camada web + segurança) do FordRetainController.
 * Cobre os três cenários exigidos pela Sprint 3:
 *  - sucesso (200/201 com token e role corretos)
 *  - erro (400 payload inválido)
 *  - acesso não autorizado (401 sem token, 403 com role sem permissão)
 */
// JwtAuthFilter, RateLimitFilter e AuditLogFilter são beans do tipo Filter e já são
// detectados automaticamente pelo slice do @WebMvcTest — não devem ser importados de novo.
@WebMvcTest(FordRetainController.class)
@Import({SecurityConfig.class, JwtService.class})
class FordRetainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private PredictionService predictionService;

    private String tokenGerente;
    private String tokenAnalista;
    private ClienteRequestDTO request;

    @BeforeEach
    void setUp() {
        tokenGerente = jwtService.generateToken("gerente@ford.com", "GERENTE");
        tokenAnalista = jwtService.generateToken("analista@ford.com", "ANALISTA");

        request = new ClienteRequestDTO();
        request.setNome("Joao da Silva");
        request.setEmail("joao@email.com");
        request.setTelefone("11999990000");
        request.setRegiao("SP");
        request.setIdade(30);
        request.setCanalCompra("ONLINE");
        request.setFormaPagamento("FINANCIAMENTO");
        request.setModeloVeiculo("RANGER");
        request.setDataCompra(LocalDate.now());
        request.setHistoricoMarca("PRIMEIRA_COMPRA");
    }

    // ---------- Acesso não autorizado ----------

    @Test
    @DisplayName("POST /predict sem token deve retornar 401")
    void predictSemTokenDeveRetornar401() throws Exception {
        mockMvc.perform(post("/api/v1/predict")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /dashboard sem token deve retornar 401")
    void dashboardSemTokenDeveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /dashboard com role ANALISTA (sem permissão) deve retornar 403")
    void dashboardComRoleSemPermissaoDeveRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer " + tokenAnalista))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /predict com role ANALISTA (sem permissão) deve retornar 403")
    void predictComRoleSemPermissaoDeveRetornar403() throws Exception {
        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenAnalista)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Requisição com token inválido/adulterado deve retornar 401")
    void tokenInvalidoDeveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer token.invalido.aqui"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- Sucesso ----------

    @Test
    @DisplayName("POST /predict com role GERENTE e payload válido deve retornar 201")
    void predictComSucessoDeveRetornar201() throws Exception {
        PredicaoResponseDTO response = PredicaoResponseDTO.builder()
                .predicaoId(1L)
                .clienteId(1L)
                .nomeCliente(request.getNome())
                .perfilPrevisto("ABANDONO")
                .probabilidades(Map.of("ABANDONO", new java.math.BigDecimal("0.68")))
                .scoreRisco(68)
                .acaoSugerida("Contato imediato")
                .dataPredicao(LocalDateTime.now())
                .build();

        when(predictionService.predict(any(ClienteRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfilPrevisto").value("ABANDONO"));
    }

    @Test
    @DisplayName("GET /dashboard com role GERENTE deve retornar 200")
    void dashboardComRoleCorretaDeveRetornar200() throws Exception {
        DashboardDTO dashboard = DashboardDTO.builder()
                .totalClientes(100L)
                .vinShareGeral(0.5)
                .clientesRiscoAlto(20L)
                .distribuicaoPerfis(Map.of("FIEL", 25L))
                .geradoEm(LocalDateTime.now())
                .build();

        when(predictionService.getDashboard()).thenReturn(dashboard);

        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer " + tokenGerente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClientes").value(100));
    }

    // ---------- Erro (validação) ----------

    @Test
    @DisplayName("POST /predict com payload inválido (email malformado) deve retornar 400")
    void predictComPayloadInvalidoDeveRetornar400() throws Exception {
        request.setEmail("email-invalido");

        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /predict com idade abaixo do mínimo deve retornar 400")
    void predictComIdadeInvalidaDeveRetornar400() throws Exception {
        request.setIdade(15);

        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}