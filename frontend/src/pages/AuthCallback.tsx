import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const userStr = searchParams.get('user');

      console.log('AuthCallback - Parâmetros recebidos:', { token, error, userStr });

      if (error) {
        console.error('AuthCallback - Erro:', error);
        toast.error('Erro ao fazer login com Google');
        navigate('/login');
        return;
      }

      if (!token || !userStr) {
        console.error('AuthCallback - Token ou dados do usuário não encontrados');
        toast.error('Dados de autenticação incompletos');
        navigate('/login');
        return;
      }

      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log('AuthCallback - Dados do usuário:', user);

        // Salva os dados no localStorage
        localStorage.setItem('@iPass:token', token);
        localStorage.setItem('@iPass:user', JSON.stringify(user));

        // Processa o login
        signInWithGoogle(token, user);
        toast.success('Login realizado com sucesso!');
      } catch (err) {
        console.error('AuthCallback - Erro ao processar dados:', err);
        toast.error('Erro ao processar login');
        navigate('/login');
      }
    };

    processCallback();
  }, [navigate, searchParams, signInWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
} 