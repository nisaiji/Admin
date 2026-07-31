import { LocalPaymentRepository } from "../../features/payments/services/LocalPaymentRepository";
import { createSeedState } from "../../features/payments/services/localPaymentFixtures";
import { TENANT_TIER } from "../../features/payments/services/paymentsInvariants";

describe("Payments advanced repository flows", () => {
  test("setTenantTier updates tenant config and advanced flags", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    repo.setTenantTier(TENANT_TIER.ADVANCED);

    expect(repo.getTenantFeatureConfig()?.tier).toBe(TENANT_TIER.ADVANCED);
    expect(repo.getTenantFeatureConfig()?.lateFeeEngineEnabled).toBe(true);
    expect(repo.getTenantFeatureConfig()?.concessionEngineEnabled).toBe(true);
    expect(repo.getTenantFeatureConfig()?.walletEnabled).toBe(true);
  });

  test("late fee waivers and concessions create local adjustment facts", () => {
    const repo = new LocalPaymentRepository(createSeedState());
    repo.setTenantTier(TENANT_TIER.ADVANCED);

    const beforeProjection = repo.getPartyBalanceProjection("party_1");

    const waiver = repo.createLateFeeWaiver({
      partyId: "party_1",
      dueItemId: "due_1",
      amount: "50",
      effectiveDate: "2026-05-13",
      reason: "Waive excess late fee",
    });
    const concession = repo.createConcession({
      partyId: "party_1",
      dueItemId: "due_1",
      amount: "100",
      effectiveDate: "2026-05-13",
      reason: "Sibling discount",
    });

    const afterProjection = repo.getPartyBalanceProjection("party_1");
    const adjustments = repo.listDueItemAdjustments({ partyId: "party_1" });

    expect(waiver.adjustmentType).toBe("LATE_FEE_WAIVER");
    expect(concession.adjustmentType).toBe("CONCESSION");
    expect(adjustments).toHaveLength(2);
    expect(afterProjection?.ui?.total_outstanding_late_feeMinor).toBeLessThan(
      beforeProjection?.ui?.total_outstanding_late_feeMinor,
    );
    expect(afterProjection?.ui?.total_outstanding_principalMinor).toBeLessThan(
      beforeProjection?.ui?.total_outstanding_principalMinor,
    );
  });

  test("ledger timeline includes advanced adjustment rows and canonical facts", () => {
    const repo = new LocalPaymentRepository(createSeedState());
    repo.setTenantTier(TENANT_TIER.ADVANCED);
    repo.createLateFeeWaiver({
      partyId: "party_1",
      dueItemId: "due_1",
      amount: "25",
      effectiveDate: "2026-05-13",
      reason: "Late fee correction",
    });
    repo.createConcession({
      partyId: "party_1",
      dueItemId: "due_2",
      amount: "50",
      effectiveDate: "2026-05-13",
      reason: "Transport relief",
    });

    const timeline = repo.getLedgerTimeline({ context: "school", partyId: "party_1" });
    const rowTypes = new Set(timeline.rows.map((row) => row.rowType));

    expect(rowTypes.has("DUE_ITEM")).toBe(true);
    expect(rowTypes.has("PAYMENT")).toBe(true);
    expect(rowTypes.has("RECEIPT")).toBe(true);
    expect(rowTypes.has("ALLOCATION")).toBe(true);
    expect(rowTypes.has("REFUND")).toBe(true);
    expect(rowTypes.has("LATE_FEE_WAIVER")).toBe(true);
    expect(rowTypes.has("CONCESSION")).toBe(true);
  });

  test("as-of statement respects the date cutoff", () => {
    const repo = new LocalPaymentRepository(createSeedState());
    repo.setTenantTier(TENANT_TIER.ADVANCED);
    repo.createConcession({
      partyId: "party_1",
      dueItemId: "due_1",
      amount: "100",
      effectiveDate: "2026-05-13",
      reason: "Need-based concession",
    });

    const statement = repo.getAsOfStatement({
      partyId: "party_1",
      asOfDate: "2026-04-09",
    });

    expect(statement?.summary?.succeededPaymentsMinor).toBe(0n);
    expect(statement?.summary?.concessionMinor).toBe(0n);
    expect(statement?.timeline.every((row) => row.rowType === "DUE_ITEM")).toBe(true);
  });

  test("cron runs are listed newest first", () => {
    const repo = new LocalPaymentRepository(createSeedState());

    const runs = repo.listCronRuns();

    expect(runs[0]?.id).toBe("cron_3");
    expect(runs[1]?.id).toBe("cron_2");
    expect(runs[2]?.id).toBe("cron_1");
  });
});
