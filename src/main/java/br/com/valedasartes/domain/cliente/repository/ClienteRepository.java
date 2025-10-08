package br.com.valedasartes.domain.cliente.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.cliente.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
