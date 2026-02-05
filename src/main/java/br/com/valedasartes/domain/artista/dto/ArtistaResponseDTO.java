package br.com.valedasartes.domain.artista.dto;

import java.util.List;
import java.util.stream.Collectors;

import br.com.valedasartes.domain.artista.Artista;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.produto.dto.ProdutoResponseDTO;

public class ArtistaResponseDTO {

    private final String id; // Mudou de Long para String
    private final String nome;
    private final String cpf;
    private final String cnpj;
    private final String telefone;
    private final String nomeEmpresa;
    private final String biografia; 
    private final EnderecoDTO endereco; 
    private final CredencialDTO credencial;
    private final List<ProdutoResponseDTO> produtos;
    private final String fotoUrl;

    public ArtistaResponseDTO(Artista artista) {
        // Converte o ArtistId para String para enviar no JSON
        this.id = artista.getId() != null ? artista.getId().toString() : null;
        
        this.nome = artista.getNome();
        this.cpf = artista.getCpf();
        this.cnpj = artista.getCnpj();
        this.telefone = artista.getTelefone();
        this.nomeEmpresa = artista.getNomeEmpresa();
        this.biografia = artista.getBiografia();
        this.fotoUrl = artista.getFotoUrl(); 

        if (artista.getEndereco() != null) {
            this.endereco = new EnderecoDTO(artista.getEndereco());
        } else {
            this.endereco = null;
        }
        
        if (artista.getCredencial() != null) {
            this.credencial = new CredencialDTO(artista.getCredencial().getEmail());
        } else {
            this.credencial = null;
        }

        if (artista.getProdutos() != null) {
            this.produtos = artista.getProdutos().stream()
                    .filter(Produto::isAtivo)
                    .map(ProdutoResponseDTO::new)
                    .collect(Collectors.toList());
        } else {
            this.produtos = List.of(); 
        }
    }

    public static class CredencialDTO {
        private final String email;
        public CredencialDTO(String email) { this.email = email; }
        public String getEmail() { return email; }
    }
    
    public static class EnderecoDTO {
        private final String logradouro;
        private final String numero;
        private final String cidade;
        private final String estado;
        private final String cep;
        
        public EnderecoDTO(Endereco endereco) {
            this.logradouro = endereco.getLogradouro();
            this.numero = String.valueOf(endereco.getNumero()); 
            this.cidade = endereco.getCidade();
            this.estado = endereco.getEstado();
            this.cep = endereco.getCep();
        }
        
        public String getLogradouro() { return logradouro; }
        public String getNumero() { return numero; }
        public String getCidade() { return cidade; }
        public String getEstado() { return estado; }
        public String getCep() { return cep; }
    }

    // Getter atualizado para retornar String
    public String getId() { return id; }
    
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getCnpj() { return cnpj; }
    public String getTelefone() { return telefone; }
    public String getNomeEmpresa() { return nomeEmpresa; }
    public String getBiografia() { return biografia; }
    public EnderecoDTO getEndereco() { return endereco; }
    public CredencialDTO getCredencial() { return credencial; }
    public List<ProdutoResponseDTO> getProdutos() { return produtos; }
    public String getFotoUrl() { return fotoUrl; }
}