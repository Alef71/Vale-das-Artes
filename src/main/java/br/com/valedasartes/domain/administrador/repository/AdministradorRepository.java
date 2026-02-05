package br.com.valedasartes.domain.administrador.repository;

import java.util.Optional; // <--- Importante para evitar erros de nulo

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.administrador.Administrador;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
    
    // O Spring cria o SQL automaticamente baseado neste nome
    Optional<Administrador> findByCpf(String cpf);

}