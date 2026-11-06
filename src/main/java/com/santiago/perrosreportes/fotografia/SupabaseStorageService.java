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
    private static final Set<String> TIPOS_PERMITIDOS = Set.of("image/jpeg", "image/png", "image/webp");

    private final RestClient supabaseStorageRestClient;
    private final String bucket;

    public SupabaseStorageService(RestClient supabaseStorageRestClient,
            @Value("${supabase.storage.bucket}") String bucket) {
        this.supabaseStorageRestClient = supabaseStorageRestClient;
        this.bucket = bucket;
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
}
