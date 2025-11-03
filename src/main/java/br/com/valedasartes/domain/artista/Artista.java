package br.com.valedasartes.domain.artista;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.security.Credencial;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity(name = "Artista")
@Table(name = "artista")
public class Artista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_artista")
    private Long id;

    @Column(name = "cpf_artista", nullable = false, unique = true)
    private String cpf;

    @Column(name = "cnpj_artista", unique = true)
    private String cnpj;

    @Column(name = "telefone_artista", nullable = false)
    private String telefone;

    @Column(name = "nome_artista", nullable = false)
    private String nome;

    @Column(name = "nome_empresa")
    private String nomeEmpresa;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    // --- 1. MUDANÇA ADICIONADA ---
    @Column(name = "foto_url")
    private String fotoUrl;
    // --- FIM DA MUDANÇA ---

    @JsonManagedReference
    @OneToMany(mappedBy = "artista", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produto> produtos = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "id_credencial", referencedColumnName = "id_credencial", unique = true)
    private Credencial credencial;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "id_endereco", referencedColumnName = "id_endereco", unique = true)
    private Endereco endereco;


    public Artista() {
    }

    public Artista(String cpf, String cnpj, String telefone, String nome, String nomeEmpresa) {
        this.cpf = cpf;
        this.cnpj = cnpj;
        this.telefone = telefone;
        this.nome = nome;
        this.nomeEmpresa = nomeEmpresa;
    }

    // (Getters e Setters existentes)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Endereco getEndereco() { return endereco; }
    public void setEndereco(Endereco endereco) { this.endereco = endereco; }
    public String getBiografia() { return biografia; }
    public void setBiografia(String biografia) { this.biografia = biografia; }

    // --- 2. MUDANÇA ADICIONADA ---
    // Getters e Setters para o novo campo fotoUrl
    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    // --- FIM DA MUDANÇA ---


    @Override
    public boolean equals(Object o) { return Objects.equals(id, ((Artista) o).id); }
    @Override
    public int hashCode() { return Objects.hash(id); }
}