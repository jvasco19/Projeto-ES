-- 03_votes.sql: votos dos clientes do Atlas CRM em pedidos públicos de outros clientes

INSERT INTO request_votes (request_id, user_id)
SELECT r.id, u.id
FROM (VALUES
  ('atl-7Q2KX9', 'Relatório de comissões por vendedor',                   'joao.pires@exemplo.pt'),
  ('atl-7Q2KX9', 'Relatório de comissões por vendedor',                   'ana.ribeiro@exemplo.pt'),
  ('atl-7Q2KX9', 'Relatório de comissões por vendedor',                   'carlos.mendes@exemplo.pt'),
  ('atl-7Q2KX9', 'Relatório mensal de desempenho por vendedor',           'marta.lopes@exemplo.pt'),
  ('atl-7Q2KX9', 'Relatório mensal de desempenho por vendedor',           'pedro.nunes@exemplo.pt'),
  ('atl-7Q2KX9', 'Autenticação com chave de segurança',                   'carlos.mendes@exemplo.pt'),
  ('atl-7Q2KX9', 'Sincronizar contactos com o Outlook',                   'rita.sousa@exemplo.pt'),
  ('atl-7Q2KX9', 'Sincronizar contactos com o Outlook',                   'marta.lopes@exemplo.pt'),
  ('atl-7Q2KX9', 'Notificações por email quando um negócio muda de fase', 'ana.ribeiro@exemplo.pt'),
  ('atl-7Q2KX9', 'Notificações por email quando um negócio muda de fase', 'joao.pires@exemplo.pt'),
  ('atl-7Q2KX9', 'Notificações por email quando um negócio muda de fase', 'carlos.mendes@exemplo.pt'),
  ('atl-7Q2KX9', 'Notificações por email quando um negócio muda de fase', 'sofia.martins@exemplo.pt'),
  ('atl-7Q2KX9', 'Exportar relatórios de vendas para Excel',              'marta.lopes@exemplo.pt'),
  ('atl-7Q2KX9', 'Exportar relatórios de vendas para Excel',              'rita.sousa@exemplo.pt')
) AS v(link_token, title, email)
JOIN products p ON p.link_token = v.link_token
JOIN feature_requests r ON r.product_id = p.id AND r.title = v.title
JOIN users u ON u.email = v.email;
