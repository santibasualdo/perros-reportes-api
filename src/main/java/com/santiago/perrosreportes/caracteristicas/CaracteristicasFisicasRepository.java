package com.santiago.perrosreportes.caracteristicas;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CaracteristicasFisicasRepository
        extends JpaRepository<CaracteristicasFisicas, UUID> {
}
