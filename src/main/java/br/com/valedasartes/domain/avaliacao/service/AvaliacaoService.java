package br.com.valedasartes.domain.avaliacao.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.avaliacao.Avaliacao;
import br.com.valedasartes.domain.avaliacao.dto.AvaliacaoRequestDTO;
import br.com.valedasartes.domain.avaliacao.dto.AvaliacaoResponseDTO;
import br.com.valedasartes.domain.avaliacao.repository.AvaliacaoRepository;
import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;
import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.produto.repository.ProdutoRepository;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;

    @Autowired
    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository, ProdutoRepository produtoRepository, ClienteRepository clienteRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
    }

    public AvaliacaoResponseDTO criarAvaliacao(AvaliacaoRequestDTO dto) {
        Produto produto = produtoRepository.findById(dto.getProdutoId())
            .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

        Avaliacao novaAvaliacao = new Avaliacao();
        novaAvaliacao.setNota(dto.getNota());
        novaAvaliacao.setComentario(dto.getComentario());
        novaAvaliacao.setDataAvaliacao(LocalDateTime.now());
        novaAvaliacao.setProduto(produto);
        novaAvaliacao.setCliente(cliente);

        Avaliacao avaliacaoSalva = avaliacaoRepository.save(novaAvaliacao);
        return new AvaliacaoResponseDTO(avaliacaoSalva);
    }

    public List<AvaliacaoResponseDTO> listarTodasAsAvaliacoes() {
        return avaliacaoRepository.findAll()
                .stream()
                .map(AvaliacaoResponseDTO::new)
                .collect(Collectors.toList());
    }

   
    public List<AvaliacaoResponseDTO> buscarAvaliacoesPorProduto(Long produtoId) {
        
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByProdutoId(produtoId);
        
        
        return avaliacoes.stream()
                .map(AvaliacaoResponseDTO::new)
                .collect(Collectors.toList());
    }
    

    public Optional<AvaliacaoResponseDTO> buscarAvaliacaoPorId(Long id) {
        return avaliacaoRepository.findById(id)
                .map(AvaliacaoResponseDTO::new);
    }

    public AvaliacaoResponseDTO atualizarAvaliacao(Long id, AvaliacaoRequestDTO dto) {
        return avaliacaoRepository.findById(id)
            .map(avaliacaoExistente -> {
                avaliacaoExistente.setNota(dto.getNota());
                avaliacaoExistente.setComentario(dto.getComentario());
                
                Avaliacao avaliacaoAtualizada = avaliacaoRepository.save(avaliacaoExistente);
                return new AvaliacaoResponseDTO(avaliacaoAtualizada);
            }).orElse(null);
    }

    public void deletarAvaliacao(Long id) {
        if (!avaliacaoRepository.existsById(id)) {
            throw new RuntimeException("Avaliação com ID " + id + " não encontrada.");
        }
        avaliacaoRepository.deleteById(id);
    }
}