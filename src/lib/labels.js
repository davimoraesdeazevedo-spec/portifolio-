// Domain vocabulary shared by the UI: option lists and lookup helpers.

// Elementos de controle obrigatórios — Portaria SEMAG-SIM nº 15/2026, art. 5º (I a XIV).
export const PAC_TIPOS = [
  { value: 'manutencao', label: 'I – Manutenção das instalações e equipamentos (calibração e aferição)' },
  { value: 'agua', label: 'II – Água de abastecimento' },
  { value: 'pragas', label: 'III – Controle integrado de pragas' },
  { value: 'higiene', label: 'IV – Higiene industrial e operacional' },
  { value: 'manipuladores', label: 'V – Higiene e hábitos higiênicos dos funcionários' },
  { value: 'pso', label: 'VI – Procedimentos Sanitários Operacionais' },
  { value: 'materias_primas', label: 'VII – Controle de matérias-primas, ingredientes e embalagens' },
  { value: 'temperaturas', label: 'VIII – Controle de temperaturas' },
  { value: 'appcc', label: 'IX – APPCC' },
  { value: 'laboratorio', label: 'X – Análises laboratoriais' },
  { value: 'fraudes', label: 'XI – Controle de formulação e combate à fraude econômica' },
  { value: 'rastreabilidade', label: 'XII – Rastreabilidade e recolhimento' },
  { value: 'bem_estar_animal', label: 'XIII – Bem-estar animal (quando aplicável)' },
  { value: 'mer', label: 'XIV – Material Especificado de Risco – MER (quando aplicável)' },
  { value: 'adicional', label: 'Elemento adicional (art. 5º, §§ 1º e 2º)' },
];

export const TEMPERATURA_TIPOS = [
  { value: 'resfriamento', label: 'Câmara de resfriamento' },
  { value: 'congelamento', label: 'Câmara de congelamento' },
  { value: 'produto_acabado', label: 'Produto acabado' },
  { value: 'veiculo', label: 'Veículo' },
];

// Default critical limits per equipment type, in °C.
export const TEMPERATURA_LIMITES = {
  resfriamento: { min: 0, max: 7 },
  congelamento: { min: -22, max: -18 },
  produto_acabado: { min: 0, max: 7 },
  veiculo: { min: 0, max: 7 },
};

export const ANALISE_TIPOS = [
  { value: 'agua', label: 'Água' },
  { value: 'produto', label: 'Produto' },
  { value: 'swab', label: 'Swab ambiental' },
];

export const ANALISE_STATUS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'concluida', label: 'Concluída' },
];

export const NC_STATUS = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_acao', label: 'Em ação corretiva' },
  { value: 'verificacao', label: 'Verificação de eficácia' },
  { value: 'encerrada', label: 'Encerrada' },
];

export const GRAVIDADES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
];

export const ALERTA_NIVEIS = [
  { value: 'atencao', label: 'Atenção' },
  { value: 'critico', label: 'Crítico' },
];

export const AUDITORIA_TIPOS = [
  { value: 'SIM', label: 'SIM' },
  { value: 'SISBI', label: 'SISBI' },
  { value: 'SIE', label: 'SIE' },
  { value: 'SIF', label: 'SIF' },
];

export const AUDITORIA_RESULTADOS = [
  { value: 'conforme', label: 'Conforme' },
  { value: 'com_nao_conformidade', label: 'Com não conformidade' },
];

export const DOCUMENTO_TIPOS = [
  { value: 'PAC', label: 'PAC' },
  { value: 'APPCC', label: 'APPCC' },
  { value: 'POP', label: 'POP' },
  { value: 'Manual', label: 'Manual' },
];

export const DOCUMENTO_STATUS = [
  { value: 'vigente', label: 'Vigente' },
  { value: 'em_revisao', label: 'Em revisão' },
  { value: 'vencido', label: 'Vencido' },
];

export const UNIDADES = ['kg', 'g', 'L', 'mL', 'un', 'ppm', '°C'];

export const TURNOS = ['Manhã', 'Tarde', 'Noite'];

/** Checklist items offered as a starting point for each audit type. */
export const CHECKLIST_MODELOS = {
  SIM: [
    'PAC de água com análise microbiológica periódica',
    'Instrumentos de medição calibrados e identificados',
    'Registros de limpeza e sanitização assinados',
    'Treinamento em boas práticas dentro da validade',
    'Rastreabilidade demonstrada da matéria-prima à expedição',
    'Rotulagem conforme denominação de venda',
    'Controle de pragas por empresa registrada',
    'Temperaturas de câmaras registradas diariamente',
    'Não conformidades com ação corretiva e verificação de eficácia',
  ],
  SISBI: [
    'APPCC com PCCs, limites críticos e ações corretivas documentados',
    'Programa de recall testado no último ano',
    'Controle de fraudes e autenticidade de espécies',
    'Memorial descritivo e ficha técnica de cada produto',
    'Plano de amostragem laboratorial implementado',
    'Gestão documental com controle de revisões',
    'Higiene e saúde dos manipuladores comprovadas',
    'Manutenção preventiva de equipamentos e utensílios',
  ],
  SIE: [
    'Habilitação do serviço de inspeção estadual',
    'Registros de inspeção ante e post mortem',
    'Controle de temperatura de transporte',
  ],
  SIF: [
    'Registro do estabelecimento sob SIF atualizado',
    'Dependências e fluxos conforme projeto aprovado',
    'Controle de matérias-primas de fornecedores habilitados',
  ],
};

export function labelOf(options, value) {
  if (value === null || value === undefined || value === '') return '—';
  return options.find((option) => option.value === value)?.label ?? String(value);
}
