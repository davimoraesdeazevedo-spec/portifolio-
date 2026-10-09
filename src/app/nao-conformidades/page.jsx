'use client';

import CrudResource from '@/components/CrudResource';
import { Badge, Card, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { GRAVIDADES, NC_STATUS, labelOf } from '@/lib/labels';
import { apiPatch } from '@/lib/api-client';
import { formatDate } from '@/lib/format';

const TONE_GRAVIDADE = { alta: 'crit', media: 'warn', baixa: '' };
const TONE_STATUS = { aberta: 'crit', em_acao: 'warn', verificacao: 'info', encerrada: 'ok' };

function StatusSelect({ row, reload }) {
  return (
    <select
      className="select"
      style={{ width: 'auto', minWidth: 165 }}
      value={row.status ?? 'aberta'}
      onChange={async (event) => {
        try {
          await apiPatch(`/api/nao_conformidades/${row.id}`, { status: event.target.value });
          await reload();
        } catch (error) {
          window.alert(error.message);
        }
      }}
    >
      {NC_STATUS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function NaoConformidadesPage() {
  const { data } = useFetchJson('/api/nao_conformidades?limit=500');
  const registros = data?.data ?? [];

  const abertas = registros.filter((row) => row.status !== 'encerrada').length;
  const verificacao = registros.filter((row) => row.status === 'verificacao').length;
  const encerradas = registros.filter((row) => row.status === 'encerrada').length;
  const altaGravidade = registros.filter((row) => row.gravidade === 'alta' && row.status !== 'encerrada').length;

  return (
    <>
      <PageHeader
        title="Não conformidades"
        subtitle="Registro com foto, ação corretiva, prazo, verificação de eficácia e encerramento — conforme exigido pelos autocontroles."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Em aberto" value={abertas} hint="Aguardando tratamento" tone={abertas > 0 ? 'warn' : 'ok'} />
        <StatCard label="Aguardando verificação" value={verificacao} hint="Eficácia da ação corretiva" tone="warn" />
        <StatCard label="Gravidade alta" value={altaGravidade} hint="Prioridade máxima" tone={altaGravidade > 0 ? 'crit' : 'ok'} />
        <StatCard label="Encerradas" value={encerradas} hint="Com eficácia verificada" tone="ok" />
      </div>

      <CrudResource
        endpoint="/api/nao_conformidades"
        title="Registro de não conformidades"
        createLabel="Registrar não conformidade"
        searchable
        searchPlaceholder="Pesquisar descrição, origem ou responsável…"
        fields={[
          { name: 'descricao', label: 'Descrição da não conformidade', type: 'textarea', required: true, full: true, placeholder: 'Ex.: Câmara 02 registrou 8,4 °C durante o carregamento' },
          { name: 'origem', label: 'Origem / detecção', type: 'text', placeholder: 'Ex.: Controle de temperaturas' },
          { name: 'gravidade', label: 'Gravidade', type: 'select', options: GRAVIDADES, defaultValue: 'media' },
          { name: 'responsavel', label: 'Responsável', type: 'text' },
          { name: 'prazo', label: 'Prazo para resolução', type: 'date' },
          { name: 'status', label: 'Situação', type: 'select', options: NC_STATUS, defaultValue: 'aberta' },
          { name: 'foto_url', label: 'Foto da evidência', type: 'file', accept: 'image/*', help: 'Registre a evidência fotográfica da ocorrência.' },
          { name: 'acao_corretiva', label: 'Ação corretiva', type: 'textarea', full: true },
          { name: 'verificacao_eficacia', label: 'Verificação de eficácia', type: 'textarea', full: true },
          { name: 'data_verificacao', label: 'Data da verificação', type: 'date' },
        ]}
        columns={[
          {
            key: 'descricao',
            label: 'Não conformidade',
            render: (row) => (
              <>
                <span className="cell-strong">{row.descricao}</span>
                <div className="cell-muted">Origem: {row.origem || '—'}</div>
              </>
            ),
          },
          { key: 'gravidade', label: 'Gravidade', render: (row) => <Badge tone={TONE_GRAVIDADE[row.gravidade]}>{labelOf(GRAVIDADES, row.gravidade)}</Badge> },
          { key: 'status', label: 'Situação', render: (row) => <Badge tone={TONE_STATUS[row.status]}>{labelOf(NC_STATUS, row.status)}</Badge> },
          { key: 'prazo', label: 'Prazo', render: (row) => formatDate(row.prazo) },
          { key: 'responsavel', label: 'Responsável' },
          {
            key: 'foto',
            label: 'Foto',
            render: (row) =>
              row.foto_url ? (
                <a href={row.foto_url} target="_blank" rel="noreferrer">
                  <img className="thumb" src={row.foto_url} alt="Evidência da não conformidade" />
                </a>
              ) : (
                <span className="cell-muted">Sem foto</span>
              ),
          },
          {
            key: 'acao',
            label: 'Ação corretiva',
            render: (row) => (
              <>
                <span className="cell-muted">{row.acao_corretiva || 'Não registrada'}</span>
                {row.verificacao_eficacia ? <div className="cell-muted">Eficácia: {row.verificacao_eficacia}</div> : null}
              </>
            ),
          },
        ]}
        rowActions={(row, reload) => <StatusSelect row={row} reload={reload} />}
        filters={[
          { name: 'status', label: 'Situação', options: NC_STATUS },
          { name: 'gravidade', label: 'Gravidade', options: GRAVIDADES },
        ]}
        emptyText="Nenhuma não conformidade registrada."
      />
    </>
  );
}
