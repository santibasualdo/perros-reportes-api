package com.santiago.perrosreportes.conversacion;

import java.time.OffsetDateTime;
import java.util.UUID;

public class MensajeResponse {

    private final UUID idMensaje;
    private final UUID idUsuario;
    private final String nombreUsuario;
    private final String contenido;
    private final OffsetDateTime fechaHora;
    private final Boolean leido;

    public MensajeResponse(UUID idMensaje, UUID idUsuario, String nombreUsuario, String contenido,
            OffsetDateTime fechaHora, Boolean leido) {
        this.idMensaje = idMensaje;
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.contenido = contenido;
        this.fechaHora = fechaHora;
        this.leido = leido;
    }

    public UUID getIdMensaje() {
        return idMensaje;
    }

    public UUID getIdUsuario() {
        return idUsuario;
    }

    public String getContenido() {
        return contenido;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public OffsetDateTime getFechaHora() {
        return fechaHora;
    }

    public Boolean getLeido() {
        return leido;
    }
}
