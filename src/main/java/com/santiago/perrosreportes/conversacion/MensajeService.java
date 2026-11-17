package com.santiago.perrosreportes.conversacion;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.santiago.perrosreportes.coincidencia.Coincidencia;
import com.santiago.perrosreportes.coincidencia.CoincidenciaRepository;
import com.santiago.perrosreportes.coincidencia.EstadoCoincidencia;
import com.santiago.perrosreportes.usuario.Usuario;
import com.santiago.perrosreportes.usuario.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MensajeService {

    private final CoincidenciaRepository coincidenciaRepository;
    private final ConversacionRepository conversacionRepository;
    private final ParticipanteConversacionRepository participanteConversacionRepository;
    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;

    public MensajeService(CoincidenciaRepository coincidenciaRepository,
            ConversacionRepository conversacionRepository,
            ParticipanteConversacionRepository participanteConversacionRepository,
            MensajeRepository mensajeRepository,
            UsuarioRepository usuarioRepository) {
        this.coincidenciaRepository = coincidenciaRepository;
        this.conversacionRepository = conversacionRepository;
        this.participanteConversacionRepository = participanteConversacionRepository;
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public MensajeResponse enviarMensaje(UUID idCoincidencia, UUID idUsuario,
            EnviarMensajeRequest datos) {
        Coincidencia coincidencia = obtenerCoincidenciaConfirmada(idCoincidencia);
        Usuario usuario = obtenerUsuarioPropietario(coincidencia, idUsuario);

        Conversacion conversacion = obtenerOCrearConversacion(coincidencia);
        verificarConversacionActiva(conversacion);
        verificarUsuarioEsParticipante(conversacion, idUsuario);

        Mensaje mensajeGuardado = guardarMensaje(conversacion, usuario, datos);

        return convertirAResponse(mensajeGuardado);
    }

    @Transactional(readOnly = true)
    public List<MensajeResponse> listarMensajes(UUID idCoincidencia, UUID idUsuario) {
        Coincidencia coincidencia = obtenerCoincidenciaConfirmada(idCoincidencia);
        verificarUsuarioEsPropietario(coincidencia, idUsuario);

        Conversacion conversacion = conversacionRepository
                .findByCoincidencia_IdCoincidencia(idCoincidencia)
                .orElse(null);

        if (conversacion == null) {
            return List.of();
        }

        verificarUsuarioEsParticipante(conversacion, idUsuario);

        List<Mensaje> mensajes = mensajeRepository
                .findByConversacion_IdConversacionOrderByFechaHoraAsc(
                        conversacion.getIdConversacion());
        List<MensajeResponse> respuestas = new ArrayList<>();

        for (Mensaje mensaje : mensajes) {
            respuestas.add(convertirAResponse(mensaje));
        }

        return respuestas;
    }

    @Transactional
    public void marcarMensajesComoLeidos(UUID idCoincidencia, UUID idUsuario) {
        Coincidencia coincidencia = obtenerCoincidenciaConfirmada(idCoincidencia);
        verificarUsuarioEsPropietario(coincidencia, idUsuario);

        Conversacion conversacion = conversacionRepository
                .findByCoincidencia_IdCoincidencia(idCoincidencia)
                .orElse(null);

        if (conversacion == null) {
            return;
        }

        verificarUsuarioEsParticipante(conversacion, idUsuario);

        List<Mensaje> mensajesNoLeidos = mensajeRepository
                .findByConversacion_IdConversacionAndUsuario_IdUsuarioNotAndLeidoFalse(
                        conversacion.getIdConversacion(),
                        idUsuario);

        for (Mensaje mensaje : mensajesNoLeidos) {
            mensaje.setLeido(true);
        }

        mensajeRepository.saveAll(mensajesNoLeidos);
    }

    // Verifica y devuelve la coincidencia si esta confirmada
    private Coincidencia obtenerCoincidenciaConfirmada(UUID idCoincidencia) {
        Coincidencia coincidencia = coincidenciaRepository.findById(idCoincidencia)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Coincidencia no encontrada"));

        if (coincidencia.getEstado() != EstadoCoincidencia.CONFIRMADA) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se puede acceder a mensajes de coincidencias confirmadas");
        }

        return coincidencia;
    }


    // Comprueba que el usuario es propietaro de alguno de los reportes
    private void verificarUsuarioEsPropietario(Coincidencia coincidencia, UUID idUsuario) {
        boolean esPropietarioReportePerdido = coincidencia.getReportePerdido().getIdUsuario().equals(idUsuario);
        boolean esPropietarioReporteAvistamiento = coincidencia.getReporteAvistamiento().getIdUsuario().equals(idUsuario);

        if (!esPropietarioReportePerdido && !esPropietarioReporteAvistamiento) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No podés enviar mensajes en esta coincidencia");
        }
    }

    // Busca y devuelve el usuario propietario de algun reporte
    private Usuario obtenerUsuarioPropietario(Coincidencia coincidencia, UUID idUsuario) {
        verificarUsuarioEsPropietario(coincidencia, idUsuario);

        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"));
    }

    // Crea si no existe o devuelve conversacion
    private Conversacion obtenerOCrearConversacion(Coincidencia coincidencia) {
        return conversacionRepository.findByCoincidencia_IdCoincidencia(coincidencia.getIdCoincidencia())
                .orElseGet(() -> {
                    Conversacion conversacion = new Conversacion();
                    conversacion.setCoincidencia(coincidencia);
                    conversacion.setActiva(true);
                    Conversacion conversacionGuardada = conversacionRepository.save(conversacion);

                    crearParticipantes(conversacionGuardada, coincidencia);

                    return conversacionGuardada;
                });
    }

    // Valida si la conversacion esta activa
    private void verificarConversacionActiva(Conversacion conversacion) {
        if (!Boolean.TRUE.equals(conversacion.getActiva())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se pueden enviar mensajes en una conversación inactiva");
        }
    }

    private void verificarUsuarioEsParticipante(Conversacion conversacion, UUID idUsuario) {
        boolean esParticipante = participanteConversacionRepository
                .existsByConversacion_IdConversacionAndUsuario_IdUsuario(
                        conversacion.getIdConversacion(),
                        idUsuario);

        if (!esParticipante) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No participás en esta conversación");
        }
    }

    private Mensaje guardarMensaje(Conversacion conversacion, Usuario usuario,
            EnviarMensajeRequest datos) {
        Mensaje mensaje = new Mensaje();
        mensaje.setConversacion(conversacion);
        mensaje.setUsuario(usuario);
        mensaje.setContenido(datos.getContenido());
        mensaje.setFechaHora(OffsetDateTime.now(ZoneOffset.UTC));
        mensaje.setLeido(false);

        return mensajeRepository.save(mensaje);
    }

    private MensajeResponse convertirAResponse(Mensaje mensaje) {
        return new MensajeResponse(mensaje.getIdMensaje(),
                mensaje.getUsuario().getIdUsuario(),
                mensaje.getUsuario().getNombre(),
                mensaje.getContenido(),
                mensaje.getFechaHora(),
                mensaje.getLeido());
    }

    private void crearParticipantes(Conversacion conversacion, Coincidencia coincidencia) {
        crearParticipante(conversacion, coincidencia.getReportePerdido().getIdUsuario());
        crearParticipante(conversacion, coincidencia.getReporteAvistamiento().getIdUsuario());
    }

    private void crearParticipante(Conversacion conversacion, UUID idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"));

        ParticipanteConversacion participante = new ParticipanteConversacion();
        participante.setId(new ParticipanteConversacionId(
                conversacion.getIdConversacion(),
                usuario.getIdUsuario()));
        participante.setConversacion(conversacion);
        participante.setUsuario(usuario);

        participanteConversacionRepository.save(participante);
    }
}
