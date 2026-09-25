package com.ford.fordretain.dto;

import com.ford.fordretain.model.Usuario;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioResponseDTO {
    private Long id;
    private String nome;
    private String email;
    private String role;
    private boolean ativo;

    public static UsuarioResponseDTO from(Usuario usuario) {
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .ativo(usuario.isAtivo())
                .build();
    }
}
