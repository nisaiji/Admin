import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SettingsPage from "../../components/settings/SettingsPage";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const activeSession = {
  _id: "active-session",
  academicStartYear: 2026,
  academicEndYear: 2027,
};

const upcomingSession = {
  _id: "upcoming-session",
  academicStartYear: 2027,
  academicEndYear: 2028,
  status: "upcoming",
};

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads the next upcoming session candidate for admins", async () => {
    axiosClient.get.mockResolvedValue({
      result: [activeSession],
    });

    render(<SettingsPage />);

    expect(
      await screen.findByText("Next upcoming session: 2027-28"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create upcoming session/i }),
    ).toBeInTheDocument();
  });

  test("shows the existing upcoming session instead of a create action", async () => {
    axiosClient.get.mockResolvedValue({
      result: [activeSession, upcomingSession],
    });

    render(<SettingsPage />);

    expect(
      await screen.findByText("Upcoming session ready: 2027-28"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /create upcoming session/i }),
    ).not.toBeInTheDocument();
  });

  test("creates the next upcoming session and refreshes the session timeline", async () => {
    axiosClient.get
      .mockResolvedValueOnce({
        result: [activeSession],
      })
      .mockResolvedValueOnce({
        result: [activeSession, upcomingSession],
      });
    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: "Upcoming session created successfully.",
    });

    render(<SettingsPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /create upcoming session/i }),
    );

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith(
        EndPoints.ADMIN.CREATE_SESSION,
        {
          academicStartYear: 2027,
          academicEndYear: 2028,
          status: "upcoming",
        },
      );
    });

    expect(
      await screen.findByText("Upcoming session created successfully."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Upcoming session ready: 2027-28"),
    ).toBeInTheDocument();
  });

  test("surfaces API errors during upcoming session creation", async () => {
    axiosClient.get.mockResolvedValue({
      result: [activeSession],
    });
    axiosClient.post.mockRejectedValue("Only one upcoming session is allowed.");

    render(<SettingsPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /create upcoming session/i }),
    );

    expect(
      await screen.findByText("Only one upcoming session is allowed."),
    ).toBeInTheDocument();
  });
});
