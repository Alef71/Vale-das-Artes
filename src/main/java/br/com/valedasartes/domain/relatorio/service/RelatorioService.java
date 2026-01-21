package br.com.valedasartes.domain.relatorio.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public RelatorioArtesaoDTO gerarRelatorioParaArtesao(Long artistaId) {
       
        List<PedidoProduto> vendasDoArtesao = pedidoProdutoRepository.findByProdutoArtistaId(artistaId);

        List<RelatorioVendaItemDTO> itensVendidosDTO = vendasDoArtesao.stream()
                .map(RelatorioVendaItemDTO::new)
                .collect(Collectors.toList());

        return new RelatorioArtesaoDTO(itensVendidosDTO);
    }

    
}
