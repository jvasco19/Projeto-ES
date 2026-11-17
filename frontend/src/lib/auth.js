// Sessão do utilizador: o token JWT e os dados devolvidos pela API no login
const TOKEN_KEY = 'ws-token';
const USER_KEY = 'ws-user';

function read(key){
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getToken(){
  return read(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getUser() {
  try {
    return JSON.parse(read(USER_KEY))
  } catch {
    return null
  }
}

export function saveSession({ token, user }) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    // sem armazenamento disponivel, a sessao dura apenas ate recarregar
  }
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    // ignorar
  }
}