package br.com.valedasartes.domain.relatorio.dto;

import java.math.BigDecimal;

import br.com.valedasartes.domain.pedido.PedidoProduto;

public class RelatorioVendaItemDTO {

    private final Long pedidoId;
    private final String nomeProduto;
    private final int quantidade;
    private final BigDecimal precoVendaUnitario;
    private final BigDecimal valorTotalVendido;
    private final BigDecimal valorComissao;
    private final BigDecimal valorRepasse;

    public RelatorioVendaItemDTO(PedidoProduto item) {
        this.pedidoId = item.getPedido().getId();
        this.nomeProduto = item.getProduto().getNome();
        this.quantidade = item.getQuantidade();
        this.precoVendaUnitario = item.getPrecoUnitarioVenda();
        this.valorTotalVendido = this.precoVendaUnitario.multiply(new BigDecimal(this.quantidade));
        this.valorComissao = item.getValorComissao();
        this.valorRepasse = item.getValorRepasseArtesao();
    }

    public Long getPedidoId() { return pedidoId; }
    public String getNomeProduto() { return nomeProduto; }
    public int getQuantidade() { return quantidade; }
    public BigDecimal getPrecoVendaUnitario() { return precoVendaUnitario; }
    public BigDecimal getValorTotalVendido() { return valorTotalVendido; }
    public BigDecimal getValorComissao() { return valorComissao; }
    public BigDecimal getValorRepasse() { return valorRepasse; }
}
