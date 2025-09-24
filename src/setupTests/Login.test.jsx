import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import axios from 'axios';
import { vi, describe, it, beforeEach, expect, afterEach } from 'vitest';
import { toast } from 'react-toastify';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 🔹 Helper mocks to avoid deep inline nesting
const mockLogin = vi.fn();
const mockNeverResolve = () => new Promise(() => {});
const mockAxiosSuccess = (response) => axios.post.mockResolvedValueOnce(response);
const mockAxiosError = (error) => axios.post.mockRejectedValueOnce(error);

const renderWithContext = (contextValue = { login: mockLogin }) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={contextValue}>
        <Login />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Login Component', () => {
  describe('Component Rendering', () => {
    it('renders all form elements correctly', () => {
      renderWithContext();
      expect(screen.getByText('Internal Ticketing System')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('updates email value when user types', () => {
      renderWithContext();
      const emailInput = screen.getByPlaceholderText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Loading State', () => {
    it('shows loading text when form is being submitted', async () => {
      axios.post.mockImplementation(mockNeverResolve); // ✅ moved to helper
      renderWithContext();
      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      expect(screen.getByText('Loading ..')).toBeInTheDocument();
    });
  });

  describe('Successful Login Scenarios', () => {
    it('handles successful login for regular user', async () => {
      const mockResponse = {
        data: {
          token: 'user-token',
          role: 'User',
          id: 1,
          username: 'TestUser',
          team: 'Development',
        },
      };
      mockAxiosSuccess(mockResponse); // ✅ no inline nested function
      renderWithContext();
      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'userpass' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'user-token', 'User', 1, 'TestUser', 'Development'
        );
      });
      expect(toast.success).toHaveBeenCalledWith('Login successful');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard');
      }, { timeout: 2000 });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when login fails with server response', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };
      mockAxiosError(errorResponse); // ✅ moved to helper
      renderWithContext();
      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login failed: Invalid credentials');
      }, { timeout: 2000 });
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('prevents form submission when email is empty due to HTML5 validation', async () => {
      renderWithContext();
      const passwordInput = screen.getByPlaceholderText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    it('makes correct API call with form data', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          role: 'User',
          id: 1,
          username: 'TestUser',
          team: 'TestTeam',
        },
      };
      mockAxiosSuccess(mockResponse); // ✅ moved to helper
      renderWithContext();
      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      fireEvent.change(emailInput, { target: { value: 'api@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'apipassword' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:5034/api/Auth/login',
          {
            email: 'api@test.com',
            password: 'apipassword',
          }
        );
      });
    });
  });

  describe('Context Integration', () => {
    it('works without AuthContext login function', () => {
      const { container } = renderWithContext({});
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure for screen readers', () => {
      renderWithContext();
      const form = screen.getByRole('button').closest('form');
      expect(form).toBeInTheDocument();
      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});
