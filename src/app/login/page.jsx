'use client';

// Tela de entrada: nome + cargo + senha.
//
// Todas as contas usam a mesma senha do estabelecimento. Se ainda não existir
// uma conta com o nome informado, ela é criada com o cargo escolhido.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CARGOS, CARGOS_DESCRICAO } from '@/lib/roles';
import { apiPost } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Quem já está logado não precisa ver esta tela.
  useEffect(() => {
    let ativo = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((body) => {
        if (ativo && body?.data) router.replace('/');
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [router]);

  async function entrar(event) {
    event.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await apiPost('/api/auth/login', { nome, cargo, senha });
      router.replace('/');
    } catch (caught) {
      setErro(caught.message);
      setEnviando(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={entrar}>
        <div className="login-brand">
          <div className="brand-mark" aria-hidden="true">🥩</div>
          <div>
            <div className="login-title">Autocontrole</div>
            <div className="login-sub">SIM · SISBI · SIE · SIF</div>
          </div>
        </div>

        <p className="login-help">
          Informe o seu nome, o seu cargo e a senha do estabelecimento para entrar.
        </p>

        <label className="field" htmlFor="login_nome">
          <span className="field-label">Nome <span className="req">*</span></span>
          <input
            id="login_nome"
            className="input"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Ex.: Maria Souza"
            autoComplete="name"
            required
          />
        </label>

        <label className="field" htmlFor="login_cargo">
          <span className="field-label">Cargo <span className="req">*</span></span>
          <select
            id="login_cargo"
            className="select"
            value={cargo}
            onChange={(event) => setCargo(event.target.value)}
            required
          >
            <option value="">Selecione…</option>
            {CARGOS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          {cargo ? <span className="field-help">{CARGOS_DESCRICAO[cargo]}</span> : null}
        </label>

        <label className="field" htmlFor="login_senha">
          <span className="field-label">Senha <span className="req">*</span></span>
          <input
            id="login_senha"
            className="input"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {erro ? <div className="alert alert--crit">⚠️ {erro}</div> : null}

        <button type="submit" className="btn btn--primary login-submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
