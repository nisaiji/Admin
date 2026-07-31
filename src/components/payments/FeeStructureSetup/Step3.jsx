import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import { createClassConfig, getRecurringInstallmentCount, getTableGridTemplate } from "./utils";

function formatAmount(value) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function Step3({
  feeHeads,
  structure,
  onBack,
  onFinish,
  primaryActionLabel = "Confirm & Save",
}) {
  const { classAndSectionData } = useSelector((state) => state.appAuth ?? {});
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? false);
  const selectedClassId = structure.selectedClassId || "";
  const classConfig = structure.classConfigs?.[selectedClassId] || null;

  // theme tokens
  const t = {
    card: isDarkMode ? "bg-[#111315] border-[#262b36]" : "bg-white border-[#e7e2e2]",
    metaCard: isDarkMode ? "bg-[#151a23] border-[#262b36]" : "bg-[#f0f6f9] border-[#e7e2e2]",
    tableInner: isDarkMode ? "bg-[#0b0d14] border-[#262b36]" : "bg-white border-[#e7e2e2]",
    tableHead: isDarkMode ? "bg-[#151a23] border-[#262b36]" : "bg-[#e5f0f5] border-[#e7e2e2]",
    tableBody: isDarkMode ? "bg-[#111315]" : "bg-white",
    tableRow: isDarkMode ? "border-[#262b36]" : "border-[#e7e2e2]",
    totalRow: isDarkMode ? "bg-[#151a23]" : "bg-[#e5f0f5]",
    text: isDarkMode ? "text-[#e3e8f3]" : "text-[#0f0f0f]",
    subText: isDarkMode ? "text-slate-400" : "text-[#686868]",
    headText: isDarkMode ? "text-[#cbd5e1]" : "text-[#002861]",
    cancelBtn: isDarkMode
      ? "border-[#2b3242] bg-[#111827] text-slate-300 hover:bg-[#171b24]"
      : "border-[#e7e2e2] bg-white text-[#0f0f0f] hover:bg-gray-50",
    metaLabel: isDarkMode ? "text-slate-400" : "text-[#686868]",
  };

  const activeConfig = useMemo(() => {
    if (!classConfig?.classId) return null;

    return createClassConfig(
      {
        _id: classConfig.classId,
        name: classConfig.className,
        section: (classConfig.sections || []).map((section) => ({
          _id: section.id,
          name: section.label,
        })),
      },
      feeHeads,
      classConfig,
    );
  }, [classConfig, feeHeads]);

  const recurringInstallmentCount = useMemo(() => {
    return getRecurringInstallmentCount({
      frequency: classAndSectionData?.feeStructureData?.frequency,
      dueDate: classAndSectionData?.feeStructureData?.dueDate,
      updatedAt: classAndSectionData?.feeStructureData?.updatedAt,
      createdAt: classAndSectionData?.feeStructureData?.createdAt,
      sessionStartDate: classAndSectionData?.selectedSession?.startDate,
      sessionEndDate: classAndSectionData?.selectedSession?.endDate,
    });
  }, [
    classAndSectionData?.feeStructureData?.createdAt,
    classAndSectionData?.feeStructureData?.dueDate,
    classAndSectionData?.feeStructureData?.frequency,
    classAndSectionData?.feeStructureData?.updatedAt,
    classAndSectionData?.selectedSession?.endDate,
    classAndSectionData?.selectedSession?.startDate,
  ]);

  const totals = useMemo(() => {
    if (!activeConfig) return null;

    const storedTotals = structure?.summaryTotals;
    if (storedTotals?.sectionTotals) {
      return {
        sectionTotals: storedTotals.sectionTotals,
        grandTotal: storedTotals.grandTotal || 0,
      };
    }

    const sectionTotals = {};
    activeConfig.sections.forEach((section) => {
      sectionTotals[section.id] = 0;
    });

    let grandTotal = 0;

    feeHeads.forEach((head) => {
      const row = activeConfig.rows?.[head.id];
      if (!row) return;

      if (activeConfig.sectionFeeType === "same") {
        const amount = Number(row.commonAmount || 0);
        activeConfig.sections.forEach((section) => {
          sectionTotals[section.id] += amount * recurringInstallmentCount;
        });
        grandTotal += amount * activeConfig.sections.length * recurringInstallmentCount;
        return;
      }

      activeConfig.sections.forEach((section) => {
        const amount = Number(row.sectionAmounts?.[section.id] || 0);
        sectionTotals[section.id] += amount * recurringInstallmentCount;
        grandTotal += amount * recurringInstallmentCount;
      });
    });

    return { sectionTotals, grandTotal };
  }, [activeConfig, feeHeads, recurringInstallmentCount, structure?.summaryTotals]);

  const gridTemplateColumns = useMemo(() => {
    if (!activeConfig) return "auto";
    return getTableGridTemplate(activeConfig.sections.length, activeConfig.sectionFeeType);
  }, [activeConfig]);

  if (!activeConfig) {
    return (
      <div className={"rounded-2xl border p-6 shadow-sm " + t.card}>
        <div className={"text-sm font-semibold " + t.text}>Review</div>
        <div className={"mt-1 text-sm " + t.subText}>
          No class data is available to review.
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className={"h-10 rounded-md border px-4 text-sm font-semibold transition-colors " + t.cancelBtn}
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="h-10 rounded-md bg-[#0a81d1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0970b8]"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    );
  }

  const sameMode = activeConfig.sectionFeeType !== "different";

  return (
    <div className={"rounded-2xl border p-6 shadow-sm " + t.card}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className={"text-[18px] font-bold " + t.text}>Review</h2>
          <p className={"mt-1 text-sm " + t.subText}>
            Review the selected class and its fee setup before OTP verification.
          </p>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="h-10 rounded-md bg-[#0a81d1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0970b8]"
        >
          {primaryActionLabel}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={"rounded-xl border p-4 " + t.metaCard}>
          <div className={"text-xs " + t.metaLabel}>Class</div>
          <div className={"mt-1 font-semibold " + t.text}>{activeConfig.className}</div>
        </div>

        <div className={"rounded-xl border p-4 " + t.metaCard}>
          <div className={"text-xs " + t.metaLabel}>Section Fee Type</div>
          <div className={"mt-1 font-semibold " + t.text}>
            {sameMode ? "Same Fee Amount for All Sections" : "Different Fee Amount for Each Section"}
          </div>
        </div>

        <div className={"rounded-xl border p-4 " + t.metaCard}>
          <div className={"text-xs " + t.metaLabel}>Sections</div>
          <div className={"mt-1 font-semibold " + t.text}>{activeConfig.sections.length}</div>
        </div>
      </div>

      <div className={"mt-6 overflow-x-auto rounded-xl border " + t.tableInner}>
        <div className="w-full">
          <div className={"grid border-b " + t.tableHead} style={{ gridTemplateColumns }}>
            <div className={"px-4 py-4 text-sm font-semibold " + t.headText}>Fee Head</div>
            <div className={"px-4 py-4 text-center text-sm font-semibold " + t.headText}>Head Type</div>
            {sameMode ? (
              <div className={"px-4 py-4 text-center text-sm font-semibold " + t.headText}>
                All Sections (Common Amount)
              </div>
            ) : (
              activeConfig.sections.map((section) => (
                <div
                  key={section.id}
                  className={"px-4 py-4 text-center text-sm font-semibold " + t.headText}
                >
                  {section.label}
                </div>
              ))
            )}
            <div className={"px-4 py-4 text-center text-sm font-semibold " + t.headText}>Due Pattern</div>
          </div>

          <div className={t.tableBody}>
            {feeHeads.map((head) => {
              const row = activeConfig.rows?.[head.id];
              if (!row) return null;

              return (
                <div
                  key={head.id}
                  className={"grid border-b " + t.tableRow}
                  style={{ gridTemplateColumns }}
                >
                  <div className={"px-4 py-4 text-sm " + t.text}>
                    <div className="font-semibold">{head.name}</div>
                    <div className={"text-xs " + t.subText}>{head.label}</div>
                  </div>

                  <div className="px-4 py-4 flex justify-center">
                    <span
                      className={`rounded px-4 py-1 text-sm ${
                        head.headType === "Recurring"
                          ? "bg-[rgba(76,188,154,0.12)] text-[#4cbc9a]"
                          : "bg-[rgba(79,142,247,0.12)] text-[#4F8EF7]"
                      }`}
                    >
                      {head.headType}
                    </span>
                  </div>

                  {sameMode ? (
                    <div className={"px-4 py-4 text-center text-sm " + t.text}>
                      {formatAmount(row.commonAmount)}
                    </div>
                  ) : (
                    activeConfig.sections.map((section) => (
                      <div key={section.id} className={"px-4 py-4 text-center text-sm " + t.text}>
                        {formatAmount(row.sectionAmounts?.[section.id])}
                      </div>
                    ))
                  )}

                  <div className={"px-4 py-4 text-center text-sm " + t.text}>
                    {row.duePattern}
                  </div>
                </div>
              );
            })}

            {sameMode ? (
              <div className={"grid " + t.totalRow} style={{ gridTemplateColumns }}>
                <div className={"px-4 py-4 text-sm font-semibold " + t.text}>Section Totals</div>
                <div className={"px-4 py-4 text-center text-sm " + t.subText}>All fee heads</div>
                <div className={"px-4 py-4 text-center text-sm font-semibold " + t.text}>
                  {formatAmount(totals?.sectionTotals?.[activeConfig.sections[0]?.id])}
                </div>
                <div className={"px-4 py-4 text-center text-sm " + t.subText}>
                  Each section receives the same total
                </div>
              </div>
            ) : (
              <div className={"grid " + t.totalRow} style={{ gridTemplateColumns }}>
                <div className={"px-4 py-4 text-sm font-semibold " + t.text}>Section Totals</div>
                <div className={"px-4 py-4 text-center text-sm " + t.subText}>All fee heads</div>
                {activeConfig.sections.map((section) => (
                  <div
                    key={section.id}
                    className={"px-4 py-4 text-center text-sm font-semibold " + t.text}
                  >
                    {formatAmount(totals?.sectionTotals?.[section.id])}
                  </div>
                ))}
                <div className={"px-4 py-4 text-center text-sm " + t.subText}>
                  Section-wise totals
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className={"h-10 rounded-md border px-4 text-sm font-semibold transition-colors " + t.cancelBtn}
        >
          Back to Edit
        </button>

        <button
          type="button"
          onClick={onFinish}
          className="h-10 rounded-md bg-[#0a81d1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0970b8]"
        >
          {primaryActionLabel}
        </button>
      </div>
    </div>
  );
}
