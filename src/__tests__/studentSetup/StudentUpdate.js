// __tests__/StudentUpdate.test.js
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import StudentUpdate from "../../components/studentSetup/StudentUpdate";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";

// Mocks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => [jest.fn((key) => key)],
}));
jest.mock("../../components/BreadCrumbs", () => () => <div>BreadCrumbs</div>);
jest.mock("../../components/Spinner", () => () => <div>Spinner</div>);

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    put: jest.fn(),
  },
}));

describe("StudentUpdate component", () => {
  const mockNavigate = jest.fn();
  const mockStudent = {
    studentId: "123",
    firstname: "john",
    lastname: "doe",
    gender: "Male",
    parentFullName: "Parent",
    parentPhone: "9876543210",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ state: mockStudent });
    useSelector.mockImplementation((fn) =>
      fn({ appConfig: { isDarkMode: false } })
    );
  });

  // it("renders form fields and headings", () => {
  //   render(<StudentUpdate />);
  //   expect(screen.getByText("titles.studentDetails")).toBeInTheDocument();
  //   expect(screen.getByText("titles.personalDetails")).toBeInTheDocument();
  //   expect(screen.getByText("titles.guardianDetails")).toBeInTheDocument();
  //   expect(screen.getByLabelText(/labels.firstName/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/labels.lastName/i)).toBeInTheDocument();
  //   expect(screen.getByText(/buttons.save/i)).toBeInTheDocument();
  //   expect(screen.getByText(/buttons.cancel/i)).toBeInTheDocument();
  // });

  // it("shows validation errors on empty submit", async () => {
  //   render(<StudentUpdate />);
  //   // Clear fields
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.firstName/i), {
  //     target: { value: "" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.lastName/i), {
  //     target: { value: "" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.fullName/i), {
  //     target: { value: "" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.phoneNumber/i), {
  //     target: { value: "" },
  //   });
  //   fireEvent.click(screen.getByText(/buttons.save/i));

  //   await waitFor(() => {
  //     expect(screen.getByText("validationError.firstName")).toBeInTheDocument();
  //     expect(screen.getByText("validationError.lastName")).toBeInTheDocument();
  //     expect(
  //       screen.getByText("validationError.parentName")
  //     ).toBeInTheDocument();
  //     expect(screen.getByText("validationError.phone")).toBeInTheDocument();
  //   });
  // });

  // it("validates phone field pattern", async () => {
  //   render(<StudentUpdate />);
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.phoneNumber/i), {
  //     target: { value: "123" },
  //   });
  //   fireEvent.click(screen.getByText(/buttons.save/i));
  //   await waitFor(() => {
  //     expect(
  //       screen.getByText("validationError.phoneNumber")
  //     ).toBeInTheDocument();
  //   });
  // });

  // it("submits valid data and navigates back", async () => {
  //   axiosClient.put.mockResolvedValue({
  //     statusCode: 200,
  //     result: "Updated",
  //   });
  //   render(<StudentUpdate />);

  //   // Update some fields
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.firstName/i), {
  //     target: { value: "John" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.lastName/i), {
  //     target: { value: "Smith" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.fullName/i), {
  //     target: { value: "Parent Updated" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/placeholders.phoneNumber/i), {
  //     target: { value: "9876543210" },
  //   });

  //   await act(async () => {
  //     fireEvent.click(screen.getByText(/buttons.save/i));
  //   });

  //   await waitFor(() => {
  //     expect(axiosClient.put).toHaveBeenCalledWith(
  //       expect.stringContaining("/123"),
  //       expect.objectContaining({
  //         firstname: "John",
  //         lastname: "Smith",
  //         parentName: "Parent updated", // capitalize lowercases
  //       })
  //     );
  //     expect(toast.success).toHaveBeenCalledWith("Updated");
  //     expect(mockNavigate).toHaveBeenCalledWith(-1);
  //   });
  // });

  // it("handles API error gracefully", async () => {
  //   axiosClient.put.mockRejectedValue("Error");
  //   render(<StudentUpdate />);
  //   fireEvent.click(screen.getByText(/buttons.save/i));
  //   await waitFor(() => {
  //     expect(toast.error).toHaveBeenCalledWith("Error");
  //   });
  // });

  // it("navigates back on cancel", () => {
  //   render(<StudentUpdate />);
  //   fireEvent.click(screen.getByText(/buttons.cancel/i));
  //   expect(mockNavigate).toHaveBeenCalledWith(-1);
  // });
});
