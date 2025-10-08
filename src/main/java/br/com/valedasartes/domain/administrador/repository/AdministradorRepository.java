package br.com.valedasartes.domain.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.administrador.Administrador;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
}