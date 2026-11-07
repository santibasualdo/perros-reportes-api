package com.santiago.perrosreportes.fotografia;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.santiago.perrosreportes.reporte.Reporte;
import com.santiago.perrosreportes.reporte.ReporteRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FotografiaService {

    private final FotografiaRepository fotografiaRepository;
    private final ReporteRepository reporteRepository;
    private final SupabaseStorageService supabaseStorageService;

    public FotografiaService(FotografiaRepository fotografiaRepository,
            ReporteRepository reporteRepository,
            SupabaseStorageService supabaseStorageService) {
        this.fotografiaRepository = fotografiaRepository;
        this.reporteRepository = reporteRepository;
        this.supabaseStorageService = supabaseStorageService;
    }

    // Crear fotografia

    public Fotografia crear(UUID idReporte, MultipartFile archivo, UUID idUsuario) {
        Reporte reporte = reporteRepository.findById(idReporte)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reporte no encontrado"));

        if (!reporte.getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No podés agregar fotografías a este reporte");
        }

        String ruta = idReporte + "/" + UUID.randomUUID() + obtenerExtension(archivo.getContentType());
        String rutaGuardada = supabaseStorageService.subir(ruta, archivo);

        Fotografia fotografia = new Fotografia();
        fotografia.setReporte(reporte);
        fotografia.setUrl(rutaGuardada);

        return fotografiaRepository.save(fotografia);
    }


    // Listar fotografias por reporte

    public List<FotografiaResponse> listarPorReporte(UUID idReporte) {
        if (!reporteRepository.existsById(idReporte)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Reporte no encontrado");
        }

        List<Fotografia> fotografias = fotografiaRepository.findByReporte_IdReporte(idReporte);
        List<FotografiaResponse> respuestas = new ArrayList<>();

        for (Fotografia fotografia : fotografias) {
            String urlFirmada = supabaseStorageService.generarUrlFirmada(fotografia.getUrl());
            FotografiaResponse respuesta = new FotografiaResponse(fotografia.getIdFotografia(),
                    urlFirmada,
                    fotografia.getCreadoEn());
            respuestas.add(respuesta);
        }

        return respuestas;
    }

    private String obtenerExtension(String tipoContenido) {
        if ("image/jpeg".equals(tipoContenido)) {
            return ".jpg";
        }
        if ("image/png".equals(tipoContenido)) {
            return ".png";
        }
        if ("image/webp".equals(tipoContenido)) {
            return ".webp";
        }
        return "";
    }
}
