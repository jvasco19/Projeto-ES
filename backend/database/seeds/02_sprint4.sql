-- Clientes que aparecem nos pedidos e ainda não existiam no 01
INSERT INTO users (name, email, password_hash) VALUES
  ('Pedro Nunes',   'pedro.nunes@exemplo.pt',   '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Rita Sousa',    'rita.sousa@exemplo.pt',    '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Sofia Martins', 'sofia.martins@exemplo.pt', '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i');

INSERT INTO product_members (product_id, user_id, role)
SELECT p.id, u.id, 'customer'
FROM products p
JOIN users u ON u.email IN ('pedro.nunes@exemplo.pt', 'rita.sousa@exemplo.pt', 'sofia.martins@exemplo.pt')
WHERE p.link_token = 'atl-7Q2KX9';

INSERT INTO teams (product_id, name, capacity)
SELECT p.id, t.name, t.capacity
FROM (VALUES
  ('Core',     40),
  ('Payments', 34),
  ('Growth',   30)
) AS t(name, capacity)
JOIN products p ON p.link_token = 'atl-7Q2KX9';

-- Membros de cada equipa
UPDATE product_members pm
SET team_id = t.id
FROM (VALUES
  ('rui.matos@exemplo.pt',      'Core'),
  ('beatriz.costa@exemplo.pt',  'Core'),
  ('tiago.ferreira@exemplo.pt', 'Core'),
  ('daniel.rocha@exemplo.pt',   'Payments'),
  ('leonor.almeida@exemplo.pt', 'Payments'),
  ('ines.carvalho@exemplo.pt',  'Growth'),
  ('miguel.santos@exemplo.pt',  'Growth')
) AS m(email, team)
JOIN users u    ON u.email = m.email
JOIN products p ON p.link_token = 'atl-7Q2KX9'
JOIN teams t    ON t.product_id = p.id AND t.name = m.team
WHERE pm.product_id = p.id AND pm.user_id = u.id;

-- Milestones
INSERT INTO milestones (product_id, name, due_date)
SELECT p.id, m.name, m.due_date::date
FROM (VALUES
  ('Lançamento B2B',        '2026-12-15'),
  ('Integrações bancárias', '2027-02-28')
) AS m(name, due_date)
JOIN products p ON p.link_token = 'atl-7Q2KX9';

-- Releases
INSERT INTO releases (product_id, milestone_id, name, objective, start_date, end_date, status)
SELECT p.id, ms.id, r.name, r.objective, r.start_date::date, r.end_date::date, r.status::release_status
FROM (VALUES
  ('v2.5', NULL,                    'Melhorar a importação de dados',                     '2026-08-20', '2026-09-30', 'concluida'),
  ('v3.0', 'Lançamento B2B',        'Relatórios e exportações para clientes empresariais', '2026-10-01', '2026-12-15', 'em_curso'),
  ('v3.1', 'Integrações bancárias', 'Faturação e previsão de vendas',                     '2027-01-04', '2027-02-28', 'planeada'),
  ('v3.2', NULL,                    'Mobilidade e assistência inteligente',               '2027-03-01', '2027-04-30', 'planeada')
) AS r(name, milestone, objective, start_date, end_date, status)
JOIN products p ON p.link_token = 'atl-7Q2KX9'
LEFT JOIN milestones ms ON ms.product_id = p.id AND ms.name = r.milestone;

-- Pedidos
INSERT INTO feature_requests (product_id, author_id, title, description, category, status, rejection_reason, is_public, created_at, updated_at)
SELECT p.id, u.id, r.title, r.description, r.category::request_category, r.status::request_status,
       r.rejection_reason, r.is_public, r.created_at::timestamptz, r.updated_at::timestamptz
FROM (VALUES
  -- Atlas CRM
  ('atl-7Q2KX9', 'marta.lopes@exemplo.pt',   'Relatório de comissões por vendedor',
   'Precisamos de um relatório mensal com as comissões de cada vendedor, calculadas a partir dos negócios fechados.',
   'relatorios', 'em_analise', NULL, true, '2026-11-04', '2026-11-06'),
  ('atl-7Q2KX9', 'joao.pires@exemplo.pt',    'Relatório mensal de desempenho por vendedor',
   'Ver num único ecrã o número de negócios, valor e taxa de conversão de cada vendedor.',
   'relatorios', 'em_analise', NULL, true, '2026-11-06', '2026-11-08'),
  ('atl-7Q2KX9', 'ana.ribeiro@exemplo.pt',   'Autenticação com chave de segurança',
   'Permitir login com chaves FIDO2 para cumprir a nossa política interna.',
   'seguranca', 'submetido', NULL, true, '2026-11-10', '2026-11-10'),
  ('atl-7Q2KX9', 'pedro.nunes@exemplo.pt',   'Sincronizar contactos com o Outlook',
   'Os contactos criados no Atlas deviam aparecer automaticamente no Outlook.',
   'integracoes', 'submetido', NULL, true, '2026-11-12', '2026-11-12'),
  ('atl-7Q2KX9', 'rita.sousa@exemplo.pt',    'Notificações por email quando um negócio muda de fase',
   'Receber um email sempre que um negócio passa para "Proposta enviada" ou "Fechado".',
   'notificacoes', 'aprovado', NULL, true, '2026-10-20', '2026-11-10'),
  ('atl-7Q2KX9', 'carlos.mendes@exemplo.pt', 'Exportar relatórios de vendas para Excel',
   'Exportar qualquer relatório para .xlsx mantendo os filtros aplicados.',
   'relatorios', 'planeado', NULL, true, '2026-10-08', '2026-11-03'),
  ('atl-7Q2KX9', 'sofia.martins@exemplo.pt', 'Tema personalizado com as cores da empresa',
   'Mudar as cores da aplicação para as cores da nossa marca.',
   'usabilidade', 'rejeitado', 'Fora do âmbito do roadmap deste ano.', false, '2026-10-02', '2026-10-16'),
  -- Lumen Docs
  ('lmn-2WQ7RB', 'ines.carvalho@exemplo.pt', 'Exportar documentos para PDF com índice automático',
   'Ao exportar um documento longo para PDF, gostava que fosse gerado um índice com ligações para cada secção.',
   NULL, 'planeado', NULL, true, '2026-10-02', '2026-11-09'),
  ('lmn-2WQ7RB', 'ines.carvalho@exemplo.pt', 'Modo offline no editor',
   'Poder continuar a editar quando a ligação à internet falha e sincronizar depois.',
   NULL, 'em_analise', NULL, true, '2026-10-28', '2026-10-30'),
  ('lmn-2WQ7RB', 'ines.carvalho@exemplo.pt', 'Integração com Google Drive',
   'Importar e guardar documentos diretamente numa pasta do Google Drive.',
   NULL, 'entregue', NULL, true, '2026-09-03', '2026-10-27'),
  -- Fieldnote
  ('fdn-6KM4PE', 'ines.carvalho@exemplo.pt', 'Partilhar notas por link público',
   'Gerar um link que qualquer pessoa possa abrir sem conta.',
   NULL, 'rejeitado',
   'Por razões de privacidade, as notas só podem ser partilhadas com contas da mesma organização. Vamos permitir convites por email na versão 4.1.',
   true, '2026-09-14', '2026-09-22'),
  ('fdn-6KM4PE', 'ines.carvalho@exemplo.pt', 'Etiquetas com cores personalizadas',
   'Escolher a cor de cada etiqueta para distinguir projetos rapidamente.',
   NULL, 'submetido', NULL, true, '2026-11-12', '2026-11-12')
) AS r(link_token, email, title, description, category, status, rejection_reason, is_public, created_at, updated_at)
JOIN products p ON p.link_token = r.link_token
JOIN users u    ON u.email = r.email;

-- Histórico de estados dos pedidos
INSERT INTO request_status_changes (request_id, from_status, to_status, changed_by, changed_at)
SELECT fr.id, c.from_status::request_status, c.to_status::request_status, u.id, c.changed_at::timestamptz
FROM (VALUES
  ('Relatório de comissões por vendedor',                   NULL,         'submetido',  'marta.lopes@exemplo.pt',   '2026-11-04'),
  ('Relatório de comissões por vendedor',                   'submetido',  'em_analise', 'ines.carvalho@exemplo.pt', '2026-11-06'),
  ('Relatório mensal de desempenho por vendedor',           NULL,         'submetido',  'joao.pires@exemplo.pt',    '2026-11-06'),
  ('Relatório mensal de desempenho por vendedor',           'submetido',  'em_analise', 'ines.carvalho@exemplo.pt', '2026-11-08'),
  ('Autenticação com chave de segurança',                   NULL,         'submetido',  'ana.ribeiro@exemplo.pt',   '2026-11-10'),
  ('Sincronizar contactos com o Outlook',                   NULL,         'submetido',  'pedro.nunes@exemplo.pt',   '2026-11-12'),
  ('Notificações por email quando um negócio muda de fase', NULL,         'submetido',  'rita.sousa@exemplo.pt',    '2026-10-20'),
  ('Notificações por email quando um negócio muda de fase', 'submetido',  'em_analise', 'ines.carvalho@exemplo.pt', '2026-10-22'),
  ('Notificações por email quando um negócio muda de fase', 'em_analise', 'aprovado',   'ines.carvalho@exemplo.pt', '2026-11-10'),
  ('Exportar relatórios de vendas para Excel',              NULL,         'submetido',  'carlos.mendes@exemplo.pt', '2026-10-08'),
  ('Exportar relatórios de vendas para Excel',              'submetido',  'em_analise', 'ines.carvalho@exemplo.pt', '2026-10-09'),
  ('Exportar relatórios de vendas para Excel',              'em_analise', 'aprovado',   'ines.carvalho@exemplo.pt', '2026-10-12'),
  ('Exportar relatórios de vendas para Excel',              'aprovado',   'planeado',   'ines.carvalho@exemplo.pt', '2026-11-03'),
  ('Tema personalizado com as cores da empresa',            NULL,         'submetido',  'sofia.martins@exemplo.pt', '2026-10-02'),
  ('Tema personalizado com as cores da empresa',            'submetido',  'em_analise', 'ines.carvalho@exemplo.pt', '2026-10-03'),
  ('Tema personalizado com as cores da empresa',            'em_analise', 'rejeitado',  'ines.carvalho@exemplo.pt', '2026-10-16'),
  ('Exportar documentos para PDF com índice automático',    NULL,         'submetido',  'ines.carvalho@exemplo.pt', '2026-10-02'),
  ('Exportar documentos para PDF com índice automático',    'submetido',  'em_analise', 'joana.pires@exemplo.pt',   '2026-10-04'),
  ('Exportar documentos para PDF com índice automático',    'em_analise', 'aprovado',   'joana.pires@exemplo.pt',   '2026-10-11'),
  ('Exportar documentos para PDF com índice automático',    'aprovado',   'planeado',   'joana.pires@exemplo.pt',   '2026-11-09'),
  ('Modo offline no editor',                                NULL,         'submetido',  'ines.carvalho@exemplo.pt', '2026-10-28'),
  ('Modo offline no editor',                                'submetido',  'em_analise', 'joana.pires@exemplo.pt',   '2026-10-30'),
  ('Integração com Google Drive',                           NULL,         'submetido',  'ines.carvalho@exemplo.pt', '2026-09-03'),
  ('Integração com Google Drive',                           'submetido',  'em_analise', 'joana.pires@exemplo.pt',   '2026-09-05'),
  ('Integração com Google Drive',                           'em_analise', 'aprovado',   'joana.pires@exemplo.pt',   '2026-09-09'),
  ('Integração com Google Drive',                           'aprovado',   'planeado',   'joana.pires@exemplo.pt',   '2026-09-20'),
  ('Integração com Google Drive',                           'planeado',   'entregue',   'joana.pires@exemplo.pt',   '2026-10-27'),
  ('Partilhar notas por link público',                      NULL,         'submetido',  'ines.carvalho@exemplo.pt', '2026-09-14'),
  ('Partilhar notas por link público',                      'submetido',  'em_analise', 'miguel.santos@exemplo.pt', '2026-09-16'),
  ('Partilhar notas por link público',                      'em_analise', 'rejeitado',  'miguel.santos@exemplo.pt', '2026-09-22'),
  ('Etiquetas com cores personalizadas',                    NULL,         'submetido',  'ines.carvalho@exemplo.pt', '2026-11-12')
) AS c(title, from_status, to_status, email, changed_at)
JOIN feature_requests fr ON fr.title = c.title
JOIN users u             ON u.email = c.email;

-- Anexos
INSERT INTO attachments (request_id, uploaded_by, file_name, mime_type, size_bytes, storage_path)
SELECT fr.id, fr.author_id, a.file_name, a.mime_type, a.size_bytes, a.storage_path
FROM (VALUES
  ('Relatório de comissões por vendedor',                'modelo-comissoes.xlsx',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 48213,  'uploads/modelo-comissoes.xlsx'),
  ('Autenticação com chave de segurança',                'politica-seguranca.pdf', 'application/pdf',                                                   312904, 'uploads/politica-seguranca.pdf'),
  ('Exportar documentos para PDF com índice automático', 'exemplo-indice.pdf',     'application/pdf',                                                   95120,  'uploads/exemplo-indice.pdf'),
  ('Etiquetas com cores personalizadas',                 'paleta.png',             'image/png',                                                         20480,  'uploads/paleta.png')
) AS a(title, file_name, mime_type, size_bytes, storage_path)
JOIN feature_requests fr ON fr.title = a.title;

-- Versões
INSERT INTO request_versions (request_id, version_number, title, description, edited_by, created_at)
SELECT fr.id, 1, fr.title, 'Precisamos de um relatório de comissões.', fr.author_id, '2026-11-04'
FROM feature_requests fr
WHERE fr.title = 'Relatório de comissões por vendedor';

-- Etiquetas do Atlas CRM
INSERT INTO tags (product_id, name)
SELECT p.id, t.name
FROM (VALUES ('comissões'), ('email'), ('exportação')) AS t(name)
JOIN products p ON p.link_token = 'atl-7Q2KX9';

INSERT INTO request_tags (request_id, tag_id)
SELECT fr.id, t.id
FROM (VALUES
  ('Relatório de comissões por vendedor',                   'comissões'),
  ('Notificações por email quando um negócio muda de fase', 'email'),
  ('Exportar relatórios de vendas para Excel',              'exportação')
) AS rt(title, tag)
JOIN feature_requests fr ON fr.title = rt.title
JOIN tags t              ON t.product_id = fr.product_id AND t.name = rt.tag;

-- Funcionalidades do Atlas CRM
INSERT INTO features (product_id, request_id, team_id, assignee_id, release_id, title, status,
                      impact, effort, story_points, backlog_position, start_date, end_date)
SELECT p.id, fr.id, t.id, u.id, rel.id, f.title, f.status::feature_status,
       f.impact, f.effort, f.story_points, f.backlog_position, f.start_date::date, f.end_date::date
FROM (VALUES
  ('Exportação de relatórios para Excel', 'Exportar relatórios de vendas para Excel',              'Core',     'rui.matos@exemplo.pt',      'v3.0', 'em_curso',   8,    3,    8,    1,    '2026-10-12', '2026-11-28'),
  ('Notificações por email',              'Notificações por email quando um negócio muda de fase', 'Growth',   'miguel.santos@exemplo.pt',  'v3.0', 'em_revisao', 7,    3,    5,    2,    '2026-10-05', '2026-11-20'),
  ('API de exportação de dados',          NULL,                                                    'Core',     'tiago.ferreira@exemplo.pt', 'v3.0', 'em_curso',   7,    5,    13,   3,    '2026-10-01', '2026-11-10'),
  ('Painel de previsão de vendas',        NULL,                                                    'Core',     'beatriz.costa@exemplo.pt',  'v3.1', 'em_curso',   9,    7,    13,   4,    '2027-01-18', '2027-02-28'),
  ('Faturação recorrente',                NULL,                                                    'Payments', 'daniel.rocha@exemplo.pt',   'v3.1', 'por_fazer',  9,    8,    21,   5,    '2027-01-04', '2027-02-20'),
  ('Relatório de comissões por vendedor', 'Relatório de comissões por vendedor',                   NULL,       NULL,                        NULL,   'por_fazer',  6,    4,    8,    6,    NULL,         NULL),
  ('Filtros guardados nas listas',        NULL,                                                    'Growth',   'ines.carvalho@exemplo.pt',  NULL,   'por_fazer',  5,    2,    3,    7,    NULL,         NULL),
  ('Aplicação móvel offline',             NULL,                                                    NULL,       NULL,                        'v3.2', 'por_fazer',  8,    9,    34,   8,    '2027-03-01', '2027-04-20'),
  ('Assistente de email com IA',          NULL,                                                    NULL,       NULL,                        'v3.2', 'por_fazer',  6,    8,    21,   9,    '2027-03-15', '2027-04-30'),
  ('Ordenar listas por data de atualização', NULL,                                                 'Growth',   'ines.carvalho@exemplo.pt',  NULL,   'por_fazer',  NULL, NULL, 2,    NULL, NULL,         NULL),
  ('Pesquisa global',                     NULL,                                                    'Core',     'rui.matos@exemplo.pt',      NULL,   'concluido',  NULL, NULL, 8,    NULL, NULL,         NULL),
  ('Histórico de atividade do cliente',   NULL,                                                    'Growth',   'miguel.santos@exemplo.pt',  NULL,   'concluido',  NULL, NULL, 5,    NULL, NULL,         NULL),
  ('Importar contactos a partir de CSV',  NULL,                                                    NULL,       NULL,                        'v2.5', 'concluido',  NULL, NULL, NULL, NULL, '2026-08-20', '2026-09-10'),
  ('Modo escuro',                         NULL,                                                    NULL,       NULL,                        'v2.5', 'concluido',  NULL, NULL, NULL, NULL, '2026-09-01', '2026-09-30')
) AS f(title, request_title, team, assignee_email, release, status, impact, effort, story_points, backlog_position, start_date, end_date)
JOIN products p ON p.link_token = 'atl-7Q2KX9'
LEFT JOIN feature_requests fr ON fr.product_id = p.id AND fr.title = f.request_title
LEFT JOIN teams t             ON t.product_id = p.id AND t.name = f.team
LEFT JOIN users u             ON u.email = f.assignee_email
LEFT JOIN releases rel        ON rel.product_id = p.id AND rel.name = f.release;

-- Histórico de estados da F-305
INSERT INTO feature_status_changes (feature_id, from_status, to_status, changed_by, changed_at)
SELECT f.id, c.from_status::feature_status, c.to_status::feature_status, u.id, c.changed_at::timestamptz
FROM (VALUES
  (NULL,        'por_fazer', 'tiago.ferreira@exemplo.pt', '2026-11-02'),
  ('por_fazer', 'em_curso',  'rui.matos@exemplo.pt',      '2026-11-06')
) AS c(from_status, to_status, email, changed_at)
JOIN features f ON f.title = 'Exportação de relatórios para Excel'
JOIN users u    ON u.email = c.email;

-- User Stories
INSERT INTO user_stories (feature_id, role, goal, benefit, state, ai_generated, created_by)
SELECT f.id, s.role, s.goal, s.benefit, s.state::story_state, s.ai_generated, u.id
FROM (VALUES
  ('Exportação de relatórios para Excel', 'gestor comercial',        'exportar qualquer relatório de vendas para Excel mantendo os filtros', 'partilhar os números com a direção sem copiar dados à mão', 'confirmada', false),
  ('Notificações por email',              'gestor de conta',         'receber um email quando um negócio muda de fase',                     'reagir sem ter de abrir a aplicação',                        'confirmada', false),
  ('API de exportação de dados',          'integrador',              'obter os dados de vendas por API',                                    'os levar para o sistema de faturação da empresa',            'confirmada', false),
  ('Painel de previsão de vendas',        'diretor comercial',       'ver a previsão de vendas do trimestre',                               'ajustar as metas da equipa a tempo',                         'confirmada', false),
  ('Faturação recorrente',                'responsável financeiro',  'emitir faturas mensais automaticamente',                              'não ter de as criar uma a uma',                              'rascunho',   true),
  ('Filtros guardados nas listas',        'vendedor',                'guardar os filtros que uso todos os dias',                            'abrir a minha lista de trabalho num clique',                 'confirmada', false)
) AS s(feature_title, role, goal, benefit, state, ai_generated)
JOIN features f ON f.title = s.feature_title
JOIN users u    ON u.email = 'ines.carvalho@exemplo.pt';

-- Critérios de aceitação da F-305
INSERT INTO acceptance_criteria (story_id, position, text, created_by)
SELECT us.id, c.position, c.text, us.created_by
FROM (VALUES
  (1, 'Dado um relatório com filtros, quando exporto, então o ficheiro .xlsx contém apenas as linhas filtradas.'),
  (2, 'Dado um relatório com mais de 50 000 linhas, quando exporto, então recebo o ficheiro por email.'),
  (3, 'Dado que não tenho permissão de exportação, quando abro o relatório, então o botão de exportar não aparece.')
) AS c(position, text)
JOIN features f      ON f.title = 'Exportação de relatórios para Excel'
JOIN user_stories us ON us.feature_id = f.id;