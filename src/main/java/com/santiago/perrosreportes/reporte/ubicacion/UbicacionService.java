package com.santiago.perrosreportes.reporte.ubicacion;

import java.util.UUID;

import com.santiago.perrosreportes.reporte.Reporte;
import com.santiago.perrosreportes.reporte.ReporteRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UbicacionService {

    private final UbicacionRepository ubicacionRepository;
    private final ReporteRepository reporteRepository;

    public UbicacionService(
            UbicacionRepository ubicacionRepository,
            ReporteRepository reporteRepository) {
        this.ubicacionRepository = ubicacionRepository;
        this.reporteRepository = reporteRepository;
    }

    public Ubicacion crear(UUID idReporte, CrearUbicacionRequest datos, UUID idUsuario) {
        Reporte reporte = reporteRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reporte no encontrado"));

        if (!reporte.getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No podés agregar una ubicación a este reporte");
        }

        if (ubicacionRepository.existsById(idReporte)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El reporte ya tiene una ubicación");
        }

        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setReporte(reporte);
        ubicacion.setLatitud(datos.getLatitud());
        ubicacion.setLongitud(datos.getLongitud());
        ubicacion.setDireccion(datos.getDireccion());

        return ubicacionRepository.save(ubicacion);
    }

    public Ubicacion buscarPorIdReporte(UUID idReporte) {
        return ubicacionRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ubicación no encontrada"));
    }
}
