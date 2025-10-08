package br.com.valedasartes.domain.artista.dto;

import br.com.valedasartes.domain.artista.Artista;

public class ArtistaResponseDTO {

    private final Long id;
    private final String nomeArtista;
    private final String cpfArtista;
    private final String cnpjArtista;
    private final String telefoneArtista;
    private final String nomeEmpresa;

    public ArtistaResponseDTO(Artista artista) {
        this.id = artista.getId();
        this.nomeArtista = artista.getNome();
        this.cpfArtista = artista.getCpf();
        this.cnpjArtista = artista.getCnpj();
        this.telefoneArtista = artista.getTelefone();
        this.nomeEmpresa = artista.getNomeEmpresa();
    }

    public Long getId() { return id; }
    public String getNomeArtista() { return nomeArtista; }
    public String getCpfArtista() { return cpfArtista; }
    public String getCnpjArtista() { return cnpjArtista; }
    public String getTelefoneArtista() { return telefoneArtista; }
    public String getNomeEmpresa() { return nomeEmpresa; }
}