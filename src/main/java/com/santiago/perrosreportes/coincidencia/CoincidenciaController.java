package com.santiago.perrosreportes.coincidencia;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CoincidenciaController {

    private final CoincidenciaService coincidenciaService;

    public CoincidenciaController(CoincidenciaService coincidenciaService) {
        this.coincidenciaService = coincidenciaService;
    }

    @GetMapping("/reportes/{idReporte}/coincidencias")
    public List<CoincidenciaResponse> listarPorReporte(@PathVariable UUID idReporte,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return coincidenciaService.listarPorReporte(idReporte, idUsuario);
    }

    @PatchMapping("/coincidencias/{idCoincidencia}/confirmar")
    public CoincidenciaResponse confirmar(@PathVariable UUID idCoincidencia,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return coincidenciaService.confirmar(idCoincidencia, idUsuario);
    }

    @PatchMapping("/coincidencias/{idCoincidencia}/descartar")
    public CoincidenciaResponse descartar(@PathVariable UUID idCoincidencia,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return coincidenciaService.descartar(idCoincidencia, idUsuario);
    }
}
