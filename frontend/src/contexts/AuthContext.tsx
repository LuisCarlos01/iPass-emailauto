import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (token: string, userData: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('@iPass:token');
    const storedUser = localStorage.getItem('@iPass:user');

    if (token && storedUser) {
      api.defaults.headers.authorization = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { token, user: userData } = response.data;

    localStorage.setItem('@iPass:token', token);
    localStorage.setItem('@iPass:user', JSON.stringify(userData));

    api.defaults.headers.authorization = `Bearer ${token}`;
    setUser(userData);
  };

  const signInWithGoogle = (token: string, userData: User) => {
    console.log('AuthContext - Iniciando signInWithGoogle');
    console.log('AuthContext - Token recebido:', token);
    console.log('AuthContext - Dados do usuário:', userData);

    api.defaults.headers.authorization = `Bearer ${token}`;
    console.log('AuthContext - Token definido no header da API');
    
    setUser(userData);
    console.log('AuthContext - Usuário definido no estado');
    
    setTimeout(() => {
      console.log('AuthContext - Redirecionando para /dashboard');
      navigate('/dashboard');
    }, 100);
  };

  // Efeito para redirecionamento após autenticação
  useEffect(() => {
    if (user) {
      console.log('AuthContext - Usuário autenticado, redirecionando para /dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const signOut = () => {
    localStorage.removeItem('@iPass:token');
    localStorage.removeItem('@iPass:user');
    setUser(null);
    api.defaults.headers.authorization = '';
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}; 