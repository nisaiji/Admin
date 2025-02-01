import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Login from "../pages/Login";
import { axiosClient } from "../services/axiosClient";
import toast from "react-hot-toast";

// Correctly mock `useNavigate`
const mockNavigate = jest.fn();
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
  useToast: jest.fn().mockReturnValue({
    error: jest.fn(),
    success: jest.fn(),
  }),
}));

const mockStore = configureStore([]);

describe("Login Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: { user: null }, // Add relevant state if needed
    });
    store.dispatch = jest.fn();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <Login />
        </MemoryRouter>
      </Provider>
    );

  test("renders login form", () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole("button", { name: /login.loginButton/i }));
  });

  test("toggles password visibility", async () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const toggleIcon = screen.getByRole("img", { name: /show password/i });

    // Initial type should be password
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click to toggle visibility
    await userEvent.click(toggleIcon);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click to toggle visibility back
    await userEvent.click(toggleIcon);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("validates form submission", async () => {
    renderComponent();
    await userEvent.click(
      screen.getByRole("button", { name: /login.loginButton/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/validationError.email|validationError.username/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/validationError.password/i)).toBeInTheDocument();
    });
  });

  // test.only("handles login failure", async () => {
  //   axiosClient.post.mockRejectedValue(new Error("Unauthorized user"));
  //   renderComponent();

  //   userEvent.type(screen.getByPlaceholderText(/email/i), "test@example.com");
  //   userEvent.type(screen.getByPlaceholderText(/password/i), "wrongpass");
  //   userEvent.click(screen.getByRole("button", { name: /login.loginButton/i }));

  //   await waitFor(() => {
  //     expect(toast.error).toHaveBeenCalledWith("Unauthorized user");
  //   });
  // });
});
