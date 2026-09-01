import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { axiosClient } from "../../services/axiosClient";
import { SelectionStep } from "../../components/transferCertificate/SelectionStep";
import { TCFormStep } from "../../components/transferCertificate/TCFormStep";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => {
    const ReactForMock = require("react");
    return ReactForMock.createElement("div", { "data-testid": "toaster" });
  },
}));

jest.mock("motion/react", () => {
  const ReactForMock = require("react");

  const motionProxy = new Proxy(
    {},
    {
      get: (_target, tagName) =>
        ReactForMock.forwardRef(({ children, ...props }, ref) =>
          ReactForMock.createElement(tagName, { ...props, ref }, children)
        ),
    }
  );

  return {
    AnimatePresence: ({ children }) =>
      ReactForMock.createElement(ReactForMock.Fragment, null, children),
    motion: motionProxy,
  };
});

function mockSelectedSession(sessionId = "session-1") {
  useSelector.mockImplementation((selector) =>
    selector({
      appAuth: {
        classAndSectionData: sessionId
          ? {
              selectedSession: {
                _id: sessionId,
              },
            }
          : {},
      },
    })
  );
}

function setupSelectionApi() {
  const studentPageOne = [
    {
      _id: "student-1",
      id: "student-record-1",
      firstname: "Alice",
      lastname: "Walker",
      className: "10",
      sectionName: "A",
      parentFullName: "Martha Walker",
      parentPhone: "9999999999",
      gender: "Female",
    },
  ];
  const studentPageTwo = [
    {
      _id: "student-2",
      id: "student-record-2",
      firstname: "Bob",
      lastname: "Stone",
      className: "10",
      sectionName: "A",
      parentFullName: "Ravi Stone",
      parentPhone: "8888888888",
      gender: "Male",
    },
  ];

  axiosClient.get.mockImplementation((url) => {
    if (url === "class/session/session-1") {
      return Promise.resolve({
        statusCode: 200,
        result: [
          {
            _id: "class-10",
            name: "10",
            section: [
              {
                _id: "section-a",
                name: "A",
              },
            ],
          },
        ],
      });
    }

    if (url.startsWith("v3/student/admin?")) {
      const parsedUrl = new URL(url, "https://example.com/");
      const page = parsedUrl.searchParams.get("page");
      const search = parsedUrl.searchParams.get("search");

      if (search === "A&B") {
        return Promise.resolve({
          statusCode: 200,
          result: {
            totalStudents: 1,
            students: studentPageOne,
          },
        });
      }

      if (search === "Alice") {
        return Promise.resolve({
          statusCode: 200,
          result: {
            totalStudents: 1,
            students: studentPageOne,
          },
        });
      }

      return Promise.resolve({
        statusCode: 200,
        result: {
          totalStudents: 20,
          students: page === "2" ? studentPageTwo : studentPageOne,
        },
      });
    }

    return Promise.reject(new Error(`Unhandled GET ${url}`));
  });
}

describe("Transfer certificate selection flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedSession();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("encodes invalid search input before requesting students", async () => {
    jest.useFakeTimers();
    setupSelectionApi();

    render(<SelectionStep onSelect={jest.fn()} />);

    expect(await screen.findByText("Alice Walker")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search by name..."), {
      target: { value: "A&B" },
    });

    act(() => {
      jest.advanceTimersByTime(450);
    });

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenLastCalledWith(
        expect.stringContaining("search=A%26B")
      );
    });
  });

  test("resets pagination to the first page when a new search starts", async () => {
    jest.useFakeTimers();
    setupSelectionApi();

    render(<SelectionStep onSelect={jest.fn()} />);

    expect(await screen.findByText("Alice Walker")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /go to page 2/i }));

    await waitFor(() => {
      expect(screen.getByText("Bob Stone")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Search by name..."), {
      target: { value: "Alice" },
    });

    act(() => {
      jest.advanceTimersByTime(450);
    });

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenLastCalledWith(
        expect.stringContaining("page=1")
      );
      expect(axiosClient.get).toHaveBeenLastCalledWith(
        expect.stringContaining("search=Alice")
      );
    });
  });
});

describe("Transfer certificate form flow", () => {
  const baseStudent = {
    name: "Alice Walker",
    parentFullName: "Martha Walker",
    className: "10",
    section: "A",
    admissionNumber: "ADM-1001",
    dob: "2010-01-01",
    gender: "Female",
    feeStatus: "paid",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("submits the TC request on the happy path", async () => {
    const onRequestSubmitted = jest.fn();
    const { container } = render(
      <TCFormStep
        student={{
          ...baseStudent,
          studentId: "student-1",
          sessionStudentId: "session-student-1",
        }}
        onBack={jest.fn()}
        onRequestSubmitted={onRequestSubmitted}
      />
    );

    fireEvent.change(
      screen.getByPlaceholderText("Explain the transfer request..."),
      {
        target: { value: "Family relocation" },
      }
    );

    const dateInput = container.querySelector('input[type="date"]');
    fireEvent.change(dateInput, {
      target: { value: "2026-04-01" },
    });

    fireEvent.click(screen.getByText("NOC (No Objection Certificate)"));
    fireEvent.click(screen.getByText("Dues Clearance"));

    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: {
        message: "Submitted",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /send tc request/i }));

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith(
        "transfer-certificate/admin/apply",
        expect.objectContaining({
          studentId: "student-1",
          sessionStudentId: "session-student-1",
          reasonDescription: "Family relocation",
          lastAttendanceDate: "2026-04-01",
          promotionStatus: "Promoted",
        })
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Submitted");
    expect(onRequestSubmitted).toHaveBeenCalled();
  });

  test("keeps the request disabled when student identifiers are missing", async () => {
    const { container } = render(
      <TCFormStep
        student={baseStudent}
        onBack={jest.fn()}
        onRequestSubmitted={jest.fn()}
      />
    );

    fireEvent.change(
      screen.getByPlaceholderText("Explain the transfer request..."),
      {
        target: { value: "Family relocation" },
      }
    );

    const dateInput = container.querySelector('input[type="date"]');
    fireEvent.change(dateInput, {
      target: { value: "2026-04-01" },
    });

    fireEvent.click(screen.getByText("NOC (No Objection Certificate)"));
    fireEvent.click(screen.getByText("Dues Clearance"));

    const submitButton = screen.getByRole("button", { name: /send tc request/i });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    expect(
      screen.getByText(/student data is incomplete\. go back and reselect the student\./i)
    ).toBeInTheDocument();
    expect(axiosClient.post).not.toHaveBeenCalled();
  });
});
