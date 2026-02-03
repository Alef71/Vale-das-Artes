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
import br.com.valedasartes.domain.artista.dto.ArtistaEnderecoUpdateDTO;
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
        
        try {
             String numStr = String.valueOf(dto.getEndereco().getNumero());
             endereco.setNumero(Integer.parseInt(numStr));
        } catch (NumberFormatException e) {
             endereco.setNumero(0); 
        }

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

    public ArtistaResponseDTO buscarPorId(Long id) {
        return artistaRepository.findCompletoById(id) 
                .map(ArtistaResponseDTO::new)
                .orElseThrow(() -> new RuntimeException("Artista não encontrado com ID: " + id));
    }
  

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

    // --- MÉTODO CORRIGIDO ---
    @Transactional
    public ArtistaResponseDTO atualizarEndereco(Long id, ArtistaEnderecoUpdateDTO dto) {
        Artista artista = artistaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Artista não encontrado"));

        Endereco endereco = artista.getEndereco();
        
        // Se não existir endereço, cria um novo e vincula
        if (endereco == null) {
            endereco = new Endereco();
            endereco.setArtista(artista); 
            artista.setEndereco(endereco);
        }

        // Atualiza os campos
        endereco.setCep(dto.cep());
        endereco.setLogradouro(dto.logradouro());
        endereco.setComplemento(dto.complemento());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(dto.cidade());
        
        // CORREÇÃO 1: Usa dto.estado() para bater com o DTO novo
        endereco.setEstado(dto.estado()); 
        
        // CORREÇÃO 2: Salva o telefone
        endereco.setTelefone(dto.telefone());

        // Lógica segura de conversão de Número (String -> Integer)
        if (dto.numero() != null && !dto.numero().trim().isEmpty()) {
            try {
                // Remove caracteres não numéricos (ex: "46A" vira "46")
                String numeroLimpo = dto.numero().replaceAll("\\D", "");
                if (!numeroLimpo.isEmpty()) {
                    endereco.setNumero(Integer.parseInt(numeroLimpo));
                } else {
                    endereco.setNumero(0); // Se for só texto (ex: "S/N"), salva 0
                }
            } catch (NumberFormatException e) {
                endereco.setNumero(0);
            }
        } else {
            endereco.setNumero(null); 
        }

        // Salva explicitamente
        artistaRepository.save(artista);
        
        return new ArtistaResponseDTO(artista);
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