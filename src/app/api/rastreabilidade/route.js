// GET /api/rastreabilidade?lote=... — full chain for one lot.
//
// The search follows the links between the three stages: a raw-material lot
// finds the production lots that consumed it and the shipments of those lots;
// a production or shipping lot finds the raw materials that went into it.

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MATERIA_PRIMA_SQL = `SELECT * FROM materias_primas
   WHERE lote ILIKE $1 OR produto ILIKE $1 OR fornecedor ILIKE $1 OR nota_fiscal ILIKE $1 OR lote = ANY($2)
   ORDER BY data_entrada DESC, id DESC LIMIT 50`;

const PRODUCAO_SQL = `SELECT * FROM producao
   WHERE lote_producao ILIKE $1 OR lotes_materia_prima ILIKE $1 OR produto ILIKE $1 OR lote_producao = ANY($2)
   ORDER BY data_producao DESC, id DESC LIMIT 50`;

const EXPEDICAO_SQL = `SELECT * FROM expedicao
   WHERE lote_producao ILIKE $1 OR produto ILIKE $1 OR cliente ILIKE $1 OR destino ILIKE $1 OR lote_producao = ANY($2)
   ORDER BY data_saida DESC, id DESC LIMIT 50`;

/** "MP-1, MP-2" -> ['MP-1', 'MP-2'] */
function parseLotes(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(request) {
  const term = (new URL(request.url).searchParams.get('lote') || '').trim();
  if (!term) {
    return NextResponse.json({ error: 'Informe um lote ou produto para pesquisar' }, { status: 400 });
  }

  const like = `%${term}%`;

  try {
    let entradas = (await query(MATERIA_PRIMA_SQL, [like, []])).rows;
    let producao = (await query(PRODUCAO_SQL, [like, []] )).rows;
    let saidas = (await query(EXPEDICAO_SQL, [like, []])).rows;

    // Walk the chain outwards until nothing new is found (max 3 passes).
    for (let pass = 0; pass < 3; pass++) {
      const lotesMateriaPrima = entradas.map((row) => row.lote).filter(Boolean);
      const lotesProducao = producao.map((row) => row.lote_producao).filter(Boolean);

      // Raw materials referenced by the production records we already found.
      const referenciados = producao.flatMap((row) => parseLotes(row.lotes_materia_prima));

      const [novasEntradas, novaProducao, novasSaidas] = await Promise.all([
        referenciados.length > 0
          ? query(
              `SELECT * FROM materias_primas WHERE lote = ANY($1) AND NOT (id = ANY($2))
               ORDER BY data_entrada DESC, id DESC LIMIT 50`,
              [referenciados, entradas.map((row) => row.id)]
            )
          : Promise.resolve({ rows: [] }),
        lotesMateriaPrima.length > 0
          ? query(
              `SELECT * FROM producao
                WHERE (lote_producao = ANY($1) OR lotes_materia_prima ILIKE ANY($2)) AND NOT (id = ANY($3))
                ORDER BY data_producao DESC, id DESC LIMIT 50`,
              [lotesProducao.length ? lotesProducao : [''], lotesMateriaPrima.map((lote) => `%${lote}%`), producao.map((row) => row.id)]
            )
          : Promise.resolve({ rows: [] }),
        lotesProducao.length > 0
          ? query(
              `SELECT * FROM expedicao WHERE lote_producao = ANY($1) AND NOT (id = ANY($2))
               ORDER BY data_saida DESC, id DESC LIMIT 50`,
              [lotesProducao, saidas.map((row) => row.id)]
            )
          : Promise.resolve({ rows: [] }),
      ]);

      const adicionou =
        novasEntradas.rows.length + novaProducao.rows.length + novasSaidas.rows.length > 0;

      entradas = [...entradas, ...novasEntradas.rows];
      producao = [...producao, ...novaProducao.rows];
      saidas = [...saidas, ...novasSaidas.rows];

      if (!adicionou) break;
    }

    return NextResponse.json({
      lote: term,
      entradas,
      producao,
      saidas,
      total: entradas.length + producao.length + saidas.length,
    });
  } catch (error) {
    console.error('[api/rastreabilidade]', error);
    return NextResponse.json({ error: error.message || 'Erro na pesquisa de lote' }, { status: 500 });
  }
}
