package br.com.valedasartes.domain.artista.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.dto.ArtistaRequestDTO;
import br.com.valedasartes.domain.artista.dto.ArtistaResponseDTO;
import br.com.valedasartes.domain.artista.repository.ArtistaRepository;

@Service
public class ArtistaService {

    private final ArtistaRepository artistaRepository;

    @Autowired
    public ArtistaService(ArtistaRepository artistaRepository) {
        this.artistaRepository = artistaRepository;
    }

    public ArtistaResponseDTO criarArtista(ArtistaRequestDTO dto) {
        Artista novoArtista = new Artista();
        novoArtista.setNome(dto.getNomeArtista());
        novoArtista.setCpf(dto.getCpfArtista());
        novoArtista.setCnpj(dto.getCnpjArtista());
        novoArtista.setTelefone(dto.getTelefoneArtista());
        novoArtista.setNomeEmpresa(dto.getNomeEmpresa());

        Artista artistaSalvo = artistaRepository.save(novoArtista);
        return new ArtistaResponseDTO(artistaSalvo);
    }

    public List<ArtistaResponseDTO> listarTodosOsArtistas() {
        return artistaRepository.findAll()
                .stream()
                .map(ArtistaResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ArtistaResponseDTO> buscarArtistaPorId(Long id) {
        return artistaRepository.findById(id)
                .map(ArtistaResponseDTO::new);
    }

    public ArtistaResponseDTO atualizarArtista(Long id, ArtistaRequestDTO dto) {
        return artistaRepository.findById(id)
            .map(artistaExistente -> {
                artistaExistente.setNome(dto.getNomeArtista());
                artistaExistente.setCpf(dto.getCpfArtista());
                artistaExistente.setCnpj(dto.getCnpjArtista());
                artistaExistente.setTelefone(dto.getTelefoneArtista());
                artistaExistente.setNomeEmpresa(dto.getNomeEmpresa());
                
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