import React from 'react';
import { toast } from 'react-toastify';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado:', error, errorInfo);
    
    // Notifica o usuário
    toast.error('Ocorreu um erro inesperado. Por favor, tente novamente.');

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // reportError(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Oops! Algo deu errado
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">
                    {this.state.error?.message}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 