package br.com.valedasartes.domain.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.chat.Chat;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
}