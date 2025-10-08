package br.com.valedasartes.domain.produto.dto;

import java.math.BigDecimal;

public class ProdutoRequestDTO {

    private String nome;
    private String descricao;
    private BigDecimal preco;
    private String categoria;
    private Long artistaId; 

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public Long getArtistaId() { return artistaId; }
    public void setArtistaId(Long artistaId) { this.artistaId = artistaId; }
}