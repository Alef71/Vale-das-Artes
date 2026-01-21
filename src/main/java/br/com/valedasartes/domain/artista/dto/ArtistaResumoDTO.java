package br.com.valedasartes.domain.artista.dto;

import br.com.valedasartes.domain.artista.Artista;

public record ArtistaResumoDTO(
    Long id,
    String nome
) {
    
    public ArtistaResumoDTO(Artista artista) {
        this(
            artista.getId(), 
            artista.getNome()
        );
    }
}