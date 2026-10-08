-- Demo data so the app is usable right after boot.
-- Idempotent: fixed ids + ON CONFLICT DO NOTHING, safe to re-run on every boot.

-- ============================================================
-- APPCC
-- ============================================================
INSERT INTO pcc (id, nome, etapa_processo, perigo, limite_critico, unidade, frequencia, monitoramento, acao_corretiva, responsavel, ativo) VALUES
 (1, 'Recebimento de matéria-prima refrigerada', 'Recebimento', 'Biológico — multiplicação de patógenos', '≤ 7 °C', '°C', 'Cada lote recebido', 'Medição da temperatura superficial e interna com termômetro calibrado', 'Rejeitar o lote, registrar não conformidade e notificar o fornecedor', 'RT — Médico Veterinário', TRUE),
 (2, 'Cocção de embutidos cárneos', 'Cocção', 'Biológico — sobrevivência de Salmonella spp.', '≥ 72 °C no centro geométrico', '°C', 'A cada batelada', 'Termômetro de ponta em 3 pontos do produto', 'Prolongar a cocção por 15 min; se persistir, segregar e descartar o lote', 'Enc. de Produção', TRUE),
 (3, 'Resfriamento rápido de produto coccionado', 'Resfriamento', 'Biológico — germinação de esporos', '≤ 7 °C em até 2 h', '°C', 'A cada batelada', 'Registro de temperaturas da câmara em planilha horária', 'Encaminhar para reprocesso ou descarte conforme parecer do RT', 'Enc. de Qualidade', TRUE),
 (4, 'Detecção de metais na embalagem', 'Embalagem', 'Físico — fragmentos metálicos', 'Fe 2,5 mm / Não-Fe 3,0 mm / Inox 3,5 mm', 'mm', 'Início, meio e fim de cada turno', 'Teste com padrões certificados no detector de metais', 'Segregar o produto desde a última checagem aprovada e reinspecionar', 'Enc. de Embalagem', TRUE),
 (5, 'Cloro residual na água de processo', 'Processamento', 'Químico — resíduo de sanitizante', '0,5 a 2,0 ppm', 'ppm', 'Diário', 'Kit colorimétrico no ponto de uso', 'Ajustar dosagem e repetir a análise antes de retomar o processo', 'Enc. de Higienização', TRUE),
 (6, 'Temperatura de expedição em veículo refrigerado', 'Expedição', 'Biológico — quebra da cadeia de frio', '≤ 7 °C', '°C', 'Antes de cada carregamento', 'Leitura no baú e no produto antes do faturamento', 'Suspender o carregamento, transferir a carga e acionar a logística', 'Enc. de Expedição', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pcc_monitoramentos (id, pcc_id, valor, conforme, data_hora, responsavel, observacao) VALUES
 (1, 1, 4.2, TRUE,  NOW() - INTERVAL '2 days', 'RT — Médico Veterinário', 'Lote de carcaça bovina recebido dentro do limite'),
 (2, 2, 74.5, TRUE,  NOW() - INTERVAL '1 day',  'Enc. de Produção', 'Batelada de linguiça toscana — 3 pontos medidos'),
 (3, 3, 9.1,  FALSE, NOW() - INTERVAL '1 day',  'Enc. de Qualidade', 'Resfriamento acima do limite — acionada ação corretiva'),
 (4, 4, 2.0,  TRUE,  NOW() - INTERVAL '6 hours','Enc. de Embalagem', 'Teste com padrão de ferro aprovado'),
 (5, 5, 1.1,  TRUE,  NOW() - INTERVAL '5 hours','Enc. de Higienização', 'Cloro dentro da faixa'),
 (6, 6, 3.8,  TRUE,  NOW() - INTERVAL '3 hours','Enc. de Expedição', 'Baú do veículo placa ABC-1D23')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PACs
-- ============================================================
INSERT INTO pacs (id, tipo, titulo, descricao, frequencia, responsavel, ativo) VALUES
 (1,  'manutencao',       'Manutenção preventiva de equipamentos e utensílios', 'Plano anual de manutenção preventiva e calibração de instrumentos de medição.', 'Mensal', 'Enc. de Manutenção', TRUE),
 (2,  'agua',             'Potabilidade da água de abastecimento', 'Controle de cloro residual, pH e análises microbiológicas da água de processo e de limpeza.', 'Diária / mensal', 'Enc. de Higienização', TRUE),
 (3,  'higiene',          'Higiene operacional de superfícies e instalações', 'Verificação da eficácia dos procedimentos de limpeza e sanitização por swab ambiental.', 'Semanal', 'Enc. de Qualidade', TRUE),
 (4,  'manipuladores',    'Higiene e saúde dos manipuladores', 'Avaliação de hábitos higiênicos, uniformes, exames admissionais e periódicos.', 'Diária / anual', 'RT — Médico Veterinário', TRUE),
 (5,  'pragas',           'Controle integrado de pragas', 'Monitoramento de armadilhas, iscas e barreiras físicas com empresa especializada.', 'Quinzenal', 'Enc. de Qualidade', TRUE),
 (6,  'materias_primas',  'Recebimento e avaliação de matérias-primas', 'Avaliação de fornecedores habilitados, temperatura, embalagem e rotulagem no recebimento.', 'Cada lote', 'RT — Médico Veterinário', TRUE),
 (7,  'temperaturas',     'Controle de temperaturas de processo e armazenamento', 'Monitoramento contínuo de câmaras, túneis, veículos e produto acabado.', 'Diária', 'Enc. de Qualidade', TRUE),
 (8,  'rastreabilidade',  'Rastreabilidade e recall', 'Vinculação entre matéria-prima, produção e expedição, com simulado de recall anual.', 'Por lote', 'Enc. de Qualidade', TRUE),
 (9,  'fraudes',          'Prevenção de fraudes e autenticidade', 'Controle de espécies, aditivos, peso líquido e conformidade de rotulagem.', 'Semestral', 'Enc. de Qualidade', TRUE),
 (10, 'laboratorio',      'Controle laboratorial de produtos e ambiente', 'Analises fisico-quimicas e microbiologicas de produtos, agua e superficies.', 'Mensal', 'Enc. de Qualidade', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pac_registros (id, pac_id, data, resultado, conforme, responsavel, observacao) VALUES
 (1, 2,  CURRENT_DATE - 5, 'Cloro residual 1,2 ppm; pH 7,1',        TRUE,  'Enc. de Higienização', 'Dentro dos padrões'),
 (2, 5,  CURRENT_DATE - 4, 'Armadilhas sem captura; barreiras íntegras', TRUE, 'Enc. de Qualidade',   'Relatório da controladora arquivado'),
 (3, 3,  CURRENT_DATE - 3, 'Swab de bancada: 12 UFC/cm² (aceitável)', TRUE, 'Enc. de Qualidade',   'Limite interno 100 UFC/cm²'),
 (4, 4,  CURRENT_DATE - 2, 'Uniformes e retenção de pertences OK',   TRUE,  'RT — Médico Veterinário', 'Sem ocorrências'),
 (5, 1,  CURRENT_DATE - 1, 'Calibração de 3 termômetros vencida',    FALSE, 'Enc. de Manutenção',  'Ação corretiva aberta para calibrar'),
 (6, 6,  CURRENT_DATE,     'Matéria-prima 4 °C — fornecedor SIF 1234', TRUE, 'RT — Médico Veterinário', 'Lote aprovado')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Temperaturas
-- ============================================================
INSERT INTO temperaturas (id, equipamento, tipo, temperatura, limite_min, limite_max, conforme, data_hora, responsavel, observacao) VALUES
 (1,  'Câmara de resfriamento 01', 'resfriamento',       3.5,  0,  7, TRUE,  NOW() - INTERVAL '2 hours',  'Enc. de Qualidade', 'Produto acabado refrigerado'),
 (2,  'Câmara de resfriamento 02', 'resfriamento',       8.4,  0,  7, FALSE, NOW() - INTERVAL '90 minutes', 'Enc. de Qualidade', 'Porta aberta durante carregamento'),
 (3,  'Câmara de congelamento 01', 'congelamento',     -19.5, -22, -18, TRUE, NOW() - INTERVAL '80 minutes', 'Enc. de Qualidade', 'Túnel em regime'),
 (4,  'Câmara de congelamento 02', 'congelamento',     -16.2, -22, -18, FALSE, NOW() - INTERVAL '70 minutes', 'Enc. de Qualidade', 'Degelo em andamento'),
 (5,  'Produto acabado — linguiça toscana', 'produto_acabado', 4.1, 0, 7, TRUE, NOW() - INTERVAL '60 minutes', 'Enc. de Expedição', 'Aguardando expedição'),
 (6,  'Veículo refrigerado placa ABC-1D23', 'veiculo',   3.8,  0,  7, TRUE,  NOW() - INTERVAL '45 minutes',  'Enc. de Expedição', 'Carregamento para o cliente Mercado Central'),
 (7,  'Veículo refrigerado placa XYZ-9B87', 'veiculo',   9.6,  0,  7, FALSE, NOW() - INTERVAL '30 minutes',  'Enc. de Expedição', 'Equipamento do baú desligado no pátio'),
 (8,  'Câmara de resfriamento 01', 'resfriamento',       2.9,  0,  7, TRUE,  NOW() - INTERVAL '20 minutes',  'Enc. de Qualidade', 'Leitura de rotina'),
 (9,  'Câmara de congelamento 01', 'congelamento',     -20.1, -22, -18, TRUE, NOW() - INTERVAL '15 minutes',  'Enc. de Qualidade', 'Leitura de rotina'),
 (10, 'Produto acabado — hambúrguer bovino', 'produto_acabado', -17.8, -22, -18, TRUE, NOW() - INTERVAL '10 minutes', 'Enc. de Expedição', 'Lote congelado')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Rastreabilidade: entrada, produção e saída
-- ============================================================
INSERT INTO materias_primas (id, produto, fornecedor, registro_fornecedor, lote, quantidade, unidade, temperatura_recebimento, data_entrada, nota_fiscal, responsavel) VALUES
 (1, 'Carne bovina — paleta resfriada', 'Frigorífico Boi Forte', 'SIF 1234', 'MP-2026-0451', 850.0, 'kg', 4.2, CURRENT_DATE - 6, 'NF 145230', 'RT — Médico Veterinário'),
 (2, 'Carne suína — pernil resfriado', 'Suínos Vale Verde', 'SIF 2456', 'MP-2026-0452', 420.5, 'kg', 5.1, CURRENT_DATE - 5, 'NF 889120', 'RT — Médico Veterinário'),
 (3, 'Toucinho suíno congelado', 'Suínos Vale Verde', 'SIF 2456', 'MP-2026-0453', 180.0, 'kg', -17.4, CURRENT_DATE - 5, 'NF 889121', 'Enc. de Recebimento'),
 (4, 'Carne de frango — peito resfriado', 'Aves Oeste', 'SIF 3789', 'MP-2026-0454', 300.0, 'kg', 3.6, CURRENT_DATE - 3, 'NF 221004', 'RT — Médico Veterinário'),
 (5, 'Condimentos e aditivos — kit linguiça', 'Insumos Sul', 'SIE 778', 'MP-2026-0455', 60.0, 'kg', 20.5, CURRENT_DATE - 2, 'NF 4471', 'Enc. de Recebimento'),
 (6, 'Embalagem primária — filme PE', 'Embalagens Alfa', 'SIE 902', 'MP-2026-0456', 120.0, 'kg', 21.0, CURRENT_DATE - 1, 'NF 55120', 'Enc. de Recebimento')
ON CONFLICT (id) DO NOTHING;

INSERT INTO producao (id, produto, lote_producao, lotes_materia_prima, quantidade, unidade, data_producao, responsavel, observacao) VALUES
 (1, 'Linguiça toscana',     'LP-2026-0118', 'MP-2026-0451, MP-2026-0452, MP-2026-0455', 620.0, 'kg', CURRENT_DATE - 4, 'Enc. de Produção', 'Cocção conforme PCC 2 — 74,5 °C'),
 (2, 'Hambúrguer bovino',    'LP-2026-0119', 'MP-2026-0451, MP-2026-0455',               380.0, 'kg', CURRENT_DATE - 3, 'Enc. de Produção', 'Congelamento em túnel'),
 (3, 'Kafta bovina',         'LP-2026-0120', 'MP-2026-0451, MP-2026-0455',               250.0, 'kg', CURRENT_DATE - 2, 'Enc. de Produção', 'Temperatura de massa 6,8 °C'),
 (4, 'Almôndega bovina',     'LP-2026-0121', 'MP-2026-0451, MP-2026-0455',               200.0, 'kg', CURRENT_DATE - 1, 'Enc. de Produção', 'Cocção em estufa'),
 (5, 'Linguiça de frango',   'LP-2026-0122', 'MP-2026-0454, MP-2026-0455',               310.0, 'kg', CURRENT_DATE,     'Enc. de Produção', 'Em andamento')
ON CONFLICT (id) DO NOTHING;

INSERT INTO expedicao (id, produto, lote_producao, cliente, destino, quantidade, unidade, temperatura_saida, data_saida, responsavel) VALUES
 (1, 'Linguiça toscana',  'LP-2026-0118', 'Mercado Central Ltda',    'São Paulo/SP',   400.0, 'kg', 3.8, CURRENT_DATE - 3, 'Enc. de Expedição'),
 (2, 'Linguiça toscana',  'LP-2026-0118', 'Distribuidora Bom Preço', 'Curitiba/PR',    220.0, 'kg', 4.1, CURRENT_DATE - 2, 'Enc. de Expedição'),
 (3, 'Hambúrguer bovino', 'LP-2026-0119', 'Rede Supermercados Sol',  'Ribeirão Preto/SP', 380.0, 'kg', -18.0, CURRENT_DATE - 1, 'Enc. de Expedição'),
 (4, 'Kafta bovina',      'LP-2026-0120', 'Mercado Central Ltda',    'São Paulo/SP',   250.0, 'kg', -17.5, CURRENT_DATE,     'Enc. de Expedição')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Laboratório
-- ============================================================
INSERT INTO analises (id, tipo, ponto, lote, parametro, resultado, limite, conforme, data_coleta, status, laudo_url, laudo_nome, responsavel) VALUES
 (1, 'agua',    'Caixa d''água — ponto de uso 01', NULL,              'Coliformes totais', 'Ausente em 100 mL', 'Ausência',       TRUE,  CURRENT_DATE - 10, 'concluida', NULL, NULL, 'Enc. de Qualidade'),
 (2, 'agua',    'Torneira da sala de manipulação', NULL,              'Cloro residual',    '1,2 ppm',           '0,5 a 2,0 ppm',  TRUE,  CURRENT_DATE - 3,  'concluida', NULL, NULL, 'Enc. de Higienização'),
 (3, 'produto', 'Linguiça toscana — lote LP-2026-0118', 'LP-2026-0118', 'Salmonella spp.',   'Ausente em 25 g',   'Ausência',       TRUE,  CURRENT_DATE - 2,  'concluida', NULL, NULL, 'Enc. de Qualidade'),
 (4, 'produto', 'Hambúrguer bovino — lote LP-2026-0119', 'LP-2026-0119', 'Estafilococos coagulase positiva', NULL, '10² UFC/g',  NULL,  CURRENT_DATE,      'pendente',  NULL, NULL, 'Enc. de Qualidade'),
 (5, 'swab',    'Bancada de desossa',              NULL,              'Contagem total',    '12 UFC/cm²',        '≤ 100 UFC/cm²',  TRUE,  CURRENT_DATE - 7,  'concluida', NULL, NULL, 'Enc. de Qualidade'),
 (6, 'swab',    'Facas da sala de corte',          NULL,              'Contagem total',    NULL,                '≤ 100 UFC/cm²',  NULL,  CURRENT_DATE,      'pendente',  NULL, NULL, 'Enc. de Qualidade'),
 (7, 'agua',    'Água de processo — túnel de resfriamento', NULL,      'Coliformes totais', NULL,                'Ausência',       NULL,  CURRENT_DATE,      'pendente',  NULL, NULL, 'Enc. de Higienização')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Não conformidades
-- ============================================================
INSERT INTO nao_conformidades (id, descricao, origem, gravidade, foto_url, acao_corretiva, responsavel, prazo, status, verificacao_eficacia, data_verificacao) VALUES
 (1, 'Câmara de resfriamento 02 registrou 8,4 °C durante o carregamento', 'Controle de temperaturas', 'alta',  NULL, 'Porta mantida fechada durante o carregamento; produto transferido e reavaliado pelo RT', 'Enc. de Qualidade', CURRENT_DATE - 1, 'verificacao', 'Aguardando 3 leituras consecutivas conformes', NULL),
 (2, 'Termômetro do setor de embalagem com calibração vencida', 'PAC Manutenção', 'media', NULL, 'Instrumento enviado para calibração em laboratório acreditado', 'Enc. de Manutenção', CURRENT_DATE + 3, 'em_acao', NULL, NULL),
 (3, 'Veículo XYZ-9B87 com baú desligado aguardando carregamento', 'PAC Temperaturas', 'alta', NULL, 'Motorista orientado; carga transferida para veículo conforme', 'Enc. de Expedição', CURRENT_DATE - 2, 'encerrada', 'Verificado em 2 carregamentos subsequentes: 3,9 °C e 4,3 °C', CURRENT_DATE - 1),
 (4, 'Armadilha de cola com 2 moscas no acesso ao estoque de embalagens', 'PAC Pragas', 'baixa', NULL, 'Acionada a controladora para reforço do tratamento e vedação da porta', 'Enc. de Qualidade', CURRENT_DATE + 7, 'aberta', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Auditorias
-- ============================================================
INSERT INTO auditorias (id, tipo, data, auditor, escopo, resultado, pontuacao, observacoes) VALUES
 (1, 'SIM',   CURRENT_DATE - 15, 'Serviço de Inspeção Municipal', 'Verificação de autocontroles, rastreabilidade e boas práticas', 'com_nao_conformidade', 88.0, 'Duas não conformidades menores: calibração de instrumentos e registro de limpeza.'),
 (2, 'SISBI', CURRENT_DATE - 60, 'Auditoria de adesão ao SISBI-POA', 'Equivalência do serviço de inspeção interno', 'conforme', 96.0, 'Recomendada a redução do intervalo de verificação de swab ambiental.'),
 (3, 'SIF',   CURRENT_DATE - 120, 'Auditoria do estabelecimento sob SIF', 'APPCC, PACs obrigatórios e rotulagem', 'conforme', 94.0, 'Rotulagem dos produtos cárneos aprovada sem restrições.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auditoria_itens (id, auditoria_id, item, conforme, observacao) VALUES
 (1,  1, 'PAC de água com análise microbiológica mensal', TRUE,  NULL),
 (2,  1, 'Instrumentos de medição calibrados e identificados', FALSE, 'Dois termômetros vencidos no setor de embalagem'),
 (3,  1, 'Registros de limpeza e sanitização assinados pelo responsável', TRUE, NULL),
 (4,  1, 'Treinamento em boas práticas dentro da validade', TRUE, NULL),
 (5,  1, 'Rastreabilidade demonstrada da matéria-prima à expedição', TRUE, NULL),
 (6,  1, 'Rotulagem conforme denominação de venda', TRUE, NULL),
 (7,  2, 'APPCC com PCCs, limites críticos e ações corretivas documentados', TRUE, NULL),
 (8,  2, 'Programa de recall testado no último ano', TRUE, NULL),
 (9,  2, 'Controle de pragas por empresa registrada', TRUE, NULL),
 (10, 3, 'Memorial descritivo e ficha técnica de cada produto', TRUE, NULL),
 (11, 3, 'Controle de fraudes e autenticidade de espécies', TRUE, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Documentos
-- ============================================================
INSERT INTO documentos (id, titulo, tipo, codigo, versao, data_revisao, proxima_revisao, responsavel, status, arquivo_url, arquivo_nome) VALUES
 (1,  'Manual de Boas Práticas de Fabricação', 'Manual', 'MBPF-001', '04', CURRENT_DATE - 90, CURRENT_DATE + 275, 'RT — Médico Veterinário', 'vigente', NULL, NULL),
 (2,  'Plano APPCC — Linha de embutidos cárneos', 'APPCC', 'APPCC-001', '03', CURRENT_DATE - 120, CURRENT_DATE + 245, 'Enc. de Qualidade', 'vigente', NULL, NULL),
 (3,  'PAC — Potabilidade da água', 'PAC', 'PAC-002', '02', CURRENT_DATE - 200, CURRENT_DATE - 20, 'Enc. de Higienização', 'vencido', NULL, NULL),
 (4,  'PAC — Higiene operacional', 'PAC', 'PAC-003', '05', CURRENT_DATE - 40, CURRENT_DATE + 325, 'Enc. de Qualidade', 'vigente', NULL, NULL),
 (5,  'PAC — Controle integrado de pragas', 'PAC', 'PAC-005', '03', CURRENT_DATE - 60, CURRENT_DATE + 305, 'Enc. de Qualidade', 'vigente', NULL, NULL),
 (6,  'PAC — Rastreabilidade e recall', 'PAC', 'PAC-008', '02', CURRENT_DATE - 150, CURRENT_DATE + 215, 'Enc. de Qualidade', 'vigente', NULL, NULL),
 (7,  'POP — Higienização de câmaras frias', 'POP', 'POP-012', '03', CURRENT_DATE - 30, CURRENT_DATE + 335, 'Enc. de Higienização', 'vigente', NULL, NULL),
 (8,  'POP — Recebimento de matéria-prima', 'POP', 'POP-004', '02', CURRENT_DATE - 100, CURRENT_DATE + 265, 'RT — Médico Veterinário', 'vigente', NULL, NULL),
 (9,  'POP — Detecção de metais', 'POP', 'POP-019', '01', CURRENT_DATE - 25, CURRENT_DATE + 340, 'Enc. de Embalagem', 'vigente', NULL, NULL),
 (10, 'Manual de Rotulagem de produtos cárneos', 'Manual', 'MBPF-007', '02', CURRENT_DATE - 80, CURRENT_DATE + 285, 'Enc. de Qualidade', 'vigente', NULL, NULL),
 (11, 'PAC — Manutenção preventiva', 'PAC', 'PAC-001', '02', CURRENT_DATE - 140, CURRENT_DATE - 5, 'Enc. de Manutenção', 'em_revisao', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Produtos
-- ============================================================
INSERT INTO produtos (id, nome, denominacao_venda, categoria, registro_sif, memorial_descritivo, ficha_tecnica, rotulagem, ativo) VALUES
 (1, 'Linguiça toscana', 'Linguiça de carne suína, tipo toscana, resfriada', 'Embutido cárneo', 'SIF 1234 / SIE 778',
  'Produto cárneo embutido, cru, obtido da moagem de pernil suíno com toucinho, condimentos e aditivos. Prazo de validade de 7 dias sob 0 a 4 °C. Ingredientes de fornecedores habilitados pelo SIF.',
  'Umidade 62% | Proteína 14% | Gordura 20% | Atividade de água 0,96 | Embalagem a vácuo 500 g e 2 kg',
  'Lista de ingredientes em ordem decrescente, advertência de conservação, data de fabricação, lote e selo de inspeção.',
  TRUE),
 (2, 'Hambúrguer bovino', 'Hambúrguer de carne bovina, congelado', 'Produto cárneo moldado', 'SIF 1234',
  'Produto obtido de carne bovina moída, moldado em porções, congelado a -18 °C ou menos. Sem adição de proteína vegetal.',
  'Proteína 15% | Gordura 15% | Peso individual 130 g | Congelamento em túnel -18 °C',
  'Rotulagem com denominação de venda, quantidade líquida, modo de conservação e registro do estabelecimento.',
  TRUE),
 (3, 'Kafta bovina', 'Kafta de carne bovina, temperada, refrigerada', 'Produto cárneo temperado', 'SIF 1234',
  'Produto cárneo temperado, obtido de carne moída bovina com condimentos específicos, refrigerado, conforme cultura do produto.',
  'Umidade 64% | Proteína 13% | Gordura 17% | Validade 5 dias sob 0 a 4 °C',
  'Denominação de venda "Kafta de carne bovina", ingredientes, conservação e lote.',
  TRUE),
 (4, 'Almôndega bovina', 'Almôndega de carne bovina, cozida, congelada', 'Produto cárneo coccionado', 'SIF 1234',
  'Produto coccionado obtido de carne moída bovina temperada, moldada e submetida a tratamento térmico de no mínimo 72 °C.',
  'Proteína 14% | Gordura 16% | Tratamento térmico ≥ 72 °C | Congelado -18 °C',
  'Rotulagem com denominação de venda coccionada, informações nutricionais e advertências de conservação.',
  TRUE),
 (5, 'Linguiça de frango', 'Linguiça de carne de frango, fresca', 'Embutido cárneo', 'SIF 1234',
  'Embutido fresco de carne de frango resfriada, moída e temperada, sem conservadores.',
  'Proteína 15% | Gordura 12% | Validade 5 dias sob 0 a 4 °C',
  'Ingredientes, conservação sob refrigeração, origem do estabelecimento e data de fabricação.',
  TRUE),
 (6, 'Carne bovina moída', 'Carne bovina moída, resfriada', 'Carne e derivados', 'SIF 1234',
  'Carne bovina desossada, moída e embalada a vácuo, resfriada a 4 °C ou menos.',
  'Proteína 18% | Gordura 12% | Validade 4 dias sob 0 a 4 °C',
  'Denominação "Carne bovina moída", quantidade líquida, data e lote.',
  FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Treinamentos
-- ============================================================
INSERT INTO treinamentos (id, titulo, tema, instrutor, data_realizacao, carga_horaria, validade_meses, proxima_reciclagem) VALUES
 (1, 'Boas Práticas de Fabricação', 'Higiene pessoal, uniformização e conduta na área de produção', 'RT — Médico Veterinário', CURRENT_DATE - 150, 8, 12, CURRENT_DATE + 215),
 (2, 'APPCC e PCCs na prática', 'Monitoramento de pontos críticos, limites e ações corretivas', 'Enc. de Qualidade', CURRENT_DATE - 120, 4, 12, CURRENT_DATE + 245),
 (3, 'Higienização e sanitização', 'Diluentes, dosagens, tempo de contato e verificação', 'Enc. de Higienização', CURRENT_DATE - 200, 4, 12, CURRENT_DATE - 15),
 (4, 'Rastreabilidade e recall', 'Registros de lote, simulado de recolhimento e comunicação', 'Enc. de Qualidade', CURRENT_DATE - 60, 3, 12, CURRENT_DATE + 305),
 (5, 'Controle de pragas e vedação', 'Prevenção, monitoramento de armadilhas e barreiras físicas', 'Controladora Registrada', CURRENT_DATE - 30, 2, 12, CURRENT_DATE + 335),
 (6, 'Prevenção de fraudes alimentares', 'Autenticidade de espécies, aditivos e rotulagem', 'Enc. de Qualidade', CURRENT_DATE - 10, 3, 24, CURRENT_DATE + 720)
ON CONFLICT (id) DO NOTHING;

INSERT INTO treinamento_participantes (id, treinamento_id, nome, cargo, cpf, presenca, certificado_emitido) VALUES
 (1, 1, 'Ana Paula Ribeiro',  'Auxiliar de produção',     '111.222.333-44', TRUE,  TRUE),
 (2, 1, 'Carlos Eduardo Lima', 'Desossador',              '222.333.444-55', TRUE,  TRUE),
 (3, 1, 'Marcos Vinícius Souza','Enc. de Embalagem',      '333.444.555-66', TRUE,  FALSE),
 (4, 2, 'Ana Paula Ribeiro',  'Auxiliar de produção',     '111.222.333-44', TRUE,  TRUE),
 (5, 2, 'Juliana Martins',    'Enc. de Qualidade',        '444.555.666-77', TRUE,  TRUE),
 (6, 3, 'Carlos Eduardo Lima', 'Desossador',              '222.333.444-55', TRUE,  TRUE),
 (7, 3, 'Rafael Antunes',     'Auxiliar de higienização', '555.666.777-88', TRUE,  TRUE),
 (8, 4, 'Juliana Martins',    'Enc. de Qualidade',        '444.555.666-77', TRUE,  TRUE),
 (9, 4, 'Marcos Vinícius Souza','Enc. de Embalagem',      '333.444.555-66', FALSE, FALSE),
 (10,5, 'Rafael Antunes',     'Auxiliar de higienização', '555.666.777-88', TRUE,  TRUE),
 (11,6, 'Juliana Martins',    'Enc. de Qualidade',        '444.555.666-77', TRUE,  TRUE),
 (12,6, 'Ana Paula Ribeiro',  'Auxiliar de produção',     '111.222.333-44', TRUE,  FALSE)
ON CONFLICT (id) DO NOTHING;

-- Keep sequences ahead of the explicitly inserted ids.
SELECT setval(pg_get_serial_sequence('pcc', 'id'),                       (SELECT COALESCE(MAX(id), 1) FROM pcc));
SELECT setval(pg_get_serial_sequence('pcc_monitoramentos', 'id'),        (SELECT COALESCE(MAX(id), 1) FROM pcc_monitoramentos));
SELECT setval(pg_get_serial_sequence('pacs', 'id'),                      (SELECT COALESCE(MAX(id), 1) FROM pacs));
SELECT setval(pg_get_serial_sequence('pac_registros', 'id'),             (SELECT COALESCE(MAX(id), 1) FROM pac_registros));
SELECT setval(pg_get_serial_sequence('temperaturas', 'id'),              (SELECT COALESCE(MAX(id), 1) FROM temperaturas));
SELECT setval(pg_get_serial_sequence('materias_primas', 'id'),           (SELECT COALESCE(MAX(id), 1) FROM materias_primas));
SELECT setval(pg_get_serial_sequence('producao', 'id'),                  (SELECT COALESCE(MAX(id), 1) FROM producao));
SELECT setval(pg_get_serial_sequence('expedicao', 'id'),                 (SELECT COALESCE(MAX(id), 1) FROM expedicao));
SELECT setval(pg_get_serial_sequence('analises', 'id'),                  (SELECT COALESCE(MAX(id), 1) FROM analises));
SELECT setval(pg_get_serial_sequence('nao_conformidades', 'id'),         (SELECT COALESCE(MAX(id), 1) FROM nao_conformidades));
SELECT setval(pg_get_serial_sequence('auditorias', 'id'),                (SELECT COALESCE(MAX(id), 1) FROM auditorias));
SELECT setval(pg_get_serial_sequence('auditoria_itens', 'id'),           (SELECT COALESCE(MAX(id), 1) FROM auditoria_itens));
SELECT setval(pg_get_serial_sequence('documentos', 'id'),                (SELECT COALESCE(MAX(id), 1) FROM documentos));
SELECT setval(pg_get_serial_sequence('produtos', 'id'),                  (SELECT COALESCE(MAX(id), 1) FROM produtos));
SELECT setval(pg_get_serial_sequence('treinamentos', 'id'),              (SELECT COALESCE(MAX(id), 1) FROM treinamentos));
SELECT setval(pg_get_serial_sequence('treinamento_participantes', 'id'), (SELECT COALESCE(MAX(id), 1) FROM treinamento_participantes));
