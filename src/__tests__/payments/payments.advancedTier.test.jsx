import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import PaymentsLayout from "../../features/payments/pages/PaymentsLayout";
import AdminPaymentsDashboardPage from "../../features/payments/pages/AdminPaymentsDashboardPage";
import PaymentsFeatureComparisonPage from "../../features/payments/pages/PaymentsFeatureComparisonPage";
import LateFeeWaiverPage from "../../features/payments/pages/LateFeeWaiverPage";
import ConcessionsPage from "../../features/payments/pages/ConcessionsPage";
import LedgerTimelinePage from "../../features/payments/pages/LedgerTimelinePage";
import AsOfStatementPage from "../../features/payments/pages/AsOfStatementPage";
import CronRunsPage from "../../features/payments/pages/CronRunsPage";
import PaymentsTierRouteGuard from "../../features/payments/components/PaymentsTierRouteGuard";
import { getPaymentsTierStorageKey } from "../../features/payments/utils/paymentsTierStorage";

jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ appConfig: { isDarkMode: true }, appAuth: {} }),
}));

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

function renderPayments(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/payments" element={<PaymentsLayout />}>
          <Route path="dashboard" element={<AdminPaymentsDashboardPage />} />
          <Route path="features" element={<PaymentsFeatureComparisonPage />} />
          <Route
            path="late-fee-waivers"
            element={(
              <PaymentsTierRouteGuard>
                <LateFeeWaiverPage />
              </PaymentsTierRouteGuard>
            )}
          />
          <Route
            path="concessions"
            element={(
              <PaymentsTierRouteGuard>
                <ConcessionsPage />
              </PaymentsTierRouteGuard>
            )}
          />
          <Route
            path="ledger-timeline"
            element={(
              <PaymentsTierRouteGuard>
                <LedgerTimelinePage />
              </PaymentsTierRouteGuard>
            )}
          />
          <Route
            path="as-of-statement"
            element={(
              <PaymentsTierRouteGuard>
                <AsOfStatementPage />
              </PaymentsTierRouteGuard>
            )}
          />
          <Route
            path="cron-runs"
            element={(
              <PaymentsTierRouteGuard>
                <CronRunsPage />
              </PaymentsTierRouteGuard>
            )}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Payments advanced tier gating", () => {
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = jest.fn(() => {
      throw new Error("Network calls are not allowed in payments module tests");
    });
    window.XMLHttpRequest = jest.fn(() => {
      throw new Error("XHR calls are not allowed in payments module tests");
    });
  });

  test("feature toggle persists and unlocks advanced navigation", async () => {
    const user = userEvent.setup();
    const firstRender = renderPayments("/payments/features");

    expect(screen.getByText("Current tenant: BASIC")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Late Fee Waiver" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Advanced" }));

    expect(screen.getByText("Current tenant: ADVANCED")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Late Fee Waiver" })).toBeInTheDocument();

    firstRender.unmount();
    renderPayments("/payments/features");

    expect(screen.getByText("Current tenant: ADVANCED")).toBeInTheDocument();
    expect(
      window.localStorage.getItem(getPaymentsTierStorageKey("tenant_demo_1")),
    ).toBe("ADVANCED");
  });

  test("basic tier redirects advanced routes back to the plan screen", () => {
    renderPayments("/payments/late-fee-waivers");

    expect(screen.getAllByText("Basic vs Advanced").length).toBeGreaterThan(0);
    expect(screen.getByText("Current tenant: BASIC")).toBeInTheDocument();
  });

  test("advanced dashboard shows advanced shortcuts only after tier unlock", () => {
    window.localStorage.setItem(
      getPaymentsTierStorageKey("tenant_demo_1"),
      "ADVANCED",
    );
    renderPayments("/payments/dashboard");

    expect(screen.getByRole("link", { name: "Late Fee Waiver" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Concessions" })).toBeInTheDocument();
    expect(screen.getByText("Advanced payments operations with local canonical projections.")).toBeInTheDocument();
  });

  test.each([
    ["/payments/late-fee-waivers", "Late Fee Waiver"],
    ["/payments/concessions", "Concessions"],
    ["/payments/ledger-timeline", "Ledger Timeline"],
    ["/payments/as-of-statement", "As-of Statement"],
    ["/payments/cron-runs", "Cron Runs"],
  ])("advanced route %s renders locally with no network calls", (path, heading) => {
    window.localStorage.setItem(
      getPaymentsTierStorageKey("tenant_demo_1"),
      "ADVANCED",
    );
    renderPayments(path);

    expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
