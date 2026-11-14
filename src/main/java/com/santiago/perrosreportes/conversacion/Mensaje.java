package com.santiago.perrosreportes.conversacion;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.santiago.perrosreportes.usuario.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "mensaje", schema = "public")
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_mensaje")
    private UUID idMensaje;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_conversacion", nullable = false)
    private Conversacion conversacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_emisor", nullable = false)
    private Usuario usuario;

    @Column(name = "contenido", nullable = false)
    private String contenido;

    @Column(name = "fecha_hora", nullable = false)
    private OffsetDateTime fechaHora;

    @Column(name = "leido", nullable = false)
    private Boolean leido;

    public UUID getIdMensaje() {
        return idMensaje;
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

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public OffsetDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(OffsetDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public Boolean getLeido() {
        return leido;
    }

    public void setLeido(Boolean leido) {
        this.leido = leido;
    }
}
