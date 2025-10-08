package br.com.valedasartes.domain.produto.dto;

import java.math.BigDecimal;

import br.com.valedasartes.domain.produto.Produto;

public class ProdutoResponseDTO {

    private final Long id;
    private final String nome;
    private final String descricao;
    private final BigDecimal preco;
    private final String categoria;
    private final String nomeArtista;

    public ProdutoResponseDTO(Produto produto) {
        this.id = produto.getId();
        this.nome = produto.getNome();
        this.descricao = produto.getDescricao();
        this.preco = produto.getPreco();
        this.categoria = produto.getCategoria();
        
        String nomeArt = null;
        if (produto.getArtista() != null) {
            nomeArt = produto.getArtista().getNome();
        }
        this.nomeArtista = nomeArt;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public BigDecimal getPreco() { return preco; }
    public String getCategoria() { return categoria; }
    public String getNomeArtista() { return nomeArtista; }
}