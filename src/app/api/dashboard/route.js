// GET /api/dashboard — indicators, pending items and automatic alerts.

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function one(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows[0] ?? {};
}

export async function GET() {
  try {
    const [
      pcc,
      monitoramentos,
      temperaturas24h,
      temperaturasPorTipo,
      temperaturasFora,
      ncPorStatus,
      ncAbertas,
      analisesPendentes,
      analisesPendentesLista,
      analisesNaoConformes,
      documentos,
      documentosLista,
      treinamentos,
      treinamentosLista,
      auditorias,
      pacs,
      rastreabilidade,
    ] = await Promise.all([
      one('SELECT count(*)::int AS total, count(*) FILTER (WHERE ativo)::int AS ativos FROM pcc'),
      one(`SELECT count(*)::int AS total,
                  count(*) FILTER (WHERE conforme)::int AS conformes,
                  count(*) FILTER (WHERE conforme IS FALSE)::int AS fora
             FROM pcc_monitoramentos
            WHERE data_hora >= NOW() - INTERVAL '30 days'`),
      one(`SELECT count(*)::int AS total,
                  count(*) FILTER (WHERE conforme)::int AS conformes,
                  count(*) FILTER (WHERE conforme IS FALSE)::int AS fora
             FROM temperaturas
            WHERE data_hora >= NOW() - INTERVAL '24 hours'`),
      query(`SELECT tipo,
                    count(*)::int AS total,
                    count(*) FILTER (WHERE conforme)::int AS conformes,
                    count(*) FILTER (WHERE conforme IS FALSE)::int AS fora
               FROM temperaturas
              WHERE data_hora >= NOW() - INTERVAL '24 hours'
              GROUP BY tipo
              ORDER BY tipo`),
      query('SELECT * FROM temperaturas WHERE conforme IS FALSE ORDER BY data_hora DESC LIMIT 5'),
      query('SELECT status, count(*)::int AS total FROM nao_conformidades GROUP BY status'),
      query(`SELECT * FROM nao_conformidades
              WHERE status <> 'encerrada'
              ORDER BY CASE gravidade WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, prazo ASC NULLS LAST
              LIMIT 8`),
      one("SELECT count(*)::int AS total FROM analises WHERE status = 'pendente'"),
      query("SELECT * FROM analises WHERE status = 'pendente' ORDER BY data_coleta DESC, id DESC LIMIT 6"),
      one('SELECT count(*)::int AS total FROM analises WHERE conforme IS FALSE'),
      one(`SELECT count(*)::int AS vencidos,
                  count(*) FILTER (WHERE proxima_revisao BETWEEN CURRENT_DATE AND CURRENT_DATE + 30)::int AS vencendo
             FROM documentos
            WHERE status = 'vencido' OR proxima_revisao < CURRENT_DATE
               OR proxima_revisao BETWEEN CURRENT_DATE AND CURRENT_DATE + 30`),
      query(`SELECT * FROM documentos
              WHERE status = 'vencido' OR proxima_revisao <= CURRENT_DATE + 30
              ORDER BY proxima_revisao ASC NULLS LAST LIMIT 5`),
      one(`SELECT count(*)::int AS total,
                  count(*) FILTER (WHERE proxima_reciclagem < CURRENT_DATE)::int AS vencidos,
                  count(*) FILTER (WHERE proxima_reciclagem BETWEEN CURRENT_DATE AND CURRENT_DATE + 30)::int AS vencendo
             FROM treinamentos`),
      query(`SELECT * FROM treinamentos
              WHERE proxima_reciclagem <= CURRENT_DATE + 30
              ORDER BY proxima_reciclagem ASC NULLS LAST LIMIT 5`),
      query("SELECT DISTINCT ON (tipo) tipo, data, resultado, pontuacao FROM auditorias ORDER BY tipo, data DESC"),
      one(`SELECT count(*) FILTER (WHERE ativo)::int AS ativos,
                  (SELECT count(*) FROM pac_registros WHERE conforme IS FALSE)::int AS registros_nao_conformes
             FROM pacs`),
      one(`SELECT (SELECT count(*) FROM materias_primas)::int AS entradas,
                  (SELECT count(*) FROM producao)::int AS lotes_producao,
                  (SELECT count(*) FROM expedicao)::int AS saidas`),
    ]);

    const ncTotal = ncPorStatus.rows.reduce((sum, row) => sum + row.total, 0);
    const ncAbertasTotal = ncPorStatus.rows
      .filter((row) => row.status !== 'encerrada')
      .reduce((sum, row) => sum + row.total, 0);

    const alertas = [];
    const push = (nivel, modulo, mensagem, href) => alertas.push({ nivel, modulo, mensagem, href });

    if (monitoramentos.fora > 0) {
      push('critico', 'APPCC', `${monitoramentos.fora} monitoramento(s) de PCC fora do limite crítico nos últimos 30 dias`, '/appcc');
    }
    if (temperaturas24h.fora > 0) {
      push('critico', 'Temperaturas', `${temperaturas24h.fora} leitura(s) de temperatura fora da faixa nas últimas 24 h`, '/temperaturas');
    }
    if (analisesPendentes.total > 0) {
      push('atencao', 'Laboratório', `${analisesPendentes.total} análise(s) aguardando resultado ou laudo`, '/laboratorio');
    }
    if (analisesNaoConformes.total > 0) {
      push('critico', 'Laboratório', `${analisesNaoConformes.total} análise(s) com resultado não conforme`, '/laboratorio');
    }
    if (ncAbertasTotal > 0) {
      push('atencao', 'Não conformidades', `${ncAbertasTotal} não conformidade(s) em aberto`, '/nao-conformidades');
    }
    if (documentos.vencidos > 0) {
      push('critico', 'Documentos', `${documentos.vencidos} documento(s) com revisão vencida`, '/documentos');
    }
    if (documentos.vencendo > 0) {
      push('atencao', 'Documentos', `${documentos.vencendo} documento(s) vencem nos próximos 30 dias`, '/documentos');
    }
    if (treinamentos.vencidos > 0) {
      push('critico', 'Treinamentos', `${treinamentos.vencidos} treinamento(s) com reciclagem vencida`, '/treinamentos');
    }
    if (treinamentos.vencendo > 0) {
      push('atencao', 'Treinamentos', `${treinamentos.vencendo} treinamento(s) com reciclagem nos próximos 30 dias`, '/treinamentos');
    }
    if (pacs.registros_nao_conformes > 0) {
      push('atencao', 'PACs', `${pacs.registros_nao_conformes} registro(s) de PAC não conforme`, '/pacs');
    }

    return NextResponse.json({
      indicadores: {
        pccTotal: pcc.total ?? 0,
        pccAtivos: pcc.ativos ?? 0,
        monitoramentosTotal: monitoramentos.total ?? 0,
        monitoramentosFora: monitoramentos.fora ?? 0,
        temperaturas24h: temperaturas24h.total ?? 0,
        temperaturasFora24h: temperaturas24h.fora ?? 0,
        ncTotal,
        ncAbertas: ncAbertasTotal,
        analisesPendentes: analisesPendentes.total ?? 0,
        analisesNaoConformes: analisesNaoConformes.total ?? 0,
        documentosVencidos: documentos.vencidos ?? 0,
        pacsAtivos: pacs.ativos ?? 0,
        lotesProducao: rastreabilidade.lotes_producao ?? 0,
      },
      temperaturasPorTipo: temperaturasPorTipo.rows,
      temperaturasFora: temperaturasFora.rows,
      ncPorStatus: ncPorStatus.rows,
      ncAbertas: ncAbertas.rows,
      analisesPendentesLista: analisesPendentesLista.rows,
      documentosLista: documentosLista.rows,
      treinamentosLista: treinamentosLista.rows,
      auditorias: auditorias.rows,
      alertas,
    });
  } catch (error) {
    console.error('[api/dashboard]', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar indicadores' }, { status: 500 });
  }
}
