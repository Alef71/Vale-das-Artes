package br.com.valedasartes.domain.chat.dto;

import java.time.LocalDateTime;

import br.com.valedasartes.domain.chat.Chat;

public class ChatResponseDTO {

    private final Long id;
    private final Long remetenteId;
    private final Long destinatarioId;
    private final String mensagem;
    private final LocalDateTime dataEnvio;

    public ChatResponseDTO(Chat chat) {
        this.id = chat.getId();
        this.remetenteId = chat.getRemetente();
        this.destinatarioId = chat.getDestinatario();
        this.mensagem = chat.getMensagem();
        this.dataEnvio = chat.getDataEnvio();
    }

    
    public Long getId() { return id; }
    public Long getRemetenteId() { return remetenteId; }
    public Long getDestinatarioId() { return destinatarioId; }
    public String getMensagem() { return mensagem; }
    public LocalDateTime getDataEnvio() { return dataEnvio; }
}