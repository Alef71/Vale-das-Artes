package br.com.valedasartes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.domain.artista.dto.ArtistaRequestDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaResponseDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaStatusUpdateDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaUpdateDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaEnderecoUpdateDTO; // Importe o novo DTO
import br.com.valedasartes.domain.artista.service.ArtistaService;
import br.com.valedasartes.domain.security.Credencial;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/artistas")
@Tag(name = "Artistas", description = "Endpoints para gerenciamento de artistas")
public class ArtistaController {

    private final ArtistaService artistaService;

    @Autowired
    public ArtistaController(ArtistaService artistaService) {
        this.artistaService = artistaService;
    }

    @Operation(summary = "Cria um novo artista", description = "Registra um novo artista na plataforma.")
    @PostMapping
    public ResponseEntity<ArtistaResponseDTO> criarArtista(@Valid @RequestBody ArtistaRequestDTO dto) {
        ArtistaResponseDTO novoArtista = artistaService.criarArtista(dto);
        return new ResponseEntity<>(novoArtista, HttpStatus.CREATED);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista apenas artistas com status PENDENTE (Administrativo)")
    @GetMapping("/pendentes")
    public ResponseEntity<List<ArtistaResponseDTO>> listarArtistasPendentes() {
        List<ArtistaResponseDTO> artistas = artistaService.listarArtistasPendentes();
        return ResponseEntity.ok(artistas);
    }

    @Operation(summary = "Lista todos os artistas", description = "Retorna uma lista com todos os artistas cadastrados.")
    @GetMapping
    public ResponseEntity<List<ArtistaResponseDTO>> listarArtistas() {
        List<ArtistaResponseDTO> artistas = artistaService.listarTodosOsArtistas();
        return ResponseEntity.ok(artistas);
    }

    @Operation(summary = "Busca um artista por ID", description = "Retorna os detalhes de um único artista.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Artista encontrado"),
        @ApiResponse(responseCode = "404", description = "Artista não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ArtistaResponseDTO> buscarPorId(@PathVariable Long id) {
        ArtistaResponseDTO artista = artistaService.buscarPorId(id);
        return ResponseEntity.ok(artista);
    }
    

    @Operation(summary = "Atualiza um artista existente", description = "Atualiza os dados cadastrais básicos de um artista.")
    @PutMapping("/{id}")
    public ResponseEntity<ArtistaResponseDTO> atualizarArtista(@PathVariable Long id, @Valid @RequestBody ArtistaUpdateDTO dto) {
        ArtistaResponseDTO artistaAtualizado = artistaService.atualizarArtista(id, dto);
        if (artistaAtualizado != null) {
            return ResponseEntity.ok(artistaAtualizado);
        }
        return ResponseEntity.notFound().build();
    }
    
    // --- NOVO MÉTODO CORRIGIDO ---
    @Operation(summary = "Atualiza o endereço do artista")
    @PutMapping("/{id}/endereco")
    public ResponseEntity<ArtistaResponseDTO> atualizarEnderecoArtista(
            @PathVariable Long id, 
            @Valid @RequestBody ArtistaEnderecoUpdateDTO dto) {
        
        ArtistaResponseDTO artistaAtualizado = artistaService.atualizarEndereco(id, dto);
        return ResponseEntity.ok(artistaAtualizado);
    }
    // -----------------------------

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualiza o status de aprovação do artista (Administrativo)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status alterado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Artista não encontrado")
    })
    @PatchMapping("/{id}/status") 
    public ResponseEntity<ArtistaResponseDTO> alterarStatusAprovacao(
            @PathVariable Long id, 
            @Valid @RequestBody ArtistaStatusUpdateDTO dto) {
        
        ArtistaResponseDTO artistaAtualizado = artistaService.alterarStatusAprovacao(id, dto.getStatus());
        return ResponseEntity.ok(artistaAtualizado);
    }

    @Operation(summary = "Upload de foto de perfil do artista", description = "Faz upload de uma nova foto para o artista.")
    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArtistaResponseDTO> uploadFoto(
            @PathVariable Long id, 
            @RequestParam("foto") MultipartFile file,
            Authentication authentication) {
        
        Credencial credencial = (Credencial) authentication.getPrincipal();
        ArtistaResponseDTO artistaAtualizado = artistaService.uploadFoto(id, file, credencial);
        return ResponseEntity.ok(artistaAtualizado);
    }
    
    @Operation(summary = "Remove a foto de perfil do artista")
    @DeleteMapping(value = "/{id}/foto")
    public ResponseEntity<ArtistaResponseDTO> removerFoto(
            @PathVariable Long id,
            Authentication authentication) {
        
        Credencial credencial = (Credencial) authentication.getPrincipal();
        ArtistaResponseDTO artistaAtualizado = artistaService.removerFoto(id, credencial);
        return ResponseEntity.ok(artistaAtualizado);
    }

    @PreAuthorize("hasRole('ADMIN')") 
    @Operation(summary = "Deleta um artista", description = "Remove permanentemente um artista do sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Artista deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Artista não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarArtista(@PathVariable Long id) {
        artistaService.deletarArtista(id);
        return ResponseEntity.noContent().build();
    }
}