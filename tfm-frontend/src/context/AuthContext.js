import React, { createContext, useState, useEffect, useCallback } from 'react';
import api, { configureApiAuth } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.post('/api/auth/logout');
      }
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  // Verificar que el token sea válido
  const verifyToken = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/verify');
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      console.error('Error verificando token:', err);
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Configurar cliente API y verificar token al montar componente
  useEffect(() => {
    configureApiAuth({
      getToken: () => localStorage.getItem('authToken'),
      onUnauthorized: logout,
    });

    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (parseError) {
        localStorage.removeItem('user');
      }
    }

    if (savedToken) {
      setToken(savedToken);
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [logout, verifyToken]);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data;

      // Guardar token y usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (email, password, nombre) => {
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/auth/register', { email, password, nombre });

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
