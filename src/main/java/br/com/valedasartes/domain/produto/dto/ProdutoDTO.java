package br.com.valedasartes.domain.produto.dto;

import java.math.BigDecimal;

import br.com.valedasartes.domain.produto.Produto;

public record ProdutoDTO(
    Long id,
    String nome,
    String descricao,
    BigDecimal preco,
    String categoria
) {
    public ProdutoDTO(Produto produto) {
        this(
            produto.getId(),
            produto.getNome(),
            produto.getDescricao(),
            produto.getPreco(),
            produto.getCategoria()
        );
    }
}
