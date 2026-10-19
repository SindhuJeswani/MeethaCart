import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('meethacart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('meethacart_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Tracks pending 2FA or Signup OTP step across route reloads
  const [pendingAuth, setPendingAuth] = useState(() => {
    const saved = sessionStorage.getItem('meethacart_pending_auth');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep pendingAuth synced with sessionStorage
  useEffect(() => {
    if (pendingAuth) {
      sessionStorage.setItem('meethacart_pending_auth', JSON.stringify(pendingAuth));
    } else {
      sessionStorage.removeItem('meethacart_pending_auth');
    }
  }, [pendingAuth]);

  // Sync token and user to localStorage
  const saveSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('meethacart_token', newToken);
    localStorage.setItem('meethacart_user', JSON.stringify(newUser));
    setPendingAuth(null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPendingAuth(null);
    localStorage.removeItem('meethacart_token');
    localStorage.removeItem('meethacart_user');
    sessionStorage.removeItem('meethacart_pending_auth');
  };

  // Listen for global logout events from API interceptor
  useEffect(() => {
    const handleForceLogout = () => logout();
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // Verify active session on initial load
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('meethacart_token');
      if (storedToken) {
        try {
          const res = await api.get('/users/me');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('meethacart_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  // Step 1 of Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const authState = {
        email: res.data.email,
        purpose: 'login_2fa',
        role: res.data.role,
        cooldownSeconds: res.data.cooldownSeconds || 60
      };
      setPendingAuth(authState);
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed.');
  };

  // Step 2 of Login (Verify 2FA OTP)
  const verifyLoginOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-login-otp', { email, otp });
    if (res.data?.success) {
      saveSession(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'OTP verification failed.');
  };

  // Step 1 of Register
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success) {
      const authState = {
        email: res.data.email,
        purpose: 'signup_verification',
        role: formData.role,
        cooldownSeconds: res.data.cooldownSeconds || 60
      };
      setPendingAuth(authState);
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed.');
  };

  // Step 2 of Register (Verify Signup OTP)
  const verifySignupOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.data?.success) {
      saveSession(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Verification failed.');
  };

  // Resend OTP
  const resendOtp = async (email, purpose) => {
    const res = await api.post('/auth/resend-otp', { email, purpose });
    return res.data;
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    if (res.data?.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('meethacart_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        pendingAuth,
        setPendingAuth,
        login,
        verifyLoginOtp,
        register,
        verifySignupOtp,
        resendOtp,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
