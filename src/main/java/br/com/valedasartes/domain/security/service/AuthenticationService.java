package br.com.valedasartes.domain.security.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
        
        
        var token = tokenService.gerarToken(credencial);

        
        return new LoginResponseDTO("Login realizado com sucesso!", token);
    }
}