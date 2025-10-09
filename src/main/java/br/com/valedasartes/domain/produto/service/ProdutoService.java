package br.com.valedasartes.domain.produto.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, ArtistaRepository artistaRepository) {
        this.produtoRepository = produtoRepository;
        this.artistaRepository = artistaRepository;
    }

    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto) {
        Artista artista = artistaRepository.findById(dto.getArtistaId())
                .orElseThrow(() -> new RuntimeException("Artista não encontrado!"));
        
        Produto novoProduto = new Produto();
        novoProduto.setNome(dto.getNome());
        novoProduto.setDescricao(dto.getDescricao());
        novoProduto.setPreco(dto.getPreco());
        novoProduto.setCategoria(dto.getCategoria());
        novoProduto.setArtista(artista);

        Produto produtoSalvo = produtoRepository.save(novoProduto);
        return new ProdutoResponseDTO(produtoSalvo);
    }

    // MÉTODO ATUALIZADO: Agora só retorna produtos ativos
    public List<ProdutoResponseDTO> listarTodosOsProdutos() {
        return produtoRepository.findAll()
                .stream()
                .filter(Produto::isAtivo) // Filtra para pegar apenas produtos com 'ativo = true'
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ProdutoResponseDTO> buscarProdutoPorId(Long id) {
        // Retorna o produto mesmo que esteja inativo, para que possa ser consultado individualmente
        return produtoRepository.findById(id)
                .map(ProdutoResponseDTO::new);
    }

    public ProdutoResponseDTO atualizarProduto(Long id, ProdutoRequestDTO dto) {
        return produtoRepository.findById(id)
            .map(produtoExistente -> {
                Artista artista = artistaRepository.findById(dto.getArtistaId())
                    .orElseThrow(() -> new RuntimeException("Artista não encontrado!"));

                produtoExistente.setNome(dto.getNome());
                produtoExistente.setDescricao(dto.getDescricao());
                produtoExistente.setPreco(dto.getPreco());
                produtoExistente.setCategoria(dto.getCategoria());
                produtoExistente.setArtista(artista);
                
                Produto produtoAtualizado = produtoRepository.save(produtoExistente);
                return new ProdutoResponseDTO(produtoAtualizado);
            }).orElse(null);
    }

    // MÉTODO ATUALIZADO: Agora inativa o produto em vez de deletar
    public void deletarProduto(Long id) {
        produtoRepository.findById(id).ifPresent(produto -> {
            produto.setAtivo(false);
            produtoRepository.save(produto);
        });
    }
}