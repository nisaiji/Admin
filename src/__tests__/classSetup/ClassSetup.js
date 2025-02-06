import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider, useDispatch, useSelector } from "react-redux";
import configureStore from "redux-mock-store";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { MemoryRouter } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import Modal from "react-modal";



jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-datepicker/dist/react-datepicker.css", () => {});

jest.mock("react-modal", () => ({
  ...jest.requireActual("react-modal"),
  setAppElement: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// useSelector.mockImplementation((selector) =>
//   selector({
//     // Provide mock Redux state here
//   })
// );
// useDispatch.mockReturnValue(jest.fn()); // Mock dispatch function

describe("ClassSetup Component", () => {
  const mockStore = configureStore([]);
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Toaster />
          <ClassSetup />
        </MemoryRouter>
      </Provider>
    );

  test("renders class setup component", () => {
    renderComponent();
    expect(screen.getByText("titles.classRoom")).toBeInTheDocument();
  });

  //   test("fetches and displays classes", async () => {
  //     axiosClient.get.mockResolvedValueOnce({
  //       statusCode: 200,
  //       result: [{ _id: "1", name: "one", section: [] }],
  //     });
  //     renderComponent();

  //     await waitFor(() =>
  //       expect(axiosClient.get).toHaveBeenCalledWith(EndPoints.COMMON.CLASS_LIST)
  //     );
  //     expect(screen.getByText(/one/i)).toBeInTheDocument();
  //   });

  //   test("adds a new class", async () => {
  //     axiosClient.post.mockResolvedValueOnce({
  //       statusCode: 201,
  //       result: "Class added successfully",
  //     });
  //     axiosClient.get.mockResolvedValueOnce({
  //       statusCode: 200,
  //       result: [{ _id: "2", name: "two", section: [] }],
  //     });

  //     renderComponent();

  //     fireEvent.change(screen.getByRole("combobox"), {
  //       target: { value: "two" },
  //     });
  //     await waitFor(() => expect(axiosClient.post).toHaveBeenCalled());
  //   });

  //   test("deletes a class", async () => {
  //     axiosClient.delete.mockResolvedValueOnce({
  //       statusCode: 200,
  //       result: "Class deleted successfully",
  //     });
  //     axiosClient.get.mockResolvedValueOnce({ statusCode: 200, result: [] });

  //     renderComponent();

  //     fireEvent.click(screen.getByAltText("^"));
  //     await waitFor(() => expect(axiosClient.delete).toHaveBeenCalled());
  //   });

  //   test("handles API errors", async () => {
  //     axiosClient.get.mockRejectedValueOnce("Error fetching data");

  //     renderComponent();

  //     await waitFor(() => expect(axiosClient.get).toHaveBeenCalled());
  //   });
});
