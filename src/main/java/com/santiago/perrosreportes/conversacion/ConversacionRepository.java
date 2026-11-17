package com.santiago.perrosreportes.conversacion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversacionRepository extends JpaRepository<Conversacion, UUID> {

    Optional<Conversacion> findByCoincidencia_IdCoincidencia(UUID idCoincidencia);

    @Query("""
            SELECT conversacion
            FROM Conversacion conversacion, ParticipanteConversacion participante
            WHERE participante.conversacion = conversacion
                    AND participante.usuario.idUsuario = :idUsuario
                    AND conversacion.activa = true
            ORDER BY conversacion.fechaCreacion DESC
            """)
    List<Conversacion> findActivasPorUsuario(@Param("idUsuario") UUID idUsuario);
}
