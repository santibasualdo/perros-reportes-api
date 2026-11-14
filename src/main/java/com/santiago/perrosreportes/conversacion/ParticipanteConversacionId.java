package com.santiago.perrosreportes.conversacion;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ParticipanteConversacionId implements Serializable {

    @Column(name = "id_conversacion")
    private UUID idConversacion;

    @Column(name = "id_usuario")
    private UUID idUsuario;

    public ParticipanteConversacionId() {
    }

    public ParticipanteConversacionId(UUID idConversacion,
            UUID idUsuario) {
        this.idConversacion = idConversacion;
        this.idUsuario = idUsuario;
    }

    public UUID getIdConversacion() {
        return idConversacion;
    }

    public UUID getIdUsuario() {
        return idUsuario;
    }

    @Override
    public boolean equals(Object objeto) {
        if (this == objeto) {
            return true;
        }

        if (!(objeto instanceof ParticipanteConversacionId otro)) {
            return false;
        }

        return Objects.equals(idConversacion, otro.idConversacion)
                && Objects.equals(idUsuario, otro.idUsuario);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idConversacion, idUsuario);
    }
}
