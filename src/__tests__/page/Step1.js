import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Step1 from "../../pages/Step1";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import toast from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../utils/helper", () => ({
  VITE_PHONE_AND_EMAIL_WIDGET_ID: "1",
}));

describe("Step1 component", () => {
  let mockDispatch;

  beforeEach(() => {
    Object.defineProperty(import.meta, "env", {
      value: {
        VITE_PHONE_AND_EMAIL_WIDGET_ID: "mock-widget-id",
        VITE_PHONE_AND_EMAIL_AUTH_TOKEN: "mock-auth-token",
      },
      writable: true,
    });

    window.configuration = {
      widgetId: import.meta.env.VITE_PHONE_AND_EMAIL_WIDGET_ID,
      tokenAuth: import.meta.env.VITE_PHONE_AND_EMAIL_AUTH_TOKEN,
    };

    jest.useFakeTimers();
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockReturnValue({ status: {} });
    axiosClient.post = jest.fn();
    toast.success = jest.fn();
    toast.error = jest.fn();
    window.sendOtp = jest.fn((_, success) => success({ message: "otpReqId" }));
    window.verifyOtp = jest.fn((_, success) => success({ message: "token" }));
    window.retryOtp = jest.fn((_, success) => success({ message: "otpReqId" }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renders phone input", () => {
    render(
      <MemoryRouter>
        <Step1 goback={jest.fn()} setStep={jest.fn()} setLoading={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
  });

  it("shows error on empty submit", () => {
    render(
      <MemoryRouter>
        <Step1 goback={jest.fn()} setStep={jest.fn()} setLoading={jest.fn()} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText(/continue/i));
    expect(screen.getByText(/validationError.phone/i)).toBeInTheDocument();
  });

  it("submits phone and shows OTP inputs", async () => {
    axiosClient.post.mockResolvedValueOnce({ result: {} });
    render(
      <MemoryRouter>
        <Step1 goback={jest.fn()} setStep={jest.fn()} setLoading={jest.fn()} />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/phone/i), {
      target: { value: "9876543210" },
    });
    fireEvent.click(screen.getByText(/continue/i));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("handles OTP entry and backspace", async () => {
    axiosClient.post.mockResolvedValueOnce({ result: {} });
    render(
      <MemoryRouter>
        <Step1 goback={jest.fn()} setStep={jest.fn()} setLoading={jest.fn()} />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/phone/i), {
      target: { value: "9876543210" },
    });
    fireEvent.click(screen.getByText(/continue/i));
    await waitFor(() => screen.getAllByRole("textbox"));
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.keyDown(inputs[0], { key: "Backspace" });
    expect(inputs[0].value).toBe("");
  });

  it("resends OTP", async () => {
    axiosClient.post.mockResolvedValueOnce({ result: {} });
    render(
      <MemoryRouter>
        <Step1 goback={jest.fn()} setStep={jest.fn()} setLoading={jest.fn()} />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/phone/i), {
      target: { value: "9876543210" },
    });
    fireEvent.click(screen.getByText(/continue/i));
    await waitFor(() => screen.getByText(/resend/i));
    act(() => jest.advanceTimersByTime(31000));
    fireEvent.click(screen.getByText(/resend/i));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringMatching(/resent/i)
      )
    );
  });

  it("verifies OTP", async () => {
    axiosClient.post.mockResolvedValueOnce({ result: {} });
    render(
      <MemoryRouter>
        <Step1 goback={jest.fn()} setStep={jest.fn()} setLoading={jest.fn()} />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/phone/i), {
      target: { value: "9876543210" },
    });
    fireEvent.click(screen.getByText(/continue/i));
    await waitFor(() => screen.getByText(/verify/i));
    fireEvent.click(screen.getByText(/verify/i));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });
});
