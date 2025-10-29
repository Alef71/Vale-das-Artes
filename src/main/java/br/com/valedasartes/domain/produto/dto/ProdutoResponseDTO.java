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

    // --- 1. CAMPOS ADICIONADOS ---
    private final String fotoUrl;
    private final boolean ativo;

    public ProdutoResponseDTO(Produto produto) {
        this.id = produto.getId();
        this.nome = produto.getNome();
        this.descricao = produto.getDescricao();
        this.preco = produto.getPreco();
        this.categoria = produto.getCategoria();
        
        // --- 2. LÓGICA DE ATRIBUIÇÃO ADICIONADA ---
        this.fotoUrl = produto.getFotoUrl(); // Pega a URL da foto
        this.ativo = produto.isAtivo();   // Pega o status

        // Lógica do Nome do Artista (já estava correta)
        String nomeArt = null;
        if (produto.getArtista() != null) {
            nomeArt = produto.getArtista().getNome();
        }
        this.nomeArtista = nomeArt;
    }

    // (Getters existentes)
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public BigDecimal getPreco() { return preco; }
    public String getCategoria() { return categoria; }
    public String getNomeArtista() { return nomeArtista; }

    // --- 3. GETTERS NOVOS ADICIONADOS ---
    public String getFotoUrl() { return fotoUrl; }
    public boolean isAtivo() { return ativo; }
}