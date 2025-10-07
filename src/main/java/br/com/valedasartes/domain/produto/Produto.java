package br.com.valedasartes.domain.produto;

import java.math.BigDecimal;
import java.util.Objects;

import br.com.valedasartes.artista.Artista;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Representa a entidade Produto, que corresponde à tabela 'produtos' no banco de dados.
 * Esta classe servirá de modelo para a criação das outras entidades do sistema.
 */
@Entity
@Table(name = "produtos")
public class Produto {

    // --- ATRIBUTOS ---

    /**
     * Identificador único do produto.
     * @Id - Marca este campo como a chave primária da tabela.
     * @GeneratedValue - Configura a estratégia de geração automática do valor da chave primária.
     * @Column - Mapeia este campo para a coluna 'id_produto' na tabela.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_produto")
    private Long id;

    /**
     * Nome do produto.
     * @Column(nullable = false) - Garante que esta coluna não pode ser nula no banco de dados.
     */
    @Column(nullable = false)
    private String nome;

    /**
     * Descrição detalhada do produto.
     * columnDefinition = "TEXT" - Especifica que o tipo da coluna no banco de dados será TEXT,
     * ideal para textos longos.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    /**
     * Preço do produto.
     * Usamos BigDecimal para precisão monetária, evitando problemas de arredondamento.
     * precision e scale definem o número total de dígitos e o número de casas decimais.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    /**
     * Categoria à qual o produto pertence.
     */
    @Column(nullable = false)
    private String categoria;


    // --- RELACIONAMENTOS ---

    /**
     * Relacionamento Muitos-para-Um com a entidade Artista.
     * Muitos produtos podem pertencer a um artista.
     * @ManyToOne - Define o tipo de relacionamento.
     * @JoinColumn - Especifica a coluna de chave estrangeira ('id_artista') nesta tabela.
     * FetchType.LAZY - Otimização: o artista só será carregado do banco quando for explicitamente acessado.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_artista")
    private Artista artista;


    // --- CONSTRUTORES ---

    /**
     * Construtor padrão exigido pelo JPA.
     */
    public Produto() {
    }

    /**
     * Construtor para criar um produto com os dados essenciais.
     */
    public Produto(String nome, String descricao, BigDecimal preco, String categoria, Artista artista) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.categoria = categoria;
        this.artista = artista;
    }


    // --- GETTERS E SETTERS ---
    // Métodos para acessar e modificar os atributos da classe.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Artista getArtista() {
        return artista;
    }

    public void setArtista(Artista artista) {
        this.artista = artista;
    }

    // --- hashCode e equals ---
    // Métodos para permitir que objetos Produto sejam comparados e usados em coleções (como Set e Map).

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Produto produto = (Produto) o;
        return Objects.equals(id, produto.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}