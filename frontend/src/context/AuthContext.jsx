import React, { createContext, useState, useContext, useEffect } from 'react';

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
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');

    if (storedToken && storedUser && storedCompany) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }
    setLoading(false);
  }, []);

  const login = (token, user, company) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('company', JSON.stringify(company));
    setToken(token);
    setUser(user);
    setCompany(company);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  const value = {
    user,
    company,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'Admin',
    isManager: user?.role === 'Manager',
    isEmployee: user?.role === 'Employee'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
