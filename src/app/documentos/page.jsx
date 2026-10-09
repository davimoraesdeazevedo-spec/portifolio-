'use client';

import CrudResource from '@/components/CrudResource';
import { Badge, Card, DataTable, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { DOCUMENTO_STATUS, DOCUMENTO_TIPOS, labelOf } from '@/lib/labels';
import { apiPatch } from '@/lib/api-client';
import { daysUntil, formatDate } from '@/lib/format';

const TONE_STATUS = { vigente: 'ok', em_revisao: 'warn', vencido: 'crit' };

function RevisaoBadge({ row }) {
  const dias = daysUntil(row.proxima_revisao);
  if (dias === null) return <span className="cell-muted">Sem prazo</span>;
  if (dias < 0) return <Badge tone="crit">Vencido há {Math.abs(dias)} dia(s)</Badge>;
  if (dias <= 30) return <Badge tone="warn">Vence em {dias} dia(s)</Badge>;
  return <Badge tone="ok">{dias} dia(s)</Badge>;
}

function NovaRevisaoButton({ row, reload }) {
  return (
    <button
      type="button"
      className="btn btn--sm"
      onClick={async () => {
        const versao = String(Number(row.versao || 1) + 1).padStart(2, '0');
        const hoje = new Date().toISOString().slice(0, 10);
        const proxima = new Date();
        proxima.setFullYear(proxima.getFullYear() + 1);
        if (!window.confirm(`Registrar a revisão ${versao} deste documento?`)) return;
        try {
          await apiPatch(`/api/documentos/${row.id}`, {
            versao,
            data_revisao: hoje,
            proxima_revisao: proxima.toISOString().slice(0, 10),
            status: 'vigente',
          });
          await reload();
        } catch (error) {
          window.alert(error.message);
        }
      }}
    >
      Nova revisão
    </button>
  );
}

export default function DocumentosPage() {
  const { data } = useFetchJson('/api/documentos?limit=500');
  const documentos = data?.data ?? [];

  const vencidos = documentos.filter((row) => row.status === 'vencido' || (daysUntil(row.proxima_revisao) ?? 1) < 0).length;
  const vencendo = documentos.filter((row) => {
    const dias = daysUntil(row.proxima_revisao);
    return dias !== null && dias >= 0 && dias <= 30;
  }).length;

  return (
    <>
      <PageHeader
        title="Gestão documental"
        subtitle="PACs, APPCC, POPs e manuais com controle de revisões, responsáveis e prazos de revisão."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Documentos controlados" value={documentos.length} hint="PAC, APPCC, POP e manuais" />
        <StatCard label="Vigentes" value={documentos.filter((row) => row.status === 'vigente').length} hint="Sem pendência de revisão" tone="ok" />
        <StatCard label="Vencidos" value={vencidos} hint="Revisão obrigatória" tone={vencidos > 0 ? 'crit' : 'ok'} />
        <StatCard label="Vencem em 30 dias" value={vencendo} hint="Programar revisão" tone={vencendo > 0 ? 'warn' : 'ok'} />
      </div>

      <CrudResource
        endpoint="/api/documentos"
        title="Documentos do sistema de autocontrole"
        createLabel="Novo documento"
        searchable
        searchPlaceholder="Pesquisar título ou código…"
        fields={[
          { name: 'titulo', label: 'Título', type: 'text', required: true, full: true },
          { name: 'tipo', label: 'Tipo', type: 'select', options: DOCUMENTO_TIPOS, required: true },
          { name: 'codigo', label: 'Código', type: 'text', placeholder: 'Ex.: PAC-002' },
          { name: 'versao', label: 'Revisão atual', type: 'text', placeholder: 'Ex.: 02' },
          { name: 'data_revisao', label: 'Data da última revisão', type: 'date' },
          { name: 'proxima_revisao', label: 'Próxima revisão', type: 'date' },
          { name: 'responsavel', label: 'Responsável', type: 'text' },
          { name: 'status', label: 'Situação', type: 'select', options: DOCUMENTO_STATUS, defaultValue: 'vigente' },
          { name: 'arquivo_url', label: 'Arquivo (PDF)', type: 'file', accept: 'application/pdf', storeNameAs: 'arquivo_nome' },
        ]}
        columns={[
          {
            key: 'titulo',
            label: 'Documento',
            render: (row) => (
              <>
                <span className="cell-strong">{row.titulo}</span>
                <div className="cell-muted mono">
                  {row.codigo || '—'} · revisão {row.versao || '01'}
                </div>
              </>
            ),
          },
          { key: 'tipo', label: 'Tipo', render: (row) => <Badge tone="brand">{labelOf(DOCUMENTO_TIPOS, row.tipo)}</Badge> },
          { key: 'data_revisao', label: 'Última revisão', render: (row) => formatDate(row.data_revisao) },
          { key: 'proxima_revisao', label: 'Próxima revisão', render: (row) => formatDate(row.proxima_revisao) },
          { key: 'prazo', label: 'Prazo', render: (row) => <RevisaoBadge row={row} /> },
          { key: 'status', label: 'Situação', render: (row) => <Badge tone={TONE_STATUS[row.status]}>{labelOf(DOCUMENTO_STATUS, row.status)}</Badge> },
          { key: 'responsavel', label: 'Responsável' },
          {
            key: 'arquivo',
            label: 'Arquivo',
            render: (row) =>
              row.arquivo_url ? (
                <a className="link text-sm" href={row.arquivo_url} target="_blank" rel="noreferrer">
                  {row.arquivo_nome || 'Abrir PDF'}
                </a>
              ) : (
                <span className="cell-muted">Sem arquivo</span>
              ),
          },
        ]}
        rowActions={(row, reload) => <NovaRevisaoButton row={row} reload={reload} />}
        filters={[
          { name: 'tipo', label: 'Tipo', options: DOCUMENTO_TIPOS },
          { name: 'status', label: 'Situação', options: DOCUMENTO_STATUS },
        ]}
        emptyText="Nenhum documento cadastrado."
      />

      <Card title="Controle de revisões" subtitle="Documentos ordenados pela próxima revisão prevista">
        <DataTable
          loading={false}
          empty="Nenhum documento com revisão programada."
          rows={[...documentos].sort((a, b) => String(a.proxima_revisao ?? '').localeCompare(String(b.proxima_revisao ?? '')))}
          columns={[
            { key: 'titulo', label: 'Documento', render: (row) => <span className="cell-strong">{row.titulo}</span> },
            { key: 'codigo', label: 'Código', render: (row) => <span className="mono">{row.codigo || '—'}</span> },
            { key: 'tipo', label: 'Tipo', render: (row) => labelOf(DOCUMENTO_TIPOS, row.tipo) },
            { key: 'versao', label: 'Revisão', numeric: true, render: (row) => row.versao || '01' },
            { key: 'data_revisao', label: 'Revisado em', render: (row) => formatDate(row.data_revisao) },
            { key: 'proxima_revisao', label: 'Próxima', render: (row) => formatDate(row.proxima_revisao) },
            { key: 'prazo', label: 'Prazo', render: (row) => <RevisaoBadge row={row} /> },
            { key: 'responsavel', label: 'Responsável' },
          ]}
        />
      </Card>
    </>
  );
}
