import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClassSetup from "../../components/classSetup/ClassSetup";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { axiosClient } from "../../services/axiosClient";
import toast from "react-hot-toast";
import configureStore from "redux-mock-store";

jest.mock("../../components/classSetup/Addsection", () => () => (
  <div>Addsection</div>
));
jest.mock("../../components/ConformationPopup", () => () => <div>Popup</div>);
jest.mock("../../services/axiosClient");
jest.mock("../../store/AppAuthSlice", () => ({
  setClassAndSectionData: jest.fn(),
}));
jest.mock("react-datepicker/dist/react-datepicker.css", () => ({}));
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  success: jest.fn(),
  error: jest.fn(),
}));

const mockStore = configureStore([]);

const renderComponent = (storeOverrides = {}) => {
  const store = mockStore({
    appAuth: { classAndSectionData: { session: [{ _id: "1" }] } },
    appConfig: { isDarkMode: false },
    ...storeOverrides,
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ClassSetup />
      </BrowserRouter>
    </Provider>
  );
};

describe("ClassSetup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing and shows 'no classroom' message when no classes", async () => {
    axiosClient.get.mockResolvedValue({ statusCode: 200, result: [] });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/noClassroom/i)).toBeInTheDocument();
    });
  });

  test("fetches and displays class cards", async () => {
    axiosClient.get.mockResolvedValue({
      statusCode: 200,
      result: [{ _id: "c1", name: "1st", section: [] }],
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("1st")).toBeInTheDocument();
    });
  });

  test("toggles card flip on click", async () => {
    axiosClient.get.mockResolvedValue({
      statusCode: 200,
      result: [{ _id: "c1", name: "1st", section: [] }],
    });
    renderComponent();
    await waitFor(() => screen.getByText("1st"));
    fireEvent.click(screen.getByText("1st"));
    // Add expectation for flipped state or backside content
  });

  test("opens and closes dropdown to add class", async () => {
    axiosClient.get.mockResolvedValue({ statusCode: 200, result: [] });
    renderComponent();
    await waitFor(() => screen.getByAltText(/addClass/i));
    fireEvent.click(screen.getByAltText(/addClass/i));
    fireEvent.click(screen.getByTestId("classlist"));
    // Expect dropdown items to render
  });

  test("handles adding a new class", async () => {
    axiosClient.get.mockResolvedValue({ statusCode: 200, result: [] });
    axiosClient.post.mockResolvedValue({ statusCode: 201, result: "Added" });
    renderComponent();
    await waitFor(() => screen.getByAltText(/addClass/i));
    fireEvent.click(screen.getByAltText(/addClass/i));
    fireEvent.click(screen.getByText(/addClass/i));
    // Simulate selecting class option
  });

  test("handles deleting a class", async () => {
    axiosClient.get.mockResolvedValue({
      statusCode: 200,
      result: [{ _id: "c1", name: "1st", section: [] }],
    });
    axiosClient.delete.mockResolvedValue({
      statusCode: 200,
      result: "Deleted",
    });
    renderComponent();
    await waitFor(() => screen.getByText("1st"));
    fireEvent.click(screen.getByAltText(/deleteClass/i));
    // Confirm delete popup visible then simulate delete
  });

  test("handles API error gracefully", async () => {
    axiosClient.get.mockRejectedValue("Error");
    renderComponent();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
