import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Teacher from "../../components/teacherSetup/Teacher";
import { axiosClient } from "../../services/axiosClient";
import { toast, Toaster } from "react-hot-toast";
import EndPoints from "../../services/EndPoints";

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
const mockSetTeachers = jest.fn();
const mockSetLoading = jest.fn();
global.setTeachers = mockSetTeachers;
global.setLoading = mockSetLoading;

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

  test.skip("validates form inputs correctly", async () => {
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

  test.skip("handles API errors correctly", async () => {
    axiosClient.get.mockRejectedValueOnce("Network Error");
    renderComponent();

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledTimes(1);
      expect(axiosClient.get).toHaveBeenCalledWith(
        EndPoints.ADMIN.TEACHER_LIST
      );
      expect(toast.error).toHaveBeenCalledWith("Network Error");
    });
  });

  test.skip("fetches and sets teacher data successfully", async () => {
    jest
      .spyOn(React, "useState")
      .mockImplementation((initialValue) => [initialValue, mockSetTeachers]);

    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [
        { id: 1, firstname: "John", lastname: "Doe", phone: "7234567890" },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledTimes(1);
      expect(mockSetTeachers).toHaveBeenCalledWith([
        {
          id: 1,
          firstname: "John",
          lastname: "Doe",
          phone: "7234567890",
          SNo: 1,
        },
      ]);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  test.skip("fetches and displays teacher list on mount", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ firstname: "John", lastname: "Doe", phone: "7234567890" }],
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
