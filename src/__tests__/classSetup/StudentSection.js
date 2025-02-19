import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import StudentSection from "../../components/classSetup/sectionStudents/StudentSection";
import { axiosClient } from "../../services/axiosClient";
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

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    state: {
      sectionId: "section1",
      classId: "class1",
      className: "Class A",
      sectionName: "Section A",
    },
  }),
}));

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => "TeacherName"),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

const mockStore = configureStore([]);
const renderComponent = (storeState) => {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <StudentSection />
      </MemoryRouter>
    </Provider>
  );
};

describe("StudentSection Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing and displays title", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({ statusCode: 200, result: { students: [] } });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });
    expect(screen.getByText("titles.students")).toBeInTheDocument();
  });

  test("fetches and displays students", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          students: [
            {
              _id: "1",
              firstname: "John",
              lastname: "Doe",
              parentDetails: { fullname: "Jane Doe", phone: "1234567890" },
            },
            {
              _id: "2",
              firstname: "Alice",
              lastname: "Smith",
              parentDetails: { fullname: "Bob Smith", phone: "0987654321" },
            },
          ],
        },
      });
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    });
  });

  test("registers a new student successfully", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({ statusCode: 200, result: { students: [] } });
    axiosClient.post.mockResolvedValueOnce({
      statusCode: 201,
      result: "Student added successfully",
    });
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { students: [] },
    });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    const firstNameInput = screen.getByPlaceholderText(
      "placeholders.firstName"
    );
    const lastNameInput = screen.getByPlaceholderText("placeholders.lastName");
    const parentNameInput = screen.getByPlaceholderText(
      "placeholders.parentName"
    );
    const phoneInput = screen.getByPlaceholderText("placeholders.phoneNumber");
    const addButton = screen.getByText("buttons.addStudent");

    fireEvent.change(firstNameInput, { target: { value: "Emily" } });
    fireEvent.change(lastNameInput, { target: { value: "Clark" } });
    fireEvent.change(parentNameInput, { target: { value: "John Clark" } });
    fireEvent.change(phoneInput, { target: { value: "7234567890" } });
    const genderSelect = screen.getByTestId("gender");
    fireEvent.change(genderSelect, { target: { value: "options.female" } });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalled();
      expect(axiosClient.post).toHaveBeenCalledWith(
        EndPoints.ADMIN.REGISTER_SECTION_STUDENT,
        expect.objectContaining({
          firstname: "Emily",
          lastname: "Clark",
          parentName: "John clark",
          gender: "options.female",
          phone: "7234567890",
          sectionId: "section1",
        })
      );
    });
  });

  test("edits an existing student", async () => {
    const student = {
      _id: "1",
      firstname: "John",
      lastname: "Doe",
      gender: "Male",
      parentDetails: { fullname: "Jane Doe", phone: "7234567890" },
    };
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: { students: [student] },
      });
    axiosClient.put.mockResolvedValueOnce({
      statusCode: 200,
      result: "Updated successfully",
    });
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { students: [student] },
    });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    const actionButtons = screen.getByAltText("editStudent");
    fireEvent.click(actionButtons);

    const firstNameInput = screen.getByDisplayValue("John");
    fireEvent.change(firstNameInput, { target: { value: "Johnny" } });

    const saveButton = screen.getByText("buttons.save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalled();
      expect(axiosClient.put).toHaveBeenCalledWith(
        `student/admin/${student._id}`,
        expect.objectContaining({
          firstname: "Johnny",
          lastname: "Doe",
          parentName: "Jane doe",
          gender: student.gender || "",
          phone: "7234567890",
        })
      );
    });
  });

  test("deletes a student", async () => {
    const student = {
      _id: "1",
      firstname: "John",
      lastname: "Doe",
      parentDetails: { fullname: "Jane Doe", phone: "1234567890" },
    };
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: { students: [student] },
      });
    axiosClient.delete.mockResolvedValueOnce({
      statusCode: 200,
      result: "Deleted successfully",
    });
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { students: [] },
    });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    const actionButton = screen.getByAltText("deleteStudent");
    fireEvent.click(actionButton);

    const confirmDeleteButton = screen.getByTestId("confirmdeleteTeacher");
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(axiosClient.delete).toHaveBeenCalled();
      expect(axiosClient.delete).toHaveBeenCalledWith(
        `${EndPoints.ADMIN.DELETE_STUDENT}/${student._id}`
      );
    });
  });

  test("handles file upload", async () => {
    axiosClient.post.mockResolvedValueOnce({
      statusCode: 201,
      result: "Upload successful",
    });
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({ statusCode: 200, result: { students: [] } });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    const file = new File(["dummy content"], "example.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalled();
      expect(axiosClient.post).toHaveBeenCalledWith(
        EndPoints.ADMIN.UPLOAD_EXCEL,
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });
  });

  test("filters students based on search input", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          students: [
            {
              _id: "1",
              firstname: "John",
              lastname: "Doe",
              parentDetails: { fullname: "Jane Doe", phone: "1234567890" },
            },
            {
              _id: "2",
              firstname: "Alice",
              lastname: "Smith",
              parentDetails: { fullname: "Bob Smith", phone: "0987654321" },
            },
          ],
        },
      });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("placeholders.search");
    fireEvent.change(searchInput, { target: { value: "John" } });

    const firstnameInput = screen.getByTestId("firstname").value;

    await waitFor(() => {
      expect(firstnameInput).toBe("John");
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });
  });

  test("opens attendance popup when clicked", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({ statusCode: 200, result: { students: [] } });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    const attendanceButton = screen.getByText("Attendance");
    fireEvent.click(attendanceButton);

    expect(
      await screen.getByText("Monthly Attendance Sheet")
    ).toBeInTheDocument();
  });

  test("opens student info modal when info button is clicked", async () => {
    const student = {
      _id: "1",
      firstname: "John",
      lastname: "Doe",
      parentDetails: { fullname: "Jane Doe", phone: "1234567890" },
    };
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: { students: [student] },
      });
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "admin",
        id: "admin1",
        section: "section1",
        className: "Class A",
        sectionName: "Section A",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    const actionButton = screen.getByAltText("infoStudent");
    fireEvent.click(actionButton);

    expect(await screen.getByText("titles.studentDetails")).toBeInTheDocument();
  });
});
