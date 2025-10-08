package br.com.valedasartes.domain.administrador.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.administrador.Administrador;
import br.com.valedasartes.domain.administrador.repository.AdministradorRepository;

@Service
public class AdministradorService {

    private final AdministradorRepository administradorRepository;

    @Autowired
    public AdministradorService(AdministradorRepository administradorRepository) {
        this.administradorRepository = administradorRepository;
    }

    public Administrador criarAdministrador(Administrador administrador) {
        return administradorRepository.save(administrador);
    }

    public List<Administrador> listarTodosOsAdministradores() {
        return administradorRepository.findAll();
    }

    public Optional<Administrador> buscarAdministradorPorId(Long id) {
        return administradorRepository.findById(id);
    }

    public Administrador atualizarAdministrador(Long id, Administrador adminAtualizado) {
        return administradorRepository.findById(id)
            .map(adminExistente -> {
                
                adminExistente.setNome(adminAtualizado.getNome());
                adminExistente.setCpf(adminAtualizado.getCpf());
                adminExistente.setTelefone(adminAtualizado.getTelefone());
                return administradorRepository.save(adminExistente);
            }).orElse(null);
    }

    public void deletarAdministrador(Long id) {
        administradorRepository.deleteById(id);
    }
}