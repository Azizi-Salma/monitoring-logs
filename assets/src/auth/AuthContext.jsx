import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Vérifier le token à chaque chargement
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Vérifier expiration
        if (payload.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({
            email: payload.email || payload.username,
            roles: payload.roles || ['ROLE_USER'],
            exp: payload.exp,
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  //  Connexion avec appel API
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/login_check', {
        email,
        password,
      });

      const { token } = response.data;

      localStorage.setItem('token', token);
      setToken(token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        email: payload.email || payload.username,
        roles: payload.roles || ['ROLE_USER'],
        exp: payload.exp,
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur de connexion :', error.response);
      return {
        success: false,
        error: error.response?.data?.message || 'Identifiants invalides',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.roles?.includes('ROLE_ADMIN');

  const isAuthenticated = () => !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 