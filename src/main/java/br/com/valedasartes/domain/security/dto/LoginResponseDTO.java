package br.com.valedasartes.domain.security.dto;

public class LoginResponseDTO {

    private final String mensagem;
    private final String token; 

    public LoginResponseDTO(String mensagem, String token) {
        this.mensagem = mensagem;
        this.token = token;
    }

    
    public String getMensagem() { return mensagem; }
    public String getToken() { return token; }
}
