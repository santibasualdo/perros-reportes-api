package com.santiago.perrosreportes.coincidencia;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.santiago.perrosreportes.caracteristicas.CaracteristicasFisicasRepository;
import com.santiago.perrosreportes.reporte.Reporte;
import com.santiago.perrosreportes.reporte.ReporteRepository;
import com.santiago.perrosreportes.reporte.TipoReporte;
import com.santiago.perrosreportes.ubicacion.UbicacionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CoincidenciaService {

    private final CoincidenciaRepository coincidenciaRepository;
    private final ReporteRepository reporteRepository;
    private final UbicacionRepository ubicacionRepository;
    private final CaracteristicasFisicasRepository caracteristicasRepository;

    public CoincidenciaService(CoincidenciaRepository coincidenciaRepository,
            ReporteRepository reporteRepository,
            UbicacionRepository ubicacionRepository,
            CaracteristicasFisicasRepository caracteristicasRepository) {
        this.coincidenciaRepository = coincidenciaRepository;
        this.reporteRepository = reporteRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.caracteristicasRepository = caracteristicasRepository;
    }

    public List<CoincidenciaResponse> listarPorReporte(UUID idReporte, UUID idUsuario) {
        Reporte reporte = reporteRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reporte no encontrado"));

        if (!reporte.getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No podés consultar las coincidencias de este reporte");
        }

        List<Coincidencia> coincidencias = coincidenciaRepository
                .findByReportePerdido_IdReporteOrReporteAvistamiento_IdReporte(idReporte, idReporte);
        List<CoincidenciaResponse> respuestas = new ArrayList<>();

        for (Coincidencia coincidencia : coincidencias) {
            CoincidenciaResponse respuesta = convertirAResponse(coincidencia);
            respuestas.add(respuesta);
        }

        return respuestas;
    }

    public CoincidenciaResponse confirmar(UUID idCoincidencia, UUID idUsuario) {
        Coincidencia coincidencia = buscarCoincidenciaAutorizada(idCoincidencia, idUsuario);
        coincidencia.setEstado(EstadoCoincidencia.CONFIRMADA);
        Coincidencia coincidenciaGuardada = coincidenciaRepository.save(coincidencia);

        return convertirAResponse(coincidenciaGuardada);
    }

    public CoincidenciaResponse descartar(UUID idCoincidencia, UUID idUsuario) {
        Coincidencia coincidencia = buscarCoincidenciaAutorizada(idCoincidencia, idUsuario);
        coincidencia.setEstado(EstadoCoincidencia.DESCARTADA);
        Coincidencia coincidenciaGuardada = coincidenciaRepository.save(coincidencia);

        return convertirAResponse(coincidenciaGuardada);
    }

    private List<Reporte> buscarCandidatos(Reporte reporteOrigen) {
        TipoReporte tipoCandidato;

        if (reporteOrigen.getTipo() == TipoReporte.PERDIDO) {
            tipoCandidato = TipoReporte.AVISTAMIENTO;
        } else {
            tipoCandidato = TipoReporte.PERDIDO;
        }

        List<Reporte> reportesActivos = reporteRepository.findByTipoAndEstado(tipoCandidato, "ACTIVO");
        List<Reporte> candidatos = new ArrayList<>();

        for (Reporte reporte : reportesActivos) {
            if (!reporte.getIdUsuario().equals(reporteOrigen.getIdUsuario())) {
                candidatos.add(reporte);
            }
        }

        return candidatos;
    }

    private Coincidencia buscarCoincidenciaAutorizada(UUID idCoincidencia, UUID idUsuario) {
        Coincidencia coincidencia = coincidenciaRepository.findById(idCoincidencia)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Coincidencia no encontrada"));

        boolean esPropietarioPerdido = coincidencia.getReportePerdido().getIdUsuario().equals(idUsuario);
        boolean esPropietarioAvistamiento = coincidencia.getReporteAvistamiento().getIdUsuario().equals(idUsuario);

        if (!esPropietarioPerdido && !esPropietarioAvistamiento) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No podés modificar esta coincidencia");
        }

        return coincidencia;
    }

    private CoincidenciaResponse convertirAResponse(Coincidencia coincidencia) {
        return new CoincidenciaResponse(coincidencia.getIdCoincidencia(),
                coincidencia.getReportePerdido().getIdReporte(),
                coincidencia.getReporteAvistamiento().getIdReporte(),
                coincidencia.getSimilitudCaracteristicas(),
                coincidencia.getDistancia(),
                coincidencia.getPuntajeTotal(),
                coincidencia.getEstado(),
                coincidencia.getCreadoEn(),
                coincidencia.getSimilitudVisual());
    }
}
