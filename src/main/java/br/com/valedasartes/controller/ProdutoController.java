package br.com.valedasartes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.domain.produto.dto.ProdutoRequestDTO;
import br.com.valedasartes.domain.produto.dto.ProdutoResponseDTO;
import br.com.valedasartes.domain.produto.service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Autowired
    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @Operation(summary = "Lista produtos para a vitrine (Recentes, max 20, filtro opcional)")
    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPublico(
            @RequestParam(required = false) String categoria
    ) {
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutosVitrine(categoria);
        return ResponseEntity.ok(produtos);
    }

    @Operation(summary = "Lista produtos do artista logado (Rota específica 'meus-produtos')")
    @GetMapping("/meus-produtos")
    // ALTERADO: De Long para String (ArtistId é UUID)
    public ResponseEntity<List<ProdutoResponseDTO>> listarMeusProdutos(@RequestParam String artistaId) {
        return ResponseEntity.ok(produtoService.listarProdutosPorArtistaId(artistaId));
    }

    @Operation(summary = "Busca produto por ID (ID do Produto continua Long)")
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
        return produtoService.buscarProdutoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Lista produtos de um artista específico (Via URL)")
    @GetMapping("/artista/{artistaId}")
    // ALTERADO: De Long para String
    public ResponseEntity<List<ProdutoResponseDTO>> listarPorArtista(@PathVariable String artistaId) {
        return ResponseEntity.ok(produtoService.listarProdutosPorArtistaId(artistaId));
    }

    @Operation(summary = "Cria um novo produto com foto")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ProdutoResponseDTO> criarProduto(
            @RequestPart("dados") ProdutoRequestDTO dto,
            @RequestPart("foto") MultipartFile foto,
            // ALTERADO: De Long para String
            @RequestParam String artistaId) {
        
        ProdutoResponseDTO novoProduto = produtoService.criarProduto(dto, foto, artistaId);
        return ResponseEntity.ok(novoProduto);
    }

    @Operation(summary = "Atualiza dados do produto")
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(
            @PathVariable Long id,
            @RequestBody ProdutoRequestDTO dto,
            // ALTERADO: De Long para String
            @RequestParam String artistaId) {
        
        ProdutoResponseDTO atualizado = produtoService.atualizarProduto(id, dto, artistaId);
        if (atualizado == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(atualizado);
    }

    @Operation(summary = "Ativa/Desativa um produto")
    @PutMapping("/{id}/toggle-ativo")
    public ResponseEntity<ProdutoResponseDTO> toggleAtivo(
            @PathVariable Long id, 
            // ALTERADO: De Long para String
            @RequestParam String artistaId) {
        return ResponseEntity.ok(produtoService.toggleProdutoAtivo(id, artistaId));
    }

    @Operation(summary = "Deleta produto")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}