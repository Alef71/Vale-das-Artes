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
        
        var credencial = (Credencial) authentication.getPrincipal();
        
        
        
        String role = credencial.getAuthorities().stream()
            .findFirst()
            .map(GrantedAuthority::getAuthority)
            .orElse("ROLE_DESCONHECIDA");

        
        
        
        Long userId = null;
        if ("ROLE_CLIENTE".equals(role) && credencial.getCliente() != null) {
            userId = credencial.getCliente().getId();
        } else if ("ROLE_ARTISTA".equals(role) && credencial.getArtista() != null) {
            userId = credencial.getArtista().getId();
        } else if ("ROLE_ADMIN".equals(role) && credencial.getAdministrador() != null) {
            userId = credencial.getAdministrador().getId();
        } else {
            
            userId = credencial.getId(); 
        }

        
        var token = tokenService.gerarToken(credencial);

        
        return new LoginResponseDTO("Login realizado com sucesso!", token, role, userId);
    }
}