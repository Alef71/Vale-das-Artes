package br.com.valedasartes.domain.relatorio.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.artista.id.ArtistId; // Importar ArtistId
import br.com.valedasartes.domain.pedido.PedidoProduto;
import br.com.valedasartes.domain.pedido.repository.PedidoProdutoRepository;
import br.com.valedasartes.domain.relatorio.dto.RelatorioArtesaoDTO;
import br.com.valedasartes.domain.relatorio.dto.RelatorioVendaItemDTO;

@Service
public class RelatorioService {

    private final PedidoProdutoRepository pedidoProdutoRepository;

    @Autowired
    public RelatorioService(PedidoProdutoRepository pedidoProdutoRepository) {
        this.pedidoProdutoRepository = pedidoProdutoRepository;
    }

    // Alterado: Recebe String, converte para ArtistId
    public RelatorioArtesaoDTO gerarRelatorioParaArtesao(String artistaId) {
        
        // Conversão de String para o objeto de valor ArtistId
        ArtistId id = ArtistId.from(artistaId);

        // Passa o objeto correto para o repositório
        List<PedidoProduto> vendasDoArtesao = pedidoProdutoRepository.findByProdutoArtistaId(id);

        List<RelatorioVendaItemDTO> itensVendidosDTO = vendasDoArtesao.stream()
                .map(RelatorioVendaItemDTO::new)
                .collect(Collectors.toList());

        return new RelatorioArtesaoDTO(itensVendidosDTO);
    }
}