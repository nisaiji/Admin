import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Addsection from "../../components/classSetup/Addsection";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("react-datepicker/dist/react-datepicker.css", () => {});

const mockStore = configureStore([]);
const store = mockStore({ appConfig: { isDarkMode: false } });

describe("Addsection Component", () => {
  const setAddSectionModelOpen = jest.fn();
  const getAllClass = jest.fn();
  const clickedClassId = "class123";

  beforeEach(() => {
    jest.clearAllMocks();
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: {
        class: [
          {
            section: [
              {
                _id: "1",
                name: "A",
                teacher: { firstname: "Ram", lastname: "gupta" },
              },
            ],
          },
        ],
      },
    });
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ _id: "teacher1", firstname: "John", lastname: "Doe" }],
    });
  });

  const renderComponent = () => {
    render(
      <Provider store={store}>
        <Toaster />
        <Addsection
          setAddSectionModelOpen={setAddSectionModelOpen}
          clickedClassId={clickedClassId}
          getAllClass={getAllClass}
        />
      </Provider>
    );
  };

  test("renders without crashing", async () => {
    renderComponent();

    expect(screen.getByText("createSection")).toBeInTheDocument();
    await waitFor(() => expect(axiosClient.get).toHaveBeenCalledTimes(4));
    expect(axiosClient.get).toHaveBeenCalledWith(
      `${EndPoints.ADMIN.CLASS_SECTION}/${clickedClassId}`
    );
    expect(axiosClient.get).toHaveBeenCalledWith(
      EndPoints.ADMIN.UNASSIGNED_TEACHER
    );
  });

  test.skip("displays error if section limit is reached", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { class: [{ section: new Array(8) }] },
    });

    renderComponent();

    fireEvent.click(screen.getByTestId("addSection"));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Section limit reached")
    );
  });

  test.skip("adds a new section when form is submitted", async () => {
    axiosClient.post.mockResolvedValueOnce({
      statusCode: 201,
      result: "Success",
    });

    renderComponent();

    fireEvent.change(screen.getByTestId("selectTeacher"), {
      target: { value: "teacher1" },
    });
    fireEvent.click(screen.getByTestId("addSection"));

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalled();
    });
  });

  test.skip("deletes a section when delete button is clicked", async () => {
    axiosClient.delete.mockResolvedValueOnce({
      statusCode: 200,
      result: "Deleted",
    });

    renderComponent();

    fireEvent.click(screen.getByAltText("deleteSection"));
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => expect(axiosClient.delete).toHaveBeenCalled());
  });
});
