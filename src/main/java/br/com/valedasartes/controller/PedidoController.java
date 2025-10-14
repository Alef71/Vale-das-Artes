package br.com.valedasartes.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.valedasartes.domain.pedido.Pedido.PedidoStatus;
import br.com.valedasartes.domain.pedido.dto.PedidoResponseDTO;
import br.com.valedasartes.domain.pedido.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/pedidos")
@Tag(name = "Pedidos", description = "Endpoints para gerenciamento de pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    @Autowired
    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @Operation(summary = "Cria um novo pedido a partir de um carrinho", description = "Converte um carrinho de compras existente em um novo pedido, calculando os valores financeiros e limpando o carrinho.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Pedido criado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Carrinho não encontrado")
    })
    @PostMapping("/carrinho/{carrinhoId}")
    public ResponseEntity<PedidoResponseDTO> criarPedido(@Parameter(description = "ID do carrinho a ser finalizado") @PathVariable Long carrinhoId) {
        PedidoResponseDTO pedidoDTO = new PedidoResponseDTO(pedidoService.criarPedidoDoCarrinho(carrinhoId));
        return new ResponseEntity<>(pedidoDTO, HttpStatus.CREATED);
    }

    @Operation(summary = "Lista todos os pedidos", description = "Retorna uma lista de todos os pedidos realizados no sistema.")
    @ApiResponse(responseCode = "200", description = "Lista de pedidos retornada com sucesso")
    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos() {
        List<PedidoResponseDTO> pedidos = pedidoService.listarTodosOsPedidos().stream()
                .map(PedidoResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pedidos);
    }

    @Operation(summary = "Busca um pedido por ID", description = "Retorna os detalhes de um pedido específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pedido encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoPorId(@PathVariable Long id) {
        return pedidoService.buscarPedidoPorId(id)
                .map(pedido -> ResponseEntity.ok(new PedidoResponseDTO(pedido)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Atualiza o status de um pedido", description = "Altera o status de um pedido. Ex: de 'PENDENTE' para 'PAGO'. O corpo da requisição deve ser uma string simples com o novo status (ex: \"PAGO\").")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status do pedido atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Status enviado é inválido (não corresponde aos valores do Enum)"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(@PathVariable Long id, @RequestBody String novoStatus) {
        try {
            PedidoStatus status = PedidoStatus.valueOf(novoStatus.toUpperCase());
            PedidoResponseDTO pedidoDTO = new PedidoResponseDTO(pedidoService.atualizarStatusDoPedido(id, status));
            return ResponseEntity.ok(pedidoDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deleta um pedido", description = "Remove permanentemente um pedido do sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pedido deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPedido(@PathVariable Long id) {
        pedidoService.deletarPedido(id);
        return ResponseEntity.noContent().build();
    }
}