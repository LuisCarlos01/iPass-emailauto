import axios from 'axios';
import { toast } from 'react-toastify';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@iPass:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Erro de conexão com o servidor. Verifique sua internet.');
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      localStorage.removeItem('@iPass:token');
      localStorage.removeItem('@iPass:user');
      
      // Apenas redireciona para /login se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const errorMessage = error.response?.data?.error || 'Ocorreu um erro. Tente novamente.';
    toast.error(errorMessage);

    return Promise.reject(error);
  }
); 