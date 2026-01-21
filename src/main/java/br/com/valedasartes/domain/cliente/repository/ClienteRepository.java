package br.com.valedasartes.domain.cliente.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.cliente.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    Optional<Cliente> findByCpfAndTelefone(String cpf, String telefone);

    Optional<Cliente> findByTelefone(String telefone);

    // ✅ MÉTODO QUE ESTAVA FALTANDO
    Optional<Cliente> findByCpf(String cpf);
}