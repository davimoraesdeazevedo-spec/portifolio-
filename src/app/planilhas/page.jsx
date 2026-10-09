'use client';

// Aba consolidada: junta todos os registros de execução dos PACs e todos os
// monitoramentos de PCCs numa única planilha, pronta para impressão em PDF
// pelo diálogo do navegador (window.print), igual às demais telas imprimíveis.

import { useEffect, useState } from 'react';
import { Badge, Card, DataTable, PageHeader, StatCard, Tabs } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { ESTABELECIMENTO } from '@/lib/estabelecimento';
import { PAC_TIPOS, labelOf } from '@/lib/labels';
import { formatDate, formatDateTime, formatNumber } from '@/lib/format';

const VISOES = [
  { value: 'todos', label: 'PACs e PCCs' },
  { value: 'pacs', label: 'Somente PACs' },
  { value: 'pccs', label: 'Somente PCCs' },
];

const PAC_COLUNAS = [
  { key: 'data', label: 'Data', render: (row) => formatDate(row.data) },
  {
    key: 'programa',
    label: 'PAC / programa',
    render: (row) => (
      <>
        <span className="cell-strong">{row.programa}</span>
        <div className="cell-muted">{row.codigo} · {row.tipo}</div>
      </>
    ),
  },
  { key: 'resultado', label: 'Resultado' },
  {
    key: 'conforme',
    label: 'Conforme',
    render: (row) =>
      row.conforme === false ? <Badge tone="crit">✕ Não</Badge> : <Badge tone="ok">✓ Sim</Badge>,
  },
  { key: 'responsavel', label: 'Responsável' },
  { key: 'observacao', label: 'Observação / ação corretiva' },
];

const PCC_COLUNAS = [
  { key: 'data_hora', label: 'Data/hora', render: (row) => formatDateTime(row.data_hora) },
  {
    key: 'pcc',
    label: 'PCC',
    render: (row) => (
      <>
        <span className="cell-strong">{row.pcc}</span>
        <div className="cell-muted">{row.etapa}</div>
      </>
    ),
  },
  {
    key: 'valor',
    label: 'Valor medido',
    numeric: true,
    render: (row) => `${formatNumber(row.valor)}${row.unidade ? ` ${row.unidade}` : ''}`,
  },
  { key: 'limite', label: 'Limite crítico' },
  {
    key: 'conforme',
    label: 'Conforme',
    render: (row) =>
      row.conforme === false ? (
        <Badge tone="crit">✕ Fora do limite</Badge>
      ) : (
        <Badge tone="ok">✓ Dentro do limite</Badge>
      ),
  },
  { key: 'responsavel', label: 'Responsável' },
  { key: 'observacao', label: 'Observação / ação tomada' },
];

export default function PlanilhasPage() {
  const [visao, setVisao] = useState('todos');
  const [emitidoEm, setEmitidoEm] = useState('');

  // Renderizado depois da montagem para não gerar divergência de hidratação.
  useEffect(() => {
    setEmitidoEm(new Date().toLocaleDateString('pt-BR'));
  }, []);

  const { data: pacsData } = useFetchJson('/api/pacs');
  const { data: pacRegistrosData } = useFetchJson('/api/pac_registros?limit=500');
  const { data: pccData } = useFetchJson('/api/pcc');
  const { data: pccMonitoramentosData } = useFetchJson('/api/pcc_monitoramentos?limit=500');

  const pacs = pacsData?.data ?? [];
  const pccs = pccData?.data ?? [];
  const pacPorId = new Map(pacs.map((item) => [String(item.id), item]));
  const pccPorId = new Map(pccs.map((item) => [String(item.id), item]));

  const pacRegistros = (pacRegistrosData?.data ?? []).map((row) => {
    const pac = pacPorId.get(String(row.pac_id));
    return {
      ...row,
      programa: pac?.titulo ?? `PAC #${row.pac_id}`,
      codigo: pac?.codigo ?? '—',
      tipo: labelOf(PAC_TIPOS, pac?.tipo),
    };
  });

  const pccMonitoramentos = (pccMonitoramentosData?.data ?? []).map((row) => {
    const pcc = pccPorId.get(String(row.pcc_id));
    return {
      ...row,
      pcc: pcc?.nome ?? `PCC #${row.pcc_id}`,
      etapa: pcc?.etapa_processo ?? '—',
      limite: pcc?.limite_critico ?? '—',
      unidade: pcc?.unidade ?? '',
    };
  });

  const foraDoLimite =
    pacRegistros.filter((row) => row.conforme === false).length +
    pccMonitoramentos.filter((row) => row.conforme === false).length;
  const carregando = !pacsData || !pacRegistrosData || !pccData || !pccMonitoramentosData;

  return (
    <>
      <PageHeader
        title="Planilhas de PACs e PCCs"
        subtitle="Visão consolidada de todos os registros de execução dos PACs e dos monitoramentos de PCCs, em uma única planilha pronta para impressão."
      >
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          Imprimir PDF de planilha
        </button>
      </PageHeader>

      <div className="grid grid-4 no-print" style={{ marginBottom: 18 }}>
        <StatCard label="Registros de PAC" value={pacRegistros.length} hint="Execuções lançadas" />
        <StatCard label="Monitoramentos de PCC" value={pccMonitoramentos.length} hint="Leituras lançadas" />
        <StatCard
          label="Não conformes"
          value={foraDoLimite}
          hint="Exigem ação corretiva"
          tone={foraDoLimite > 0 ? 'warn' : 'ok'}
        />
        <StatCard label="PACs / PCCs" value={`${pacs.length} / ${pccs.length}`} hint="Cadastrados no sistema" />
      </div>

      <Card className="no-print" title="Planilhas exibidas" subtitle="Escolha o que entra na impressão">
        <Tabs items={VISOES} value={visao} onChange={setVisao} />
      </Card>

      <Card className="planilha">
        <div style={{ borderBottom: '2px solid var(--ink)', paddingBottom: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 19 }}>{ESTABELECIMENTO.razaoSocial}</h2>
          <p className="text-sm muted">
            {ESTABELECIMENTO.registro} · {ESTABELECIMENTO.endereco}
          </p>
          <h3 style={{ marginTop: 12, fontSize: 16 }}>Planilhas consolidadas de PACs e PCCs</h3>
          <p className="text-sm muted">
            {emitidoEm ? `Emitido em ${emitidoEm} · ` : ''}
            {ESTABELECIMENTO.responsavelTecnico}
          </p>
        </div>

        {visao !== 'pccs' ? (
          <section style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Planilha — Registros de execução dos PACs</h3>
            <DataTable
              columns={PAC_COLUNAS}
              rows={pacRegistros}
              loading={carregando}
              empty="Nenhum registro de PAC lançado até agora."
            />
          </section>
        ) : null}

        {visao !== 'pacs' ? (
          <section>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Planilha — Monitoramentos de PCCs</h3>
            <DataTable
              columns={PCC_COLUNAS}
              rows={pccMonitoramentos}
              loading={carregando}
              empty="Nenhum monitoramento de PCC lançado até agora."
            />
          </section>
        ) : null}

        <div className="detail-grid" style={{ marginTop: 40 }}>
          <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
            <p className="text-sm">Responsável pelo preenchimento</p>
            <p className="text-sm muted">Nome / assinatura</p>
          </div>
          <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
            <p className="text-sm">{ESTABELECIMENTO.responsavelTecnico}</p>
            <p className="text-sm muted">Verificação / aprovação</p>
          </div>
        </div>
      </Card>
    </>
  );
}
