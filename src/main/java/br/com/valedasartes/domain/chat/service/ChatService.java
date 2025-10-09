package br.com.valedasartes.domain.chat.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.valedasartes.domain.chat.Chat;
import br.com.valedasartes.domain.chat.dto.ChatRequestDTO;
import br.com.valedasartes.domain.chat.dto.ChatResponseDTO;
import br.com.valedasartes.domain.chat.repository.ChatRepository;

@Service
public class ChatService {

    private final ChatRepository chatRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    /**
     * Cria e salva uma nova mensagem no banco de dados.
     * @param dto Os dados da mensagem a ser enviada.
     * @return Um DTO com os dados da mensagem salva.
     */
    @Transactional
    public ChatResponseDTO enviarMensagem(ChatRequestDTO dto) {
        Chat novaMensagem = new Chat();
        novaMensagem.setRemetente(dto.getRemetenteId());
        novaMensagem.setDestinatario(dto.getDestinatarioId());
        novaMensagem.setMensagem(dto.getMensagem());
        novaMensagem.setDataEnvio(LocalDateTime.now());

        Chat mensagemSalva = chatRepository.save(novaMensagem);
        return new ChatResponseDTO(mensagemSalva);
    }

    /**
     * Busca o histórico de mensagens entre dois usuários.
     * @param user1Id ID do primeiro usuário.
     * @param user2Id ID do segundo usuário.
     * @return Uma lista de DTOs com as mensagens da conversa.
     */
    public List<ChatResponseDTO> buscarConversa(Long user1Id, Long user2Id) {
        List<Chat> conversa = chatRepository.findConversaEntreUsuarios(user1Id, user2Id);
        return conversa.stream()
                .map(ChatResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Deleta uma mensagem específica pelo seu ID.
     * @param id O ID da mensagem a ser deletada.
     */
    public void deletarMensagem(Long id) {
        chatRepository.deleteById(id);
    }
}