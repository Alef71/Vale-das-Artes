package br.com.valedasartes.domain.carrinho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.carrinho.CarrinhoProduto;
import br.com.valedasartes.domain.carrinho.repository.CarrinhoProdutoRepository;

@Service
public class CarrinhoProdutoService {

    private final CarrinhoProdutoRepository carrinhoProdutoRepository;

    @Autowired
    public CarrinhoProdutoService(CarrinhoProdutoRepository carrinhoProdutoRepository) {
        this.carrinhoProdutoRepository = carrinhoProdutoRepository;
    }

    public CarrinhoProduto criarItem(CarrinhoProduto item) {
        return carrinhoProdutoRepository.save(item);
    }

    public List<CarrinhoProduto> listarTodosItens() {
        return carrinhoProdutoRepository.findAll();
    }

    public Optional<CarrinhoProduto> buscarItemPorId(Long id) {
        return carrinhoProdutoRepository.findById(id);
    }

    public CarrinhoProduto atualizarItem(Long id, CarrinhoProduto itemAtualizado) {
        return carrinhoProdutoRepository.findById(id)
            .map(itemExistente -> {
                itemExistente.setQuantidade(itemAtualizado.getQuantidade());
                return carrinhoProdutoRepository.save(itemExistente);
            }).orElse(null);
    }

    public void deletarItem(Long id) {
        carrinhoProdutoRepository.deleteById(id);
    }
}