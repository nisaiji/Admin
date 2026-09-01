import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import PaymentsLayout from "../../features/payments/pages/PaymentsLayout";
import AdminPaymentsDashboardPage from "../../features/payments/pages/AdminPaymentsDashboardPage";
import CollectionsPartyProfilePage from "../../features/payments/pages/CollectionsPartyProfilePage";
import SettlementPage from "../../features/payments/pages/SettlementPage";
import PaymentsFeatureComparisonPage from "../../features/payments/pages/PaymentsFeatureComparisonPage";
import { LocalPaymentRepository } from "../../features/payments/services/LocalPaymentRepository";
import { createSeedState } from "../../features/payments/services/localPaymentFixtures";

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
          <Route path="collections" element={<CollectionsPartyProfilePage context="school" />} />
          <Route
            path="collections/:partyId"
            element={<CollectionsPartyProfilePage context="school" />}
          />
          <Route path="settlements" element={<SettlementPage />} />
          <Route path="features" element={<PaymentsFeatureComparisonPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Settlement alignment and feature gating", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("settlement screen renders the required visibility fields", () => {
    renderPayments("/payments/settlements");

    expect(screen.getByText("Transfer status")).toBeInTheDocument();
    expect(screen.getByText("Payout status")).toBeInTheDocument();
    expect(screen.getByText("Bank reference")).toBeInTheDocument();
    expect(screen.getByText("Platform retained amount")).toBeInTheDocument();
    expect(screen.getByText("Failure reason")).toBeInTheDocument();
  });

  test("retrying a settlement creates a new transfer fact only", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    const beforeTransfers = repo.listTransfers().length;
    const paymentBefore = repo
      .listPaymentsByParty("party_1")
      .find((payment) => payment.id === "pay_2");
    const allocationBefore = repo
      .listAllocationsByParty("party_1")
      .find((allocation) => allocation.id === "al_2");

    const retried = repo.retryTransfer({
      transferId: "tr_2",
      reason: "Retry failed payout transfer",
    });

    const paymentAfter = repo
      .listPaymentsByParty("party_1")
      .find((payment) => payment.id === "pay_2");
    const allocationAfter = repo
      .listAllocationsByParty("party_1")
      .find((allocation) => allocation.id === "al_2");

    expect(repo.listTransfers()).toHaveLength(beforeTransfers + 1);
    expect(retried.retryOfTransferId).toBe("tr_2");
    expect(retried.transferStatus).toBe("CREATED");
    expect(retried.failureReason).toBeNull();
    expect(paymentAfter?.status).toBe(paymentBefore?.status);
    expect(allocationAfter?.status).toBe(allocationBefore?.status);
  });

  test("comparison page lists advanced-only tools for reference", () => {
    renderPayments("/payments/features");

    expect(screen.getAllByText("Basic vs Advanced").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Late fee waiver").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Concession").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ledger timeline").length).toBeGreaterThan(0);
    expect(screen.getAllByText("As-of statement").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cron run visibility").length).toBeGreaterThan(0);
  });

  test("advanced-only tools are absent from basic operational screens", async () => {
    const user = userEvent.setup();
    renderPayments("/payments/dashboard");

    expect(screen.queryByRole("link", { name: "Late fee waiver" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Concession" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Collections" }));

    expect(screen.queryByText("Ledger timeline")).not.toBeInTheDocument();
    expect(screen.queryByText("As-of statement")).not.toBeInTheDocument();
  });
});
