package com.santiago.perrosreportes.conversacion;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipanteConversacionRepository extends JpaRepository<ParticipanteConversacion, ParticipanteConversacionId> {

    boolean existsByConversacion_IdConversacionAndUsuario_IdUsuario(UUID idConversacion,
            UUID idUsuario);
}
