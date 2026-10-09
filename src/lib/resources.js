// Registry of the CRUD resources exposed by /api/[resource].
//
// Each entry whitelists the writable columns and their types, so the generic
// API routes never take a column name or SQL fragment from the client.

/** @typedef {'text'|'number'|'boolean'|'date'|'timestamp'} FieldType */

const T = {
  text: 'text',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  timestamp: 'timestamp',
};

export const RESOURCES = {
  // ---------------------------------------------------------------- APPCC
  pcc: {
    table: 'pcc',
    columns: ['nome', 'etapa_processo', 'perigo', 'limite_critico', 'unidade', 'frequencia', 'monitoramento', 'acao_corretiva', 'responsavel', 'ativo'],
    types: { ativo: T.boolean },
    required: ['nome'],
    filters: ['ativo'],
    search: ['nome', 'etapa_processo', 'perigo'],
    orderBy: 'ativo DESC, nome ASC',
  },
  pcc_monitoramentos: {
    table: 'pcc_monitoramentos',
    columns: ['pcc_id', 'valor', 'conforme', 'data_hora', 'responsavel', 'observacao'],
    types: { pcc_id: T.number, valor: T.number, conforme: T.boolean, data_hora: T.timestamp },
    required: ['pcc_id'],
    filters: ['pcc_id', 'conforme'],
    orderBy: 'data_hora DESC',
  },

  // ------------------------------------------------------------------ PACs
  pacs: {
    table: 'pacs',
    columns: ['tipo', 'codigo', 'revisao', 'titulo', 'objetivo', 'documentos_referencia', 'campo_aplicacao', 'definicoes', 'responsabilidades', 'descricao', 'monitoramento', 'frequencia', 'responsavel', 'acoes_corretivas', 'verificacao', 'registros_doc', 'anexos', 'controle_revisoes', 'responsavel_legal', 'responsavel_tecnico', 'data_emissao', 'data_revisao', 'ativo'],
    types: { ativo: T.boolean, data_emissao: T.date, data_revisao: T.date },
    required: ['tipo', 'titulo'],
    filters: ['tipo', 'ativo'],
    search: ['titulo', 'codigo', 'descricao'],
    orderBy: 'tipo ASC, titulo ASC',
  },
  pac_registros: {
    table: 'pac_registros',
    columns: ['pac_id', 'data', 'resultado', 'conforme', 'responsavel', 'observacao'],
    types: { pac_id: T.number, data: T.date, conforme: T.boolean },
    required: ['pac_id'],
    filters: ['pac_id', 'conforme'],
    orderBy: 'data DESC, id DESC',
  },

  // --------------------------------------------------------- Temperaturas
  temperaturas: {
    table: 'temperaturas',
    columns: ['equipamento', 'tipo', 'temperatura', 'limite_min', 'limite_max', 'conforme', 'data_hora', 'responsavel', 'observacao'],
    types: { temperatura: T.number, limite_min: T.number, limite_max: T.number, conforme: T.boolean, data_hora: T.timestamp },
    required: ['equipamento', 'tipo', 'temperatura'],
    filters: ['tipo', 'conforme'],
    search: ['equipamento', 'responsavel'],
    orderBy: 'data_hora DESC',
  },

  // -------------------------------------------------------- Rastreabilidade
  materias_primas: {
    table: 'materias_primas',
    columns: ['produto', 'fornecedor', 'registro_fornecedor', 'lote', 'quantidade', 'unidade', 'temperatura_recebimento', 'data_entrada', 'nota_fiscal', 'responsavel'],
    types: { quantidade: T.number, temperatura_recebimento: T.number, data_entrada: T.date },
    required: ['produto', 'lote'],
    search: ['produto', 'fornecedor', 'lote', 'nota_fiscal'],
    orderBy: 'data_entrada DESC, id DESC',
  },
  producao: {
    table: 'producao',
    columns: ['produto', 'lote_producao', 'lotes_materia_prima', 'quantidade', 'unidade', 'data_producao', 'responsavel', 'observacao'],
    types: { quantidade: T.number, data_producao: T.date },
    required: ['produto', 'lote_producao'],
    search: ['produto', 'lote_producao', 'lotes_materia_prima'],
    orderBy: 'data_producao DESC, id DESC',
  },
  expedicao: {
    table: 'expedicao',
    columns: ['produto', 'lote_producao', 'cliente', 'destino', 'quantidade', 'unidade', 'temperatura_saida', 'data_saida', 'responsavel'],
    types: { quantidade: T.number, temperatura_saida: T.number, data_saida: T.date },
    required: ['produto'],
    search: ['produto', 'lote_producao', 'cliente', 'destino'],
    orderBy: 'data_saida DESC, id DESC',
  },

  // ------------------------------------------------------------ Laboratório
  analises: {
    table: 'analises',
    columns: ['tipo', 'ponto', 'lote', 'parametro', 'resultado', 'limite', 'conforme', 'data_coleta', 'status', 'laudo_url', 'laudo_nome', 'responsavel'],
    types: { conforme: T.boolean, data_coleta: T.date },
    required: ['tipo'],
    filters: ['tipo', 'status', 'conforme'],
    search: ['ponto', 'lote', 'parametro'],
    orderBy: 'data_coleta DESC, id DESC',
  },

  // ----------------------------------------------------- Não conformidades
  nao_conformidades: {
    table: 'nao_conformidades',
    columns: ['descricao', 'origem', 'gravidade', 'foto_url', 'acao_corretiva', 'responsavel', 'prazo', 'status', 'verificacao_eficacia', 'data_verificacao'],
    types: { prazo: T.date, data_verificacao: T.date },
    required: ['descricao'],
    filters: ['status', 'gravidade'],
    search: ['descricao', 'origem', 'responsavel'],
    orderBy: 'created_at DESC, id DESC',
  },

  // -------------------------------------------------------------- Auditorias
  auditorias: {
    table: 'auditorias',
    columns: ['tipo', 'data', 'auditor', 'escopo', 'resultado', 'pontuacao', 'observacoes'],
    types: { data: T.date, pontuacao: T.number },
    required: ['tipo'],
    filters: ['tipo', 'resultado'],
    search: ['auditor', 'escopo'],
    orderBy: 'data DESC, id DESC',
  },
  auditoria_itens: {
    table: 'auditoria_itens',
    columns: ['auditoria_id', 'item', 'conforme', 'observacao'],
    types: { auditoria_id: T.number, conforme: T.boolean },
    required: ['auditoria_id', 'item'],
    filters: ['auditoria_id', 'conforme'],
    search: ['item'],
    orderBy: 'id ASC',
  },

  // ----------------------------------------------------- Gestão documental
  documentos: {
    table: 'documentos',
    columns: ['titulo', 'tipo', 'codigo', 'versao', 'data_revisao', 'proxima_revisao', 'responsavel', 'status', 'arquivo_url', 'arquivo_nome'],
    types: { data_revisao: T.date, proxima_revisao: T.date },
    required: ['titulo', 'tipo'],
    filters: ['tipo', 'status'],
    search: ['titulo', 'codigo'],
    orderBy: 'proxima_revisao ASC, titulo ASC',
  },

  // ---------------------------------------------------------------- Produtos
  produtos: {
    table: 'produtos',
    columns: ['nome', 'denominacao_venda', 'categoria', 'registro_sif', 'memorial_descritivo', 'ficha_tecnica', 'rotulagem', 'ativo'],
    types: { ativo: T.boolean },
    required: ['nome'],
    filters: ['ativo', 'categoria'],
    search: ['nome', 'denominacao_venda', 'categoria'],
    orderBy: 'nome ASC',
  },

  // ------------------------------------------------------------ Treinamentos
  treinamentos: {
    table: 'treinamentos',
    columns: ['titulo', 'tema', 'instrutor', 'data_realizacao', 'carga_horaria', 'validade_meses', 'proxima_reciclagem'],
    types: { data_realizacao: T.date, carga_horaria: T.number, validade_meses: T.number, proxima_reciclagem: T.date },
    required: ['titulo'],
    search: ['titulo', 'tema', 'instrutor'],
    orderBy: 'data_realizacao DESC, id DESC',
  },
  treinamento_participantes: {
    table: 'treinamento_participantes',
    columns: ['treinamento_id', 'nome', 'cargo', 'cpf', 'presenca', 'certificado_emitido'],
    types: { treinamento_id: T.number, presenca: T.boolean, certificado_emitido: T.boolean },
    required: ['treinamento_id', 'nome'],
    filters: ['treinamento_id', 'presenca', 'certificado_emitido'],
    search: ['nome', 'cargo', 'cpf'],
    orderBy: 'nome ASC',
  },

  // ------------------------------------------------ Controle de acesso
  // Gerido apenas pelo Supervisor (permissão "usuarios").
  usuarios: {
    table: 'usuarios',
    columns: ['nome', 'cargo', 'ativo'],
    types: { ativo: T.boolean },
    required: ['nome', 'cargo'],
    filters: ['cargo', 'ativo'],
    search: ['nome', 'cargo'],
    orderBy: 'nome ASC',
  },

  // ------------------------------------------------------------- Alertas
  // Emitidos pelo Controle de Qualidade e pelo Supervisor (permissão "alertas").
  alertas: {
    table: 'alertas',
    columns: ['nivel', 'modulo', 'mensagem', 'autor'],
    required: ['mensagem'],
    filters: ['nivel'],
    search: ['mensagem', 'modulo', 'autor'],
    orderBy: 'created_at DESC, id DESC',
  },
};

export function getResource(name) {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name) ? RESOURCES[name] : null;
}
