import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserDashboard from '../pages/UserDashboard';
import AuthContext from '../Context/AuthContext';
import axios from '../api/axios';
import { vi, describe, it, beforeEach, expect, afterEach } from 'vitest';


vi.mock('../api/axios');
vi.mock('../components/TicketCard', () => ({
  default: ({ ticket, onClick }) => (
    <div
      data-testid={`ticket-card-${ticket.ticketId}`}
      onClick={onClick}
      className="ticket-card"
    >
      <p>ID: {ticket.ticketId}</p>
      <p>Title: {ticket.title}</p>
      <p>Priority: {ticket.priority}</p>
      <p>Status: {ticket.status}</p>
    </div>
  )
}));

vi.mock('../components/TicketDetailsUser', () => ({
  default: ({ ticket, onClose, onRefresh }) => (
    <div data-testid="ticket-details-user">
      <h2>Ticket Details: {ticket.title}</h2>
      <button onClick={onClose}>Close</button>
      <button onClick={onRefresh}>Refresh</button>
    </div>
  )
}));

vi.mock('../components/CreateTicketForm', () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="create-ticket-form">
      <h2>Create New Ticket</h2>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onSuccess}>Success</button>
    </div>
  )
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UserDashboard Component', () => {
  const mockLogout = vi.fn();
  const mockAuthContext = {
    token: 'test-token',
    logout: mockLogout,
    username: 'TestUser',
    userId: 123,
    role: 'User',
    team: 'Development',
  };

  const mockTickets = [
    { ticketId: 1, title: 'Test Ticket 1', priority: 'High', status: 'Open', description: 'Test description 1' },
    { ticketId: 2, title: 'Test Ticket 2', priority: 'Medium', status: 'Assigned', description: 'Test description 2' },
    { ticketId: 3, title: 'Test Ticket 3', priority: 'Low', status: 'New', description: 'Test description 3' },
    { ticketId: 4, title: 'Test Ticket 4', priority: 'Critical', status: 'InProgress', description: 'Test description 4' },
    { ticketId: 5, title: 'Test Ticket 5', priority: 'High', status: 'Resolved', description: 'Test description 5' }
  ];

  const renderWithContext = (contextValue = mockAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <UserDashboard />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockTickets });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders navigation bar with all tab buttons', async () => {
      renderWithContext();
      expect(screen.getByText('User Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Assigned Tickets')).toBeInTheDocument();
      expect(screen.getByText('Requested Tickets')).toBeInTheDocument();
      expect(screen.getByText('Team Tickets')).toBeInTheDocument();
      expect(screen.getByText('Create Ticket')).toBeInTheDocument();
    });

    it('renders logout button and profile icon', () => {
      renderWithContext();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to requested tab when clicked', async () => {
      renderWithContext();
      const requestedButton = screen.getByText('Requested Tickets');
      fireEvent.click(requestedButton);
      expect(requestedButton).toHaveClass('active');
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/Tickets/user/requested', {
          headers: { Authorization: 'Bearer test-token' }
        });
      });
    });

    it('switches to create ticket tab when clicked', () => {
      renderWithContext();
      const createButton = screen.getByText('Create Ticket');
      fireEvent.click(createButton);
      expect(createButton).toHaveClass('active');
      expect(screen.getByTestId('create-ticket-form')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('fetches assigned tickets on component mount', async () => {
      renderWithContext();
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/Tickets/user/assigned', {
          headers: { Authorization: 'Bearer test-token' }
        });
      });
    });

    it('handles API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error('API Error'));
      renderWithContext();
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Error fetching assigned tickets:',
          expect.any(Error)
        );
      });
      consoleError.mockRestore();
    });
  });

  describe('Ticket Display', () => {
    it('renders ticket cards when tickets are available', async () => {
      renderWithContext();
      await waitFor(() => {
        expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('ticket-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('ticket-card-3')).toBeInTheDocument();
        expect(screen.getByTestId('ticket-card-4')).toBeInTheDocument();
      });
    });

    it('opens and closes ticket details when appropriate buttons clicked', async () => {
      renderWithContext();
      await waitFor(() => {
        expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId('ticket-card-1'));
      expect(screen.getByTestId('ticket-details-user')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('ticket-details-user')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('displays pagination when more than 4 tickets and shows correct tickets on page change', async () => {
      renderWithContext();
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
      expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('ticket-card-5')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('2'));
      expect(screen.getByTestId('ticket-card-5')).toBeInTheDocument();
      expect(screen.queryByTestId('ticket-card-1')).not.toBeInTheDocument();
    });
  });

  describe('Profile Management', () => {
    it('opens and closes profile popover on profile icon click', () => {
      renderWithContext();
      const profileButton = screen.getByRole('button', { name: /profile/i });
      fireEvent.click(profileButton);
      expect(screen.getByRole('region', { name: /user profile info/i })).toBeInTheDocument();
      fireEvent.click(profileButton);
      expect(screen.queryByRole('region', { name: /user profile info/i })).not.toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('calls logout and navigates to home when logout button is clicked', () => {
      renderWithContext();
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Create Ticket Form', () => {
    it('shows and closes create ticket form correctly', () => {
      renderWithContext();
      fireEvent.click(screen.getByText('Create Ticket'));
      expect(screen.getByTestId('create-ticket-form')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('create-ticket-form')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('resets selected ticket when switching tabs', async () => {
      renderWithContext();
      await waitFor(() => {
        expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId('ticket-card-1'));
      expect(screen.getByTestId('ticket-details-user')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Requested Tickets'));
      await waitFor(() => {
        expect(screen.queryByTestId('ticket-details-user')).not.toBeInTheDocument();
      });
    });
  });

  describe('Context Integration', () => {
    it('works with minimal context data', () => {
      const minimalContext = {
        token: 'test-token',
        logout: mockLogout,
        username: 'TestUser',
        userId: 1,
        role: 'User',
        team: 'TestTeam',
      };
      renderWithContext(minimalContext);
      expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      renderWithContext();
      const profileButton = screen.getByRole('button', { name: /profile/i });
      expect(profileButton).toHaveAttribute('aria-label', 'Profile');
      fireEvent.click(profileButton);
      const profilePopover = screen.getByRole('region', { name: /user profile info/i });
      expect(profilePopover).toHaveAttribute('aria-label', 'User profile info');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined tickets response gracefully', async () => {
      axios.get.mockResolvedValueOnce({ data: undefined });
      renderWithContext();
      await waitFor(() => {
        expect(screen.getByText('No tickets found.')).toBeInTheDocument();
      });
    });

    it('handles null tickets response gracefully', async () => {
      axios.get.mockResolvedValueOnce({ data: null });
      renderWithContext();
      await waitFor(() => {
        expect(screen.getByText('No tickets found.')).toBeInTheDocument();
      });
    });
  });
});
