import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useSelector } from "react-redux";
import StudentSection from "../../components/classSetup/sectionStudents/StudentSection";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));
jest.mock("../../components/BreadCrumbs", () => () => (
  <div data-testid="breadcrumbs" />
));
jest.mock("react-i18next", () => ({
  useTranslation: () => [key => key],
}));
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

describe("StudentSection", () => {
  const baseState = {
    appAuth: {
      role: "admin",
      classAndSectionData: {
        id: "school1",
        sectionId: "sec1",
        selectedSession: {
          _id: "sess1",
          school: "school1",
        },
        className: "10",
        sectionName: "A",
      },
      teacherData: {},
    },
    appConfig: { isDarkMode: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation(cb => cb(baseState));
    axiosClient.get.mockImplementation((url) => {
      if (url === `${EndPoints.ADMIN.SECTION_INFO}/sec1`) {
        return Promise.resolve({
          statusCode: 200,
          result: { classTeacher: { fullName: "Teacher One" } },
        });
      }

      if (
        url ===
        `${EndPoints.ADMIN.GET_SECTION_STUDENTS}?school=school1&section=sec1&session=sess1`
      ) {
        return Promise.resolve({
          statusCode: 200,
          result: [],
        });
      }

      return Promise.resolve({ statusCode: 200, result: [] });
    });
  });

  test("renders the section student screen", async () => {
    render(<StudentSection />);

    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByText("titles.students")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("placeholders.firstName")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("placeholders.parentName")).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledWith(
        `${EndPoints.ADMIN.SECTION_INFO}/sec1`
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        `${EndPoints.ADMIN.GET_SECTION_STUDENTS}?school=school1&section=sec1&session=sess1`
      );
    });
  });

  test("loads detailed student info for admin before opening the shared sidebar", async () => {
    axiosClient.get.mockImplementation((url, config) => {
      if (url === `${EndPoints.ADMIN.SECTION_INFO}/sec1`) {
        return Promise.resolve({
          statusCode: 200,
          result: { classTeacher: { fullName: "Teacher One" } },
        });
      }

      if (
        url ===
        `${EndPoints.ADMIN.GET_SECTION_STUDENTS}?school=school1&section=sec1&session=sess1`
      ) {
        return Promise.resolve({
          statusCode: 200,
          result: [
            {
              _id: "student-1",
              firstname: "Mahi",
              lastname: "Sharma",
              gender: "Female",
              parentFullName: "Rajesh Sharma",
              parentPhone: "9999999999",
              className: "10",
              sectionName: "A",
            },
          ],
        });
      }

      if (url === EndPoints.ADMIN.GET_DETAILED_STUDENT) {
        expect(config).toEqual({
          params: {
            id: "student-1",
          },
        });

        return Promise.resolve({
          statusCode: 200,
          result: {
            _id: "student-1",
            studentId: "STU-101",
            firstname: "Mahi",
            lastname: "Sharma",
            gender: "Female",
            className: "10",
            sectionName: "A",
            feeStatus: "pending",
          },
        });
      }

      return Promise.resolve({ statusCode: 200, result: [] });
    });

    render(<StudentSection />);

    const infoButton = await screen.findByAltText("infoStudent");
    fireEvent.click(infoButton);

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledWith(
        EndPoints.ADMIN.GET_DETAILED_STUDENT,
        {
          params: {
            id: "student-1",
          },
        }
      );
    });

    const sidebar = await screen.findByTestId("student-detail-sidebar");
    expect(within(sidebar).getByText("Student Profile")).toBeInTheDocument();
    expect(within(sidebar).getByText("STU-101")).toBeInTheDocument();
  });
});
