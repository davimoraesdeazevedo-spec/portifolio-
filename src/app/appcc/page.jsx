'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, DataTable, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { formatDateTime, formatNumber, formatPercent, nowForInput } from '@/lib/format';

const PCC_FIELDS = [
  { name: 'nome', label: 'Ponto crítico de controle', type: 'text', required: true, placeholder: 'Ex.: Cocção de embutidos cárneos' },
  { name: 'etapa_processo', label: 'Etapa do processo', type: 'text', placeholder: 'Ex.: Cocção' },
  { name: 'perigo', label: 'Perigo identificado', type: 'text', placeholder: 'Ex.: Biológico — Salmonella spp.' },
  { name: 'limite_critico', label: 'Limite crítico', type: 'text', placeholder: 'Ex.: ≥ 72 °C no centro geométrico' },
  { name: 'unidade', label: 'Unidade de medida', type: 'text', placeholder: '°C, ppm, mm' },
  { name: 'frequencia', label: 'Frequência de monitoramento', type: 'text', placeholder: 'Ex.: A cada batelada' },
  { name: 'monitoramento', label: 'Procedimento de monitoramento', type: 'textarea', full: true },
  { name: 'acao_corretiva', label: 'Ação corretiva prevista', type: 'textarea', full: true },
  { name: 'responsavel', label: 'Responsável', type: 'text', placeholder: 'Ex.: Enc. de Qualidade' },
  { name: 'ativo', label: 'PCC ativo no plano APPCC', type: 'checkbox', defaultValue: true },
];

const PCC_COLUMNS = [
  {
    key: 'nome',
    label: 'PCC',
    render: (row) => (
      <>
        <span className="cell-strong">{row.nome}</span>
        <div className="cell-muted">{row.etapa_processo || '—'}</div>
      </>
    ),
  },
  { key: 'perigo', label: 'Perigo' },
  { key: 'limite_critico', label: 'Limite crítico', render: (row) => <Badge tone="brand">{row.limite_critico || '—'}</Badge> },
  { key: 'frequencia', label: 'Frequência' },
  { key: 'responsavel', label: 'Responsável' },
  {
    key: 'ativo',
    label: 'Situação',
    render: (row) => (row.ativo ? <Badge tone="ok">Ativo</Badge> : <Badge>Inativo</Badge>),
  },
];

export default function AppccPage() {
  const [pccId, setPccId] = useState('');
  const [resumo, setResumo] = useState({ total: 0, conformes: 0, fora: 0 });

  const { data: pccData } = useFetchJson('/api/pcc?ativo=true');
  const pccOptions = pccData?.data ?? [];
  const pccSelecionado = pccOptions.find((item) => String(item.id) === String(pccId));

  return (
    <>
      <PageHeader
        title="APPCC — Análise de Perigos e Pontos Críticos de Controle"
        subtitle="Cadastro dos PCCs, limites críticos, monitoramento, ações corretivas e alertas automáticos quando um limite é excedido."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="PCCs ativos" value={pccOptions.length} hint="Cadastrados no plano APPCC" />
        <StatCard label="Monitoramentos do PCC" value={resumo.total} hint="Registros no histórico" />
        <StatCard label="Conformes" value={resumo.conformes} hint={formatPercent(resumo.conformes, resumo.total)} tone="ok" />
        <StatCard
          label="Fora do limite"
          value={resumo.fora}
          hint="Exigem ação corretiva"
          tone={resumo.fora > 0 ? 'crit' : 'ok'}
        />
      </div>

      <CrudResource
        endpoint="/api/pcc"
        title="Pontos Críticos de Controle"
        createLabel="Novo PCC"
        searchable
        searchPlaceholder="Pesquisar PCC…"
        fields={PCC_FIELDS}
        columns={PCC_COLUMNS}
        filters={[{ name: 'ativo', label: 'Situação', options: [{ value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }] }]}
        emptyText="Nenhum PCC cadastrado."
      />

      <Card
        title="Monitoramento de PCC"
        subtitle="Registre as leituras de cada ponto crítico. Leituras fora do limite geram alerta no dashboard."
        actions={
          <label className="field" style={{ minWidth: 280 }}>
            <span className="field-label">PCC em monitoramento</span>
            <select className="select" value={pccId} onChange={(event) => setPccId(event.target.value)}>
              <option value="">Selecione um PCC…</option>
              {pccOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {!pccId ? (
          <p className="muted text-sm">Selecione um PCC para registrar e consultar os monitoramentos.</p>
        ) : (
          <>
            {pccSelecionado ? (
              <div className="alert alert--atencao" style={{ marginBottom: 14 }}>
                <span className="alert-icon" aria-hidden="true">🎯</span>
                <span>
                  <span className="alert-module">Limite crítico</span>
                  <br />
                  <strong>{pccSelecionado.limite_critico || 'não definido'}</strong> — frequência {pccSelecionado.frequencia || 'não definida'}
                  {pccSelecionado.acao_corretiva ? ` · Ação corretiva: ${pccSelecionado.acao_corretiva}` : ''}
                </span>
              </div>
            ) : null}

            <CrudResource
              endpoint="/api/pcc_monitoramentos"
              filterParams={{ pcc_id: pccId }}
              createLabel="Registrar monitoramento"
              emptyText="Nenhum monitoramento registrado para este PCC."
              defaultFormOpen
              formTitle="Novo monitoramento"
              fields={[
                { name: 'valor', label: `Valor medido${pccSelecionado?.unidade ? ` (${pccSelecionado.unidade})` : ''}`, type: 'number', step: '0.01', required: true },
                { name: 'data_hora', label: 'Data e hora da leitura', type: 'datetime-local', defaultValue: nowForInput() },
                { name: 'responsavel', label: 'Responsável pela leitura', type: 'text' },
                { name: 'conforme', label: 'Dentro do limite crítico', type: 'checkbox', defaultValue: true },
                { name: 'observacao', label: 'Observação / ação tomada', type: 'textarea', full: true },
              ]}
              transformBody={(body) => ({ ...body, pcc_id: Number(pccId) })}
              columns={[
                { key: 'data_hora', label: 'Data/hora', render: (row) => formatDateTime(row.data_hora) },
                {
                  key: 'valor',
                  label: 'Valor',
                  numeric: true,
                  render: (row) => (
                    <span className="cell-strong" style={{ color: row.conforme ? 'inherit' : 'var(--crit)' }}>
                      {formatNumber(row.valor)} {pccSelecionado?.unidade ?? ''}
                    </span>
                  ),
                },
                {
                  key: 'conforme',
                  label: 'Resultado',
                  render: (row) => (row.conforme ? <Badge tone="ok">✓ Conforme</Badge> : <Badge tone="crit">✕ Fora do limite</Badge>),
                },
                { key: 'responsavel', label: 'Responsável' },
                { key: 'observacao', label: 'Observação' },
              ]}
              onLoaded={(loaded) =>
                setResumo({
                  total: loaded.length,
                  conformes: loaded.filter((row) => row.conforme).length,
                  fora: loaded.filter((row) => row.conforme === false).length,
                })
              }
            />
          </>
        )}
      </Card>
    </>
  );
}
