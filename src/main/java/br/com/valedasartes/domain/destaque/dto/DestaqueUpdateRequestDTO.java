package br.com.valedasartes.domain.destaque.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class DestaqueUpdateRequestDTO {

    @NotBlank(message = "O título é obrigatório.")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres.")
    private String titulo;

    @NotBlank(message = "O link de destino é obrigatório.")
    private String link; 

    @NotNull(message = "O status de ativo/inativo é obrigatório.")
    private Boolean ativo;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}