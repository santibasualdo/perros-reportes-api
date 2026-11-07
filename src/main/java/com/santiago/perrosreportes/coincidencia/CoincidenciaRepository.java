package com.santiago.perrosreportes.coincidencia;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CoincidenciaRepository extends JpaRepository<Coincidencia, UUID> {

    boolean existsByReportePerdido_IdReporteAndReporteAvistamiento_IdReporte(UUID idReportePerdido,
            UUID idReporteAvistamiento);

    List<Coincidencia> findByReportePerdido_IdReporteOrReporteAvistamiento_IdReporte(UUID idReportePerdido,
            UUID idReporteAvistamiento);
}
