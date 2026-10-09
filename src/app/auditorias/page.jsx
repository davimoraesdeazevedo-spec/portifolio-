'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { AUDITORIA_TIPOS, CHECKLIST_MODELOS, labelOf } from '@/lib/labels';
import { apiPost } from '@/lib/api-client';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';

function ChecklistModelo({ auditoria, existentes, reload }) {
  const [busy, setBusy] = useState(false);

  async function carregar() {
    const modelo = CHECKLIST_MODELOS[auditoria.tipo] ?? [];
    const faltantes = modelo.filter((item) => !existentes.includes(item));
    if (faltantes.length === 0) {
      window.alert('O checklist modelo já está carregado para esta auditoria.');
      return;
    }
    setBusy(true);
    try {
      for (const item of faltantes) {
        await apiPost('/api/auditoria_itens', { auditoria_id: auditoria.id, item, conforme: true });
      }
      await reload();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn" onClick={carregar} disabled={busy}>
      {busy ? 'Carregando…' : `Carregar checklist ${auditoria.tipo}`}
    </button>
  );
}

export default function AuditoriasPage() {
  const [auditoriaId, setAuditoriaId] = useState('');
  const [resumo, setResumo] = useState({ total: 0, conformes: 0, naoConformes: 0 });

  const { data: auditoriasData } = useFetchJson('/api/auditorias?limit=200');
  const auditorias = auditoriasData?.data ?? [];
  const selecionada = auditorias.find((item) => String(item.id) === String(auditoriaId));

  const ultimaPorTipo = AUDITORIA_TIPOS.map((tipo) => ({
    ...tipo,
    registro: auditorias.find((item) => item.tipo === tipo.value),
  }));

  return (
    <>
      <PageHeader
        title="Auditorias"
        subtitle="Checklists de verificação alinhados às exigências do SIM, SISBI, SIE e SIF, com pontuação e relatório para impressão ou PDF."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Auditorias registradas" value={auditorias.length} hint="Histórico do estabelecimento" />
        <StatCard label="Itens verificados" value={resumo.total} hint="Checklist da auditoria selecionada" />
        <StatCard label="Itens conformes" value={resumo.conformes} hint={formatPercent(resumo.conformes, resumo.total)} tone="ok" />
        <StatCard
          label="Itens não conformes"
          value={resumo.naoConformes}
          hint="Geram plano de ação"
          tone={resumo.naoConformes > 0 ? 'crit' : 'ok'}
        />
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        {ultimaPorTipo.map((item) => (
          <div key={item.value} className="kpi">
            <div className="kpi-label">Última auditoria {item.label}</div>
            {item.registro ? (
              <>
                <div className="kpi-value" style={{ fontSize: 20 }}>{formatDate(item.registro.data)}</div>
                <div className="kpi-hint">
                  {item.registro.resultado === 'conforme' ? '✓ Conforme' : '✕ Com não conformidade'} ·{' '}
                  {formatNumber(item.registro.pontuacao)}%
                </div>
              </>
            ) : (
              <div className="kpi-hint">Nenhuma auditoria registrada</div>
            )}
          </div>
        ))}
      </div>

      <CrudResource
        endpoint="/api/auditorias"
        title="Auditorias realizadas"
        createLabel="Nova auditoria"
        searchable
        searchPlaceholder="Pesquisar auditor ou escopo…"
        fields={[
          { name: 'tipo', label: 'Serviço de inspeção', type: 'select', options: AUDITORIA_TIPOS, required: true },
          { name: 'data', label: 'Data da auditoria', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
          { name: 'auditor', label: 'Auditor / órgão', type: 'text' },
          { name: 'escopo', label: 'Escopo verificado', type: 'text', full: true },
          { name: 'resultado', label: 'Resultado', type: 'select', options: [{ value: 'conforme', label: 'Conforme' }, { value: 'com_nao_conformidade', label: 'Com não conformidade' }] },
          { name: 'pontuacao', label: 'Pontuação (%)', type: 'number', step: '0.1' },
          { name: 'observacoes', label: 'Observações', type: 'textarea', full: true },
        ]}
        columns={[
          { key: 'tipo', label: 'Serviço', render: (row) => <Badge tone="brand">{row.tipo}</Badge> },
          { key: 'data', label: 'Data', render: (row) => formatDate(row.data) },
          { key: 'auditor', label: 'Auditor' },
          { key: 'escopo', label: 'Escopo', render: (row) => <span className="cell-muted">{row.escopo || '—'}</span> },
          {
            key: 'resultado',
            label: 'Resultado',
            render: (row) =>
              row.resultado === 'conforme' ? <Badge tone="ok">Conforme</Badge> : <Badge tone="crit">Com não conformidade</Badge>,
          },
          { key: 'pontuacao', label: 'Pontuação', numeric: true, render: (row) => `${formatNumber(row.pontuacao)}%` },
        ]}
        filters={[
          { name: 'tipo', label: 'Serviço', options: AUDITORIA_TIPOS },
          { name: 'resultado', label: 'Resultado', options: [{ value: 'conforme', label: 'Conforme' }, { value: 'com_nao_conformidade', label: 'Com não conformidade' }] },
        ]}
        rowActions={(row) => (
          <a className="btn btn--sm" href={`/auditorias/${row.id}/relatorio`} target="_blank" rel="noreferrer">
            Relatório PDF
          </a>
        )}
        emptyText="Nenhuma auditoria registrada."
      />

      <Card
        title="Checklist de verificação"
        subtitle="Itens avaliados na auditoria selecionada"
        actions={
          <label className="field" style={{ minWidth: 300 }}>
            <span className="field-label">Auditoria</span>
            <select className="select" value={auditoriaId} onChange={(event) => setAuditoriaId(event.target.value)}>
              <option value="">Selecione uma auditoria…</option>
              {auditorias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tipo} — {formatDate(item.data)} {item.auditor ? `· ${item.auditor}` : ''}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {!auditoriaId ? (
          <p className="muted text-sm">Selecione uma auditoria para avaliar os itens de checklist.</p>
        ) : (
          <CrudResource
            endpoint="/api/auditoria_itens"
            filterParams={{ auditoria_id: auditoriaId }}
            createLabel="Novo item"
            emptyText="Nenhum item avaliado nesta auditoria."
            fields={[
              { name: 'item', label: 'Item verificado', type: 'text', required: true, full: true },
              { name: 'conforme', label: 'Item conforme', type: 'checkbox', defaultValue: true },
              { name: 'observacao', label: 'Observação / evidência', type: 'textarea', full: true },
            ]}
            transformBody={(body) => ({ ...body, auditoria_id: Number(auditoriaId) })}
            headerExtra={
              selecionada ? (
                <>
                  <ChecklistModelo
                    auditoria={selecionada}
                    existentes={[]}
                    reload={async () => {
                      setAuditoriaId('');
                      setTimeout(() => setAuditoriaId(String(selecionada.id)), 0);
                    }}
                  />
                  <a className="btn" href={`/auditorias/${selecionada.id}/relatorio`} target="_blank" rel="noreferrer">
                    Relatório PDF
                  </a>
                </>
              ) : null
            }
            columns={[
              { key: 'item', label: 'Item verificado', render: (row) => <span className="cell-strong">{row.item}</span> },
              {
                key: 'conforme',
                label: 'Avaliação',
                render: (row) => (row.conforme ? <Badge tone="ok">✓ Conforme</Badge> : <Badge tone="crit">✕ Não conforme</Badge>),
              },
              { key: 'observacao', label: 'Observação', render: (row) => <span className="cell-muted">{row.observacao || '—'}</span> },
            ]}
            onLoaded={(loaded) =>
              setResumo({
                total: loaded.length,
                conformes: loaded.filter((row) => row.conforme).length,
                naoConformes: loaded.filter((row) => row.conforme === false).length,
              })
            }
          />
        )}
      </Card>
    </>
  );
}
