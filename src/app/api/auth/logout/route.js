// POST /api/auth/logout — encerra a sessão e limpa o cookie.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_OPCOES, SESSAO_COOKIE, encerrarSessao } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const store = await cookies();
  await encerrarSessao(store.get(SESSAO_COOKIE)?.value);

  const response = NextResponse.json({ data: { ok: true } });
  response.cookies.set(SESSAO_COOKIE, '', { ...COOKIE_OPCOES, maxAge: 0 });
  return response;
}
