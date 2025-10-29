package br.com.valedasartes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // IMPORTAR
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // IMPORTAR
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute; // IMPORTAR
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // IMPORTAR
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile; // IMPORTAR

import br.com.valedasartes.domain.produto.dto.ProdutoRequestDTO;
import br.com.valedasartes.domain.produto.dto.ProdutoResponseDTO;
import br.com.valedasartes.domain.produto.service.ProdutoService;
import br.com.valedasartes.domain.security.Credencial; // IMPORTAR
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    // --- ATUALIZADO PARA UPLOAD DE FOTO ---
    @Operation(summary = "Cria um novo produto", description = "Registra um novo produto com foto.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Produto criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // Aceita 'FormData'
    public ResponseEntity<ProdutoResponseDTO> criarProduto(
            @Valid @ModelAttribute ProdutoRequestDTO dto, // Usa @ModelAttribute para os campos de texto
            @RequestParam("foto") MultipartFile foto,    // Usa @RequestParam para o arquivo
            Authentication authentication                 // Pega o usuário logado
    ) {
        // Pega o ID do Artista logado (MUITO MAIS SEGURO)
        Credencial credencial = (Credencial) authentication.getPrincipal();
        // (Assume que o usuário logado é um Artista)
        Long artistaId = credencial.getArtista().getId(); 

        ProdutoResponseDTO novoProduto = produtoService.criarProduto(dto, foto, artistaId);
        return new ResponseEntity<>(novoProduto, HttpStatus.CREATED);
    }

    @Operation(summary = "Lista todos os produtos")
    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutos() {
        List<ProdutoResponseDTO> produtos = produtoService.listarTodosOsProdutos();
        return ResponseEntity.ok(produtos);
    }

    @Operation(summary = "Busca um produto por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarProdutoPorId(@PathVariable Long id) {
        return produtoService.buscarProdutoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- ATUALIZADO PARA USAR O ID DO ARTISTA LOGADO ---
    @Operation(summary = "Atualiza um produto (sem foto)", description = "Atualiza os dados de texto de um produto.")
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(
            @PathVariable Long id, 
            @Valid @RequestBody ProdutoRequestDTO dto, // Continua JSON
            Authentication authentication
    ) {
        // Pega o ID do Artista logado
        Credencial credencial = (Credencial) authentication.getPrincipal();
        Long artistaId = credencial.getArtista().getId();

        ProdutoResponseDTO produtoAtualizado = produtoService.atualizarProduto(id, dto, artistaId);
        if (produtoAtualizado != null) {
            return ResponseEntity.ok(produtoAtualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Deleta um produto (exclusão lógica)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        // (Idealmente, deveríamos verificar se o artista logado é o dono do produto aqui)
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}