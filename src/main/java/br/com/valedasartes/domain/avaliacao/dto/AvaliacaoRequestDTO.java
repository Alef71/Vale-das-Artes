package br.com.valedasartes.domain.avaliacao.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AvaliacaoRequestDTO {

    @NotNull(message = "A nota é obrigatória.")
    @DecimalMin(value = "1.0", message = "A nota mínima é 1.0.")
    @DecimalMax(value = "5.0", message = "A nota máxima é 5.0.")
    private BigDecimal nota;

    @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres.")
    private String comentario; 

    @NotNull(message = "O ID do produto é obrigatório.")
    private Long produtoId;

    @NotNull(message = "O ID do cliente é obrigatório.")
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