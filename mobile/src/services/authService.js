import AsyncStorage from '@react-native-async-storage/async-storage';
import { isMockCredential, mockAuthRequest, saveDemoUser } from './mockApi';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080').replace(/\/$/, '');
export const TOKEN_KEY = 'fordretain_token';
export const USER_KEY = 'fordretain_user';
const sessionListeners = new Set();

export function onSessionExpired(listener) { sessionListeners.add(listener); return () => sessionListeners.delete(listener); }
export async function clearSession() { await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]); sessionListeners.forEach((listener) => listener()); }
export async function getStoredToken() { return AsyncStorage.getItem(TOKEN_KEY); }
export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function request(path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    return mockAuthRequest(path, body);
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { mensagem: text }; }
  if (!response.ok) {
    if (path === '/api/v1/auth/login' && (response.status === 401 || response.status >= 500) && await isMockCredential(body.email, body.senha)) {
      return mockAuthRequest(path, body);
    }
    if (path === '/api/v1/auth/register' && response.status >= 500) return mockAuthRequest(path, body);
    const error = new Error(data?.mensagem || data?.erro || 'Não foi possível concluir a autenticação.');
    error.status = response.status;
    error.code = response.status === 409 ? 'email-already-in-use' : undefined;
    throw error;
  }
  return data;
}

export function getAuthErrorMessage(error) {
  if (error?.code === 'email-already-in-use') return 'Já existe uma conta com este e-mail.';
  if (error?.status === 401) return 'E-mail ou senha inválidos.';
  return error?.message || 'Não foi possível concluir a autenticação.';
}

export async function loginWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const response = await (await isMockCredential(normalizedEmail, password)
    ? mockAuthRequest('/api/v1/auth/login', { email: normalizedEmail, senha: password })
    : request('/api/v1/auth/login', { email: normalizedEmail, senha: password }));
  const user = { name: response.nome || response.email, email: response.email, role: response.role };
  await AsyncStorage.multiSet([[TOKEN_KEY, response.token], [USER_KEY, JSON.stringify(user)]]);
  return user;
}

export async function registerWithEmail({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const response = await request('/api/v1/auth/register', { nome: name.trim(), email: normalizedEmail, senha: password });
  await saveDemoUser({ nome: name, email: normalizedEmail, senha: password });
  return response;
}

export async function logout() { await clearSession(); }
