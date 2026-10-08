-- Autocontrole (PAC / APPCC) app schema.
-- Idempotent: safe to re-run on every container boot.

-- ============================================================
-- APPCC — pontos críticos de controle e monitoramento
-- ============================================================
CREATE TABLE IF NOT EXISTS pcc (
  id             SERIAL PRIMARY KEY,
  nome           TEXT NOT NULL,
  etapa_processo TEXT,
  perigo         TEXT,
  limite_critico TEXT,
  unidade        TEXT,
  frequencia     TEXT,
  monitoramento  TEXT,
  acao_corretiva TEXT,
  responsavel    TEXT,
  ativo          BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcc_monitoramentos (
  id          SERIAL PRIMARY KEY,
  pcc_id      INTEGER REFERENCES pcc(id) ON DELETE CASCADE,
  valor       NUMERIC,
  conforme    BOOLEAN DEFAULT TRUE,
  data_hora   TIMESTAMPTZ DEFAULT NOW(),
  responsavel TEXT,
  observacao  TEXT
);

-- ============================================================
-- PACs — programas de autocontrole e seus registros
-- ============================================================
CREATE TABLE IF NOT EXISTS pacs (
  id          SERIAL PRIMARY KEY,
  tipo        TEXT NOT NULL, -- manutencao|agua|higiene|manipuladores|pragas|materias_primas|temperaturas|rastreabilidade|fraudes|laboratorio
  titulo      TEXT NOT NULL,
  descricao   TEXT,
  frequencia  TEXT,
  responsavel TEXT,
  ativo       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pac_registros (
  id          SERIAL PRIMARY KEY,
  pac_id      INTEGER REFERENCES pacs(id) ON DELETE CASCADE,
  data        DATE DEFAULT CURRENT_DATE,
  resultado   TEXT,
  conforme    BOOLEAN DEFAULT TRUE,
  responsavel TEXT,
  observacao  TEXT
);

-- ============================================================
-- Controle de temperaturas
-- ============================================================
CREATE TABLE IF NOT EXISTS temperaturas (
  id           SERIAL PRIMARY KEY,
  equipamento  TEXT NOT NULL,
  tipo         TEXT NOT NULL, -- resfriamento|congelamento|produto_acabado|veiculo
  temperatura  NUMERIC NOT NULL,
  limite_min   NUMERIC,
  limite_max   NUMERIC,
  conforme     BOOLEAN,
  data_hora    TIMESTAMPTZ DEFAULT NOW(),
  responsavel  TEXT,
  observacao   TEXT
);

-- ============================================================
-- Rastreabilidade — entrada, produção e saída
-- ============================================================
CREATE TABLE IF NOT EXISTS materias_primas (
  id                      SERIAL PRIMARY KEY,
  produto                 TEXT NOT NULL,
  fornecedor              TEXT,
  registro_fornecedor     TEXT, -- SIF / SIE / SISBI do fornecedor
  lote                    TEXT NOT NULL,
  quantidade              NUMERIC,
  unidade                 TEXT,
  temperatura_recebimento NUMERIC,
  data_entrada            DATE DEFAULT CURRENT_DATE,
  nota_fiscal             TEXT,
  responsavel             TEXT
);

CREATE TABLE IF NOT EXISTS producao (
  id                   SERIAL PRIMARY KEY,
  produto              TEXT NOT NULL,
  lote_producao        TEXT NOT NULL,
  lotes_materia_prima  TEXT,
  quantidade           NUMERIC,
  unidade              TEXT,
  data_producao        DATE DEFAULT CURRENT_DATE,
  responsavel          TEXT,
  observacao           TEXT
);

CREATE TABLE IF NOT EXISTS expedicao (
  id               SERIAL PRIMARY KEY,
  produto          TEXT NOT NULL,
  lote_producao    TEXT,
  cliente          TEXT,
  destino          TEXT,
  quantidade       NUMERIC,
  unidade          TEXT,
  temperatura_saida NUMERIC,
  data_saida       DATE DEFAULT CURRENT_DATE,
  responsavel      TEXT
);

-- ============================================================
-- Laboratório
-- ============================================================
CREATE TABLE IF NOT EXISTS analises (
  id          SERIAL PRIMARY KEY,
  tipo        TEXT NOT NULL, -- agua|produto|swab
  ponto       TEXT,
  lote        TEXT,
  parametro   TEXT,
  resultado   TEXT,
  limite      TEXT,
  conforme    BOOLEAN,
  data_coleta DATE DEFAULT CURRENT_DATE,
  status      TEXT DEFAULT 'pendente', -- pendente|concluida
  laudo_url   TEXT,
  laudo_nome  TEXT,
  responsavel TEXT
);

-- ============================================================
-- Não conformidades
-- ============================================================
CREATE TABLE IF NOT EXISTS nao_conformidades (
  id                  SERIAL PRIMARY KEY,
  descricao           TEXT NOT NULL,
  origem              TEXT,
  gravidade           TEXT DEFAULT 'media', -- baixa|media|alta
  foto_url            TEXT,
  acao_corretiva      TEXT,
  responsavel         TEXT,
  prazo               DATE,
  status              TEXT DEFAULT 'aberta', -- aberta|em_acao|verificacao|encerrada
  verificacao_eficacia TEXT,
  data_verificacao    DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Auditorias (SIM / SISBI / SIE / SIF)
-- ============================================================
CREATE TABLE IF NOT EXISTS auditorias (
  id          SERIAL PRIMARY KEY,
  tipo        TEXT NOT NULL,
  data        DATE DEFAULT CURRENT_DATE,
  auditor     TEXT,
  escopo      TEXT,
  resultado   TEXT, -- conforme|com_nao_conformidade
  pontuacao   NUMERIC,
  observacoes TEXT
);

CREATE TABLE IF NOT EXISTS auditoria_itens (
  id           SERIAL PRIMARY KEY,
  auditoria_id INTEGER REFERENCES auditorias(id) ON DELETE CASCADE,
  item         TEXT NOT NULL,
  conforme     BOOLEAN DEFAULT TRUE,
  observacao   TEXT
);

-- ============================================================
-- Gestão documental
-- ============================================================
CREATE TABLE IF NOT EXISTS documentos (
  id              SERIAL PRIMARY KEY,
  titulo          TEXT NOT NULL,
  tipo            TEXT NOT NULL, -- PAC|APPCC|POP|Manual
  codigo          TEXT,
  versao          TEXT,
  data_revisao    DATE,
  proxima_revisao DATE,
  responsavel     TEXT,
  status          TEXT DEFAULT 'vigente', -- vigente|em_revisao|vencido
  arquivo_url     TEXT,
  arquivo_nome    TEXT
);

-- ============================================================
-- Registro de produtos
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos (
  id                  SERIAL PRIMARY KEY,
  nome                TEXT NOT NULL,
  denominacao_venda   TEXT,
  categoria           TEXT,
  registro_sif        TEXT,
  memorial_descritivo TEXT,
  ficha_tecnica       TEXT,
  rotulagem           TEXT,
  ativo               BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Treinamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS treinamentos (
  id                 SERIAL PRIMARY KEY,
  titulo             TEXT NOT NULL,
  tema               TEXT,
  instrutor          TEXT,
  data_realizacao    DATE DEFAULT CURRENT_DATE,
  carga_horaria      NUMERIC,
  validade_meses     INTEGER DEFAULT 12,
  proxima_reciclagem DATE
);

CREATE TABLE IF NOT EXISTS treinamento_participantes (
  id                  SERIAL PRIMARY KEY,
  treinamento_id      INTEGER REFERENCES treinamentos(id) ON DELETE CASCADE,
  nome                TEXT NOT NULL,
  cargo               TEXT,
  cpf                 TEXT,
  presenca            BOOLEAN DEFAULT TRUE,
  certificado_emitido BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- Controle de acesso — usuários, sessões e alertas manuais
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  nome       TEXT NOT NULL,
  cargo      TEXT NOT NULL, -- funcionario|operador|qualidade|supervisor
  ativo      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- O nome identifica a conta no login, então não pode se repetir.
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_nome_lower_key ON usuarios (lower(nome));

CREATE TABLE IF NOT EXISTS sessoes (
  token      TEXT PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sessoes_usuario_idx ON sessoes (usuario_id);

-- Alertas emitidos manualmente pelo Controle de Qualidade / Supervisor,
-- somados aos alertas automáticos calculados pelo painel.
CREATE TABLE IF NOT EXISTS alertas (
  id         SERIAL PRIMARY KEY,
  nivel      TEXT NOT NULL DEFAULT 'atencao', -- atencao|critico
  modulo     TEXT,
  mensagem   TEXT NOT NULL,
  autor      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
