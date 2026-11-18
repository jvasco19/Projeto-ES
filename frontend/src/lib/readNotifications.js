// Notificações já lidas, guardadas só neste browser
const KEY = 'ws-read-notifications'

export function getReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export function markAsRead(ids) {
  const read = getReadIds()
  ids.forEach((id) => read.add(String(id)))
  try {
    localStorage.setItem(KEY, JSON.stringify([...read]))
  } catch {
    // Sem armazenamento disponivel
  }
  // Avisa o menu lateral para atualizar o contador
  window.dispatchEvent(new Event('ws-notifications-read'))
}