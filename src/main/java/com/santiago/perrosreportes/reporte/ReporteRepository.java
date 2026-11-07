package com.santiago.perrosreportes.reporte;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReporteRepository extends JpaRepository<Reporte, UUID> {

    List<Reporte> findByTipoAndEstado(TipoReporte tipo, String estado);
}
