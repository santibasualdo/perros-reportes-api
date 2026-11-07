package com.santiago.perrosreportes.caracteristicas;

import jakarta.validation.constraints.NotBlank;

public class CrearCaracteristicasFisicasRequest {

    @NotBlank(message = "El tamaño es obligatorio")
    private String tamano;

    @NotBlank(message = "El color es obligatorio")
    private String color;

    private String raza;
    private SexoPerro sexo;
    private String senasParticulares;

    public CrearCaracteristicasFisicasRequest() {
    }

    public String getTamano() {
        return tamano;
    }

    public void setTamano(String tamano) {
        this.tamano = tamano;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getRaza() {
        return raza;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }

    public SexoPerro getSexo() {
        return sexo;
    }

    public void setSexo(SexoPerro sexo) {
        this.sexo = sexo;
    }

    public String getSenasParticulares() {
        return senasParticulares;
    }

    public void setSenasParticulares(String senasParticulares) {
        this.senasParticulares = senasParticulares;
    }
}
