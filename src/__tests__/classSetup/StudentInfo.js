import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StudentInfo from "../../components/classSetup/sectionStudents/StudentInfo"; // Adjust path accordingly
import profileEmpty from "../../assets/images/profileEmpty.png";
import html2canvas from "html2canvas";

jest.mock("html2canvas", () => jest.fn().mockResolvedValue({ toDataURL: () => "mocked-image-url" }));

const mockModelOpen = jest.fn();
const mockStudent = {
  firstname: "John",
  lastname: "Doe",
  classDetails: { name: "10th" },
  sectionDetails: { name: "A" },
  gender: "Male",
  bloodGroup: "O+",
  dob: "2005-06-15",
  address: "123 Main St",
  photo: "mocked-base64-image",
  parentDetails: {
    fullname: "Jane Doe",
    gender: "Female",
    age: "40",
    email: "jane.doe@example.com",
    phone: "1234567890",
    qualification: "MBA",
    occupation: "Teacher",
    address: "123 Main St",
  },
};

describe("StudentInfo Component", () => {
  test("renders student details correctly", () => {
    render(<StudentInfo currStudent={mockStudent} modelOpen={mockModelOpen} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("10th A")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
  });

  test("renders guardian details correctly", () => {
    render(<StudentInfo currStudent={mockStudent} modelOpen={mockModelOpen} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();
    expect(screen.getByText("MBA")).toBeInTheDocument();
  });

  test("calls modelOpen when close button is clicked", () => {
    render(<StudentInfo currStudent={mockStudent} modelOpen={mockModelOpen} />);
    fireEvent.click(screen.getByAltText("close"));
    expect(mockModelOpen).toHaveBeenCalledWith(false);
  });

  test("renders profile image correctly", () => {
    render(<StudentInfo currStudent={mockStudent} modelOpen={mockModelOpen} />);
    const image = screen.getByAltText("titles.student");
    expect(image.src).toContain("data:image/jpeg;base64,mocked-base64-image");
  });

  test("renders default profile image when no photo is provided", () => {
    render(
      <StudentInfo currStudent={{ ...mockStudent, photo: null }} modelOpen={mockModelOpen} />
    );
    const image = screen.getByAltText("titles.student");
    expect(image.src).toContain(profileEmpty);
  });

  test("triggers handleScreenshot when screenshot button is clicked", async () => {
    render(<StudentInfo currStudent={mockStudent} modelOpen={mockModelOpen} />);
    const button = screen.getByText("buttons.screenshot");
    fireEvent.click(button);
    expect(html2canvas).toHaveBeenCalled();
  });
});
