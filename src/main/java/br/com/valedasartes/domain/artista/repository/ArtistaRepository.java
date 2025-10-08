package br.com.valedasartes.domain.artista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.artista.Artista;

@Repository
public interface ArtistaRepository extends JpaRepository<Artista, Long> {
}
