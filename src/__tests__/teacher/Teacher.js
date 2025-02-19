import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Teacher from "../../components/teacherSetup/Teacher";
import { axiosClient } from "../../services/axiosClient";
import { toast, Toaster } from "react-hot-toast";
import EndPoints from "../../services/EndPoints";
import { MemoryRouter } from "react-router-dom";

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

const mockNavigate = jest.fn();

jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockStore = configureStore([]);
const store = mockStore({
  appConfig: { isDarkMode: false },
});

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Toaster />
        <Teacher />
      </MemoryRouter>
    </Provider>
  );
};

describe("Teacher Component", () => {
  beforeEach(() => {
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

  test("fetches and sets teacher data successfully", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [
        { id: 1, firstname: "John", lastname: "Doe", phone: "7234567890" },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledTimes(1);
      expect(axiosClient.get).toHaveBeenCalledWith(
        EndPoints.ADMIN.TEACHER_LIST
      );
    });
  });

  test("fetches and displays teacher list on mount", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ firstname: "John", lastname: "Doe", phone: "7234567890" }],
    });

    renderComponent();

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("savedFirstname")).toHaveValue("John");
      expect(screen.getByTestId("savedLastname")).toHaveValue("Doe");
      expect(screen.getByTestId("savedPhone")).toHaveValue("7234567890");
    });
  });

  test.skip("calls registerTeacher API on form submission remaining toast", async () => {
    axiosClient.post.mockResolvedValueOnce({
      statusCode: 201,
      result: "Teacher added successfully",
    });

    renderComponent();

    fireEvent.change(screen.getByTestId("firstnameInput"), {
      target: { value: "ram" },
    });
    fireEvent.change(screen.getByTestId("lastnameInput"), {
      target: { value: "gupta" },
    });
    fireEvent.change(screen.getByTestId("phoneInput"), {
      target: { value: "7234567891" },
    });

    fireEvent.click(screen.getByTestId("addTeacher"));

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith(
        EndPoints.ADMIN.REGISTER_TEACHER,
        {
          firstname: "Ram",
          lastname: "Gupta",
          phone: "7234567891",
        }
      );
      // expect(toast.success).toHaveBeenCalledWith("Teacher added successfully");
    });
    // expect(toast.success).toHaveBeenCalledWith("Teacher added successfully");
  });

  test("deletes a teacher remaining toast", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ firstname: "John", lastname: "Doe", phone: "7234567890" }],
    });
    axiosClient.delete.mockResolvedValueOnce({
      data: { statusCode: 200, result: "Teacher deleted" },
    });

    renderComponent();

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("savedFirstname")).toHaveValue("John");
      expect(screen.getByTestId("savedLastname")).toHaveValue("Doe");
      expect(screen.getByTestId("savedPhone")).toHaveValue("7234567890");
    });

    const deleteButton = screen.getByAltText("deleteTeacher");
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByTestId("confirmdeleteTeacher");
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(axiosClient.delete).toHaveBeenCalledWith(
        expect.stringContaining(`${EndPoints.ADMIN.DELETE_TEACHER}/`)
      );
      // expect(toast.success).toHaveBeenCalledWith("Teacher deleted");
    });
  });

  test.skip("validates form inputs correctly", async () => {
    renderComponent();
    const addTeacherButton = screen.getByTestId("addTeacher");

    fireEvent.click(addTeacherButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
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
});
