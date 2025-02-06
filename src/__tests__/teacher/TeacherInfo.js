import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TeacherInfo from "../../components/teacherSetup/TeacherInfo";

const mockTeacher = {
  firstname: "John",
  lastname: "Doe",
  gender: "Male",
  bloodGroup: "O+",
  dob: "1990-01-01",
  email: "john.doe@example.com",
  phone: "1234567890",
  username: "johndoe",
  address: "123 Street, City",
  university: "XYZ University",
  degree: "M.Ed",
  section: { name: "A", classId: { name: "10" } },
  photo: "", // Assuming base64 or empty string
};

describe("Teacher Info Modal", () => {
  test("renders teacher info correctly", () => {
    render(<TeacherInfo currTeacher={mockTeacher} modelOpen={jest.fn()} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("O+"));
    expect(screen.getByText("1990-01-01")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("123 Street, City")).toBeInTheDocument();
    expect(screen.getByText("XYZ University")).toBeInTheDocument();
    expect(screen.getByText("M.Ed")).toBeInTheDocument();
  });

  test("closes modal on close button click", () => {
    const mockClose = jest.fn();
    render(<TeacherInfo currTeacher={mockTeacher} modelOpen={mockClose} />);

    const closeButton = screen.getByAltText("Close");
    fireEvent.click(closeButton);

    expect(mockClose).toHaveBeenCalledWith(false);
  });

  test("opens teacher info modal on button click", () => {
    const setCurrTeacher = jest.fn();
    const setTeacherInfoModelOpen = jest.fn();

    const handleShowInfo = (teacher) => {
      setCurrTeacher(teacher);
      setTeacherInfoModelOpen(true);
    };

    render(
      <button onClick={() => handleShowInfo(mockTeacher)}>
        <img src="info-icon" alt="info" className="size-5" />
      </button>
    );

    fireEvent.click(screen.getByAltText("info"));

    expect(setCurrTeacher).toHaveBeenCalledWith(mockTeacher);
    expect(setTeacherInfoModelOpen).toHaveBeenCalledWith(true);
  });
});
