import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddStudent from "../../components/studentSetup/AddStudentForm";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../../services/axiosClient";
import toast from "react-hot-toast";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

const mockStore = configureStore([]);
const renderWithProviders = (store) =>
  render(
    <Provider store={store}>
      <AddStudent />
    </Provider>
  );

describe("AddStudent Component", () => {
  let store;
  let navigate;

  beforeEach(() => {
    store = mockStore({
      appAuth: { classAndSectionData: [] },
      appConfig: { isDarkMode: false },
    });
    navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    jest.clearAllMocks();
  });

  test("renders component correctly", () => {
    renderWithProviders(store);
    expect(screen.getByText(/Add Student/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

//   test("calls navigate(-1) on cancel click", () => {
//     renderWithProviders(store);
//     fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
//     expect(navigate).toHaveBeenCalledWith(-1);
//   });

//   test("shows validation error when submitting empty form", async () => {
//     renderWithProviders(store);
//     fireEvent.click(screen.getByRole("button", { name: /Save/i }));
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalled();
//     });
//   });

//   test("prevents numbers in firstname input", () => {
//     renderWithProviders(store);
//     const input = screen.getByPlaceholderText("First Name");
//     fireEvent.keyPress(input, { key: "1", charCode: 49 });
//     expect(input.value).toBe("");
//   });

//   test("fetches and sets class list on mount", async () => {
//     axiosClient.get.mockResolvedValueOnce({
//       result: [{ _id: "1", name: "one", section: [{ _id: "s1", name: "A" }] }],
//     });
//     renderWithProviders(store);
//     await waitFor(() => {
//       expect(axiosClient.get).toHaveBeenCalled();
//     });
//   });

//   test("successful form submission calls API and navigate", async () => {
//     axiosClient.post.mockResolvedValueOnce({
//       statusCode: 201,
//       result: "Student added",
//     });

//     renderWithProviders(store);

//     fireEvent.change(screen.getByPlaceholderText("First Name"), {
//       target: { value: "John" },
//     });
//     fireEvent.change(screen.getByPlaceholderText("Last Name"), {
//       target: { value: "Doe" },
//     });
//     fireEvent.change(screen.getByPlaceholderText("Parent Name"), {
//       target: { value: "Parent" },
//     });
//     fireEvent.change(screen.getByPlaceholderText("Phone Number"), {
//       target: { value: "1234567890" },
//     });

//     // Select dropdowns
//     fireEvent.mouseDown(screen.getByText(/Select Gender/i));
//     fireEvent.click(screen.getByText(/Male/i));

//     // Need class list to test section selection
//     fireEvent.click(screen.getByRole("button", { name: /Save/i }));

//     await waitFor(() => {
//       expect(axiosClient.post).toHaveBeenCalled();
//       expect(toast.success).toHaveBeenCalledWith("Student added");
//       expect(navigate).toHaveBeenCalledWith(-1);
//     });
//   });

//   test("handles API failure on submit", async () => {
//     axiosClient.post.mockRejectedValueOnce("Error");
//     renderWithProviders(store);

//     fireEvent.change(screen.getByPlaceholderText("First Name"), {
//       target: { value: "John" },
//     });
//     fireEvent.change(screen.getByPlaceholderText("Last Name"), {
//       target: { value: "Doe" },
//     });
//     fireEvent.change(screen.getByPlaceholderText("Parent Name"), {
//       target: { value: "Parent" },
//     });
//     fireEvent.change(screen.getByPlaceholderText("Phone Number"), {
//       target: { value: "1234567890" },
//     });

//     fireEvent.click(screen.getByRole("button", { name: /Save/i }));

//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalledWith("Error");
//     });
//   });
});
