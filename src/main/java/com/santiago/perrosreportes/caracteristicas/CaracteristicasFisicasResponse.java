package com.santiago.perrosreportes.caracteristicas;

public class CaracteristicasFisicasResponse {

    private final String tamano;
    private final String color;
    private final String raza;
    private final SexoPerro sexo;
    private final String senasParticulares;

    public CaracteristicasFisicasResponse(String tamano, String color, String raza,
            SexoPerro sexo, String senasParticulares) {
        this.tamano = tamano;
        this.color = color;
        this.raza = raza;
        this.sexo = sexo;
        this.senasParticulares = senasParticulares;
    }

    public String getTamano() {
        return tamano;
    }

    public String getColor() {
        return color;
    }

    public String getRaza() {
        return raza;
    }

    public SexoPerro getSexo() {
        return sexo;
    }

    public String getSenasParticulares() {
        return senasParticulares;
    }
}
