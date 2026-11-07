package com.santiago.perrosreportes.ubicacion;

public class UbicacionResponse {

    private final Double latitud;
    private final Double longitud;
    private final String direccion;

    public UbicacionResponse(Double latitud, Double longitud, String direccion) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.direccion = direccion;
    }

    public Double getLatitud() {
        return latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public String getDireccion() {
        return direccion;
    }
}
