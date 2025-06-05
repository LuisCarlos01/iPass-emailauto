import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes';
import { Navbar } from './components/Navbar';
import { queryClient } from './config/queryClient';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <AppRoutes />
            </div>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
} 