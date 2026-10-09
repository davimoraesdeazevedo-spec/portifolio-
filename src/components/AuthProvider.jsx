'use client';

// Contexto de autenticação do app: quem está logado e o que o cargo permite.
// A sessão é validada no servidor a cada requisição; este contexto só espelha
// isso na tela para esconder/mostrar ações.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { temPermissao } from '@/lib/roles';

const AuthContext = createContext(null);

const VAZIO = {
  usuario: null,
  carregando: false,
  pode: () => false,
  sair: () => {},
  recarregar: () => {},
};

export function AuthProvider({ children }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      const body = await response.json().catch(() => ({}));
      setUsuario(body?.data ?? null);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const sair = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* segue para a tela de login mesmo se a chamada falhar */
    }
    setUsuario(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      usuario,
      carregando,
      sair,
      recarregar,
      pode: (permissao) => temPermissao(usuario?.cargo, permissao),
    }),
    [usuario, carregando, sair, recarregar]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext) ?? VAZIO;
}
