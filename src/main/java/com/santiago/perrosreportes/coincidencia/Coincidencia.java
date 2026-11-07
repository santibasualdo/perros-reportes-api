package com.santiago.perrosreportes.coincidencia;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.santiago.perrosreportes.reporte.Reporte;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "coincidencia", schema = "public")
public class Coincidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_coincidencia")
    private UUID idCoincidencia;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reporte_perdido", nullable = false)
    private Reporte reportePerdido;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reporte_avistamiento", nullable = false)
    private Reporte reporteAvistamiento;

    @Column(name = "similitud_caracteristicas", nullable = false)
    private Double similitudCaracteristicas;

    @Column(name = "distancia", nullable = false)
    private Double distancia;

    @Column(name = "puntaje_total", nullable = false)
    private Double puntajeTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoCoincidencia estado;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @Column(name = "similitud_visual")
    private Double similitudVisual;

    public UUID getIdCoincidencia() {
        return idCoincidencia;
    }

    public Reporte getReportePerdido() {
        return reportePerdido;
    }

    public void setReportePerdido(Reporte reportePerdido) {
        this.reportePerdido = reportePerdido;
    }

    public Reporte getReporteAvistamiento() {
        return reporteAvistamiento;
    }

    public void setReporteAvistamiento(Reporte reporteAvistamiento) {
        this.reporteAvistamiento = reporteAvistamiento;
    }

    public Double getSimilitudCaracteristicas() {
        return similitudCaracteristicas;
    }

    public void setSimilitudCaracteristicas(Double similitudCaracteristicas) {
        this.similitudCaracteristicas = similitudCaracteristicas;
    }

    public Double getDistancia() {
        return distancia;
    }

    public void setDistancia(Double distancia) {
        this.distancia = distancia;
    }

    public Double getPuntajeTotal() {
        return puntajeTotal;
    }

    public void setPuntajeTotal(Double puntajeTotal) {
        this.puntajeTotal = puntajeTotal;
    }

    public EstadoCoincidencia getEstado() {
        return estado;
    }

    public void setEstado(EstadoCoincidencia estado) {
        this.estado = estado;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }

    public Double getSimilitudVisual() {
        return similitudVisual;
    }

    public void setSimilitudVisual(Double similitudVisual) {
        this.similitudVisual = similitudVisual;
    }
}
