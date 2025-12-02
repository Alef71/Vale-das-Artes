package br.com.valedasartes.domain.artista.dto;

import br.com.valedasartes.domain.artista.Artista;

/**
 * Um DTO 'record' simples para incluir nos detalhes do produto.
 */
public record ArtistaResumoDTO(
    Long id,
    String nome
) {
    // Construtor especial que converte a Entidade Artista para este DTO
    public ArtistaResumoDTO(Artista artista) {
        this(
            artista.getId(), 
            artista.getNome()
        );
    }
}