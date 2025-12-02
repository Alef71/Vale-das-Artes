package br.com.valedasartes.domain.administrador.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // 1. Import necessário
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.valedasartes.domain.administrador.Administrador;
import br.com.valedasartes.domain.administrador.dto.AdministradorRequestDTO;
import br.com.valedasartes.domain.administrador.dto.AdministradorResponseDTO;
import br.com.valedasartes.domain.administrador.repository.AdministradorRepository;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.security.Credencial;

@Service
public class AdministradorService {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder; // 2. Adiciona o encoder

    @Autowired
    public AdministradorService(AdministradorRepository administradorRepository, PasswordEncoder passwordEncoder) { // 3. Injeta no construtor
        this.administradorRepository = administradorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AdministradorResponseDTO criarAdministrador(AdministradorRequestDTO dto) {
        Credencial credencial = new Credencial();
        credencial.setEmail(dto.getCredencial().getEmail());

        
        String senhaCriptografada = passwordEncoder.encode(dto.getCredencial().getSenha());
        credencial.setSenha(senhaCriptografada);

        Endereco endereco = new Endereco();
        endereco.setLogradouro(dto.getEndereco().getLogradouro());
        endereco.setNumero(dto.getEndereco().getNumero());
        endereco.setComplemento(dto.getEndereco().getComplemento());
        endereco.setBairro(dto.getEndereco().getBairro());
        endereco.setCidade(dto.getEndereco().getCidade());
        endereco.setEstado(dto.getEndereco().getEstado());
        endereco.setCep(dto.getEndereco().getCep());
        endereco.setTelefone(dto.getEndereco().getTelefone());

        Administrador novoAdmin = new Administrador();
        novoAdmin.setNome(dto.getNome());
        novoAdmin.setCpf(dto.getCpf());
        novoAdmin.setTelefone(dto.getTelefone());
        novoAdmin.setCredencial(credencial);
        novoAdmin.setEndereco(endereco);

        Administrador adminSalvo = administradorRepository.save(novoAdmin);
        return new AdministradorResponseDTO(adminSalvo);
    }

    public List<AdministradorResponseDTO> listarTodosOsAdministradores() {
        return administradorRepository.findAll()
                .stream()
                .map(AdministradorResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<AdministradorResponseDTO> buscarAdministradorPorId(Long id) {
        return administradorRepository.findById(id)
                .map(AdministradorResponseDTO::new);
    }

    @Transactional
    public AdministradorResponseDTO atualizarAdministrador(Long id, AdministradorRequestDTO dto) {
        return administradorRepository.findById(id)
            .map(adminExistente -> {
                adminExistente.setNome(dto.getNome());
                adminExistente.setCpf(dto.getCpf());
                adminExistente.setTelefone(dto.getTelefone());
                
                Administrador adminAtualizado = administradorRepository.save(adminExistente);
                return new AdministradorResponseDTO(adminAtualizado);
            }).orElse(null);
    }

    public void deletarAdministrador(Long id) {
        if (!administradorRepository.existsById(id)) {
            throw new RuntimeException("Administrador com ID " + id + " não encontrado.");
        }
        administradorRepository.deleteById(id);
    }
}