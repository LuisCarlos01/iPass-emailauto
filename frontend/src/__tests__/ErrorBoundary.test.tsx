import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { toast } from 'react-toastify';

// Mock do react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Componente que lança erro para testar
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal Component</div>;
};

describe('ErrorBoundary Component', () => {
  const originalConsoleError = console.error;
  const originalWindowLocation = window.location;

  beforeAll(() => {
    console.error = vi.fn();
    delete window.location;
    window.location = { reload: vi.fn() } as unknown as Location;
  });

  afterAll(() => {
    console.error = originalConsoleError;
    window.location = originalWindowLocation;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render error UI when error occurs', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Component')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Ocorreu um erro inesperado. Por favor, tente novamente.');
  });

  it('should show error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not show error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should handle retry button click', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Tentar Novamente');
    fireEvent.click(retryButton);

    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should log error details to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });
}); 