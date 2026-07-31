import { LocalPaymentRepository } from "../../features/payments/services/LocalPaymentRepository";
import { createSeedState } from "../../features/payments/services/localPaymentFixtures";

describe("Fee Setup - Bulk repository and no payment artifacts", () => {
  test("bulk preview uses included rows and still tolerates the legacy enabled flag", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    repo.updateSchoolFeeSettings({ effectiveFromDate: "2026-06-15" });

    const preview = repo.previewBulkClassFeeSetup({
      rows: [
        {
          classId: "class_1",
          included: true,
          sectionIds: ["sec_1a", "sec_1b"],
          sameFeesForAllSections: true,
          commonSectionAmount: "100",
          sectionAmountsBySectionId: {},
          selectedFeeHeadIds: ["fee_head_tuition"],
          feeHeadAmountsById: {
            fee_head_tuition: "500",
          },
        },
        {
          classId: "class_2",
          included: false,
          sectionIds: ["sec_2a", "sec_2b", "sec_2c"],
          sameFeesForAllSections: true,
          commonSectionAmount: "999",
          sectionAmountsBySectionId: {},
          selectedFeeHeadIds: [],
          feeHeadAmountsById: {},
        },
      ],
    });

    expect(preview.rows).toHaveLength(1);
    expect(preview.rows[0].activePeriodCount).toBe(9);
    expect(preview.rows[0].className).toBe("Class 1");
    expect(preview.rows[0].sections.map((section) => section.name)).toEqual([
      "A",
      "B",
    ]);
    expect(preview.rows[0].totalAmountMinor).toBe(230000n);

    const legacyPreview = repo.previewBulkClassFeeSetup({
      rows: [
        {
          classId: "class_1",
          enabled: true,
          sectionIds: ["sec_1a", "sec_1b"],
          sameFeesForAllSections: true,
          commonSectionAmount: "100",
          sectionAmountsBySectionId: {},
          selectedFeeHeadIds: [],
          feeHeadAmountsById: {},
        },
      ],
    });

    expect(legacyPreview.rows).toHaveLength(1);
  });

  test("bulk preview validates included classes and classes without sections", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    expect(() =>
      repo.previewBulkClassFeeSetup({
        rows: [],
      }),
    ).toThrow("Select at least one class.");

    expect(() =>
      repo.previewBulkClassFeeSetup({
        rows: [
          {
            classId: "class_1",
            included: true,
            sectionIds: ["sec_2a"],
            sameFeesForAllSections: true,
            commonSectionAmount: "100",
            sectionAmountsBySectionId: {},
            selectedFeeHeadIds: [],
            feeHeadAmountsById: {},
          },
        ],
      }),
    ).toThrow("Section must belong to the selected class.");

    expect(() =>
      repo.previewBulkClassFeeSetup({
        rows: [
          {
            classId: "class_5",
            included: true,
            sectionIds: [],
            sameFeesForAllSections: true,
            commonSectionAmount: "100",
            sectionAmountsBySectionId: {},
            selectedFeeHeadIds: [],
            feeHeadAmountsById: {},
          },
        ],
      }),
    ).toThrow("No sections found for this class.");
  });

  test("bulk save stores only included setup rows and creates no payment truth artifacts", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    const beforePayments =
      repo.listPaymentsByParty("party_1").length +
      repo.listPaymentsByParty("party_2").length;
    const beforeReceipts =
      repo.listReceiptsByParty("party_1").length +
      repo.listReceiptsByParty("party_2").length;
    const beforeAllocations =
      repo.listAllocationsByParty("party_1").length +
      repo.listAllocationsByParty("party_2").length;
    const beforeRefunds =
      repo.listRefundsByParty("party_1").length +
      repo.listRefundsByParty("party_2").length;
    const beforeTransfers = repo.listTransfers().length;

    const result = repo.createBulkClassFeeSetup({
      rows: [
        {
          classId: "class_1",
          included: true,
          sectionIds: ["sec_1a", "sec_1b"],
          sameFeesForAllSections: true,
          commonSectionAmount: "100",
          sectionAmountsBySectionId: {},
          selectedFeeHeadIds: ["fee_head_others"],
          feeHeadAmountsById: {
            fee_head_others: "250",
          },
        },
        {
          classId: "class_2",
          included: false,
          sectionIds: ["sec_2a", "sec_2b", "sec_2c"],
          sameFeesForAllSections: true,
          commonSectionAmount: "300",
          sectionAmountsBySectionId: {},
          selectedFeeHeadIds: ["fee_head_transport"],
          feeHeadAmountsById: {
            fee_head_transport: "500",
          },
        },
      ],
    });

    expect(result.createdSetups).toHaveLength(1);
    expect(repo.listClassFeeSetups()).toHaveLength(1);
    expect(repo.listClassFeeSetups()[0].classId).toBe("class_1");

    const afterPayments =
      repo.listPaymentsByParty("party_1").length +
      repo.listPaymentsByParty("party_2").length;
    const afterReceipts =
      repo.listReceiptsByParty("party_1").length +
      repo.listReceiptsByParty("party_2").length;
    const afterAllocations =
      repo.listAllocationsByParty("party_1").length +
      repo.listAllocationsByParty("party_2").length;
    const afterRefunds =
      repo.listRefundsByParty("party_1").length +
      repo.listRefundsByParty("party_2").length;
    const afterTransfers = repo.listTransfers().length;

    expect(afterPayments).toBe(beforePayments);
    expect(afterReceipts).toBe(beforeReceipts);
    expect(afterAllocations).toBe(beforeAllocations);
    expect(afterRefunds).toBe(beforeRefunds);
    expect(afterTransfers).toBe(beforeTransfers);
  });
});
