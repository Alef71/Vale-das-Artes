package br.com.valedasartes.domain.security.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.security.Credencial;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, Long> {
}
