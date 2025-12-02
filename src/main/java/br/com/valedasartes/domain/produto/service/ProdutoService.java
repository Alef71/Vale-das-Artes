package br.com.valedasartes.domain.produto.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.config.FileStorageService; 
import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.repository.ArtistaRepository;
import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.produto.dto.ProdutoRequestDTO;
import br.com.valedasartes.domain.produto.dto.ProdutoResponseDTO;
import br.com.valedasartes.domain.produto.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ArtistaRepository artistaRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, 
                          ArtistaRepository artistaRepository,
                          FileStorageService fileStorageService) {
        this.produtoRepository = produtoRepository;
        this.artistaRepository = artistaRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto, MultipartFile foto, Long artistaId) {
        // ... (código existente, tudo igual) ...
        Artista artista = artistaRepository.findById(artistaId)
                .orElseThrow(() -> new RuntimeException("Artista não encontrado!"));
        
        String nomeArquivo = fileStorageService.salvarArquivo(foto);
        String fotoUrl = fileStorageService.getUrlCompleta(nomeArquivo);

        Produto novoProduto = new Produto();
        novoProduto.setNome(dto.getNome());
        novoProduto.setDescricao(dto.getDescricao());
        novoProduto.setPreco(dto.getPreco());
        novoProduto.setCategoria(dto.getCategoria());
        novoProduto.setArtista(artista);
        novoProduto.setFotoUrl(fotoUrl);
        novoProduto.setAtivo(true); 

        Produto produtoSalvo = produtoRepository.save(novoProduto);
        return new ProdutoResponseDTO(produtoSalvo);
    }

    /**
     * Lista TODOS os produtos (ativos e inativos) de UM artista.
     * (Usado no /dashboard-artesao)
     */
    public List<ProdutoResponseDTO> listarProdutosPorArtistaId(Long artistaId) {
        return produtoRepository.findAll()
                .stream()
                .filter(produto -> produto.getArtista() != null && produto.getArtista().getId().equals(artistaId)) 
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ProdutoResponseDTO> buscarProdutoPorId(Long id) {
        return produtoRepository.findById(id)
                .map(ProdutoResponseDTO::new);
    }

    @Transactional
    public ProdutoResponseDTO atualizarProduto(Long id, ProdutoRequestDTO dto, Long artistaId) {
        // ... (código existente, tudo igual) ...
        return produtoRepository.findById(id)
            .map(produtoExistente -> {
                if (!produtoExistente.getArtista().getId().equals(artistaId)) {
                    throw new RuntimeException("Acesso negado...");
                }
                produtoExistente.setNome(dto.getNome());
                produtoExistente.setDescricao(dto.getDescricao());
                produtoExistente.setPreco(dto.getPreco());
                produtoExistente.setCategoria(dto.getCategoria());
                
                Produto produtoAtualizado = produtoRepository.save(produtoExistente);
                return new ProdutoResponseDTO(produtoAtualizado);
            }).orElse(null);
    }

    public void deletarProduto(Long id) {
        // ... (código existente, tudo igual) ...
    }

    @Transactional
    public ProdutoResponseDTO toggleProdutoAtivo(Long id, Long artistaId) {
        // ... (código existente, tudo igual) ...
        return produtoRepository.findById(id)
            .map(produtoExistente -> {
                if (!produtoExistente.getArtista().getId().equals(artistaId)) {
                    throw new RuntimeException("Acesso negado...");
                }
                boolean novoStatus = !produtoExistente.isAtivo(); 
                produtoExistente.setAtivo(novoStatus);
                Produto produtoAtualizado = produtoRepository.save(produtoExistente);
                return new ProdutoResponseDTO(produtoAtualizado);
            }).orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
    }
    
    // --- 1. MÉTODO NOVO ADICIONADO AQUI ---
    /**
     * Lista TODOS os produtos ATIVOS de TODOS os artistas.
     * (Usado na /index.html)
     */
    public List<ProdutoResponseDTO> listarTodosOsProdutosAtivos() {
        return produtoRepository.findAll()
                .stream()
                .filter(Produto::isAtivo) // <-- A MÁGICA ACONTECE AQUI
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }
}