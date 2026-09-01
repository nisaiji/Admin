import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PaymentsRepoProvider } from "../../features/payments/store/PaymentsRepoProvider";
import AdminPaymentsDashboardPage from "../../features/payments/pages/AdminPaymentsDashboardPage";

jest.mock("@mui/x-charts", () => ({
  PieChart: () => <div data-testid="pie-chart" />,
}));

jest.mock("../../components/payments/BarChart", () => ({
  __esModule: true,
  default: () => <div data-testid="bar-chart" />,
}));

global.ResizeObserver =
  global.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

global.matchMedia =
  global.matchMedia ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));

describe("Admin payments dashboard scope", () => {
  test("dashboard renders charts, recent transactions, and quick actions from local projections", () => {
    window.localStorage.clear();
    global.fetch = jest.fn(() => {
      throw new Error("Network calls are not allowed in payments module tests");
    });
    window.XMLHttpRequest = jest.fn(() => {
      throw new Error("XHR calls are not allowed in payments module tests");
    });

    render(
      <PaymentsRepoProvider>
        <MemoryRouter>
          <AdminPaymentsDashboardPage />
        </MemoryRouter>
      </PaymentsRepoProvider>,
    );

    expect(screen.getByText("Payments dashboard")).toBeInTheDocument();
    expect(screen.getByText("Payment Mode Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Fee Collection Trend")).toBeInTheDocument();
    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lookups/i })).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
