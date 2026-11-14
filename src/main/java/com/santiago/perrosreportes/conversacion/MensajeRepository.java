package com.santiago.perrosreportes.conversacion;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeRepository extends JpaRepository<Mensaje, UUID> {

    List<Mensaje> findByConversacion_IdConversacionOrderByFechaHoraAsc(UUID idConversacion);
}
