package br.com.valedasartes.domain.cliente.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.valedasartes.config.FileStorageService;
import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.dto.ClienteRequestDTO;
import br.com.valedasartes.domain.cliente.dto.ClienteResponseDTO;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.security.Credencial;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder; 
    private final FileStorageService fileStorageService;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository, 
                          PasswordEncoder passwordEncoder,
                          FileStorageService fileStorageService) { 
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ClienteResponseDTO criarCliente(ClienteRequestDTO dto) {
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

    public Optional<ClienteResponseDTO> buscarClientePorId(Long id) {
        return clienteRepository.findById(id)
                .map(ClienteResponseDTO::new);
    }

    @Transactional
    public ClienteResponseDTO atualizarCliente(Long id, ClienteRequestDTO dto) {
        return clienteRepository.findById(id)
            .map(clienteExistente -> {
                
                // 1. Atualiza dados básicos
                clienteExistente.setNome(dto.getNome());
                clienteExistente.setTelefone(dto.getTelefone());

                // 2. Atualiza Endereço
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
                
                // 3. Atualiza Credencial (Senha e Email)
                if (dto.getCredencial() != null) {
                    
                    // Atualiza o Email se tiver mudado
                    if (dto.getCredencial().getEmail() != null) {
                        clienteExistente.getCredencial().setEmail(dto.getCredencial().getEmail());
                    }

                    // LÓGICA DA SENHA: Só altera se vier preenchida e não estiver em branco
                    String novaSenha = dto.getCredencial().getSenha();
                    if (novaSenha != null && !novaSenha.isBlank()) {
                        String senhaCriptografada = passwordEncoder.encode(novaSenha);
                        clienteExistente.getCredencial().setSenha(senhaCriptografada);
                    }
                    // Se novaSenha for null ou "", a senha antiga é mantida (não fazemos nada aqui)
                }

                Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
                return new ClienteResponseDTO(clienteAtualizado);
                
            }).orElseThrow(() -> new RuntimeException("Cliente não encontrado com ID: " + id));
    }

    @Transactional
    public ClienteResponseDTO uploadFoto(Long clienteId, MultipartFile file, Credencial credencialLogada) {
        
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        if (!cliente.getId().equals(credencialLogada.getCliente().getId())) {
            throw new RuntimeException("Acesso negado: Você não pode alterar a foto de outro cliente.");
        }

        String nomeArquivo = fileStorageService.salvarArquivo(file);
        String fotoUrl = fileStorageService.getUrlCompleta(nomeArquivo);

        cliente.setFotoUrl(fotoUrl);
        Cliente clienteSalvo = clienteRepository.save(cliente);

        return new ClienteResponseDTO(clienteSalvo);
    }

    @Transactional
    public ClienteResponseDTO removerFoto(Long clienteId, Credencial credencialLogada) {
        
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        if (!cliente.getId().equals(credencialLogada.getCliente().getId())) {
            throw new RuntimeException("Acesso negado: Você não pode alterar a foto de outro cliente.");
        }

        cliente.setFotoUrl(null);
        Cliente clienteSalvo = clienteRepository.save(cliente);

        return new ClienteResponseDTO(clienteSalvo);
    }

    public void deletarCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente com ID " + id + " não encontrado.");
        }
        clienteRepository.deleteById(id);
    }
}