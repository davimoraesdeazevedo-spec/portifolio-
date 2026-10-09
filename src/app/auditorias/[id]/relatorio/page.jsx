'use client';

import { useParams } from 'next/navigation';
import { Badge, Card } from '@/components/ui';
import { useFetchJson } from '@/lib/use-fetch';
import { ESTABELECIMENTO } from '@/lib/estabelecimento';
import { formatDate, formatNumber } from '@/lib/format';

export default function RelatorioAuditoriaPage() {
  const { id } = useParams();
  const { data: auditoria, loading, error } = useFetchJson(`/api/auditorias/${id}`);
  const { data: itens } = useFetchJson(`/api/auditoria_itens?auditoria_id=${id}&limit=500`);

  if (loading) return <div className="loading">Carregando relatório…</div>;
  if (error) return <div className="alert alert--crit">⚠️ {error}</div>;
  if (!auditoria?.data) return <div className="empty">Auditoria não encontrada.</div>;

  const registro = auditoria.data;
  const lista = itens?.data ?? [];
  const conformes = lista.filter((item) => item.conforme).length;
  const naoConformes = lista.filter((item) => item.conforme === false).length;
  const aderencia = lista.length > 0 ? Math.round((conformes / lista.length) * 100) : null;

  return (
    <>
      <div className="row row--between no-print" style={{ marginBottom: 14 }}>
        <h2 className="page-title">Relatório de auditoria</h2>
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
            <h3 style={{ marginTop: 12, fontSize: 16 }}>Relatório de Auditoria — {registro.tipo}</h3>
          </div>

          <table className="data" style={{ marginBottom: 18 }}>
            <tbody>
              <tr>
                <th style={{ width: 200 }}>Serviço de inspeção</th>
                <td>{registro.tipo}</td>
                <th style={{ width: 160 }}>Data</th>
                <td>{formatDate(registro.data)}</td>
              </tr>
              <tr>
                <th>Auditor / órgão</th>
                <td>{registro.auditor || '—'}</td>
                <th>Pontuação</th>
                <td>{registro.pontuacao !== null && registro.pontuacao !== undefined ? `${formatNumber(registro.pontuacao)}%` : '—'}</td>
              </tr>
              <tr>
                <th>Resultado</th>
                <td colSpan={3}>
                  {registro.resultado === 'conforme' ? 'Conforme' : 'Com não conformidade'}
                  {aderencia !== null ? ` · aderência do checklist: ${aderencia}%` : ''}
                </td>
              </tr>
              <tr>
                <th>Escopo verificado</th>
                <td colSpan={3}>{registro.escopo || '—'}</td>
              </tr>
            </tbody>
          </table>

          <h4 style={{ marginBottom: 8 }}>Checklist de verificação</h4>
          {lista.length === 0 ? (
            <p className="muted text-sm">Nenhum item de checklist registrado para esta auditoria.</p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item verificado</th>
                  <th>Avaliação</th>
                  <th>Observação / evidência</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((item, index) => (
                  <tr key={item.id}>
                    <td className="num">{index + 1}</td>
                    <td>{item.item}</td>
                    <td>{item.conforme ? <Badge tone="ok">Conforme</Badge> : <Badge tone="crit">Não conforme</Badge>}</td>
                    <td className="cell-muted">{item.observacao || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {registro.observacoes ? (
            <>
              <h4 style={{ margin: '18px 0 8px' }}>Observações da auditoria</h4>
              <p className="text-sm pre-line">{registro.observacoes}</p>
            </>
          ) : null}

          <div className="detail-grid" style={{ marginTop: 40 }}>
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
              <p className="text-sm">{ESTABELECIMENTO.responsavelTecnico}</p>
              <p className="text-sm muted">Responsável técnico</p>
            </div>
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
              <p className="text-sm">Auditor do serviço de inspeção</p>
              <p className="text-sm muted">Assinatura e matrícula</p>
            </div>
          </div>

          <p className="text-sm muted" style={{ marginTop: 24 }}>
            Resumo: {lista.length} item(ns) verificado(s) · {conformes} conforme(s) · {naoConformes} não conforme(s).
          </p>
        </div>
      </div>
    </>
  );
}
