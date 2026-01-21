package br.com.valedasartes.domain.carrinho.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.carrinho.Carrinho; 
import br.com.valedasartes.domain.carrinho.Carrinho.CarrinhoStatus; 

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

    
    Optional<Carrinho> findByClienteIdAndStatus(Long clienteId, CarrinhoStatus status);

}