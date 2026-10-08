'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, PageHeader, StatCard, Tabs } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { PAC_TIPOS, labelOf } from '@/lib/labels';
import { formatDate } from '@/lib/format';

const PAC_FIELDS = [
  { name: 'tipo', label: 'Programa de autocontrole', type: 'select', options: PAC_TIPOS, required: true },
  { name: 'titulo', label: 'Título do programa', type: 'text', required: true, placeholder: 'Ex.: Controle de pragas' },
  { name: 'frequencia', label: 'Frequência de execução', type: 'text', placeholder: 'Ex.: Quinzenal' },
  { name: 'responsavel', label: 'Responsável', type: 'text' },
  { name: 'descricao', label: 'Descrição / procedimento', type: 'textarea', full: true },
  { name: 'ativo', label: 'Programa implantado', type: 'checkbox', defaultValue: true },
];

export default function PacsPage() {
  const [tipo, setTipo] = useState('todos');
  const [pacId, setPacId] = useState('');
  const [resumo, setResumo] = useState({ total: 0, conformes: 0, fora: 0 });

  const { data: pacsData } = useFetchJson('/api/pacs');
  const pacs = pacsData?.data ?? [];
  const pacSelecionado = pacs.find((item) => String(item.id) === String(pacId));

  const tabs = [{ value: 'todos', label: 'Todos' }, ...PAC_TIPOS];

  return (
    <>
      <PageHeader
        title="PACs — Programas de Autocontrole"
        subtitle="Manutenção, água, higiene operacional, manipuladores, pragas, matérias-primas, temperaturas, rastreabilidade, fraudes e laboratório."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="PACs cadastrados" value={pacs.length} hint="Programas de autocontrole" />
        <StatCard label="Programas ativos" value={pacs.filter((item) => item.ativo).length} hint="Implantados na rotina" />
        <StatCard label="Registros do PAC" value={resumo.total} hint="Histórico selecionado" />
        <StatCard
          label="Registros não conformes"
          value={resumo.fora}
          hint="Exigem ação corretiva"
          tone={resumo.fora > 0 ? 'warn' : 'ok'}
        />
      </div>

      <Card title="Programas por tipo" subtitle="Selecione o programa para filtrar o cadastro">
        <Tabs items={tabs} value={tipo} onChange={setTipo} />
      </Card>

      <CrudResource
        endpoint="/api/pacs"
        title="Cadastro de programas"
        createLabel="Novo PAC"
        searchable
        searchPlaceholder="Pesquisar programa…"
        filterParams={tipo === 'todos' ? undefined : { tipo }}
        fields={PAC_FIELDS}
        formOverrides={tipo === 'todos' ? undefined : { tipo }}
        columns={[
          {
            key: 'titulo',
            label: 'Programa',
            render: (row) => (
              <>
                <span className="cell-strong">{row.titulo}</span>
                <div className="cell-muted">{row.descricao || '—'}</div>
              </>
            ),
          },
          { key: 'tipo', label: 'Tipo', render: (row) => <Badge tone="brand">{labelOf(PAC_TIPOS, row.tipo)}</Badge> },
          { key: 'frequencia', label: 'Frequência' },
          { key: 'responsavel', label: 'Responsável' },
          { key: 'ativo', label: 'Situação', render: (row) => (row.ativo ? <Badge tone="ok">Ativo</Badge> : <Badge>Inativo</Badge>) },
        ]}
        filters={[{ name: 'ativo', label: 'Situação', options: [{ value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }] }]}
        emptyText="Nenhum PAC cadastrado para este tipo."
      />

      <Card
        title="Registros de execução"
        subtitle="Comprovação da execução periódica de cada programa"
        actions={
          <label className="field" style={{ minWidth: 300 }}>
            <span className="field-label">Programa</span>
            <select className="select" value={pacId} onChange={(event) => setPacId(event.target.value)}>
              <option value="">Selecione um PAC…</option>
              {pacs.map((item) => (
                <option key={item.id} value={item.id}>
                  {labelOf(PAC_TIPOS, item.tipo)} — {item.titulo}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {!pacId ? (
          <p className="muted text-sm">Selecione um programa para registrar as execuções e verificações.</p>
        ) : (
          <CrudResource
            endpoint="/api/pac_registros"
            filterParams={{ pac_id: pacId }}
            createLabel="Registrar execução"
            emptyText="Nenhum registro para este programa."
            defaultFormOpen
            fields={[
              { name: 'data', label: 'Data da execução', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) },
              { name: 'resultado', label: 'Resultado obtido', type: 'text', required: true, full: true, placeholder: 'Ex.: Cloro residual 1,2 ppm' },
              { name: 'responsavel', label: 'Responsável', type: 'text' },
              { name: 'conforme', label: 'Resultado conforme', type: 'checkbox', defaultValue: true },
              { name: 'observacao', label: 'Observação / ação corretiva', type: 'textarea', full: true },
            ]}
            transformBody={(body) => ({ ...body, pac_id: Number(pacId) })}
            columns={[
              { key: 'data', label: 'Data', render: (row) => formatDate(row.data) },
              { key: 'resultado', label: 'Resultado', render: (row) => <span className="cell-strong">{row.resultado}</span> },
              {
                key: 'conforme',
                label: 'Situação',
                render: (row) => (row.conforme ? <Badge tone="ok">✓ Conforme</Badge> : <Badge tone="crit">✕ Não conforme</Badge>),
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
        )}
      </Card>

      {pacSelecionado ? (
        <p className="muted text-sm">
          Programa selecionado: <strong>{pacSelecionado.titulo}</strong> · frequência {pacSelecionado.frequencia || '—'} · responsável{' '}
          {pacSelecionado.responsavel || '—'}
        </p>
      ) : null}
    </>
  );
}
