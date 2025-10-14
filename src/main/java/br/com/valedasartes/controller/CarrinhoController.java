package br.com.valedasartes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.valedasartes.domain.carrinho.dto.CarrinhoResponseDTO;
import br.com.valedasartes.domain.carrinho.dto.ItemCarrinhoDTO;
import br.com.valedasartes.domain.carrinho.service.CarrinhoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/carrinhos")
@Tag(name = "Carrinhos", description = "Endpoints para gerenciamento de carrinhos de compra")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    @Autowired
    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    @Operation(summary = "Cria um novo carrinho para um cliente", description = "Cria e associa um novo carrinho de compras a um cliente existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Carrinho criado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente com o ID informado não foi encontrado")
    })
    @PostMapping("/cliente/{clienteId}")
    public ResponseEntity<CarrinhoResponseDTO> criarCarrinho(@Parameter(description = "ID do cliente para o qual o carrinho será criado") @PathVariable Long clienteId) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.criarCarrinhoParaCliente(clienteId));
        return new ResponseEntity<>(carrinhoDTO, HttpStatus.CREATED);
    }

    @Operation(summary = "Busca um carrinho por ID", description = "Retorna os detalhes de um carrinho de compras, incluindo seus itens e valor total.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carrinho encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Carrinho não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CarrinhoResponseDTO> buscarCarrinhoPorId(@PathVariable Long id) {
        return carrinhoService.buscarCarrinhoPorId(id)
                .map(carrinho -> ResponseEntity.ok(new CarrinhoResponseDTO(carrinho)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Adiciona um item ao carrinho", description = "Adiciona um produto a um carrinho existente. Se o produto já estiver no carrinho, a quantidade é incrementada.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item adicionado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Carrinho ou produto não encontrado")
    })
    @PostMapping("/{id}/itens")
    public ResponseEntity<CarrinhoResponseDTO> adicionarItem(@PathVariable Long id, @RequestBody ItemCarrinhoDTO itemDTO) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.adicionarItem(id, itemDTO));
        return ResponseEntity.ok(carrinhoDTO);
    }

    @Operation(summary = "Remove um item do carrinho", description = "Remove uma certa quantidade de um produto do carrinho. Se a quantidade a ser removida for maior ou igual à existente, o item é removido completamente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item removido com sucesso"),
        @ApiResponse(responseCode = "404", description = "Carrinho ou item não encontrado")
    })
    @DeleteMapping("/{id}/itens")
    public ResponseEntity<CarrinhoResponseDTO> removerItem(@PathVariable Long id, @RequestBody ItemCarrinhoDTO itemDTO) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.removerItem(id, itemDTO));
        return ResponseEntity.ok(carrinhoDTO);
    }
    
    @Operation(summary = "Limpa o carrinho", description = "Remove todos os itens de um carrinho de compras.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carrinho limpo com sucesso"),
        @ApiResponse(responseCode = "404", description = "Carrinho não encontrado")
    })
    @DeleteMapping("/{id}/limpar")
    public ResponseEntity<CarrinhoResponseDTO> limparCarrinho(@PathVariable Long id) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.limparCarrinho(id));
        return ResponseEntity.ok(carrinhoDTO);
    }
}