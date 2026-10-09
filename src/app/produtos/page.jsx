'use client';

import { useState } from 'react';
import CrudResource from '@/components/CrudResource';
import { Badge, Card, PageHeader, StatCard } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';

export default function ProdutosPage() {
  const [produtoId, setProdutoId] = useState('');
  const { data } = useFetchJson('/api/produtos?limit=500');
  const produtos = data?.data ?? [];
  const selecionado = produtos.find((item) => String(item.id) === String(produtoId));

  return (
    <>
      <PageHeader
        title="Registro de produtos"
        subtitle="Memorial descritivo, ficha técnica, rotulagem e denominação de venda de cada produto de origem animal fabricado no estabelecimento."
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Produtos cadastrados" value={produtos.length} hint="Linha de produção registrada" />
        <StatCard label="Produtos ativos" value={produtos.filter((row) => row.ativo).length} hint="Em fabricação" tone="ok" />
        <StatCard
          label="Com registro informado"
          value={produtos.filter((row) => row.registro_sif).length}
          hint="SIF / SIE / SISBI"
        />
        <StatCard
          label="Com ficha técnica"
          value={produtos.filter((row) => row.ficha_tecnica).length}
          hint="Documentação completa"
        />
      </div>

      <CrudResource
        endpoint="/api/produtos"
        title="Produtos registrados"
        createLabel="Novo produto"
        searchable
        searchPlaceholder="Pesquisar produto ou categoria…"
        fields={[
          { name: 'nome', label: 'Nome do produto', type: 'text', required: true, placeholder: 'Ex.: Linguiça toscana' },
          { name: 'denominacao_venda', label: 'Denominação de venda', type: 'text', full: true, placeholder: 'Ex.: Linguiça de carne suína, tipo toscana, resfriada' },
          { name: 'categoria', label: 'Categoria', type: 'text', placeholder: 'Ex.: Embutido cárneo' },
          { name: 'registro_sif', label: 'Registro do serviço de inspeção', type: 'text', placeholder: 'SIF / SIE / SISBI' },
          { name: 'memorial_descritivo', label: 'Memorial descritivo', type: 'textarea', full: true },
          { name: 'ficha_tecnica', label: 'Ficha técnica', type: 'textarea', full: true },
          { name: 'rotulagem', label: 'Rotulagem', type: 'textarea', full: true },
          { name: 'ativo', label: 'Produto em fabricação', type: 'checkbox', defaultValue: true },
        ]}
        columns={[
          {
            key: 'nome',
            label: 'Produto',
            render: (row) => (
              <>
                <span className="cell-strong">{row.nome}</span>
                <div className="cell-muted">{row.categoria || '—'}</div>
              </>
            ),
          },
          { key: 'denominacao_venda', label: 'Denominação de venda', render: (row) => <span className="cell-muted">{row.denominacao_venda || '—'}</span> },
          { key: 'registro_sif', label: 'Registro' },
          {
            key: 'documentacao',
            label: 'Documentação',
            render: (row) => (
              <>
                {row.memorial_descritivo ? <Badge tone="ok">Memorial</Badge> : null}{' '}
                {row.ficha_tecnica ? <Badge tone="ok">Ficha técnica</Badge> : null}{' '}
                {row.rotulagem ? <Badge tone="ok">Rotulagem</Badge> : null}
              </>
            ),
          },
          { key: 'ativo', label: 'Situação', render: (row) => (row.ativo ? <Badge tone="ok">Ativo</Badge> : <Badge>Inativo</Badge>) },
        ]}
        rowActions={(row) => (
          <a className="btn btn--sm" href={`/produtos/${row.id}/ficha`} target="_blank" rel="noreferrer">
            Ficha técnica
          </a>
        )}
        filters={[{ name: 'ativo', label: 'Situação', options: [{ value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }] }]}
        emptyText="Nenhum produto registrado."
      />

      <Card
        title="Detalhamento do produto"
        subtitle="Documentação técnica exigida pelo serviço de inspeção"
        actions={
          <label className="field" style={{ minWidth: 280 }}>
            <span className="field-label">Produto</span>
            <select className="select" value={produtoId} onChange={(event) => setProdutoId(event.target.value)}>
              <option value="">Selecione um produto…</option>
              {produtos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {!selecionado ? (
          <p className="muted text-sm">Selecione um produto para consultar memorial descritivo, ficha técnica e rotulagem.</p>
        ) : (
          <>
            <div className="detail-grid">
              <div className="detail-block">
                <h4>Denominação de venda</h4>
                <p>{selecionado.denominacao_venda || '—'}</p>
                <h4 style={{ marginTop: 14 }}>Registro</h4>
                <p>{selecionado.registro_sif || '—'}</p>
                <h4 style={{ marginTop: 14 }}>Categoria</h4>
                <p>{selecionado.categoria || '—'}</p>
              </div>
              <div className="detail-block">
                <h4>Memorial descritivo</h4>
                <p>{selecionado.memorial_descritivo || 'Não informado.'}</p>
              </div>
              <div className="detail-block">
                <h4>Ficha técnica</h4>
                <p>{selecionado.ficha_tecnica || 'Não informada.'}</p>
              </div>
              <div className="detail-block">
                <h4>Rotulagem</h4>
                <p>{selecionado.rotulagem || 'Não informada.'}</p>
              </div>
            </div>
            <div className="form-actions">
              <a className="btn" href={`/produtos/${selecionado.id}/ficha`} target="_blank" rel="noreferrer">
                Abrir ficha para impressão / PDF
              </a>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
