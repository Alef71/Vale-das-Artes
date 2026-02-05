package br.com.valedasartes.domain.artista.id;

import java.io.Serializable;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public record ArtistId(UUID value) implements Serializable {

    // Validação para não permitir ID nulo
    public ArtistId {
        if (value == null) {
            throw new IllegalArgumentException("ArtistId não pode ser nulo");
        }
    }

    // Gera um novo ID aleatório (usado quando cria um Artista novo)
    public static ArtistId generate() {
        return new ArtistId(UUID.randomUUID());
    }

    // Cria a partir de uma String (usado quando o ID vem do Front/JSON)
    @JsonCreator
    public static ArtistId from(String value) {
        if (value == null) {
            return null;
        }
        try {
            return new ArtistId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Formato de ID inválido para Artista");
        }
    }
    
    // Auxiliar para converter de UUID puro
    public static ArtistId from(UUID value) {
        return new ArtistId(value);
    }

    @JsonValue 
    @Override
    public String toString() {
        return value.toString();
    }
}
