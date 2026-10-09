// GET /api/auth/me — usuário da sessão atual (ou null quando não há login).
//
// Nunca responde 401: o cliente usa este endpoint para saber se há sessão e
// também é a sonda de API do healthcheck do compose.

import { NextResponse } from 'next/server';
import { usuarioAtual } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const usuario = await usuarioAtual();
  return NextResponse.json({ data: usuario ?? null });
}
