// Textos e cores dos estados e papéis. A cor só é usada quando tem significado.

export const roleLabels = {
  product_manager: 'Product Manager',
  project_manager: 'Project Manager',
  developer: 'Developer',
}

export const roleHints = {
  product_manager: 'Gere pedidos, backlog e User Stories',
  project_manager: 'Gere equipas, releases e milestones',
  developer: 'Equipa de desenvolvimento: atualiza o estado do trabalho',
}

export const requestStatus = {
  submetido: { label: 'Submetido', color: 'gray', icon: 'send' },
  em_analise: { label: 'Em análise', color: 'yellow', icon: 'manage_search' },
  aprovado: { label: 'Aprovado', color: 'teal', icon: 'check_circle' },
  planeado: { label: 'Planeado', color: 'stream', icon: 'event' },
  entregue: { label: 'Entregue', color: 'green', icon: 'rocket_launch' },
  rejeitado: { label: 'Rejeitado', color: 'red', icon: 'cancel' },
}

export const featureStatus = {
  por_fazer: { label: 'Por fazer', color: 'gray' },
  em_curso: { label: 'Em curso', color: 'stream' },
  em_revisao: { label: 'Em revisão', color: 'violet' },
  concluido: { label: 'Concluído', color: 'green' },
}

export const featureFlow = ['por_fazer', 'em_curso', 'em_revisao', 'concluido']

export const sprintState = {
  ativo: { label: 'Ativo', color: 'stream' },
  planeado: { label: 'Planeado', color: 'gray' },
  concluido: { label: 'Concluído', color: 'green' },
}

export const releaseStatus = {
  concluida: { label: 'Lançada', color: 'green' },
  em_curso: { label: 'Em curso', color: 'stream' },
  planeada: { label: 'Planeada', color: 'gray' },
}

// Permissões por papel, de acordo com as user stories.
const permissions = {
  product_manager: ['triage', 'backlog', 'priority', 'story', 'sprintPlan', 'decision', 'estimate', 'editFeature'],
  project_manager: ['releases', 'teams', 'milestones', 'settings', 'assignTeam', 'assign', 'sprints'],
  // Equipa de desenvolvimento (atribui-se a si própria)
  developer: ['status', 'selfAssign', 'estimate'],
}

export function can(role, action) {
  return permissions[role]?.includes(action) ?? false
}

export const fibonacci = ['1', '2', '3', '5', '8', '13', '21', '34']
