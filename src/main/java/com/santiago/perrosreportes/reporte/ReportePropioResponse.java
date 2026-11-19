package com.santiago.perrosreportes.reporte;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.santiago.perrosreportes.ubicacion.UbicacionResponse;

public class ReportePropioResponse {

    private final UUID idReporte;
    private final TipoReporte tipo;
    private final String nombre;
    private final OffsetDateTime fechaHora;
    private final String estado;
    private final String urlFotografia;
    private final UbicacionResponse ubicacion;

    public ReportePropioResponse(UUID idReporte,
            TipoReporte tipo,
            String nombre,
            OffsetDateTime fechaHora,
            String estado,
            String urlFotografia,
            UbicacionResponse ubicacion) {
        this.idReporte = idReporte;
        this.tipo = tipo;
        this.nombre = nombre;
        this.fechaHora = fechaHora;
        this.estado = estado;
        this.urlFotografia = urlFotografia;
        this.ubicacion = ubicacion;
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

    public OffsetDateTime getFechaHora() {
        return fechaHora;
    }

    public String getEstado() {
        return estado;
    }

    public String getUrlFotografia() {
        return urlFotografia;
    }

    public UbicacionResponse getUbicacion() {
        return ubicacion;
    }
}
