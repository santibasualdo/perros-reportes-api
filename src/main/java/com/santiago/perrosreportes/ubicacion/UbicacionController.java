package com.santiago.perrosreportes.ubicacion;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
public class UbicacionController {

    private final UbicacionService ubicacionService;

    public UbicacionController(UbicacionService ubicacionService) {
        this.ubicacionService = ubicacionService;
    }

    @PostMapping("/{idReporte}/ubicacion")
    @ResponseStatus(HttpStatus.CREATED)
    public Ubicacion crear(
            @PathVariable UUID idReporte,
            @Valid @RequestBody CrearUbicacionRequest datos,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return ubicacionService.crear(idReporte, datos, idUsuario);
    }

    @GetMapping("/{idReporte}/ubicacion")
    public Ubicacion buscarPorIdReporte(@PathVariable UUID idReporte) {
        return ubicacionService.buscarPorIdReporte(idReporte);
    }
}
