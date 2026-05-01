import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const createState = (role = "admin") => ({
  appAuth: {
    role,
    data: { name: "Admin User" },
    teacherData: { name: "Teacher User" },
  },
  appConfig: {},
});

const renderNavbar = (state, path = "/") => {
  useSelector.mockImplementation((selector) => selector(state));

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>,
  );
};

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReset();
  });

  test("renders class teacher navigation and routes to classroom", () => {
    renderNavbar(createState("classTeacher"));

    const classroomButton = screen.getByRole("button", {
      name: "titles.classRoom",
    });

    expect(classroomButton).toBeInTheDocument();
    fireEvent.click(classroomButton);

    expect(mockedNavigate).toHaveBeenCalledWith("/student-menu");
    expect(screen.queryByText("setup")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
  });

  test("renders admin settings navigation and removes support from the profile menu", () => {
    const clearStorageSpy = jest.spyOn(
      window.localStorage.__proto__,
      "clear",
    );

    renderNavbar(createState(), "/settings");

    const settingsButton = screen.getByRole("button", { name: "Settings" });
    expect(settingsButton).toHaveAttribute("aria-current", "page");

    fireEvent.click(settingsButton);
    expect(mockedNavigate).toHaveBeenCalledWith("/settings");

    fireEvent.click(
      screen.getByRole("button", { name: /open profile menu/i }),
    );

    expect(screen.getByText("profile")).toBeInTheDocument();
    expect(screen.queryByText("Support")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("logout"));
    expect(clearStorageSpy).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith("/login");

    clearStorageSpy.mockRestore();
  });

  test("keeps settings highlighted for nested settings paths", () => {
    renderNavbar(createState(), "/settings/academic-sessions");

    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("button", { name: "titles.notice" }),
    ).not.toHaveAttribute("aria-current");
  });
});
