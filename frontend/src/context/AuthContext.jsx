import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/endpoints.js';
import { tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load if we have a token.
  useEffect(() => {
    let active = true;
    const restore = async () => {
      if (!tokenStore.getAccess() && !tokenStore.getRefresh()) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await authApi.me();
        if (active) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    };
    restore();
    return () => {
      active = false;
    };
  }, []);

  // React to a forced logout triggered by the axios refresh interceptor.
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('chitram:logout', onLogout);
    return () => window.removeEventListener('chitram:logout', onLogout);
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await authApi.login({ identifier, password });
    tokenStore.set(res);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (body) => {
    const res = await authApi.register(body);
    tokenStore.set(res);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = { user, setUser, loading, login, register, logout, isAuthed: Boolean(user) };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
