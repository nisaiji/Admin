import React from 'react';
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Login from "../../src/pages/Login";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import { Toaster, toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { setAuthData } from '../store/AppAuthSlice';


// Mock `useNavigate`
const mockNavigate = jest.fn();
const mockJWTDecode = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));



jest.mock("../services/axiosClient", () => ({
  axiosClient: {  
    post: jest.fn(),
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

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Toaster />
          <Login />
        </MemoryRouter>
      </Provider>
    );

  test("renders login form", () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test("toggles password visibility", async () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const toggleIcon = screen.getByRole("img", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    await userEvent.click(toggleIcon);
    expect(passwordInput).toHaveAttribute("type", "text");
    await userEvent.click(toggleIcon);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("validates empty form submission", async () => {
    renderComponent();
    await userEvent.click(screen.getByTestId("submit"));

    await waitFor(() => {
      expect(screen.getByText(/validationError.email|validationError.username/i)).toBeInTheDocument();
      expect(screen.getByText(/validationError.password/i)).toBeInTheDocument();
    });
  });
  test("calls API and navigates on successful login if role teacher", async () => {
    // Mock jwtDecode return value
    jwtDecode.mockReturnValue({
      role: "teacher",
      active: true,
    });

    renderComponent();

    // Fill in form fields
    await userEvent.type(screen.getByTestId("email-input"), "test@example.com");
    await userEvent.type(screen.getByTestId("password-input"), "correctpassword");

    // Mock API response
    axiosClient.post.mockResolvedValueOnce({ statusCode: 200, result: { accessToken: 'mockToken', refreshToken: 'mockRefreshToken' } });

    // Click submit button
    await userEvent.click(screen.getByTestId("submit"));

    // Ensure API was called with correct data
    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledTimes(1);
      expect(axiosClient.post).toHaveBeenCalledWith(EndPoints.ADMIN.ADMIN_LOGIN, {
        email: "test@example.com",
        password: "correctpassword",
      });
      expect(jwtDecode).toHaveBeenCalledWith("mockToken");
      expect(localStorage.getItem("access_token")).toBe("mockToken");
      expect(localStorage.getItem("refresh_token")).toBe("mockRefreshToken");
      expect(store.getActions()).toContainEqual(setAuthData("mockToken"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
  test("calls API and navigates on successful login if role admin and active is true", async () => {
    // Mock jwtDecode return value
    jwtDecode.mockReturnValue({
      role: "admin",
      active: true,
    });

    renderComponent();

    // Fill in form fields
    await userEvent.type(screen.getByTestId("email-input"), "test@example.com");
    await userEvent.type(screen.getByTestId("password-input"), "correctpassword");

    // Mock API response
    axiosClient.post.mockResolvedValueOnce({ statusCode: 200, result: { accessToken: 'mockToken', refreshToken: 'mockRefreshToken' } });

    // Click submit button
    await userEvent.click(screen.getByTestId("submit"));

    // Ensure API was called with correct data
    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledTimes(1);
      expect(axiosClient.post).toHaveBeenCalledWith(EndPoints.ADMIN.ADMIN_LOGIN, {
        email: "test@example.com",
        password: "correctpassword",
      });
      expect(jwtDecode).toHaveBeenCalledWith("mockToken");
      expect(localStorage.getItem("access_token")).toBe("mockToken");
      expect(localStorage.getItem("refresh_token")).toBe("mockRefreshToken");
      expect(store.getActions()).toContainEqual(setAuthData("mockToken"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
  test("calls API and navigates on successful login if role admin and active is false", async () => {
    // Mock jwtDecode return value
    jwtDecode.mockReturnValue({
      role: "admin",
      active: false,
    });

    renderComponent();

    // Fill in form fields
    await userEvent.type(screen.getByTestId("email-input"), "test@example.com");
    await userEvent.type(screen.getByTestId("password-input"), "correctpassword");

    // Mock API response
    axiosClient.post.mockResolvedValueOnce({ statusCode: 200, result: { accessToken: 'mockToken', refreshToken: 'mockRefreshToken' } });

    // Click submit button
    await userEvent.click(screen.getByTestId("submit"));

    // Ensure API was called with correct data
    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledTimes(1);
      expect(axiosClient.post).toHaveBeenCalledWith(EndPoints.ADMIN.ADMIN_LOGIN, {
        email: "test@example.com",
        password: "correctpassword",
      });
      expect(jwtDecode).toHaveBeenCalledWith("mockToken");
      expect(localStorage.getItem("temp_access_token")).toBe("mockToken");
      expect(mockNavigate).toHaveBeenCalledWith("/signup");
    });
  });
  test("handles login failure", async () => {
    renderComponent();
    // Fill in form fields
    await userEvent.type(screen.getByTestId("email-input"), "test@example.com");
    await userEvent.type(screen.getByTestId("password-input"), "wrongpass");
    axiosClient.post.mockRejectedValueOnce("Network Error");
    await userEvent.click(screen.getByTestId("submit"));

    await waitFor(() => {
      // Ensure toast.error was called
      expect(axiosClient.post).toHaveBeenCalledTimes(1);
      expect(axiosClient.post).toHaveBeenCalledWith(EndPoints.ADMIN.ADMIN_LOGIN, {
        email: "test@example.com",
        password: "wrongpass",
      });
    });
    expect(toast.error).toHaveBeenCalledWith("Network Error");
  });
});
