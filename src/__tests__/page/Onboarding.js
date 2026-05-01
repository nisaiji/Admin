import React from "react";
import moment from "moment";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { OnboardingScreen } from "../../components/onboarding/Onboarding";
import { setSessionCreatedStatus } from "../../store/AppAuthSlice";
import { createSession } from "../../services/sessionService";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

jest.mock("../../store/AppAuthSlice", () => ({
  setSessionCreatedStatus: jest.fn((value) => ({
    type: "auth/setSessionCreatedStatus",
    payload: value,
  })),
}));

jest.mock("../../services/sessionService", () => ({
  createSession: jest.fn(),
  getErrorMessage: jest.fn((error, fallbackMessage) =>
    typeof error === "string" ? error : fallbackMessage,
  ),
}));

describe("OnboardingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates the selected session through the shared session service", async () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const today = moment();
    const currentStartYear =
      today.month() >= 3 ? today.year() : today.year() - 1;

    useDispatch.mockReturnValue(dispatch);
    useNavigate.mockReturnValue(navigate);
    createSession.mockResolvedValue({
      statusCode: 200,
      result: "Session created successfully.",
    });

    render(<OnboardingScreen />);

    fireEvent.click(screen.getAllByRole("button", { name: /select session/i })[1]);
    fireEvent.click(screen.getByRole("button", { name: /activate & continue/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /yes, activate session/i }),
    );

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith({
        academicStartYear: currentStartYear + 1,
        academicEndYear: currentStartYear + 2,
        status: "upcoming",
      });
    });

    expect(setSessionCreatedStatus).toHaveBeenCalledWith(true);
    expect(dispatch).toHaveBeenCalledWith({
      type: "auth/setSessionCreatedStatus",
      payload: true,
    });
    expect(toast.success).toHaveBeenCalledWith("Session created successfully.");
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
