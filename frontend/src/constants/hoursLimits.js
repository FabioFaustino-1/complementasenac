/**
 * Limite maximo de horas por atividade (submissao e aprovacao).
 *
 * Deve refletir o valor em:
 * - backend/.env  ->  MAX_HORAS_POR_ATIVIDADE=40
 * - backend/src/config/hoursLimit.js
 *
 * Altere os pontos acima ao mudar o limite.
 */
export const MAX_HORAS_POR_ATIVIDADE = 40;

export function validarHorasAtividade(horas) {
  const horasInt = parseInt(horas, 10);
  if (Number.isNaN(horasInt) || horasInt <= 0) {
    return { valido: false, horas: 0, mensagem: "Informe uma quantidade valida de horas." };
  }
  if (horasInt > MAX_HORAS_POR_ATIVIDADE) {
    return {
      valido: false,
      horas: horasInt,
      mensagem: `O limite maximo e de ${MAX_HORAS_POR_ATIVIDADE}h por atividade.`,
    };
  }
  return { valido: true, horas: horasInt, mensagem: "" };
}
