package br.com.valedasartes.domain.artista.dto;

import java.util.List;

import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.produto.Produto;

public class ArtistaResponseDTO {

    private final Long id;
    private final String nome; // Mudei de 'nomeArtista' para 'nome'
    private final String cpf;
    private final String cnpj;
    private final String telefone;
    private final String nomeEmpresa;

    // --- CAMPOS ADICIONADOS ---
    private final Endereco endereco;
    private final CredencialDTO credencial;
    private final List<Produto> produtos;

    public ArtistaResponseDTO(Artista artista) {
        this.id = artista.getId();
        this.nome = artista.getNome();
        this.cpf = artista.getCpf();
        this.cnpj = artista.getCnpj();
        this.telefone = artista.getTelefone();
        this.nomeEmpresa = artista.getNomeEmpresa();
        
        // --- LÓGICA ADICIONADA ---
        this.endereco = artista.getEndereco();
        this.produtos = artista.getProdutos(); // Pega a lista de produtos

        if (artista.getCredencial() != null) {
            this.credencial = new CredencialDTO(artista.getCredencial().getEmail());
        } else {
            this.credencial = null;
        }
    }

    // Sub-classe DTO para enviar apenas o email
    public static class CredencialDTO {
        private final String email;
        public CredencialDTO(String email) { this.email = email; }
        public String getEmail() { return email; }
    }

    // --- GETTERS ATUALIZADOS ---
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getCnpj() { return cnpj; }
    public String getTelefone() { return telefone; }
    public String getNomeEmpresa() { return nomeEmpresa; }
    
    // --- GETTERS NOVOS ---
    public Endereco getEndereco() { return endereco; }
    public CredencialDTO getCredencial() { return credencial; }
    public List<Produto> getProdutos() { return produtos; }
}