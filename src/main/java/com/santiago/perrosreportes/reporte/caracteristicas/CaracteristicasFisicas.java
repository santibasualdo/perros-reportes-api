package com.santiago.perrosreportes.reporte.caracteristicas;

import java.util.UUID;

import com.santiago.perrosreportes.reporte.Reporte;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "caracteristicas_fisicas", schema = "public")
public class CaracteristicasFisicas {

    @Id
    @Column(name = "id_reporte")
    private UUID idReporte;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "id_reporte")
    private Reporte reporte;

    @Column(name = "tamano", nullable = false)
    private String tamano;

    @Column(name = "color", nullable = false)
    private String color;

    @Column(name = "raza")
    private String raza;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo")
    private SexoPerro sexo;

    @Column(name = "senas_particulares")
    private String senasParticulares;

    public UUID getIdReporte() {
        return idReporte;
    }

    public Reporte getReporte() {
        return reporte;
    }

    public void setReporte(Reporte reporte) {
        this.reporte = reporte;
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
