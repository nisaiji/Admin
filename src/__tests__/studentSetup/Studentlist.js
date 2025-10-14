// import React from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import Studentlist from "../../components/studentSetup/Studentlist";
// import { BrowserRouter } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { axiosClient } from "../../services/axiosClient";
// import toast from "react-hot-toast";

// // ---- Mocks ----
// jest.mock("react-redux", () => ({
//   useSelector: jest.fn(),
// }));

// jest.mock("../../services/axiosClient", () => ({
//   axiosClient: {
//     get: jest.fn(),
//     delete: jest.fn(),
//   },
// }));

// jest.mock("react-i18next", () => ({
//   useTranslation: () => ({
//     t: (key) => key, // simple mock: return key itself
//     i18n: {
//       changeLanguage: jest.fn(),
//     },
//   }),
// }));

// jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

// // ---- Tests ----
// describe("Studentlist Component", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockRedux();
//   });

//   // test("can search students by name", async () => {
//   //   axiosClient.get.mockResolvedValue({
//   //     statusCode: 200,
//   //     result: { totalStudents: 1, students: [] },
//   //   });

//   //   renderComponent();
//   //   const searchInput = screen.getByPlaceholderText("placeholders.search");
//   //   fireEvent.change(searchInput, { target: { value: "John" } });

//   //   await waitFor(() => {
//   //     expect(axiosClient.get).toHaveBeenCalled();
//   //   });
//   // });

//   // test("clear button resets filters", async () => {
//   //   axiosClient.get.mockResolvedValue({
//   //     statusCode: 200,
//   //     result: { totalStudents: 0, students: [] },
//   //   });

//   //   renderComponent();
//   //   const clearBtn = screen.getByAltText("Clear");
//   //   fireEvent.click(clearBtn);

//   //   await waitFor(() => {
//   //     expect(axiosClient.get).toHaveBeenCalled();
//   //   });
//   // });

//   // test("clicking info button opens student info modal", async () => {
//   //   axiosClient.get.mockResolvedValueOnce({
//   //     statusCode: 200,
//   //     result: {
//   //       totalStudents: 1,
//   //       students: [{ _id: "1", firstname: "John", lastname: "Doe" }],
//   //     },
//   //   });

//   //   renderComponent();
//   //   const infoBtn = await screen.findByAltText("infoStudent");
//   //   fireEvent.click(infoBtn);

//   //   expect(await screen.findByTestId("student-info-modal")).toBeInTheDocument();
//   // });

//   // test("clicking delete opens confirmation and calls delete API", async () => {
//   //   axiosClient.get.mockResolvedValueOnce({
//   //     statusCode: 200,
//   //     result: {
//   //       totalStudents: 1,
//   //       students: [{ _id: "1", firstname: "John", lastname: "Doe" }],
//   //     },
//   //   });

//   //   axiosClient.delete.mockResolvedValueOnce({
//   //     statusCode: 200,
//   //     result: "Deleted",
//   //   });

//   //   renderComponent();
//   //   const deleteBtn = await screen.findByAltText("deleteStudent");
//   //   fireEvent.click(deleteBtn);

//   //   const confirmBtn = await screen.findByTestId("confirm-delete");
//   //   fireEvent.click(confirmBtn);

//   //   await waitFor(() => {
//   //     expect(axiosClient.delete).toHaveBeenCalledWith(
//   //       expect.stringContaining("1")
//   //     );
//   //     expect(toast.success).toHaveBeenCalledWith("Deleted");
//   //   });
//   // });

//   // test("pagination works and triggers API call", async () => {
//   //   axiosClient.get.mockResolvedValue({
//   //     statusCode: 200,
//   //     result: { totalStudents: 25, students: [] },
//   //   });

//   //   renderComponent();
//   //   const pageBtn = await screen.findByRole("button", { name: "2" });
//   //   fireEvent.click(pageBtn);

//   //   await waitFor(() => {
//   //     expect(axiosClient.get).toHaveBeenCalled();
//   //   });
//   // });

//   // test("dropdown to change limit triggers API call", async () => {
//   //   axiosClient.get.mockResolvedValue({
//   //     statusCode: 200,
//   //     result: { totalStudents: 30, students: [] },
//   //   });

//   //   renderComponent();
//   //   const limitDropdown = await screen.findByRole("button", { name: "10" });
//   //   fireEvent.mouseDown(limitDropdown);

//   //   const option = await screen.findByText("25");
//   //   fireEvent.click(option);

//   //   await waitFor(() => {
//   //     expect(axiosClient.get).toHaveBeenCalled();
//   //   });
//   // });

//   // test("applies dark mode classes when isDarkMode=true", () => {
//   //   mockRedux({ isDarkMode: true });
//   //   renderComponent();
//   //   expect(screen.getByText("titles.sis").className).toContain(
//   //     "text-textPrimary"
//   //   );
//   // });
// });

import React from "react";
import { BrowserRouter } from "react-router-dom";
import Studentlist from "../../components/studentSetup/Studentlist";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockState = {
  appConfig: {
    isDarkMode: true,
  },
  appAuth: {
    classAndSectionData: [{ id: 1, name: "Class 1 - A" }],
    teacherData: [{ id: 1, name: "Class 1 - A" }],
  },
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <Studentlist />
    </BrowserRouter>
  );

describe("Studentlist Component", () => {
  beforeEach(() => {
    useSelector.mockImplementation((selectorFn) => selectorFn(mockState));
  });

  test("renders with breadcrumbs and add student button", () => {
    renderComponent();
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByText("titles.sis")).toBeInTheDocument();
    expect(screen.getByText("Add Student")).toBeInTheDocument();
  });

  test("shows no data message when no students", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { totalStudents: 0, students: [] },
    });
    renderComponent();
    expect(await screen.findByText("titles.message")).toBeInTheDocument();
  });

  // test("renders student table when students are available", async () => {
  //   axiosClient.get.mockResolvedValueOnce({
  //       statusCode: 200,
  //       result: {
  //         totalStudents: 1,
  //         students: [
  //           {
  //             studentId: "1",
  //             firstname: "John",
  //             lastname: "Doe",
  //             gender: "Male",
  //             parentPhone: "123",
  //             parentEmail: "a@b.com",
  //             parentFullName: "Parent One",
  //           },
  //         ],
  //       },
  //   });

  //   renderComponent();

  //   const fullNameCell = await screen.findByText("John Doe");
  //   expect(fullNameCell).toBeInTheDocument();

  //   expect(screen.getByText("Male")).toBeInTheDocument();
  //   expect(screen.getByText("123")).toBeInTheDocument();
  //   expect(screen.getByText("a@b.com")).toBeInTheDocument();

  //   // expect(await screen.findByText("John Doe")).toBeInTheDocument();
  //   // expect(await screen.findByText("Doe")).toBeInTheDocument();
  //   // expect(await screen.findByText("Male")).toBeInTheDocument();
  //   // expect(await screen.findByText("123")).toBeInTheDocument();
  //   // expect(await screen.findByText("a@b.com")).toBeInTheDocument();
  // });
});
