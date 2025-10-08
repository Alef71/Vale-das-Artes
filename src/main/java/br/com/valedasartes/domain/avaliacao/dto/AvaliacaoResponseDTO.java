package br.com.valedasartes.domain.avaliacao.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import br.com.valedasartes.domain.avaliacao.Avaliacao;

public class AvaliacaoResponseDTO {

    private final Long id;
    private final BigDecimal nota;
    private final String comentario;
    private final LocalDateTime dataAvaliacao;
    private final String nomeProduto;
    private final String nomeCliente;

    public AvaliacaoResponseDTO(Avaliacao avaliacao) {
        this.id = avaliacao.getId();
        this.nota = avaliacao.getNota();
        this.comentario = avaliacao.getComentario();
        this.dataAvaliacao = avaliacao.getDataAvaliacao();

        if (avaliacao.getProduto() != null) {
            this.nomeProduto = avaliacao.getProduto().getNome();
        } else {
            this.nomeProduto = null;
        }

        if (avaliacao.getCliente() != null) {
            this.nomeCliente = avaliacao.getCliente().getNome();
        } else {
            this.nomeCliente = null;
        }
    }

    public Long getId() { return id; }
    public BigDecimal getNota() { return nota; }
    public String getComentario() { return comentario; }
    public LocalDateTime getDataAvaliacao() { return dataAvaliacao; }
    public String getNomeProduto() { return nomeProduto; }
    public String getNomeCliente() { return nomeCliente; }
}