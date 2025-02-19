import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { MemoryRouter } from "react-router-dom";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
  Link: ({ children, to, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders teacher view and navigates to /student-section on click", () => {
    const teacherState = {
      appAuth: { role: "teacher", section: "SectionA", class: "ClassB" },
    };
    const { useSelector } = require("react-redux");
    useSelector.mockImplementation((callback) => callback(teacherState));

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const teacherClassroomEl = screen.getByText("titles.classRoom");
    expect(teacherClassroomEl).toBeInTheDocument();

    fireEvent.click(teacherClassroomEl);
    expect(mockedNavigate).toHaveBeenCalledWith("/student-section", {
      state: { classId: "ClassB", sectionId: "SectionA" },
    });

    expect(screen.queryByText("setup")).not.toBeInTheDocument();
    expect(screen.queryByText("roles.student")).not.toBeInTheDocument();
    expect(screen.queryByText("titles.requests")).not.toBeInTheDocument();
  });

  test("renders admin view with setup, student, requests, and profile menus", async () => {
    const adminState = {
      appAuth: { role: "admin", section: "SectionA", class: "ClassB" },
    };
    const { useSelector } = require("react-redux");
    useSelector.mockImplementation((callback) => callback(adminState));

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const setupButton = screen.getByText("setup");
    expect(setupButton).toBeInTheDocument();

    const studentLink = screen.getByText("roles.student");
    expect(studentLink).toBeInTheDocument();

    const requestsButton = screen.getByText("titles.requests");
    expect(requestsButton).toBeInTheDocument();

    fireEvent.click(setupButton);

    expect(await screen.findByText("roles.teacher")).toBeInTheDocument();
    expect(screen.getByText("titles.classRoom")).toBeInTheDocument();
    expect(screen.getByText("event")).toBeInTheDocument();

    fireEvent.click(requestsButton);

    expect(await screen.findByText("Password Reset")).toBeInTheDocument();
    expect(screen.getByText("leaves")).toBeInTheDocument();

    const profileIcon = screen.getByAltText("Dropdown");
    fireEvent.click(profileIcon);

    expect(await screen.findByText("profile")).toBeInTheDocument();
    expect(screen.getByText("logout")).toBeInTheDocument();

    const logoutLink = screen.getByText("logout");
    const localStorageClearSpy = jest.spyOn(
      window.localStorage.__proto__,
      "clear"
    );
    fireEvent.click(logoutLink);
    expect(localStorageClearSpy).toHaveBeenCalled();
  });

  test("hovering over menus toggles them appropriately", async () => {
    const adminState = {
      appAuth: { role: "admin", section: "SectionA", class: "ClassB" },
    };
    const { useSelector } = require("react-redux");
    useSelector.mockImplementation((callback) => callback(adminState));

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const setupContainer = screen.getByText("setup").parentElement;

    fireEvent.mouseEnter(setupContainer);
    expect(await screen.findByText("roles.teacher")).toBeInTheDocument();

    fireEvent.mouseLeave(setupContainer);
    await waitFor(() => {
      expect(screen.queryByText("roles.teacher")).not.toBeInTheDocument();
    });

    const requestsContainer = screen.getByText("titles.requests").parentElement;
    fireEvent.mouseEnter(requestsContainer);
    expect(await screen.findByText("Password Reset")).toBeInTheDocument();
    fireEvent.mouseLeave(requestsContainer);
    await waitFor(() => {
      expect(screen.queryByText("Password Reset")).not.toBeInTheDocument();
    });

    const profileContainer = screen.getByAltText("Dropdown").parentElement;
    fireEvent.mouseEnter(profileContainer);
    expect(await screen.findByText("profile")).toBeInTheDocument();
    fireEvent.mouseLeave(profileContainer);
    await waitFor(() => {
      expect(screen.queryByText("profile")).not.toBeInTheDocument();
    });
  });

  test("removes event listener on unmount", () => {
    const adminState = {
      appAuth: { role: "admin", section: "SectionA", class: "ClassB" },
    };
    const { useSelector } = require("react-redux");
    useSelector.mockImplementation((callback) => callback(adminState));

    const addSpy = jest.spyOn(document, "addEventListener");
    const removeSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(addSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
