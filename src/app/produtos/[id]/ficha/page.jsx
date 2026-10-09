'use client';

import { useParams } from 'next/navigation';
import { useFetchJson } from '@/lib/use-fetch';
import { ESTABELECIMENTO } from '@/lib/estabelecimento';

export default function FichaProdutoPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetchJson(`/api/produtos/${id}`);

  if (loading) return <div className="loading">Carregando ficha técnica…</div>;
  if (error) return <div className="alert alert--crit">⚠️ {error}</div>;
  if (!data?.data) return <div className="empty">Produto não encontrado.</div>;

  const produto = data.data;

  return (
    <>
      <div className="row row--between no-print" style={{ marginBottom: 14 }}>
        <h2 className="page-title">Ficha técnica do produto</h2>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ borderBottom: '2px solid var(--ink)', paddingBottom: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: 19 }}>{ESTABELECIMENTO.razaoSocial}</h2>
            <p className="text-sm muted">
              {ESTABELECIMENTO.registro} · {ESTABELECIMENTO.endereco}
            </p>
            <h3 style={{ marginTop: 12, fontSize: 16 }}>Ficha técnica e memorial descritivo</h3>
          </div>

          <table className="data" style={{ marginBottom: 18 }}>
            <tbody>
              <tr>
                <th style={{ width: 210 }}>Produto</th>
                <td>{produto.nome}</td>
              </tr>
              <tr>
                <th>Denominação de venda</th>
                <td>{produto.denominacao_venda || '—'}</td>
              </tr>
              <tr>
                <th>Categoria</th>
                <td>{produto.categoria || '—'}</td>
              </tr>
              <tr>
                <th>Registro do serviço de inspeção</th>
                <td>{produto.registro_sif || '—'}</td>
              </tr>
              <tr>
                <th>Situação</th>
                <td>{produto.ativo ? 'Em fabricação' : 'Descontinuado'}</td>
              </tr>
            </tbody>
          </table>

          <div className="detail-grid">
            <div className="detail-block">
              <h4>Memorial descritivo</h4>
              <p>{produto.memorial_descritivo || 'Não informado.'}</p>
            </div>
            <div className="detail-block">
              <h4>Ficha técnica</h4>
              <p>{produto.ficha_tecnica || 'Não informada.'}</p>
            </div>
            <div className="detail-block">
              <h4>Rotulagem</h4>
              <p>{produto.rotulagem || 'Não informada.'}</p>
            </div>
          </div>

          <div className="detail-grid" style={{ marginTop: 40 }}>
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
              <p className="text-sm">{ESTABELECIMENTO.responsavelTecnico}</p>
              <p className="text-sm muted">Elaborado / aprovado por</p>
            </div>
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
              <p className="text-sm">Serviço de inspeção</p>
              <p className="text-sm muted">Registro e aprovação</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
