package br.com.valedasartes.domain.carrinho.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.valedasartes.domain.carrinho.Carrinho;
import br.com.valedasartes.domain.carrinho.Carrinho.CarrinhoStatus;
import br.com.valedasartes.domain.carrinho.CarrinhoProduto;
import br.com.valedasartes.domain.carrinho.dto.ItemCarrinhoDTO;
import br.com.valedasartes.domain.carrinho.repository.CarrinhoProdutoRepository;
import br.com.valedasartes.domain.carrinho.repository.CarrinhoRepository;
import br.com.valedasartes.domain.cliente.Cliente;
import br.com.valedasartes.domain.cliente.repository.ClienteRepository;
import br.com.valedasartes.domain.produto.Produto;
import br.com.valedasartes.domain.produto.repository.ProdutoRepository;

@Service
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ProdutoRepository produtoRepository;
    private final CarrinhoProdutoRepository carrinhoProdutoRepository;
    private final ClienteRepository clienteRepository;

    @Autowired
    public CarrinhoService(CarrinhoRepository cRepo, ProdutoRepository pRepo, CarrinhoProdutoRepository cpRepo, ClienteRepository cliRepo) {
        this.carrinhoRepository = cRepo;
        this.produtoRepository = pRepo;
        this.carrinhoProdutoRepository = cpRepo;
        this.clienteRepository = cliRepo;
    }

    /**
     * --- MÉTODO CORRIGIDO ---
     * Agora ele busca um carrinho ativo, e SÓ cria um novo se não existir.
     */
    @Transactional
    public Carrinho criarCarrinhoParaCliente(Long clienteId) {
        
        // 1. TENTA BUSCAR UM CARRINHO ATIVO
        Optional<Carrinho> carrinhoExistente = carrinhoRepository
                .findByClienteIdAndStatus(clienteId, CarrinhoStatus.ATIVO);

        // 2. SE O CARRINHO EXISTE, APENAS RETORNA ELE
        if (carrinhoExistente.isPresent()) {
            return carrinhoExistente.get();
        }

        // 3. SE NÃO EXISTE, CRIA UM NOVO
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));
        
        Carrinho carrinho = new Carrinho();
        carrinho.setCliente(cliente);
        carrinho.setDataCriacao(LocalDateTime.now());
        carrinho.setStatus(CarrinhoStatus.ATIVO);
        
        return carrinhoRepository.save(carrinho);
    }

    public Optional<Carrinho> buscarCarrinhoPorId(Long id) {
        return carrinhoRepository.findById(id);
    }

    @Transactional
    public Carrinho adicionarItem(Long carrinhoId, ItemCarrinhoDTO itemDTO) {
        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado!"));
        Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));

        carrinho.getItens().stream()
                .filter(item -> item.getProduto().getId().equals(produto.getId()))
                .findFirst()
                .ifPresentOrElse(
                        itemExistente -> itemExistente.setQuantidade(itemExistente.getQuantidade() + itemDTO.getQuantidade()),
                        () -> {
                            CarrinhoProduto novoItem = new CarrinhoProduto();
                            novoItem.setCarrinho(carrinho);
                            novoItem.setProduto(produto);
                            novoItem.setQuantidade(itemDTO.getQuantidade());
                            carrinho.getItens().add(novoItem);
                        }
                );
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho removerItem(Long carrinhoId, ItemCarrinhoDTO itemDTO) {
        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado!"));
        
        CarrinhoProduto itemParaRemover = carrinho.getItens().stream()
                .filter(item -> item.getProduto().getId().equals(itemDTO.getProdutoId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item não encontrado no carrinho!"));

        int novaQuantidade = itemParaRemover.getQuantidade() - itemDTO.getQuantidade();

        if (novaQuantidade > 0) {
            itemParaRemover.setQuantidade(novaQuantidade);
        } else {
            carrinho.getItens().remove(itemParaRemover);
            carrinhoProdutoRepository.delete(itemParaRemover);
        }
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho limparCarrinho(Long carrinhoId) {
        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado!"));
        
        carrinhoProdutoRepository.deleteAll(carrinho.getItens());
        carrinho.getItens().clear();
        
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public void deletarCarrinho(Long id) {
        if (!carrinhoRepository.existsById(id)) {
            throw new RuntimeException("Carrinho não encontrado!");
        }
        carrinhoRepository.deleteById(id);
    }
}