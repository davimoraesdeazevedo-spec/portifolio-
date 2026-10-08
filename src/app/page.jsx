'use client';

import { AlertList, Badge, BarRow, Card, ConformidadeBadge, DataTable, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { GRAVIDADES, NC_STATUS, TEMPERATURA_TIPOS, labelOf } from '@/lib/labels';
import { formatDate, formatDateTime, formatNumber, formatPercent } from '@/lib/format';

export default function DashboardPage() {
  const { data, loading, error } = useFetchJson('/api/dashboard');

  if (loading && !data) return <div className="loading">Carregando indicadores…</div>;
  if (error) return <div className="alert alert--crit">⚠️ {error}</div>;

  const indicadores = data?.indicadores ?? {};
  const temperaturasPorTipo = data?.temperaturasPorTipo ?? [];
  const totalTemperaturas = temperaturasPorTipo.reduce((sum, row) => sum + row.total, 0);

  return (
    <>
      <PageHeader
        title="Painel de controle"
        subtitle="Indicadores consolidados de PACs, APPCC, temperaturas, análises e não conformidades do estabelecimento."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          label="PCCs cadastrados"
          value={indicadores.pccAtivos ?? 0}
          hint={`${indicadores.monitoramentosTotal ?? 0} monitoramento(s) em 30 dias`}
        />
        <StatCard
          label="PCC fora do limite"
          value={indicadores.monitoramentosFora ?? 0}
          hint="Últimos 30 dias"
          tone={indicadores.monitoramentosFora > 0 ? 'crit' : 'ok'}
        />
        <StatCard
          label="Temperaturas fora da faixa"
          value={indicadores.temperaturasFora24h ?? 0}
          hint={`${indicadores.temperaturas24h ?? 0} leitura(s) em 24 h`}
          tone={indicadores.temperaturasFora24h > 0 ? 'crit' : 'ok'}
        />
        <StatCard
          label="Não conformidades abertas"
          value={indicadores.ncAbertas ?? 0}
          hint={`${indicadores.ncTotal ?? 0} registradas no total`}
          tone={indicadores.ncAbertas > 0 ? 'warn' : 'ok'}
        />
        <StatCard
          label="Análises pendentes"
          value={indicadores.analisesPendentes ?? 0}
          hint={`${indicadores.analisesNaoConformes ?? 0} não conforme(s)`}
          tone={indicadores.analisesPendentes > 0 ? 'warn' : 'ok'}
        />
        <StatCard
          label="Documentos vencidos"
          value={indicadores.documentosVencidos ?? 0}
          hint="Revisão vencida ou nos próximos 30 dias"
          tone={indicadores.documentosVencidos > 0 ? 'crit' : 'ok'}
        />
        <StatCard label="PACs ativos" value={indicadores.pacsAtivos ?? 0} hint="Programas de autocontrole implantados" />
        <StatCard label="Lotes produzidos" value={indicadores.lotesProducao ?? 0} hint="Com rastreabilidade vinculada" />
      </div>

      <div className="grid grid-2">
        <Card title="Alertas automáticos" subtitle="Gerados a partir dos limites críticos e prazos de controle">
          <AlertList alertas={data?.alertas} />
        </Card>

        <Card title="Temperaturas por tipo (24 h)" subtitle="Percentual de leituras conformes por equipamento">
          {temperaturasPorTipo.length === 0 ? (
            <p className="muted text-sm">Nenhuma leitura registrada nas últimas 24 horas.</p>
          ) : (
            temperaturasPorTipo.map((row) => (
              <BarRow
                key={row.tipo}
                label={labelOf(TEMPERATURA_TIPOS, row.tipo)}
                value={row.conformes}
                max={row.total}
                hint={`${row.conformes}/${row.total} conformes${row.fora > 0 ? ` · ${row.fora} fora` : ''}`}
                tone={row.fora > 0 ? 'crit' : 'ok'}
              />
            ))
          )}
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Últimas leituras fora da faixa" subtitle="Ação corretiva obrigatória conforme o PAC de temperaturas">
          <DataTable
            loading={false}
            empty="Nenhuma leitura fora da faixa registrada."
            rows={data?.temperaturasFora ?? []}
            columns={[
              { key: 'equipamento', label: 'Equipamento', render: (row) => <span className="cell-strong">{row.equipamento}</span> },
              { key: 'tipo', label: 'Tipo', render: (row) => labelOf(TEMPERATURA_TIPOS, row.tipo) },
              {
                key: 'temperatura',
                label: 'Leitura',
                numeric: true,
                render: (row) => (
                  <span className="cell-strong" style={{ color: 'var(--crit)' }}>
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
              { key: 'data_hora', label: 'Data/hora', render: (row) => formatDateTime(row.data_hora) },
            ]}
          />
        </Card>

        <Card title="Não conformidades em aberto" subtitle="Priorizadas por gravidade e prazo">
          <DataTable
            loading={false}
            empty="Nenhuma não conformidade em aberto."
            rows={data?.ncAbertas ?? []}
            columns={[
              { key: 'descricao', label: 'Descrição', render: (row) => <span className="cell-strong">{row.descricao}</span> },
              { key: 'gravidade', label: 'Gravidade', render: (row) => <Badge tone={row.gravidade === 'alta' ? 'crit' : row.gravidade === 'media' ? 'warn' : ''}>{labelOf(GRAVIDADES, row.gravidade)}</Badge> },
              { key: 'status', label: 'Situação', render: (row) => labelOf(NC_STATUS, row.status) },
              { key: 'prazo', label: 'Prazo', render: (row) => formatDate(row.prazo) },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Análises pendentes" subtitle="Aguardando resultado ou anexação de laudo">
          <DataTable
            loading={false}
            empty="Nenhuma análise pendente."
            rows={data?.analisesPendentesLista ?? []}
            columns={[
              { key: 'tipo', label: 'Tipo', render: (row) => <Badge tone="info">{String(row.tipo).toUpperCase()}</Badge> },
              { key: 'ponto', label: 'Ponto / lote', render: (row) => <span className="cell-strong">{row.ponto || row.lote || '—'}</span> },
              { key: 'parametro', label: 'Parâmetro' },
              { key: 'data_coleta', label: 'Coleta', render: (row) => formatDate(row.data_coleta) },
            ]}
          />
        </Card>

        <Card title="Vencimentos de gestão" subtitle="Documentos e reciclagens de treinamento">
          <h4 className="detail-block" style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            Documentos com revisão próxima ou vencida
          </h4>
          <DataTable
            loading={false}
            empty="Nenhum documento a vencer."
            rows={data?.documentosLista ?? []}
            columns={[
              { key: 'titulo', label: 'Documento', render: (row) => <span className="cell-strong">{row.titulo}</span> },
              { key: 'versao', label: 'Rev.', numeric: true },
              { key: 'proxima_revisao', label: 'Próxima revisão', render: (row) => formatDate(row.proxima_revisao) },
            ]}
          />
          <div className="divider" />
          <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            Treinamentos com reciclagem a vencer
          </h4>
          <DataTable
            loading={false}
            empty="Nenhum treinamento a vencer."
            rows={data?.treinamentosLista ?? []}
            columns={[
              { key: 'titulo', label: 'Treinamento', render: (row) => <span className="cell-strong">{row.titulo}</span> },
              { key: 'instrutor', label: 'Instrutor' },
              { key: 'proxima_reciclagem', label: 'Reciclagem', render: (row) => formatDate(row.proxima_reciclagem) },
            ]}
          />
        </Card>
      </div>

      <Card title="Última auditoria por serviço de inspeção" subtitle="SIM, SISBI, SIE e SIF">
        <DataTable
          loading={false}
          empty="Nenhuma auditoria registrada."
          rows={data?.auditorias ?? []}
          columns={[
            { key: 'tipo', label: 'Serviço', render: (row) => <Badge tone="brand">{row.tipo}</Badge> },
            { key: 'data', label: 'Data', render: (row) => formatDate(row.data) },
            {
              key: 'resultado',
              label: 'Resultado',
              render: (row) =>
                row.resultado === 'conforme' ? <Badge tone="ok">Conforme</Badge> : <Badge tone="crit">Com não conformidade</Badge>,
            },
            { key: 'pontuacao', label: 'Pontuação', numeric: true, render: (row) => `${formatNumber(row.pontuacao)}%` },
            { key: 'conformidade', label: 'Aderência', render: (row) => <ConformidadeBadge value={(row.pontuacao ?? 0) >= 90} trueLabel={`${formatPercent(row.pontuacao ?? 0, 100)}`} falseLabel={`${formatPercent(row.pontuacao ?? 0, 100)}`} /> },
          ]}
        />
      </Card>
    </>
  );
}
