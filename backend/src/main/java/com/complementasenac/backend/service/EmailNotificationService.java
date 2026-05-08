package com.complementasenac.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@complementa.local}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

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

        if (!mailEnabled) {
            LOGGER.info("Email desabilitado. Destino={} Assunto={} Corpo={}", destino, assunto, corpo);
            return;
        }

        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setFrom(fromEmail);
            mensagem.setTo(destino.trim().toLowerCase());
            mensagem.setSubject(assunto);
            mensagem.setText(corpo);
            mailSender.send(mensagem);
            LOGGER.info("Email de status enviado para {}", destino);
        } catch (Exception e) {
            LOGGER.warn("Falha ao enviar email para {}: {}", destino, e.getMessage());
        }
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
