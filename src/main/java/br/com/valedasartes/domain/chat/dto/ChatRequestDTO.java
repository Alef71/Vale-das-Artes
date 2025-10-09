// Crie a pasta 'dto' dentro de 'chat'
// Caminho: br/com/valedasartes/domain/chat/dto/ChatRequestDTO.java

package br.com.valedasartes.domain.chat.dto;

public class ChatRequestDTO {

    private Long remetenteId;
    private Long destinatarioId;
    private String mensagem;

    // Getters e Setters
    public Long getRemetenteId() {
        return remetenteId;
    }
    public void setRemetenteId(Long remetenteId) {
        this.remetenteId = remetenteId;
    }
    public Long getDestinatarioId() {
        return destinatarioId;
    }
    public void setDestinatarioId(Long destinatarioId) {
        this.destinatarioId = destinatarioId;
    }
    public String getMensagem() {
        return mensagem;
    }
    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}