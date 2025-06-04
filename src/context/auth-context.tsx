"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { id: number; email: string; name: string } | null; // ⭐ Add 'name: string' here ⭐
  token: string | null;
  login: (token: string, user: { id: number; email: string; name: string }) => void; // ⭐ Add 'name: string' here ⭐
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null); // ⭐ Add 'name: string' here ⭐
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id && parsedUser.email && parsedUser.nome) {
             setUser({ id: parsedUser.id, email: parsedUser.email, name: parsedUser.nome });
        } else {
            console.warn("Stored user data is incomplete, logging out.");
            logout();
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        logout();
      }
    }
  }, []);

  const login = (newToken: string, newUser: { id: number; email: string; name: string }) => { // ⭐ Add 'name: string' here ⭐
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};