package br.com.valedasartes.domain.produto.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.produto.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    
    public Produto criarProduto(Produto produto) {
        return produtoRepository.save(produto);
    }

    
    public List<Produto> listarTodosOsProdutos() {
        return produtoRepository.findAll();
    }

    
    public Optional<Produto> buscarProdutoPorId(Long id) {
        return produtoRepository.findById(id);
    }

   
    public Produto atualizarProduto(Long id, Produto produtoAtualizado) {

        return produtoRepository.findById(id)
            .map(produtoExistente -> {
                produtoExistente.setNome(produtoAtualizado.getNome());
                produtoExistente.setDescricao(produtoAtualizado.getDescricao());
                produtoExistente.setPreco(produtoAtualizado.getPreco());
                produtoExistente.setCategoria(produtoAtualizado.getCategoria());
                return produtoRepository.save(produtoExistente);
            }).orElse(null);
    }

    public void deletarProduto(Long id) {
        produtoRepository.deleteById(id);
    }
}

