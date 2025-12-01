package br.com.valedasartes.domain.artista.service;

import java.util.List;
import java.util.Optional; 
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.config.FileStorageService;
import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.ArtistaStatus;
import br.com.valedasartes.domain.artista.dto.ArtistaRequestDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaResponseDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaUpdateDTO;
import br.com.valedasartes.domain.artista.repository.ArtistaRepository;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.security.Credencial;

@Service
public class ArtistaService {

    private final ArtistaRepository artistaRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Autowired
    public ArtistaService(ArtistaRepository artistaRepository,
                          PasswordEncoder passwordEncoder,
                          FileStorageService fileStorageService) {
        this.artistaRepository = artistaRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ArtistaResponseDTO criarArtista(ArtistaRequestDTO dto) {
        
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
        endereco.setTelefone(dto.getTelefone());

        Artista novoArtista = new Artista();
        novoArtista.setNome(dto.getNome());
        novoArtista.setCpf(dto.getCpf());
        novoArtista.setCnpj(dto.getCnpj());
        novoArtista.setTelefone(dto.getTelefone());
        novoArtista.setNomeEmpresa(dto.getNomeEmpresa());
        
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
    
    public List<ArtistaResponseDTO> listarArtistasPendentes() {
        return artistaRepository.findByStatusAprovacao(ArtistaStatus.PENDENTE).stream()
                .map(ArtistaResponseDTO::new)
                .collect(Collectors.toList());
    }

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Agora retorna o DTO direto e lança exceção se não achar.
    public ArtistaResponseDTO buscarPorId(Long id) {
        return artistaRepository.findCompletoById(id) 
                .map(ArtistaResponseDTO::new)
                .orElseThrow(() -> new RuntimeException("Artista não encontrado com ID: " + id));
    }
    // -----------------------------

    @Transactional
    public ArtistaResponseDTO atualizarArtista(Long id, ArtistaUpdateDTO dto) {
        return artistaRepository.findById(id) 
            .map(artistaExistente -> {
                
                artistaExistente.setNome(dto.nome());
                artistaExistente.setNomeEmpresa(dto.nomeEmpresa());
                artistaExistente.setBiografia(dto.biografia());

                Artista artistaAtualizado = artistaRepository.save(artistaExistente);
                return new ArtistaResponseDTO(artistaAtualizado);
                
            }).orElse(null);
    }
    
    @Transactional
    public ArtistaResponseDTO alterarStatusAprovacao(Long artistaId, ArtistaStatus novoStatus) {
        return artistaRepository.findById(artistaId)
            .map(artistaExistente -> {
                artistaExistente.setStatusAprovacao(novoStatus);
                Artista artistaAtualizado = artistaRepository.save(artistaExistente);
                return new ArtistaResponseDTO(artistaAtualizado);
            }).orElseThrow(() -> new RuntimeException("Artista com ID " + artistaId + " não encontrado."));
    }

    @Transactional
    public ArtistaResponseDTO uploadFoto(Long artistaId, MultipartFile file, Credencial credencialLogada) {
        Artista artista = artistaRepository.findById(artistaId)
                .orElseThrow(() -> new RuntimeException("Artista não encontrado"));

        if (credencialLogada.getArtista() == null || !artista.getId().equals(credencialLogada.getArtista().getId())) {
            throw new RuntimeException("Acesso negado: Você não pode alterar a foto de outro artista.");
        }

        String nomeArquivo = fileStorageService.salvarArquivo(file);
        String fotoUrl = fileStorageService.getUrlCompleta(nomeArquivo);

        artista.setFotoUrl(fotoUrl);
        Artista artistaSalvo = artistaRepository.save(artista);

        return new ArtistaResponseDTO(artistaSalvo);
    }

    @Transactional
    public ArtistaResponseDTO removerFoto(Long artistaId, Credencial credencialLogada) {
        Artista artista = artistaRepository.findById(artistaId)
                .orElseThrow(() -> new RuntimeException("Artista não encontrado"));

        if (credencialLogada.getArtista() == null || !artista.getId().equals(credencialLogada.getArtista().getId())) {
            throw new RuntimeException("Acesso negado: Você não pode alterar a foto de outro artista.");
        }

        artista.setFotoUrl(null);
        Artista artistaSalvo = artistaRepository.save(artista);

        return new ArtistaResponseDTO(artistaSalvo);
    }

    @Transactional
    public void deletarArtista(Long id) {
        Optional<Artista> artistaOptional = artistaRepository.findById(id);

        if (artistaOptional.isPresent()) {
            artistaRepository.delete(artistaOptional.get());
        } else {
            throw new RuntimeException("Artista com ID " + id + " não encontrado.");
        }
    }
}