package br.com.valedasartes.domain.security;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import br.com.valedasartes.domain.administrador.Administrador;
import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.cliente.Cliente;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "credenciais")
public class Credencial implements UserDetails { 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_credencial")
    private Long id;

    @Column(name = "email_credencial", nullable = false, unique = true)
    private String email;

    @Column(name = "senha_credencial", nullable = false)
    private String senha;
    
    
    @OneToOne(mappedBy = "credencial", fetch = FetchType.LAZY)
    private Cliente cliente;
    
    @OneToOne(mappedBy = "credencial", fetch = FetchType.LAZY)
    private Artista artista;
    
    @OneToOne(mappedBy = "credencial", fetch = FetchType.LAZY)
    private Administrador administrador;
    
    
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    

    
    public Cliente getCliente() { return cliente; }
    public Artista getArtista() { return artista; }
    public Administrador getAdministrador() { return administrador; }


    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.administrador != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        if (this.artista != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_ARTISTA"));
        }
        if (this.cliente != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"));
        }
        return Collections.emptyList();
    }

    
    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }
    
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
    
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Credencial that = (Credencial) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}