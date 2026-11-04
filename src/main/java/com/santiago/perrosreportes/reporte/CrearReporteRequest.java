package com.santiago.perrosreportes.reporte;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;

public class CrearReporteRequest {

    @NotNull(message = "El tipo es obligatorio")
    private TipoReporte tipo;
    private String nombre;
    private String descripcion;
    @NotNull(message = "La fecha y hora son obligatorias")
    private OffsetDateTime fechaHora;

    public CrearReporteRequest() {
    }

    public TipoReporte getTipo() {
        return tipo;
    }

    public void setTipo(TipoReporte tipo) {
        this.tipo = tipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public OffsetDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(OffsetDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
}
