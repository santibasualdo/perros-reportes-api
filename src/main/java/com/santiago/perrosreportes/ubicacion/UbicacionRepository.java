package com.santiago.perrosreportes.ubicacion;

import java.util.List;
import java.util.UUID;

import com.santiago.perrosreportes.reporte.ReporteMapaResponse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UbicacionRepository extends JpaRepository<Ubicacion, UUID> {

    @Query("""
            SELECT new com.santiago.perrosreportes.reporte.ReporteMapaResponse(
                    reporte.idReporte, reporte.tipo, reporte.nombre,
                    ubicacion.latitud, ubicacion.longitud)
            FROM Ubicacion ubicacion
            JOIN ubicacion.reporte reporte
            WHERE reporte.estado = 'ACTIVO'
            """)
    List<ReporteMapaResponse> listarReportesActivosParaMapa();
}
