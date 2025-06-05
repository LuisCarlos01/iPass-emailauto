import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { PrivateRoute } from '../components/PrivateRoute';
import { toast } from 'react-toastify';

// Mock do react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock do useLocation
const mockLocation = {
  pathname: '/dashboard',
  search: '',
  hash: '',
  state: null,
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

// Mock do AuthContext
const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render loading state', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
    });

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    });

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    expect(toast.error).toHaveBeenCalledWith('Você precisa estar autenticado para acessar esta página');
  });

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
    });

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should handle URL token correctly', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    });

    const mockLocationWithToken = {
      ...mockLocation,
      search: '?token=test-token',
    };

    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useLocation: () => mockLocationWithToken,
        Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
      };
    });

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Autenticando...')).toBeInTheDocument();
  });

  it('should redirect to dashboard when role is insufficient', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
    });

    render(
      <BrowserRouter>
        <PrivateRoute requiredRole="admin">
          <div>Admin Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/dashboard');
    expect(toast.error).toHaveBeenCalledWith('Você não tem permissão para acessar esta página');
  });

  it('should render children when role is sufficient', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' },
    });

    render(
      <BrowserRouter>
        <PrivateRoute requiredRole="admin">
          <div>Admin Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
}); 