function normalizarRoleValor(role) {
  if (!role || !String(role).trim()) return '';
  const normalizado = String(role).trim().toLowerCase();
  if (['superadmin', 'admin', 'administrador', 'adm'].includes(normalizado)) return 'admin';
  if (['coordenador', 'coord', 'coordenadora'].includes(normalizado)) return 'coordenador';
  if (['aluno', 'aluna', 'student', 'estudante'].includes(normalizado)) return 'aluno';
  return normalizado;
}

function roleFirestoreParaPerfil(role) {
  const perfil = normalizarRoleValor(role);
  if (perfil === 'admin') return 'admin';
  if (perfil === 'coordenador') return 'coordenador';
  if (perfil === 'aluno') return 'aluno';
  return perfil;
}

function roleFirestoreParaFiltro(roleConsulta) {
  return normalizarRoleValor(roleConsulta);
}

function rolesEquivalentes(roleDoc, roleConsulta) {
  return normalizarRoleValor(roleDoc) === normalizarRoleValor(roleConsulta);
}

module.exports = {
  normalizarRoleValor,
  roleFirestoreParaPerfil,
  roleFirestoreParaFiltro,
  rolesEquivalentes
};
