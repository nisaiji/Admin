// Requests.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Requests from "../../components/dashBoard/Request";
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

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("Requests Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays "No request right now" when no requests are returned', async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { requests: [] },
    });

    render(<Requests />);

    await waitFor(() => {
      expect(screen.getByText("No request right now")).toBeInTheDocument();
    });
  });

  test("renders table rows when requests are available", async () => {
    const fakeRequests = [
      {
        _id: "1",
        status: "pending",
        teacher: {
          firstname: "Alice",
          lastname: "Wonder",
          class: "5",
          section: "A",
          forgetPasswordCount: 2,
        },
        reason: "forgetPassword",
        otp: "123456",
      },
      {
        _id: "2",
        status: "accept",
        teacher: {
          firstname: "Bob",
          lastname: "Builder",
          class: "6",
          section: "B",
          forgetPasswordCount: 3,
        },
        reason: "changeDevice",
        otp: null, // should render as "-" in the UI
      },
    ];

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { requests: fakeRequests },
    });

    render(<Requests />);

    await waitFor(() => {
      expect(screen.getByText("Alice Wonder")).toBeInTheDocument();
      expect(screen.getByText("Bob Builder")).toBeInTheDocument();
    });

    // Verify the reason labels (using the component’s conversion logic)
    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(screen.getByText("Changed Device")).toBeInTheDocument();

    // Verify OTP values: first request shows "123456", second should show "-"
    expect(screen.getByText("123456")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test("filters requests based on selected tab", async () => {
    const fakeRequests = [
      {
        _id: "1",
        status: "pending",
        teacher: {
          firstname: "Alice",
          lastname: "Wonder",
          class: "5",
          section: "A",
          forgetPasswordCount: 2,
        },
        reason: "forgetPassword",
        otp: "111111",
      },
      {
        _id: "2",
        status: "accept",
        teacher: {
          firstname: "Bob",
          lastname: "Builder",
          class: "6",
          section: "B",
          forgetPasswordCount: 3,
        },
        reason: "changeDevice",
        otp: "222222",
      },
      {
        _id: "3",
        status: "reject",
        teacher: {
          firstname: "Charlie",
          lastname: "Chocolate",
          class: "7",
          section: "C",
          forgetPasswordCount: 4,
        },
        reason: "technical",
        otp: "333333",
      },
    ];

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { requests: fakeRequests },
    });

    render(<Requests />);

    await waitFor(() => {
      expect(screen.getByText("Alice Wonder")).toBeInTheDocument();
      expect(screen.getByText("Bob Builder")).toBeInTheDocument();
      expect(screen.getByText("Charlie Chocolate")).toBeInTheDocument();
    });

    // Click on the "approved" tab (t function returns "labels.approved")
    fireEvent.click(screen.getByText("labels.approved"));

    await waitFor(() => {
      // Only "accept" (and "complete") requests should show.
      // In our fake data, only Bob Builder is approved.
      expect(screen.queryByText("Alice Wonder")).not.toBeInTheDocument();
      expect(screen.getByText("Bob Builder")).toBeInTheDocument();
      expect(screen.queryByText("Charlie Chocolate")).not.toBeInTheDocument();
    });

    // Click on the "rejected" tab (only "reject" status)
    fireEvent.click(screen.getByText("labels.rejected"));

    await waitFor(() => {
      expect(screen.queryByText("Alice Wonder")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob Builder")).not.toBeInTheDocument();
      expect(screen.getByText("Charlie Chocolate")).toBeInTheDocument();
    });
  });

  test.skip("calls handleRequestAction with 'accept' when Approve is clicked", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "Alice",
        lastname: "Wonder",
        class: "5",
        section: "A",
        forgetPasswordCount: 2,
      },
      reason: "forgetPassword",
      otp: "111111",
    };

    // First API call returns one pending request.
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { requests: [fakeRequest] },
    });
    // Simulate a successful update (approve)
    axiosClient.put.mockResolvedValueOnce({
      statusCode: 200,
      result: "Request approved successfully",
    });
    // After update, the component refreshes the data.
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { requests: [] },
    });

    render(<Requests />);

    await waitFor(() => {
      expect(screen.getByText("Alice Wonder")).toBeInTheDocument();
    });

    // Click the Approve button
    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledWith(expect.any(String), {
        eventId: "1",
        status: "accept",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Request approved successfully"
      );
    });
  });

  test.skip("calls handleRequestAction with 'reject' when Reject is clicked", async () => {
    const fakeRequest = {
      _id: "1",
      status: "pending",
      teacher: {
        firstname: "Alice",
        lastname: "Wonder",
        class: "5",
        section: "A",
        forgetPasswordCount: 2,
      },
      reason: "forgetPassword",
      otp: "111111",
    };

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { requests: [fakeRequest] },
    });
    axiosClient.put.mockResolvedValueOnce({
      statusCode: 200,
      result: "Request rejected successfully",
    });
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { requests: [] },
    });

    render(<Requests />);

    await waitFor(() => {
      expect(screen.getByText("Alice Wonder")).toBeInTheDocument();
    });

    // Click the Reject button
    const rejectButton = screen.getByText("Reject");
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledWith(expect.any(String), {
        eventId: "1",
        status: "reject",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Request rejected successfully"
      );
    });
  });
});
