// GET  /api/:resource  — list (filters + free-text search)
// POST /api/:resource  — create

import { NextResponse } from 'next/server';
import { getResource } from '@/lib/resources';
import { HttpError, createRow, listRows } from '@/lib/resource-service';

export const dynamic = 'force-dynamic';

function resourceNotFound(name) {
  return NextResponse.json({ error: `Recurso desconhecido: ${name}` }, { status: 404 });
}

function errorResponse(error) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status >= 500) console.error('[api]', error);
  return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status });
}

export async function GET(request, { params }) {
  const { resource: name } = await params;
  const resource = getResource(name);
  if (!resource) return resourceNotFound(name);

  try {
    const rows = await listRows(name, resource, new URL(request.url).searchParams);
    return NextResponse.json({ data: rows, count: rows.length });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request, { params }) {
  const { resource: name } = await params;
  const resource = getResource(name);
  if (!resource) return resourceNotFound(name);

  try {
    const payload = await request.json();
    const row = await createRow(name, resource, payload);
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
