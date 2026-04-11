import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { axiosClient } from "../../services/axiosClient";
import Dashboard from "../../components/dashBoard/DashBoard";

import { Provider, useSelector } from "react-redux";

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  Toaster: ({ children }) => children,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("react-chartjs-2", () => ({
  Chart: () => <div data-testid="mock-chart" />,
}));

jest.mock("chart.js", () => ({
  Chart: {
    register: jest.fn(),
  },
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock("chart.js/auto", () => ({
  register: jest.fn(),
}));

const mockStore = configureStore([]);

const renderComponent = (storeState) => {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </Provider>
  );
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((selector) =>
      selector({
        appConfig: { isDarkMode: false },
        appAuth: { role: "admin", schoolName: "Test School" },
      })
    );
  });

  test("renders Dashboard without crashing", () => {
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: { role: "admin", schoolName: "Test School" },
    });
    // expect(screen.getByText("Test School")).toBeInTheDocument();
    expect(screen.getByText("dashboard.attendance")).toBeInTheDocument();
    // expect(screen.getByText("dashboard.daily")).toBeInTheDocument();
    // expect(screen.getByText("dashboard.weekly")).toBeInTheDocument();
    // expect(screen.getByText("dashboard.monthly")).toBeInTheDocument();
  });


  test.skip("fetches and displays class list", async () => {
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [
        {
          _id: "1",
          name: "Class A",
          section: [{ _id: "s1", name: "Section 1" }],
        },
      ],
    });
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: { role: "admin" },
    });
    await waitFor(() => expect(axiosClient.get).toHaveBeenCalled());
  });

  test.skip("changes selected option and updates data", async () => {
    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: { attendances: [], totalStudent: 100 },
    });
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: { role: "admin" },
    });
    const weeklyButton = screen.getByText("Weekly");
    fireEvent.click(weeklyButton);
    await waitFor(() => expect(axiosClient.post).toHaveBeenCalled());
  });

  test.skip("fetches calendar events", async () => {
    axiosClient.post.mockResolvedValue({
      statusCode: 200,
      result: [{ date: "2024-02-11", title: "Event 1" }],
    });
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: { role: "admin" },
    });
    await waitFor(() => expect(axiosClient.post).toHaveBeenCalled());
  });

  test.skip("handles date change", async () => {
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: { role: "admin" },
    });
    const nextButton = screen.getAllByAltText("DownIcon")[1];
    fireEvent.click(nextButton);
    expect(screen.getByText(/March 2024|April 2024/)).toBeInTheDocument();
  });

  test.skip("displays loading spinner when fetching data", async () => {
    axiosClient.get.mockImplementation(() => new Promise(() => {}));
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: { role: "admin" },
    });
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  test.skip("handles API error gracefully", async () => {
    axiosClient.get.mockRejectedValue(new Error("Network Error"));
    renderComponent({
      appConfig: { isDarkMode: false },
      appAuth: { role: "admin" },
    });
    await waitFor(() =>
      expect(screen.getByText("Error fetching data")).toBeInTheDocument()
    );
  });
});
