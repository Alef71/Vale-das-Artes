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
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com ID: " + id));

        cliente.setNome(dto.getNome());
        cliente.setTelefone(dto.getTelefone());

        if (dto.getEndereco() != null) {
            Endereco enderecoBanco = cliente.getEndereco();
            if (enderecoBanco == null) {
                enderecoBanco = new Endereco();
                cliente.setEndereco(enderecoBanco);
            }
            enderecoBanco.setLogradouro(dto.getEndereco().getLogradouro());
            enderecoBanco.setNumero(dto.getEndereco().getNumero());
            enderecoBanco.setComplemento(dto.getEndereco().getComplemento());
            enderecoBanco.setBairro(dto.getEndereco().getBairro());
            enderecoBanco.setCidade(dto.getEndereco().getCidade());
            enderecoBanco.setEstado(dto.getEndereco().getEstado());
            enderecoBanco.setCep(dto.getEndereco().getCep());
            enderecoBanco.setTelefone(dto.getEndereco().getTelefone());
        }

        if (dto.getCredencial() != null) {
            if (dto.getCredencial().getEmail() != null) {
                cliente.getCredencial().setEmail(dto.getCredencial().getEmail());
            }
            String novaSenha = dto.getCredencial().getSenha();
            if (novaSenha != null && !novaSenha.trim().isEmpty()) {
                String senhaCriptografada = passwordEncoder.encode(novaSenha);
                cliente.getCredencial().setSenha(senhaCriptografada);
            }
        }

        Cliente clienteSalvo = clienteRepository.save(cliente);
        return new ClienteResponseDTO(clienteSalvo);
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

    // ✅ MÉTODO ATUALIZADO COM @TRANSACTIONAL E NOMES CORRETOS
    @Transactional
    public void deletarCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente com ID " + id + " não encontrado.");
        }
        clienteRepository.deleteById(id);
    }
}