package br.com.valedasartes.domain.security.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; 
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.security.Credencial;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, Long> {

    /**
     * Método atualizado para buscar a credencial E suas associações (roles).
     * Usamos JOIN FETCH para carregar os campos 'cliente', 'artista', 
     * e 'administrador' (que são LAZY) na mesma consulta.
     * Isso resolve o problema de o 'getAuthorities()' não ter dados.
     * * @param email O e-mail (usando o nome do campo na Entidade, 'email')
     * @return Um Optional contendo a Credencial completa.
     */
    @Query("SELECT c FROM Credencial c " +
           "LEFT JOIN FETCH c.cliente " +
           "LEFT JOIN FETCH c.artista " +
           "LEFT JOIN FETCH c.administrador " +
           "WHERE c.email = :email")
    Optional<Credencial> findByEmail(@Param("email") String email);
}