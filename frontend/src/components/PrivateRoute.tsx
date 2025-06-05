import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
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
    user
  });

  if (loading) {
    console.log('PrivateRoute - Carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Se houver token na URL, permite o acesso temporariamente
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token');
  
  if (urlToken) {
    console.log('PrivateRoute - Token encontrado na URL');
    return <>{children}</>;
  }

  if (!isAuthenticated && !hasToken) {
    console.log('PrivateRoute - Acesso negado:', {
      isAuthenticated,
      hasToken,
      token,
      urlToken
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('PrivateRoute - Acesso permitido');
  return <>{children}</>;
} 