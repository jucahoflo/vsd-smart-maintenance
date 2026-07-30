import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user] = useState({
    id: 'test-user',
    username: 'juca7603',
    name: 'Administrador',
    role: 'admin'
  });

  const login = async () => ({ success: true });
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
