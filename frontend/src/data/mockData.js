// DADOS DE EXEMPLO 

// Utilizador com sessao iniciada
export const user = {
  id: 'm6',
  name: 'Inês Carvalho',
  email: 'ines.carvalho@exemplo.pt',
  initials: 'IC',
}

// Produtos de que o utilizador é membro
export const products = [
  { id: 'atlas', name: 'Atlas CRM', role: 'product_manager', color: 'stream', linkToken: 'atl-7Q2KX9', members: 8, description: 'CRM para equipas comerciais de PME.' },
  { id: 'nimbus', name: 'Nimbus Pay', role: 'project_manager', color: 'teal', linkToken: 'nmb-4HD81L', members: 8, description: 'Pagamentos e faturação para lojas online.' },
  { id: 'orbit', name: 'Orbit Mobile', role: 'developer', color: 'grape', linkToken: 'orb-9PZ3TA', members: 8, description: 'Aplicação móvel de gestão de equipas no terreno.' },
]

// Produtos de outras empresas a que o utilizador enviou pedidos
export const customerProducts = [
  { id: 'lumen', name: 'Lumen Docs', company: 'Lumen Software', linkToken: 'lmn-2WQ7RB' },
  { id: 'fieldnote', name: 'Fieldnote', company: 'Fieldnote Lda.', linkToken: 'fdn-6KM4PE' },
]

// Área pessoal pedidos submetidos pelo utilizador
// status: 'submetido' | 'em_analise' | 'aprovado' | 'planeado' | 'entregue' | 'rejeitado'
export const myRequests = [
  {
    id: 'R-1042',
    productId: 'lumen',
    productName: 'Lumen Docs',
    title: 'Exportar documentos para PDF com índice automático',
    description: 'Ao exportar um documento longo para PDF, gostava que fosse gerado um índice com ligações para cada secção.',
    status: 'planeado',
    submittedAt: '2 out 2026',
    updatedAt: '9 nov 2026',
    votes: 38,
    release: 'v3.2 · previsto para dezembro 2026',
    attachments: ['exemplo-indice.pdf'],
    timeline: [
      { status: 'submetido', date: '2 out 2026' },
      { status: 'em_analise', date: '4 out 2026' },
      { status: 'aprovado', date: '11 out 2026' },
      { status: 'planeado', date: '9 nov 2026' },
      { status: 'entregue', date: null },
    ],
  },
  {
    id: 'R-1051',
    productId: 'lumen',
    productName: 'Lumen Docs',
    title: 'Modo offline no editor',
    description: 'Poder continuar a editar quando a ligação à internet falha e sincronizar depois.',
    status: 'em_analise',
    submittedAt: '28 out 2026',
    updatedAt: '30 out 2026',
    votes: 12,
    attachments: [],
    timeline: [
      { status: 'submetido', date: '28 out 2026' },
      { status: 'em_analise', date: '30 out 2026' },
      { status: 'aprovado', date: null },
      { status: 'planeado', date: null },
      { status: 'entregue', date: null },
    ],
  },
  {
    id: 'R-1033',
    productId: 'lumen',
    productName: 'Lumen Docs',
    title: 'Integração com Google Drive',
    description: 'Importar e guardar documentos diretamente numa pasta do Google Drive.',
    status: 'entregue',
    submittedAt: '3 set 2026',
    updatedAt: '27 out 2026',
    votes: 64,
    release: 'v3.0 · entregue a 27 out 2026',
    attachments: [],
    timeline: [
      { status: 'submetido', date: '3 set 2026' },
      { status: 'em_analise', date: '5 set 2026' },
      { status: 'aprovado', date: '9 set 2026' },
      { status: 'planeado', date: '20 set 2026' },
      { status: 'entregue', date: '27 out 2026' },
    ],
  },
  {
    id: 'R-0987',
    productId: 'fieldnote',
    productName: 'Fieldnote',
    title: 'Partilhar notas por link público',
    description: 'Gerar um link que qualquer pessoa possa abrir sem conta.',
    status: 'rejeitado',
    submittedAt: '14 set 2026',
    updatedAt: '22 set 2026',
    votes: 7,
    rejectionReason:
      'Por razões de privacidade, as notas só podem ser partilhadas com contas da mesma organização. Vamos permitir convites por email na versão 4.1.',
    attachments: [],
    timeline: [
      { status: 'submetido', date: '14 set 2026' },
      { status: 'em_analise', date: '16 set 2026' },
      { status: 'rejeitado', date: '22 set 2026' },
    ],
  },
  {
    id: 'R-1060',
    productId: 'fieldnote',
    productName: 'Fieldnote',
    title: 'Etiquetas com cores personalizadas',
    description: 'Escolher a cor de cada etiqueta para distinguir projetos rapidamente.',
    status: 'submetido',
    submittedAt: '12 nov 2026',
    updatedAt: '12 nov 2026',
    votes: 1,
    attachments: ['paleta.png'],
    timeline: [
      { status: 'submetido', date: '12 nov 2026' },
      { status: 'em_analise', date: null },
      { status: 'aprovado', date: null },
      { status: 'planeado', date: null },
      { status: 'entregue', date: null },
    ],
  },
]

export const myRequestStats = { total: 5, emAnalise: 2, planeados: 1, entregues: 1, rejeitados: 1 }

// --- Pedidos públicos de um produto (pesquisa e votação antes de submeter) ----
export const publicRequests = [
  { id: 'R-2190', title: 'Exportar relatórios de vendas para Excel', votes: 41, status: 'planeado', votedByMe: false },
  { id: 'R-2201', title: 'Notificações por email quando um negócio muda de fase', votes: 23, status: 'aprovado', votedByMe: false },
  { id: 'R-2176', title: 'Importar contactos a partir de CSV', votes: 57, status: 'entregue', votedByMe: true },
  { id: 'R-2208', title: 'Filtro de pesquisa por região', votes: 9, status: 'em_analise', votedByMe: false },
  { id: 'R-2215', title: 'Relatório mensal de desempenho por vendedor', votes: 15, status: 'em_analise', votedByMe: false },
  { id: 'R-2163', title: 'Modo escuro na aplicação', votes: 33, status: 'entregue', votedByMe: false },
]

export const requestCategories = ['Relatórios', 'Integrações', 'Notificações', 'Usabilidade', 'Desempenho', 'Segurança']

// --- Roadmap visto pelo customer (sem dados internos) -------------------------
export const customerRoadmap = {
  curto: [
    { title: 'Exportar relatórios para Excel', release: 'v3.0' },
    { title: 'Notificações por email em mudanças de fase', release: 'v3.0' },
  ],
  medio: [
    { title: 'Faturação recorrente', release: 'v3.1' },
    { title: 'Painel de previsão de vendas', release: 'v3.1' },
  ],
  longo: [
    { title: 'Aplicação móvel offline', release: 'v3.2' },
    { title: 'Assistente de email com IA', release: 'v3.2' },
  ],
  concluido: [
    { title: 'Importar contactos a partir de CSV', release: 'v2.5' },
    { title: 'Modo escuro', release: 'v2.5' },
    { title: 'Integração com Google Calendar', release: 'v2.4' },
  ],
}

// --- Notificações -------------------------------------------------------------
// type: 'mention' | 'requirement' | 'risk' | 'stale' | 'status'
export const notifications = [
  { id: 'n1', type: 'risk', title: 'Milestone "Lançamento B2B" em risco', detail: 'Atlas CRM · ritmo atual abaixo do necessário', time: 'há 20 min', read: false, link: '/p/atlas/roadmap' },
  { id: 'n2', type: 'mention', title: 'Rui Matos mencionou-te em F-305', detail: '"@Inês o limite de linhas aplica-se por folha ou por ficheiro?"', time: 'há 1 h', read: false, link: '/p/atlas/funcionalidades/F-305' },
  { id: 'n3', type: 'stale', title: 'Pedido R-2214 parado há 9 dias', detail: 'Atlas CRM · estado "Em análise" · limite de 7 dias', time: 'há 3 h', read: false, link: '/p/atlas/pedidos?pedido=R-2214' },
  { id: 'n4', type: 'requirement', title: 'Requisitos de F-412 alterados', detail: 'Orbit Mobile · novo critério de aceitação adicionado', time: 'ontem', read: true, link: '/p/orbit/funcionalidades/F-412' },
  { id: 'n5', type: 'status', title: 'O teu pedido R-1042 foi planeado', detail: 'Lumen Docs · release v3.2', time: '9 nov', read: true, link: '/me/pedidos/R-1042' },
]

// =============================================================================
// DADOS DE PRODUTO (iguais para todos os produtos nesta fase)
// =============================================================================

export const overview = {
  kpis: {
    requestsReceived: 128,
    requestsDelta: '+18 este mês',
    inAnalysis: 9,
    roadmapProgress: 62,
    velocityAvg: 34,
    activeSprint: 'Sprint 14',
    sprintDaysLeft: 6,
    sprintProgress: 55,
  },
  alerts: [
    { id: 'a1', type: 'risk', title: 'Milestone "Lançamento B2B" em risco', detail: 'Ritmo atual de 28 pontos por sprint; são precisos 36 para cumprir 15 dez.', action: 'Ver roadmap', link: 'roadmap' },
    { id: 'a2', type: 'stale', title: 'Pedido R-2214 parado há 9 dias em "Em análise"', detail: 'O limite definido para este estado é de 7 dias.', action: 'Analisar pedido', link: 'pedidos?pedido=R-2214' },
  ],
  featureProgress: [
    { id: 'F-305', title: 'Exportação de relatórios para Excel', assignee: 'm1', progress: 70, status: 'em_curso' },
    { id: 'F-302', title: 'API de exportação de dados', assignee: 'm3', progress: 45, status: 'em_curso', late: true },
    { id: 'F-298', title: 'Notificações por email', assignee: 'm7', progress: 90, status: 'em_revisao' },
    { id: 'F-311', title: 'Painel de previsão de vendas', assignee: 'm2', progress: 20, status: 'em_curso' },
    { id: 'F-308', title: 'Faturação recorrente', assignee: 'm4', progress: 0, status: 'por_fazer' },
  ],
}

export const metrics = {
  velocity: [
    { sprint: 'Sprint 9', planeado: 32, concluido: 30 },
    { sprint: 'Sprint 10', planeado: 34, concluido: 31 },
    { sprint: 'Sprint 11', planeado: 36, concluido: 36 },
    { sprint: 'Sprint 12', planeado: 38, concluido: 33 },
    { sprint: 'Sprint 13', planeado: 36, concluido: 35 },
    { sprint: 'Sprint 14', planeado: 36, concluido: 20 },
  ],
  burndown: [
    { dia: '2 nov', ideal: 36, real: 36 },
    { dia: '3 nov', ideal: 32, real: 36 },
    { dia: '4 nov', ideal: 29, real: 33 },
    { dia: '5 nov', ideal: 25, real: 30 },
    { dia: '6 nov', ideal: 22, real: 27 },
    { dia: '9 nov', ideal: 18, real: 24 },
    { dia: '10 nov', ideal: 14, real: 19 },
    { dia: '11 nov', ideal: 11, real: 16 },
    { dia: '12 nov', ideal: 7, real: null },
    { dia: '13 nov', ideal: 4, real: null },
    { dia: '16 nov', ideal: 0, real: null },
  ],
  // Pedidos por período (aprovados vs rejeitados). '7d' vazio para mostrar o estado sem dados.
  requestsByPeriod: {
    '7d': [],
    '3m': [
      { mes: 'Set', recebidos: 34, aprovados: 19, rejeitados: 8 },
      { mes: 'Out', recebidos: 41, aprovados: 22, rejeitados: 11 },
      { mes: 'Nov', recebidos: 18, aprovados: 9, rejeitados: 4 },
    ],
    '6m': [
      { mes: 'Jun', recebidos: 12, aprovados: 7, rejeitados: 3 },
      { mes: 'Jul', recebidos: 9, aprovados: 5, rejeitados: 2 },
      { mes: 'Ago', recebidos: 14, aprovados: 8, rejeitados: 5 },
      { mes: 'Set', recebidos: 34, aprovados: 19, rejeitados: 8 },
      { mes: 'Out', recebidos: 41, aprovados: 22, rejeitados: 11 },
      { mes: 'Nov', recebidos: 18, aprovados: 9, rejeitados: 4 },
    ],
  },
  requestOrigin: [
    { name: 'Link do produto (clientes)', value: 104, color: 'stream.6' },
    { name: 'Criados pela equipa', value: 24, color: 'gray.5' },
  ],
  avgResponseTime: '2,4 dias',
  conversionRate: 31,
  leadCycle: [
    { id: 'F-276', title: 'Importar contactos a partir de CSV', lead: 34, cycle: 11, state: 'entregue' },
    { id: 'F-281', title: 'Modo escuro', lead: 27, cycle: 8, state: 'entregue' },
    { id: 'F-289', title: 'Integração com Google Calendar', lead: 41, cycle: 15, state: 'entregue' },
    { id: 'F-298', title: 'Notificações por email', lead: null, cycle: 9, state: 'em_curso' },
    { id: 'F-308', title: 'Faturação recorrente', lead: null, cycle: null, state: 'nao_iniciado' },
  ],
  avgLeadTime: '34 dias',
  avgCycleTime: '11 dias',
  workload: [
    { team: 'Core', atribuido: 38, capacidade: 40 },
    { team: 'Payments', atribuido: 34, capacidade: 34 },
    { team: 'Growth', atribuido: 18, capacidade: 30 },
  ],
  featuresPerRelease: [
    { release: 'v2.3', funcionalidades: 7 },
    { release: 'v2.4', funcionalidades: 9 },
    { release: 'v2.5', funcionalidades: 11 },
    { release: 'v3.0', funcionalidades: 8 },
  ],
}

// --- Triagem de pedidos (Product Manager) ------------------------------------
export const triageRequests = [
  {
    id: 'R-2214', title: 'Relatório de comissões por vendedor', customer: 'Marta Lopes', company: 'Hotelaria Sol',
    submittedAt: '4 nov 2026', status: 'em_analise', daysInState: 9, category: 'Relatórios', tags: ['comissões'], votes: 18, public: true,
    description: 'Precisamos de um relatório mensal com as comissões de cada vendedor, calculadas a partir dos negócios fechados.',
    attachments: ['modelo-comissoes.xlsx'],
    versions: [{ version: 1, date: '4 nov 2026', author: 'Marta Lopes', text: 'Precisamos de um relatório de comissões.' }],
  },
  {
    id: 'R-2215', title: 'Relatório mensal de desempenho por vendedor', customer: 'João Pires', company: 'Pires & Filhos',
    submittedAt: '6 nov 2026', status: 'em_analise', daysInState: 7, category: 'Relatórios', tags: [], votes: 15, public: true,
    description: 'Ver num único ecrã o número de negócios, valor e taxa de conversão de cada vendedor.',
    attachments: [], versions: [],
  },
  {
    id: 'R-2220', title: 'Autenticação com chave de segurança', customer: 'Ana Ribeiro', company: 'Banco Atlântico',
    submittedAt: '10 nov 2026', status: 'submetido', daysInState: 3, category: 'Segurança', tags: [], votes: 4, public: true,
    description: 'Permitir login com chaves FIDO2 para cumprir a nossa política interna.',
    attachments: ['politica-seguranca.pdf'], versions: [],
  },
  {
    id: 'R-2222', title: 'Sincronizar contactos com o Outlook', customer: 'Pedro Nunes', company: 'Nunes Imobiliária',
    submittedAt: '12 nov 2026', status: 'submetido', daysInState: 1, category: 'Integrações', tags: [], votes: 2, public: true,
    description: 'Os contactos criados no Atlas deviam aparecer automaticamente no Outlook.',
    attachments: [], versions: [],
  },
  {
    id: 'R-2201', title: 'Notificações por email quando um negócio muda de fase', customer: 'Rita Sousa', company: 'Clínica Horizonte',
    submittedAt: '20 out 2026', status: 'aprovado', daysInState: 5, category: 'Notificações', tags: ['email'], votes: 23, public: true,
    description: 'Receber um email sempre que um negócio passa para "Proposta enviada" ou "Fechado".',
    attachments: [], versions: [], featureId: 'F-298',
  },
  {
    id: 'R-2190', title: 'Exportar relatórios de vendas para Excel', customer: 'Carlos Mendes', company: 'Mendes Distribuição',
    submittedAt: '8 out 2026', status: 'planeado', daysInState: 12, category: 'Relatórios', tags: ['exportação'], votes: 41, public: true,
    description: 'Exportar qualquer relatório para .xlsx mantendo os filtros aplicados.',
    attachments: [], versions: [], featureId: 'F-305',
  },
  {
    id: 'R-2185', title: 'Tema personalizado com as cores da empresa', customer: 'Sofia Martins', company: 'Studio Martins',
    submittedAt: '2 out 2026', status: 'rejeitado', daysInState: 30, category: 'Usabilidade', tags: [], votes: 6, public: false,
    description: 'Mudar as cores da aplicação para as cores da nossa marca.',
    rejectionReason: 'Fora do âmbito do roadmap deste ano.', attachments: [], versions: [],
  },
]

// --- Product Backlog ----------------------------------------------------------
// score: prioridade já calculada (placeholder). status: 'por_fazer' | 'em_curso' | 'em_revisao' | 'concluido'
export const backlog = [
  { id: 'F-305', title: 'Exportação de relatórios para Excel', impact: 8, effort: 3, score: 27, votes: 41, storyPoints: 8, status: 'em_curso', team: 'Core', release: 'v3.0', sprint: 'Sprint 14', requestId: 'R-2190', hasStory: true },
  { id: 'F-298', title: 'Notificações por email', impact: 7, effort: 3, score: 23, votes: 23, storyPoints: 5, status: 'em_revisao', team: 'Growth', release: 'v3.0', sprint: 'Sprint 14', requestId: 'R-2201', hasStory: true },
  { id: 'F-302', title: 'API de exportação de dados', impact: 7, effort: 5, score: 14, votes: 12, storyPoints: 13, status: 'em_curso', team: 'Core', release: 'v3.0', sprint: 'Sprint 14', requestId: null, hasStory: true },
  { id: 'F-311', title: 'Painel de previsão de vendas', impact: 9, effort: 7, score: 13, votes: 30, storyPoints: 13, status: 'em_curso', team: 'Core', release: 'v3.1', sprint: 'Sprint 14', requestId: null, hasStory: true },
  { id: 'F-308', title: 'Faturação recorrente', impact: 9, effort: 8, score: 11, votes: 19, storyPoints: 21, status: 'por_fazer', team: 'Payments', release: 'v3.1', sprint: null, requestId: null, hasStory: true },
  { id: 'F-314', title: 'Relatório de comissões por vendedor', assignee: null, impact: 6, effort: 4, score: 15, votes: 18, storyPoints: 8, status: 'por_fazer', team: null, release: null, sprint: null, requestId: 'R-2214', hasStory: false },
  { id: 'F-315', title: 'Filtros guardados nas listas', assignee: 'm6', impact: 5, effort: 2, score: 25, votes: 9, storyPoints: 3, status: 'por_fazer', team: 'Growth', release: null, sprint: null, requestId: null, hasStory: true },
  { id: 'F-316', title: 'Aplicação móvel offline', assignee: null, impact: 8, effort: 9, score: 9, votes: 27, storyPoints: 34, status: 'por_fazer', team: null, release: 'v3.2', sprint: null, requestId: null, hasStory: false },
  { id: 'F-317', title: 'Assistente de email com IA', assignee: null, impact: 6, effort: 8, score: 8, votes: 14, storyPoints: 21, status: 'por_fazer', team: null, release: 'v3.2', sprint: null, requestId: null, hasStory: false },
]

// Sugestão de priorização (placeholder da resposta do serviço de IA)
export const aiPrioritySuggestion = [
  { id: 'F-305', reason: 'Impacto 8 com esforço 3 e o maior número de votos (41). Já está em desenvolvimento.' },
  { id: 'F-315', reason: 'Esforço muito baixo (2): ganho rápido que reduz pedidos de suporte.' },
  { id: 'F-298', reason: 'Quase concluída e pedida por 23 clientes.' },
  { id: 'F-314', reason: 'Pedido recente com 18 votos e esforço moderado.' },
  { id: 'F-302', reason: 'Bloqueia F-305 e F-311; atrasar aumenta o risco da milestone.' },
  { id: 'F-311', reason: 'Impacto máximo, mas esforço alto. Avançar depois de F-302.' },
  { id: 'F-308', reason: 'Impacto alto mas esforço 8; dividir em partes menores.' },
  { id: 'F-316', reason: 'Esforço 9 e dependências técnicas ainda por resolver.' },
  { id: 'F-317', reason: 'Menor relação impacto/esforço do backlog.' },
]

// --- Equipas -----------------------------------------------------------------
export const teams = [
  {
    id: 'core', name: 'Core', capacity: 40, load: 38,
    members: [
      { id: 'm1', name: 'Rui Matos', initials: 'RM', role: 'developer' },
      { id: 'm2', name: 'Beatriz Costa', initials: 'BC', role: 'developer' },
      { id: 'm3', name: 'Tiago Ferreira', initials: 'TF', role: 'project_manager' },
    ],
  },
  {
    id: 'payments', name: 'Payments', capacity: 34, load: 34,
    members: [
      { id: 'm4', name: 'Daniel Rocha', initials: 'DR', role: 'developer' },
      { id: 'm5', name: 'Leonor Almeida', initials: 'LA', role: 'developer' },
    ],
  },
  {
    id: 'growth', name: 'Growth', capacity: 30, load: 18,
    members: [
      { id: 'm6', name: 'Inês Carvalho', initials: 'IC', role: 'product_manager' },
      { id: 'm7', name: 'Miguel Santos', initials: 'MS', role: 'developer' },
    ],
  },
]

// Membros do produto (o papel é por produto)
export const productMembers = [
  { id: 'm1', name: 'Rui Matos', initials: 'RM', email: 'rui.matos@exemplo.pt', role: 'developer', team: 'Core' },
  { id: 'm2', name: 'Beatriz Costa', initials: 'BC', email: 'beatriz.costa@exemplo.pt', role: 'developer', team: 'Core' },
  { id: 'm3', name: 'Tiago Ferreira', initials: 'TF', email: 'tiago.ferreira@exemplo.pt', role: 'project_manager', team: 'Core' },
  { id: 'm4', name: 'Daniel Rocha', initials: 'DR', email: 'daniel.rocha@exemplo.pt', role: 'developer', team: 'Payments' },
  { id: 'm5', name: 'Leonor Almeida', initials: 'LA', email: 'leonor.almeida@exemplo.pt', role: 'developer', team: 'Payments' },
  { id: 'm6', name: 'Inês Carvalho', initials: 'IC', email: 'ines.carvalho@exemplo.pt', role: 'product_manager', team: 'Growth' },
  { id: 'm7', name: 'Miguel Santos', initials: 'MS', email: 'miguel.santos@exemplo.pt', role: 'developer', team: 'Growth' },
  { id: 'm8', name: 'Joana Pires', initials: 'JP', email: 'joana.pires@exemplo.pt', role: 'developer', team: null },
]

export const pendingInvites = [{ email: 'sara.gomes@exemplo.pt', role: 'developer', team: 'Growth', sentAt: '12 nov 2026' }]

// --- Sprints -----------------------------------------------------------------
export const sprints = {
  active: { name: 'Sprint 14', start: '2 nov', end: '16 nov', capacity: 40, committed: 36, goal: 'Fechar as exportações para a v3.0' },
  next: { name: 'Sprint 15', start: '16 nov', end: '30 nov', capacity: 40, committed: 34 },
  // Equipa do utilizador no board (para validar quem pode mover cartões)
  myTeam: 'Growth',
}

export const boardItems = [
  { id: 'F-308', title: 'Faturação recorrente', status: 'por_fazer', team: 'Payments', storyPoints: 21, assignee: 'm4' },
  { id: 'F-318', title: 'Ordenar listas por data de atualização', status: 'por_fazer', team: 'Growth', storyPoints: 2, assignee: 'm6' },
  { id: 'F-305', title: 'Exportação de relatórios para Excel', status: 'em_curso', team: 'Core', storyPoints: 8, assignee: 'm1' },
  { id: 'F-302', title: 'API de exportação de dados', status: 'em_curso', team: 'Core', storyPoints: 13, assignee: 'm3', late: true },
  { id: 'F-311', title: 'Painel de previsão de vendas', status: 'em_curso', team: 'Core', storyPoints: 13, assignee: 'm2' },
  { id: 'F-298', title: 'Notificações por email', status: 'em_revisao', team: 'Growth', storyPoints: 5, assignee: null },
  { id: 'F-290', title: 'Pesquisa global', status: 'concluido', team: 'Core', storyPoints: 8, assignee: 'm1' },
  { id: 'F-293', title: 'Histórico de atividade do cliente', status: 'concluido', team: 'Growth', storyPoints: 5, assignee: 'm7' },
]

// Todos os sprints do produto. state: 'concluido' | 'ativo' | 'planeado'
export const sprintList = [
  { id: 's15', name: 'Sprint 15', state: 'planeado', start: '2026-11-16', end: '2026-11-30', goal: 'Faturação recorrente: primeira versão', capacity: 40, committed: 32 },
  { id: 's14', name: 'Sprint 14', state: 'ativo', start: '2026-11-02', end: '2026-11-16', goal: 'Fechar as exportações para a v3.0', capacity: 40, committed: 36 },
  { id: 's13', name: 'Sprint 13', state: 'concluido', start: '2026-10-19', end: '2026-11-02', goal: 'Pesquisa global e histórico do cliente', capacity: 40, committed: 36, done: 35 },
  { id: 's12', name: 'Sprint 12', state: 'concluido', start: '2026-10-05', end: '2026-10-19', goal: 'Notificações por email', capacity: 38, committed: 38, done: 33 },
]

// Resumo de um sprint concluído (igual para todos nesta fase)
export const sprintSummary = {
  delivered: [
    { id: 'F-290', title: 'Pesquisa global', storyPoints: 8 },
    { id: 'F-293', title: 'Histórico de atividade do cliente', storyPoints: 5 },
    { id: 'F-287', title: 'Atalhos de teclado', storyPoints: 3 },
  ],
  carriedOver: [{ id: 'F-298', title: 'Notificações por email', storyPoints: 5 }],
}

// Funcionalidades já planeadas para o Sprint 15
export const plannedSprintItems = [
  { id: 'F-308', title: 'Faturação recorrente', storyPoints: 21, assignee: 'm4' },
  { id: 'F-315', title: 'Filtros guardados nas listas', storyPoints: 3, assignee: 'm6' },
  { id: 'F-314', title: 'Relatório de comissões por vendedor', storyPoints: 8, assignee: null },
]

// Funcionalidades do backlog que podem entrar no próximo sprint
export const sprintCandidates = [
  { id: 'F-316', title: 'Aplicação móvel offline', storyPoints: 34, sprint: null },
  { id: 'F-317', title: 'Assistente de email com IA', storyPoints: 21, sprint: null },
  { id: 'F-311', title: 'Painel de previsão de vendas', storyPoints: 13, sprint: 'Sprint 14' },
]

// --- Roadmap, releases e milestones ------------------------------------------
export const roadmapMonths = ['Set 26', 'Out 26', 'Nov 26', 'Dez 26', 'Jan 27', 'Fev 27', 'Mar 27', 'Abr 27']
export const todayMonthIndex = 2.5

// start/end: índices de roadmapMonths
export const releases = [
  {
    id: 'v2.5', name: 'v2.5', status: 'concluida', date: '30 set 2026', startDate: '2026-08-20', endDate: '2026-09-30', milestoneId: null, progress: 100, start: 0, end: 1, delivered: 11,
    objective: 'Melhorar a importação de dados', summary: 'Trazer clientes de outras ferramentas sem perder dados.', milestone: null,
    features: [{ id: 'F-276', title: 'Importar contactos a partir de CSV', status: 'concluido', startDate: '2026-08-20', endDate: '2026-09-10', progress: 100 }, { id: 'F-281', title: 'Modo escuro', status: 'concluido', startDate: '2026-09-01', endDate: '2026-09-30', progress: 100 }],
  },
  {
    id: 'v3.0', name: 'v3.0', status: 'em_curso', date: '15 dez 2026', startDate: '2026-10-01', endDate: '2026-12-15', milestoneId: 'ms1', progress: 58, start: 1, end: 4, delivered: 3,
    objective: 'Relatórios e exportações para clientes empresariais', summary: 'Dar às empresas os números de vendas no formato que a direção já usa.', milestone: 'Lançamento B2B',
    features: [
      { id: 'F-305', title: 'Exportação de relatórios para Excel', status: 'em_curso', startDate: '2026-10-12', endDate: '2026-11-28', progress: 70, note: 'Depende de F-302' },
      { id: 'F-298', title: 'Notificações por email', status: 'em_revisao', startDate: '2026-10-05', endDate: '2026-11-20', progress: 90 },
      { id: 'F-302', title: 'API de exportação de dados', status: 'em_curso', late: true, startDate: '2026-10-01', endDate: '2026-11-10', progress: 45, note: 'Atrasada: devia ter terminado a 10 nov' },
    ],
  },
  {
    id: 'v3.1', name: 'v3.1', status: 'planeada', date: '28 fev 2027', startDate: '2027-01-04', endDate: '2027-02-28', milestoneId: 'ms2', progress: 10, start: 4, end: 6, delivered: 0,
    objective: 'Faturação e previsão de vendas', summary: 'Cobrar automaticamente e prever as vendas do trimestre.', milestone: 'Integrações bancárias',
    features: [{ id: 'F-308', title: 'Faturação recorrente', status: 'por_fazer', startDate: '2027-01-04', endDate: '2027-02-20', progress: 0, note: 'Depende de F-305' }, { id: 'F-311', title: 'Painel de previsão de vendas', status: 'em_curso', startDate: '2027-01-18', endDate: '2027-02-28', progress: 20 }],
  },
  {
    id: 'v3.2', name: 'v3.2', status: 'planeada', date: '30 abr 2027', startDate: '2027-03-01', endDate: '2027-04-30', milestoneId: null, progress: 0, start: 6, end: 8, delivered: 0,
    objective: 'Mobilidade e assistência inteligente', summary: 'Trabalhar no terreno sem rede e responder mais depressa aos clientes.', milestone: null,
    features: [{ id: 'F-316', title: 'Aplicação móvel offline', status: 'por_fazer', startDate: '2027-03-01', endDate: '2027-04-20', progress: 0 }, { id: 'F-317', title: 'Assistente de email com IA', status: 'por_fazer', startDate: '2027-03-15', endDate: '2027-04-30', progress: 0 }],
  },
]

export const today = '2026-11-15'

export const releaseHistory = [
  { release: 'v2.2', entregues: 6 },
  { release: 'v2.3', entregues: 7 },
  { release: 'v2.4', entregues: 9 },
  { release: 'v2.5', entregues: 11 },
]

// position: índice de roadmapMonths onde a milestone aparece
export const milestones = [
  { id: 'ms1', name: 'Lançamento B2B', dateIso: '2026-12-15', date: '15 dez 2026', position: 3.45, atRisk: true, progress: 58, detail: 'Ritmo atual de 28 pts/sprint; necessário 36.' },
  { id: 'ms2', name: 'Integrações bancárias', dateIso: '2027-02-28', date: '28 fev 2027', position: 5.9, atRisk: false, progress: 12, detail: 'Dentro do ritmo previsto.' },
]

// --- Detalhe de uma funcionalidade (usado para qualquer id nesta fase) -------
export const featureDetail = {
  id: 'F-305',
  title: 'Exportação de relatórios para Excel',
  status: 'em_curso',
  team: 'Core',
  sprint: 'Sprint 14',
  release: 'v3.0',
  releaseObjective: 'Relatórios e exportações para clientes empresariais',
  storyPoints: 8,
  impact: 8,
  effort: 3,
  assignee: 'm1',
  createdAt: '12 out 2026',
  description: 'Botão "Exportar" em todos os relatórios de vendas. O ficheiro .xlsx respeita os filtros e a ordenação aplicados no ecrã.',
  leadTime: null,
  cycleTime: '6 dias',
  request: {
    id: 'R-2190',
    customer: 'Carlos Mendes · Mendes Distribuição',
    submittedAt: '8 out 2026',
    text: 'Exportar qualquer relatório para .xlsx mantendo os filtros aplicados. Hoje copiamos os números à mão para enviar à direção.',
  },
  userStory: {
    role: 'gestor comercial',
    goal: 'exportar qualquer relatório de vendas para Excel mantendo os filtros',
    benefit: 'partilhar os números com a direção sem copiar dados à mão',
  },
  criteria: [
    { id: 'c1', text: 'Dado um relatório com filtros, quando exporto, então o ficheiro .xlsx contém apenas as linhas filtradas.' },
    { id: 'c2', text: 'Dado um relatório com mais de 50 000 linhas, quando exporto, então recebo o ficheiro por email.' },
    { id: 'c3', text: 'Dado que não tenho permissão de exportação, quando abro o relatório, então o botão de exportar não aparece.' },
  ],
  history: [
    { version: 'v3', date: '10 nov 2026', author: 'Inês Carvalho', change: 'Adicionado critério para relatórios com mais de 50 000 linhas.' },
    { version: 'v2', date: '22 out 2026', author: 'Inês Carvalho', change: 'Benefício reescrito após conversa com o cliente.' },
    { version: 'v1', date: '12 out 2026', author: 'Inês Carvalho', change: 'Versão inicial criada a partir do pedido R-2190.' },
  ],
  statusLog: [
    { status: 'em_curso', date: '6 nov 2026', author: 'Rui Matos' },
    { status: 'por_fazer', date: '2 nov 2026', author: 'Tiago Ferreira' },
  ],
  officialDecision: {
    author: 'Inês Carvalho',
    date: '11 nov 2026',
    text: 'O limite de 50 000 linhas aplica-se por folha. Ficheiros acima disso são enviados por email.',
  },
  comments: [
    {
      id: 'k1', author: 'Rui Matos', initials: 'RM', date: '11 nov 2026, 10:12',
      text: '@Inês o limite de linhas aplica-se por folha ou por ficheiro?',
      replies: [
        { id: 'k1r1', author: 'Inês Carvalho', initials: 'IC', date: '11 nov 2026, 11:40', text: 'O limite de 50 000 linhas aplica-se por folha. Ficheiros acima disso são enviados por email.', official: true },
      ],
    },
    {
      id: 'k2', author: 'Beatriz Costa', initials: 'BC', date: '12 nov 2026, 15:03',
      text: 'Os gráficos dos relatórios também devem ir para o Excel, ou só as tabelas?',
      replies: [],
    },
  ],
  // Grafo de dependências: "source depende de target" desenhado da esquerda para a direita
  dependencies: {
    nodes: [
      { id: 'F-302', title: 'API de exportação de dados', status: 'em_curso', late: true, x: 0, y: 90 },
      { id: 'F-305', title: 'Exportação de relatórios para Excel', status: 'em_curso', current: true, x: 300, y: 90 },
      { id: 'F-311', title: 'Painel de previsão de vendas', status: 'em_curso', x: 600, y: 0 },
      { id: 'F-308', title: 'Faturação recorrente', status: 'por_fazer', x: 600, y: 180 },
    ],
    edges: [
      { from: 'F-302', to: 'F-305' },
      { from: 'F-305', to: 'F-311' },
      { from: 'F-305', to: 'F-308' },
    ],
    affected: {
      features: ['F-311 · Painel de previsão de vendas', 'F-308 · Faturação recorrente'],
      sprints: ['Sprint 15'],
      releases: ['v3.0 · Lançamento B2B', 'v3.1'],
    },
    // Funcionalidades que dependem desta (escolher uma delas cria dependência circular)
    dependents: ['F-311', 'F-308'],
  },
}

// Rascunho de User Story devolvido pelo serviço de IA (placeholder)
export const aiStoryDraft = {
  role: 'gestor comercial',
  goal: 'ver um relatório mensal com as comissões de cada vendedor',
  benefit: 'pagar as comissões sem fazer cálculos em folhas de cálculo',
}

// --- Definições do produto ---------------------------------------------------
export const productSettings = {
  stateLimits: [
    { state: 'Submetido', days: 3 },
    { state: 'Em análise', days: 7 },
    { state: 'Aprovado', days: 14 },
    { state: 'Em curso', days: 10 },
    { state: 'Em revisão', days: 4 },
  ],
}

// --- Requisitos: todas as User Stories do produto ---------------------------
// state: 'confirmada' | 'rascunho' (gerada por IA, por confirmar) | 'sem' (funcionalidade sem User Story)
export const requirements = [
  { featureId: 'F-305', title: 'Exportação de relatórios para Excel', state: 'confirmada', story: 'Como gestor comercial, quero exportar qualquer relatório de vendas para Excel mantendo os filtros, para partilhar os números com a direção sem copiar dados à mão.', criteria: 3, requestId: 'R-2190', release: 'v3.0', openQuestions: 1, updatedAt: '10 nov 2026', version: 'v3' },
  { featureId: 'F-298', title: 'Notificações por email', state: 'confirmada', story: 'Como gestor de conta, quero receber um email quando um negócio muda de fase, para reagir sem ter de abrir a aplicação.', criteria: 4, requestId: 'R-2201', release: 'v3.0', openQuestions: 0, updatedAt: '28 out 2026', version: 'v2' },
  { featureId: 'F-302', title: 'API de exportação de dados', state: 'confirmada', story: 'Como integrador, quero obter os dados de vendas por API, para os levar para o sistema de faturação da empresa.', criteria: 5, requestId: null, release: 'v3.0', openQuestions: 2, updatedAt: '4 nov 2026', version: 'v4' },
  { featureId: 'F-311', title: 'Painel de previsão de vendas', state: 'confirmada', story: 'Como diretor comercial, quero ver a previsão de vendas do trimestre, para ajustar as metas da equipa a tempo.', criteria: 3, requestId: null, release: 'v3.1', openQuestions: 0, updatedAt: '2 nov 2026', version: 'v1' },
  { featureId: 'F-308', title: 'Faturação recorrente', state: 'rascunho', story: 'Como responsável financeiro, quero emitir faturas mensais automaticamente, para não ter de as criar uma a uma.', criteria: 0, requestId: null, release: 'v3.1', openQuestions: 0, updatedAt: '13 nov 2026', version: 'rascunho' },
  { featureId: 'F-315', title: 'Filtros guardados nas listas', state: 'confirmada', story: 'Como vendedor, quero guardar os filtros que uso todos os dias, para abrir a minha lista de trabalho num clique.', criteria: 2, requestId: null, release: null, openQuestions: 0, updatedAt: '30 out 2026', version: 'v1' },
  { featureId: 'F-314', title: 'Relatório de comissões por vendedor', state: 'sem', story: null, criteria: 0, requestId: 'R-2214', release: null, openQuestions: 0, updatedAt: null, version: null },
  { featureId: 'F-316', title: 'Aplicação móvel offline', state: 'sem', story: null, criteria: 0, requestId: null, release: 'v3.2', openQuestions: 0, updatedAt: null, version: null },
  { featureId: 'F-317', title: 'Assistente de email com IA', state: 'sem', story: null, criteria: 0, requestId: null, release: 'v3.2', openQuestions: 0, updatedAt: null, version: null },
]

export const recentDecisions = [
  { featureId: 'F-305', text: 'O limite de 50 000 linhas aplica-se por folha. Ficheiros acima disso são enviados por email.', author: 'Inês Carvalho', date: '11 nov 2026' },
  { featureId: 'F-302', text: 'A API devolve no máximo 1000 registos por página, com paginação por cursor.', author: 'Inês Carvalho', date: '3 nov 2026' },
]

export const requirementChanges = [
  { featureId: 'F-308', text: 'Rascunho de User Story gerado por IA', author: 'Inês Carvalho', date: '13 nov 2026' },
  { featureId: 'F-305', text: 'Novo critério para relatórios com mais de 50 000 linhas', author: 'Inês Carvalho', date: '10 nov 2026' },
  { featureId: 'F-302', text: 'Critério de autenticação por chave de API alterado', author: 'Inês Carvalho', date: '4 nov 2026' },
]
