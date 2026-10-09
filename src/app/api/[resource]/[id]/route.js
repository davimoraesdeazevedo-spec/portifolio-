// GET    /api/:resource/:id — read one
// PATCH  /api/:resource/:id — partial update
// DELETE /api/:resource/:id — delete
//
// Toda rota exige login e a permissão do cargo (ver / editar / excluir).

import { NextResponse } from 'next/server';
import { getResource } from '@/lib/resources';
import { HttpError, deleteRow, getRow, readJsonBody, updateRow } from '@/lib/resource-service';
import { exigirPermissao } from '@/lib/auth';
import { permissaoDoRecurso } from '@/lib/roles';

export const dynamic = 'force-dynamic';

function errorResponse(error) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status >= 500) console.error('[api]', error);
  return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status });
}

async function resolve(params) {
  const { resource: name, id } = await params;
  const resource = getResource(name);
  if (!resource) {
    return { error: NextResponse.json({ error: `Recurso desconhecido: ${name}` }, { status: 404 }) };
  }
  return { name, resource, id };
}

export async function GET(_request, { params }) {
  const { error, name, resource, id } = await resolve(params);
  if (error) return error;

  try {
    await exigirPermissao(permissaoDoRecurso(name, 'GET'));
    const row = await getRow(resource, id);
    if (!row) return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (caught) {
    return errorResponse(caught);
  }
}

export async function PATCH(request, { params }) {
  const { error, name, resource, id } = await resolve(params);
  if (error) return error;

  try {
    await exigirPermissao(permissaoDoRecurso(name, 'PATCH'));
    const payload = await readJsonBody(request);
    const row = await updateRow(name, resource, id, payload);
    return NextResponse.json({ data: row });
  } catch (caught) {
    return errorResponse(caught);
  }
}

export async function DELETE(_request, { params }) {
  const { error, name, resource, id } = await resolve(params);
  if (error) return error;

  try {
    await exigirPermissao(permissaoDoRecurso(name, 'DELETE'));
    const result = await deleteRow(resource, id);
    return NextResponse.json({ data: result });
  } catch (caught) {
    return errorResponse(caught);
  }
}
