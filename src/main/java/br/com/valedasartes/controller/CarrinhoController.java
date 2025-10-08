package br.com.valedasartes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.valedasartes.domain.carrinho.dto.CarrinhoResponseDTO;
import br.com.valedasartes.domain.carrinho.dto.ItemCarrinhoDTO;
import br.com.valedasartes.domain.carrinho.service.CarrinhoService;

@RestController
@RequestMapping("/api/carrinhos")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    @Autowired
    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    @PostMapping("/cliente/{clienteId}")
    public ResponseEntity<CarrinhoResponseDTO> criarCarrinho(@PathVariable Long clienteId) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.criarCarrinhoParaCliente(clienteId));
        return new ResponseEntity<>(carrinhoDTO, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarrinhoResponseDTO> buscarCarrinhoPorId(@PathVariable Long id) {
        return carrinhoService.buscarCarrinhoPorId(id)
                .map(carrinho -> ResponseEntity.ok(new CarrinhoResponseDTO(carrinho)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/itens")
    public ResponseEntity<CarrinhoResponseDTO> adicionarItem(@PathVariable Long id, @RequestBody ItemCarrinhoDTO itemDTO) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.adicionarItem(id, itemDTO));
        return ResponseEntity.ok(carrinhoDTO);
    }

    @DeleteMapping("/{id}/itens")
    public ResponseEntity<CarrinhoResponseDTO> removerItem(@PathVariable Long id, @RequestBody ItemCarrinhoDTO itemDTO) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.removerItem(id, itemDTO));
        return ResponseEntity.ok(carrinhoDTO);
    }
    
    @DeleteMapping("/{id}/limpar")
    public ResponseEntity<CarrinhoResponseDTO> limparCarrinho(@PathVariable Long id) {
        CarrinhoResponseDTO carrinhoDTO = new CarrinhoResponseDTO(carrinhoService.limparCarrinho(id));
        return ResponseEntity.ok(carrinhoDTO);
    }
}