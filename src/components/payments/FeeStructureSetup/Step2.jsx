import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";

import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import {
  createClassConfig,
  deriveCommonAmount,
  getTableGridTemplate,
  getRecurringInstallmentCount,
  isValidAmount,
  sanitizeAmountInput,
} from "./utils";

const MODE_OPTIONS = [
  { value: "same", label: "Same Fee Amount for All Sections" },
  { value: "different", label: "Different Fee Amount for Each Section" },
];

const DUE_PATTERN_OPTIONS = ["Monthly dues", "One due item"];

const FREQUENCY_MONTHS = {
  MONTHLY: 1,
  BY_MONTHLY: 2,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12,
};

function getAmountError(value) {
  if (value === "" || value === null || value === undefined) {
    return "Enter an amount";
  }

  return isValidAmount(value) ? "" : "Enter a valid amount";
}

function getClassName(classItem) {
  return classItem?.name || "Class";
}

function sortClasses(classes) {
  const collator = new Intl.Collator("en", {
    numeric: true,
    sensitivity: "base",
  });

  return [...classes].sort((first, second) =>
    collator.compare(getClassName(first), getClassName(second)),
  );
}

function getRecurringStartMonthLabel({
  frequency,
  dueDate,
  updatedAt,
  createdAt,
  sessionStartDate,
  sessionEndDate,
}) {
  const sessionStart = sessionStartDate ? moment(sessionStartDate).startOf("day") : null;
  const cycleUpdatedAt = updatedAt
    ? moment(updatedAt).startOf("day")
    : createdAt
      ? moment(createdAt).startOf("day")
      : null;
  const monthsPerPeriod = FREQUENCY_MONTHS[String(frequency || "").toUpperCase()];
  const dueDay = Number(dueDate);

  const startFrom = sessionStart && cycleUpdatedAt
    ? moment.max(sessionStart, cycleUpdatedAt)
    : sessionStart || cycleUpdatedAt;

  if (
    !startFrom ||
    !startFrom.isValid() ||
    !monthsPerPeriod ||
    !Number.isFinite(dueDay) ||
    dueDay < 1
  ) {
    return startFrom && startFrom.isValid() ? startFrom.format("MMM") : "Apr";
  }

  const anchor = startFrom.clone().startOf("month");
  const sessionEnd = sessionEndDate && moment(sessionEndDate).isValid()
    ? moment(sessionEndDate).endOf("month")
    : anchor.clone().add(11, "months").endOf("month");

  for (
    let cursor = anchor.clone();
    !cursor.isAfter(sessionEnd);
    cursor.add(monthsPerPeriod, "months")
  ) {
    const dueDateMoment = cursor
      .clone()
      .date(Math.min(dueDay, cursor.daysInMonth()))
      .endOf("day");

    if (dueDateMoment.isSameOrAfter(startFrom, "day")) {
      return dueDateMoment.format("MMM");
    }
  }

  return anchor.format("MMM");
}

function getSectionHeadAmount(row, sectionId, sectionFeeType) {
  if (!row) return 0;

  if (sectionFeeType === "same") {
    return Number(row.commonAmount || 0);
  }

  return Number(row.sectionAmounts?.[sectionId] || 0);
}

function getSectionTotalAmount({ config, feeHeads, sectionId, recurringInstallmentCount }) {
  if (!config || !sectionId) return 0;

  return feeHeads.reduce((total, head) => {
    const headId = head?._id || head?.id;
    const row = config.rows?.[headId];
    if (!row) return total;

    const amount = getSectionHeadAmount(row, sectionId, config.sectionFeeType);
    const isRecurring = String(head?.type || head?.headType || "").toUpperCase() === "RECURRING";

    return total + amount * (isRecurring ? recurringInstallmentCount : 1);
  }, 0);
}

function formatAmount(value) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function Step2({
  feeHeads,
  structure,
  setStructure,
  onBack,
  onNext,
}) {
  const { classAndSectionData } = useSelector((state) => state.appAuth ?? {});
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? false);
  const selectedSessionId = classAndSectionData?.selectedSession?._id;
  const [classList, setClassList] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const [actionError, setActionError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // theme tokens
  const t = {
    card: isDarkMode ? "bg-[#111315] border-[#262b36]" : "bg-white border-[#e7e2e2]",
    tableHead: isDarkMode ? "bg-[#151a23] border-[#262b36]" : "bg-[#e5f0f5] border-[#e7e2e2]",
    tableBody: isDarkMode ? "bg-[#111315]" : "bg-white",
    tableRow: isDarkMode ? "border-[#262b36]" : "border-[#e7e2e2]",
    tableInner: isDarkMode ? "bg-[#0b0d14] border-[#262b36]" : "bg-white border-[#e7e2e2]",
    totalRow: isDarkMode ? "bg-[#151a23]" : "bg-[#e5f0f5]",
    text: isDarkMode ? "text-[#e3e8f3]" : "text-[#0f0f0f]",
    subText: isDarkMode ? "text-slate-400" : "text-[#686868]",
    headText: isDarkMode ? "text-[#cbd5e1]" : "text-[#002861]",
    input: isDarkMode
      ? "bg-[#0b0d14] border-[#2b3242] text-[#e3e8f3] focus:border-[#0a81d1]"
      : "bg-white border-[#dfe5eb] text-[#0f0f0f] focus:border-[#0a81d1]",
    select: isDarkMode
      ? "bg-[#0b0d14] border-[#2b3242] text-[#e3e8f3]"
      : "bg-white border-[#dfe5eb] text-[#0f0f0f]",
    infoBox: isDarkMode
      ? "bg-[rgba(10,129,209,0.08)] border-[#262b36]"
      : "bg-blue-50 border-blue-100",
    infoText: isDarkMode ? "text-slate-300" : "text-blue-700",
    infoIcon: isDarkMode ? "bg-[rgba(10,129,209,0.18)] text-[#4F8EF7]" : "bg-blue-100 text-blue-600",
    cancelBtn: isDarkMode
      ? "border-[#2b3242] bg-[#111827] text-slate-300 hover:bg-[#171b24]"
      : "border-[#e7e2e2] bg-white text-[#0f0f0f] hover:bg-gray-50",
  };

  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    setFetchError("");
    setIsUsingDummyData(false);

    if (!selectedSessionId) {
      setClassList([]);
      setIsUsingDummyData(true);
      setLoadingClasses(false);
      return;
    }

    try {
      const response = await axiosClient.get(
        `${EndPoints.COMMON.CLASS_LIST}/${selectedSessionId}`,
      );
      const classes = Array.isArray(response?.result) ? response.result : [];
      const classesWithSections = classes.filter(
        (item) => Array.isArray(item?.section) && item.section.length > 0,
      );

      const nextClasses = classesWithSections.length
        ? sortClasses(classesWithSections)
        : [];

      setClassList(nextClasses);
      setIsUsingDummyData(!classesWithSections.length);
    } catch (error) {
      setClassList([]);
      setIsUsingDummyData(true);
      setFetchError("Failed to load classes. Showing dummy data for testing.");
    } finally {
      setLoadingClasses(false);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const selectedClassId = structure.selectedClassId || classList[0]?._id || "";

  const selectedClass = useMemo(
    () => classList.find((item) => item?._id === selectedClassId) || null,
    [classList, selectedClassId],
  );

  const activeConfig = useMemo(() => {
    if (!selectedClass) return null;

    return createClassConfig(
      selectedClass,
      feeHeads,
      structure.classConfigs?.[selectedClassId] || {},
    );
  }, [feeHeads, selectedClass, selectedClassId, structure.classConfigs]);

  const gridTemplateColumns = useMemo(() => {
    if (!activeConfig) return "auto";
    return getTableGridTemplate(
      activeConfig.sections.length,
      activeConfig.sectionFeeType,
    );
  }, [activeConfig]);

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
    classAndSectionData?.feeStructureData?.dueDate,
    classAndSectionData?.feeStructureData?.frequency,
    classAndSectionData?.feeStructureData?.updatedAt,
    classAndSectionData?.feeStructureData?.createdAt,
    classAndSectionData?.selectedSession?.endDate,
    classAndSectionData?.selectedSession?.startDate,
  ]);

  const sectionTotals = useMemo(() => {
    if (!activeConfig?.sections?.length) return {};

    return activeConfig.sections.reduce((totals, section) => {
      totals[section.id] = getSectionTotalAmount({
        config: activeConfig,
        feeHeads,
        sectionId: section.id,
        recurringInstallmentCount,
      });
      return totals;
    }, {});
  }, [activeConfig, feeHeads, recurringInstallmentCount]);

  useEffect(() => {
    if (!activeConfig?.sections?.length) return;

    setStructure((prev) => ({
      ...prev,
      summaryTotals: {
        sectionTotals,
        grandTotal:
          activeConfig.sectionFeeType === "same"
            ? activeConfig.sections.reduce(
                (total, section) => total + Number(sectionTotals?.[section.id] || 0),
                0,
              )
            : activeConfig.sections.reduce(
                (total, section) => total + Number(sectionTotals?.[section.id] || 0),
                0,
              ),
        recurringInstallmentCount,
      },
    }));
  }, [activeConfig, recurringInstallmentCount, sectionTotals, setStructure]);

  const updateActiveClassConfig = useCallback(
    (updater) => {
      setStructure((prev) => {
        const currentClassId =
          prev.selectedClassId &&
          classList.some((item) => item?._id === prev.selectedClassId)
            ? prev.selectedClassId
            : classList[0]?._id || "";

        const currentClass = classList.find(
          (item) => item?._id === currentClassId,
        );
        if (!currentClass) return prev;

        const currentConfig = createClassConfig(
          currentClass,
          feeHeads,
          prev.classConfigs?.[currentClassId] || {},
        );

        const nextConfig = updater(currentConfig);

        return {
          ...prev,
          selectedClassId: currentClassId,
          classConfigs: {
            ...prev.classConfigs,
            [currentClassId]: nextConfig,
          },
        };
      });
    },
    [classList, feeHeads, setStructure],
  );

  useEffect(() => {
    if (!classList.length) return;

    const validSelectedId = classList.some(
      (item) => item?._id === structure.selectedClassId,
    )
      ? structure.selectedClassId
      : classList[0]?._id || "";

    if (!validSelectedId) return;

    const currentClass =
      classList.find((item) => item?._id === validSelectedId) || classList[0];

    setStructure((prev) => {
      const normalized = createClassConfig(
        currentClass,
        feeHeads,
        prev.classConfigs?.[validSelectedId] || {},
      );

      return {
        ...prev,
        selectedClassId: validSelectedId,
        classConfigs: {
          ...prev.classConfigs,
          [validSelectedId]: normalized,
        },
      };
    });

    setActionError("");
    setFieldErrors({});
  }, [classList, feeHeads, setStructure, structure.selectedClassId]);

  const handleClassChange = (event) => {
    const nextClassId = event.target.value;
    setActionError("");
    setFieldErrors({});

    setStructure((prev) => {
      const nextClass = classList.find((item) => item?._id === nextClassId);
      if (!nextClass) return prev;

      const normalized = createClassConfig(
        nextClass,
        feeHeads,
        prev.classConfigs?.[nextClassId] || {},
      );

      return {
        ...prev,
        selectedClassId: nextClassId,
        classConfigs: {
          ...prev.classConfigs,
          [nextClassId]: normalized,
        },
      };
    });
  };

  const handleModeChange = (nextMode) => {
    if (!selectedClass) return;

    setActionError("");
    setFieldErrors({});

    updateActiveClassConfig((config) => {
      const nextRows = { ...config.rows };

      Object.entries(nextRows).forEach(([headId, row]) => {
        if (nextMode === "different") {
          const nextSectionAmounts = { ...row.sectionAmounts };

          Object.keys(nextSectionAmounts).forEach((sectionId) => {
            if (nextSectionAmounts[sectionId] === "" && row.commonAmount) {
              nextSectionAmounts[sectionId] = row.commonAmount;
            }
          });

          nextRows[headId] = {
            ...row,
            sectionAmounts: nextSectionAmounts,
          };
          return;
        }

        if (!row.commonAmount) {
          const commonAmount = deriveCommonAmount(row.sectionAmounts);
          if (commonAmount) {
            nextRows[headId] = {
              ...row,
              commonAmount,
            };
          }
        }
      });

      return {
        ...config,
        sectionFeeType: nextMode,
        rows: nextRows,
      };
    });
  };

  const handleAmountChange = (headId, key, rawValue) => {
    const nextValue = sanitizeAmountInput(rawValue);
    setActionError("");
    setFieldErrors({});

    updateActiveClassConfig((config) => {
      const currentRow = config.rows?.[headId];
      if (!currentRow) return config;

      const nextRows = { ...config.rows };

      if (config.sectionFeeType === "same") {
        nextRows[headId] = {
          ...currentRow,
          commonAmount: nextValue,
        };
      } else {
        nextRows[headId] = {
          ...currentRow,
          sectionAmounts: {
            ...currentRow.sectionAmounts,
            [key]: nextValue,
          },
        };
      }

      return {
        ...config,
        rows: nextRows,
      };
    });
  };

  const handleDuePatternChange = (headId, duePattern) => {
    // No longer needed, but keeping for compatibility if ever needed.
  };

  const validateActiveClass = () => {
    if (!activeConfig) {
      setActionError("Select a class with sections to continue.");
      return false;
    }

    const errors = {};
    let hasErrors = false;

    feeHeads.forEach((head) => {
      const row = activeConfig.rows?.[head.id];
      if (!row) return;

      if (activeConfig.sectionFeeType === "same") {
        const message = getAmountError(row.commonAmount);
        if (message) {
          errors[head.id] = { commonAmount: message, sectionAmounts: {} };
          hasErrors = true;
        }
        return;
      }

      activeConfig.sections.forEach((section) => {
        const message = getAmountError(row.sectionAmounts?.[section.id]);
        if (!message) return;

        errors[head.id] = errors[head.id] || { sectionAmounts: {} };
        errors[head.id].sectionAmounts[section.id] = message;
        hasErrors = true;
      });
    });

    setFieldErrors(errors);

    if (hasErrors) {
      setActionError("Please fix the highlighted amounts before continuing.");
      return false;
    }

    setActionError("");
    return true;
  };

  const handleProceed = () => {
    if (!selectedClass) {
      setActionError("Select a class before continuing.");
      return;
    }

    if (!validateActiveClass()) return;

    onNext();
  };

  const sameMode = activeConfig?.sectionFeeType !== "different";
  const hasClassData = Boolean(activeConfig?.sections?.length);
  const isDifferentFee = activeConfig?.sectionFeeType !== "same";

  return (
    <div className={"rounded-2xl border p-6 shadow-sm " + t.card}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className={"text-[18px] font-bold " + t.text}>
            Class Configuration
          </h2>
          <p className={"mt-1 text-sm " + t.subText}>
            Select how fee apply across sections.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <label className="block">
          <span className={"text-sm font-semibold " + t.subText}>Class</span>
          <select
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={loadingClasses || !classList.length}
            className={"mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 " + t.select}
          >
            <option value="">Select class</option>
            {classList.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {getClassName(classItem)} (
                {Array.isArray(classItem?.section)
                  ? classItem.section.length
                  : 0}{" "}
                sections)
              </option>
            ))}
          </select>
        </label>

        <div>
          <div className={"text-sm font-semibold " + t.subText}>
            Section Fee Type
          </div>
          <div className="mt-4">
            <div
              className={`inline-flex items-center gap-4 ${
                !selectedClass ? "opacity-50" : ""
              }`}
            >
              <button
                type="button"
                disabled={!selectedClass}
                onClick={() =>
                  handleModeChange(isDifferentFee ? "same" : "different")
                }
                className={`relative h-7 w-12 rounded-full transition-all duration-200 ${
                  isDifferentFee ? "bg-[#0a81d1]" : "bg-[#4cbc9a]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                    isDifferentFee ? "left-5" : "left-0.5"
                  }`}
                />
              </button>

              <div className={"text-sm font-semibold " + t.text}>
                {isDifferentFee ? "Different Fee Amount" : "Same Fee Amount"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loadingClasses && !fetchError && selectedClass && hasClassData ? (
        <div className={"mt-6 overflow-x-auto rounded-xl border " + t.tableInner}>
          <div
            className={"grid border-b " + t.tableHead}
            style={{ gridTemplateColumns }}
          >
            <div className={"px-4 py-4 text-sm font-semibold " + t.headText}>
              Fee Head
            </div>
            <div className={"px-4 py-4 text-center text-sm font-semibold " + t.headText}>
              Head Type
            </div>
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
                  Section {section.label}
                </div>
              ))
            )}
            <div className={"px-4 py-4 text-center text-sm font-semibold " + t.headText}>
              Due Pattern
            </div>
          </div>

          <div className={t.tableBody}>
            {feeHeads?.map((head) => {
              const row = activeConfig.rows?.[head.id] || {
                commonAmount: "",
                sectionAmounts: {},
                duePattern:
                  head.headType === "One-Time"
                    ? "One due item"
                    : "Monthly dues",
              };

              const commonError = fieldErrors?.[head.id]?.commonAmount || "";

              return (
                <div
                  key={head.id}
                  className={"grid border-b " + t.tableRow}
                  style={{ gridTemplateColumns }}
                >
                  <div className={"px-4 py-4 text-sm " + t.text}>
                    <div className="font-semibold">{head.name}</div>
                  </div>

                  <div className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-md font-semibold ${
                        head.headType === "Recurring"
                          ? "bg-[rgba(76,188,154,0.12)] text-[#4cbc9a]"
                          : "bg-[rgba(79,142,247,0.12)] text-[#4F8EF7]"
                      }`}
                    >
                      {head.headType}
                    </span>
                  </div>

                  {sameMode ? (
                    <div className="px-4 py-4">
                      <div className="flex flex-col items-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.commonAmount}
                          onChange={(event) =>
                            handleAmountChange(
                              head.id,
                              "commonAmount",
                              event.target.value,
                            )
                          }
                          className={"w-full max-w-[220px] rounded border px-3 py-2 text-right text-sm outline-none transition-colors " + t.input + (commonError ? " border-[#dc2626]" : "")}
                          placeholder="0"
                        />
                        {commonError ? (
                          <p className="mt-1 text-xs text-[#dc2626]">
                            {commonError}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    activeConfig.sections.map((section) => {
                      const sectionError =
                        fieldErrors?.[head.id]?.sectionAmounts?.[section.id] ||
                        "";

                      return (
                        <div key={section.id} className="px-4 py-4">
                          <div className="flex flex-col items-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={row.sectionAmounts?.[section.id] ?? ""}
                              onChange={(event) =>
                                handleAmountChange(
                                  head.id,
                                  section.id,
                                  event.target.value,
                                )
                              }
                              className={"w-full max-w-[160px] rounded border px-3 py-2 text-right text-sm outline-none transition-colors " + t.input + (sectionError ? " border-[#dc2626]" : "")}
                              placeholder="0"
                            />
                            {sectionError ? (
                              <p className="mt-1 text-xs text-[#dc2626]">
                                {sectionError}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div className="px-4 py-4 text-center">
                    <span className={"inline-block w-full text-center text-sm font-medium " + t.text}>
                      {head.headType === "One-Time" ||
                      head.headType === "ONE_TIME"
                          ? "One due item"
                          : (() => {
                            const freq =
                              classAndSectionData?.feeStructureData
                                ?.frequency || "Monthly";
                            const startM = getRecurringStartMonthLabel({
                              frequency:
                                classAndSectionData?.feeStructureData
                                  ?.frequency,
                              dueDate:
                                classAndSectionData?.feeStructureData
                                  ?.dueDate,
                              updatedAt:
                                classAndSectionData?.feeStructureData
                                  ?.updatedAt,
                              createdAt:
                                classAndSectionData?.feeStructureData
                                  ?.createdAt,
                              sessionStartDate:
                                classAndSectionData?.selectedSession
                                  ?.startDate,
                            });
                            const endM = classAndSectionData?.selectedSession
                              ?.endDate
                              ? new Date(
                                  classAndSectionData.selectedSession.endDate,
                                ).toLocaleString("default", { month: "short" })
                              : "Mar";
                            return `${freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase()} (${startM} - ${endM})`;
                          })()}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className={"grid " + t.totalRow} style={{ gridTemplateColumns }}>
              <div className={"px-4 py-4 text-sm font-semibold " + t.headText}>
                Section Total
              </div>
              <div className={"px-4 py-4 text-center text-sm " + t.subText}>
                One-Time + Recurring
              </div>
              {sameMode ? (
                <div className={"px-4 py-4 text-center text-sm font-semibold " + t.text}>
                  {activeConfig.sections.length
                    ? `${formatAmount(sectionTotals?.[activeConfig.sections[0]?.id] || 0)} each section`
                    : "-"}
                </div>
              ) : (
                activeConfig.sections.map((section) => (
                  <div
                    key={section.id}
                    className={"px-4 py-4 text-center text-sm font-semibold " + t.text}
                  >
                    {formatAmount(sectionTotals?.[section.id] || 0)}
                  </div>
                ))
              )}
              <div className={"px-4 py-4 text-center text-sm " + t.subText}>
                {`${classAndSectionData?.selectedSession?.academicStartYear} - ${classAndSectionData?.selectedSession?.academicEndYear}`}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={"mt-6 rounded-xl border p-4 " + t.infoBox}>
        <div className="flex items-center gap-3">
          <div className={"flex h-8 w-8 items-center justify-center rounded-full " + t.infoIcon}>
            i
          </div>

          <p className={"text-sm " + t.infoText}>
            Amounts entered above will be used to generate dues for the selected
            academic year.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        {actionError ? (
          <div className="text-sm font-semibold text-[#dc2626]">
            {actionError}
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={"rounded-lg border px-5 py-3 text-sm font-semibold transition " + t.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="rounded-lg bg-[#0a81d1] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#0970b8]"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
