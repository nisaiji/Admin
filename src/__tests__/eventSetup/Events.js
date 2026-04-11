import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  getByRole,
  getByTestId,
} from "@testing-library/react";
import Event, {
  Calendar,
  Day,
  DaysGrid,
} from "../../components/eventSetup/Event";
import { Provider, useSelector } from "react-redux";
import configureStore from "redux-mock-store";
import { axiosClient } from "../../services/axiosClient";
import { toast, Toaster } from "react-hot-toast";
import moment from "moment";

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

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

const mockStore = configureStore([]);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Calendar component", () => {
  test("renders the correct month and year", () => {
    render(<Event />);
    expect(screen.getByText("dashboard.calendar")).toBeInTheDocument();
    expect(screen.getByText(moment().format("MMMM YYYY"))).toBeInTheDocument();
  });

  test.skip("calls onPrevMonth and onNextMonth when the arrows are clicked", () => {
    const mockPrev = jest.fn();
    const mockNext = jest.fn();
    render(<Event />);
    const prevMonthButton = getByTestId("prev");
    fireEvent.click(prevMonthButton);
    expect(mockPrev).toHaveBeenCalled();
    const nextMonthButton = getByTestId("next");
    fireEvent.click(nextMonthButton);
    expect(mockNext).toHaveBeenCalled();
  });
});

describe("Event component", () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      appAuth: { role: "admin" },
    });
  });

  test("renders Event component and fetches events on mount", async () => {
    axiosClient.post.mockResolvedValue({ statusCode: 200, result: [] });
    render(<Event />);
    expect(screen.getByText("dashboard.calendar")).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalled();
    });

    expect(screen.getByAltText("noevents")).toBeInTheDocument();
  });

  test("renders events list when events are returned", async () => {
    const fakeEvent = {
      _id: "1",
      title: "Test Event",
      description: "Test Description",
      date: new Date().toISOString(),
    };
    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: [fakeEvent],
    });
    render(<Event />);
    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalled();
    });
    expect(screen.getByText("Test Event")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  test("updates calendar when goto date input loses focus", async () => {
    axiosClient.post.mockResolvedValue({ statusCode: 200, result: [] });
    render(<Event />);

    const gotoInput = screen.getByPlaceholderText(
      "calendar.gotoDatePlaceholder"
    );

    fireEvent.change(gotoInput, { target: { value: "12/2025" } });
    fireEvent.blur(gotoInput);

    await waitFor(() => {
      expect(screen.getByText("December 2025")).toBeInTheDocument();
    });
  });

  test("submits a new event successfully", async () => {
    axiosClient.post.mockResolvedValueOnce({
      statusCode: 200,
      result: "Event added",
    });
    axiosClient.post.mockResolvedValueOnce({ statusCode: 200, result: [] });
    render(<Event />);

    const futureDay = screen.getByText("27");
    fireEvent.click(futureDay);
    await waitFor(() => {
      expect(screen.getByText("eventForm.title.add")).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("eventForm.form.title");
    const descInput = screen.getByPlaceholderText("eventForm.form.description");
    fireEvent.change(titleInput, { target: { value: "new event" } });
    fireEvent.change(descInput, { target: { value: "new description" } });

    const submitButton = screen.getByText("buttons.submit");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith(
        expect.stringContaining("REGISTER_EVENT"),
        expect.objectContaining({
          title: "New event",
          description: "New description",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Event added");
    });
  });

  test.skip("updates an event successfully", async () => {
    const today = new Date();
    const fakeEvent = {
      _id: "2",
      title: "Old Event",
      description: "Old Description",
      date: today.toISOString(),
    };
    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: [fakeEvent],
    });
    axiosClient.put.mockResolvedValue({
      statusCode: 200,
      result: "Event updated",
    });
    render(<Event />);
    await waitFor(() => expect(axiosClient.post).toHaveBeenCalled());
    const dayCell = screen.getByText(11);
    fireEvent.click(dayCell);
    await waitFor(() => {
      expect(screen.getByText("eventForm.title.edit")).toBeInTheDocument();
    });
    const titleInput = screen.getByPlaceholderText("eventForm.form.title");
    fireEvent.change(titleInput, { target: { value: "updated event" } });
    const updateButton = screen.getByText("buttons.update");
    fireEvent.click(updateButton);
    await waitFor(() => {
      expect(axiosClient.put).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE_EVENT"),
        expect.objectContaining({
          title: "Updated event",
          description: "Old Description",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Event updated");
    });
  });

  test.skip("deletes an event successfully", async () => {
    const fakeEvent = {
      _id: "3",
      title: "Delete Event",
      description: "To be deleted",
      date: new Date().toISOString(),
    };
    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: [fakeEvent],
    });
    axiosClient.delete.mockResolvedValue({
      statusCode: 200,
      result: "Event deleted",
    });
    render(
      <Provider store={store}>
        <Event />
      </Provider>
    );
    await waitFor(() => expect(axiosClient.post).toHaveBeenCalled());

    const images = screen.getAllByRole("img");
    fireEvent.click(images[1]);

    await waitFor(() => {
      expect(screen.getByTestId("delete-popup")).toBeInTheDocument();
    });
    const confirmDeleteButton = screen.getByText("Confirm Delete");
    fireEvent.click(confirmDeleteButton);
    await waitFor(() => {
      expect(axiosClient.delete).toHaveBeenCalledWith(
        expect.stringContaining("DELETE_EVENT/3")
      );
      expect(toast.success).toHaveBeenCalledWith("Event deleted");
    });
  });

  test.skip("shows error toast when event form validation fails", async () => {
    axiosClient.post.mockResolvedValue({ statusCode: 200, result: [] });
    render(<Event />);
    const futureDay = screen.getByText("28");
    fireEvent.click(futureDay);
    await waitFor(() => {
      expect(screen.getAllByText("eventForm.title.add")[0]).toBeInTheDocument();
    });

    const submitButton = screen.getByText("buttons.submit");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("toasts.titleRequired");
    });
  });
});
