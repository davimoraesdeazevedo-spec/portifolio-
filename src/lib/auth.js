// Autenticação por sessão (server-only).
//
// A sessão vive na tabela `sessoes`; o cookie httpOnly carrega apenas o token.
// Toda senha é a mesma, definida pelo estabelecimento: SENHA_PADRAO.

import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { query } from './db';
import { HttpError } from './resource-service';
import { temPermissao } from './roles';

export const SENHA_PADRAO = 'VACA GORDA';
export const SESSAO_COOKIE = 'ac_sessao';

const SESSAO_DIAS = 30;
const SESSAO_SEGUNDOS = SESSAO_DIAS * 24 * 60 * 60;

/** Opções do cookie de sessão (mesma origem, sem acesso via JavaScript). */
export const COOKIE_OPCOES = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSAO_SEGUNDOS,
  secure: process.env.NODE_ENV === 'production',
};

export function normalizarNome(nome) {
  return String(nome ?? '').trim().replace(/\s+/g, ' ');
}

/** Cria uma sessão para o usuário e devolve o token do cookie. */
export async function criarSessao(usuarioId) {
  const token = randomBytes(32).toString('hex');
  await query(
    "INSERT INTO sessoes (token, usuario_id, expires_at) VALUES ($1, $2, NOW() + ($3 || ' days')::interval)",
    [token, usuarioId, String(SESSAO_DIAS)]
  );
  return token;
}

export async function encerrarSessao(token) {
  if (!token) return;
  await query('DELETE FROM sessoes WHERE token = $1', [token]);
}

/** Usuário da sessão atual, ou null quando não há login válido. */
export async function usuarioAtual() {
  const store = await cookies();
  const token = store.get(SESSAO_COOKIE)?.value;
  if (!token) return null;

  const { rows } = await query(
    `SELECT u.id, u.nome, u.cargo, u.ativo
       FROM sessoes s
       JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token = $1 AND s.expires_at > NOW()
      LIMIT 1`,
    [token]
  );

  const usuario = rows[0];
  if (!usuario || usuario.ativo === false) return null;
  return { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo };
}

export async function exigirUsuario() {
  const usuario = await usuarioAtual();
  if (!usuario) throw new HttpError(401, 'Sessão expirada. Faça login novamente.');
  return usuario;
}

/** Exige login e a permissão indicada; lança HttpError 401/403 caso falte. */
export async function exigirPermissao(permissao) {
  const usuario = await exigirUsuario();
  if (!temPermissao(usuario.cargo, permissao)) {
    throw new HttpError(403, 'Seu cargo não tem permissão para esta ação.');
  }
  return usuario;
}
