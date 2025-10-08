package br.com.valedasartes.domain.cliente.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public Cliente criarCliente(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public List<Cliente> listarTodosOsClientes() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarClientePorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente atualizarCliente(Long id, Cliente clienteAtualizado) {
        return clienteRepository.findById(id)
            .map(clienteExistente -> {
                
                clienteExistente.setNome(clienteAtualizado.getNome());
                clienteExistente.setCpf(clienteAtualizado.getCpf());
                clienteExistente.setTelefone(clienteAtualizado.getTelefone());
           
                return clienteRepository.save(clienteExistente);
            }).orElse(null);
    }

    public void deletarCliente(Long id) {
        clienteRepository.deleteById(id);
    }
}