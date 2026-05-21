const nodemailer = require('nodemailer');

class EmailNotificationService {
  constructor() {
    this.mailEnabled = String(process.env.MAIL_ENABLED || 'false').toLowerCase() === 'true';
    this.fromEmail = process.env.MAIL_FROM || 'no-reply@complementa.local';
  }

  async enviarStatusSolicitacao(destino, tituloAtividade, status, horasAprovadas, justificativa) {
    if (!destino || !String(destino).trim()) return;

    const assunto = '[Complementa+] Atualizacao da sua solicitacao';
    const corpo = this.montarCorpo(tituloAtividade, status, horasAprovadas, justificativa);

    if (!this.mailEnabled) {
      console.log('[mail disabled]', { destino, assunto, corpo });
      return;
    }

    // Config padrão: sem SMTP definido, falhar iria afetar; por segurança, mantemos desabilitado por padrão.
    if (!process.env.SMTP_HOST) {
      console.log('[mail enabled but SMTP not configured] skipping');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    });

    await transporter.sendMail({
      from: this.fromEmail,
      to: String(destino).trim().toLowerCase(),
      subject: assunto,
      text: corpo
    });
  }

  montarCorpo(tituloAtividade, status, horasAprovadas, justificativa) {
    let texto = '';
    texto += 'Sua solicitacao foi atualizada no Complementa+.\n\n';
    texto += `Atividade: ${tituloAtividade == null ? '-' : tituloAtividade}\n`;
    texto += `Status: ${status}\n`;

    if (status === 'APROVADO' && horasAprovadas != null) {
      texto += `Horas aprovadas: ${horasAprovadas}\n`;
    }
    if (status === 'REPROVADO' && justificativa != null && String(justificativa).trim().length) {
      texto += `Motivo da recusa: ${String(justificativa).trim()}\n`;
    }

    texto += '\nAcesse o sistema para mais detalhes.';
    return texto;
  }
}

module.exports = EmailNotificationService;

