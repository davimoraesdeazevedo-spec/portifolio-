// POST /api/auth/login — entra com nome + cargo + senha.
//
// Todas as contas usam a mesma senha (SENHA_PADRAO). Se ainda não existir uma
// conta com o nome informado, ela é criada com o cargo escolhido; se já existir,
// vale o cargo definido pelo supervisor (que é quem gerencia as contas).

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { HttpError } from '@/lib/resource-service';
import { CARGOS } from '@/lib/roles';
import {
  COOKIE_OPCOES,
  SENHA_PADRAO,
  SESSAO_COOKIE,
  criarSessao,
  normalizarNome,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const nome = normalizarNome(body.nome);
    const cargo = String(body.cargo ?? '');
    const senha = String(body.senha ?? '');

    if (!nome) throw new HttpError(400, 'Informe o seu nome.');
    if (!CARGOS.some((item) => item.value === cargo)) throw new HttpError(400, 'Selecione o seu cargo.');
    if (senha !== SENHA_PADRAO) throw new HttpError(401, 'Senha incorreta.');

    const { rows } = await query(
      'SELECT id, nome, cargo, ativo FROM usuarios WHERE lower(nome) = lower($1) LIMIT 1',
      [nome]
    );
    let usuario = rows[0];

    if (usuario) {
      if (usuario.ativo === false) {
        throw new HttpError(403, 'Esta conta está desativada. Procure o supervisor.');
      }
    } else {
      // ON CONFLICT: dois logins simultâneos com um nome novo não podem quebrar
      // com erro de chave duplicada — nesse caso vale a conta que já foi criada.
      const criado = await query(
        'INSERT INTO usuarios (nome, cargo) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id, nome, cargo',
        [nome, cargo]
      );
      usuario = criado.rows[0];

      if (!usuario) {
        const existente = await query(
          'SELECT id, nome, cargo, ativo FROM usuarios WHERE lower(nome) = lower($1) LIMIT 1',
          [nome]
        );
        usuario = existente.rows[0];
        if (usuario?.ativo === false) {
          throw new HttpError(403, 'Esta conta está desativada. Procure o supervisor.');
        }
      }
    }

    const token = await criarSessao(usuario.id);
    const response = NextResponse.json({
      data: { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo },
    });
    response.cookies.set(SESSAO_COOKIE, token, COOKIE_OPCOES);
    return response;
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status >= 500) console.error('[api/auth/login]', error);
    return NextResponse.json({ error: error.message || 'Não foi possível entrar' }, { status });
  }
}
