package br.com.valedasartes.domain.produto.dto;

import java.math.BigDecimal;

import br.com.valedasartes.domain.artista.dto.ArtistaResumoDTO;
import br.com.valedasartes.domain.produto.Produto; 

public class ProdutoResponseDTO {

    private final Long id;
    private final String nome;
    private final String descricao;
    private final BigDecimal preco;
    private final String categoria;
    private final ArtistaResumoDTO artista; 
    private final String fotoUrl;
    private final boolean ativo;

    public ProdutoResponseDTO(Produto produto) {
        this.id = produto.getId();
        this.nome = produto.getNome();
        this.descricao = produto.getDescricao();
        this.preco = produto.getPreco();
        this.categoria = produto.getCategoria();
        this.fotoUrl = produto.getFotoUrl();
        this.ativo = produto.isAtivo(); 

        if (produto.getArtista() != null) {
            this.artista = new ArtistaResumoDTO(produto.getArtista());
        } else {
            this.artista = null;
        }
    }

    
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public BigDecimal getPreco() { return preco; }
    public String getCategoria() { return categoria; }
    public ArtistaResumoDTO getArtista() { return artista; }
    public String getFotoUrl() { return fotoUrl; }
    public boolean isAtivo() { return ativo; }
}