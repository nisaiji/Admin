import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { MemoryRouter } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ClassSetup from "../../components/classSetup/ClassSetup";

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
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

describe("ClassSetup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Toaster />
        <ClassSetup />
      </MemoryRouter>
    );

  test("renders class setup component", () => {
    renderComponent();
    expect(screen.getByText("titles.classRoom")).toBeInTheDocument();
  });

  test("fetches and displays classes", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ _id: "1", name: "one", section: [] }],
    });
    renderComponent();

    await waitFor(() =>
      expect(axiosClient.get).toHaveBeenCalledWith(EndPoints.COMMON.CLASS_LIST)
    );
    expect(screen.getByText("one")).toBeInTheDocument();
  });

  test("section page visible in classes", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ _id: "1", name: "one", section: [] }],
    });
    renderComponent();

    await waitFor(() =>
      expect(axiosClient.get).toHaveBeenCalledWith(EndPoints.COMMON.CLASS_LIST)
    );
    expect(screen.getByText("one")).toBeInTheDocument();

    fireEvent.click(screen.getByText("one"));
    fireEvent.click(screen.getByText("buttons.update"));
    expect(screen.getByText("createSection")).toBeInTheDocument();
  });

  test.skip("adds a new class", async () => {
    axiosClient.post.mockResolvedValueOnce({
      statusCode: 201,
      result: "Class added successfully",
    });

    renderComponent();

    fireEvent.click(screen.getByAltText("addClass"));
    fireEvent.change(screen.getByTestId("classlist"), {
      target: { value: "two" },
    });
    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledTimes(1);
      expect(axiosClient.post).toHaveBeenCalledWith(
        EndPoints.ADMIN.REGISTER_CLASS,
        { name: "" }
      );
    });
  });

  test.skip("deletes a class", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ _id: "1", name: "one", section: [] }],
    });
    axiosClient.delete.mockResolvedValueOnce({
      statusCode: 200,
      result: "Class deleted successfully",
    });

    renderComponent();

    await waitFor(() =>
      expect(axiosClient.get).toHaveBeenCalledWith(EndPoints.COMMON.CLASS_LIST)
    );
    expect(screen.getByText("one")).toBeInTheDocument();

    fireEvent.click(screen.getByAltText("deleteClass"));
    const confirmDeleteButton = screen.getByTestId("confirmdeleteTeacher");
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => expect(axiosClient.delete).toHaveBeenCalled());
  });

  test.skip("handles API errors", async () => {
    axiosClient.get.mockRejectedValueOnce("Error fetching data");

    renderComponent();

    await waitFor(() => {
      expect(axiosClient.get).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("Error fetching data");
    });
  });
});