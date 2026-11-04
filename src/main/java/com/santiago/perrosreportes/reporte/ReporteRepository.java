package com.santiago.perrosreportes.reporte;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReporteRepository extends JpaRepository<Reporte, UUID> {
}
