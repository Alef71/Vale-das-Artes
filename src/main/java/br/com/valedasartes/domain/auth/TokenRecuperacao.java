package br.com.valedasartes.domain.auth;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Se o seu Spring for antigo (versão 2.x), mude 'jakarta.persistence' para 'javax.persistence'

@Entity
@Table(name = "tokens_recuperacao")
public class TokenRecuperacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    private Long usuarioId;

    private String tipoUsuario; // "CLIENTE" ou "ARTISTA"

    private LocalDateTime dataExpiracao;

    // --- CONSTRUTOR PADRÃO (Obrigatório para o JPA) ---
    public TokenRecuperacao() {
    }

    // --- CONSTRUTOR COM ARGUMENTOS (Opcional, mas útil) ---
    public TokenRecuperacao(String token, Long usuarioId, String tipoUsuario, LocalDateTime dataExpiracao) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.tipoUsuario = tipoUsuario;
        this.dataExpiracao = dataExpiracao;
    }

    // --- GETTERS E SETTERS (Essenciais para resolver seu erro) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) { // ✅ O erro sumirá por causa deste método
        this.token = token;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(String tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }

    public LocalDateTime getDataExpiracao() {
        return dataExpiracao;
    }

    public void setDataExpiracao(LocalDateTime dataExpiracao) {
        this.dataExpiracao = dataExpiracao;
    }
}