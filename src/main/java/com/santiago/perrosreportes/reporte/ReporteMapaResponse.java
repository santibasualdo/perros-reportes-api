package com.santiago.perrosreportes.reporte;

import java.util.UUID;

public class ReporteMapaResponse {

    private final UUID idReporte;
    private final TipoReporte tipo;
    private final String nombre;
    private final Double latitud;
    private final Double longitud;

    public ReporteMapaResponse(UUID idReporte, TipoReporte tipo, String nombre,
            Double latitud, Double longitud) {
        this.idReporte = idReporte;
        this.tipo = tipo;
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public UUID getIdReporte() {
        return idReporte;
    }

    public TipoReporte getTipo() {
        return tipo;
    }

    public String getNombre() {
        return nombre;
    }

    public Double getLatitud() {
        return latitud;
    }

    public Double getLongitud() {
        return longitud;
    }
}
