package br.com.valedasartes.domain.artista;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.hibernate.annotations.ColumnDefault;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import br.com.valedasartes.domain.artista.id.ArtistId;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.security.Credencial;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity(name = "Artista")
@Table(name = "artista")
public class Artista {

    @Id
    // @GeneratedValue removido pois o ID é gerado na aplicação (UUID)
    @Column(name = "id_artista")
    private ArtistId id;

    @Column(name = "cpf_artista", nullable = false, unique = true)
    private String cpf;

    @Column(name = "cnpj_artista", unique = true, nullable = true) 
    private String cnpj;

    @Column(name = "telefone_artista", nullable = false)
    private String telefone;

    @Column(name = "nome_artista", nullable = false)
    private String nome;

    @Column(name = "nome_empresa")
    private String nomeEmpresa;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Column(name = "foto_url")
    private String fotoUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false)
    @ColumnDefault("'PENDENTE'")
    private ArtistaStatus statusAprovacao = ArtistaStatus.PENDENTE;

    @JsonManagedReference
    @OneToMany(mappedBy = "artista", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produto> produtos = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "id_credencial", referencedColumnName = "id_credencial", unique = true)
    private Credencial credencial;

    @OneToOne(mappedBy = "artista", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Endereco endereco;

    public Artista() {
        // Gera um UUID novo automaticamente ao instanciar
        this.id = ArtistId.generate();
    }

    public Artista(String cpf, String cnpj, String telefone, String nome, String nomeEmpresa) {
        this.id = ArtistId.generate(); // Garante o ID na criação
        this.cpf = cpf;
        this.cnpj = cnpj;
        this.telefone = telefone;
        this.nome = nome;
        this.nomeEmpresa = nomeEmpresa;
    }
   
    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
        if (endereco != null) {
            endereco.setArtista(this); 
        }
    }

    public Endereco getEndereco() { return endereco; }

    // Getters e Setters atualizados para ArtistId
    public ArtistId getId() { return id; }
    public void setId(ArtistId id) { this.id = id; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getNomeEmpresa() { return nomeEmpresa; }
    public void setNomeEmpresa(String nomeEmpresa) { this.nomeEmpresa = nomeEmpresa; }
    public List<Produto> getProdutos() { return produtos; }
    public void setProdutos(List<Produto> produtos) { this.produtos = produtos; }
    public Credencial getCredencial() { return credencial; }
    public void setCredencial(Credencial credencial) { this.credencial = credencial; }
    public String getBiografia() { return biografia; }
    public void setBiografia(String biografia) { this.biografia = biografia; }
    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    public ArtistaStatus getStatusAprovacao() { return statusAprovacao; }
    public void setStatusAprovacao(ArtistaStatus statusAprovacao) { this.statusAprovacao = statusAprovacao; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Artista artista = (Artista) o;
        return Objects.equals(id, artista.id);
    }
    
    @Override
    public int hashCode() { return Objects.hash(id); }
}