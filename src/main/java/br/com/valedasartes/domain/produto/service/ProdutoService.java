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

    /**
     * NOVO MÉTODO: Busca produtos para a vitrine (Home).
     * Regras: Apenas ativos, Máximo 20 itens, Ordenados pelo mais recente (ID).
     * Se passar categoria, filtra por ela.
     */
    public List<ProdutoResponseDTO> listarProdutosVitrine(String categoria) {
        List<Produto> produtos;

        // Se a categoria foi informada e não está vazia (ex: "CERAMICA")
        if (categoria != null && !categoria.trim().isEmpty()) {
            produtos = produtoRepository.findTop20ByCategoriaIgnoreCaseAndAtivoTrueOrderByIdDesc(categoria);
        } else {
            // Se não tem categoria, traz os 20 mais recentes gerais
            produtos = produtoRepository.findTop20ByAtivoTrueOrderByIdDesc();
        }

        return produtos.stream()
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto, MultipartFile foto, Long artistaId) {
        
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
        // Implementar lógica de deleção se necessário
    }

    @Transactional
    public ProdutoResponseDTO toggleProdutoAtivo(Long id, Long artistaId) {
        
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
    
    public List<ProdutoResponseDTO> listarTodosOsProdutosAtivos() {
        return produtoRepository.findAll()
                .stream()
                .filter(Produto::isAtivo) 
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }
}