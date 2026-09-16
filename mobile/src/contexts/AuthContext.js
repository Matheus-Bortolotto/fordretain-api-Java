import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logout as logoutService } from '../services/authService';

const ALLOWED_ROLES = ['ADMIN', 'GERENTE', 'ANALISTA'];

export const AuthContext = createContext(undefined);

async function mapFirebaseUser(firebaseUser) {
  const token = await firebaseUser.getIdTokenResult();
  const requestedRole = String(token.claims.role || '').toUpperCase();
  const role = ALLOWED_ROLES.includes(requestedRole) ? requestedRole : 'ANALISTA';

  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email || 'Usuário FordRetain',
    email: firebaseUser.email,
    role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser ? await mapFirebaseUser(firebaseUser) : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
  }, []);

  const value = useMemo(() => ({ user, loading, logout }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
