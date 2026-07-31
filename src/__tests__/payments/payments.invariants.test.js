import { LocalPaymentRepository } from "../../features/payments/services/LocalPaymentRepository";
import { createSeedState } from "../../features/payments/services/localPaymentFixtures";

describe("LocalPaymentRepository invariants", () => {
  test("duplicate provider event produces one receipt (idempotent)", () => {
    const seed = createSeedState();
    seed.providerEvents = [];
    seed.receipts = [];

    const repo = new LocalPaymentRepository(seed);

    const first = repo.processMockProviderEventOnce({
      providerEventId: "evt_idem_1",
      paymentId: "pay_1",
    });
    const second = repo.processMockProviderEventOnce({
      providerEventId: "evt_idem_1",
      paymentId: "pay_1",
    });

    expect(first.ignored).toBe(false);
    expect(second.ignored).toBe(true);

    const receipts = repo.listReceiptsByParty("party_1");
    const matching = receipts.filter((r) => r.paymentId === "pay_1");
    expect(matching).toHaveLength(1);
  });

  test("receipt cannot exist for failed payment", () => {
    const seed = createSeedState();
    seed.providerEvents = [];
    seed.receipts = [
      {
        id: "rcpt_failed_1",
        tenantId: seed.tenantId,
        receiptNumber: "RCPT-FAIL",
        paymentId: "pay_3",
        partyId: "party_2",
        amountMinor: 100n,
        currency: "INR",
        issuedAt: new Date().toISOString(),
        status: "ISSUED",
        voidReason: null,
        createdBy: "test",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const repo = new LocalPaymentRepository(seed);

    expect(() =>
      repo.processMockProviderEventOnce({
        providerEventId: "evt_failed_1",
        paymentId: "pay_3",
      }),
    ).toThrow("Receipt cannot exist for failed payment.");
  });

  test("allocation cannot exceed due outstanding", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    expect(() =>
      repo.createManualAllocation({
        partyId: "party_1",
        paymentId: "pay_2",
        dueItemId: "due_2",
        allocatedAmount: "999999",
        reason: "Test allocation",
      }),
    ).toThrow("Allocation exceeds due outstanding.");
  });

  test("refund cannot exceed refundable amount", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    expect(() =>
      repo.createRefund({
        partyId: "party_1",
        paymentId: "pay_1",
        amount: "999999",
        reason: "Test refund",
      }),
    ).toThrow("Refund exceeds refundable amount.");
  });
});

