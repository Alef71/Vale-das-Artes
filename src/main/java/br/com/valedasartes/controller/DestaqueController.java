package br.com.valedasartes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.domain.destaque.dto.DestaqueRequestDTO;
import br.com.valedasartes.domain.destaque.dto.DestaqueResponseDTO;
import br.com.valedasartes.domain.destaque.dto.DestaqueUpdateRequestDTO;
import br.com.valedasartes.domain.destaque.service.DestaqueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/destaques")
@Tag(name = "Destaques", description = "Endpoints para gerenciamento de banners e promoções")
public class DestaqueController {

    private final DestaqueService destaqueService;

    @Autowired
    public DestaqueController(DestaqueService destaqueService) {
        this.destaqueService = destaqueService;
    }

    // --- C R I A R (POST) - Apenas dados textuais ---
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cria um novo registro de destaque (sem a imagem inicial)")
    @PostMapping
    public ResponseEntity<DestaqueResponseDTO> criarDestaque(@Valid @RequestBody DestaqueRequestDTO dto) {
        DestaqueResponseDTO novoDestaque = destaqueService.criarDestaque(dto);
        return new ResponseEntity<>(novoDestaque, HttpStatus.CREATED);
    }

    // --- L I S T A R (GET) ---
    @Operation(summary = "Lista todos os destaques")
    @GetMapping
    public ResponseEntity<List<DestaqueResponseDTO>> listarDestaques() {
        List<DestaqueResponseDTO> destaques = destaqueService.listarTodos();
        return ResponseEntity.ok(destaques);
    }
    
    // --- U P L O A D F O T O (POST) - Replicando o ClienteController ---
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload da imagem do destaque")
    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DestaqueResponseDTO> uploadFoto(
            @PathVariable Long id, 
            @RequestParam("foto") MultipartFile file) {
        
        // Não precisamos checar a credencial logada, pois só o ADMIN tem acesso ao PreAuthorize
        DestaqueResponseDTO destaqueAtualizado = destaqueService.uploadFoto(id, file);
        return ResponseEntity.ok(destaqueAtualizado);
    }
    
    // --- R E M O V E R F O T O (DELETE) - Replicando o ClienteController ---
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove a imagem do destaque")
    @DeleteMapping(value = "/{id}/foto")
    public ResponseEntity<DestaqueResponseDTO> removerFoto(@PathVariable Long id) {
        DestaqueResponseDTO destaqueAtualizado = destaqueService.removerFoto(id);
        return ResponseEntity.ok(destaqueAtualizado);
    }

    // --- A T U A L I Z A R (PUT) ---
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualiza título, link e status do destaque")
    @PutMapping("/{id}")
    public ResponseEntity<DestaqueResponseDTO> atualizarDestaque(@PathVariable Long id, @Valid @RequestBody DestaqueUpdateRequestDTO dto) {
        DestaqueResponseDTO destaqueAtualizado = destaqueService.atualizarDestaque(id, dto);
        if (destaqueAtualizado != null) {
            return ResponseEntity.ok(destaqueAtualizado);
        }
        return ResponseEntity.notFound().build();
    }

    // --- D E L E T A R (DELETE) ---
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deleta o registro de destaque")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarDestaque(@PathVariable Long id) {
        destaqueService.deletarDestaque(id);
        return ResponseEntity.noContent().build();
    }
}