import React from "react";
import { MemoryRouter } from "react-router-dom";
import SchoolDetailSignup from "../../pages/SchoolDetailSignup";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { Toaster, toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { setAuthData } from "../../store/AppAuthSlice";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import userEvent from "@testing-library/user-event";

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

// Mock `useNavigate`
const mockNavigate = jest.fn();
const mockJWTDecode = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock jwtDecode
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({});

describe("SchoolDetailSignup Form Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Toaster />
          <SchoolDetailSignup />
        </MemoryRouter>
      </Provider>
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

  describe.skip("checking multi page form", () => {
    test("handles signup success", async () => {
      renderComponent();

      // Fill in form fields
      await userEvent.type(
        screen.getByPlaceholderText(/placeholders.schoolName/i),
        "schoolno1"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/placeholders.emailAddress/i),
        "s1@mail.com"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/placeholders.Phone/i),
        "6667778881"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/placeholders.Password/i),
        "s1@12345"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/placeholders.ConfirmPassword/i),
        "s1@12345"
      );

      // Mock the axiosClient.post response
      const res = axiosClient.post.mockResolvedValueOnce({
        statusCode: 200,
        result: {
          accessToken: "mockToken",
          refreshToken: "mockRefreshToken",
          msg: "register successful",
        },
      });

      // Submit the form
      await userEvent.click(screen.getByTestId("submitPage1"));

      await waitFor(() => {
        // Ensure axiosClient.post was called with the correct arguments
        expect(axiosClient.post).toHaveBeenCalledTimes(1);
        expect(axiosClient.post).toHaveBeenCalledWith(
          EndPoints.ADMIN.ADMIN_REGISTER,
          {
            schoolName: "Schoolno1",
            email: "s1@mail.com",
            phone: "6667778881",
            password: "s1@12345",
          }
        );

        // Ensure localStorage.setItem was called with the correct arguments
        expect(localStorage.getItem("temp_access_token")).toBe("mockToken");
        expect(localStorage.getItem("refresh_token")).toBe("mockRefreshToken");
        expect(toast.success).toHaveBeenCalledWith("register successful");
      });
    });

    test("handle update signup page 2", async () => {
      // Mock localStorage to start from Step 2
      Storage.prototype.getItem = jest.fn(() => "2");

      renderComponent();

      // Ensure Step 2 content is visible
      expect(screen.getByText(/register.addressInfo/i)).toBeInTheDocument();

      // Select fields
      const countryDropdown = screen.getByTestId("countrylist");
      const stateInput = screen.getByPlaceholderText(/placeholders.state/i);
      const districtInput = screen.getByPlaceholderText(
        /placeholders.district/i
      );
      const cityInput = screen.getByPlaceholderText(/placeholders.city/i);
      const pincodeInput = screen.getByPlaceholderText(/placeholders.pincode/i);
      const addressInput = screen.getByPlaceholderText(/placeholders.address/i);

      // Select "India" from the dropdown
      fireEvent.change(countryDropdown, { target: { value: "India" } });

      const stateDropdown = screen.getByTestId("statelist");
      const districtDropdown = screen.getByTestId("districtlist");

      fireEvent.change(stateDropdown, { target: { value: "Maharashtra" } });
      fireEvent.change(districtDropdown, { target: { value: "Pune" } });

      // Fill other fields
      fireEvent.change(cityInput, { target: { value: "Pune" } });
      fireEvent.change(pincodeInput, { target: { value: "411001" } });
      fireEvent.change(addressInput, {
        target: { value: "Some valid address" },
      });

      // Mock API response
      axiosClient.put.mockResolvedValueOnce({
        statusCode: 200,
        result: "address updated successfully",
      });

      // Click submit again
      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Ensure axiosClient.post was called with the correct arguments
        expect(axiosClient.put).toHaveBeenCalledTimes(1);
        expect(axiosClient.put).toHaveBeenCalledWith(
          EndPoints.ADMIN.ADMIN_UPDATE_ADDRESS,
          {
            country: "India",
            state: "Maharashtra",
            city: "Pune",
            district: "Pune",
            pincode: "411001",
            address: "Some valid address",
          }
        );
        expect(toast.success).toHaveBeenCalledWith(
          "address updated successfully"
        );
      });
    });

    test("validates fields before moving from Step 3", async () => {
      // Mock localStorage to start from Step 2
      Storage.prototype.getItem = jest.fn(() => "3");
      renderComponent();

      // Ensure Step 2 content is visible
      expect(screen.getByText(/register.accountDetails/i)).toBeInTheDocument();

      const affiliationNoInput = screen.getByPlaceholderText(
        /placeholders.affiliationNo/i
      );
      const adminNameInput = screen.getByPlaceholderText(
        /placeholders.adminName/i
      );

      fireEvent.change(affiliationNoInput, { target: { value: "12345678" } });
      fireEvent.change(adminNameInput, { target: { value: "admin1" } });

      // Mock API response
      axiosClient.put.mockResolvedValueOnce({
        statusCode: 200,
        result: "account details updated successfully",
      });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axiosClient.put).toHaveBeenCalledTimes(1);
        expect(axiosClient.put).toHaveBeenCalledWith(
          EndPoints.ADMIN.ADMIN_UPDATE_DETAILS,
          {
            username: "Admin1",
            affiliationNo: "12345678",
          }
        );
        expect(toast.success).toHaveBeenCalledWith(
          "address updated successfully"
        );
      });
    });

    test("check approval progress signup page 4", async () => {
      // Mock localStorage to start from Step 4
      jest.spyOn(Storage.prototype, "getItem").mockReturnValueOnce("4");

      renderComponent();

      // Ensure Step 4 content is visible
      expect(screen.getByText(/register.finish/i)).toBeInTheDocument();

      // Mock API response
      axiosClient.get.mockResolvedValueOnce({
        statusCode: 200,
        result: { isActive: true },
      });

      await userEvent.click(screen.getByTestId("checkProgress"));

      await waitFor(() => {
        expect(axiosClient.get).toHaveBeenCalledTimes(1);
        expect(axiosClient.get).toHaveBeenCalledWith(EndPoints.ADMIN.GET_ADMIN);
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });
  });
});
