-- 01_users_products.sql: utilizadores e produtos (dados do mockData.js)
-- Password de todos os utilizadores de teste: password123

TRUNCATE users, products RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password_hash) VALUES
  ('Inês Carvalho',  'ines.carvalho@exemplo.pt',  '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Rui Matos',      'rui.matos@exemplo.pt',      '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Beatriz Costa',  'beatriz.costa@exemplo.pt',  '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Tiago Ferreira', 'tiago.ferreira@exemplo.pt', '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Daniel Rocha',   'daniel.rocha@exemplo.pt',   '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Leonor Almeida', 'leonor.almeida@exemplo.pt', '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Miguel Santos',  'miguel.santos@exemplo.pt',  '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Joana Pires',    'joana.pires@exemplo.pt',    '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Marta Lopes',    'marta.lopes@exemplo.pt',    '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('João Pires',     'joao.pires@exemplo.pt',     '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Ana Ribeiro',    'ana.ribeiro@exemplo.pt',    '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i'),
  ('Carlos Mendes',  'carlos.mendes@exemplo.pt',  '$2a$10$EGYcK8rwEhXO4H85scpPx..2Hu6MVaqdkZ1iFu74D2v9r/QxeCm2i');

INSERT INTO products (name, description, color, link_token) VALUES
  ('Atlas CRM',    'CRM para equipas comerciais de PME.',              'stream', 'atl-7Q2KX9'),
  ('Nimbus Pay',   'Pagamentos e faturação para lojas online.',        'teal',   'nmb-4HD81L'),
  ('Orbit Mobile', 'Aplicação móvel de gestão de equipas no terreno.', 'grape',  'orb-9PZ3TA'),
  ('Lumen Docs',   'Editor de documentos colaborativo.',               'orange', 'lmn-2WQ7RB'),
  ('Fieldnote',    'Notas de campo para equipas técnicas.',            'lime',   'fdn-6KM4PE');

-- Membros
INSERT INTO product_members (product_id, user_id, role)
SELECT p.id, u.id, m.role::member_role
FROM (VALUES
  -- Atlas CRM
  ('atl-7Q2KX9', 'ines.carvalho@exemplo.pt',  'product_manager'),
  ('atl-7Q2KX9', 'tiago.ferreira@exemplo.pt', 'project_manager'),
  ('atl-7Q2KX9', 'rui.matos@exemplo.pt',      'developer'),
  ('atl-7Q2KX9', 'beatriz.costa@exemplo.pt',  'developer'),
  ('atl-7Q2KX9', 'daniel.rocha@exemplo.pt',   'developer'),
  ('atl-7Q2KX9', 'leonor.almeida@exemplo.pt', 'developer'),
  ('atl-7Q2KX9', 'miguel.santos@exemplo.pt',  'developer'),
  ('atl-7Q2KX9', 'joana.pires@exemplo.pt',    'developer'),
  ('atl-7Q2KX9', 'marta.lopes@exemplo.pt',    'customer'),
  ('atl-7Q2KX9', 'joao.pires@exemplo.pt',     'customer'),
  ('atl-7Q2KX9', 'ana.ribeiro@exemplo.pt',    'customer'),
  ('atl-7Q2KX9', 'carlos.mendes@exemplo.pt',  'customer'),
  -- Nimbus Pay
  ('nmb-4HD81L', 'tiago.ferreira@exemplo.pt', 'product_manager'),
  ('nmb-4HD81L', 'ines.carvalho@exemplo.pt',  'project_manager'),
  ('nmb-4HD81L', 'daniel.rocha@exemplo.pt',   'developer'),
  ('nmb-4HD81L', 'leonor.almeida@exemplo.pt', 'developer'),
  -- Orbit Mobile
  ('orb-9PZ3TA', 'beatriz.costa@exemplo.pt',  'product_manager'),
  ('orb-9PZ3TA', 'miguel.santos@exemplo.pt',  'project_manager'),
  ('orb-9PZ3TA', 'ines.carvalho@exemplo.pt',  'developer'),
  ('orb-9PZ3TA', 'joana.pires@exemplo.pt',    'developer'),
  -- Lumen Docs e Fieldnote
  ('lmn-2WQ7RB', 'joana.pires@exemplo.pt',    'product_manager'),
  ('lmn-2WQ7RB', 'ines.carvalho@exemplo.pt',  'customer'),
  ('fdn-6KM4PE', 'miguel.santos@exemplo.pt',  'product_manager'),
  ('fdn-6KM4PE', 'ines.carvalho@exemplo.pt',  'customer')
) AS m(link_token, email, role)
JOIN products p ON p.link_token = m.link_token
JOIN users u    ON u.email = m.email;