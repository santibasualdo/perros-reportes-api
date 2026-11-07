package com.santiago.perrosreportes.reporte;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.santiago.perrosreportes.fotografia.FotografiaResponse;
import com.santiago.perrosreportes.caracteristicas.CaracteristicasFisicasResponse;
import com.santiago.perrosreportes.ubicacion.UbicacionResponse;

public class ReporteDetalleResponse {

    private final UUID idReporte;
    private final UUID idUsuario;
    private final TipoReporte tipo;
    private final String nombre;
    private final String descripcion;
    private final OffsetDateTime fechaHora;
    private final String estado;
    private final OffsetDateTime creadoEn;
    private final UbicacionResponse ubicacion;
    private final CaracteristicasFisicasResponse caracteristicas;
    private final List<FotografiaResponse> fotografias;

    public ReporteDetalleResponse(UUID idReporte, UUID idUsuario, TipoReporte tipo,
            String nombre, String descripcion, OffsetDateTime fechaHora,
            String estado, OffsetDateTime creadoEn, UbicacionResponse ubicacion,
            CaracteristicasFisicasResponse caracteristicas, List<FotografiaResponse> fotografias) {
        this.idReporte = idReporte;
        this.idUsuario = idUsuario;
        this.tipo = tipo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fechaHora = fechaHora;
        this.estado = estado;
        this.creadoEn = creadoEn;
        this.ubicacion = ubicacion;
        this.caracteristicas = caracteristicas;
        this.fotografias = fotografias;
    }

    public UUID getIdReporte() {
        return idReporte;
    }

    public UUID getIdUsuario() {
        return idUsuario;
    }

    public TipoReporte getTipo() {
        return tipo;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public OffsetDateTime getFechaHora() {
        return fechaHora;
    }

    public String getEstado() {
        return estado;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }

    public UbicacionResponse getUbicacion() {
        return ubicacion;
    }

    public CaracteristicasFisicasResponse getCaracteristicas() {
        return caracteristicas;
    }

    public List<FotografiaResponse> getFotografias() {
        return fotografias;
    }
}
