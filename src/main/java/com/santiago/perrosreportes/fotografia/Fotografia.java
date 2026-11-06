package com.santiago.perrosreportes.fotografia;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.santiago.perrosreportes.reporte.Reporte;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "fotografia", schema = "public")
public class Fotografia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_fotografia")
    private UUID idFotografia;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reporte", nullable = false)
    private Reporte reporte;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private OffsetDateTime creadoEn;

    public UUID getIdFotografia() {
        return idFotografia;
    }

    public Reporte getReporte() {
        return reporte;
    }

    public void setReporte(Reporte reporte) {
        this.reporte = reporte;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }
}
