package br.com.valedasartes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired; // Import necessário
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.valedasartes.domain.administrador.dto.AdministradorRequestDTO;
import br.com.valedasartes.domain.administrador.dto.AdministradorResponseDTO;
import br.com.valedasartes.domain.administrador.service.AdministradorService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/administradores")
public class AdministradorController {

    private final AdministradorService administradorService;

    @Autowired
    public AdministradorController(AdministradorService administradorService) {
        this.administradorService = administradorService;
    }

    @PostMapping
    public ResponseEntity<AdministradorResponseDTO> criarAdministrador(@Valid @RequestBody AdministradorRequestDTO dto) { // Adicionado @Valid
        AdministradorResponseDTO novoAdmin = administradorService.criarAdministrador(dto);
        return new ResponseEntity<>(novoAdmin, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AdministradorResponseDTO>> listarAdministradores() {
        List<AdministradorResponseDTO> administradores = administradorService.listarTodosOsAdministradores();
        return ResponseEntity.ok(administradores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministradorResponseDTO> buscarAdministradorPorId(@PathVariable Long id) {
        return administradorService.buscarAdministradorPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdministradorResponseDTO> atualizarAdministrador(@PathVariable Long id, @Valid @RequestBody AdministradorRequestDTO dto) { // Adicionado @Valid
        AdministradorResponseDTO adminAtualizado = administradorService.atualizarAdministrador(id, dto);
        if (adminAtualizado != null) {
            return ResponseEntity.ok(adminAtualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAdministrador(@PathVariable Long id) {
        administradorService.deletarAdministrador(id);
        return ResponseEntity.noContent().build();
    }
}