import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { EmailRules } from '../pages/EmailRules';
import { EmailLogs } from '../pages/EmailLogs';
import { Settings } from '../pages/Settings';
import { PrivateRoute } from '../components/PrivateRoute';
import { NotFound } from '../pages/NotFound';
import { AuthCallback } from '../pages/AuthCallback';

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<Navigate to="/login" replace />} />

      {/* Rotas privadas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/email-rules"
        element={
          <PrivateRoute>
            <EmailRules />
          </PrivateRoute>
        }
      />
      <Route
        path="/email-logs"
        element={
          <PrivateRoute>
            <EmailLogs />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute requiredRole="admin">
            <Settings />
          </PrivateRoute>
        }
      />

      {/* Rota padrão */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 