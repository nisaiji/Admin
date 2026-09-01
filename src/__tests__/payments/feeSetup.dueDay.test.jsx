import { LocalPaymentRepository } from "../../features/payments/services/LocalPaymentRepository";
import { createSeedState } from "../../features/payments/services/localPaymentFixtures";

describe("Fee Setup - Due Day of Month", () => {
  test("rejects due day outside 1-31 in school fee settings", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    expect(() =>
      repo.updateSchoolFeeSettings({
        dueDayOfMonth: 0,
      }),
    ).toThrow("Due Day of Month must be between 1 and 31.");

    expect(() =>
      repo.updateSchoolFeeSettings({
        dueDayOfMonth: 32,
      }),
    ).toThrow("Due Day of Month must be between 1 and 31.");
  });

  test("preview uses the school fee settings due day and clamps to month end", () => {
    const repo = new LocalPaymentRepository(createSeedState());
    repo.updateSchoolFeeSettings({ dueDayOfMonth: 31 });

    const periods = [
      "Apr",
      "May",
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
    ];

    const periodAmountsByPeriodLabel = Object.fromEntries(periods.map((p) => [p, "100"]));

    const preview = repo.previewClassFeeSetup({
      classId: "class_1",
      sectionIds: ["sec_1a"],
      periodAmountsByPeriodLabel,
    });

    const apr = preview.installments.find((i) => i.periodLabel === "Apr");
    const feb = preview.installments.find((i) => i.periodLabel === "Feb");

    expect(apr?.dueDate).toBe("2026-04-30");
    expect(feb?.dueDate).toBe("2027-02-28");
  });
});
