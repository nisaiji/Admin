import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import FeeSetupSettingsPage, {
  calculatePaymentScheduleInfo,
} from "../../features/payments/pages/FeeSetupSettingsPage";
import { PaymentsRepoProvider } from "../../features/payments/store/PaymentsRepoProvider";

const ACTIVE_SESSION = Object.freeze({
  sessionStartDate: "2026-04-01",
  sessionEndDate: "2027-03-31",
});

function renderSettingsPage() {
  return render(
    <PaymentsRepoProvider>
      <MemoryRouter>
        <FeeSetupSettingsPage />
      </MemoryRouter>
    </PaymentsRepoProvider>,
  );
}

describe("Fee Setup Settings schedule preview", () => {
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = jest.fn(() => {
      throw new Error("Network calls are not allowed in payments module tests");
    });
    window.XMLHttpRequest = jest.fn(() => {
      throw new Error("XHR calls are not allowed in payments module tests");
    });
  });

  test("monthly schedule uses the next valid due date after the effective date", () => {
    const result = calculatePaymentScheduleInfo({
      installmentType: "monthly",
      dueDayOfMonth: 10,
      effectiveFromDate: "2026-05-13",
      ...ACTIVE_SESSION,
    });

    expect(result.firstDueDate).toBe("2026-06-10");
    expect(result.paymentCount).toBe(10);
    expect(result.intervalMonths).toBe(1);
    expect(result.periods.map((period) => period.label)).toEqual([
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ]);
    expect(result.infoText).toBe(
      "First due date: 10 Jun 2026. Remaining payments this session: 10.",
    );
  });

  test("bimonthly schedule stays aligned to fixed academic buckets", () => {
    const result = calculatePaymentScheduleInfo({
      installmentType: "bimonthly",
      dueDayOfMonth: 10,
      effectiveFromDate: "2026-05-13",
      ...ACTIVE_SESSION,
    });

    expect(result.firstDueDate).toBe("2026-06-10");
    expect(result.paymentCount).toBe(5);
    expect(result.periods).toEqual([
      { label: "Jun-Jul", dueDate: "2026-06-10" },
      { label: "Aug-Sep", dueDate: "2026-08-10" },
      { label: "Oct-Nov", dueDate: "2026-10-10" },
      { label: "Dec-Jan", dueDate: "2026-12-10" },
      { label: "Feb-Mar", dueDate: "2027-02-10" },
    ]);
  });

  test("quarterly schedule stays aligned to fixed academic buckets", () => {
    const result = calculatePaymentScheduleInfo({
      installmentType: "quarterly",
      dueDayOfMonth: 10,
      effectiveFromDate: "2026-05-13",
      ...ACTIVE_SESSION,
    });

    expect(result.firstDueDate).toBe("2026-07-10");
    expect(result.paymentCount).toBe(3);
    expect(result.periods).toEqual([
      { label: "Jul-Sep", dueDate: "2026-07-10" },
      { label: "Oct-Dec", dueDate: "2026-10-10" },
      { label: "Jan-Mar", dueDate: "2027-01-10" },
    ]);
  });

  test("half-yearly schedule stays aligned to fixed academic buckets", () => {
    const result = calculatePaymentScheduleInfo({
      installmentType: "half-yearly",
      dueDayOfMonth: 10,
      effectiveFromDate: "2026-05-13",
      ...ACTIVE_SESSION,
    });

    expect(result.firstDueDate).toBe("2026-10-10");
    expect(result.paymentCount).toBe(1);
    expect(result.periods).toEqual([
      { label: "Oct-Mar", dueDate: "2026-10-10" },
    ]);
  });

  test("annual schedule does not roll into the next session", () => {
    const result = calculatePaymentScheduleInfo({
      installmentType: "annually",
      dueDayOfMonth: 10,
      effectiveFromDate: "2026-05-13",
      ...ACTIVE_SESSION,
    });

    expect(result.firstDueDate).toBe("");
    expect(result.paymentCount).toBe(0);
    expect(result.periods).toEqual([]);
    expect(result.infoText).toBe("No remaining payments in this session.");
  });

  test("monthly count is dynamic and not fixed to the full academic year", () => {
    renderSettingsPage();

    expect(
      screen.queryByText("12 payments per year"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "First due date: 10 Apr 2026. Remaining payments this session: 12.",
      ),
    ).toBeInTheDocument();
  });

  test("shows validation error when due day is below 1 or above 31", async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const dueDayInput = screen.getByPlaceholderText("1 - 31");

    await user.clear(dueDayInput);
    await user.type(dueDayInput, "0");
    expect(
      screen.getAllByText("Enter a due day between 1 and 31.").length,
    ).toBeGreaterThan(0);

    await user.clear(dueDayInput);
    await user.type(dueDayInput, "32");
    expect(
      screen.getAllByText("Enter a due day between 1 and 31.").length,
    ).toBeGreaterThan(0);
  });

  test("clamps due day 31 to the last day of shorter months", () => {
    const result = calculatePaymentScheduleInfo({
      installmentType: "monthly",
      dueDayOfMonth: 31,
      effectiveFromDate: "2026-02-01",
      sessionStartDate: "2025-04-01",
      sessionEndDate: "2026-03-31",
    });

    expect(result.firstDueDate).toBe("2026-02-28");
    expect(result.paymentCount).toBe(2);
    expect(result.infoText).toBe(
      "First due date: 28 Feb 2026. Remaining payments this session: 2.",
    );
  });

  test("changing the due day or effective date updates the preview immediately", async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const dueDayInput = screen.getByPlaceholderText("1 - 31");
    const effectiveDateInput = screen.getByLabelText("Effective Date");

    expect(
      screen.getByText(
        "First due date: 10 Apr 2026. Remaining payments this session: 12.",
      ),
    ).toBeInTheDocument();

    await user.clear(effectiveDateInput);
    await user.type(effectiveDateInput, "2026-05-13");
    expect(
      screen.getByText(
        "First due date: 10 Jun 2026. Remaining payments this session: 10.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Periods: Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar."),
    ).toBeInTheDocument();

    await user.clear(dueDayInput);
    await user.type(dueDayInput, "20");
    expect(
      screen.getByText(
        "First due date: 20 May 2026. Remaining payments this session: 11.",
      ),
    ).toBeInTheDocument();
  });

  test("page interactions stay local-only and perform zero network requests", async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const dueDayInput = screen.getByPlaceholderText("1 - 31");
    const effectiveDateInput = screen.getByLabelText("Effective Date");

    await user.clear(dueDayInput);
    await user.type(dueDayInput, "15");
    await user.clear(effectiveDateInput);
    await user.type(effectiveDateInput, "2026-05-13");
    await user.click(screen.getByRole("button", { name: "Save Settings" }));

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
