package br.com.valedasartes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.domain.produto.dto.ProdutoRequestDTO;
import br.com.valedasartes.domain.produto.dto.ProdutoResponseDTO;
import br.com.valedasartes.domain.produto.service.ProdutoService;
import br.com.valedasartes.domain.security.Credencial;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/produtos")
@Tag(name = "Produtos", description = "Endpoints para gerenciamento de produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Autowired
    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @Operation(summary = "Cria um novo produto (privado, Artista)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProdutoResponseDTO> criarProduto(
            @Valid @ModelAttribute ProdutoRequestDTO dto,
            @RequestParam("foto") MultipartFile foto,
            Authentication authentication
    ) {
        Credencial credencial = (Credencial) authentication.getPrincipal();
        Long artistaId = credencial.getArtista().getId();
        ProdutoResponseDTO novoProduto = produtoService.criarProduto(dto, foto, artistaId);
        return new ResponseEntity<>(novoProduto, HttpStatus.CREATED);
    }
    
    // --- 1. ENDPOINT PÚBLICO ADICIONADO ---
    /**
     * Rota pública para listar todos os produtos ATIVOS.
     * (Usado pela index.html)
     */
    @Operation(summary = "Lista todos os produtos ativos (público)")
    @GetMapping // Mapeia para GET /api/produtos
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPublico() {
        // Chama o novo método no service
        List<ProdutoResponseDTO> produtos = produtoService.listarTodosOsProdutosAtivos();
        return ResponseEntity.ok(produtos);
    }

    /**
     * Rota PRIVADA do artesão para ver TODOS os seus produtos (ativos e inativos)
     * (Usado pelo dashboard-artesao.js)
     */
    @Operation(summary = "Lista os produtos do artista logado (privado)")
    @GetMapping("/meus-produtos")
    public ResponseEntity<List<ProdutoResponseDTO>> listarMeusProdutos(Authentication authentication) {
        Credencial credencial = (Credencial) authentication.getPrincipal(); 
        Long artistaId = credencial.getArtista().getId();
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutosPorArtistaId(artistaId);
        return ResponseEntity.ok(produtos);
    }


    @Operation(summary = "Busca um produto por ID (público)")
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarProdutoPorId(@PathVariable Long id) {
        return produtoService.buscarProdutoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Atualiza um produto (privado, Artista)")
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(
            @PathVariable Long id, 
            @Valid @RequestBody ProdutoRequestDTO dto,
            Authentication authentication
    ) {
        Credencial credencial = (Credencial) authentication.getPrincipal();
        Long artistaId = credencial.getArtista().getId();
        ProdutoResponseDTO produtoAtualizado = produtoService.atualizarProduto(id, dto, artistaId);
        if (produtoAtualizado != null) {
            return ResponseEntity.ok(produtoAtualizado);
        }
        return ResponseEntity.notFound().build();
    }
    
    @Operation(summary = "Ativa ou Inativa um produto (privado, Artista)")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ProdutoResponseDTO> toggleProdutoAtivo(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Credencial credencial = (Credencial) authentication.getPrincipal();
        Long artistaId = credencial.getArtista().getId();
        ProdutoResponseDTO produtoAtualizado = produtoService.toggleProdutoAtivo(id, artistaId);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @Operation(summary = "Deleta um produto (privado, Artista)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        // (Futuramente, adicionar verificação de segurança aqui também)
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}