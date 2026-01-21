package br.com.valedasartes.domain.auth.service;

import java.time.LocalDateTime; // NOVO IMPORT
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
        
        Long usuarioId = null;
        String tipo = null;
        String nomeUsuario = "";

        // 1. Tenta achar Cliente com CPF E Telefone
        Optional<Cliente> clienteOpt = clienteRepository.findByCpfAndTelefone(cpf, telefone);
        
        if (clienteOpt.isPresent()) {
            usuarioId = clienteOpt.get().getId();
            tipo = "CLIENTE";
            nomeUsuario = clienteOpt.get().getNome();
        } else {
            // 2. Se não achou cliente, tenta Artista
            Optional<Artista> artistaOpt = artistaRepository.findByCpfAndTelefone(cpf, telefone);
            if (artistaOpt.isPresent()) {
                usuarioId = artistaOpt.get().getId();
                tipo = "ARTISTA";
                nomeUsuario = artistaOpt.get().getNome();
            }
        }

        // 3. Se achou (Dados conferem)
        if (usuarioId != null) {
            String tokenUuid = UUID.randomUUID().toString();
            
            // ✅ CORREÇÃO: Adicionado o 4º parâmetro (dataExpiracao) conforme o construtor da Entidade
            TokenRecuperacao novoToken = new TokenRecuperacao(
                tokenUuid, 
                usuarioId, 
                tipo, 
                LocalDateTime.now().plusMinutes(30) // Token expira em 30 minutos
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