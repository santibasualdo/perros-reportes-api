package com.santiago.perrosreportes.conversacion;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversacionRepository extends JpaRepository<Conversacion, UUID> {

    Optional<Conversacion> findByCoincidencia_IdCoincidencia(UUID idCoincidencia);
}
