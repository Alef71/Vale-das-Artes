package br.com.valedasartes.domain.auth;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tokens_recuperacao")
public class TokenRecuperacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    // ALTERADO: De Long para String
    // Motivo: Permitir salvar IDs numéricos (Cliente) e UUIDs (Artista)
    private String usuarioId;

    private String tipoUsuario; 

    private LocalDateTime dataExpiracao;

    
    public TokenRecuperacao() {
    }

    // ALTERADO: O construtor agora aceita String no usuarioId
    public TokenRecuperacao(String token, String usuarioId, String tipoUsuario, LocalDateTime dataExpiracao) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.tipoUsuario = tipoUsuario;
        this.dataExpiracao = dataExpiracao;
    }

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) { 
        this.token = token;
    }

    // ALTERADO: Getter retorna String
    public String getUsuarioId() {
        return usuarioId;
    }

    // ALTERADO: Setter recebe String
    public void setUsuarioId(String usuarioId) {
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