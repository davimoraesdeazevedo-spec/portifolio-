# Deploy (Supabase + Vercel)

Alvo de produção deste repositório: **PostgreSQL do Supabase** + **Next.js na
Vercel**. O app não lê o banco em build time (toda tela é client component que
consome a API), então `next build` roda sem `DATABASE_URL` — não há `vercel.json`
nem nada específico de host no repositório.

## 1. Banco (Supabase)

1. Crie um projeto em <https://supabase.com>.
2. Copie a connection string em **Project settings → Database → Connection
   string** e use a **Connection pooling** (porta `6543`, modo *transaction*):
   em serverless cada instância abre a própria pool, e o pooler evita estourar o
   limite de conexões.
3. Termine a URL com `?sslmode=require` (o `pg` liga o TLS a partir da própria
   string; em versões antigas do driver era preciso passar `ssl` no código).
   Se o certificado não for aceito, use
   `?uselibpqcompat=true&sslmode=require`.
4. Aplique o schema e o seed (ambos idempotentes) **a partir deste repositório**:

   ```bash
   DATABASE_URL='postgresql://...@....pooler.supabase.com:6543/postgres?sslmode=require' npm run migrate
   ```

   Rode de novo sempre que `db/schema.sql` mudar (o `seed.sql` não insere dados
   de demo — só garante o que o schema precisa).

## 2. App (Vercel)

1. **Add New → Project → Import Git Repository** e selecione este repositório.
   A Vercel detecta Next.js sozinho (`next build` / `next start`).
2. Em **Environment Variables**, defina para *Production* e *Preview*:
   - `DATABASE_URL` — a connection string do passo 1.
   - `UPLOAD_DIR` — **não** defina na Vercel (ver limitações abaixo). Em host com
     disco, aponte para a pasta do volume.
3. Deploy.
4. Depois do primeiro deploy, entre com um login de supervisor (nome + cargo
   `supervisor` + a senha padrão) e confira o painel e uma tela de CRUD.

## Limitações na Vercel

- **Upload de anexos não persiste.** `/api/uploads` grava no disco local, que na
  Vercel é efêmero e isolado por instância (`/tmp`), e o corpo da requisição é
  limitado a 4,5 MB — bem abaixo dos 15 MB que o app aceita. Para produção com
  anexos, o caminho é guardar os arquivos no Supabase Storage (mudança a
  implementar: novo cliente de storage + ajuste em `/api/uploads`).
- A sessão é o cookie httpOnly `ac_sessao` apoiado na tabela `sessoes`, sem
  estado em memória — funciona em serverless sem sticky session.

## Alternativa com disco persistente

Se os uploads forem essenciais, o mesmo repositório roda em um host com volume
(Render, Railway, Fly.io ou VPS):

```bash
npm ci && npm run build && npm start   # porta 3000
```

com `DATABASE_URL` apontando para o Supabase e `UPLOAD_DIR` para o volume
montado. Nesse caso nada no código muda.

## Conferir o build de produção localmente

```bash
npm ci
npm run build   # é o que a Vercel executa
```

Para o app local de desenvolvimento (Base44 sandbox), veja `AGENTS.md`.
