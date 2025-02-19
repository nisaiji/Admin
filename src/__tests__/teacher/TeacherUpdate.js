import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeacherUpdate from "../../components/teacherSetup/TeacherUpdate";
import { axiosClient } from "../../services/axiosClient";
import { Toaster, toast } from "react-hot-toast";
import EndPoints from "../../services/EndPoints";

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn().mockReturnValue({
  state: {
    _id: "123",
    firstname: "John",
    lastname: "Doe",
    phone: "1234567890",
  },
});

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    put: jest.fn(),
  },
}));

jest.mock("react-datepicker/dist/react-datepicker.css", () => {});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("TeacherUpdate Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Toaster />
        <TeacherUpdate />
      </MemoryRouter>
    );

  test("renders form fields correctly", () => {
    renderComponent();
    const firstname = screen.getByPlaceholderText("placeholders.firstName");
    expect(firstname).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("placeholders.lastName")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("placeholders.phoneNumber")
    ).toBeInTheDocument();
    expect(screen.getByText("buttons.save")).toBeInTheDocument();
    expect(screen.getByText("buttons.cancel")).toBeInTheDocument();
  });

  test("validates form fields", async () => {
    renderComponent();

    fireEvent.click(screen.getByText("buttons.save"));

    await waitFor(() => {
      expect(screen.getByText("validationError.firstName")).toBeInTheDocument();
      expect(screen.getByText("validationError.lastName")).toBeInTheDocument();
      expect(screen.getByText("validationError.phone")).toBeInTheDocument();
    });
  });

  test("cancel button navigates back", () => {
    renderComponent();

    fireEvent.click(screen.getByText("buttons.cancel"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test.skip("submits form and calls API", async () => {
    axiosClient.put.mockResolvedValue({ statusCode: 200, result: "Success" });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("placeholders.firstName"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByPlaceholderText("placeholders.lastName"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("placeholders.phoneNumber"), {
      target: { value: "9876543210" },
    });

    fireEvent.click(screen.getByTestId("updateTeacherInfo"));

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalled();
      expect(axiosClient.put).toHaveBeenCalledWith(
        `${EndPoints.ADMIN.UPDATE_TEACHER}/123`,
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
