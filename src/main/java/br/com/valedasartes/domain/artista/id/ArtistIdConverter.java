package br.com.valedasartes.domain.artista.id;

import java.util.UUID;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true) // autoApply faz funcionar sem precisar anotar cada campo
public class ArtistIdConverter implements AttributeConverter<ArtistId, UUID> {

    @Override
    public UUID convertToDatabaseColumn(ArtistId attribute) {
        return attribute != null ? attribute.value() : null;
    }

    @Override
    public ArtistId convertToEntityAttribute(UUID dbData) {
        return dbData != null ? new ArtistId(dbData) : null;
    }
}
