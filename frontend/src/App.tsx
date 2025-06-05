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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <AppRoutes />
          </div>
          <ToastContainer position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
} 