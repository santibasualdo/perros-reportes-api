package com.santiago.perrosreportes.conversacion;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coincidencias/{idCoincidencia}/mensajes")
public class MensajeController {

    private final MensajeService mensajeService;

    public MensajeController(MensajeService mensajeService) {
        this.mensajeService = mensajeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MensajeResponse enviar(@PathVariable UUID idCoincidencia,
            @Valid @RequestBody EnviarMensajeRequest datos,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());

        return mensajeService.enviarMensaje(idCoincidencia, idUsuario, datos);
    }

    @GetMapping
    public List<MensajeResponse> listar(@PathVariable UUID idCoincidencia,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());

        return mensajeService.listarMensajes(idCoincidencia, idUsuario);
    }

    @PatchMapping("/leidos")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarComoLeidos(@PathVariable UUID idCoincidencia,
            @AuthenticationPrincipal Jwt jwt) {
        UUID idUsuario = UUID.fromString(jwt.getSubject());

        mensajeService.marcarMensajesComoLeidos(idCoincidencia, idUsuario);
    }
}
