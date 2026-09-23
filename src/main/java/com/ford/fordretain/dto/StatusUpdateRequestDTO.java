package com.ford.fordretain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequestDTO {
    @NotNull(message = "O status ativo é obrigatório")
    private Boolean ativo;
}
