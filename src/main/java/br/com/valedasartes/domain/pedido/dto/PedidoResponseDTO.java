package br.com.valedasartes.domain.pedido.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import br.com.valedasartes.domain.pedido.Pedido;

public class PedidoResponseDTO {

    private final Long id;
    private final Long clienteId;
    private final LocalDateTime dataCriacao;
    private final String status;
    private final List<PedidoItemResponseDTO> itens;
    private final BigDecimal valorTotal;

    public PedidoResponseDTO(Pedido pedido) {
        this.id = pedido.getId();
        this.clienteId = pedido.getCliente().getId();
        this.dataCriacao = pedido.getDataCriacao();
        this.status = pedido.getStatus().name();
        this.valorTotal = pedido.getValorTotal();
        this.itens = pedido.getItens().stream()
                .map(PedidoItemResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Getters
    public Long getId() { return id; }
    public Long getClienteId() { return clienteId; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public String getStatus() { return status; }
    public List<PedidoItemResponseDTO> getItens() { return itens; }
    public BigDecimal getValorTotal() { return valorTotal; }
}