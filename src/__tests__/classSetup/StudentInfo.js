import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StudentInfo from "../../components/classSetup/sectionStudents/StudentInfo";
import { useSelector } from "react-redux";
import html2canvas from "html2canvas";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => [key => key],
}));
jest.mock("html2canvas");

describe("StudentInfo", () => {
  const mockModelOpen = jest.fn();
  const student = {
    firstname: "John",
    lastname: "Doe",
    className: "10",
    sectionName: "A",
    gender: "Male",
    bloodGroup: "O+",
    dob: "2005-01-01",
    address: "123 Street",
    parentFullName: "Jane Doe",
    parentPhone: "9876543210",
    photo: "base64string",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue(false); // default light mode
  });

  it("renders student details correctly", () => {
    render(<StudentInfo currStudent={student} modelOpen={mockModelOpen} />);
    expect(screen.getByText("titles.studentDetails")).toBeInTheDocument();
    expect(screen.getByText("labels.fullName")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByAltText("titles.student")).toBeInTheDocument();
  });

  it("calls modelOpen(false) when close button is clicked", () => {
    render(<StudentInfo currStudent={student} modelOpen={mockModelOpen} />);
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockModelOpen).toHaveBeenCalledWith(false);
  });

  it("shows NA when fields are missing", () => {
    render(<StudentInfo currStudent={{}} modelOpen={mockModelOpen} />);
    expect(screen.getAllByText("NA").length).toBeGreaterThan(0);
  });

  it("switches styles in dark mode", () => {
    useSelector.mockReturnValue(true);
    render(<StudentInfo currStudent={student} modelOpen={mockModelOpen} />);
    expect(screen.getByText("titles.studentDetails").className).toContain(
      "text-textPrimary"
    );
  });

  it("handles screenshot capture", async () => {
    const mockCanvas = { toDataURL: jest.fn(() => "data:image/png;base64,xyz") };
    html2canvas.mockResolvedValue(mockCanvas);

    render(<StudentInfo currStudent={student} modelOpen={mockModelOpen} />);
    const screenshotBtn = screen.getByText("buttons.screenshot");
    fireEvent.click(screenshotBtn);

    expect(html2canvas).toHaveBeenCalled();
  });
});
