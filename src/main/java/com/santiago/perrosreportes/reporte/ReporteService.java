package com.santiago.perrosreportes.reporte;

import java.util.List;
import java.util.UUID;

import com.santiago.perrosreportes.caracteristicas.CaracteristicasFisicas;
import com.santiago.perrosreportes.caracteristicas.CaracteristicasFisicasRepository;
import com.santiago.perrosreportes.caracteristicas.CaracteristicasFisicasResponse;
import com.santiago.perrosreportes.fotografia.FotografiaResponse;
import com.santiago.perrosreportes.fotografia.FotografiaService;
import com.santiago.perrosreportes.ubicacion.Ubicacion;
import com.santiago.perrosreportes.ubicacion.UbicacionRepository;
import com.santiago.perrosreportes.ubicacion.UbicacionResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReporteService {

    private final ReporteRepository reporteRepository;
    private final UbicacionRepository ubicacionRepository;
    private final CaracteristicasFisicasRepository caracteristicasRepository;
    private final FotografiaService fotografiaService;

    public ReporteService(ReporteRepository reporteRepository,
            UbicacionRepository ubicacionRepository,
            CaracteristicasFisicasRepository caracteristicasRepository,
            FotografiaService fotografiaService) {
        this.reporteRepository = reporteRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.caracteristicasRepository = caracteristicasRepository;
        this.fotografiaService = fotografiaService;
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

    public ReporteDetalleResponse buscarDetallePorId(UUID idReporte) {
        Reporte reporte = buscarPorId(idReporte);

        Ubicacion ubicacion = ubicacionRepository.findById(idReporte).orElse(null);
        UbicacionResponse ubicacionResponse = null;

        if (ubicacion != null) {
            ubicacionResponse = new UbicacionResponse(ubicacion.getLatitud(),
                    ubicacion.getLongitud(),
                    ubicacion.getDireccion());
        }

        CaracteristicasFisicas caracteristicas = caracteristicasRepository.findById(idReporte).orElse(null);
        CaracteristicasFisicasResponse caracteristicasResponse = null;

        if (caracteristicas != null) {
            caracteristicasResponse = new CaracteristicasFisicasResponse(caracteristicas.getTamano(),
                    caracteristicas.getColor(),
                    caracteristicas.getRaza(),
                    caracteristicas.getSexo(),
                    caracteristicas.getSenasParticulares());
        }

        List<FotografiaResponse> fotografias = fotografiaService.listarPorReporte(idReporte);

        return new ReporteDetalleResponse(reporte.getIdReporte(),
                reporte.getIdUsuario(),
                reporte.getTipo(),
                reporte.getNombre(),
                reporte.getDescripcion(),
                reporte.getFechaHora(),
                reporte.getEstado(),
                reporte.getCreadoEn(),
                ubicacionResponse,
                caracteristicasResponse,
                fotografias);
    }
}
