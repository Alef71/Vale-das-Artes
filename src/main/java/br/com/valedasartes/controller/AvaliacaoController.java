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

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @Autowired
    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO> criarAvaliacao(@RequestBody AvaliacaoRequestDTO dto) {
        AvaliacaoResponseDTO novaAvaliacao = avaliacaoService.criarAvaliacao(dto);
        return new ResponseEntity<>(novaAvaliacao, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoes() {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarTodasAsAvaliacoes();
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> buscarAvaliacaoPorId(@PathVariable Long id) {
        return avaliacaoService.buscarAvaliacaoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> atualizarAvaliacao(@PathVariable Long id, @RequestBody AvaliacaoRequestDTO dto) {
        AvaliacaoResponseDTO avaliacaoAtualizada = avaliacaoService.atualizarAvaliacao(id, dto);
        if (avaliacaoAtualizada != null) {
            return ResponseEntity.ok(avaliacaoAtualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAvaliacao(@PathVariable Long id) {
        try {
            avaliacaoService.deletarAvaliacao(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}