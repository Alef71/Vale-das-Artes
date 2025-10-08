package br.com.valedasartes.domain.chat.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.chat.Chat;
import br.com.valedasartes.domain.chat.repository.ChatRepository;

@Service
public class ChatService {

    private final ChatRepository chatRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    public Chat criarMensagem(Chat chat) {
        return chatRepository.save(chat);
    }

    public List<Chat> listarTodasAsMensagens() {
        return chatRepository.findAll();
    }

    public Optional<Chat> buscarMensagemPorId(Long id) {
        return chatRepository.findById(id);
    }
    
    public Chat atualizarMensagem(Long id, Chat chatAtualizado) {
        return chatRepository.findById(id)
            .map(mensagemExistente -> {
                mensagemExistente.setMensagem(chatAtualizado.getMensagem());
                return chatRepository.save(mensagemExistente);
            }).orElse(null);
    }

    public void deletarMensagem(Long id) {
        chatRepository.deleteById(id);
    }
}