import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Teacher from "../../components/teacherSetup/Teacher";
import { axiosClient } from "../../services/axiosClient";
import { toast } from "react-hot-toast";

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

jest.mock("react-hot-toast");

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({
  appConfig: { isDarkMode: false },
});

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <Teacher />
    </Provider>
  );
};

describe("Teacher Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the Teacher component correctly", () => {
    renderComponent();
    expect(screen.getByTestId("addTeacher")).toBeInTheDocument();
  });

  test("handles search input", () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/placeholders.search/i);
    fireEvent.change(searchInput, { target: { value: "John" } });
    expect(searchInput.value).toBe("John");
  });

  test("validates form inputs correctly", async () => {
    renderComponent();
    const addTeacherButton = screen.getByTestId("addTeacher");

    fireEvent.click(addTeacherButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "validationError.enterFirstName"
      );
    });

    const firstnameInput = screen.getByTestId("firstnameInput");
    const lastnameInput = screen.getByTestId("lastnameInput");
    const phoneInput = screen.getByTestId("phoneInput");

    fireEvent.change(firstnameInput, { target: { value: "John" } });
    fireEvent.click(addTeacherButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("validationError.enterLastName");
    });

    fireEvent.change(lastnameInput, { target: { value: "Doe" } });
    fireEvent.click(addTeacherButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("validationError.phone");
    });

    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.click(addTeacherButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "validationError.validationPhoneCount"
      );
    });
  });

  test("handles API errors correctly", async () => {
    axiosClient.get.mockRejectedValueOnce("Network error");
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  test.skip("calls registerTeacher API on form submission", async () => {
    axiosClient.post.mockResolvedValueOnce({
      data: { statusCode: 201, result: "Teacher added successfully" },
    });

    renderComponent();

    const firstnameInput = screen.getByTestId("firstnameInput");
    const lastnameInput = screen.getByTestId("lastnameInput");
    const phoneInput = screen.getByTestId("phoneInput");
    fireEvent.change(firstnameInput, {
      target: { value: "ram" },
    });
    fireEvent.change(lastnameInput, {
      target: { value: "gupta" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "7234567891" },
    });

    fireEvent.click(screen.getByTestId("addTeacher"));

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith(expect.any(String), {
        firstname: "Ram",
        lastname: "Gupta",
        phone: "7234567891",
      });

      expect(toast.success).toHaveBeenCalledWith("Teacher added successfully");
    });
  });

  test.skip("fetches and displays teacher list on mount", async () => {
    axiosClient.get.mockResolvedValueOnce({
      data: {
        statusCode: 200,
        result: [{ firstname: "John", lastname: "Doe", phone: "7234567890" }],
      },
    });

    renderComponent();

    const firstnameInput = screen.getByTestId("savedFirstname");
    const lastnameInput = screen.getByTestId("savedLastname");
    const phoneInput = screen.getByTestId("savedPhone");

    await waitFor(() => {
      expect(firstnameInput).toHaveValue("John");
      expect(lastnameInput).toHaveValue("Doe");
      expect(phoneInput).toHaveValue("7234567890");
    });
  });

  test.skip("deletes a teacher", async () => {
    axiosClient.delete.mockResolvedValueOnce({
      data: { statusCode: 200, result: "Teacher deleted" },
    });

    renderComponent();

    const deleteButton = screen.getByTestId("deleteTeacher");
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByTestId("confirmdeleteTeacher");
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(axiosClient.delete).toHaveBeenCalledWith(expect.any(String));
      expect(toast.success).toHaveBeenCalledWith("Teacher deleted");
    });
  });
});
