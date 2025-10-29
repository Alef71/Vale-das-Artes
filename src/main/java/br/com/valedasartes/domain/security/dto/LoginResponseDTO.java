package br.com.valedasartes.domain.security.dto;

public class LoginResponseDTO {

    private final String mensagem;
    private final String token; 
    private final String role; 
    private final Long userId; // <-- 1. CAMPO ADICIONADO

    /**
     * Construtor atualizado para incluir a 'role' E 'userId'
     */
    public LoginResponseDTO(String mensagem, String token, String role, Long userId) { // <-- 2. PARÂMETRO 'userId' ADICIONADO
        this.mensagem = mensagem;
        this.token = token;
        this.role = role;
        this.userId = userId; // <-- 3. ATRIBUIÇÃO ADICIONADA
    }

    
    public String getMensagem() { return mensagem; }
    public String getToken() { return token; }
    public String getRole() { return role; } 
    
    // 4. GETTER ADICIONADO
    public Long getUserId() { return userId; }
}