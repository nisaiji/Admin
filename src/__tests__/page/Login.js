import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Login from "../../pages/Login";
import { axiosClient } from "../../services/axiosClient";
import toast from "react-hot-toast";

// Mock the navigate function
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    post: jest.fn(),
  },
}));
jest.mock("react-hot-toast");

const mockStore = configureStore([]);

describe("Login Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({ auth: { user: null } });
    store.dispatch = jest.fn();
  });
  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
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
      expect(
        screen.getByText(/validationError.email|validationError.username/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/validationError.password/i)).toBeInTheDocument();
    });
  });

  test.skip("handles login success", async () => {
    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: { accessToken: "fakeToken", refreshToken: "fakeRefreshToken" },
    });

    renderComponent();
    userEvent.type(screen.getByPlaceholderText(/email/i), "s1@mail.com");
    userEvent.type(screen.getByPlaceholderText(/password/i), "s1@12345");
    const submitButton = screen.getByTestId("submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test.skip("handles login failure", async () => {
    axiosClient.post.mockRejectedValue("Unauthorized user");
    renderComponent();

    userEvent.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    userEvent.type(screen.getByPlaceholderText(/password/i), "wrongpass");
    const submitButton = screen.getByTestId("submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Unauthorized user");
    });
  });
});
