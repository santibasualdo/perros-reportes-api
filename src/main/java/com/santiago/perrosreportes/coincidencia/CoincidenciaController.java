package com.santiago.perrosreportes.coincidencia;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CoincidenciaController {

    private final CoincidenciaService coincidenciaService;

    public CoincidenciaController(CoincidenciaService coincidenciaService) {
        this.coincidenciaService = coincidenciaService;
    }

    // Coincidencias de un reporte
    @GetMapping("/reportes/{idReporte}/coincidencias")
    public List<CoincidenciaResponse> listarPorReporte(@PathVariable UUID idReporte,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return coincidenciaService.listarPorReporte(idReporte, idUsuario);
    }

    // Genera las coincidencias de un reporte
    @PostMapping("/reportes/{idReporte}/coincidencias")
    public List<CoincidenciaResponse> generarCoincidencias(@PathVariable UUID idReporte,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return coincidenciaService.generarCoincidencias(idReporte, idUsuario);
    }

    // Confirma una coincidencia
    @PatchMapping("/coincidencias/{idCoincidencia}/confirmar")
    public CoincidenciaResponse confirmar(@PathVariable UUID idCoincidencia,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return coincidenciaService.confirmar(idCoincidencia, idUsuario);
    }

    // Descarta una coincidencia
    @PatchMapping("/coincidencias/{idCoincidencia}/descartar")
    public CoincidenciaResponse descartar(@PathVariable UUID idCoincidencia,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return coincidenciaService.descartar(idCoincidencia, idUsuario);
    }
}
