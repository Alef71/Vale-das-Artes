package br.com.valedasartes.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.repository.ArtistaRepository;
import br.com.valedasartes.domain.auth.TokenRecuperacao;
import br.com.valedasartes.domain.auth.dto.EsqueciSenhaDTO;
import br.com.valedasartes.domain.auth.repository.TokenRecuperacaoRepository;
import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private TokenRecuperacaoRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ArtistaRepository artistaRepository;

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> esqueciSenha(@RequestBody EsqueciSenhaDTO dados) {
        
        String cpfLimpo = dados.cpf().replaceAll("[^0-9]", "");
        String telLimpo = dados.telefone().replaceAll("[^0-9]", "");

        Optional<Cliente> clienteOpt = clienteRepository.findByCpf(cpfLimpo);
        if (clienteOpt.isPresent()) {
            String telBanco = clienteOpt.get().getEndereco().getTelefone().replaceAll("[^0-9]", "");
            
            if (telBanco.contains(telLimpo) || telLimpo.contains(telBanco)) {
                return gerarTokenResposta(clienteOpt.get().getId(), "CLIENTE");
            }
        }

        Optional<Artista> artistaOpt = artistaRepository.findByCpf(cpfLimpo);
        if (artistaOpt.isPresent()) {
            String telBanco = artistaOpt.get().getEndereco().getTelefone().replaceAll("[^0-9]", "");
            
            if (telBanco.contains(telLimpo) || telLimpo.contains(telBanco)) {
                return gerarTokenResposta(artistaOpt.get().getId(), "ARTISTA");
            }
        }

        return ResponseEntity.badRequest().body("{\"mensagem\": \"CPF ou WhatsApp não conferem com nossos registros.\"}");
    }

    private ResponseEntity<?> gerarTokenResposta(Long userId, String tipoUsuario) {
        String tokenString = UUID.randomUUID().toString();
        
        TokenRecuperacao token = new TokenRecuperacao();
        token.setToken(tokenString);
        token.setUsuarioId(userId);
        token.setTipoUsuario(tipoUsuario);
        token.setDataExpiracao(LocalDateTime.now().plusMinutes(30));
        
        tokenRepository.save(token);

        Map<String, String> response = new HashMap<>();
        response.put("token", tokenString);
        response.put("mensagem", "Dados confirmados! Defina sua nova senha.");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/salvar-nova-senha")
    public ResponseEntity<?> salvarNovaSenha(@RequestBody Map<String, String> dados) {
        String token = dados.get("token");
        String novaSenha = dados.get("novaSenha");

        Optional<TokenRecuperacao> tokenOpt = tokenRepository.findByToken(token);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Token inválido.");
        }

        TokenRecuperacao tokenDb = tokenOpt.get();

        if (tokenDb.getDataExpiracao().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("O tempo para trocar a senha expirou. Tente novamente.");
        }

        String senhaCriptografada = passwordEncoder.encode(novaSenha);
        
        if ("CLIENTE".equals(tokenDb.getTipoUsuario())) {
            Cliente c = clienteRepository.findById(tokenDb.getUsuarioId()).orElseThrow();
            c.getCredencial().setSenha(senhaCriptografada); 
            clienteRepository.save(c);
        } else {
            Artista a = artistaRepository.findById(tokenDb.getUsuarioId()).orElseThrow();
            a.getCredencial().setSenha(senhaCriptografada);
            artistaRepository.save(a);
        }

        tokenRepository.delete(tokenDb);

        return ResponseEntity.ok().body("{\"mensagem\": \"Senha alterada com sucesso!\"}");
    }
}