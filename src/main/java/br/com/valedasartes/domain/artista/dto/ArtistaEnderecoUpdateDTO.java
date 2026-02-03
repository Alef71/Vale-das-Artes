package br.com.valedasartes.domain.artista.dto;

import jakarta.validation.constraints.NotBlank;

public record ArtistaEnderecoUpdateDTO(
    @NotBlank
    String cep,
    
    @NotBlank
    String logradouro,
    
    String numero, 
    
    String complemento,
    
    @NotBlank
    String bairro,
    
    @NotBlank
    String cidade,
    
    @NotBlank
    String estado, 
    
    String telefone 
) {}