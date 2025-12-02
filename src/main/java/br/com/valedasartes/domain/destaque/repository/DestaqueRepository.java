package br.com.valedasartes.domain.destaque.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.destaque.Destaque;

@Repository
public interface DestaqueRepository extends JpaRepository<Destaque, Long> {
}