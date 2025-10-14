package br.com.valedasartes.domain.cliente.dto;

import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.endereco.Endereco;

public class ClienteResponseDTO {
    private final Long id;
    private final String nome;
    private final String cpf;
    private final String telefone;
    private final String email;
    private final String enderecoCompleto;

    public ClienteResponseDTO(Cliente cliente) {
        this.id = cliente.getId();
        this.nome = cliente.getNome();
        this.cpf = cliente.getCpf();
        this.telefone = cliente.getTelefone();

        if (cliente.getCredencial() != null) {
            this.email = cliente.getCredencial().getEmail();
        } else {
            this.email = null;
        }

        if (cliente.getEndereco() != null) {
            this.enderecoCompleto = formatarEndereco(cliente.getEndereco());
        } else {
            this.enderecoCompleto = null;
        }
    }

    private String formatarEndereco(Endereco endereco) {
        return String.format("%s, %d - %s, %s/%s - CEP: %s",
            endereco.getLogradouro(),
            endereco.getNumero(),
            endereco.getBairro(),
            endereco.getCidade(),
            endereco.getEstado(),
            endereco.getCep());
    }

    
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public String getEnderecoCompleto() { return enderecoCompleto; }
}