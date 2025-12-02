package br.com.valedasartes.domain.security.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.security.Credencial;
import br.com.valedasartes.domain.security.repository.CredencialRepository;

@Service
public class CredencialService {

    private final CredencialRepository credencialRepository;

    @Autowired
    public CredencialService(CredencialRepository credencialRepository) {
        this.credencialRepository = credencialRepository;
    }

    public Credencial criarCredencial(Credencial credencial) {
        
        return credencialRepository.save(credencial);
    }

    public List<Credencial> listarTodasAsCredenciais() {
        return credencialRepository.findAll();
    }

    public Optional<Credencial> buscarCredencialPorId(Long id) {
        return credencialRepository.findById(id);
    }

    public Credencial atualizarCredencial(Long id, Credencial credencialAtualizada) {
        return credencialRepository.findById(id)
            .map(credencialExistente -> {
                credencialExistente.setEmail(credencialAtualizada.getEmail());
                credencialExistente.setSenha(credencialAtualizada.getSenha()); 
                return credencialRepository.save(credencialExistente);
            }).orElse(null);
    }

    public void deletarCredencial(Long id) {
        credencialRepository.deleteById(id);
    }
}