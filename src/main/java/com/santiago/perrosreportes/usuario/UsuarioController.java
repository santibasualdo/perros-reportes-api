package com.santiago.perrosreportes.usuario;

import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario crearPerfil(
            @Valid @RequestBody CrearUsuarioRequest datos,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());
        String correoElectronico = jwt.getClaimAsString("email");
        return usuarioService.crearPerfil(datos, idUsuario, correoElectronico);
    }

    @GetMapping("/yo")
    public Map<String, String> consultarUsuarioAutenticado(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("usuarioId", jwt.getSubject());
    }
}
