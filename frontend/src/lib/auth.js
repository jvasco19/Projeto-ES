// Sessao simulada. Quando houver backend guardar aqui o token JWT devolvido pela API
const KEY = 'ws-session'

export function isLoggedIn() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function login() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // sem armazenamento disponivel: a sessao dura apenas ate recarregar
  }
}

export function logout() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignorar
  }
}
