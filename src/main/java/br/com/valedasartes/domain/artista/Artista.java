package br.com.valedasartes.domain.artista;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import br.com.valedasartes.domain.produto.Produto;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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

    @OneToMany(mappedBy = "artista", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produto> produtos = new ArrayList<>();


    public Artista() {
    }

    public Artista(String cpf, String cnpj, String telefone, String nome, String nomeEmpresa) {
        this.cpf = cpf;
        this.cnpj = cnpj;
        this.telefone = telefone;
        this.nome = nome;
        this.nomeEmpresa = nomeEmpresa;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNomeEmpresa() {
        return nomeEmpresa;
    }

    public void setNomeEmpresa(String nomeEmpresa) {
        this.nomeEmpresa = nomeEmpresa;
    }

    public List<Produto> getProdutos() {
        return produtos;
    }

    public void setProdutos(List<Produto> produtos) {
        this.produtos = produtos;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Artista artista = (Artista) o;
        return Objects.equals(id, artista.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
