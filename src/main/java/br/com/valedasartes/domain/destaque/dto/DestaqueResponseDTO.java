package br.com.valedasartes.domain.destaque.dto;

import java.time.LocalDateTime;

import br.com.valedasartes.domain.destaque.Destaque;

public class DestaqueResponseDTO {

    private final Long id;
    private final String titulo;
    private final String link;
    private final String caminhoImagem;
    private final LocalDateTime dataPublicacao;
    private final boolean ativo;

    public DestaqueResponseDTO(Destaque destaque) {
        this.id = destaque.getId();
        this.titulo = destaque.getTitulo();
        this.link = destaque.getLink();
        this.caminhoImagem = destaque.getCaminhoImagem(); 
        this.dataPublicacao = destaque.getDataPublicacao();
        this.ativo = destaque.isAtivo();
    }

    
    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getLink() { return link; }
    public String getCaminhoImagem() { return caminhoImagem; }
    public LocalDateTime getDataPublicacao() { return dataPublicacao; }
    public boolean isAtivo() { return ativo; }
}