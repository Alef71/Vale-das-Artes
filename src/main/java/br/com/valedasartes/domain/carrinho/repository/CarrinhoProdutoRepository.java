package br.com.valedasartes.domain.carrinho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.carrinho.CarrinhoProduto;

@Repository
public interface CarrinhoProdutoRepository extends JpaRepository<CarrinhoProduto, Long> {
}