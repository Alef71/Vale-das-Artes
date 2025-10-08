package br.com.valedasartes.domain.endereco.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.endereco.Endereco;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
}