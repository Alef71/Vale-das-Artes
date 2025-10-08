package br.com.valedasartes.domain.avaliacao.dto;

import java.math.BigDecimal;

public class AvaliacaoRequestDTO {

    private BigDecimal nota;
    private String comentario;
    private Long produtoId;
    private Long clienteId;

    public BigDecimal getNota() {
        return nota;
    }
    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }
    public String getComentario() {
        return comentario;
    }
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
    public Long getProdutoId() {
        return produtoId;
    }
    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }
    public Long getClienteId() {
        return clienteId;
    }
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
}