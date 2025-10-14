package br.com.valedasartes.domain.security.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.security.Credencial;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, Long> {

    /**
     * Novo método para buscar uma credencial pelo seu e-mail.
     * O Spring Data JPA cria a consulta automaticamente a partir do nome do método.
     * @param email O e-mail a ser procurado.
     * @return Um Optional contendo a Credencial, se encontrada.
     */
    Optional<Credencial> findByEmail(String email);
}

