package com.santiago.perrosreportes.fotografia;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/reportes")
public class FotografiaController {

    private final FotografiaService fotografiaService;

    public FotografiaController(FotografiaService fotografiaService) {
        this.fotografiaService = fotografiaService;
    }

    @PostMapping("/{idReporte}/fotografias")
    @ResponseStatus(HttpStatus.CREATED)
    public Fotografia crear(@PathVariable UUID idReporte,
            @RequestParam("archivo") MultipartFile archivo,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        return fotografiaService.crear(idReporte, archivo, idUsuario);
    }

    @GetMapping("/{idReporte}/fotografias")
    public List<FotografiaResponse> listarPorReporte(@PathVariable UUID idReporte) {
        return fotografiaService.listarPorReporte(idReporte);
    }
}
