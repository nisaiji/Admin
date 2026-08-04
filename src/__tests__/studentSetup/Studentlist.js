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

const mockDetailedStudent = {
  ...mockStudents[0],
  studentId: "STU-101",
  className: "8th",
  sectionName: "A",
  aadharNumber: 123412341234,
  dob: "2008-01-15",
  address: "42 Green Avenue",
  isActive: true,
  feeStatus: "pending",
  transferCertificateIssued: false,
  guardianName: "Sunita Sharma",
  parentFullName: "Rajesh Sharma",
  parentPhone: "9876500001",
  mainParentFullName: "Nick Sharma",
  mainParentGender: "Male",
  mainParentQualification: "12 pass",
  mainParentOccupation: "Doctor",
  parentPhone: "9999999999",
  mainParentEmail: "nick@example.com",
  mainParentAddress: "Indore",
  mainParentStatus: "verified",
  mainParentFcmToken: "secret-token",
  sessionStartYear: 2026,
  sessionEndYear: 2027,
  sessionStatus: "active",
  attendanceSummary: {
    currentSessionPercentage: 92,
    presentCount: 23,
    absentCount: 2,
    totalMarkedDays: 25,
    latestAttendanceStatus: "present",
  },
  attendancePercentage: 92,
  subjectSummary: {
    totalSubjects: 2,
    subjects: [
      {
        subjectId: "subject-1",
        subjectName: "Science",
        subjectCode: "104",
        teacherName: "Bhavya Singh",
      },
      {
        subjectId: "subject-2",
        subjectName: "English",
        subjectCode: "102",
        teacherName: "Aman Singh",
      },
    ],
  },
  leaveSummary: {
    pending: 1,
    accept: 2,
    reject: 0,
    complete: 3,
    expired: 1,
    latestRequests: [],
  },
  examSummary: {
    stats: {
      totalExams: 2,
      scheduledCount: 1,
      ongoingCount: 0,
      completedCount: 1,
      cancelledCount: 0,
      publishedResultCount: 1,
      attemptedResultCount: 1,
      passedExamCount: 1,
      failedExamCount: 0,
    },
    latestExams: [
      {
        examId: "exam-1",
        examName: "Unit Test 1",
        examStatus: "scheduled",
        subjectCount: 4,
        resultPublished: false,
        overallStatus: "published_pending",
      },
    ],
    hasMore: false,
  },
};

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
  detailedStudent = mockDetailedStudent,
  detailError,
  classes = mockClasses,
} = {}) {
  axiosClient.get.mockImplementation((url, config) => {
    if (url.startsWith("class/session")) {
      return Promise.resolve({
        statusCode: 200,
        result: classes,
      });
    }

    if (url === "v3/student/admin/detail") {
      if (detailError) return Promise.reject(detailError);

      expect(config).toEqual({
        params: {
          id: "student-1",
        },
      });

      return Promise.resolve({
        statusCode: 200,
        result: detailedStudent,
      });
    }

    if (url.startsWith("v3/student/admin?")) {
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
      "/student-information-system/add-student"
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
      jest.advanceTimersByTime(1000);
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

  test("loads student details before opening the info sidebar", async () => {
    mockApi();

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /info mahi sharma/i }));

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledWith(
        "v3/student/admin/detail",
        {
          params: {
            id: "student-1",
          },
        }
      );
    });

    const sidebar = await screen.findByTestId("student-detail-sidebar");
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar).getByText("Student Profile")).toBeInTheDocument();
    expect(within(sidebar).getAllByText("Class 8th - A").length).toBeGreaterThan(0);
    expect(within(sidebar).getByText("STU-101")).toBeInTheDocument();
    expect(within(sidebar).getByText("123412341234")).toBeInTheDocument();
    expect(within(sidebar).getByText("15 Jan 2008")).toBeInTheDocument();
    expect(within(sidebar).getByText("Active")).toBeInTheDocument();
    expect(within(sidebar).getByText("Pending")).toBeInTheDocument();
    expect(within(sidebar).getByText("Not Issued")).toBeInTheDocument();
  });

  test("shows curated guardian details and hides sensitive fields", async () => {
    mockApi();

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /info mahi sharma/i }));
    const sidebar = await screen.findByTestId("student-detail-sidebar");

    fireEvent.click(within(sidebar).getByRole("button", { name: /guardian/i }));

    expect(within(sidebar).getByText("Nick Sharma")).toBeInTheDocument();
    expect(within(sidebar).getByText("9999999999")).toBeInTheDocument();
    expect(within(sidebar).getByText("nick@example.com")).toBeInTheDocument();
    expect(within(sidebar).getByText("Doctor")).toBeInTheDocument();
    expect(within(sidebar).getByText("Rajesh Sharma")).toBeInTheDocument();
    expect(within(sidebar).getByText("Sunita Sharma")).toBeInTheDocument();
    expect(within(sidebar).queryByText("secret-token")).not.toBeInTheDocument();
  });

  test("shows academic summaries from the detailed payload", async () => {
    mockApi();

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /info mahi sharma/i }));
    const sidebar = await screen.findByTestId("student-detail-sidebar");

    fireEvent.click(within(sidebar).getByRole("button", { name: /academic/i }));

    expect(within(sidebar).getByText("2026 - 2027")).toBeInTheDocument();
    expect(within(sidebar).getByText("92%")).toBeInTheDocument();
    expect(within(sidebar).getByText("Science")).toBeInTheDocument();
    expect(within(sidebar).getByText("Teacher Bhavya Singh")).toBeInTheDocument();
  });

  test("shows activity summaries from the detailed payload", async () => {
    mockApi();

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /info mahi sharma/i }));
    const sidebar = await screen.findByTestId("student-detail-sidebar");

    fireEvent.click(within(sidebar).getByRole("button", { name: /activity/i }));

    expect(within(sidebar).getByText("No recent leave requests")).toBeInTheDocument();
    expect(within(sidebar).getByText("Unit Test 1")).toBeInTheDocument();
    expect(within(sidebar).getByText("Published Pending")).toBeInTheDocument();
    expect(within(sidebar).getByText("Subjects 4")).toBeInTheDocument();
  });

  test("renders safe fallback states when nested detailed data is missing", async () => {
    mockApi({
      detailedStudent: {
        ...mockStudents[0],
        studentId: "STU-101",
        className: "8th",
        sectionName: "A",
      },
    });

    renderComponent();
    expect(await screen.findByText("Mahi Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /info mahi sharma/i }));
    const sidebar = await screen.findByTestId("student-detail-sidebar");

    fireEvent.click(within(sidebar).getByRole("button", { name: /academic/i }));
    expect(within(sidebar).getByText("No subjects assigned")).toBeInTheDocument();
    expect(within(sidebar).getAllByText("NA").length).toBeGreaterThan(0);

    fireEvent.click(within(sidebar).getByRole("button", { name: /activity/i }));
    expect(within(sidebar).getByText("No recent leave requests")).toBeInTheDocument();
    expect(within(sidebar).getByText("No recent exams available")).toBeInTheDocument();
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
