package br.com.valedasartes.domain.pedido.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.valedasartes.domain.carrinho.Carrinho;
import br.com.valedasartes.domain.carrinho.repository.CarrinhoRepository;
import br.com.valedasartes.domain.carrinho.service.CarrinhoService;
import br.com.valedasartes.domain.pedido.Pedido;
import br.com.valedasartes.domain.pedido.Pedido.PedidoStatus;
import br.com.valedasartes.domain.pedido.PedidoProduto;
import br.com.valedasartes.domain.pedido.repository.PedidoRepository;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final CarrinhoRepository carrinhoRepository;
    private final CarrinhoService carrinhoService;

    @Autowired
    public PedidoService(PedidoRepository pedidoRepository, CarrinhoRepository carrinhoRepository, CarrinhoService carrinhoService) {
        this.pedidoRepository = pedidoRepository;
        this.carrinhoRepository = carrinhoRepository;
        this.carrinhoService = carrinhoService; 
    }

    @Transactional
    public Pedido criarPedidoDoCarrinho(Long carrinhoId) {
        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
            .orElseThrow(() -> new RuntimeException("Carrinho não encontrado!"));

        if (carrinho.getItens().isEmpty()) {
            throw new RuntimeException("Não é possível criar um pedido de um carrinho vazio.");
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(carrinho.getCliente());
        pedido.setDataCriacao(LocalDateTime.now());
        pedido.setStatus(PedidoStatus.PENDENTE);

        List<PedidoProduto> itensDoPedido = carrinho.getItens().stream()
            .map(itemCarrinho -> {
                PedidoProduto itemPedido = new PedidoProduto();
                itemPedido.setPedido(pedido);
                itemPedido.setProduto(itemCarrinho.getProduto());
                itemPedido.setQuantidade(itemCarrinho.getQuantidade());
                return itemPedido;
            }).collect(Collectors.toList());

        pedido.setItens(itensDoPedido);

        BigDecimal valorTotal = itensDoPedido.stream()
            .map(item -> item.getProduto().getPreco().multiply(new BigDecimal(item.getQuantidade())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        pedido.setValorTotal(valorTotal);
        
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        this.carrinhoService.limparCarrinho(carrinhoId);

        return pedidoSalvo;
    }

    public List<Pedido> listarTodosOsPedidos() {
        return pedidoRepository.findAll();
    }

    public Optional<Pedido> buscarPedidoPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    @Transactional
    public Pedido atualizarStatusDoPedido(Long id, PedidoStatus novoStatus) {
        return pedidoRepository.findById(id)
            .map(pedidoExistente -> {
                pedidoExistente.setStatus(novoStatus);
                if (novoStatus == PedidoStatus.PAGO) {
                    pedidoExistente.setDataPagamento(LocalDateTime.now());
                } else if (novoStatus == PedidoStatus.ENVIADO) {
                    pedidoExistente.setDataEnvio(LocalDateTime.now());
                }
                return pedidoRepository.save(pedidoExistente);
            }).orElseThrow(() -> new RuntimeException("Pedido não encontrado!"));
    }

    public void deletarPedido(Long id) {
        pedidoRepository.deleteById(id);
    }
}