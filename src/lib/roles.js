// Cargos de acesso e matriz de permissões do sistema.
//
// Funcionário  → cargo base/auxiliar: apenas visualiza.
// Operador     → pode adicionar registros (novos PACs, APPCC etc.).
// Qualidade    → acesso total, igual ao supervisor.
// Supervisor   → acesso total (registros, alertas e usuários).

export const CARGOS = [
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'operador', label: 'Operador' },
  { value: 'qualidade', label: 'Controle de Qualidade' },
  { value: 'supervisor', label: 'Supervisor' },
];

export const CARGOS_DESCRICAO = {
  funcionario: 'Cargo base/auxiliar — apenas visualiza o sistema.',
  operador: 'Pode adicionar registros (novos PACs e APPCC).',
  qualidade: 'Acesso total, igual ao supervisor (registros, alertas e usuários).',
  supervisor: 'Acesso total (registros, alertas e usuários).',
};

// Permissões por cargo. Cada permissão é checada no servidor (API) e na tela.
// Supervisor e Controle de Qualidade têm acesso total; os demais são restritos.
const PERMISSOES_TOTAIS = ['ver', 'criar', 'editar', 'excluir', 'alertas', 'usuarios'];

const PERMISSOES = {
  funcionario: ['ver'],
  operador: ['ver', 'criar'],
  qualidade: PERMISSOES_TOTAIS,
  supervisor: PERMISSOES_TOTAIS,
};

export function temPermissao(cargo, permissao) {
  return (PERMISSOES[cargo] ?? []).includes(permissao);
}

export function labelCargo(cargo) {
  return CARGOS.find((item) => item.value === cargo)?.label ?? cargo ?? '—';
}

/**
 * Permissão exigida para operar um recurso genérico de /api/[resource].
 * Usuários exigem a permissão de usuários (supervisor e controle de
 * qualidade); alertas exigem a permissão de alertas
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
