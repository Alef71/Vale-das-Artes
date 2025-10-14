package br.com.valedasartes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.valedasartes.domain.security.dto.LoginRequestDTO;
import br.com.valedasartes.domain.security.dto.LoginResponseDTO;
import br.com.valedasartes.domain.security.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Endpoints para autenticação de usuários")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @Operation(summary = "Autentica um usuário", description = "Recebe e-mail e senha, valida as credenciais e, em caso de sucesso, retorna uma mensagem. Futuramente, retornará um token JWT.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autenticação bem-sucedida"),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (ex: e-mail em formato incorreto)"),
        @ApiResponse(responseCode = "403", description = "Acesso negado (credenciais inválidas)")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        LoginResponseDTO response = authenticationService.login(loginRequestDTO);
        return ResponseEntity.ok(response);
    }
}