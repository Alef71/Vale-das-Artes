package br.com.valedasartes.domain.artista.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // <-- 1. IMPORTAR
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- 2. IMPORTAR

import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.dto.ArtistaRequestDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaResponseDTO;
import br.com.valedasartes.domain.artista.repository.ArtistaRepository;
import br.com.valedasartes.domain.endereco.Endereco; // <-- 3. IMPORTAR
import br.com.valedasartes.domain.security.Credencial; // <-- 4. IMPORTAR

@Service
public class ArtistaService {

    private final ArtistaRepository artistaRepository;
    private final PasswordEncoder passwordEncoder; // <-- 5. ADICIONAR

    @Autowired
    // 6. ATUALIZAR CONSTRUTOR
    public ArtistaService(ArtistaRepository artistaRepository, PasswordEncoder passwordEncoder) {
        this.artistaRepository = artistaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Atualizado para salvar Credencial e Endereço
     * (Depende do ArtistaRequestDTO ser "aninhado")
     */
    @Transactional
    public ArtistaResponseDTO criarArtista(ArtistaRequestDTO dto) {
        
        // Lógica de Credencial
        Credencial credencial = new Credencial();
        credencial.setEmail(dto.getCredencial().getEmail());
        String senhaCriptografada = passwordEncoder.encode(dto.getCredencial().getSenha());
        credencial.setSenha(senhaCriptografada);

        // Lógica de Endereço
        Endereco endereco = new Endereco();
        endereco.setLogradouro(dto.getEndereco().getLogradouro());
        endereco.setNumero(dto.getEndereco().getNumero());
        endereco.setComplemento(dto.getEndereco().getComplemento());
        endereco.setBairro(dto.getEndereco().getBairro());
        endereco.setCidade(dto.getEndereco().getCidade());
        endereco.setEstado(dto.getEndereco().getEstado());
        endereco.setCep(dto.getEndereco().getCep());
        endereco.setTelefone(dto.getEndereco().getTelefone());

        // Lógica do Artista
        Artista novoArtista = new Artista();
        novoArtista.setNome(dto.getNome()); // Usando os nomes do DTO aninhado
        novoArtista.setCpf(dto.getCpf());
        novoArtista.setCnpj(dto.getCnpj());
        novoArtista.setTelefone(dto.getTelefone());
        novoArtista.setNomeEmpresa(dto.getNomeEmpresa());
        
        // Linkar as entidades
        novoArtista.setCredencial(credencial);
        novoArtista.setEndereco(endereco);

        Artista artistaSalvo = artistaRepository.save(novoArtista);
        return new ArtistaResponseDTO(artistaSalvo);
    }

    public List<ArtistaResponseDTO> listarTodosOsArtistas() {
        return artistaRepository.findAll()
                .stream()
                .map(ArtistaResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Atualizado para usar 'findCompletoById' (do ArtistaRepository)
     * para carregar todos os dados (endereco, credencial, produtos)
     */
    public Optional<ArtistaResponseDTO> buscarArtistaPorId(Long id) {
        // Assegure-se de que seu ArtistaRepository tem o método 'findCompletoById'
        return artistaRepository.findCompletoById(id) 
                .map(ArtistaResponseDTO::new);
    }

    /**
     * Atualizado para salvar mudanças de Endereço e Senha
     */
    @Transactional
    public ArtistaResponseDTO atualizarArtista(Long id, ArtistaRequestDTO dto) {
        // Usamos 'findById' aqui pois o 'save' lidará com a entidade gerenciada
        return artistaRepository.findById(id) 
            .map(artistaExistente -> {
                
                // Atualiza dados do Artista
                artistaExistente.setNome(dto.getNome());
                artistaExistente.setTelefone(dto.getTelefone());
                artistaExistente.setNomeEmpresa(dto.getNomeEmpresa());
                artistaExistente.setCnpj(dto.getCnpj());

                // Atualiza dados do Endereço
                if (artistaExistente.getEndereco() != null && dto.getEndereco() != null) {
                    Endereco enderecoExistente = artistaExistente.getEndereco();
                    enderecoExistente.setLogradouro(dto.getEndereco().getLogradouro());
                    enderecoExistente.setNumero(dto.getEndereco().getNumero());
                    enderecoExistente.setComplemento(dto.getEndereco().getComplemento());
                    enderecoExistente.setBairro(dto.getEndereco().getBairro());
                    enderecoExistente.setCidade(dto.getEndereco().getCidade());
                    enderecoExistente.setEstado(dto.getEndereco().getEstado());
                    enderecoExistente.setCep(dto.getEndereco().getCep());
                    enderecoExistente.setTelefone(dto.getEndereco().getTelefone());
                }
                
                // Atualiza a Senha (se uma nova foi enviada)
                if (dto.getCredencial() != null) { // Verifica se o DTO aninhado existe
                    String novaSenha = dto.getCredencial().getSenha();
                    if (novaSenha != null && !novaSenha.isBlank()) {
                        String senhaCriptografada = passwordEncoder.encode(novaSenha);
                        artistaExistente.getCredencial().setSenha(senhaCriptografada);
                    }
                }

                Artista artistaAtualizado = artistaRepository.save(artistaExistente);
                return new ArtistaResponseDTO(artistaAtualizado);
                
            }).orElse(null);
    }

    public void deletarArtista(Long id) {
        if (!artistaRepository.existsById(id)) {
            throw new RuntimeException("Artista com ID " + id + " não encontrado.");
        }
        artistaRepository.deleteById(id);
    }
}