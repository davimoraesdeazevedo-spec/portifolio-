'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, DataTable, PageHeader, StatCard, Tabs } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { ANALISE_STATUS, ANALISE_TIPOS, labelOf } from '@/lib/labels';
import { apiPatch } from '@/lib/api-client';
import { formatDate } from '@/lib/format';

function ConcluirButton({ row, reload }) {
  if (row.status === 'concluida') return null;
  return (
    <button
      type="button"
      className="btn btn--sm"
      onClick={async () => {
        try {
          await apiPatch(`/api/analises/${row.id}`, { status: 'concluida' });
          await reload();
        } catch (error) {
          window.alert(error.message);
        }
      }}
    >
      Marcar concluída
    </button>
  );
}

export default function LaboratorioPage() {
  const [tipo, setTipo] = useState('todos');
  const { data } = useFetchJson('/api/analises?limit=500');
  const analises = data?.data ?? [];

  const pendentes = analises.filter((row) => row.status === 'pendente').length;
  const naoConformes = analises.filter((row) => row.conforme === false).length;
  const semLaudo = analises.filter((row) => !row.laudo_url).length;

  return (
    <>
      <PageHeader
        title="Laboratório"
        subtitle="Análises de água, produtos e swab ambiental, com anexação de laudos em PDF e registro do resultado frente ao limite de referência."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Análises registradas" value={analises.length} hint="Água, produto e ambiente" />
        <StatCard label="Pendentes" value={pendentes} hint="Aguardando resultado ou laudo" tone={pendentes > 0 ? 'warn' : 'ok'} />
        <StatCard label="Não conformes" value={naoConformes} hint="Requerem investigação" tone={naoConformes > 0 ? 'crit' : 'ok'} />
        <StatCard label="Sem laudo anexado" value={semLaudo} hint="Laudo PDF pendente de anexação" />
      </div>

      <Card title="Grupos de análise" subtitle="Água, produtos e swab ambiental">
        <Tabs
          items={[{ value: 'todos', label: 'Todas' }, ...ANALISE_TIPOS]}
          value={tipo}
          onChange={setTipo}
        />
      </Card>

      <CrudResource
        endpoint="/api/analises"
        title="Análises laboratoriais"
        createLabel="Nova análise"
        searchable
        searchPlaceholder="Pesquisar ponto, lote ou parâmetro…"
        filterParams={tipo === 'todos' ? undefined : { tipo }}
        formOverrides={tipo === 'todos' ? undefined : { tipo }}
        fields={[
          { name: 'tipo', label: 'Tipo de análise', type: 'select', options: ANALISE_TIPOS, required: true },
          { name: 'ponto', label: 'Ponto de coleta', type: 'text', placeholder: 'Ex.: Caixa d’água — ponto de uso 01' },
          { name: 'lote', label: 'Lote / produto', type: 'text' },
          { name: 'parametro', label: 'Parâmetro analisado', type: 'text', placeholder: 'Ex.: Salmonella spp.' },
          { name: 'resultado', label: 'Resultado', type: 'text', placeholder: 'Ex.: Ausente em 25 g' },
          { name: 'limite', label: 'Limite de referência', type: 'text', placeholder: 'Ex.: ≤ 100 UFC/cm²' },
          { name: 'conforme', label: 'Resultado conforme', type: 'checkbox', defaultValue: true },
          { name: 'data_coleta', label: 'Data da coleta', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
          { name: 'status', label: 'Situação', type: 'select', options: ANALISE_STATUS, defaultValue: 'pendente' },
          { name: 'laudo_url', label: 'Laudo (PDF)', type: 'file', accept: 'application/pdf', storeNameAs: 'laudo_nome', help: 'Anexe o laudo emitido pelo laboratório.' },
          { name: 'responsavel', label: 'Responsável', type: 'text' },
        ]}
        columns={[
          {
            key: 'tipo',
            label: 'Tipo',
            render: (row) => (
              <>
                <Badge tone="info">{labelOf(ANALISE_TIPOS, row.tipo)}</Badge>
                <div className="cell-muted">{formatDate(row.data_coleta)}</div>
              </>
            ),
          },
          {
            key: 'ponto',
            label: 'Ponto / lote',
            render: (row) => (
              <>
                <span className="cell-strong">{row.ponto || '—'}</span>
                {row.lote ? <div className="cell-muted mono">{row.lote}</div> : null}
              </>
            ),
          },
          { key: 'parametro', label: 'Parâmetro' },
          {
            key: 'resultado',
            label: 'Resultado',
            render: (row) => (
              <>
                <span className="cell-strong">{row.resultado || 'Aguardando'}</span>
                <div className="cell-muted">Limite: {row.limite || '—'}</div>
              </>
            ),
          },
          {
            key: 'conforme',
            label: 'Conformidade',
            render: (row) =>
              row.conforme === null || row.conforme === undefined ? (
                <Badge>Pendente</Badge>
              ) : row.conforme ? (
                <Badge tone="ok">✓ Conforme</Badge>
              ) : (
                <Badge tone="crit">✕ Não conforme</Badge>
              ),
          },
          {
            key: 'status',
            label: 'Situação',
            render: (row) => (row.status === 'concluida' ? <Badge tone="ok">Concluída</Badge> : <Badge tone="warn">Pendente</Badge>),
          },
          {
            key: 'laudo',
            label: 'Laudo',
            render: (row) =>
              row.laudo_url ? (
                <a className="link text-sm" href={row.laudo_url} target="_blank" rel="noreferrer">
                  {row.laudo_nome || 'Abrir PDF'}
                </a>
              ) : (
                <span className="cell-muted">Sem laudo</span>
              ),
          },
        ]}
        rowActions={(row, reload) => <ConcluirButton row={row} reload={reload} />}
        filters={[{ name: 'status', label: 'Situação', options: ANALISE_STATUS }]}
        emptyText="Nenhuma análise registrada."
      />

      <Card title="Laudos e resultados recentes" subtitle="Últimas análises concluídas">
        <DataTable
          loading={false}
          empty="Nenhum laudo anexado."
          rows={analises.filter((row) => row.laudo_url).slice(0, 8)}
          columns={[
            { key: 'tipo', label: 'Tipo', render: (row) => labelOf(ANALISE_TIPOS, row.tipo) },
            { key: 'ponto', label: 'Ponto' },
            { key: 'laudo_nome', label: 'Laudo', render: (row) => <a className="link" href={row.laudo_url} target="_blank" rel="noreferrer">Abrir PDF</a> },
            { key: 'data_coleta', label: 'Coleta', render: (row) => formatDate(row.data_coleta) },
          ]}
        />
      </Card>
    </>
  );
}
