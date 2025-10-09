package br.com.valedasartes.domain.artista.dto;

import org.hibernate.validator.constraints.br.CNPJ;
import org.hibernate.validator.constraints.br.CPF;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ArtistaRequestDTO {

    @NotBlank(message = "O nome do artista é obrigatório.")
    @Size(min = 3, max = 100, message = "O nome do artista deve ter entre 3 e 100 caracteres.")
    private String nomeArtista;

    @NotBlank(message = "O CPF do artista é obrigatório.")
    @CPF(message = "O CPF informado é inválido.") // Validação específica para CPF brasileiro
    private String cpfArtista;

    @CNPJ(message = "O CNPJ informado é inválido.") // Valida o CNPJ apenas se ele for preenchido
    private String cnpjArtista; // Não é obrigatório

    @NotBlank(message = "O telefone do artista é obrigatório.")
    private String telefoneArtista;

    private String nomeEmpresa; // Opcional

    // Getters e Setters
    public String getNomeArtista() {
        return nomeArtista;
    }
    public void setNomeArtista(String nomeArtista) {
        this.nomeArtista = nomeArtista;
    }
    public String getCpfArtista() {
        return cpfArtista;
    }
    public void setCpfArtista(String cpfArtista) {
        this.cpfArtista = cpfArtista;
    }
    public String getCnpjArtista() {
        return cnpjArtista;
    }
    public void setCnpjArtista(String cnpjArtista) {
        this.cnpjArtista = cnpjArtista;
    }
    public String getTelefoneArtista() {
        return telefoneArtista;
    }
    public void setTelefoneArtista(String telefoneArtista) {
        this.telefoneArtista = telefoneArtista;
    }
    public String getNomeEmpresa() {
        return nomeEmpresa;
    }
    public void setNomeEmpresa(String nomeEmpresa) {
        this.nomeEmpresa = nomeEmpresa;
    }
}