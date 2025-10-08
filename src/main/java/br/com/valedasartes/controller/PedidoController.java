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

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    @Autowired
    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/carrinho/{carrinhoId}")
    public ResponseEntity<PedidoResponseDTO> criarPedido(@PathVariable Long carrinhoId) {
        PedidoResponseDTO pedidoDTO = new PedidoResponseDTO(pedidoService.criarPedidoDoCarrinho(carrinhoId));
        return new ResponseEntity<>(pedidoDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos() {
        List<PedidoResponseDTO> pedidos = pedidoService.listarTodosOsPedidos().stream()
                .map(PedidoResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoPorId(@PathVariable Long id) {
        return pedidoService.buscarPedidoPorId(id)
                .map(pedido -> ResponseEntity.ok(new PedidoResponseDTO(pedido)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(@PathVariable Long id, @RequestBody String novoStatus) {
        try {
            PedidoStatus status = PedidoStatus.valueOf(novoStatus.toUpperCase());
            PedidoResponseDTO pedidoDTO = new PedidoResponseDTO(pedidoService.atualizarStatusDoPedido(id, status));
            return ResponseEntity.ok(pedidoDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // Retorna 400 se o status for inválido
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPedido(@PathVariable Long id) {
        pedidoService.deletarPedido(id);
        return ResponseEntity.noContent().build();
    }
}