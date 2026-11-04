package com.santiago.perrosreportes.reporte.ubicacion;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UbicacionRepository extends JpaRepository<Ubicacion, UUID> {
}
