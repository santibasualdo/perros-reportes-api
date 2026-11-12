package com.santiago.perrosreportes.coincidencia;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.santiago.perrosreportes.caracteristicas.CaracteristicasFisicas;
import com.santiago.perrosreportes.caracteristicas.CaracteristicasFisicasRepository;
import com.santiago.perrosreportes.reporte.Reporte;
import com.santiago.perrosreportes.reporte.ReporteRepository;
import com.santiago.perrosreportes.reporte.TipoReporte;
import com.santiago.perrosreportes.ubicacion.Ubicacion;
import com.santiago.perrosreportes.ubicacion.UbicacionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CoincidenciaService {

    private static final double RADIO_TIERRA_KM = 6371.0;

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

    public List<CoincidenciaResponse> generarCoincidencias(UUID idReporte, UUID idUsuario) {
        Reporte reporteOrigen = reporteRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reporte no encontrado"));

        if (!reporteOrigen.getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No podés generar coincidencias para este reporte");
        }

        if (!"ACTIVO".equals(reporteOrigen.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden generar coincidencias para reportes activos");
        }

        // consigue una lista de los candidatos posibles
        List<Reporte> candidatos = buscarCandidatos(reporteOrigen);
        List<CoincidenciaResponse> respuestas = new ArrayList<>();
        CaracteristicasFisicas caracteristicasOrigen = caracteristicasRepository.findById(idReporte).orElse(null);
        Ubicacion ubicacionOrigen = ubicacionRepository.findById(idReporte).orElse(null);

        if (caracteristicasOrigen == null) {
            return respuestas;
        }

        if (ubicacionOrigen == null) {
            return respuestas;
        }

        for (Reporte candidato : candidatos) {
            Reporte reportePerdido;
            Reporte reporteAvistamiento;

            if (reporteOrigen.getTipo() == TipoReporte.PERDIDO) {
                reportePerdido = reporteOrigen;
                reporteAvistamiento = candidato;
            } else {
                reportePerdido = candidato;
                reporteAvistamiento = reporteOrigen;
            }


            // Comprobar que los reportes coincidan en fecha
            long diferenciaDias = calcularDiferenciaDias(reporteOrigen, candidato);

            if (diferenciaDias < 0) {
                continue;
            }

            // Caracteristicas fisicas del candidato
            CaracteristicasFisicas caracteristicasCandidato = caracteristicasRepository
                    .findById(candidato.getIdReporte())
                    .orElse(null);

            if (caracteristicasCandidato == null) {
                continue;
            }

            // ubicacion del candidato
            Ubicacion ubicacionCandidato = ubicacionRepository
                    .findById(candidato.getIdReporte())
                    .orElse(null);

            if (ubicacionCandidato == null) {
                continue;
            }
            // Distancia entre los dos reportes
            double distancia = calcularDistancia(ubicacionOrigen, ubicacionCandidato);


            // Calcula puntaje en base a los dos reportes
            double puntajeCaracteristicas = calcularPuntajeCaracteristicas(
                    caracteristicasOrigen,
                    caracteristicasCandidato);
            double puntajeDistancia = calcularPuntajeDistancia(distancia);
            double puntajeTiempo = calcularPuntajeTiempo(diferenciaDias);

            double puntajeTotal = calcularPuntajeTotal(
                    puntajeCaracteristicas,
                    puntajeDistancia,
                    puntajeTiempo);

            if (puntajeTotal < 60) {
                continue;
            }

            // verifica si la coincidencia entre los reportes ya existe
            boolean yaExiste = coincidenciaRepository
                    .existsByReportePerdido_IdReporteAndReporteAvistamiento_IdReporte(
                            reportePerdido.getIdReporte(),
                            reporteAvistamiento.getIdReporte());

            if (yaExiste) {
                continue;
            }

            Coincidencia coincidencia = crearCoincidencia(
                    reportePerdido,
                    reporteAvistamiento,
                    puntajeCaracteristicas,
                    distancia,
                    puntajeTotal);
            Coincidencia coincidenciaGuardada = coincidenciaRepository.save(coincidencia);
            respuestas.add(convertirAResponse(coincidenciaGuardada));
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

    // Metodo para calcular similitudes fisicas
    private double calcularPuntajeCaracteristicas(CaracteristicasFisicas origen,
            CaracteristicasFisicas candidato) {
        double puntaje = 0;

        if (coincidenTextos(origen.getColor(), candidato.getColor())) {
            puntaje += 25;
        }

        if (coincidenTextos(origen.getTamano(), candidato.getTamano())) {
            puntaje += 25;
        }

        if (coincidenTextos(origen.getRaza(), candidato.getRaza())) {
            puntaje += 25;
        }

        if (origen.getSexo() != null && origen.getSexo() == candidato.getSexo()) {
            puntaje += 25;
        }

        return puntaje;
    }


    private boolean coincidenTextos(String primerValor, String segundoValor) {
        return primerValor != null
                && segundoValor != null
                && primerValor.trim().equalsIgnoreCase(segundoValor.trim());
    }

    // Metodo para calcular la distancia
    private double calcularDistancia(Ubicacion origen, Ubicacion candidato) {
        double latitudOrigen = Math.toRadians(origen.getLatitud());
        double latitudCandidato = Math.toRadians(candidato.getLatitud());
        double diferenciaLatitud = Math.toRadians(candidato.getLatitud() - origen.getLatitud());
        double diferenciaLongitud = Math.toRadians(candidato.getLongitud() - origen.getLongitud());

        // formula de haversine
        double a = Math.pow(Math.sin(diferenciaLatitud / 2), 2)
                + Math.cos(latitudOrigen)
                * Math.cos(latitudCandidato)
                * Math.pow(Math.sin(diferenciaLongitud / 2), 2);

        double distanciaAngular = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return RADIO_TIERRA_KM * distanciaAngular;
    }

    private double calcularPuntajeDistancia(double distancia) {
        if (distancia <= 1.5) {
            return 100;
        }
        if (distancia <= 5) {
            return 70;
        }
        if (distancia <= 8) {
            return 40;
        }
        if (distancia <= 15) {
            return 20;
        }
        return 5;
    }

    // calcular la diferencia de dias entre los dos reportes
    private long calcularDiferenciaDias(Reporte reporteOrigen, Reporte candidato) {
        Reporte reportePerdido;
        Reporte reporteAvistamiento;

        if (reporteOrigen.getTipo() == TipoReporte.PERDIDO) {
            reportePerdido = reporteOrigen;
            reporteAvistamiento = candidato;
        } else {
            reportePerdido = candidato;
            reporteAvistamiento = reporteOrigen;
        }

        if (reporteAvistamiento.getFechaHora().isBefore(reportePerdido.getFechaHora())) {
            return -1;
        }

        return Duration.between(reportePerdido.getFechaHora(), reporteAvistamiento.getFechaHora()).toDays();
    }

    private double calcularPuntajeTiempo(long diferenciaDias) {
        if (diferenciaDias <= 1) {
            return 100;
        }
        if (diferenciaDias <= 3) {
            return 80;
        }
        if (diferenciaDias <= 7) {
            return 60;
        }
        if (diferenciaDias <= 14) {
            return 40;
        }
        if (diferenciaDias <= 30) {
            return 20;
        }
        return 5;
    }

    private double calcularPuntajeTotal(double puntajeCaracteristicas,
            double puntajeDistancia,
            double puntajeTiempo) {
        return puntajeCaracteristicas * 0.50
                + puntajeDistancia * 0.30
                + puntajeTiempo * 0.20;
    }

    private Coincidencia crearCoincidencia(Reporte reportePerdido,
            Reporte reporteAvistamiento,
            double puntajeCaracteristicas,
            double distancia,
            double puntajeTotal) {
        Coincidencia coincidencia = new Coincidencia();
        coincidencia.setReportePerdido(reportePerdido);
        coincidencia.setReporteAvistamiento(reporteAvistamiento);
        coincidencia.setSimilitudCaracteristicas(puntajeCaracteristicas);
        coincidencia.setDistancia(distancia);
        coincidencia.setPuntajeTotal(puntajeTotal);
        coincidencia.setEstado(EstadoCoincidencia.PENDIENTE);

        return coincidencia;
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
