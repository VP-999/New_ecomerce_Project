import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { upsertUser, verifyUserPassword } from '../services/dbService';

// --- SIMULATED DATABASE ---
// In a real app, this would be your Users table in a database.
const mockUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@trendhive.com', role: 'admin' },
    { id: 2, name: 'John Doe', email: 'user@example.com', role: 'customer', address: '123 Fashion Ave, New York, NY 10001' }
];
// We'll store passwords separately for the simulation
const mockPasswords: { [email: string]: string } = {
    'admin@trendhive.com': 'password',
    'user@example.com': 'password',
};
// ----------------------------

type AppView = 'store' | 'login' | 'register' | 'forgot';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  requestPasswordReset: (email: string, newPass: string) => boolean;
  view: AppView;
  setView: (view: AppView) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_USER = 'trendhive:currentUser'
const STORAGE_USERS = 'trendhive:users'
const STORAGE_VIEW = 'trendhive:view'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('store');

  // Load saved session
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(STORAGE_USER)
      if (rawUser) setCurrentUser(JSON.parse(rawUser))
      const rawView = localStorage.getItem(STORAGE_VIEW) as AppView | null
      if (rawView) setView(rawView)
    } catch {}
  }, [])

  // Persist currentUser
  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser))
      else localStorage.removeItem(STORAGE_USER)
    } catch {}
  }, [currentUser])

  // Persist view
  useEffect(() => {
    try { localStorage.setItem(STORAGE_VIEW, view) } catch {}
  }, [view])

  const login = async (email: string, pass: string): Promise<boolean> => {
    const user = mockUsers.find(u => u.email === email);
    if (user && mockPasswords[email] === pass) {
      setCurrentUser(user);
      if (user.role !== 'admin') setView('store');
      return true;
    }
    // Try local stored users list
    try {
      const raw = localStorage.getItem(STORAGE_USERS)
      const list: Array<User & { password?: string }> = raw ? JSON.parse(raw) : []
      const found = list.find(u => u.email === email && (u as any).password === pass)
      if (found) {
        const { password, ...u } = found as any
        setCurrentUser(u as User)
        setView('store')
        return true
      }
    } catch {}
    // Try Supabase users
    try {
      const row = await verifyUserPassword(email, pass)
      if (row) {
        const u: User = { id: row.id, name: row.name, email: row.email, address: row.address ?? '', role: row.role || 'customer' }
        setCurrentUser(u)
        setView('store')
        return true
      }
    } catch {}
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setView('store');
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (mockUsers.some(u => u.email === email)) {
        alert('User with this email already exists.');
        return false;
    }
    const newUser: User = {
        id: String(mockUsers.length + 1) as any,
        name,
        email,
        role: 'customer',
        address: ''
    };
    mockUsers.push(newUser as any);
    mockPasswords[email] = pass;
    try {
      await upsertUser({ name, email, password: pass, address: '', role: 'customer' })
    } catch {}
    // Save to local users list for persistence across reloads
    try {
      const raw = localStorage.getItem(STORAGE_USERS)
      const list: any[] = raw ? JSON.parse(raw) : []
      list.push({ ...newUser, password: pass })
      localStorage.setItem(STORAGE_USERS, JSON.stringify(list))
    } catch {}
    setCurrentUser(newUser);
    setView('store');
    return true;
  };

  const requestPasswordReset = (email: string, newPass: string): boolean => {
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      // Try local users
      try {
        const raw = localStorage.getItem(STORAGE_USERS)
        const list: any[] = raw ? JSON.parse(raw) : []
        const idx = list.findIndex(u => u.email === email)
        if (idx >= 0) {
          list[idx].password = newPass || list[idx].password
          localStorage.setItem(STORAGE_USERS, JSON.stringify(list))
          return true
        }
      } catch {}
      return false
    }
    mockPasswords[email] = newPass || mockPasswords[email]
    return true
  }


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, requestPasswordReset, view, setView }}>
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
