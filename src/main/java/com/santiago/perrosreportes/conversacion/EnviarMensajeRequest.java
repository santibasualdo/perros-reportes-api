package com.santiago.perrosreportes.conversacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EnviarMensajeRequest {

    @NotBlank(message = "El contenido del mensaje es obligatorio")
    @Size(max = 1000, message = "El contenido del mensaje no puede superar los 1000 caracteres")
    private String contenido;

    public EnviarMensajeRequest() {
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }
}
