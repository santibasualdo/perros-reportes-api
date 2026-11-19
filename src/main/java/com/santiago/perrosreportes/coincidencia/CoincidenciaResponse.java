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
    private final String urlFotografiaReportePerdido;
    private final String urlFotografiaReporteAvistamiento;
    private final OffsetDateTime fechaHoraReportePerdido;
    private final OffsetDateTime fechaHoraReporteAvistamiento;
    private final String nombreReportePerdido;
    private final String nombreReporteAvistamiento;

    public CoincidenciaResponse(UUID idCoincidencia, UUID idReportePerdido,
            UUID idReporteAvistamiento, Double similitudCaracteristicas,
            Double distancia, Double puntajeTotal, EstadoCoincidencia estado,
            OffsetDateTime creadoEn, Double similitudVisual,
            String urlFotografiaReportePerdido, String urlFotografiaReporteAvistamiento,
            OffsetDateTime fechaHoraReportePerdido, OffsetDateTime fechaHoraReporteAvistamiento,
            String nombreReportePerdido, String nombreReporteAvistamiento) {
        this.idCoincidencia = idCoincidencia;
        this.idReportePerdido = idReportePerdido;
        this.idReporteAvistamiento = idReporteAvistamiento;
        this.similitudCaracteristicas = similitudCaracteristicas;
        this.distancia = distancia;
        this.puntajeTotal = puntajeTotal;
        this.estado = estado;
        this.creadoEn = creadoEn;
        this.similitudVisual = similitudVisual;
        this.urlFotografiaReportePerdido = urlFotografiaReportePerdido;
        this.urlFotografiaReporteAvistamiento = urlFotografiaReporteAvistamiento;
        this.fechaHoraReportePerdido = fechaHoraReportePerdido;
        this.fechaHoraReporteAvistamiento = fechaHoraReporteAvistamiento;
        this.nombreReportePerdido = nombreReportePerdido;
        this.nombreReporteAvistamiento = nombreReporteAvistamiento;
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

    public String getUrlFotografiaReportePerdido() {
        return urlFotografiaReportePerdido;
    }

    public String getUrlFotografiaReporteAvistamiento() {
        return urlFotografiaReporteAvistamiento;
    }

    public OffsetDateTime getFechaHoraReportePerdido() {
        return fechaHoraReportePerdido;
    }

    public OffsetDateTime getFechaHoraReporteAvistamiento() {
        return fechaHoraReporteAvistamiento;
    }

    public String getNombreReportePerdido() {
        return nombreReportePerdido;
    }

    public String getNombreReporteAvistamiento() {
        return nombreReporteAvistamiento;
    }
}
