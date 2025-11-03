package br.com.valedasartes.domain.cliente.dto;

import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.endereco.Endereco;

public class ClienteResponseDTO {
    private final Long id;
    private final String nome;
    private final String cpf;
    private final String telefone;
    private final String fotoUrl;
    private final CredencialDTO credencial;
    private final Endereco endereco;

    public ClienteResponseDTO(Cliente cliente) {
        this.id = cliente.getId();
        this.nome = cliente.getNome();
        this.cpf = cliente.getCpf();
        this.telefone = cliente.getTelefone();
        this.fotoUrl = cliente.getFotoUrl();
        this.endereco = cliente.getEndereco();

        if (cliente.getCredencial() != null) {
            this.credencial = new CredencialDTO(cliente.getCredencial().getEmail());
        } else {
            this.credencial = null;
        }
    }
    
    public static class CredencialDTO {
        private final String email;
        public CredencialDTO(String email) { this.email = email; }
        public String getEmail() { return email; }
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getTelefone() { return telefone; }
    public String getFotoUrl() { return fotoUrl; }
    public CredencialDTO getCredencial() { return credencial; }
    public Endereco getEndereco() { return endereco; }
}