import React, { createContext, useEffect, useMemo, useState } from "react";
import { getMe, login, signup } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await getMe();
        if (!mounted) return;
        setUser(res.data.user ?? null);
      } catch {
        localStorage.removeItem("token");
        if (!mounted) return;
        setToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, [token]);

  const authValue = useMemo(() => {
    return {
      token,
      user,
      loading,
      async doLogin({ email, password }) {
        const res = await login({ email, password });
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user ?? null);
      },
      async doSignup({ name, email, password }) {
        const res = await signup({ name, email, password });
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user ?? null);
      },
      logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      },
    };
  }, [token, user, loading]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

