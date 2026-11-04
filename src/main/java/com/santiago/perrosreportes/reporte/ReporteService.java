package com.santiago.perrosreportes.reporte;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReporteService {

    private final ReporteRepository reporteRepository;

    public ReporteService(ReporteRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }

    public Reporte crear(CrearReporteRequest datos, UUID idUsuario) {
        Reporte reporte = new Reporte();
        reporte.setIdUsuario(idUsuario);
        reporte.setTipo(datos.getTipo());
        reporte.setNombre(datos.getNombre());
        reporte.setDescripcion(datos.getDescripcion());
        reporte.setFechaHora(datos.getFechaHora());
        reporte.setEstado("ACTIVO");

        return reporteRepository.save(reporte);
    }

    public List<Reporte> listar() {
        return reporteRepository.findAll();
    }

    public Reporte buscarPorId(UUID idReporte) {
        return reporteRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reporte no encontrado"));
    }
}
