package br.com.valedasartes.domain.cliente.dto;

import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.endereco.Endereco;

public class ClienteResponseDTO {
    private final Long id;
    private final String nome;
    private final String cpf;
    private final String telefone;
    
    // --- MUDANÇA AQUI ---
    // Trocamos 'email' e 'enderecoCompleto' pelos objetos reais
    // que o nosso formulário JavaScript precisa.
    private final CredencialDTO credencial;
    private final Endereco endereco;

    public ClienteResponseDTO(Cliente cliente) {
        this.id = cliente.getId();
        this.nome = cliente.getNome();
        this.cpf = cliente.getCpf();
        this.telefone = cliente.getTelefone();
        this.endereco = cliente.getEndereco(); // <-- ENVIA O OBJETO INTEIRO

        // Cria um DTO para a credencial (enviando apenas o email)
        if (cliente.getCredencial() != null) {
            this.credencial = new CredencialDTO(cliente.getCredencial().getEmail());
        } else {
            this.credencial = null;
        }
    }
    
    // Sub-classe DTO para enviar apenas o email (mais seguro)
    public static class CredencialDTO {
        private final String email;
        public CredencialDTO(String email) { this.email = email; }
        public String getEmail() { return email; }
    }

    // (O método formatarEndereco() não é mais necessário)

    // --- GETTERS ATUALIZADOS ---
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getTelefone() { return telefone; }
    public CredencialDTO getCredencial() { return credencial; }
    public Endereco getEndereco() { return endereco; }
}