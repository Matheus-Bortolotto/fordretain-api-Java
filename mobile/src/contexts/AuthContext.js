import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getStoredUser, loginWithEmail, logout as logoutService, onSessionExpired } from '../services/authService';

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getStoredUser().then((storedUser) => { if (mounted) setUser(storedUser); }).finally(() => { if (mounted) setLoading(false); });
    return onSessionExpired(() => setUser(null));
  }, []);

  const logout = useCallback(async () => { await logoutService(); setUser(null); }, []);
  const login = useCallback(async (email, password) => {
    const authenticatedUser = await loginWithEmail(email, password);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);
  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
