package br.com.valedasartes.domain.produto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.artista.id.ArtistId;
import br.com.valedasartes.domain.produto.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // 1. Busca os 20 últimos produtos ativos (para a Home geral)
    List<Produto> findTop20ByAtivoTrueOrderByIdDesc();

    // 2. O MÉTODO QUE ESTAVA FALTANDO:
    // Busca os 20 últimos produtos de uma categoria específica, ignorando maiúsculas/minúsculas
    List<Produto> findTop20ByCategoriaIgnoreCaseAndAtivoTrueOrderByIdDesc(String categoria);

    // 3. Busca todos os produtos de um artista usando o Objeto de Valor (ArtistId)
    // Isso é usado no painel do artesão
    List<Produto> findByArtistaId(ArtistId artistaId);
    
    // Opcional: Se precisar buscar apenas os ativos de uma categoria sem limite
    List<Produto> findByCategoriaAndAtivoTrue(String categoria);
    
    // Opcional: Se precisar buscar apenas os ativos gerais sem limite
    List<Produto> findByAtivoTrue();
}