package com.santiago.perrosreportes.caracteristicas;

import java.util.UUID;

import com.santiago.perrosreportes.reporte.Reporte;
import com.santiago.perrosreportes.reporte.ReporteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CaracteristicasFisicasService {

    private final CaracteristicasFisicasRepository caracteristicasRepository;
    private final ReporteRepository reporteRepository;

    public CaracteristicasFisicasService(
            CaracteristicasFisicasRepository caracteristicasRepository,
            ReporteRepository reporteRepository) {
        this.caracteristicasRepository = caracteristicasRepository;
        this.reporteRepository = reporteRepository;
    }

    public CaracteristicasFisicas crear(
            UUID idReporte,
            CrearCaracteristicasFisicasRequest datos,
            UUID idUsuario) {
        Reporte reporte = reporteRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reporte no encontrado"));

        if (!reporte.getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No podés agregar características a este reporte");
        }

        if (caracteristicasRepository.existsById(idReporte)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El reporte ya tiene características físicas");
        }

        CaracteristicasFisicas caracteristicas = new CaracteristicasFisicas();
        caracteristicas.setReporte(reporte);
        caracteristicas.setTamano(datos.getTamano());
        caracteristicas.setColor(datos.getColor());
        caracteristicas.setRaza(datos.getRaza());
        caracteristicas.setSexo(datos.getSexo());
        caracteristicas.setSenasParticulares(datos.getSenasParticulares());

        return caracteristicasRepository.save(caracteristicas);
    }

    public CaracteristicasFisicas buscarPorIdReporte(UUID idReporte) {
        return caracteristicasRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Características físicas no encontradas"));
    }
}
