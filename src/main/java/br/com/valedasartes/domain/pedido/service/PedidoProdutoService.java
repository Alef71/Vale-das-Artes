package br.com.valedasartes.domain.pedido.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.pedido.PedidoProduto;
import br.com.valedasartes.domain.pedido.repository.PedidoProdutoRepository;

@Service
public class PedidoProdutoService {

    private final PedidoProdutoRepository pedidoProdutoRepository;

    @Autowired
    public PedidoProdutoService(PedidoProdutoRepository pedidoProdutoRepository) {
        this.pedidoProdutoRepository = pedidoProdutoRepository;
    }

    public PedidoProduto criarItemPedido(PedidoProduto item) {
        return pedidoProdutoRepository.save(item);
    }

    public List<PedidoProduto> listarTodosItens() {
        return pedidoProdutoRepository.findAll();
    }

    public Optional<PedidoProduto> buscarItemPorId(Long id) {
        return pedidoProdutoRepository.findById(id);
    }

    public PedidoProduto atualizarItemPedido(Long id, PedidoProduto itemAtualizado) {
        return pedidoProdutoRepository.findById(id)
            .map(itemExistente -> {
                itemExistente.setQuantidade(itemAtualizado.getQuantidade());
                return pedidoProdutoRepository.save(itemExistente);
            }).orElse(null);
    }

    public void deletarItemPedido(Long id) {
        pedidoProdutoRepository.deleteById(id);
    }
}