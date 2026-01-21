package br.com.valedasartes.domain.security.dto;

public class LoginResponseDTO {

    private final String mensagem;
    private final String token; 
    private final String role; 
    private final Long userId; 

    public LoginResponseDTO(String mensagem, String token, String role, Long userId) { 
        this.mensagem = mensagem;
        this.token = token;
        this.role = role;
        this.userId = userId; 
    }

    
    public String getMensagem() { return mensagem; }
    public String getToken() { return token; }
    public String getRole() { return role; } 
    
    
    public Long getUserId() { return userId; }
}