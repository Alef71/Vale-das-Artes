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

import br.com.valedasartes.domain.produto.dto.ProdutoRequestDTO;
import br.com.valedasartes.domain.produto.dto.ProdutoResponseDTO;
import br.com.valedasartes.domain.produto.service.ProdutoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Autowired
    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> criarProduto(@Valid @RequestBody ProdutoRequestDTO dto) { // Adicionado @Valid
        ProdutoResponseDTO novoProduto = produtoService.criarProduto(dto);
        return new ResponseEntity<>(novoProduto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutos() {
        List<ProdutoResponseDTO> produtos = produtoService.listarTodosOsProdutos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarProdutoPorId(@PathVariable Long id) {
        return produtoService.buscarProdutoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(@PathVariable Long id, @Valid @RequestBody ProdutoRequestDTO dto) { // Adicionado @Valid
        ProdutoResponseDTO produtoAtualizado = produtoService.atualizarProduto(id, dto);
        if (produtoAtualizado != null) {
            return ResponseEntity.ok(produtoAtualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        // A lógica de exclusão foi movida para o service, o try-catch aqui não é mais ideal.
        // Vamos simplificar para que o GlobalExceptionHandler cuide dos erros.
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}