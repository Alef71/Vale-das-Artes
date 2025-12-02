package br.com.valedasartes.domain.pedido.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.pedido.Pedido;
@Repository

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

}