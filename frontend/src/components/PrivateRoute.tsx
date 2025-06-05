import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Verifica se há token no localStorage
  const hasToken = !!localStorage.getItem('@iPass:token');
  const token = localStorage.getItem('@iPass:token');
  
  console.log('PrivateRoute - Estado atual:', {
    isAuthenticated,
    hasToken,
    loading,
    pathname: location.pathname,
    search: location.search,
    user,
    requiredRole
  });

  // Verifica se o usuário tem a role necessária
  const hasRequiredRole = () => {
    if (!requiredRole || !user) return true;
    return user.role === requiredRole;
  };

  if (loading) {
    console.log('PrivateRoute - Carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se houver token na URL, verifica se é válido antes de permitir acesso
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token');
  
  if (urlToken && !isAuthenticated) {
    console.log('PrivateRoute - Token encontrado na URL, aguardando autenticação');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Autenticando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    console.log('PrivateRoute - Acesso negado:', {
      isAuthenticated,
      hasToken,
      token,
      urlToken
    });
    toast.error('Você precisa estar autenticado para acessar esta página');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole()) {
    console.log('PrivateRoute - Acesso negado: role inválida', {
      userRole: user?.role,
      requiredRole
    });
    toast.error('Você não tem permissão para acessar esta página');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('PrivateRoute - Acesso permitido');
  return <>{children}</>;
} 