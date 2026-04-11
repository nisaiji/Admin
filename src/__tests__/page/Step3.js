import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Step3 from "../../pages/Step3";
import { useDispatch } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import { setAuth } from "../../store/AppAuthSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

jest.mock("react-redux", () => ({ useDispatch: jest.fn() }));
jest.mock("../../services/axiosClient", () => ({ axiosClient: { put: jest.fn() } }));
jest.mock("../../store/AppAuthSlice", () => ({ setAuth: jest.fn() }));
jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => [k => k] }));

describe("Step3 Component", () => {
  let mockDispatch;
  let mockGoback;
  let mockSetStep;
  let mockSetLoading;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockGoback = jest.fn();
    mockSetStep = jest.fn();
    mockSetLoading = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    jest.clearAllMocks();
  });

  it("renders password and confirm password fields", () => {
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    expect(screen.getByPlaceholderText("placeholders.password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("placeholders.confirmPassword")).toBeInTheDocument();
    expect(screen.getByTestId("back")).toBeInTheDocument();
    expect(screen.getByTestId("submitPage3")).toBeInTheDocument();
  });

  it("updates password and confirm password inputs", () => {
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.password"), { target: { value: "password123" } });
    expect(screen.getByPlaceholderText("placeholders.password").value).toBe("password123");
    fireEvent.change(screen.getByPlaceholderText("placeholders.confirmPassword"), { target: { value: "password123" } });
    expect(screen.getByPlaceholderText("placeholders.confirmPassword").value).toBe("password123");
  });

  it("toggles password visibility", () => {
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    const toggleBtn = screen.getAllByAltText("Toggle Password Visibility")[0];
    const input = screen.getByPlaceholderText("placeholders.password");
    expect(input.type).toBe("password");
    fireEvent.click(toggleBtn);
    expect(input.type).toBe("text");
  });

  it("toggles confirm password visibility", () => {
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    const toggleBtn = screen.getAllByAltText("Toggle Confirm Password Visibility")[0] || screen.getAllByAltText("Toggle Password Visibility")[1];
    const input = screen.getByPlaceholderText("placeholders.confirmPassword");
    expect(input.type).toBe("password");
    fireEvent.click(toggleBtn);
    expect(input.type).toBe("text");
  });

  it("shows validation errors for empty fields", () => {
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.click(screen.getByTestId("submitPage3"));
    expect(screen.getByText("validationError.password")).toBeInTheDocument();
    expect(screen.getByText("validationError.confirmPassword")).toBeInTheDocument();
  });

  it("shows validation errors for short password and mismatch", () => {
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.password"), { target: { value: "short" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.confirmPassword"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByTestId("submitPage3"));
    expect(screen.getByText("validationError.passwordLength")).toBeInTheDocument();
    expect(screen.getByText("validationError.passwordMatch")).toBeInTheDocument();
  });

  it("submits successfully and updates state", async () => {
    axiosClient.put.mockResolvedValue({ statusCode: 200, result: "Success" });
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.confirmPassword"), { target: { value: "password123" } });
    fireEvent.click(screen.getByTestId("submitPage3"));
    await waitFor(() => expect(axiosClient.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Success");
    expect(mockDispatch).toHaveBeenCalledWith(setAuth({ passwordUpdated: true }));
    expect(mockSetStep).toHaveBeenCalledWith(4);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it("handles API error", async () => {
    axiosClient.put.mockRejectedValue("Error");
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.confirmPassword"), { target: { value: "password123" } });
    fireEvent.click(screen.getByTestId("submitPage3"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Error"));
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it("calls goback on back button", () => {
    render(<Step3 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.click(screen.getByTestId("back"));
    expect(mockGoback).toHaveBeenCalled();
  });
});
