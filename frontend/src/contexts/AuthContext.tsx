import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

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

interface JwtPayload {
  exp: number;
  sub: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  };

  const validateSession = async (token: string): Promise<boolean> => {
    try {
      await api.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('@iPass:token');
      const storedUser = localStorage.getItem('@iPass:user');

      if (token && storedUser) {
        if (!isTokenValid(token)) {
          console.log('AuthContext - Token expirado');
          signOut();
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          return;
        }

        const isSessionValid = await validateSession(token);
        if (!isSessionValid) {
          console.log('AuthContext - Sessão inválida');
          signOut();
          toast.error('Sessão inválida. Por favor, faça login novamente.');
          return;
        }

        console.log('AuthContext - Token válido, restaurando sessão');
        api.defaults.headers.authorization = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    };

    initializeAuth();
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
    
    if (!token || !userData) {
      console.error('AuthContext - Token ou dados do usuário ausentes');
      toast.error('Dados de autenticação incompletos');
      return;
    }

    if (!isTokenValid(token)) {
      console.error('AuthContext - Token inválido ou expirado');
      toast.error('Token inválido ou expirado. Por favor, tente novamente.');
      return;
    }

    try {
      // Configura o token na API
      api.defaults.headers.authorization = `Bearer ${token}`;
      console.log('AuthContext - Token definido no header da API');
      
      // Atualiza o estado do usuário
      setUser(userData);
      console.log('AuthContext - Usuário definido no estado:', userData);
      
      // Força o redirecionamento
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('AuthContext - Erro ao processar login com Google:', error);
      toast.error('Erro ao processar login');
      navigate('/login');
    }
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