package br.com.valedasartes.domain.endereco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class EnderecoRequestDTO {

    @NotBlank(message = "O logradouro é obrigatório.")
    private String logradouro;

    private String complemento; // Complemento é opcional

    @NotBlank(message = "O telefone de contato do endereço é obrigatório.")
    private String telefone;

    @NotNull(message = "O número é obrigatório.")
    @Positive(message = "O número deve ser positivo.")
    private Integer numero;

    @NotBlank(message = "O bairro é obrigatório.")
    private String bairro;

    @NotBlank(message = "A cidade é obrigatória.")
    private String cidade;

    @NotBlank(message = "O estado é obrigatório.")
    @Size(min = 2, max = 2, message = "O estado deve ter 2 caracteres (ex: SP).")
    private String estado;

    @NotBlank(message = "O CEP é obrigatório.")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "O CEP informado é inválido.") // Valida formatos como 12345-678 ou 12345678
    private String cep;

    // Getters e Setters
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
}