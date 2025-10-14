package br.com.valedasartes.domain.relatorio.dto;

import java.math.BigDecimal;
import java.util.List;

public class RelatorioArtesaoDTO {

    private final BigDecimal totalVendido;
    private final BigDecimal totalComissaoPlataforma;
    private final BigDecimal totalAReceber;
    private final List<RelatorioVendaItemDTO> vendas;

    public RelatorioArtesaoDTO(List<RelatorioVendaItemDTO> vendas) {
        this.vendas = vendas;
        this.totalVendido = vendas.stream()
                .map(RelatorioVendaItemDTO::getValorTotalVendido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalComissaoPlataforma = vendas.stream()
                .map(RelatorioVendaItemDTO::getValorComissao)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalAReceber = vendas.stream()
                .map(RelatorioVendaItemDTO::getValorRepasse)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    
    public BigDecimal getTotalVendido() { return totalVendido; }
    public BigDecimal getTotalComissaoPlataforma() { return totalComissaoPlataforma; }
    public BigDecimal getTotalAReceber() { return totalAReceber; }
    public List<RelatorioVendaItemDTO> getVendas() { return vendas; }
}
