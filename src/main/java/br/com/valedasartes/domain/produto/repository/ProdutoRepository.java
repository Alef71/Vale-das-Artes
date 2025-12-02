package br.com.valedasartes.domain.produto.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.produto.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}
