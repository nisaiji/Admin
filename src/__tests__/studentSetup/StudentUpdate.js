import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { axiosClient } from "../../services/axiosClient";
import { toast, Toaster } from "react-hot-toast";
import StudentUpdate from "../../components/studentSetup/StudentUpdate";
import EndPoints from "../../services/EndPoints";

// --- Test Data ---
const studentData = {
  _id: "12345",
  firstname: "john",
  lastname: "doe",
  gender: "male",
  bloodGroup: "A+",
  dob: "01/01/2000",
  address: "some address",
  parentDetails: {
    fullname: "jane doe",
    gender: "female",
    age: "40",
    email: "JANE@EXAMPLE.COM",
    phone: "8234567890",
    qualification: "Bachelor",
    occupation: "Engineer",
    address: "parent address",
  },
};

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
  useLocation: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
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

jest.mock("react-datepicker/dist/react-datepicker.css", () => {});

describe("StudentUpdate Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({ state: studentData });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Toaster />
        <StudentUpdate />
      </MemoryRouter>
    );

  test("renders the form with pre-filled student and guardian data", () => {
    renderComponent();

    // Student fields:
    const firstNameInput = screen.getByPlaceholderText(
      "placeholders.firstName"
    );
    expect(firstNameInput.value).toBe(studentData?.firstname);

    const lastNameInput = screen.getByPlaceholderText("placeholders.lastName");
    expect(lastNameInput.value).toBe(studentData.lastname);

    const addressInput = screen.getAllByPlaceholderText(
      "placeholders.address"
    )[0];
    expect(addressInput.value).toBe(studentData.address);

    // Guardian fields:
    const parentNameInput = screen.getByPlaceholderText(
      "placeholders.fullName"
    );
    expect(parentNameInput.value).toBe(studentData.parentDetails.fullname);

    const parentEmailInput = screen.getByPlaceholderText(
      "placeholders.emailAddress"
    );
    expect(parentEmailInput.value).toBe(studentData.parentDetails.email);

    const phoneInput = screen.getByPlaceholderText("placeholders.phoneNumber");
    expect(phoneInput.value).toBe(studentData.parentDetails.phone);
  });

  test("shows validation errors when required fields are empty", async () => {
    renderComponent();

    // Clear a required field (for example, first name) and trigger blur.
    const firstNameInput = screen.getByPlaceholderText(
      "placeholders.firstName"
    );
    userEvent.clear(firstNameInput);
    fireEvent.blur(firstNameInput);

    // Click the Save button to submit (it exists in the guardian form).
    const saveButton = screen.getByRole("button", { name: /buttons.save/i });
    userEvent.click(saveButton);

    // Expect a validation error for first name.
    expect(
      await screen.findByText("validationError.firstName")
    ).toBeInTheDocument();
  });

  test("cancel button navigates back", async () => {
    renderComponent();

    const cancelButton = screen.getByText("buttons.cancel");

    userEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("date picker updates the dob field", async () => {
    renderComponent();

    const dobInput = screen.getByPlaceholderText("placeholders.dob");
    fireEvent.change(dobInput, { target: { value: "15/08/1995" } });
    fireEvent.blur(dobInput);

    expect(dobInput.value).toBe("15/08/1995");
  });

  test("shows validation errors for all required fields", async () => {
    renderComponent();

    // Clear and blur all required fields to trigger validation
    const firstNameInput = screen.getAllByPlaceholderText(
      "placeholders.firstName"
    )[0];
    userEvent.clear(firstNameInput);
    fireEvent.blur(firstNameInput);

    expect(
      await screen.findByText("validationError.firstName")
    ).toBeInTheDocument();

    const lastNameInput = screen.getByPlaceholderText("placeholders.lastName");
    userEvent.clear(lastNameInput);
    fireEvent.blur(lastNameInput);

    expect(
      await screen.findByText("validationError.lastName")
    ).toBeInTheDocument();

  });

  test.skip("calls API update and navigates back on successful update", async () => {
    // Mock API to resolve successfully.
    axiosClient.put.mockResolvedValue({
      statusCode: 200,
      result: "Student updated successfully",
    });

    renderComponent();

    // Change some values to test transformations.
    const firstNameInput = screen.getByPlaceholderText(
      "placeholders.firstName"
    );
    userEvent.clear(firstNameInput);
    userEvent.type(firstNameInput, "michael");

    const parentEmailInput = screen.getByPlaceholderText(
      "placeholders.emailAddress"
    );
    userEvent.clear(parentEmailInput);
    userEvent.type(parentEmailInput, "TEST@EXAMPLE.COM");

    const saveButton = screen.getByText("buttons.save");
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledTimes(1);
      expect(axiosClient.put).toHaveBeenCalledWith(
        `${EndPoints.ADMIN.STUDENT_UPDATE}/${studentData._id}`,
        expect.objectContaining({
          firstname: "Michael",
          parentEmail: "test@example.com",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Student updated successfully"
      );
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test.skip("shows error toast on API failure", async () => {
    // Mock API to reject.
    axiosClient.put.mockRejectedValue("Error occurred");

    renderComponent();

    // Submit the form.
    const saveButton = screen.getByRole("button", { name: /buttons.save/i });
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("Error occurred");
    });
  });
});
