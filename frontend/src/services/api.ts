import axios from 'axios';
import { toast } from 'react-toastify';

export const api = axios.create({
  baseURL: 'http://localhost:3333/api',
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@iPass:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na resposta:', error);

    if (!error.response) {
      toast.error('Erro de conexão. Verifique sua internet.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        toast.error(data.message || 'Dados inválidos. Verifique os campos.');
        break;
      case 401:
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        localStorage.removeItem('@iPass:token');
        localStorage.removeItem('@iPass:user');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Você não tem permissão para realizar esta ação.');
        break;
      case 404:
        toast.error('Recurso não encontrado.');
        break;
      case 422:
        toast.error(data.message || 'Dados inválidos. Verifique os campos.');
        break;
      case 429:
        toast.error('Muitas requisições. Por favor, aguarde um momento.');
        break;
      case 500:
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
        break;
      default:
        toast.error('Ocorreu um erro. Por favor, tente novamente.');
    }

    return Promise.reject(error);
  }
); 