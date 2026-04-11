// Leaves.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Leaves from "../../components/dashboard/Leaves";
import { axiosClient } from "../../services/axiosClient";
import { toast, Toaster } from "react-hot-toast";

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("Leaves Component", () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render "No request right now" when no requests returned', async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [] }] },
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("No request right now")).toBeInTheDocument();
    });
  });

  test("should render table rows when API returns requests", async () => {
    const fakeRequests = [
      {
        _id: "1",
        status: "pending",
        teacher: {
          firstname: "John",
          lastname: "Doe",
          class: "10",
          section: "A",
        },
        reason: "Sick",
        pastLeaves: 1,
        description: "I am sick",
        startTime: "2025-01-01T00:00:00Z",
        endTime: "2025-01-05T00:00:00Z",
      },
      {
        _id: "2",
        status: "accept",
        teacher: {
          firstname: "Jane",
          lastname: "Smith",
          class: "12",
          section: "B",
        },
        guestTeacher: {
          username: "jane123",
          tagline: "Sub",
          secretKey: "secret",
        },
        reason: "Personal",
        pastLeaves: 2,
        description: "Personal reasons",
        startTime: "2025-02-01T00:00:00Z",
        endTime: "2025-02-03T00:00:00Z",
      },
    ];

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: fakeRequests }] },
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test("should switch tabs correctly", async () => {
    const fakeRequests = [
      {
        _id: "1",
        status: "pending",
        teacher: {
          firstname: "John",
          lastname: "Doe",
          class: "10",
          section: "A",
        },
        reason: "Sick",
        pastLeaves: 1,
        description: "I am sick",
        startTime: "2025-01-01T00:00:00Z",
        endTime: "2025-01-05T00:00:00Z",
      },
      {
        _id: "2",
        status: "accept",
        teacher: {
          firstname: "Jane",
          lastname: "Smith",
          class: "12",
          section: "B",
        },
        guestTeacher: {
          username: "jane123",
          tagline: "Sub",
          secretKey: "secret",
        },
        reason: "Personal",
        pastLeaves: 2,
        description: "Personal reasons",
        startTime: "2025-02-01T00:00:00Z",
        endTime: "2025-02-03T00:00:00Z",
      },
    ];

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: fakeRequests }] },
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Click on the "approved" tab (the t function returns "labels.approved")
    fireEvent.click(screen.getByText("labels.approved"));

    await waitFor(() => {
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Click on the "rejected" tab (no rejected requests – expect the no-request message)
    fireEvent.click(screen.getByText("labels.rejected"));

    await waitFor(() => {
      expect(screen.getByText("No request right now")).toBeInTheDocument();
    });
  });

  test("should not expand row on dropdown click if request is pending", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "John",
        lastname: "Doe",
        class: "10",
        section: "A",
      },
      reason: "Sick",
      pastLeaves: 1,
      description: "I am sick",
      startTime: "2025-01-01T00:00:00Z",
      endTime: "2025-01-05T00:00:00Z",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [fakeRequest] }] },
    });

    const { container } = render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // The dropdown image (the first img in the row) should not expand the row if status is "pending"
    const dropdownImg = container.querySelector("img");
    fireEvent.click(dropdownImg);

    // No input for username should appear (since expansion is not allowed for "pending")
    expect(
      screen.queryByPlaceholderText("Enter Username")
    ).not.toBeInTheDocument();
  });

  test("should expand row when Approve button is clicked for pending request", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "John",
        lastname: "Doe",
        class: "10",
        section: "A",
      },
      reason: "Sick",
      pastLeaves: 1,
      description: "I am sick",
      startTime: "2025-01-01T00:00:00Z",
      endTime: "2025-01-05T00:00:00Z",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [fakeRequest] }] },
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click the Approve button (in the last column for pending requests)
    fireEvent.click(screen.getByText("Approve"));

    // Now the row should expand and show the username input
    expect(screen.getByPlaceholderText("Enter Username")).toBeInTheDocument();
  });

  test("should open description popup when approve image is clicked", async () => {
    const fakeRequest = {
      _id: "2",
      status: "accept",
      teacher: {
        firstname: "Jane",
        lastname: "Smith",
        class: "12",
        section: "B",
      },
      guestTeacher: {
        username: "jane123",
        tagline: "Sub",
        secretKey: "secret",
      },
      reason: "Personal",
      pastLeaves: 2,
      description: "Personal reasons",
      startTime: "2025-02-01T00:00:00Z",
      endTime: "2025-02-03T00:00:00Z",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [fakeRequest] }] },
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Find the approve image using its src attribute
    const descriptionButton = screen.getByAltText("description");

    fireEvent.click(descriptionButton);

    await waitFor(() => {
      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("End Date")).toBeInTheDocument();
    });

    const closeButton = screen.getByAltText("Close");

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(closeButton).not.toBeInTheDocument();
    });
  });

  test("should open confirmation popup when Reject button is clicked", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "John",
        lastname: "Doe",
        class: "10",
        section: "A",
      },
      reason: "Sick",
      pastLeaves: 1,
      description: "I am sick",
      startTime: "2025-01-01T00:00:00Z",
      endTime: "2025-01-05T00:00:00Z",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [fakeRequest] }] },
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click the Reject button in the action column
    fireEvent.click(screen.getByText("Reject"));

    await waitFor(() => {
      expect(
        screen.getByText("Please Confirm reject this leave request")
      ).toBeInTheDocument();
    });
  });

  test.skip("should show error toast if form fields are empty on Save", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "John",
        lastname: "Doe",
        class: "10",
        section: "A",
      },
      reason: "Sick",
      pastLeaves: 1,
      description: "I am sick",
      startTime: "2025-01-01T00:00:00Z",
      endTime: "2025-01-05T00:00:00Z",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [fakeRequest] }] },
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Expand the row using the Approve button
    fireEvent.click(screen.getByText("Approve"));

    // Click Save without filling in any form fields
    fireEvent.click(screen.getByText("Save"));

    // await waitFor(() => {
    //   expect(toast.error).toHaveBeenCalledWith("Please fill all the fields");
    // });
  });

  test.skip("should call axiosClient.put and show success toast on successful Save", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "John",
        lastname: "Doe",
        class: "10",
        section: "A",
      },
      reason: "Sick",
      pastLeaves: 1,
      description: "I am sick",
      startTime: "2025-01-01T00:00:00Z",
      endTime: "2025-01-05T00:00:00Z",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [fakeRequest] }] },
    });

    axiosClient.put.mockResolvedValueOnce({
      statusCode: 200,
      result: "Success",
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Expand the row via the Approve button
    fireEvent.click(screen.getByText("Approve"));

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText("Enter Username"), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Substitute Teacher"), {
      target: { value: "Full Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Click Save
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledTimes(1);
      expect(axiosClient.put).toHaveBeenCalledWith(expect.any(String), {
        leaveRequestId: "1",
        status: "accept",
        username: "user1",
        tagline: "Full Name",
        password: "password123",
      });
      expect(toast.success).toHaveBeenCalledWith("Success");
    });
  });

  test.skip("should call axiosClient.put with reject status on confirmation popup submit", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "John",
        lastname: "Doe",
        class: "10",
        section: "A",
      },
      reason: "Sick",
      pastLeaves: 1,
      description: "I am sick",
      startTime: "2025-01-01T00:00:00Z",
      endTime: "2025-01-05T00:00:00Z",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { leaveRequests: [{ teachers: [fakeRequest] }] },
    });

    axiosClient.put.mockResolvedValueOnce({
      statusCode: 200,
      result: "Rejected successfully",
    });

    render(<Leaves />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Reject"));

    fireEvent.click(screen.getByText("buttons.submit"));

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledWith(expect.any(String), {
        leaveRequestId: "1",
        status: "reject",
      });
      expect(toast.success).toHaveBeenCalledWith("Rejected successfully");
    });
  });
});
