package com.santiago.perrosreportes.caracteristicas;

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
public class CaracteristicasFisicasController {

    private final CaracteristicasFisicasService caracteristicasService;

    public CaracteristicasFisicasController(
            CaracteristicasFisicasService caracteristicasService) {
        this.caracteristicasService = caracteristicasService;
    }

    @PostMapping("/{idReporte}/caracteristicas")
    @ResponseStatus(HttpStatus.CREATED)
    public CaracteristicasFisicas crear(
            @PathVariable UUID idReporte,
            @Valid @RequestBody CrearCaracteristicasFisicasRequest datos,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return caracteristicasService.crear(idReporte, datos, idUsuario);
    }

    @GetMapping("/{idReporte}/caracteristicas")
    public CaracteristicasFisicasResponse buscarPorIdReporte(@PathVariable UUID idReporte) {
        return caracteristicasService.buscarPorIdReporte(idReporte);
    }
}
