import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Step4 from "../../pages/Step4";
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

describe("Step4 Component", () => {
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

  it("renders all fields and buttons", () => {
    render(<Step4 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    expect(screen.getByPlaceholderText("placeholders.schoolName")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("placeholders.affiliationNo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("placeholders.username")).toBeInTheDocument();
    expect(screen.getByText("buttons.back")).toBeInTheDocument();
    expect(screen.getByText("buttons.continue")).toBeInTheDocument();
  });

  it("updates input values on change", () => {
    render(<Step4 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    const schoolNameInput = screen.getByPlaceholderText("placeholders.schoolName");
    fireEvent.change(schoolNameInput, { target: { name: "schoolName", value: "My School" } });
    expect(schoolNameInput.value).toBe("My School");
  });

  it("shows validation errors for empty fields", async () => {
    render(<Step4 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    const continueBtn = screen.getByText("buttons.continue");
    fireEvent.click(continueBtn);
    expect(await screen.findByText("validationError.schoolName")).toBeInTheDocument();
    expect(screen.getByText("validationError.affiliationNumber")).toBeInTheDocument();
    expect(screen.getByText("validationError.username")).toBeInTheDocument();
  });

  it("shows length errors for short inputs", async () => {
    render(<Step4 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.schoolName"), { target: { name: "schoolName", value: "Short" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.affiliationNo"), { target: { name: "affiliationNo", value: "123" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.username"), { target: { name: "username", value: "usr" } });
    fireEvent.click(screen.getByText("buttons.continue"));
    expect(await screen.findByText("validationError.schoolNameLength")).toBeInTheDocument();
    expect(screen.getByText("validationError.affiliationNumberLength")).toBeInTheDocument();
    expect(screen.getByText("validationError.usernameLength")).toBeInTheDocument();
  });

  it("submits form successfully and updates state", async () => {
    axiosClient.put.mockResolvedValue({ statusCode: 200, result: "Success" });
    render(<Step4 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.schoolName"), { target: { value: "My School Name" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.affiliationNo"), { target: { value: "123456" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.username"), { target: { value: "username1" } });

    fireEvent.click(screen.getByText("buttons.continue"));
    await waitFor(() => expect(mockSetLoading).toHaveBeenCalledWith(true));
    await waitFor(() => expect(axiosClient.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Success");
    expect(mockDispatch).toHaveBeenCalledWith(setAuth({ affiliationExists: true }));
    expect(mockSetStep).toHaveBeenCalledWith(5);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it("handles API error", async () => {
    axiosClient.put.mockRejectedValue("Error");
    render(<Step4 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.schoolName"), { target: { value: "My School Name" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.affiliationNo"), { target: { value: "123456" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.username"), { target: { value: "username1" } });
    fireEvent.click(screen.getByText("buttons.continue"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Error"));
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it("calls goback on back button click", () => {
    render(<Step4 goback={mockGoback} setStep={mockSetStep} setLoading={mockSetLoading} />);
    fireEvent.click(screen.getByText("buttons.back"));
    expect(mockGoback).toHaveBeenCalled();
  });
});
