// StudentSection.teacher.test.jsx
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

describe("StudentSection Component (Teacher)", () => {
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
      },
    });
    expect(screen.getByText("titles.students")).toBeInTheDocument();
  });

  test.skip("fetches and displays students for teacher", async () => {
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    });
  });

  test.skip("registers a new student successfully for teacher", async () => {
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
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

    fireEvent.change(firstNameInput, { target: { value: "Michael" } });
    fireEvent.change(lastNameInput, { target: { value: "Jordan" } });
    fireEvent.change(parentNameInput, { target: { value: "Father Jordan" } });
    fireEvent.change(phoneInput, { target: { value: "1112223333" } });

    const genderSelect = screen.getByTestId("gender");
    fireEvent.change(genderSelect, { target: { value: "options.male" } });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalled();
      expect(axiosClient.post).toHaveBeenCalledWith(
        EndPoints.TEACHER.REGISTER_SECTION_STUDENT,
        expect.objectContaining({
          firstname: "Michael",
          lastname: "Jordan",
          parentName: "Father jordan",
          gender: "options.male",
          phone: "1112223333",
          sectionId: "section1",
        })
      );
    });
  });

  test.skip("edits an existing student as teacher", async () => {
    const student = {
      _id: "1",
      firstname: "John",
      lastname: "Doe",
      gender: "options.male",
      parentDetails: { fullname: "Jane Doe", phone: "1234567890" },
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    const editButton = screen.getByAltText("editStudent");
    fireEvent.click(editButton);

    const firstNameInput = screen.getByDisplayValue("John");
    fireEvent.change(firstNameInput, { target: { value: "Johnny" } });

    const saveButton = screen.getByText("buttons.save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledWith(
        EndPoints.TEACHER.UPDATE_SECTION_STUDENT + `/${student._id}`,
        expect.objectContaining({
          firstname: "Johnny",
          lastname: "Doe",
          parentName: "Jane doe",
          gender: "options.male",
          phone: "1234567890",
        })
      );
    });
  });

  test.skip("deletes a student as teacher", async () => {
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    const deleteButton = screen.getByAltText("deleteStudent");
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByText("Confirm");
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(axiosClient.delete).toHaveBeenCalledWith(
        EndPoints.TEACHER.DELETE_SECTION_STUDENT + `/${student._id}`
      );
    });
  });

  test("handles file upload for teacher", async () => {
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
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

  test.skip("filters students based on search input for teacher", async () => {
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("placeholders.search");
    fireEvent.change(searchInput, { target: { value: "John" } });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("Alice")).not.toBeInTheDocument();
    });
  });

  test("opens attendance popup when clicked for teacher", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: { teacher: {} } })
      .mockResolvedValueOnce({ statusCode: 200, result: { students: [] } });

    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: {
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
      },
    });

    const attendanceButton = screen.getByText("Attendance");
    fireEvent.click(attendanceButton);

    expect(
      await screen.getByText("Monthly Attendance Sheet")
    ).toBeInTheDocument();
  });

  test.skip("opens student info modal when info button is clicked for teacher", async () => {
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
        role: "teacher",
        id: "teacher1",
        section: "section2",
        className: "Class B",
        sectionName: "Section B",
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    const infoButton = screen.getByAltText("infoStudent");
    fireEvent.click(infoButton);

    expect(await screen.getByText("titles.studentDetails")).toBeInTheDocument();
  });
});
