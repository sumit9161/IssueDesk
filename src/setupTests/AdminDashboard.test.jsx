import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import { vi, describe, it, beforeEach, expect, afterEach } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

delete window.location;
window.location = { href: '' };

const mockLocalStorage = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AdminDashboard Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });


  it('renders the admin dashboard title', () => {
    renderComponent();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders all navigation buttons with correct text', () => {
    renderComponent();
    expect(screen.getByText('View All Tickets')).toBeInTheDocument();
    expect(screen.getByText('Create User')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('navigates to tickets page when "View All Tickets" is clicked', () => {
    renderComponent();
    const viewTicketsButton = screen.getByText('View All Tickets');
    fireEvent.click(viewTicketsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/tickets');
  });

  it('removes token from localStorage and redirects to home on logout', () => {
    renderComponent();
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(window.location.href).toBe('http://localhost:5173/');
  });

  it('has proper button roles', () => {
    renderComponent();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'View All Tickets' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('handles missing localStorage gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: { removeItem: () => { throw new Error('localStorage not available'); } },
      configurable: true,
    });
    renderComponent();
    const logoutButton = screen.getByText('Logout');
    expect(() => fireEvent.click(logoutButton)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Could not access localStorage:',
      expect.any(Error)
    );
    expect(window.location.href).toBe('http://localhost:5173/');
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    });
    consoleSpy.mockRestore();
  });

});
