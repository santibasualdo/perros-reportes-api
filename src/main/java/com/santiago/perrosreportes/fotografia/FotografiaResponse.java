package com.santiago.perrosreportes.fotografia;

import java.time.OffsetDateTime;
import java.util.UUID;

public class FotografiaResponse {

    private final UUID idFotografia;
    private final String url;
    private final OffsetDateTime creadoEn;

    public FotografiaResponse(UUID idFotografia, String url, OffsetDateTime creadoEn) {
        this.idFotografia = idFotografia;
        this.url = url;
        this.creadoEn = creadoEn;
    }

    public UUID getIdFotografia() {
        return idFotografia;
    }

    public String getUrl() {
        return url;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }
}
