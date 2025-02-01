import React from "react";
import { MemoryRouter } from "react-router-dom";
import SchoolDetailSignup from "../pages/SchoolDetailSignup";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mocking `useTranslation` hook from react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => [(key) => key], // Returns the key itself as translation
}));

describe("SchoolDetailSignup Form Validation", () => {
  test.only("should show validation errors for Step 1", async () => {
    render(
      <MemoryRouter>
        <SchoolDetailSignup />
      </MemoryRouter>
    );

    // Fill in Step 1 fields with invalid data
    const schoolNameInput = screen.getByRole("input", { name: /schoolName/i });
    const emailInput = screen.getByText(/adminProfile.Email/i);
    const phoneInput = screen.getByText(/adminProfile.Phone/i);
    const passwordInput = screen.getByText(/labels.Password/i);
    const confirmPasswordInput = screen.getByText(/labels.ConfirmPassword/i);

    fireEvent.change(schoolNameInput, { target: { value: "short" } });
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.change(phoneInput, { target: { value: "1234" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "456" } });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    // Wait for validation to trigger
    await waitFor(() => {
      expect(
        screen.getByText("validationError.schoolNameLength")
      ).toBeInTheDocument();
      expect(
        screen.getByText("validationError.phoneNumber")
      ).toBeInTheDocument();
      expect(
        screen.getByText("validationError.emailAddress")
      ).toBeInTheDocument();
      expect(
        screen.getByText("validationError.passwordLength")
      ).toBeInTheDocument();
      expect(
        screen.getByText("validationError.passwordMatch")
      ).toBeInTheDocument();
    });
  });

//   it("should pass validation for valid inputs in Step 1", async () => {
//     render(<SchoolDetailSignup />);

//     // Fill in Step 1 fields with valid data
//     const schoolNameInput = screen.getByLabelText(/schoolName/i);
//     const emailInput = screen.getByLabelText(/email/i);
//     const phoneInput = screen.getByLabelText(/phone/i);
//     const passwordInput = screen.getByLabelText(/password/i);
//     const confirmPasswordInput = screen.getByLabelText(/confirmPassword/i);

//     fireEvent.change(schoolNameInput, {
//       target: { value: "Valid School Name" },
//     });
//     fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
//     fireEvent.change(phoneInput, { target: { value: "1234567890" } });
//     fireEvent.change(passwordInput, { target: { value: "validpassword123" } });
//     fireEvent.change(confirmPasswordInput, {
//       target: { value: "validpassword123" },
//     });

//     const submitButton = screen.getByRole("button", { name: /submit/i });
//     fireEvent.click(submitButton);

//     // Wait for validation to pass
//     await waitFor(() => {
//       expect(
//         screen.queryByText("validationError.schoolNameLength")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.phoneNumber")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.emailAddress")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.passwordLength")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.passwordMatch")
//       ).not.toBeInTheDocument();
//     });
//   });

//   it("should show validation errors for Step 2", async () => {
//     render(<SchoolDetailSignup />);

//     // Go to Step 2
//     const nextButton = screen.getByRole("button", { name: /next/i });
//     fireEvent.click(nextButton);

//     // Fill in Step 2 fields with invalid data
//     const countryInput = screen.getByLabelText(/country/i);
//     const stateInput = screen.getByLabelText(/state/i);
//     const cityInput = screen.getByLabelText(/city/i);
//     const districtInput = screen.getByLabelText(/district/i);
//     const pincodeInput = screen.getByLabelText(/pincode/i);
//     const addressInput = screen.getByLabelText(/address/i);

//     fireEvent.change(countryInput, { target: { value: "" } });
//     fireEvent.change(stateInput, { target: { value: "" } });
//     fireEvent.change(cityInput, { target: { value: "" } });
//     fireEvent.change(districtInput, { target: { value: "" } });
//     fireEvent.change(pincodeInput, { target: { value: "123" } });
//     fireEvent.change(addressInput, { target: { value: "" } });

//     const submitButton = screen.getByRole("button", { name: /submit/i });
//     fireEvent.click(submitButton);

//     // Wait for validation errors
//     await waitFor(() => {
//       expect(screen.getByText("validationError.country")).toBeInTheDocument();
//       expect(screen.getByText("validationError.state")).toBeInTheDocument();
//       expect(screen.getByText("validationError.city")).toBeInTheDocument();
//       expect(screen.getByText("validationError.district")).toBeInTheDocument();
//       expect(
//         screen.getByText("validationError.pincodeDigit")
//       ).toBeInTheDocument();
//       expect(screen.getByText("validationError.address")).toBeInTheDocument();
//     });
//   });

//   it("should pass validation for valid inputs in Step 2", async () => {
//     render(<SchoolDetailSignup />);

//     // Go to Step 2
//     const nextButton = screen.getByRole("button", { name: /next/i });
//     fireEvent.click(nextButton);

//     // Fill in Step 2 fields with valid data
//     const countryInput = screen.getByLabelText(/country/i);
//     const stateInput = screen.getByLabelText(/state/i);
//     const cityInput = screen.getByLabelText(/city/i);
//     const districtInput = screen.getByLabelText(/district/i);
//     const pincodeInput = screen.getByLabelText(/pincode/i);
//     const addressInput = screen.getByLabelText(/address/i);

//     fireEvent.change(countryInput, { target: { value: "Country" } });
//     fireEvent.change(stateInput, { target: { value: "State" } });
//     fireEvent.change(cityInput, { target: { value: "City" } });
//     fireEvent.change(districtInput, { target: { value: "District" } });
//     fireEvent.change(pincodeInput, { target: { value: "123456" } });
//     fireEvent.change(addressInput, { target: { value: "Address" } });

//     const submitButton = screen.getByRole("button", { name: /submit/i });
//     fireEvent.click(submitButton);

//     // Wait for validation to pass
//     await waitFor(() => {
//       expect(
//         screen.queryByText("validationError.country")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.state")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.city")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.district")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.pincodeDigit")
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByText("validationError.address")
//       ).not.toBeInTheDocument();
//     });
//   });
});
