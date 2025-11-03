package br.com.valedasartes.domain.artista.dto;

import jakarta.validation.constraints.NotBlank;

public record ArtistaUpdateDTO(
    @NotBlank(message = "O nome é obrigatório.")
    String nome, 
    
    String nomeEmpresa,
    
    String biografia
) {
    
}