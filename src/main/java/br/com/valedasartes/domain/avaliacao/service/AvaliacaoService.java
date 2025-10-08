package br.com.valedasartes.domain.avaliacao.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.avaliacao.Avaliacao;
import br.com.valedasartes.domain.avaliacao.repository.AvaliacaoRepository;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;

    @Autowired
    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
    }

    public Avaliacao criarAvaliacao(Avaliacao avaliacao) {
        return avaliacaoRepository.save(avaliacao);
    }

    public List<Avaliacao> listarTodasAsAvaliacoes() {
        return avaliacaoRepository.findAll();
    }

    public Optional<Avaliacao> buscarAvaliacaoPorId(Long id) {
        return avaliacaoRepository.findById(id);
    }

    public Avaliacao atualizarAvaliacao(Long id, Avaliacao avaliacaoAtualizada) {
        return avaliacaoRepository.findById(id)
            .map(avaliacaoExistente -> {
                avaliacaoExistente.setNota(avaliacaoAtualizada.getNota());
                avaliacaoExistente.setComentario(avaliacaoAtualizada.getComentario());
                return avaliacaoRepository.save(avaliacaoExistente);
            }).orElse(null);
    }

    public void deletarAvaliacao(Long id) {
        avaliacaoRepository.deleteById(id);
    }
}