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
import br.com.valedasartes.domain.artista.id.ArtistId;
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
     * Busca produtos para a vitrine (Home).
     */
    public List<ProdutoResponseDTO> listarProdutosVitrine(String categoria) {
        List<Produto> produtos;

        if (categoria != null && !categoria.trim().isEmpty()) {
            produtos = produtoRepository.findTop20ByCategoriaIgnoreCaseAndAtivoTrueOrderByIdDesc(categoria);
        } else {
            produtos = produtoRepository.findTop20ByAtivoTrueOrderByIdDesc();
        }

        return produtos.stream()
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto, MultipartFile foto, String artistaId) {
        
        // 1. Converter String para o Objeto de Valor (ArtistId)
        ArtistId idArtista = ArtistId.from(artistaId);

        // 2. Buscar a entidade Artista completa
        Artista artista = artistaRepository.findById(idArtista)
                .orElseThrow(() -> new RuntimeException("Artista não encontrado! ID: " + artistaId));
        
        // 3. Upload da foto
        String fotoUrl = null;
        if (foto != null && !foto.isEmpty()) {
            String nomeArquivo = fileStorageService.salvarArquivo(foto);
            fotoUrl = fileStorageService.getUrlCompleta(nomeArquivo);
        }

        // 4. Montar o Produto
        Produto novoProduto = new Produto();
        novoProduto.setNome(dto.getNome());
        novoProduto.setDescricao(dto.getDescricao());
        novoProduto.setPreco(dto.getPreco());
        novoProduto.setCategoria(dto.getCategoria());
        novoProduto.setArtista(artista); // Associa a entidade Artista
        novoProduto.setFotoUrl(fotoUrl);
        novoProduto.setAtivo(true);

        Produto produtoSalvo = produtoRepository.save(novoProduto);
        return new ProdutoResponseDTO(produtoSalvo);
    }

    public List<ProdutoResponseDTO> listarProdutosPorArtistaId(String artistaId) {
        // Converter para garantir a busca correta no banco
        ArtistId idBusca = ArtistId.from(artistaId);

        // Usa o método otimizado do Repositório (criado no passo anterior)
        return produtoRepository.findByArtistaId(idBusca).stream()
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ProdutoResponseDTO> buscarProdutoPorId(Long id) {
        return produtoRepository.findById(id)
                .map(ProdutoResponseDTO::new);
    }

    @Transactional
    public ProdutoResponseDTO atualizarProduto(Long id, ProdutoRequestDTO dto, String artistaId) {
        
        ArtistId idSolicitante = ArtistId.from(artistaId);

        return produtoRepository.findById(id)
            .map(produtoExistente -> {
                // Validação de segurança: Verifica se o ID do artista dono do produto é igual ao ID de quem está logado
                if (!produtoExistente.getArtista().getId().equals(idSolicitante)) {
                    throw new RuntimeException("Acesso negado: Este produto não pertence a você.");
                }

                produtoExistente.setNome(dto.getNome());
                produtoExistente.setDescricao(dto.getDescricao());
                produtoExistente.setPreco(dto.getPreco());
                produtoExistente.setCategoria(dto.getCategoria());
                
                Produto produtoAtualizado = produtoRepository.save(produtoExistente);
                return new ProdutoResponseDTO(produtoAtualizado);
            }).orElse(null);
    }

    @Transactional
    public ProdutoResponseDTO toggleProdutoAtivo(Long id, String artistaId) {
        
        ArtistId idSolicitante = ArtistId.from(artistaId);

        return produtoRepository.findById(id)
            .map(produtoExistente -> {
                // Validação de segurança
                if (!produtoExistente.getArtista().getId().equals(idSolicitante)) {
                    throw new RuntimeException("Acesso negado: Você não pode alterar produtos de outro artista.");
                }

                boolean novoStatus = !produtoExistente.isAtivo();
                produtoExistente.setAtivo(novoStatus);
                
                Produto produtoAtualizado = produtoRepository.save(produtoExistente);
                return new ProdutoResponseDTO(produtoAtualizado);
            }).orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
    }
    
    public void deletarProduto(Long id) {
        produtoRepository.deleteById(id);
    }

    public List<ProdutoResponseDTO> listarTodosOsProdutosAtivos() {
        return produtoRepository.findAll()
                .stream()
                .filter(Produto::isAtivo)
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }
}