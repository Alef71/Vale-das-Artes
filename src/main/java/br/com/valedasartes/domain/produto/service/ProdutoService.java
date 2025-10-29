package br.com.valedasartes.domain.produto.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile; // <-- 1. IMPORTAR

import br.com.valedasartes.config.FileStorageService;
import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.repository.ArtistaRepository; // <-- 2. IMPORTAR
import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.produto.dto.ProdutoRequestDTO;
import br.com.valedasartes.domain.produto.dto.ProdutoResponseDTO;
import br.com.valedasartes.domain.produto.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ArtistaRepository artistaRepository;
    private final FileStorageService fileStorageService; // <-- 3. INJETAR

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, 
                          ArtistaRepository artistaRepository,
                          FileStorageService fileStorageService) { // <-- 4. ATUALIZAR CONSTRUTOR
        this.produtoRepository = produtoRepository;
        this.artistaRepository = artistaRepository;
        this.fileStorageService = fileStorageService;
    }

    // --- 5. AQUI ESTÁ A CORREÇÃO ---
    // A assinatura do método agora aceita os 3 argumentos
    @Transactional
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto, MultipartFile foto, Long artistaId) {
        
        Artista artista = artistaRepository.findById(artistaId)
                .orElseThrow(() -> new RuntimeException("Artista não encontrado!"));
        
        // Salva a foto no disco
        String nomeArquivo = fileStorageService.salvarArquivo(foto);
        
        // Gera a URL completa
        String fotoUrl = fileStorageService.getUrlCompleta(nomeArquivo);

        Produto novoProduto = new Produto();
        novoProduto.setNome(dto.getNome());
        novoProduto.setDescricao(dto.getDescricao());
        novoProduto.setPreco(dto.getPreco());
        novoProduto.setCategoria(dto.getCategoria());
        novoProduto.setArtista(artista);
        novoProduto.setFotoUrl(fotoUrl); // Salva a URL da foto
        novoProduto.setAtivo(true);

        Produto produtoSalvo = produtoRepository.save(novoProduto);
        return new ProdutoResponseDTO(produtoSalvo);
    }

    public List<ProdutoResponseDTO> listarTodosOsProdutos() {
        return produtoRepository.findAll()
                .stream()
                .filter(Produto::isAtivo) 
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ProdutoResponseDTO> buscarProdutoPorId(Long id) {
        return produtoRepository.findById(id)
                .map(ProdutoResponseDTO::new);
    }

    // ATUALIZAR 'atualizarProduto' (para não depender do artistaId no DTO)
    @Transactional
    public ProdutoResponseDTO atualizarProduto(Long id, ProdutoRequestDTO dto, Long artistaId) {
        return produtoRepository.findById(id)
            .map(produtoExistente -> {
                
                // Verifica se o produto pertence ao artista logado
                if (!produtoExistente.getArtista().getId().equals(artistaId)) {
                    throw new RuntimeException("Acesso negado: Este produto não pertence ao artista logado.");
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
        produtoRepository.findById(id).ifPresent(produto -> {
            produto.setAtivo(false);
            produtoRepository.save(produto);
        });
    }
}