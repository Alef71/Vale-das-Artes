package br.com.valedasartes.domain.carrinho.dto;

import java.math.BigDecimal;

import br.com.valedasartes.domain.carrinho.CarrinhoProduto;

public class CarrinhoItemResponseDTO {

    private final Long produtoId;
    private final String nomeProduto;
    private final int quantidade;
    private final BigDecimal precoUnitario;

    public CarrinhoItemResponseDTO(CarrinhoProduto item) {
        this.produtoId = item.getProduto().getId();
        this.nomeProduto = item.getProduto().getNome();
        this.quantidade = item.getQuantidade();
        this.precoUnitario = item.getProduto().getPreco();
    }

    // Getters
    public Long getProdutoId() { return produtoId; }
    public String getNomeProduto() { return nomeProduto; }
    public int getQuantidade() { return quantidade; }
    public BigDecimal getPrecoUnitario() { return precoUnitario; }
}
