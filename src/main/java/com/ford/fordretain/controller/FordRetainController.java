package com.ford.fordretain.controller;

import com.ford.fordretain.dto.ClienteRequestDTO;
import com.ford.fordretain.dto.DashboardDTO;
import com.ford.fordretain.dto.LeadDTO;
import com.ford.fordretain.dto.PredicaoResponseDTO;
import com.ford.fordretain.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "FordRetain API", description = "Endpoints de retenção preditiva de clientes Ford")
public class FordRetainController {

    private final PredictionService predictionService;

    // ============================================================
    // POST /predict
    // Recebe dados de um novo cliente e retorna o perfil + ação
    // ============================================================
    @PostMapping("/predict")
    @Operation(
        summary = "Prever perfil de um novo cliente",
        description = """
            Recebe os dados do cliente disponíveis no momento da compra e retorna:
            - O perfil comportamental previsto (FIEL, ABANDONO, ESQUECIDO, ECONOMICO)
            - As probabilidades de cada perfil
            - O score de risco de evasão (0-100)
            - A ação de retenção sugerida para a concessionária
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Predição realizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
        @ApiResponse(responseCode = "409", description = "Cliente já cadastrado com este e-mail")
    })
    public ResponseEntity<PredicaoResponseDTO> predict(
            @Valid @RequestBody ClienteRequestDTO request) {

        log.info("POST /predict — cliente: {}", request.getEmail());
        PredicaoResponseDTO response = predictionService.predict(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ============================================================
    // GET /dashboard
    // Retorna métricas agregadas de VIN Share
    // ============================================================
    @GetMapping("/dashboard")
    @Operation(
        summary = "Métricas de VIN Share",
        description = """
            Retorna um resumo executivo com:
            - VIN Share geral e por região/modelo
            - Distribuição de perfis de clientes
            - Número de clientes em risco alto de evasão
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dashboard gerado com sucesso")
    })
    public ResponseEntity<DashboardDTO> getDashboard() {
        log.info("GET /dashboard");
        return ResponseEntity.ok(predictionService.getDashboard());
    }

    // ============================================================
    // GET /leads
    // Lista clientes em risco, ordenados por prioridade
    // ============================================================
    @GetMapping("/leads")
    @Operation(
        summary = "Listar clientes em risco de evasão",
        description = """
            Retorna a lista de clientes com score de risco acima do mínimo informado,
            ordenados por prioridade (maior risco primeiro).
            Use esta lista para direcionar ações proativas da concessionária.
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista gerada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Parâmetro scoreMinimo inválido")
    })
    public ResponseEntity<List<LeadDTO>> getLeads(
            @Parameter(description = "Score mínimo de risco para incluir na lista (0-100)", example = "50")
            @RequestParam(defaultValue = "50") int scoreMinimo) {

        log.info("GET /leads — scoreMinimo: {}", scoreMinimo);
        return ResponseEntity.ok(predictionService.getLeads(scoreMinimo));
    }
}
