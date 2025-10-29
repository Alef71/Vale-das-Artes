package br.com.valedasartes.domain.artista.repository;

import java.util.Optional; // <-- 1. IMPORTAR OPTIONAL

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- 2. IMPORTAR @Query
import org.springframework.data.repository.query.Param; // <-- 3. IMPORTAR @Param
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.artista.Artista;

@Repository
public interface ArtistaRepository extends JpaRepository<Artista, Long> {

    /**
     * Busca um Artista pelo ID, carregando (JOIN FETCH) suas 
     * relações LAZY (credencial, endereco, produtos).
     * Isso garante que o ArtistaResponseDTO terá todos os dados.
     */
    @Query("SELECT a FROM Artista a " +
           "LEFT JOIN FETCH a.credencial " +
           "LEFT JOIN FETCH a.endereco " +
           "LEFT JOIN FETCH a.produtos " + // Traz a lista de produtos
           "WHERE a.id = :id")
    Optional<Artista> findCompletoById(@Param("id") Long id);
}