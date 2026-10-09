'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { apiPatch } from '@/lib/api-client';
import { daysUntil, formatDate } from '@/lib/format';

function EmitirCertificadoButton({ row, reload }) {
  if (row.certificado_emitido) return null;
  return (
    <button
      type="button"
      className="btn btn--sm"
      onClick={async () => {
        try {
          await apiPatch(`/api/treinamento_participantes/${row.id}`, { certificado_emitido: true });
          await reload();
        } catch (error) {
          window.alert(error.message);
        }
      }}
    >
      Emitir certificado
    </button>
  );
}

export default function TreinamentosPage() {
  const [treinamentoId, setTreinamentoId] = useState('');

  const { data: treinamentosData } = useFetchJson('/api/treinamentos?limit=200');
  const treinamentos = treinamentosData?.data ?? [];
  const selecionado = treinamentos.find((item) => String(item.id) === String(treinamentoId));

  const vencidos = treinamentos.filter((row) => (daysUntil(row.proxima_reciclagem) ?? 1) < 0).length;

  return (
    <>
      <PageHeader
        title="Treinamentos"
        subtitle="Lista de presença, emissão de certificados e controle de reciclagem dos manipuladores e da equipe de qualidade."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Treinamentos realizados" value={treinamentos.length} hint="Histórico da planta" />
        <StatCard label="Certificados emitidos" value={selecionado ? '—' : treinamentos.filter((row) => row.proxima_reciclagem).length} hint="Participantes com certificado" tone="ok" />
        <StatCard label="Reciclagem vencida" value={vencidos} hint="Reagendar treinamento" tone={vencidos > 0 ? 'crit' : 'ok'} />
        <StatCard
          label="Reciclagem em 30 dias"
          value={treinamentos.filter((row) => {
            const dias = daysUntil(row.proxima_reciclagem);
            return dias !== null && dias >= 0 && dias <= 30;
          }).length}
          hint="Programar nova turma"
          tone="warn"
        />
      </div>

      <CrudResource
        endpoint="/api/treinamentos"
        title="Treinamentos e reciclagens"
        createLabel="Novo treinamento"
        searchable
        searchPlaceholder="Pesquisar título, tema ou instrutor…"
        fields={[
          { name: 'titulo', label: 'Título do treinamento', type: 'text', required: true, full: true },
          { name: 'tema', label: 'Tema abordado', type: 'text' },
          { name: 'instrutor', label: 'Instrutor', type: 'text' },
          { name: 'data_realizacao', label: 'Data de realização', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
          { name: 'carga_horaria', label: 'Carga horária (h)', type: 'number', step: '0.5' },
          { name: 'validade_meses', label: 'Validade da reciclagem (meses)', type: 'number', step: '1', defaultValue: 12 },
          { name: 'proxima_reciclagem', label: 'Próxima reciclagem', type: 'date' },
        ]}
        columns={[
          {
            key: 'titulo',
            label: 'Treinamento',
            render: (row) => (
              <>
                <span className="cell-strong">{row.titulo}</span>
                <div className="cell-muted">{row.tema || '—'}</div>
              </>
            ),
          },
          { key: 'instrutor', label: 'Instrutor' },
          { key: 'data_realizacao', label: 'Realizado em', render: (row) => formatDate(row.data_realizacao) },
          { key: 'carga_horaria', label: 'Carga', numeric: true, render: (row) => `${row.carga_horaria ?? '—'} h` },
          { key: 'proxima_reciclagem', label: 'Reciclagem', render: (row) => formatDate(row.proxima_reciclagem) },
          {
            key: 'situacao',
            label: 'Situação',
            render: (row) => {
              const dias = daysUntil(row.proxima_reciclagem);
              if (dias === null) return <Badge>Sem validade</Badge>;
              if (dias < 0) return <Badge tone="crit">Vencida</Badge>;
              if (dias <= 30) return <Badge tone="warn">A vencer</Badge>;
              return <Badge tone="ok">Em dia</Badge>;
            },
          },
        ]}
        rowActions={(row) => (
          <a className="btn btn--sm" href={`/treinamentos/${row.id}/certificados`} target="_blank" rel="noreferrer">
            Certificados
          </a>
        )}
        emptyText="Nenhum treinamento registrado."
      />

      <Card
        title="Lista de presença e certificados"
        subtitle="Participantes do treinamento selecionado"
        actions={
          <label className="field" style={{ minWidth: 300 }}>
            <span className="field-label">Treinamento</span>
            <select className="select" value={treinamentoId} onChange={(event) => setTreinamentoId(event.target.value)}>
              <option value="">Selecione um treinamento…</option>
              {treinamentos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.titulo} — {formatDate(item.data_realizacao)}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {!treinamentoId ? (
          <p className="muted text-sm">Selecione um treinamento para lançar a lista de presença e emitir certificados.</p>
        ) : (
          <>
            {selecionado ? (
              <div className="alert" style={{ marginBottom: 14 }}>
                <span className="alert-icon" aria-hidden="true">🎓</span>
                <span>
                  <span className="alert-module">Turma</span>
                  <br />
                  {selecionado.titulo} · {formatDate(selecionado.data_realizacao)} · {selecionado.carga_horaria ?? '—'} h · instrutor{' '}
                  {selecionado.instrutor || '—'} · reciclagem até {formatDate(selecionado.proxima_reciclagem)}
                </span>
              </div>
            ) : null}

            <CrudResource
              endpoint="/api/treinamento_participantes"
              filterParams={{ treinamento_id: treinamentoId }}
              createLabel="Adicionar participante"
              emptyText="Nenhum participante lançado nesta turma."
              fields={[
                { name: 'nome', label: 'Nome do participante', type: 'text', required: true },
                { name: 'cargo', label: 'Cargo / função', type: 'text' },
                { name: 'cpf', label: 'CPF', type: 'text' },
                { name: 'presenca', label: 'Presença confirmada', type: 'checkbox', defaultValue: true },
                { name: 'certificado_emitido', label: 'Certificado emitido', type: 'checkbox', defaultValue: false },
              ]}
              transformBody={(body) => ({ ...body, treinamento_id: Number(treinamentoId) })}
              headerExtra={
                selecionado ? (
                  <a className="btn" href={`/treinamentos/${selecionado.id}/certificados`} target="_blank" rel="noreferrer">
                    Imprimir certificados
                  </a>
                ) : null
              }
              columns={[
                { key: 'nome', label: 'Participante', render: (row) => <span className="cell-strong">{row.nome}</span> },
                { key: 'cargo', label: 'Cargo' },
                { key: 'cpf', label: 'CPF', render: (row) => <span className="mono">{row.cpf || '—'}</span> },
                {
                  key: 'presenca',
                  label: 'Presença',
                  render: (row) => (row.presenca ? <Badge tone="ok">Presente</Badge> : <Badge tone="crit">Ausente</Badge>),
                },
                {
                  key: 'certificado_emitido',
                  label: 'Certificado',
                  render: (row) => (row.certificado_emitido ? <Badge tone="ok">Emitido</Badge> : <Badge tone="warn">Pendente</Badge>),
                },
              ]}
              rowActions={(row, reload) => <EmitirCertificadoButton row={row} reload={reload} />}
            />
          </>
        )}
      </Card>
    </>
  );
}
