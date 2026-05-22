# frozen_string_literal: true

class EmailNotificationService
  def enviar_status_solicitacao(destino, titulo_atividade, status, horas_aprovadas: nil, justificativa: nil)
    return if destino.blank?

    assunto = "[Complementa+] Atualizacao da sua solicitacao"
    corpo = montar_corpo(titulo_atividade, status, horas_aprovadas, justificativa)
    Rails.logger.info("Envio de email desabilitado. Destino=#{destino} Assunto=#{assunto} Corpo=#{corpo}")
  end

  private

  def montar_corpo(titulo_atividade, status, horas_aprovadas, justificativa)
    texto = +"Sua solicitacao foi atualizada no Complementa+.\n\n"
    texto << "Atividade: #{titulo_atividade.presence || '-'}\n"
    texto << "Status: #{status}\n"

    if status == "APROVADO" && horas_aprovadas
      texto << "Horas aprovadas: #{horas_aprovadas}\n"
    end

    if status == "REPROVADO" && justificativa.present?
      texto << "Motivo da recusa: #{justificativa.strip}\n"
    end

    texto << "\nAcesse o sistema para mais detalhes."
    texto
  end
end
