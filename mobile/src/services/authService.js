import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado. Preencha o arquivo mobile/.env antes de entrar.');
  }
}

export function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/invalid-email': 'Digite um e-mail válido.',
    'auth/network-request-failed': 'Não foi possível conectar ao Firebase. Verifique sua internet.',
    'auth/operation-not-allowed': 'O login por e-mail e senha não está habilitado no Firebase.',
    'auth/too-many-requests': 'Muitas tentativas de acesso. Tente novamente mais tarde.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/wrong-password': 'E-mail ou senha inválidos.',
    'auth/user-not-found': 'E-mail ou senha inválidos.',
  };

  return messages[error?.code] || error?.message || 'Não foi possível concluir a autenticação.';
}

export async function loginWithEmail(email, password) {
  assertFirebaseConfigured();
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  return credential.user;
}

export async function registerWithEmail({ name, email, password }) {
  assertFirebaseConfigured();
  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(credential.user, { displayName: name.trim() });
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function getFirebaseIdToken(forceRefresh = false) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Sessão expirada. Entre novamente para continuar.');
  }

  return currentUser.getIdToken(forceRefresh);
}
