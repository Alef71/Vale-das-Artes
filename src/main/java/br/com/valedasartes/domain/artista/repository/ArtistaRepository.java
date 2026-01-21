package br.com.valedasartes.domain.artista.repository;

import java.util.List;
import java.util.Optional; 

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; 
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.artista.ArtistaStatus;

@Repository
public interface ArtistaRepository extends JpaRepository<Artista, Long> {

    /**
     * Busca um Artista pelo ID, carregando (JOIN FETCH) suas 
     * relações LAZY (credencial, endereco, produtos).
     */
    @Query("SELECT a FROM Artista a " +
           "LEFT JOIN FETCH a.credencial " +
           "LEFT JOIN FETCH a.endereco " +
           "LEFT JOIN FETCH a.produtos " + 
           "WHERE a.id = :id")
    Optional<Artista> findCompletoById(@Param("id") Long id);
    
    /**
     * Novo método para buscar artistas pelo status de aprovação.
     * Usado para listar os PENDENTES no painel Admin.
     */
    List<Artista> findByStatusAprovacao(ArtistaStatus status);

    Optional<Artista> findByCpfAndTelefone(String cpf, String telefone);

    Optional<Artista> findByTelefone(String telefone);

    // ✅ MÉTODO QUE ESTAVA FALTANDO
    Optional<Artista> findByCpf(String cpf);
}