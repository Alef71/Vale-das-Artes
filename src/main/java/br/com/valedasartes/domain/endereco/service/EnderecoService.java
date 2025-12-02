package br.com.valedasartes.domain.endereco.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.endereco.repository.EnderecoRepository;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

    @Autowired
    public EnderecoService(EnderecoRepository enderecoRepository) {
        this.enderecoRepository = enderecoRepository;
    }

    public Endereco criarEndereco(Endereco endereco) {
        return enderecoRepository.save(endereco);
    }

    public List<Endereco> listarTodosOsEnderecos() {
        return enderecoRepository.findAll();
    }

    public Optional<Endereco> buscarEnderecoPorId(Long id) {
        return enderecoRepository.findById(id);
    }

    public Endereco atualizarEndereco(Long id, Endereco enderecoAtualizado) {
        return enderecoRepository.findById(id)
            .map(enderecoExistente -> {
                
                enderecoExistente.setLogradouro(enderecoAtualizado.getLogradouro());
                enderecoExistente.setComplemento(enderecoAtualizado.getComplemento());
                enderecoExistente.setTelefone(enderecoAtualizado.getTelefone());
                enderecoExistente.setNumero(enderecoAtualizado.getNumero());
                enderecoExistente.setBairro(enderecoAtualizado.getBairro());
                enderecoExistente.setCidade(enderecoAtualizado.getCidade());
                enderecoExistente.setEstado(enderecoAtualizado.getEstado());
                enderecoExistente.setCep(enderecoAtualizado.getCep());
                return enderecoRepository.save(enderecoExistente);
            }).orElse(null);
    }

    public void deletarEndereco(Long id) {
        enderecoRepository.deleteById(id);
    }
}