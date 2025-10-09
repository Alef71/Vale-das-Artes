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

import br.com.valedasartes.domain.artista.dto.ArtistaRequestDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaResponseDTO;
import br.com.valedasartes.domain.artista.service.ArtistaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/artistas")
public class ArtistaController {

    private final ArtistaService artistaService;

    @Autowired
    public ArtistaController(ArtistaService artistaService) {
        this.artistaService = artistaService;
    }

    @PostMapping
    public ResponseEntity<ArtistaResponseDTO> criarArtista(@Valid @RequestBody ArtistaRequestDTO dto) { // Adicionado @Valid
        ArtistaResponseDTO novoArtista = artistaService.criarArtista(dto);
        return new ResponseEntity<>(novoArtista, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ArtistaResponseDTO>> listarArtistas() {
        List<ArtistaResponseDTO> artistas = artistaService.listarTodosOsArtistas();
        return ResponseEntity.ok(artistas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistaResponseDTO> buscarArtistaPorId(@PathVariable Long id) {
        return artistaService.buscarArtistaPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArtistaResponseDTO> atualizarArtista(@PathVariable Long id, @Valid @RequestBody ArtistaRequestDTO dto) { // Adicionado @Valid
        ArtistaResponseDTO artistaAtualizado = artistaService.atualizarArtista(id, dto);
        if (artistaAtualizado != null) {
            return ResponseEntity.ok(artistaAtualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarArtista(@PathVariable Long id) {
        artistaService.deletarArtista(id);
        return ResponseEntity.noContent().build();
    }
}