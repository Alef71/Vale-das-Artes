package br.com.valedasartes.controller;

import java.util.List;

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

import br.com.valedasartes.domain.chat.dto.ChatRequestDTO;
import br.com.valedasartes.domain.chat.dto.ChatResponseDTO;
import br.com.valedasartes.domain.chat.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/enviar")
    public ResponseEntity<ChatResponseDTO> enviarMensagem(@RequestBody ChatRequestDTO dto) {
        ChatResponseDTO novaMensagem = chatService.enviarMensagem(dto);
        return new ResponseEntity<>(novaMensagem, HttpStatus.CREATED);
    }

    @GetMapping("/conversa/{user1Id}/{user2Id}")
    public ResponseEntity<List<ChatResponseDTO>> buscarConversa(
            @PathVariable Long user1Id, 
            @PathVariable Long user2Id) {
        List<ChatResponseDTO> conversa = chatService.buscarConversa(user1Id, user2Id);
        return ResponseEntity.ok(conversa);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarMensagem(@PathVariable Long id) {
        chatService.deletarMensagem(id);
        return ResponseEntity.noContent().build();
    }
}