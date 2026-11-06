package com.santiago.perrosreportes.fotografia;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FotografiaRepository extends JpaRepository<Fotografia, UUID> {

    List<Fotografia> findByReporte_IdReporte(UUID idReporte);
}
