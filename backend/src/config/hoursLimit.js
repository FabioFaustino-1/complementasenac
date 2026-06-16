/**
 * Limite central de horas por atividade (submissao e aprovacao).
 *
 * Para alterar no futuro, edite a variavel de ambiente:
 *   MAX_HORAS_POR_ATIVIDADE=40
 *
 * Ou altere o valor padrao abaixo (fallback quando a env nao estiver definida).
 */
function getMaxHorasPorAtividade() {
  const raw = process.env.MAX_HORAS_POR_ATIVIDADE;
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return Math.trunc(parsed);
  return 40;
}

module.exports = { getMaxHorasPorAtividade };
