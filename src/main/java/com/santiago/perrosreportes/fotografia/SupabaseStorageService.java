package com.santiago.perrosreportes.fotografia;

import java.io.IOException;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SupabaseStorageService {

    private static final long TAMANO_MAXIMO = 5L * 1024 * 1024;
    private static final int DURACION_URL_FIRMADA = 600;
    private static final Set<String> TIPOS_PERMITIDOS = Set.of("image/jpeg", "image/png", "image/webp");

    private final RestClient supabaseStorageRestClient;
    private final String bucket;
    private final String supabaseUrl;

    public SupabaseStorageService(RestClient supabaseStorageRestClient,
            @Value("${supabase.storage.bucket}") String bucket,
            @Value("${supabase.url}") String supabaseUrl) {
        this.supabaseStorageRestClient = supabaseStorageRestClient;
        this.bucket = bucket;
        this.supabaseUrl = supabaseUrl;
    }

    public String subir(String ruta, MultipartFile archivo) {
        validarArchivo(archivo);

        try {
            supabaseStorageRestClient.post()
                    .uri(uriBuilder -> uriBuilder.pathSegment("object", bucket).path("/").path(ruta).build())
                    .contentType(MediaType.parseMediaType(archivo.getContentType()))
                    .body(archivo.getBytes())
                    .retrieve()
                    .toBodilessEntity();
        } catch (IOException excepcion) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo leer el archivo",
                    excepcion);
        }

        return ruta;
    }

    public String generarUrlFirmada(String ruta) {
        RespuestaUrlFirmada respuesta = supabaseStorageRestClient.post()
                .uri(uriBuilder -> uriBuilder.pathSegment("object", "sign", bucket).path("/").path(ruta).build())
                .contentType(MediaType.APPLICATION_JSON)
                .body(new SolicitudUrlFirmada(DURACION_URL_FIRMADA))
                .retrieve()
                .body(RespuestaUrlFirmada.class);

        if (respuesta == null || respuesta.getSignedURL() == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Supabase no devolvió la URL firmada");
        }

        return supabaseUrl + "/storage/v1" + respuesta.getSignedURL();
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fotografía es obligatoria");
        }

        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "La fotografía no puede superar 5 MB");
        }

        if (!TIPOS_PERMITIDOS.contains(archivo.getContentType())) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "La fotografía debe ser JPEG, PNG o WebP");
        }
    }

    private static class SolicitudUrlFirmada {

        private final int expiresIn;

        public SolicitudUrlFirmada(int expiresIn) {
            this.expiresIn = expiresIn;
        }

        public int getExpiresIn() {
            return expiresIn;
        }
    }

    private static class RespuestaUrlFirmada {

        private String signedURL;

        public String getSignedURL() {
            return signedURL;
        }

        public void setSignedURL(String signedURL) {
            this.signedURL = signedURL;
        }
    }
}
