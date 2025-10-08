package br.com.valedasartes.domain.artista.dto;

public class ArtistaRequestDTO {

    private String nomeArtista;
    private String cpfArtista;
    private String cnpjArtista;
    private String telefoneArtista;
    private String nomeEmpresa;

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