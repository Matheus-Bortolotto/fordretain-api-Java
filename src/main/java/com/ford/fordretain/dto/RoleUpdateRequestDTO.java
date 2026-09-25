package com.ford.fordretain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoleUpdateRequestDTO {
    @NotBlank(message = "Role é obrigatória")
    private String role;
}
