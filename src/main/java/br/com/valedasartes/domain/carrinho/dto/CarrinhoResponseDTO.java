package br.com.valedasartes.domain.carrinho.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import br.com.valedasartes.domain.carrinho.Carrinho;

public class CarrinhoResponseDTO {

    private final Long id;
    private final Long clienteId;
    private final LocalDateTime dataCriacao;
    private final String status;
    private final List<CarrinhoItemResponseDTO> itens;
    private final BigDecimal valorTotal;

    public CarrinhoResponseDTO(Carrinho carrinho) {
        this.id = carrinho.getId();
        this.clienteId = carrinho.getCliente().getId();
        this.dataCriacao = carrinho.getDataCriacao();
        this.status = carrinho.getStatus().name();
        this.itens = carrinho.getItens().stream()
                .map(CarrinhoItemResponseDTO::new)
                .collect(Collectors.toList());
        
        this.valorTotal = this.itens.stream()
                .map(item -> item.getPrecoUnitario().multiply(new BigDecimal(item.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters
    public Long getId() { return id; }
    public Long getClienteId() { return clienteId; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public String getStatus() { return status; }
    public List<CarrinhoItemResponseDTO> getItens() { return itens; }
    public BigDecimal getValorTotal() { return valorTotal; }
}