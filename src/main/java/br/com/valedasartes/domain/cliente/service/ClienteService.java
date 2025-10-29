package br.com.valedasartes.domain.cliente.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.dto.ClienteRequestDTO;
import br.com.valedasartes.domain.cliente.dto.ClienteResponseDTO;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.security.Credencial;
// (Pode precisar importar CredencialRepository se o getCredencial for LAZY, mas vamos tentar)

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder; 

    @Autowired
    public ClienteService(ClienteRepository clienteRepository, PasswordEncoder passwordEncoder) { 
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ClienteResponseDTO criarCliente(ClienteRequestDTO dto) {
        // (O seu método criarCliente está perfeito, não vamos mexer)
        Credencial credencial = new Credencial();
        credencial.setEmail(dto.getCredencial().getEmail());
        String senhaCriptografada = passwordEncoder.encode(dto.getCredencial().getSenha());
        credencial.setSenha(senhaCriptografada);

        Endereco endereco = new Endereco();
        endereco.setLogradouro(dto.getEndereco().getLogradouro());
        endereco.setNumero(dto.getEndereco().getNumero());
        endereco.setComplemento(dto.getEndereco().getComplemento());
        endereco.setBairro(dto.getEndereco().getBairro());
        endereco.setCidade(dto.getEndereco().getCidade());
        endereco.setEstado(dto.getEndereco().getEstado());
        endereco.setCep(dto.getEndereco().getCep());
        endereco.setTelefone(dto.getEndereco().getTelefone());

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

    // (O buscarClientePorId está bom, ele usa o new ClienteResponseDTO que acabamos de corrigir)
    public Optional<ClienteResponseDTO> buscarClientePorId(Long id) {
        return clienteRepository.findById(id)
                .map(ClienteResponseDTO::new);
    }

    // --- GRANDE MUDANÇA AQUI ---
    @Transactional
    public ClienteResponseDTO atualizarCliente(Long id, ClienteRequestDTO dto) {
        return clienteRepository.findById(id)
            .map(clienteExistente -> {
                
                // 1. Atualiza dados do Cliente
                clienteExistente.setNome(dto.getNome());
                clienteExistente.setTelefone(dto.getTelefone());
                // (Não atualizamos CPF, como no seu original)

                // 2. Atualiza dados do Endereço (que estava faltando)
                if (clienteExistente.getEndereco() != null && dto.getEndereco() != null) {
                    Endereco enderecoExistente = clienteExistente.getEndereco();
                    enderecoExistente.setLogradouro(dto.getEndereco().getLogradouro());
                    enderecoExistente.setNumero(dto.getEndereco().getNumero());
                    enderecoExistente.setComplemento(dto.getEndereco().getComplemento());
                    enderecoExistente.setBairro(dto.getEndereco().getBairro());
                    enderecoExistente.setCidade(dto.getEndereco().getCidade());
                    enderecoExistente.setEstado(dto.getEndereco().getEstado());
                    enderecoExistente.setCep(dto.getEndereco().getCep());
                    enderecoExistente.setTelefone(dto.getEndereco().getTelefone());
                }
                
                // 3. Atualiza a Senha (se uma nova foi enviada)
                String novaSenha = dto.getCredencial().getSenha();
                if (novaSenha != null && !novaSenha.isBlank()) {
                    String senhaCriptografada = passwordEncoder.encode(novaSenha);
                    clienteExistente.getCredencial().setSenha(senhaCriptografada);
                }
                // (Não atualizamos o email, pois é a chave de login)

                Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
                return new ClienteResponseDTO(clienteAtualizado);
                
            }).orElse(null); // Retorna null se o cliente não for encontrado
    }

    public void deletarCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente com ID " + id + " não encontrado.");
        }
        clienteRepository.deleteById(id);
    }
}