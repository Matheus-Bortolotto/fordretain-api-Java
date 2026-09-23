package com.ford.fordretain.controller;

import com.ford.fordretain.dto.RoleUpdateRequestDTO;
import com.ford.fordretain.dto.StatusUpdateRequestDTO;
import com.ford.fordretain.dto.UsuarioResponseDTO;
import com.ford.fordretain.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
@RequiredArgsConstructor
public class AdminUsuarioController {
    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listar().stream().map(UsuarioResponseDTO::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(UsuarioResponseDTO.from(usuarioService.buscar(id)));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UsuarioResponseDTO> alterarRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequestDTO request) {
        return ResponseEntity.ok(UsuarioResponseDTO.from(usuarioService.alterarRole(id, request.getRole())));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UsuarioResponseDTO> alterarStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequestDTO request) {
        return ResponseEntity.ok(UsuarioResponseDTO.from(usuarioService.alterarStatus(id, request.getAtivo())));
    }
}
