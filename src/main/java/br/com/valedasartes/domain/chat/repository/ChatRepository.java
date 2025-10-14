package br.com.valedasartes.domain.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.valedasartes.domain.chat.Chat;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE " +
           "(c.remetente = :user1Id AND c.destinatario = :user2Id) OR " +
           "(c.remetente = :user2Id AND c.destinatario = :user1Id) " +
           "ORDER BY c.dataEnvio ASC")
    List<Chat> findConversaEntreUsuarios(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}