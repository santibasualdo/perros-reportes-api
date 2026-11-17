package com.santiago.perrosreportes.conversacion;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversacionService {

    private final ConversacionRepository conversacionRepository;
    private final ParticipanteConversacionRepository participanteConversacionRepository;
    private final MensajeRepository mensajeRepository;

    public ConversacionService(ConversacionRepository conversacionRepository,
            ParticipanteConversacionRepository participanteConversacionRepository,
            MensajeRepository mensajeRepository) {
        this.conversacionRepository = conversacionRepository;
        this.participanteConversacionRepository = participanteConversacionRepository;
        this.mensajeRepository = mensajeRepository;
    }

    @Transactional(readOnly = true)
    public List<ConversacionResponse> listarConversaciones(UUID idUsuario) {
        List<Conversacion> conversaciones = conversacionRepository.findActivasPorUsuario(idUsuario);
        List<ConversacionResponse> respuestas = new ArrayList<>();

        for (Conversacion conversacion : conversaciones) {
            Mensaje ultimoMensaje = mensajeRepository
                    .findTopByConversacion_IdConversacionOrderByFechaHoraDesc(
                            conversacion.getIdConversacion())
                    .orElse(null);

            respuestas.add(new ConversacionResponse(
                    conversacion.getCoincidencia().getIdCoincidencia(),
                    obtenerNombreOtroParticipante(conversacion, idUsuario),
                    ultimoMensaje == null ? null : ultimoMensaje.getContenido(),
                    ultimoMensaje == null ? null : ultimoMensaje.getUsuario().getIdUsuario(),
                    ultimoMensaje == null ? null : ultimoMensaje.getFechaHora(),
                    conversacion.getFechaCreacion()));
        }

        return respuestas;
    }

    private String obtenerNombreOtroParticipante(Conversacion conversacion, UUID idUsuario) {
        return participanteConversacionRepository
                .findFirstByConversacion_IdConversacionAndUsuario_IdUsuarioNot(
                        conversacion.getIdConversacion(), idUsuario)
                .map(participante -> participante.getUsuario().getNombre())
                .orElse("Participante");
    }
}
