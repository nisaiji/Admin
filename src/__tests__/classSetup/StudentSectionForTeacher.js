import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useSelector } from "react-redux";
import StudentSection from "../../components/classSetup/sectionStudents/StudentSection";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => [key => key],
}));
jest.mock("../../components/BreadCrumbs", () => () => (
  <div data-testid="breadcrumbs" />
));
jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => <div data-testid="toaster" />,
}));

describe("StudentSection for class teacher", () => {
  const baseState = {
    appConfig: { isDarkMode: false },
    appAuth: {
      role: "classTeacher",
      classAndSectionData: {},
      teacherData: {
        admin: "school-admin",
        sectionId: "section-1",
        sessionId: "session-1",
        className: "10",
        sectionName: "A",
      },
    },
  };

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

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation(cb => cb(baseState));
  });

  test("opens the shared sidebar with summary data and does not call the admin detail api", async () => {
    axiosClient.get.mockImplementation((url) => {
      if (
        url ===
        `${EndPoints.TEACHER.GET_SECTION_STUDENTS}?school=school-admin&section=section-1&session=session-1`
      ) {
        return Promise.resolve({
          statusCode: 200,
          result: [
            {
              _id: "student-1",
              firstname: "John",
              lastname: "Doe",
              gender: "Male",
              className: "10",
              sectionName: "A",
              parentFullName: "Jane Doe",
              parentPhone: "1234567890",
            },
          ],
        });
      }

      return Promise.resolve({ statusCode: 200, result: [] });
    });

    render(<StudentSection />);

    const infoButton = await screen.findByAltText("infoStudent");
    fireEvent.click(infoButton);

    const sidebar = await screen.findByTestId("student-detail-sidebar");
    expect(within(sidebar).getByText("Student Profile")).toBeInTheDocument();
    expect(within(sidebar).getAllByText("John Doe").length).toBeGreaterThan(0);
    expect(within(sidebar).getAllByText("Class 10 - A").length).toBeGreaterThan(0);

    fireEvent.click(within(sidebar).getByRole("button", { name: /activity/i }));
    expect(within(sidebar).getByText("No recent leave requests")).toBeInTheDocument();
    expect(within(sidebar).getByText("No recent exams available")).toBeInTheDocument();

    expect(
      axiosClient.get.mock.calls.some(
        ([url]) => url === EndPoints.ADMIN.GET_DETAILED_STUDENT
      )
    ).toBe(false);
  });
});
