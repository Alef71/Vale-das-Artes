package br.com.valedasartes.domain.cliente.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.dto.ClienteRequestDTO;
import br.com.valedasartes.domain.cliente.dto.ClienteResponseDTO;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.security.Credencial;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public ClienteResponseDTO criarCliente(ClienteRequestDTO dto) {
        // Converte o DTO de Credencial para a entidade Credencial
        Credencial credencial = new Credencial();
        credencial.setEmail(dto.getCredencial().getEmail());
        credencial.setSenha(dto.getCredencial().getSenha()); // Em um projeto real, criptografaríamos a senha aqui

        // Converte o DTO de Endereço para a entidade Endereco
        Endereco endereco = new Endereco();
        endereco.setLogradouro(dto.getEndereco().getLogradouro());
        endereco.setNumero(dto.getEndereco().getNumero());
        endereco.setComplemento(dto.getEndereco().getComplemento());
        endereco.setBairro(dto.getEndereco().getBairro());
        endereco.setCidade(dto.getEndereco().getCidade());
        endereco.setEstado(dto.getEndereco().getEstado());
        endereco.setCep(dto.getEndereco().getCep());
        endereco.setTelefone(dto.getEndereco().getTelefone());

        // Cria a entidade principal do Cliente
        Cliente novoCliente = new Cliente();
        novoCliente.setNome(dto.getNome());
        novoCliente.setCpf(dto.getCpf());
        novoCliente.setTelefone(dto.getTelefone());
        novoCliente.setCredencial(credencial);
        novoCliente.setEndereco(endereco);

        Cliente clienteSalvo = clienteRepository.save(novoCliente);
        return new ClienteResponseDTO(clienteSalvo);
    }

    public List<ClienteResponseDTO> listarTodosOsClientes() {
        return clienteRepository.findAll()
                .stream()
                .map(ClienteResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ClienteResponseDTO> buscarClientePorId(Long id) {
        return clienteRepository.findById(id)
                .map(ClienteResponseDTO::new);
    }

    @Transactional
    public ClienteResponseDTO atualizarCliente(Long id, ClienteRequestDTO dto) {
        return clienteRepository.findById(id)
            .map(clienteExistente -> {
                clienteExistente.setNome(dto.getNome());
                clienteExistente.setCpf(dto.getCpf());
                clienteExistente.setTelefone(dto.getTelefone());

                // A lógica de atualização de endereço e credencial pode ser mais complexa,
                // mas para este CRUD vamos manter simples.
                
                Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
                return new ClienteResponseDTO(clienteAtualizado);
            }).orElse(null);
    }

    public void deletarCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente com ID " + id + " não encontrado.");
        }
        clienteRepository.deleteById(id);
    }
}