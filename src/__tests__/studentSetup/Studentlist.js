import React from "react";
import { TextDecoder, TextEncoder } from "util";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};
const mockT = jest.fn((key, options) => options?.defaultValue || key);

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: mockToast,
  success: mockToast.success,
  error: mockToast.error,
  Toaster: () => {
    const ReactForMock = require("react");
    return ReactForMock.createElement("div", { "data-testid": "toaster" });
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

jest.mock("../../components/DeleteMessagePopup", () =>
  function MockDeletePopup({ isVisible, onClose, onDelete }) {
    const ReactForMock = require("react");

    if (!isVisible) return null;

    return ReactForMock.createElement(
      "div",
      { "data-testid": "delete-popup" },
      ReactForMock.createElement("button", { onClick: onClose }, "Cancel"),
      ReactForMock.createElement(
        "button",
        { "data-testid": "confirmdeleteTeacher", onClick: onDelete },
        "Delete"
      )
    );
  }
);

const { BrowserRouter } = require("react-router-dom");
const Studentlist = require("../../components/studentSetup/Studentlist").default;

const mockClasses = [
  {
    _id: "class-8",
    name: "8th",
    section: [
      {
        _id: "section-a",
        name: "A",
      },
    ],
  },
];

const mockStudents = [
  {
    _id: "student-1",
    studentId: "ADM001",
    firstname: "Mahi",
    lastname: "Sharma",
    gender: "Female",
    parentPhone: "9876500001",
    parentEmail: "mahi.parent@school.in",
    parentFullName: "Rajesh Sharma",
    bloodGroup: "AB+",
    rollNo: "A001",
  },
  {
    _id: "student-2",
    studentId: "ADM002",
    firstname: "Tony",
    lastname: "Dsouza",
    gender: "Male",
    parentPhone: "9876500002",
    parentEmail: "tony.parent@school.in",
    parentFullName: "Robert Dsouza",
    bloodGroup: "O+",
    rollNo: "A002",
  },
];

const mockState = {
  appConfig: {
    isDarkMode: true,
  },
  appAuth: {
    classAndSectionData: {
      selectedSession: {
        _id: "session-1",
        school: "school-1",
      },
    },
  },
};

function mockApi({
  students = mockStudents,
  totalStudents = students.length,
  studentError,
  classes = mockClasses,
} = {}) {
  axiosClient.get.mockImplementation((url) => {
    if (url.startsWith("class/session")) {
      return Promise.resolve({
        statusCode: 200,
        result: classes,
      });
    }

    if (url.startsWith("v3/student/admin")) {
      if (studentError) return Promise.reject(studentError);

      return Promise.resolve({
        statusCode: 200,
        result: {
          totalStudents,
          students,
        },
      });
    }

    return Promise.reject(new Error(`Unhandled GET ${url}`));
  });
}

function renderComponent() {
  return render(
    <BrowserRouter>
      <Studentlist />
    </BrowserRouter>
  );
}

describe("Studentlist Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    useDispatch.mockReturnValue(jest.fn());
    useSelector.mockImplementation((selectorFn) => selectorFn(mockState));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders the API-backed student list with filters and add action", async () => {
    mockApi();

    renderComponent();

    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add student/i })).toHaveAttribute(
      "href",
      "/add-student"
    );
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();
    expect(screen.getByText("Tony Dsouza")).toBeInTheDocument();
    expect(screen.getByText("AB+")).toBeInTheDocument();
    expect(axiosClient.get).toHaveBeenCalledWith(
      "v3/student/admin?page=1&limit=10&session=session-1"
    );
  });

  test("shows an empty state when the API returns no students", async () => {
    mockApi({ students: [], totalStudents: 0 });

    renderComponent();

    expect(await screen.findByText("No students found")).toBeInTheDocument();
    expect(screen.getByText("Try changing the class, section, or search text.")).toBeInTheDocument();
  });

  test("keeps rendering safe fallbacks for incomplete student data", async () => {
    mockApi({
      students: [
        {
          _id: "student-3",
          firstname: "Asha",
          lastname: "Rao",
        },
      ],
      totalStudents: 1,
    });

    renderComponent();

    expect(await screen.findByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getAllByText("NA").length).toBeGreaterThan(0);
  });

  test("debounces search text and sends it to the student API", async () => {
    jest.useFakeTimers();
    mockApi();

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search by name, email or phone..."), {
      target: { value: "Tony" },
    });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining("search=Tony")
      );
    });
  });

  test("updates section filtering and includes the selected section in API calls", async () => {
    mockApi();

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("classlist"), {
      target: { value: "class-8" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("sectionlist")).not.toBeDisabled();
    });

    fireEvent.change(screen.getByTestId("sectionlist"), {
      target: { value: "section-a" },
    });

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining("section=section-a")
      );
    });
  });

  test("shows an error state and retry path when student loading fails", async () => {
    mockApi({ studentError: "Network down" });

    renderComponent();

    expect(await screen.findByText("Unable to load students")).toBeInTheDocument();
    expect(mockToast.error).toHaveBeenCalledWith("Network down");

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledWith(
        "v3/student/admin?page=1&limit=10&session=session-1"
      );
    });
  });

  test("opens the detail sidebar from the info action", async () => {
    mockApi();

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /info mahi sharma/i }));

    const sidebar = screen.getByTestId("student-detail-sidebar");
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar).getByText("Student Profile")).toBeInTheDocument();
    expect(within(sidebar).getByText("Class NA - NA")).toBeInTheDocument();
  });

  test("opens the edit sidebar and saves through the update API", async () => {
    mockApi();
    axiosClient.put.mockResolvedValue({
      statusCode: 200,
      result: "Updated",
    });

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit mahi sharma/i }));
    const sidebar = screen.getByTestId("student-edit-sidebar");

    fireEvent.change(within(sidebar).getByLabelText("First Name"), {
      target: { value: "Mahira" },
    });
    fireEvent.click(within(sidebar).getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledWith(
        "v3/student/admin/student-1",
        expect.objectContaining({
          firstname: "Mahira",
          lastname: "Sharma",
          gender: "Female",
          parentName: "Rajesh Sharma",
          phone: "9876500001",
        })
      );
    });
    expect(mockToast.success).toHaveBeenCalledWith("Updated");
  });

  test("deletes a selected student", async () => {
    mockApi();
    axiosClient.delete.mockResolvedValue({
      statusCode: 200,
      result: "Deleted",
    });

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete mahi sharma/i }));
    fireEvent.click(await screen.findByTestId("confirmdeleteTeacher"));

    await waitFor(() => {
      expect(axiosClient.delete).toHaveBeenCalledWith("v3/student/admin/student-1");
    });
    expect(mockToast.success).toHaveBeenCalledWith("Deleted");
  });

  test("does not call APIs when no active session is available", async () => {
    useSelector.mockImplementation((selectorFn) =>
      selectorFn({
        ...mockState,
        appAuth: {
          classAndSectionData: {},
        },
      })
    );

    renderComponent();

    expect(screen.getByText("No active session selected")).toBeInTheDocument();
    expect(axiosClient.get).not.toHaveBeenCalled();
  });
});
