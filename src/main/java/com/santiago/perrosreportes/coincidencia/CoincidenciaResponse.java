package com.santiago.perrosreportes.coincidencia;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CoincidenciaResponse {

    private final UUID idCoincidencia;
    private final UUID idReportePerdido;
    private final UUID idReporteAvistamiento;
    private final Double similitudCaracteristicas;
    private final Double distancia;
    private final Double puntajeTotal;
    private final EstadoCoincidencia estado;
    private final OffsetDateTime creadoEn;
    private final Double similitudVisual;

    public CoincidenciaResponse(UUID idCoincidencia, UUID idReportePerdido,
            UUID idReporteAvistamiento, Double similitudCaracteristicas,
            Double distancia, Double puntajeTotal, EstadoCoincidencia estado,
            OffsetDateTime creadoEn, Double similitudVisual) {
        this.idCoincidencia = idCoincidencia;
        this.idReportePerdido = idReportePerdido;
        this.idReporteAvistamiento = idReporteAvistamiento;
        this.similitudCaracteristicas = similitudCaracteristicas;
        this.distancia = distancia;
        this.puntajeTotal = puntajeTotal;
        this.estado = estado;
        this.creadoEn = creadoEn;
        this.similitudVisual = similitudVisual;
    }

    public UUID getIdCoincidencia() {
        return idCoincidencia;
    }

    public UUID getIdReportePerdido() {
        return idReportePerdido;
    }

    public UUID getIdReporteAvistamiento() {
        return idReporteAvistamiento;
    }

    public Double getSimilitudCaracteristicas() {
        return similitudCaracteristicas;
    }

    public Double getDistancia() {
        return distancia;
    }

    public Double getPuntajeTotal() {
        return puntajeTotal;
    }

    public EstadoCoincidencia getEstado() {
        return estado;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }

    public Double getSimilitudVisual() {
        return similitudVisual;
    }
}
