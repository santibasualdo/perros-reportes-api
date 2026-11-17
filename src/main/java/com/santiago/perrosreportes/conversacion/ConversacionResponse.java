package com.santiago.perrosreportes.conversacion;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ConversacionResponse {

    private final UUID idCoincidencia;
    private final String nombreOtroParticipante;
    private final String ultimoMensaje;
    private final UUID idEmisorUltimoMensaje;
    private final OffsetDateTime fechaUltimoMensaje;
    private final OffsetDateTime fechaCreacion;

    public ConversacionResponse(UUID idCoincidencia, String nombreOtroParticipante,
            String ultimoMensaje, UUID idEmisorUltimoMensaje,
            OffsetDateTime fechaUltimoMensaje, OffsetDateTime fechaCreacion) {
        this.idCoincidencia = idCoincidencia;
        this.nombreOtroParticipante = nombreOtroParticipante;
        this.ultimoMensaje = ultimoMensaje;
        this.idEmisorUltimoMensaje = idEmisorUltimoMensaje;
        this.fechaUltimoMensaje = fechaUltimoMensaje;
        this.fechaCreacion = fechaCreacion;
    }

    public UUID getIdCoincidencia() {
        return idCoincidencia;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public String getNombreOtroParticipante() {
        return nombreOtroParticipante;
    }

    public String getUltimoMensaje() {
        return ultimoMensaje;
    }

    public UUID getIdEmisorUltimoMensaje() {
        return idEmisorUltimoMensaje;
    }

    public OffsetDateTime getFechaUltimoMensaje() {
        return fechaUltimoMensaje;
    }
}
