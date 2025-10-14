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

import br.com.valedasartes.domain.artista.dto.ArtistaRequestDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaResponseDTO;
import br.com.valedasartes.domain.artista.service.ArtistaService;
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
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Artista criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (ex: CPF inválido)")
    })
    @PostMapping
    public ResponseEntity<ArtistaResponseDTO> criarArtista(@Valid @RequestBody ArtistaRequestDTO dto) {
        ArtistaResponseDTO novoArtista = artistaService.criarArtista(dto);
        return new ResponseEntity<>(novoArtista, HttpStatus.CREATED);
    }

    @Operation(summary = "Lista todos os artistas", description = "Retorna uma lista com todos os artistas cadastrados.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de artistas retornada com sucesso")
    })
    @GetMapping
    public ResponseEntity<List<ArtistaResponseDTO>> listarArtistas() {
        List<ArtistaResponseDTO> artistas = artistaService.listarTodosOsArtistas();
        return ResponseEntity.ok(artistas);
    }

    @Operation(summary = "Busca um artista por ID", description = "Retorna os detalhes de um artista específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Artista encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Artista não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ArtistaResponseDTO> buscarArtistaPorId(@PathVariable Long id) {
        return artistaService.buscarArtistaPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Atualiza um artista existente", description = "Atualiza os dados cadastrais de um artista.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Artista atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
        @ApiResponse(responseCode = "404", description = "Artista não encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ArtistaResponseDTO> atualizarArtista(@PathVariable Long id, @Valid @RequestBody ArtistaRequestDTO dto) {
        ArtistaResponseDTO artistaAtualizado = artistaService.atualizarArtista(id, dto);
        if (artistaAtualizado != null) {
            return ResponseEntity.ok(artistaAtualizado);
        }
        return ResponseEntity.notFound().build();
    }

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