package br.com.valedasartes.domain.administrador.dto;

import br.com.valedasartes.domain.endereco.dto.EnderecoRequestDTO;
import br.com.valedasartes.domain.security.dto.CredencialRequestDTO;

public class AdministradorRequestDTO {

    private String nome;
    private String cpf;
    private String telefone;

    private EnderecoRequestDTO endereco;
    private CredencialRequestDTO credencial;

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