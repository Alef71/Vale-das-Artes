package br.com.valedasartes.domain.auth.service;

import java.time.LocalDateTime; 
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.repository.ArtistaRepository;
import br.com.valedasartes.domain.auth.TokenRecuperacao;
import br.com.valedasartes.domain.auth.repository.TokenRecuperacaoRepository;
import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;

@Service
public class AuthService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ArtistaRepository artistaRepository;

    @Autowired
    private TokenRecuperacaoRepository tokenRepository;

    public void solicitarRecuperacaoSenha(String cpf, String telefone) {
        
        // Alterado para String para aceitar tanto Long quanto UUID
        String usuarioId = null; 
        String tipo = null;
        String nomeUsuario = "";

        Optional<Cliente> clienteOpt = clienteRepository.findByCpfAndTelefone(cpf, telefone);
        
        if (clienteOpt.isPresent()) {
            // Converte o ID (Long) do cliente para String
            usuarioId = String.valueOf(clienteOpt.get().getId());
            tipo = "CLIENTE";
            nomeUsuario = clienteOpt.get().getNome();
        } else {
            
            Optional<Artista> artistaOpt = artistaRepository.findByCpfAndTelefone(cpf, telefone);
            if (artistaOpt.isPresent()) {
                // Converte o ID (ArtistId) do artista para String
                usuarioId = artistaOpt.get().getId().toString();
                tipo = "ARTISTA";
                nomeUsuario = artistaOpt.get().getNome();
            }
        }

        if (usuarioId != null) {
            String tokenUuid = UUID.randomUUID().toString();
            
            // Certifique-se que o construtor do TokenRecuperacao aceita String no 2º parâmetro
            TokenRecuperacao novoToken = new TokenRecuperacao(
                tokenUuid, 
                usuarioId, 
                tipo, 
                LocalDateTime.now().plusMinutes(30) 
            );
            
            tokenRepository.save(novoToken);

            String link = "http://localhost:5500/redefinir-senha.html?token=" + tokenUuid;
            
            System.out.println("=================================================");
            System.out.println(">>> 🔐 RECUPERAÇÃO CONFIRMADA (CPF + TEL)");
            System.out.println(">>> Para: " + nomeUsuario);
            System.out.println(">>> Link WhatsApp: " + link);
            System.out.println("=================================================");
        } else {
            System.out.println("⚠️ Tentativa falha: CPF e Telefone não conferem.");
            throw new RuntimeException("CPF ou Telefone incorretos.");
        }
    }
}