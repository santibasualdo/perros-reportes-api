package com.santiago.perrosreportes.usuario;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario crearPerfil(CrearUsuarioRequest datos, UUID idUsuario, String correoElectronico) {
        if (usuarioRepository.existsById(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El perfil del usuario ya existe");
        }

        if (correoElectronico == null || correoElectronico.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El token no contiene un correo electrónico");
        }

        Usuario usuario = new Usuario();
        usuario.setIdUsuario(idUsuario);
        usuario.setNombre(datos.getNombre());
        usuario.setCorreoElectronico(correoElectronico);

        return usuarioRepository.save(usuario);
    }
}
