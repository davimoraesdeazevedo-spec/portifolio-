'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, DataTable, PageHeader, StatCard, Tabs } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { UNIDADES } from '@/lib/labels';
import { formatDate, formatNumber, formatQuantity } from '@/lib/format';

const SECTIONS = [
  { value: 'entrada', label: 'Entrada de matéria-prima', endpoint: '/api/materias_primas' },
  { value: 'producao', label: 'Produção', endpoint: '/api/producao' },
  { value: 'saida', label: 'Saída / expedição', endpoint: '/api/expedicao' },
];

function LotSearch() {
  const [lote, setLote] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function search(event) {
    event?.preventDefault();
    if (!lote.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/rastreabilidade?lote=${encodeURIComponent(lote.trim())}`, { cache: 'no-store' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Falha na pesquisa');
      setResultado(body);
      setError(null);
    } catch (caught) {
      setError(caught.message);
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Pesquisa por lote"
      subtitle="Localize a cadeia completa: matéria-prima recebida, lote produzido e destinos expedidos."
    >
      <form className="toolbar" onSubmit={search} style={{ marginBottom: resultado ? 16 : 0 }}>
        <input
          className="input input--inline"
          style={{ minWidth: 280 }}
          placeholder="Lote de matéria-prima, lote de produção, produto ou nota fiscal"
          value={lote}
          onChange={(event) => setLote(event.target.value)}
        />
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Pesquisando…' : 'Pesquisar lote'}
        </button>
        {resultado ? <Badge tone="brand">{resultado.total} registro(s) encontrado(s)</Badge> : null}
      </form>

      {error ? <div className="alert alert--crit">⚠️ {error}</div> : null}

      {resultado && resultado.total === 0 ? (
        <p className="muted text-sm">Nenhum registro encontrado para “{resultado.lote}”.</p>
      ) : null}

      {resultado && resultado.total > 0 ? (
        <div className="stack">
          <div>
            <h4 className="card-title" style={{ marginBottom: 8 }}>1. Entrada de matéria-prima</h4>
            <DataTable
              loading={false}
              empty="Sem registros de entrada para este lote."
              rows={resultado.entradas}
              columns={[
                { key: 'lote', label: 'Lote', render: (row) => <span className="mono">{row.lote}</span> },
                { key: 'produto', label: 'Produto', render: (row) => <span className="cell-strong">{row.produto}</span> },
                { key: 'fornecedor', label: 'Fornecedor', render: (row) => `${row.fornecedor || '—'} (${row.registro_fornecedor || '—'})` },
                { key: 'quantidade', label: 'Quantidade', numeric: true, render: (row) => formatQuantity(row.quantidade, row.unidade) },
                { key: 'temperatura_recebimento', label: 'Temp.', numeric: true, render: (row) => `${formatNumber(row.temperatura_recebimento)} °C` },
                { key: 'data_entrada', label: 'Entrada', render: (row) => formatDate(row.data_entrada) },
              ]}
            />
          </div>

          <div>
            <h4 className="card-title" style={{ marginBottom: 8 }}>2. Produção</h4>
            <DataTable
              loading={false}
              empty="Sem registros de produção para este lote."
              rows={resultado.producao}
              columns={[
                { key: 'lote_producao', label: 'Lote de produção', render: (row) => <span className="mono">{row.lote_producao}</span> },
                { key: 'produto', label: 'Produto', render: (row) => <span className="cell-strong">{row.produto}</span> },
                { key: 'lotes_materia_prima', label: 'Matérias-primas', render: (row) => <span className="mono cell-muted">{row.lotes_materia_prima || '—'}</span> },
                { key: 'quantidade', label: 'Quantidade', numeric: true, render: (row) => formatQuantity(row.quantidade, row.unidade) },
                { key: 'data_producao', label: 'Produção', render: (row) => formatDate(row.data_producao) },
                { key: 'responsavel', label: 'Responsável' },
              ]}
            />
          </div>

          <div>
            <h4 className="card-title" style={{ marginBottom: 8 }}>3. Saída / expedição</h4>
            <DataTable
              loading={false}
              empty="Sem registros de saída para este lote."
              rows={resultado.saidas}
              columns={[
                { key: 'lote_producao', label: 'Lote', render: (row) => <span className="mono">{row.lote_producao}</span> },
                { key: 'produto', label: 'Produto', render: (row) => <span className="cell-strong">{row.produto}</span> },
                { key: 'cliente', label: 'Cliente' },
                { key: 'destino', label: 'Destino' },
                { key: 'quantidade', label: 'Quantidade', numeric: true, render: (row) => formatQuantity(row.quantidade, row.unidade) },
                { key: 'temperatura_saida', label: 'Temp. saída', numeric: true, render: (row) => `${formatNumber(row.temperatura_saida)} °C` },
                { key: 'data_saida', label: 'Saída', render: (row) => formatDate(row.data_saida) },
              ]}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export default function RastreabilidadePage() {
  const [section, setSection] = useState('entrada');

  const { data: entradas } = useFetchJson('/api/materias_primas?limit=500');
  const { data: lotes } = useFetchJson('/api/producao?limit=500');
  const { data: saidas } = useFetchJson('/api/expedicao?limit=500');

  return (
    <>
      <PageHeader
        title="Rastreabilidade"
        subtitle="Vínculo entre matéria-prima recebida, produção e expedição, permitindo reconstruir o histórico de qualquer lote."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Entradas registradas" value={entradas?.count ?? 0} hint="Matérias-primas recebidas" />
        <StatCard label="Lotes de produção" value={lotes?.count ?? 0} hint="Rastreabilidade de processo" />
        <StatCard label="Saídas registradas" value={saidas?.count ?? 0} hint="Expedição e clientes" />
        <StatCard
          label="Lotes com fornecedor"
          value={(entradas?.data ?? []).filter((row) => row.registro_fornecedor).length}
          hint="Com registro SIF/SIE/SISBI informado"
        />
      </div>

      <LotSearch />

      <Card title="Cadastros de rastreabilidade" subtitle="Selecione a etapa para lançar ou consultar os registros">
        <Tabs items={SECTIONS.map(({ value, label }) => ({ value, label }))} value={section} onChange={setSection} />
      </Card>

      {section === 'entrada' ? (
        <CrudResource
          endpoint="/api/materias_primas"
          title="Entrada de matéria-prima"
          createLabel="Nova entrada"
          searchable
          searchPlaceholder="Pesquisar lote, produto ou fornecedor…"
          fields={[
            { name: 'produto', label: 'Produto / matéria-prima', type: 'text', required: true },
            { name: 'lote', label: 'Lote do fornecedor', type: 'text', required: true, placeholder: 'Ex.: MP-2026-0451' },
            { name: 'fornecedor', label: 'Fornecedor', type: 'text' },
            { name: 'registro_fornecedor', label: 'Registro do fornecedor', type: 'text', placeholder: 'SIF / SIE / SISBI' },
            { name: 'quantidade', label: 'Quantidade', type: 'number', step: '0.01' },
            { name: 'unidade', label: 'Unidade', type: 'select', options: UNIDADES },
            { name: 'temperatura_recebimento', label: 'Temperatura de recebimento (°C)', type: 'number', step: '0.1' },
            { name: 'data_entrada', label: 'Data de entrada', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
            { name: 'nota_fiscal', label: 'Nota fiscal', type: 'text' },
            { name: 'responsavel', label: 'Responsável pelo recebimento', type: 'text' },
          ]}
          columns={[
            { key: 'lote', label: 'Lote', render: (row) => <span className="mono">{row.lote}</span> },
            { key: 'produto', label: 'Produto', render: (row) => <span className="cell-strong">{row.produto}</span> },
            { key: 'fornecedor', label: 'Fornecedor', render: (row) => `${row.fornecedor || '—'} · ${row.registro_fornecedor || '—'}` },
            { key: 'quantidade', label: 'Quantidade', numeric: true, render: (row) => formatQuantity(row.quantidade, row.unidade) },
            { key: 'temperatura_recebimento', label: 'Temp.', numeric: true, render: (row) => `${formatNumber(row.temperatura_recebimento)} °C` },
            { key: 'data_entrada', label: 'Entrada', render: (row) => formatDate(row.data_entrada) },
            { key: 'nota_fiscal', label: 'NF' },
          ]}
          emptyText="Nenhuma entrada registrada."
        />
      ) : null}

      {section === 'producao' ? (
        <CrudResource
          endpoint="/api/producao"
          title="Produção"
          createLabel="Novo lote produzido"
          searchable
          searchPlaceholder="Pesquisar lote ou produto…"
          fields={[
            { name: 'produto', label: 'Produto fabricado', type: 'text', required: true },
            { name: 'lote_producao', label: 'Lote de produção', type: 'text', required: true, placeholder: 'Ex.: LP-2026-0118' },
            { name: 'lotes_materia_prima', label: 'Lotes de matéria-prima utilizados', type: 'text', full: true, placeholder: 'MP-2026-0451, MP-2026-0452' },
            { name: 'quantidade', label: 'Quantidade produzida', type: 'number', step: '0.01' },
            { name: 'unidade', label: 'Unidade', type: 'select', options: UNIDADES },
            { name: 'data_producao', label: 'Data de produção', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
            { name: 'responsavel', label: 'Responsável', type: 'text' },
            { name: 'observacao', label: 'Observação', type: 'textarea', full: true },
          ]}
          columns={[
            { key: 'lote_producao', label: 'Lote', render: (row) => <span className="mono">{row.lote_producao}</span> },
            { key: 'produto', label: 'Produto', render: (row) => <span className="cell-strong">{row.produto}</span> },
            { key: 'lotes_materia_prima', label: 'Matérias-primas', render: (row) => <span className="mono cell-muted">{row.lotes_materia_prima || '—'}</span> },
            { key: 'quantidade', label: 'Quantidade', numeric: true, render: (row) => formatQuantity(row.quantidade, row.unidade) },
            { key: 'data_producao', label: 'Produção', render: (row) => formatDate(row.data_producao) },
            { key: 'responsavel', label: 'Responsável' },
          ]}
          emptyText="Nenhum lote produzido registrado."
        />
      ) : null}

      {section === 'saida' ? (
        <CrudResource
          endpoint="/api/expedicao"
          title="Saída / expedição"
          createLabel="Nova saída"
          searchable
          searchPlaceholder="Pesquisar cliente, destino ou lote…"
          fields={[
            { name: 'produto', label: 'Produto', type: 'text', required: true },
            { name: 'lote_producao', label: 'Lote de produção', type: 'text' },
            { name: 'cliente', label: 'Cliente', type: 'text' },
            { name: 'destino', label: 'Destino (cidade/UF)', type: 'text' },
            { name: 'quantidade', label: 'Quantidade', type: 'number', step: '0.01' },
            { name: 'unidade', label: 'Unidade', type: 'select', options: UNIDADES },
            { name: 'temperatura_saida', label: 'Temperatura de saída (°C)', type: 'number', step: '0.1' },
            { name: 'data_saida', label: 'Data de saída', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
            { name: 'responsavel', label: 'Responsável', type: 'text' },
          ]}
          columns={[
            { key: 'lote_producao', label: 'Lote', render: (row) => <span className="mono">{row.lote_producao || '—'}</span> },
            { key: 'produto', label: 'Produto', render: (row) => <span className="cell-strong">{row.produto}</span> },
            { key: 'cliente', label: 'Cliente' },
            { key: 'destino', label: 'Destino' },
            { key: 'quantidade', label: 'Quantidade', numeric: true, render: (row) => formatQuantity(row.quantidade, row.unidade) },
            { key: 'temperatura_saida', label: 'Temp.', numeric: true, render: (row) => `${formatNumber(row.temperatura_saida)} °C` },
            { key: 'data_saida', label: 'Saída', render: (row) => formatDate(row.data_saida) },
          ]}
          emptyText="Nenhuma saída registrada."
        />
      ) : null}
    </>
  );
}
