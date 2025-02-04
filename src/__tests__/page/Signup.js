import React from "react";
import { MemoryRouter } from "react-router-dom";
import SchoolDetailSignup from "../../pages/SchoolDetailSignup";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { cleanup } from "@testing-library/react";

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

describe("SchoolDetailSignup Form Validation", () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <SchoolDetailSignup />
      </MemoryRouter>
    );

  test("should show validation errors on submit Step 1", async () => {
    renderComponent();
    // input fields
    const schoolNameInput = screen.getByPlaceholderText(
      /placeholders.schoolName/i
    );
    const emailInput = screen.getByPlaceholderText(
      /placeholders.emailAddress/i
    );
    const phoneInput = screen.getByPlaceholderText(/placeholders.Phone/i);
    const passwordInput = screen.getByPlaceholderText(/placeholders.Password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(
      /placeholders.ConfirmPassword/i
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText("validationError.schoolName")
      ).toBeInTheDocument();
      expect(screen.getByText("validationError.phone")).toBeInTheDocument();
      expect(screen.getByText("validationError.email")).toBeInTheDocument();
      expect(screen.getByText("validationError.password")).toBeInTheDocument();
      expect(
        screen.getByText("validationError.confirmPassword")
      ).toBeInTheDocument();
    });

    fireEvent.change(schoolNameInput, { target: { value: "a" } });
    fireEvent.change(emailInput, { target: { value: "a" } });
    fireEvent.change(phoneInput, { target: { value: "1" } });
    fireEvent.change(passwordInput, { target: { value: "a" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "b" } });

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

    fireEvent.change(phoneInput, { target: { value: "1777888999" } });

    await waitFor(() => {
      expect(
        screen.getByText("validationError.phoneStart")
      ).toBeInTheDocument();
    });
  });

  test("validates fields before moving from Step 2", async () => {
    // Mock localStorage to start from Step 2
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("2");

    renderComponent();

    // Ensure Step 2 content is visible
    expect(screen.getByText(/register.addressInfo/i)).toBeInTheDocument();

    // Select fields
    const countryDropdown = screen.getByTestId("countrylist");
    const stateInput = screen.getByPlaceholderText(/placeholders.state/i);
    const districtInput = screen.getByPlaceholderText(/placeholders.district/i);
    const cityInput = screen.getByPlaceholderText(/placeholders.city/i);
    const pincodeInput = screen.getByPlaceholderText(/placeholders.pincode/i);
    const addressInput = screen.getByPlaceholderText(/placeholders.address/i);

    expect(countryDropdown).toBeInTheDocument();
    expect(stateInput).toBeInTheDocument();
    expect(districtInput).toBeInTheDocument();
    expect(cityInput).toBeInTheDocument();
    expect(pincodeInput).toBeInTheDocument();
    expect(countryDropdown).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    // Expect validation errors
    await waitFor(() => {
      expect(screen.getByText("validationError.country")).toBeInTheDocument();
      expect(screen.getByText("validationError.state")).toBeInTheDocument();
      expect(screen.getByText("validationError.city")).toBeInTheDocument();
      expect(screen.getByText("validationError.district")).toBeInTheDocument();
      expect(screen.getByText("validationError.pincode")).toBeInTheDocument();
      expect(screen.getByText("validationError.address")).toBeInTheDocument();
    });

    // Select "India" from the dropdown
    fireEvent.change(countryDropdown, { target: { value: "India" } });

    const stateDropdown = screen.getByTestId("statelist");
    const districtDropdown = screen.getByTestId("districtlist");
    // Ensure State and District are dropdowns when India is selected
    expect(stateDropdown).toBeEnabled();
    expect(districtDropdown).toBeEnabled();

    // Select valid values for India
    fireEvent.change(stateDropdown, { target: { value: "Maharashtra" } });
    fireEvent.change(districtDropdown, { target: { value: "Pune" } });

    // Fill other fields
    fireEvent.change(cityInput, { target: { value: "Pune" } });
    fireEvent.change(pincodeInput, { target: { value: "411001" } });
    fireEvent.change(addressInput, { target: { value: "Some valid address" } });

    // Click submit again
    fireEvent.click(submitButton);

    // Ensure no validation errors remain
    await waitFor(() => {
      expect(
        screen.queryByText("validationError.country")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("validationError.state")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("validationError.district")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("validationError.pincode")
      ).not.toBeInTheDocument();
    });

    // Change country to a non-Indian value (e.g., "USA")
    fireEvent.change(countryDropdown, { target: { value: "USA" } });

    // Ensure State and District change to input fields
    expect(stateInput).toBeEnabled();
    expect(districtInput).toBeEnabled();

    // Fill state and district as input fields
    fireEvent.change(stateDropdown, { target: { value: "California" } });
    fireEvent.change(districtDropdown, { target: { value: "Los Angeles" } });

    // Click submit again
    fireEvent.click(submitButton);

    // Ensure form submission is valid
    await waitFor(() => {
      expect(
        screen.queryByText("validationError.state")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("validationError.district")
      ).not.toBeInTheDocument();
    });
  });

  test("validates fields before moving from Step 3", async () => {
    // Mock localStorage to start from Step 2
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("3");

    renderComponent();

    // Ensure Step 2 content is visible
    expect(screen.getByText(/register.accountDetails/i)).toBeInTheDocument();

    const affiliationNoInput = screen.getByPlaceholderText(
      /placeholders.affiliationNo/i
    );
    const adminNameInput = screen.getByPlaceholderText(
      /placeholders.adminName/i
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("validationError.affiliationNumber")
      ).toBeInTheDocument();
      expect(screen.getByText("validationError.username")).toBeInTheDocument();
    });

    fireEvent.change(affiliationNoInput, { target: { value: "a" } });
    fireEvent.change(adminNameInput, { target: { value: "a" } });

    await waitFor(() => {
      expect(
        screen.getByText("validationError.affiliationNumberLength")
      ).toBeInTheDocument();
      expect(
        screen.getByText("validationError.usernameLength")
      ).toBeInTheDocument();
    });
  });
  
});
