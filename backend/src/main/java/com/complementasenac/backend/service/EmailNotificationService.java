package com.complementasenac.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(EmailNotificationService.class);

    public void enviarStatusSolicitacao(
            String destino,
            String tituloAtividade,
            String status,
            Integer horasAprovadas,
            String justificativa
    ) {
        if (destino == null || destino.isBlank()) {
            return;
        }

        String assunto = "[Complementa+] Atualizacao da sua solicitacao";
        String corpo = montarCorpo(tituloAtividade, status, horasAprovadas, justificativa);
        LOGGER.info("Envio de email desabilitado. Destino={} Assunto={} Corpo={}", destino, assunto, corpo);
    }

    private String montarCorpo(String tituloAtividade, String status, Integer horasAprovadas, String justificativa) {
        StringBuilder texto = new StringBuilder();
        texto.append("Sua solicitacao foi atualizada no Complementa+.\n\n")
                .append("Atividade: ").append(tituloAtividade == null ? "-" : tituloAtividade).append("\n")
                .append("Status: ").append(status).append("\n");

        if ("APROVADO".equals(status) && horasAprovadas != null) {
            texto.append("Horas aprovadas: ").append(horasAprovadas).append("\n");
        }
        if ("REPROVADO".equals(status) && justificativa != null && !justificativa.isBlank()) {
            texto.append("Motivo da recusa: ").append(justificativa.trim()).append("\n");
        }

        texto.append("\nAcesse o sistema para mais detalhes.");
        return texto.toString();
    }
}
