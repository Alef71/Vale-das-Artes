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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat", description = "Endpoints para troca de mensagens entre usuários")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @Operation(summary = "Envia uma nova mensagem", description = "Registra uma nova mensagem enviada de um remetente para um destinatário.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Mensagem enviada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados da mensagem inválidos")
    })
    @PostMapping("/enviar")
    public ResponseEntity<ChatResponseDTO> enviarMensagem(@RequestBody ChatRequestDTO dto) {
        ChatResponseDTO novaMensagem = chatService.enviarMensagem(dto);
        return new ResponseEntity<>(novaMensagem, HttpStatus.CREATED);
    }

    @Operation(summary = "Busca o histórico de uma conversa", description = "Retorna uma lista de todas as mensagens trocadas entre dois usuários, ordenadas pela data de envio.")
    @ApiResponse(responseCode = "200", description = "Conversa retornada com sucesso")
    @GetMapping("/conversa/{user1Id}/{user2Id}")
    public ResponseEntity<List<ChatResponseDTO>> buscarConversa(
            @Parameter(description = "ID do primeiro usuário na conversa") @PathVariable Long user1Id, 
            @Parameter(description = "ID do segundo usuário na conversa") @PathVariable Long user2Id) {
        List<ChatResponseDTO> conversa = chatService.buscarConversa(user1Id, user2Id);
        return ResponseEntity.ok(conversa);
    }

    @Operation(summary = "Deleta uma mensagem", description = "Remove permanentemente uma mensagem específica pelo seu ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Mensagem deletada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Mensagem não encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarMensagem(@PathVariable Long id) {
        chatService.deletarMensagem(id);
        return ResponseEntity.noContent().build();
    }
}