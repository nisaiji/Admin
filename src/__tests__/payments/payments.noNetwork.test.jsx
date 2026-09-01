import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import PaymentsLayout from "../../features/payments/pages/PaymentsLayout";
import AdminPaymentsDashboardPage from "../../features/payments/pages/AdminPaymentsDashboardPage";
import FeeStructureListPage from "../../features/payments/pages/FeeStructureListPage";
import FeeStructureWizardPage from "../../features/payments/pages/FeeStructureWizardPage";
import FeeSetupSettingsPage from "../../features/payments/pages/FeeSetupSettingsPage";
import CollectionsPartyProfilePage from "../../features/payments/pages/CollectionsPartyProfilePage";
import LookupsPage from "../../features/payments/pages/LookupsPage";
import SettlementPage from "../../features/payments/pages/SettlementPage";
import PaymentsFeatureComparisonPage from "../../features/payments/pages/PaymentsFeatureComparisonPage";

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
          <Route path="fee-setup" element={<FeeStructureListPage />} />
          <Route path="fee-setup/new" element={<FeeStructureWizardPage />} />
          <Route path="fee-setup/settings" element={<FeeSetupSettingsPage />} />
          <Route path="collections" element={<CollectionsPartyProfilePage context="school" />} />
          <Route
            path="collections/:partyId"
            element={<CollectionsPartyProfilePage context="school" />}
          />
          <Route
            path="coaching-dues"
            element={<CollectionsPartyProfilePage context="coaching" />}
          />
          <Route
            path="coaching-dues/:partyId"
            element={<CollectionsPartyProfilePage context="coaching" />}
          />
          <Route path="lookups" element={<LookupsPage />} />
          <Route path="settlements" element={<SettlementPage />} />
          <Route path="features" element={<PaymentsFeatureComparisonPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Payments module (local-only)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = jest.fn(() => {
      throw new Error("Network calls are not allowed in payments module tests");
    });
    window.XMLHttpRequest = jest.fn(() => {
      throw new Error("XHR calls are not allowed in payments module tests");
    });
  });

  test("navigating payments routes performs zero network requests", async () => {
    const user = userEvent.setup();
    renderPayments("/payments/dashboard");

    expect(screen.getByText("Payments dashboard")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("link", { name: "Fee Setup" }));
    expect(screen.getByText("Fee Structures")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("link", { name: "Collections" }));
    expect(
      screen.getByText(
        "Review student collection activity and drill into a student profile.",
      ),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("link", { name: "Lookups" }));
    expect(
      screen.getByText(
        "Lookup payments and receipts. No network calls; results are local canonical facts.",
      ),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("link", { name: "Settlements" }));
    expect(
      screen.getByText(
        "Admin-only transfer and payout visibility. Settlement state must never change payment or allocation status.",
      ),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("link", { name: "Plan" }));
    expect(screen.getByText("Feature comparison")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("creating a fee structure performs zero network requests", async () => {
    const user = userEvent.setup();
    renderPayments("/payments/fee-setup/new");

    expect(screen.getByText("Create Fee Structure")).toBeInTheDocument();

    const classOneCard = screen
      .getByRole("heading", { name: "Class 1" })
      .closest("article");
    await user.click(
      within(classOneCard).getByRole("button", { name: "Include this class" }),
    );
    await user.type(
      within(classOneCard).getByLabelText(
        "Amount per installment for all selected sections in Class 1",
      ),
      "100",
    );

    await user.click(screen.getByRole("button", { name: "Proceed to Review" }));
    expect(
      screen.getByText("Review Class Fee Structures"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Confirm & Create Structures" }),
    );
    expect(screen.getByText("Fee Structures Created!")).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("coaching dues route performs zero network requests", () => {
    renderPayments("/payments/coaching-dues");

    expect(screen.getAllByText("Coaching Dues").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Learner Name").length).toBeGreaterThan(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
