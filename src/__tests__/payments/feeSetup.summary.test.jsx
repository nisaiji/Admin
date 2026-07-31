import { formatSectionFeesSummary } from "../../components/payments/FeeStructureSetup/utils";

describe("fee setup summary formatting", () => {
  test("joins section fee amounts with slashes", () => {
    expect(
      formatSectionFeesSummary(
        { a: 1200, b: 1500, c: 1800 },
        [{ id: "a" }, { id: "b" }, { id: "c" }],
      ),
    ).toBe("₹ 1,200 / ₹ 1,500 / ₹ 1,800");
  });
});
