package com.santiago.perrosreportes.reporte.ubicacion;

import java.util.UUID;

import com.santiago.perrosreportes.reporte.Reporte;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ubicacion", schema = "public")
public class Ubicacion {

    @Id
    @Column(name = "id_reporte")
    private UUID idReporte;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "id_reporte")
    private Reporte reporte;

    @Column(name = "latitud", nullable = false)
    private Double latitud;

    @Column(name = "longitud", nullable = false)
    private Double longitud;

    @Column(name = "direccion")
    private String direccion;

    public UUID getIdReporte() {
        return idReporte;
    }

    public Reporte getReporte() {
        return reporte;
    }

    public void setReporte(Reporte reporte) {
        this.reporte = reporte;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}
