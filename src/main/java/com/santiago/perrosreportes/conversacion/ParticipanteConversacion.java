package com.santiago.perrosreportes.conversacion;

import com.santiago.perrosreportes.usuario.Usuario;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "participante_conversacion", schema = "public")
public class ParticipanteConversacion {

    @EmbeddedId
    private ParticipanteConversacionId id;

    @ManyToOne(optional = false)
    @MapsId("idConversacion")
    @JoinColumn(name = "id_conversacion", nullable = false)
    private Conversacion conversacion;

    @ManyToOne(optional = false)
    @MapsId("idUsuario")
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    public ParticipanteConversacionId getId() {
        return id;
    }

    public void setId(ParticipanteConversacionId id) {
        this.id = id;
    }

    public Conversacion getConversacion() {
        return conversacion;
    }

    public void setConversacion(Conversacion conversacion) {
        this.conversacion = conversacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
