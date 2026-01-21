package br.com.valedasartes.domain.artista.dto;

import br.com.valedasartes.domain.artista.ArtistaStatus;
import jakarta.validation.constraints.NotNull;

public class ArtistaStatusUpdateDTO {

    @NotNull(message = "O novo status é obrigatório.")
    private ArtistaStatus status;


    public ArtistaStatus getStatus() { return status; }
    public void setStatus(ArtistaStatus status) { this.status = status; }
}
