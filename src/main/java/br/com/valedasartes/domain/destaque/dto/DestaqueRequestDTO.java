package br.com.valedasartes.domain.destaque.dto;

import jakarta.validation.constraints.Size;

public class DestaqueRequestDTO {

    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres.")
    private String titulo;

    
    private String link; 

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}