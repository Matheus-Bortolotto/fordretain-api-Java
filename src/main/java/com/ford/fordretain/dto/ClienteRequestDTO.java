package com.ford.fordretain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

// DTO de entrada para criação de cliente
@Data
@Schema(description = "Dados do cliente no momento da compra")
public class ClienteRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100)
    @Schema(description = "Nome completo do cliente", example = "João da Silva")
    private String nome;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    @Schema(description = "Email do cliente", example = "joao.silva@email.com")
    private String email;

    @Schema(description = "Telefone do cliente", example = "11999990001")
    private String telefone;

    @NotBlank(message = "Região é obrigatória")
    @Schema(description = "Estado (UF) do cliente", example = "SP")
    private String regiao;

    @NotNull(message = "Idade é obrigatória")
    @Min(value = 18, message = "Idade mínima é 18")
    @Max(value = 100, message = "Idade máxima é 100")
    @Schema(description = "Idade do cliente", example = "34")
    private Integer idade;

    @NotBlank(message = "Canal de compra é obrigatório")
    @Schema(description = "Canal pelo qual o cliente comprou", example = "CONCESSIONARIA",
            allowableValues = {"CONCESSIONARIA", "ONLINE", "REVENDEDOR"})
    private String canalCompra;

    @NotBlank(message = "Forma de pagamento é obrigatória")
    @Schema(description = "Forma de pagamento utilizada", example = "FINANCIAMENTO",
            allowableValues = {"FINANCIAMENTO", "VISTA", "CONSORCIO"})
    private String formaPagamento;

    @NotBlank(message = "Modelo do veículo é obrigatório")
    @Schema(description = "Modelo do veículo comprado", example = "RANGER")
    private String modeloVeiculo;

    @NotNull(message = "Data de compra é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Data da compra", example = "2024-03-15")
    private LocalDate dataCompra;

    @NotBlank(message = "Histórico com a marca é obrigatório")
    @Schema(description = "Histórico do cliente com a Ford", example = "PRIMEIRA_COMPRA",
            allowableValues = {"PRIMEIRA_COMPRA", "RECOMPRA"})
    private String historicoMarca;
}
