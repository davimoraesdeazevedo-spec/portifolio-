'use client';

import CrudResource from '@/components/CrudResource';
import { Badge, BarRow, Card, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { TEMPERATURA_LIMITES, TEMPERATURA_TIPOS, labelOf } from '@/lib/labels';
import { formatDateTime, formatNumber, formatPercent, nowForInput } from '@/lib/format';

const FIELDS = [
  { name: 'equipamento', label: 'Equipamento / produto', type: 'text', required: true, placeholder: 'Ex.: Câmara de resfriamento 01' },
  { name: 'tipo', label: 'Local de controle', type: 'select', options: TEMPERATURA_TIPOS, required: true },
  { name: 'temperatura', label: 'Temperatura medida (°C)', type: 'number', step: '0.1', required: true },
  { name: 'limite_min', label: 'Limite mínimo (°C)', type: 'number', step: '0.1' },
  { name: 'limite_max', label: 'Limite máximo (°C)', type: 'number', step: '0.1' },
  { name: 'data_hora', label: 'Data e hora da leitura', type: 'datetime-local', defaultValue: nowForInput() },
  { name: 'responsavel', label: 'Responsável pela leitura', type: 'text' },
  { name: 'observacao', label: 'Observação / ação corretiva', type: 'textarea', full: true },
];

// Choosing the location fills in the regulatory default limits for that equipment.
function derive(next, changed) {
  if (changed !== 'tipo') return next;
  const limites = TEMPERATURA_LIMITES[next.tipo];
  if (!limites) return next;
  return { ...next, limite_min: String(limites.min), limite_max: String(limites.max) };
}

export default function TemperaturasPage() {
  const { data } = useFetchJson('/api/dashboard');
  const indicadores = data?.indicadores ?? {};
  const porTipo = data?.temperaturasPorTipo ?? [];

  return (
    <>
      <PageHeader
        title="Controle de temperaturas"
        subtitle="Câmaras de resfriamento e congelamento, produto acabado e veículos refrigerados. A conformidade é calculada automaticamente a partir dos limites informados."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Leituras em 24 h" value={indicadores.temperaturas24h ?? 0} hint="Todas as categorias" />
        <StatCard
          label="Fora da faixa"
          value={indicadores.temperaturasFora24h ?? 0}
          hint="Acionar ação corretiva"
          tone={indicadores.temperaturasFora24h > 0 ? 'crit' : 'ok'}
        />
        <StatCard
          label="Aderência 24 h"
          value={formatPercent((indicadores.temperaturas24h ?? 0) - (indicadores.temperaturasFora24h ?? 0), indicadores.temperaturas24h ?? 0)}
          hint="Leituras conformes"
          tone="ok"
        />
        <StatCard label="Categorias monitoradas" value={porTipo.length} hint="Resfriamento, congelamento, produto e veículo" />
      </div>

      <div className="grid grid-2">
        <Card title="Conformidade por categoria (24 h)">
          {porTipo.length === 0 ? (
            <p className="muted text-sm">Nenhuma leitura nas últimas 24 horas.</p>
          ) : (
            porTipo.map((row) => (
              <BarRow
                key={row.tipo}
                label={labelOf(TEMPERATURA_TIPOS, row.tipo)}
                value={row.conformes}
                max={row.total}
                hint={`${row.conformes}/${row.total} conformes`}
                tone={row.fora > 0 ? 'crit' : 'ok'}
              />
            ))
          )}
        </Card>

        <Card title="Limites críticos de referência" subtitle="Padrões aplicados por categoria de equipamento">
          <table className="data">
            <thead>
              <tr>
                <th>Categoria</th>
                <th className="num">Faixa recomendada</th>
              </tr>
            </thead>
            <tbody>
              {TEMPERATURA_TIPOS.map((tipo) => (
                <tr key={tipo.value}>
                  <td>{tipo.label}</td>
                  <td className="num cell-strong">
                    {TEMPERATURA_LIMITES[tipo.value].min} °C a {TEMPERATURA_LIMITES[tipo.value].max} °C
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <CrudResource
        endpoint="/api/temperaturas"
        title="Registros de temperatura"
        createLabel="Nova leitura"
        searchable
        searchPlaceholder="Pesquisar equipamento…"
        fields={FIELDS}
        derive={derive}
        formNote="A situação (conforme / fora da faixa) é calculada automaticamente comparando a temperatura com os limites informados."
        filters={[
          { name: 'tipo', label: 'Categoria', options: TEMPERATURA_TIPOS },
          { name: 'conforme', label: 'Situação', options: [{ value: 'true', label: 'Conformes' }, { value: 'false', label: 'Fora da faixa' }] },
        ]}
        columns={[
          {
            key: 'equipamento',
            label: 'Equipamento / produto',
            render: (row) => (
              <>
                <span className="cell-strong">{row.equipamento}</span>
                <div className="cell-muted">{formatDateTime(row.data_hora)}</div>
              </>
            ),
          },
          { key: 'tipo', label: 'Categoria', render: (row) => labelOf(TEMPERATURA_TIPOS, row.tipo) },
          {
            key: 'temperatura',
            label: 'Leitura',
            numeric: true,
            render: (row) => (
              <span className="cell-strong" style={{ color: row.conforme === false ? 'var(--crit)' : 'inherit' }}>
                {formatNumber(row.temperatura)} °C
              </span>
            ),
          },
          {
            key: 'faixa',
            label: 'Faixa',
            numeric: true,
            render: (row) => `${formatNumber(row.limite_min)} a ${formatNumber(row.limite_max)} °C`,
          },
          {
            key: 'conforme',
            label: 'Situação',
            render: (row) => (row.conforme === false ? <Badge tone="crit">✕ Fora da faixa</Badge> : <Badge tone="ok">✓ Conforme</Badge>),
          },
          { key: 'responsavel', label: 'Responsável' },
        ]}
        emptyText="Nenhuma leitura registrada."
      />
    </>
  );
}
