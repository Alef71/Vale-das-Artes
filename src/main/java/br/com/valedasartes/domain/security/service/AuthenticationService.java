package br.com.valedasartes.domain.security.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.security.Credencial;
import br.com.valedasartes.domain.security.dto.LoginRequestDTO;
import br.com.valedasartes.domain.security.dto.LoginResponseDTO;

@Service
public class AuthenticationService {

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private TokenService tokenService; 

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getSenha());
        
        var authentication = this.authenticationManager.authenticate(authenticationToken);
        
        // Pega o objeto principal (Credencial JÁ COM 'cliente', 'artista', etc.,
        // graças ao 'findCompletoById' do CredencialRepository)
        var credencial = (Credencial) authentication.getPrincipal();
        
        
        // Pega a "Role" (este código já estava correto)
        String role = credencial.getAuthorities().stream()
            .findFirst()
            .map(GrantedAuthority::getAuthority)
            .orElse("ROLE_DESCONHECIDA");

        
        // --- A GRANDE CORREÇÃO ESTÁ AQUI ---
        // Pega o ID do *usuário* (Cliente/Artista/Admin) 
        // em vez do ID da *credencial*.
        
        Long userId = null;
        if ("ROLE_CLIENTE".equals(role) && credencial.getCliente() != null) {
            userId = credencial.getCliente().getId();
        } else if ("ROLE_ARTISTA".equals(role) && credencial.getArtista() != null) {
            userId = credencial.getArtista().getId();
        } else if ("ROLE_ADMIN".equals(role) && credencial.getAdministrador() != null) {
            userId = credencial.getAdministrador().getId();
        } else {
            // Fallback (nunca deve acontecer se o BD estiver certo)
            userId = credencial.getId(); 
        }

        
        var token = tokenService.gerarToken(credencial);

        
        // Passa o 'userId' CORRETO para o DTO
        return new LoginResponseDTO("Login realizado com sucesso!", token, role, userId);
    }
}