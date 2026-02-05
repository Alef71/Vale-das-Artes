package br.com.valedasartes.domain.artista.dto;

import br.com.valedasartes.domain.artista.Artista;

public record ArtistaResumoDTO(
    String id, // Mudou de Long para String
    String nome
) {
    
    public ArtistaResumoDTO(Artista artista) {
        this(
            artista.getId().toString(), // Converte o ArtistId para String
            artista.getNome()
        );
    }
}