INSERT INTO sprints (product_id, name, goal, start_date, end_date, capacity)
SELECT p.id, s.name, s.goal, CURRENT_DATE + s.start_offset, CURRENT_DATE + s.end_offset, s.capacity
FROM (VALUES
  ('Sprint 13', 'Pesquisa global e histórico do cliente', -21, -8, 40),
  ('Sprint 14', 'Exportações e notificações por email',   -7,  6, 40),
  ('Sprint 15', 'Faturação recorrente',                    7, 20, 40)
) AS s(name, goal, start_offset, end_offset, capacity)
JOIN products p ON p.link_token = 'atl-7Q2KX9';

UPDATE features f
SET sprint_id = s.id
FROM (VALUES
  ('Pesquisa global',                     'Sprint 13'),
  ('Histórico de atividade do cliente',   'Sprint 13'),
  ('Exportação de relatórios para Excel', 'Sprint 14'),
  ('Notificações por email',              'Sprint 14'),
  ('API de exportação de dados',          'Sprint 14'),
  ('Painel de previsão de vendas',        'Sprint 14'),
  ('Faturação recorrente',                'Sprint 15')
) AS a(feature_title, sprint_name)
JOIN products p ON p.link_token = 'atl-7Q2KX9'
JOIN sprints s ON s.product_id = p.id AND s.name = a.sprint_name
WHERE f.product_id = p.id AND f.title = a.feature_title;