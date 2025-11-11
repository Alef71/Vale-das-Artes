package br.com.valedasartes.domain.destaque.service;

import java.util.List; // Necessário
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.config.FileStorageService;
import br.com.valedasartes.domain.destaque.Destaque;
import br.com.valedasartes.domain.destaque.dto.DestaqueRequestDTO;
import br.com.valedasartes.domain.destaque.dto.DestaqueResponseDTO;
import br.com.valedasartes.domain.destaque.dto.DestaqueUpdateRequestDTO;
import br.com.valedasartes.domain.destaque.repository.DestaqueRepository;

@Service
public class DestaqueService {

    private final DestaqueRepository destaqueRepository;
    private final FileStorageService fileStorageService; // Injeção

    @Autowired
    public DestaqueService(DestaqueRepository destaqueRepository, FileStorageService fileStorageService) {
        this.destaqueRepository = destaqueRepository;
        this.fileStorageService = fileStorageService;
    }

    // --- C R I A R (C) - Só o texto ---
    @Transactional
    public DestaqueResponseDTO criarDestaque(DestaqueRequestDTO dto) {
        Destaque novoDestaque = new Destaque();
        novoDestaque.setTitulo(dto.getTitulo());
        novoDestaque.setLink(dto.getLink());
        // A imagem será adicionada em um POST separado (uploadFoto)

        Destaque salvo = destaqueRepository.save(novoDestaque);
        return new DestaqueResponseDTO(salvo);
    }
    
    // --- L E R (R) ---
    public List<DestaqueResponseDTO> listarTodos() {
        return destaqueRepository.findAll().stream()
                .map(DestaqueResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<DestaqueResponseDTO> buscarPorId(Long id) {
        return destaqueRepository.findById(id).map(DestaqueResponseDTO::new);
    }
    
    // --- U P L O A D (Adicionando a foto) ---
    @Transactional
    public DestaqueResponseDTO uploadFoto(Long destaqueId, MultipartFile file) {
        
        Destaque destaque = destaqueRepository.findById(destaqueId)
                .orElseThrow(() -> new RuntimeException("Destaque não encontrado"));

        String nomeArquivo = fileStorageService.salvarArquivo(file);
        String fotoUrl = fileStorageService.getUrlCompleta(nomeArquivo);

        destaque.setCaminhoImagem(fotoUrl);
        Destaque destaqueSalvo = destaqueRepository.save(destaque);

        return new DestaqueResponseDTO(destaqueSalvo);
    }

    // --- R E M O V E R F O T O ---
    @Transactional
    public DestaqueResponseDTO removerFoto(Long destaqueId) {
        Destaque destaque = destaqueRepository.findById(destaqueId)
                .orElseThrow(() -> new RuntimeException("Destaque não encontrado"));

        destaque.setCaminhoImagem(null);
        Destaque destaqueSalvo = destaqueRepository.save(destaque);

        return new DestaqueResponseDTO(destaqueSalvo);
    }

    // --- A T U A L I Z A R (U) ---
    @Transactional
    public DestaqueResponseDTO atualizarDestaque(Long id, DestaqueUpdateRequestDTO dto) {
        return destaqueRepository.findById(id)
            .map(destaqueExistente -> {
                destaqueExistente.setTitulo(dto.getTitulo());
                destaqueExistente.setLink(dto.getLink());
                destaqueExistente.setAtivo(dto.getAtivo());

                Destaque atualizado = destaqueRepository.save(destaqueExistente);
                return new DestaqueResponseDTO(atualizado);
            }).orElse(null);
    }

    // --- D E L E T A R (D) ---
    public void deletarDestaque(Long id) {
        if (!destaqueRepository.existsById(id)) {
            throw new RuntimeException("Destaque com ID " + id + " não encontrado.");
        }
        destaqueRepository.deleteById(id);
    }
}