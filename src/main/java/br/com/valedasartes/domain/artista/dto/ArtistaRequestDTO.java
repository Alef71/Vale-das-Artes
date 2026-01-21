package br.com.valedasartes.domain.artista.dto;

import org.hibernate.validator.constraints.br.CNPJ;
import org.hibernate.validator.constraints.br.CPF;

import br.com.valedasartes.domain.endereco.dto.EnderecoRequestDTO;
import br.com.valedasartes.domain.security.dto.CredencialRequestDTO;
import jakarta.validation.Valid; 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ArtistaRequestDTO {

    @NotBlank(message = "O nome é obrigatório.")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres.")
    private String nome;

    @NotBlank(message = "O CPF é obrigatório.")
    @CPF(message = "O CPF informado é inválido.") 
    private String cpf;

    @CNPJ(message = "O CNPJ informado é inválido.") 
    private String cnpj; 

    @NotBlank(message = "O telefone é obrigatório.")
    private String telefone;

    private String nomeEmpresa; 
    
    @Valid 
    private CredencialRequestDTO credencial;
    
    @Valid 
    private EnderecoRequestDTO endereco;
    
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    
    public String getNomeEmpresa() { return nomeEmpresa; }
    public void setNomeEmpresa(String nomeEmpresa) { this.nomeEmpresa = nomeEmpresa; }
    
    public CredencialRequestDTO getCredencial() { return credencial; }
    public void setCredencial(CredencialRequestDTO credencial) { this.credencial = credencial; }
    
    public EnderecoRequestDTO getEndereco() { return endereco; }
    public void setEndereco(EnderecoRequestDTO endereco) { this.endereco = endereco; }
}