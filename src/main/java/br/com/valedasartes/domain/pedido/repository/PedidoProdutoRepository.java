package br.com.valedasartes.domain.pedido.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.pedido.PedidoProduto;

@Repository
public interface PedidoProdutoRepository extends JpaRepository<PedidoProduto, Long> {

    List<PedidoProduto> findByProdutoArtistaId(Long artistaId);
}