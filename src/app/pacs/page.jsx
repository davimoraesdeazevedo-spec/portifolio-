'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, PageHeader, StatCard, Tabs } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { PAC_TIPOS, labelOf } from '@/lib/labels';
import { formatDate } from '@/lib/format';

const PAC_FIELDS = [
  // a) Cabeçalho
  { name: 'tipo', label: 'Elemento de controle (art. 5º)', type: 'select', options: PAC_TIPOS, required: true, full: true },
  { name: 'titulo', label: 'Título do programa', type: 'text', required: true, placeholder: 'Ex.: Controle integrado de pragas' },
  { name: 'codigo', label: 'Código do PAC', type: 'text', placeholder: 'Ex.: PAC-03' },
  { name: 'revisao', label: 'Nº da revisão', type: 'text', placeholder: 'Ex.: 00' },
  { name: 'data_emissao', label: 'Data de emissão', type: 'date' },
  { name: 'data_revisao', label: 'Data da revisão vigente', type: 'date' },
  // c) a g)
  { name: 'objetivo', label: 'Objetivo', type: 'textarea', full: true },
  { name: 'documentos_referencia', label: 'Documentos de referência (vigentes; vedado usar revogados)', type: 'textarea', full: true },
  { name: 'campo_aplicacao', label: 'Campo de aplicação', type: 'textarea', full: true },
  { name: 'definicoes', label: 'Definições (com fontes citadas)', type: 'textarea', full: true },
  { name: 'responsabilidades', label: 'Responsabilidades', type: 'textarea', full: true },
  // h) a l)
  { name: 'descricao', label: 'Descrição (procedimentos, critérios, limites)', type: 'textarea', full: true },
  { name: 'monitoramento', label: 'Monitoramento (parâmetros, responsáveis, formulários)', type: 'textarea', full: true },
  { name: 'frequencia', label: 'Frequência de monitoramento', type: 'text', placeholder: 'Ex.: Quinzenal' },
  { name: 'responsavel', label: 'Responsável pela execução', type: 'text' },
  { name: 'acoes_corretivas', label: 'Ações corretivas e medidas preventivas', type: 'textarea', full: true },
  { name: 'verificacao', label: 'Verificação (documental e in loco; profissional designado)', type: 'textarea', full: true },
  { name: 'registros_doc', label: 'Registros (preenchimento, guarda, prazo de retenção)', type: 'textarea', full: true },
  // m) a o)
  { name: 'anexos', label: 'Anexos (formulários, planilhas, instruções)', type: 'textarea', full: true },
  { name: 'controle_revisoes', label: 'Controle de revisões e alterações', type: 'textarea', full: true },
  { name: 'responsavel_legal', label: 'Responsável legal (aprovação/assinatura)', type: 'text' },
  { name: 'responsavel_tecnico', label: 'Responsável técnico (aprovação/assinatura)', type: 'text' },
  { name: 'ativo', label: 'Programa implantado', type: 'checkbox', defaultValue: true },
];

const tabLabel = (label) => label.replace(/^[IVX]+ – /, '').replace(/ \(.*\)$/, '');

export default function PacsPage() {
  const [tipo, setTipo] = useState('todos');
  const [pacId, setPacId] = useState('');
  const [resumo, setResumo] = useState({ total: 0, conformes: 0, fora: 0 });

  const { data: pacsData } = useFetchJson('/api/pacs');
  const pacs = pacsData?.data ?? [];
  const pacSelecionado = pacs.find((item) => String(item.id) === String(pacId));

  const tabs = [{ value: 'todos', label: 'Todos' }, ...PAC_TIPOS.map((t) => ({ value: t.value, label: tabLabel(t.label) }))];

  return (
    <>
      <PageHeader
        title="PACs — Programas de Autocontrole"
        subtitle="Elementos de controle obrigatórios e estrutura do PAC conforme a Portaria SEMAG-SIM nº 15/2026 (arts. 5º e 6º)."
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

      <Card title="Cobertura dos elementos obrigatórios (art. 5º)" subtitle="Cada elemento deve ter um PAC implantado, monitorado e verificado">
        <ul className="rule-list">
          {PAC_TIPOS.filter((t) => t.value !== 'adicional').map((t) => {
            const ok = pacs.some((p) => p.tipo === t.value && p.ativo);
            const opcional = /quando aplicável/.test(t.label);
            return (
              <li key={t.value}>
                {ok ? <Badge tone="ok">✓ Implantado</Badge> : <Badge tone={opcional ? undefined : 'warn'}>{opcional ? 'Se aplicável' : 'Pendente'}</Badge>} {t.label}
              </li>
            );
          })}
        </ul>
      </Card>

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
