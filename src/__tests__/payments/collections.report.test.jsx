import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { PaymentsRepoProvider } from "../../features/payments/store/PaymentsRepoProvider";
import CollectionsPartyProfilePage from "../../features/payments/pages/CollectionsPartyProfilePage";
import { LocalPaymentRepository } from "../../features/payments/services/LocalPaymentRepository";
import { createSeedState } from "../../features/payments/services/localPaymentFixtures";
import { formatInrFromMinor } from "../../features/payments/utils/formatters";

function renderCollections(initialPath = "/payments/collections") {
  return render(
    <PaymentsRepoProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/payments/collections"
            element={<CollectionsPartyProfilePage context="school" />}
          />
          <Route
            path="/payments/collections/:partyId"
            element={<CollectionsPartyProfilePage context="school" />}
          />
        </Routes>
      </MemoryRouter>
    </PaymentsRepoProvider>,
  );
}

describe("Collections report", () => {
  test("builds filtered activity rows and aggregates them into student summary rows", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    const allRows = repo.getCollectionsReport();
    expect(allRows.rows).toHaveLength(8);
    expect(allRows.partyRows).toHaveLength(2);
    expect(allRows.summary.matchedActivitiesCount).toBe(8);
    expect(allRows.partyRows[0].partyName).toBe("Aarav Sharma");
    expect(allRows.partyRows[0].matchedActivityCount).toBe(7);
    expect(allRows.partyRows[0].collectedAmountMinor).toBe(1100000n);
    expect(allRows.partyRows[0].outstandingAmountMinor).toBe(432500n);
    expect(allRows.partyRows[0].totalPayableMinor).toBe(1452500n);

    const classFiltered = repo.getCollectionsReport({ classId: "class_1" });
    expect(classFiltered.rows.every((row) => row.classId === "class_1")).toBe(true);
    expect(classFiltered.partyRows).toHaveLength(1);
    expect(classFiltered.partyRows[0].partyId).toBe("party_1");

    const sectionFiltered = repo.getCollectionsReport({
      classId: "class_2",
      sectionId: "sec_2b",
    });
    expect(sectionFiltered.rows.every((row) => row.sectionId === "sec_2b")).toBe(true);
    expect(sectionFiltered.partyRows).toHaveLength(1);
    expect(sectionFiltered.partyRows[0].partyId).toBe("party_2");

    const dateFiltered = repo.getCollectionsReport({
      startDate: "2026-05-01",
      endDate: "2026-05-12",
    });
    expect(dateFiltered.rows).toHaveLength(4);
    expect(dateFiltered.partyRows).toHaveLength(2);

    const rowTypeFiltered = repo.getCollectionsReport({ rowType: "REFUND" });
    expect(rowTypeFiltered.rows).toHaveLength(1);
    expect(rowTypeFiltered.partyRows).toHaveLength(1);
    expect(rowTypeFiltered.partyRows[0].partyId).toBe("party_1");
    expect(rowTypeFiltered.partyRows[0].matchedActivityCount).toBe(1);
    expect(rowTypeFiltered.partyRows[0].collectedAmountMinor).toBe(0n);
    expect(
      rowTypeFiltered.filters.rowTypeOptions.some(
        (option) => option.value === "PAYMENT",
      ),
    ).toBe(true);

    const paymentModeFiltered = repo.getCollectionsReport({ paymentMode: "UPI" });
    expect(paymentModeFiltered.rows).toHaveLength(3);
    expect(paymentModeFiltered.rows.every((row) => row.paymentMode === "UPI")).toBe(true);
    expect(paymentModeFiltered.summary.matchedActivitiesCount).toBe(3);
    expect(paymentModeFiltered.partyRows).toHaveLength(1);
    expect(paymentModeFiltered.partyRows[0].partyId).toBe("party_1");
    expect(paymentModeFiltered.partyRows[0].matchedActivityCount).toBe(3);
    expect(paymentModeFiltered.partyRows[0].collectedAmountMinor).toBe(100000n);
  });

  test("navigates from the student summary report to the student drill-down", async () => {
    const user = userEvent.setup();
    renderCollections();

    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "View student" })[0]);

    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to report" })).toBeInTheDocument();
  });

  test("renders matched activity wording and aggregated student totals", () => {
    renderCollections();

    expect(screen.getByText("Review student collection activity and drill into a student profile.")).toBeInTheDocument();
    expect(screen.getByText("Matched activities")).toBeInTheDocument();
    expect(screen.queryByText("Ledger")).not.toBeInTheDocument();
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Iyer")).toBeInTheDocument();
    expect(screen.getByText(formatInrFromMinor(1452500n))).toBeInTheDocument();
    expect(screen.getByText(formatInrFromMinor(432500n))).toBeInTheDocument();
  });

  test("filters the student summary report by row type in the UI", async () => {
    const user = userEvent.setup();
    renderCollections();

    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Iyer")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Row Type" }), "REFUND");

    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Diya Iyer")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "View student" })).toHaveLength(1);
  });
});
