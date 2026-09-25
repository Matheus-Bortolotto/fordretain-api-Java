package com.ford.fordretain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    private Long id;
    private String nome;
    private String email;
    private String senhaHash;
    private String role;
    private boolean ativo;
    private LocalDateTime dataCriacao;
}
