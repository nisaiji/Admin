// Studentlist.test.jsx
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import Studentlist from "../../components/studentSetup/Studentlist";
import { axiosClient } from "../../services/axiosClient";
import { toast, Toaster } from "react-hot-toast";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

// Mock axiosClient methods.
jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("Studentlist Component", () => {
  const { useSelector } = require("react-redux");
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((callback) =>
      callback({
        appAuth: { role: "admin", id: "user123" },
        appConfig: { isDarkMode: false },
      })
    );
  });

  test("fetches class list and student list on mount", async () => {
    // Setup axios mocks: first call for getClassList, then fetchStudents.
    const fakeClassList = [
      {
        _id: "class1",
        name: "Class 1",
        section: [{ _id: "sec1", name: "Section 1" }],
      },
      {
        _id: "class2",
        name: "Class 2",
        section: [{ _id: "sec2", name: "Section 2" }],
      },
    ];
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: fakeClassList }) // getClassList
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 2,
          students: [
            {
              firstname: "John",
              lastname: "Doe",
              gender: "Male",
              parentDetails: {
                phone: "1234567890",
                email: "john@example.com",
              },
              bloodGroup: "O+",
              _id: "stu1",
            },
            {
              firstname: "Jane",
              lastname: "Doe",
              gender: "Female",
              parentDetails: {
                phone: "0987654321",
                email: "jane@example.com",
              },
              bloodGroup: "A+",
              _id: "stu2",
            },
          ],
          pageSize: 10,
        },
      });

    render(<Studentlist />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });
  });

  test("renders no student view when studentList is empty", async () => {
    // Return an empty class list and student list.
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: [] }) // getClassList
      .mockResolvedValueOnce({
        statusCode: 200,
        result: { totalStudents: 0, students: [], pageSize: 10 },
      });

    render(<Studentlist />);
    await waitFor(() => {
      // The component renders the "no student" message using translation keys.
      expect(screen.getByText("titles.message")).toBeInTheDocument();
      expect(screen.getByText("titles.subMessage")).toBeInTheDocument();
    });
  });

  test("performs search when Enter is pressed in the search input", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: [] }) // getClassList
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 1,
          students: [
            {
              firstname: "Alice",
              lastname: "Smith",
              gender: "Female",
              parentDetails: {
                phone: "1112223333",
                email: "alice@example.com",
              },
              bloodGroup: "B+",
              _id: "stu1",
            },
          ],
          pageSize: 10,
        },
      });

    render(<Studentlist />);
    await waitFor(() => {
      expect(screen.getByText("titles.students")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("placeholders.search");
    fireEvent.change(searchInput, { target: { value: "Alice" } });
    fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });
  });

  test("clears search filters when clear button is clicked", async () => {
    // Simulate an initial fetch with a student.
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: [] }) // getClassList
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 1,
          students: [
            {
              firstname: "Bob",
              lastname: "Brown",
              gender: "Male",
              parentDetails: {
                phone: "4445556666",
                email: "bob@example.com",
              },
              bloodGroup: "AB+",
              _id: "stu2",
            },
          ],
          pageSize: 10,
        },
      })
      // When clear is clicked, a new fetch is triggered.
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 1,
          students: [
            {
              firstname: "Bob",
              lastname: "Brown",
              gender: "Male",
              parentDetails: {
                phone: "4445556666",
                email: "bob@example.com",
              },
              bloodGroup: "AB+",
              _id: "stu2",
            },
          ],
          pageSize: 10,
        },
      });

    render(<Studentlist />);
    await waitFor(() => {
      expect(screen.getByText("Bob Brown")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("placeholders.search");
    fireEvent.change(searchInput, { target: { value: "Test" } });

    // Click the clear button. (We query the image by its alt text "Clear")
    const clearBtn = screen.getByAltText("Clear");
    fireEvent.click(clearBtn);
    // The search input value should be reset.
    expect(searchInput.value).toBe("");
  });

  test("navigates to student update page when edit button is clicked", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: [] })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 1,
          students: [
            {
              firstname: "Charlie",
              lastname: "Day",
              gender: "Male",
              parentDetails: {
                phone: "7778889999",
                email: "charlie@example.com",
              },
              bloodGroup: "O-",
              _id: "stu3",
            },
          ],
          pageSize: 10,
        },
      });
    render(<Studentlist />);
    await waitFor(() => {
      expect(screen.getByText("Charlie Day")).toBeInTheDocument();
    });

    const editImg = screen.getByAltText("editStudent");
    fireEvent.click(editImg);
    expect(mockedNavigate).toHaveBeenCalledWith("/student-update", {
      state: expect.any(Object),
    });
  });
  
  test("opens delete confirmation modal when delete button is clicked", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: [] })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 1,
          students: [
            {
              firstname: "Eve",
              lastname: "Adams",
              gender: "Female",
              parentDetails: {
                phone: "2020202020",
                email: "eve@example.com",
              },
              bloodGroup: "B-",
              _id: "stu5",
            },
          ],
          pageSize: 10,
        },
      });

    axiosClient.delete.mockResolvedValueOnce({
      statusCode: 200,
      result: "Student deleted successfully",
    });

    render(<Studentlist />);
    await waitFor(() => {
      expect(screen.getByText("Eve Adams")).toBeInTheDocument();
    });

    const deleteImg = screen.getByAltText("deleteStudent");
    fireEvent.click(deleteImg);

    await waitFor(() => {
      expect(screen.getByText("titles.confirmDelete")).toBeInTheDocument();
    });

    const confirmDelete = screen.getByTestId("confirmdeleteTeacher");
    fireEvent.click(confirmDelete);

    await waitFor(() => {
      expect(axiosClient.delete).toHaveBeenCalledWith(
        expect.stringContaining("stu5")
      );
    //   expect(toast.success).toHaveBeenCalledWith(
    //     "Student deleted successfully"
    //   );
    });
  });

  test.skip("updates section list when class is changed", async () => {
    const fakeClassList = [
      {
        _id: "class1",
        name: "Class 1",
        section: [
          { _id: "sec1", name: "Section 1" },
          { _id: "sec3", name: "Section 3" },
        ],
      },
      {
        _id: "class2",
        name: "Class 2",
        section: [{ _id: "sec2", name: "Section 2" }],
      },
    ];
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: fakeClassList,
    });

    render(<Studentlist />);
    await waitFor(() => {
      expect(screen.getByText("titles.students")).toBeInTheDocument();
    });

    // Open the class select dropdown.
    const classSelect = screen.getByText("titles.class");
    fireEvent.mouseDown(classSelect);

    const classOption = screen.getByTestId("classlist");
    fireEvent.mouseDown(classOption);

    expect(await screen.findAllByText("Class 1")[0]).toBe("Class 1");
    expect(await screen.findAllByText("Class 2")[0]).toBe("Class 2");

    // Now open the section select dropdown.
    const sectionSelect = screen.getByText("titles.section");
    fireEvent.mouseDown(sectionSelect);

    // The section options should include "Section 1" and "Section 3".
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 3")).toBeInTheDocument();
  });

  test.skip("opens student info modal when info button is clicked", async () => {
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: [] })
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 1,
          students: [
            {
              firstname: "Daisy",
              lastname: "Ridley",
              gender: "Female",
              parentDetails: {
                phone: "1010101010",
                email: "daisy@example.com",
              },
              bloodGroup: "A-",
              _id: "stu4",
            },
          ],
          pageSize: 10,
        },
      });
    render(<Studentlist />);
    await waitFor(() => {
      expect(screen.getByText("Daisy Ridley")).toBeInTheDocument();
    });
    const infobutton = screen.getByAltText("infoStudent");

    fireEvent.click(infobutton);

    // await waitFor(() => {
    //     expect(screen.getByTestId("student-info-modal")).toBeInTheDocument();
    // });
  });

  test.skip("updates page number on pagination change", async () => {
    // Simulate an initial fetch with 20 total students (with 10 per page).
    axiosClient.get
      .mockResolvedValueOnce({ statusCode: 200, result: [] }) // getClassList
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 20,
          students: new Array(10).fill({
            firstname: "Test",
            lastname: "User",
            gender: "Other",
            parentDetails: { phone: "0000000000", email: "test@example.com" },
            bloodGroup: "O",
            _id: "stu",
          }),
          pageSize: 10,
        },
      })
      // For page 2, return a different student.
      .mockResolvedValueOnce({
        statusCode: 200,
        result: {
          totalStudents: 20,
          students: new Array(10).fill({
            firstname: "Test2",
            lastname: "User2",
            gender: "Other",
            parentDetails: { phone: "0000000000", email: "test2@example.com" },
            bloodGroup: "O",
            _id: "stu2",
          }),
          pageSize: 10,
        },
      });
    render(<Studentlist />);
    await waitFor(() => {
      expect(screen.getAllByText("Test User")).toBeInTheDocument();
    });
    // Click the pagination button for page 2.
    const page2Button = screen.getByText("2");
    fireEvent.click(page2Button);
    await waitFor(() => {
      expect(screen.getByText("Test2 User2")).toBeInTheDocument();
    });
  });
});
