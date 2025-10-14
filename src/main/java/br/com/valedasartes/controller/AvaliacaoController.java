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

import br.com.valedasartes.domain.avaliacao.dto.AvaliacaoRequestDTO;
import br.com.valedasartes.domain.avaliacao.dto.AvaliacaoResponseDTO;
import br.com.valedasartes.domain.avaliacao.service.AvaliacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/avaliacoes")
@Tag(name = "Avaliações", description = "Endpoints para gerenciamento de avaliações de produtos")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @Autowired
    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @Operation(summary = "Cria uma nova avaliação", description = "Permite que um cliente crie uma nova avaliação para um produto específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Avaliação criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos (ex: nota fora do intervalo 1-5)"),
        @ApiResponse(responseCode = "404", description = "Produto ou cliente não encontrado")
    })
    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO> criarAvaliacao(@Valid @RequestBody AvaliacaoRequestDTO dto) {
        AvaliacaoResponseDTO novaAvaliacao = avaliacaoService.criarAvaliacao(dto);
        return new ResponseEntity<>(novaAvaliacao, HttpStatus.CREATED);
    }

    @Operation(summary = "Lista todas as avaliações", description = "Retorna uma lista com todas as avaliações registradas no sistema.")
    @ApiResponse(responseCode = "200", description = "Lista de avaliações retornada com sucesso")
    @GetMapping
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoes() {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarTodasAsAvaliacoes();
        return ResponseEntity.ok(avaliacoes);
    }

    @Operation(summary = "Busca uma avaliação por ID", description = "Retorna os detalhes de uma avaliação específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Avaliação encontrada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Avaliação não encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> buscarAvaliacaoPorId(@PathVariable Long id) {
        return avaliacaoService.buscarAvaliacaoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Atualiza uma avaliação", description = "Atualiza a nota e/ou o comentário de uma avaliação existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Avaliação atualizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
        @ApiResponse(responseCode = "404", description = "Avaliação não encontrada")
    })
    @PutMapping("/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> atualizarAvaliacao(@PathVariable Long id, @Valid @RequestBody AvaliacaoRequestDTO dto) {
        AvaliacaoResponseDTO avaliacaoAtualizada = avaliacaoService.atualizarAvaliacao(id, dto);
        if (avaliacaoAtualizada != null) {
            return ResponseEntity.ok(avaliacaoAtualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Deleta uma avaliação", description = "Remove permanentemente uma avaliação do sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Avaliação deletada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Avaliação não encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAvaliacao(@PathVariable Long id) {
        avaliacaoService.deletarAvaliacao(id);
        return ResponseEntity.noContent().build();
    }
}