import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TicketDetails from "../components/TicketDetails"; 
import axios from "axios";
import { toast } from "react-toastify";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";


vi.mock("axios");
const mockedAxios = axios;

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (id = "123") => {
  return render(
    <MemoryRouter initialEntries={[`/tickets/${id}`]}>
      <Routes>
        <Route path="/tickets/:id" element={<TicketDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("token", "mocked-token");
});

describe("TicketDetails Component - Important Tests", () => {
  const sampleTicket = {
    ticketId: 123,
    title: "Test Ticket",
    description: "This is a test description",
    priority: "High",
    status: "New",
    category: "Bug",
    team: "Dev Team",
    requesterName: "John Doe",
    assigneeName: "Jane Smith",
    createdDate: "2023-08-01T10:00:00Z",
    dueDate: "2023-08-15T00:00:00Z",
  };

  it("displays loading initially and fetches ticket data successfully", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: sampleTicket });

    renderWithRouter();

    expect(screen.getByText(/loading ticket/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/ticket details/i)).toBeInTheDocument();
      expect(screen.getByText(sampleTicket.title)).toBeInTheDocument();
      expect(screen.getByText(sampleTicket.description)).toBeInTheDocument();
      expect(screen.getByText(sampleTicket.status)).toBeInTheDocument();
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:5034/api/Tickets/${sampleTicket.ticketId}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mocked-token",
        }),
      })
    );
  });

  it("shows error toast on failed ticket fetch", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    renderWithRouter();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load ticket details");
    });
  });

  it("enters edit mode and updates status and due date fields", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: sampleTicket });

    renderWithRouter();

    await screen.findByText(sampleTicket.title);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const statusSelect = screen.getByRole("combobox");
    expect(statusSelect.value).toBe(sampleTicket.status);

    fireEvent.change(statusSelect, { target: { value: "Resolved" } });
    expect(statusSelect.value).toBe("Resolved");

    const dueDateInput = screen.getByDisplayValue("2023-08-15");
    expect(dueDateInput).toBeInTheDocument();
    expect(dueDateInput).toHaveAttribute("type", "date");

    fireEvent.change(dueDateInput, { target: { value: "2023-08-20" } });
    expect(dueDateInput.value).toBe("2023-08-20");
  });

  it("calls API and shows success toast on save, then exits edit mode", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: sampleTicket });
    mockedAxios.put.mockResolvedValueOnce({});

    renderWithRouter();

    await screen.findByText(sampleTicket.title);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "Resolved" } });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:5034/api/Tickets/admin/update",
        expect.objectContaining({
          ticketId: sampleTicket.ticketId,
          status: "Resolved",
          dueDate: expect.any(String),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mocked-token",
            "Content-Type": "application/json",
          }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Ticket updated successfully");
    });

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("shows error toast on failed save and remains in edit mode", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: sampleTicket });
    mockedAxios.put.mockRejectedValueOnce(new Error("Update failed"));

    renderWithRouter();

    await screen.findByText(sampleTicket.title);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Update failed. Please check your data and try again."
      );
    });

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("calls navigate(-1) when Back button clicked", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: sampleTicket });

    renderWithRouter();

    await screen.findByText(sampleTicket.title);

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
