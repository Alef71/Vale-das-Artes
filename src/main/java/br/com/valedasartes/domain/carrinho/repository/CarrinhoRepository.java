package br.com.valedasartes.domain.carrinho.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.carrinho.Carrinho; // Importe isto
import br.com.valedasartes.domain.carrinho.Carrinho.CarrinhoStatus; // Importe isto

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

    /**
     * NOVO MÉTODO:
     * Busca um carrinho por ID do Cliente e pelo Status do Carrinho.
     * Usado para encontrar o carrinho ATIVO de um cliente.
     */
    Optional<Carrinho> findByClienteIdAndStatus(Long clienteId, CarrinhoStatus status);

}