package br.com.valedasartes.domain.administrador.dto;

import org.hibernate.validator.constraints.br.CPF;

import br.com.valedasartes.domain.endereco.dto.EnderecoRequestDTO;
import br.com.valedasartes.domain.security.dto.CredencialRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdministradorRequestDTO {

    @NotBlank(message = "O nome do administrador é obrigatório.")
    @Size(min = 3, max = 100, message = "O nome do administrador deve ter entre 3 e 100 caracteres.")
    private String nome;

    @NotBlank(message = "O CPF do administrador é obrigatório.")
    @CPF(message = "O CPF informado é inválido.")
    private String cpf;

    @NotBlank(message = "O telefone do administrador é obrigatório.")
    private String telefone;

    @NotNull(message = "O endereço é obrigatório.")
    @Valid // Ativa a validação para os campos dentro de EnderecoRequestDTO
    private EnderecoRequestDTO endereco;

    @NotNull(message = "As credenciais são obrigatórias.")
    @Valid // Ativa a validação para os campos dentro de CredencialRequestDTO
    private CredencialRequestDTO credencial;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public EnderecoRequestDTO getEndereco() { return endereco; }
    public void setEndereco(EnderecoRequestDTO endereco) { this.endereco = endereco; }
    public CredencialRequestDTO getCredencial() { return credencial; }
    public void setCredencial(CredencialRequestDTO credencial) { this.credencial = credencial; }
}