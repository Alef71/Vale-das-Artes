package br.com.valedasartes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/administradores")
@Tag(name = "Administradores", description = "Endpoints para gerenciamento de administradores do sistema")
public class AdministradorController {

    private final AdministradorService administradorService;

    @Autowired
    public AdministradorController(AdministradorService administradorService) {
        this.administradorService = administradorService;
    }

    @Operation(summary = "Cria um novo administrador", description = "Registra um novo administrador no sistema, incluindo dados pessoais, endereço e credenciais.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Administrador criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (ex: CPF inválido, e-mail já em uso)")
    })
    @PostMapping
    public ResponseEntity<AdministradorResponseDTO> criarAdministrador(@Valid @RequestBody AdministradorRequestDTO dto) {
        AdministradorResponseDTO novoAdmin = administradorService.criarAdministrador(dto);
        return new ResponseEntity<>(novoAdmin, HttpStatus.CREATED);
    }

    @Operation(summary = "Lista todos os administradores", description = "Retorna uma lista com todos os administradores cadastrados.")
    @ApiResponse(responseCode = "200", description = "Lista de administradores retornada com sucesso")
    @GetMapping
    public ResponseEntity<List<AdministradorResponseDTO>> listarAdministradores() {
        List<AdministradorResponseDTO> administradores = administradorService.listarTodosOsAdministradores();
        return ResponseEntity.ok(administradores);
    }

    @Operation(summary = "Busca um administrador por ID", description = "Retorna os detalhes de um administrador específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrador encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Administrador não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AdministradorResponseDTO> buscarAdministradorPorId(@PathVariable Long id) {
        return administradorService.buscarAdministradorPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Atualiza um administrador existente", description = "Atualiza os dados cadastrais de um administrador.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrador atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
        @ApiResponse(responseCode = "404", description = "Administrador não encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<AdministradorResponseDTO> atualizarAdministrador(@PathVariable Long id, @Valid @RequestBody AdministradorRequestDTO dto) {
        AdministradorResponseDTO adminAtualizado = administradorService.atualizarAdministrador(id, dto);
        if (adminAtualizado != null) {
            return ResponseEntity.ok(adminAtualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Deleta um administrador", description = "Remove permanentemente um administrador do sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Administrador deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Administrador não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAdministrador(@PathVariable Long id) {
        administradorService.deletarAdministrador(id);
        return ResponseEntity.noContent().build();
    }
}