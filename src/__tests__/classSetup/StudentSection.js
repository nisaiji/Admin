import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StudentSection from "../../components/classSetup/sectionStudents/StudentSection";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import toast from "react-hot-toast";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));
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
}));

describe("StudentSection", () => {
  const mockState = {
    appAuth: {
      role: "admin",
      classAndSectionData: {
        id: "school1",
        sectionId: "sec1",
        session: [{ _id: "sess1" }],
        className: "10",
        sectionName: "A",
      },
      classAndSectionDataOfTeacher: {},
    },
    appConfig: { isDarkMode: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation(cb => cb(mockState));
  });

  it("renders the heading and input fields", () => {
    render(<StudentSection />);
    expect(screen.getByText("titles.students")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("placeholders.firstName")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("placeholders.parentName")).toBeInTheDocument();
  });

  it("fetches students on mount", async () => {
    axiosClient.get.mockResolvedValueOnce({ statusCode: 200, result: [] });
    render(<StudentSection />);
    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalled();
    });
  });

  it("handles input change for new student", () => {
    render(<StudentSection />);
    const fnameInput = screen.getByPlaceholderText("placeholders.firstName");
    fireEvent.change(fnameInput, { target: { value: "John123" } });
    expect(fnameInput).toHaveValue("John"); // numbers removed
  });

  it("shows error toast on validation fail", async () => {
    render(<StudentSection />);
    const addBtn = screen.getByRole("button", { name: /buttons.addStudent/i });
    fireEvent.click(addBtn);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("calls registerStudent when valid", async () => {
    axiosClient.post.mockResolvedValue({ statusCode: 201, result: "Added" });
    axiosClient.get.mockResolvedValue({ statusCode: 200, result: [] });

    render(<StudentSection />);
    fireEvent.change(screen.getByPlaceholderText("placeholders.firstName"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("placeholders.lastName"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByTestId("gender"), { target: { value: "options.male" } });
    fireEvent.change(screen.getByPlaceholderText("placeholders.parentName"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByPlaceholderText("placeholders.phoneNumber"), {
      target: { value: "9876543210" },
    });

    const addBtn = screen.getByRole("button", { name: /buttons.addStudent/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("handles search input", () => {
    render(<StudentSection />);
    const searchInput = screen.getByPlaceholderText("placeholders.search");
    fireEvent.change(searchInput, { target: { value: "abc" } });
    expect(searchInput).toHaveValue("abc");
    const clearBtn = screen.getByRole("button", { hidden: true });
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue("");
  });
});
