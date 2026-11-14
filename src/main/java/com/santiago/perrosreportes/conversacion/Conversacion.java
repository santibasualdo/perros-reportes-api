package com.santiago.perrosreportes.conversacion;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.santiago.perrosreportes.coincidencia.Coincidencia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversacion", schema = "public")
public class Conversacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_conversacion")
    private UUID idConversacion;

    @OneToOne(optional = false)
    @JoinColumn(name = "id_coincidencia", nullable = false, unique = true)
    private Coincidencia coincidencia;

    @Column(name = "activa", nullable = false)
    private Boolean activa;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private OffsetDateTime fechaCreacion;

    public UUID getIdConversacion() {
        return idConversacion;
    }

    public Coincidencia getCoincidencia() {
        return coincidencia;
    }

    public void setCoincidencia(Coincidencia coincidencia) {
        this.coincidencia = coincidencia;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
