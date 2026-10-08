'use client';

import { useParams } from 'next/navigation';
import { useFetchJson } from '@/lib/use-fetch';
import { ESTABELECIMENTO } from '@/lib/estabelecimento';
import { formatDate } from '@/lib/format';

export default function CertificadosPage() {
  const { id } = useParams();
  const { data: treinamento, loading, error } = useFetchJson(`/api/treinamentos/${id}`);
  const { data: participantes } = useFetchJson(`/api/treinamento_participantes?treinamento_id=${id}&limit=500`);

  if (loading) return <div className="loading">Carregando certificados…</div>;
  if (error) return <div className="alert alert--crit">⚠️ {error}</div>;
  if (!treinamento?.data) return <div className="empty">Treinamento não encontrado.</div>;

  const curso = treinamento.data;
  const lista = (participantes?.data ?? []).filter((item) => item.presenca !== false);

  return (
    <>
      <div className="row row--between no-print" style={{ marginBottom: 14 }}>
        <h2 className="page-title">Certificados de treinamento</h2>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          Imprimir / Salvar PDF
        </button>
      </div>

      {lista.length === 0 ? (
        <div className="empty">Nenhum participante com presença confirmada neste treinamento.</div>
      ) : (
        lista.map((participante, index) => (
          <div key={participante.id} className="card" style={{ breakAfter: index === lista.length - 1 ? 'auto' : 'page' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '42px 32px' }}>
              <p className="text-sm muted" style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Certificado de treinamento
              </p>
              <h2 style={{ fontSize: 24, marginTop: 18 }}>{ESTABELECIMENTO.razaoSocial}</h2>
              <p className="text-sm muted">
                {ESTABELECIMENTO.registro} · {ESTABELECIMENTO.endereco}
              </p>

              <p style={{ marginTop: 30 }} className="text-sm">
                Certificamos que
              </p>
              <h3 style={{ fontSize: 21, marginTop: 6 }}>{participante.nome}</h3>
              <p className="text-sm muted">
                {participante.cargo || 'Colaborador'}
                {participante.cpf ? ` · CPF ${participante.cpf}` : ''}
              </p>

              <p style={{ marginTop: 26, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
                participou do treinamento <strong>{curso.titulo}</strong>
                {curso.tema ? `, com abordagem de ${curso.tema}` : ''}, com carga horária de {curso.carga_horaria ?? '—'} horas,
                realizado em {formatDate(curso.data_realizacao)}
                {curso.instrutor ? `, ministrado por ${curso.instrutor}` : ''}.
              </p>

              {curso.proxima_reciclagem ? (
                <p className="text-sm muted" style={{ marginTop: 14 }}>
                  Reciclagem prevista para {formatDate(curso.proxima_reciclagem)}.
                </p>
              ) : null}

              <div className="detail-grid" style={{ marginTop: 46 }}>
                <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
                  <p className="text-sm">{curso.instrutor || ESTABELECIMENTO.responsavelTecnico}</p>
                  <p className="text-sm muted">Instrutor responsável</p>
                </div>
                <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 6 }}>
                  <p className="text-sm">{ESTABELECIMENTO.responsavelTecnico}</p>
                  <p className="text-sm muted">Responsável técnico</p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
