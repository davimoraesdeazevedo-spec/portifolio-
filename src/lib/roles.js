// Cargos de acesso e matriz de permissões do sistema.
//
// Funcionário  → cargo base/auxiliar: apenas visualiza.
// Operador     → pode adicionar registros (novos PACs, APPCC etc.).
// Qualidade    → pode emitir alertas e alterar os dados do painel de controle.
// Supervisor   → acesso total + gestão de usuários (quem entra com qual conta).

export const CARGOS = [
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'operador', label: 'Operador' },
  { value: 'qualidade', label: 'Controle de Qualidade' },
  { value: 'supervisor', label: 'Supervisor' },
];

export const CARGOS_DESCRICAO = {
  funcionario: 'Cargo base/auxiliar — apenas visualiza o sistema.',
  operador: 'Pode adicionar registros (novos PACs e APPCC).',
  qualidade: 'Pode emitir alertas e alterar os dados do painel de controle.',
  supervisor: 'Acesso total e gestão de usuários (quem entra com qual conta).',
};

// Permissões por cargo. Cada permissão é checada no servidor (API) e na tela.
const PERMISSOES = {
  funcionario: ['ver'],
  operador: ['ver', 'criar'],
  qualidade: ['ver', 'criar', 'editar', 'excluir', 'alertas'],
  supervisor: ['ver', 'criar', 'editar', 'excluir', 'alertas', 'usuarios'],
};

export function temPermissao(cargo, permissao) {
  return (PERMISSOES[cargo] ?? []).includes(permissao);
}

export function labelCargo(cargo) {
  return CARGOS.find((item) => item.value === cargo)?.label ?? cargo ?? '—';
}

/**
 * Permissão exigida para operar um recurso genérico de /api/[resource].
 * Usuários exigem o cargo supervisor; alertas exigem a permissão de alertas
 * para escrita e apenas login para leitura; os demais seguem o método HTTP.
 */
export function permissaoDoRecurso(recurso, metodo) {
  if (recurso === 'usuarios') return 'usuarios';
  if (recurso === 'alertas') return metodo === 'GET' ? 'ver' : 'alertas';
  switch (metodo) {
    case 'POST':
      return 'criar';
    case 'PATCH':
      return 'editar';
    case 'DELETE':
      return 'excluir';
    default:
      return 'ver';
  }
}
