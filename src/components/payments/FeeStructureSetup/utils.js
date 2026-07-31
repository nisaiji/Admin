import moment from "moment";

export function sanitizeAmountInput(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").replace(/[^\d.]/g, "");

  if (!cleaned) return "";

  if (cleaned.startsWith(".")) {
    return `0.${cleaned.slice(1, 3)}`;
  }

  const [whole = "", ...rest] = cleaned.split(".");
  if (!rest.length) return whole;

  return `${whole}.${rest.join("").slice(0, 2)}`;
}

export function isValidAmount(value) {
  return /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value ?? ""));
}

export function getSectionId(section, index) {
  return (
    section?._id || section?.id || section?.sectionId || section?.name || `section-${index}`
  );
}

export function getSectionLabel(section, index) {
  return section?.name || section?.sectionName || section?.label || `Section ${String.fromCharCode(65 + index)}`;
}

export function defaultDuePattern(headType) {
  return headType === "One-Time" ? "One due item" : "Monthly dues";
}

const FREQUENCY_MONTHS = {
  MONTHLY: 1,
  BY_MONTHLY: 2,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12,
};

export function getRecurringInstallmentCount({
  frequency,
  dueDate,
  updatedAt,
  createdAt,
  sessionStartDate,
  sessionEndDate,
}) {
  const monthsPerPeriod = FREQUENCY_MONTHS[String(frequency || "").toUpperCase()];
  const dueDay = Number(dueDate);

  if (!monthsPerPeriod || !Number.isFinite(dueDay) || dueDay < 1) {
    return 0;
  }

  const sessionStart = sessionStartDate ? moment(sessionStartDate).startOf("day") : null;
  const cycleUpdatedAt = updatedAt
    ? moment(updatedAt).startOf("day")
    : createdAt
      ? moment(createdAt).startOf("day")
      : null;

  const startFrom = sessionStart && cycleUpdatedAt
    ? moment.max(sessionStart, cycleUpdatedAt)
    : sessionStart || cycleUpdatedAt;

  if (!startFrom || !startFrom.isValid()) return 0;

  const anchor = startFrom.clone().startOf("month");
  const sessionEnd = sessionEndDate && moment(sessionEndDate).isValid()
    ? moment(sessionEndDate).endOf("month")
    : anchor.clone().add(11, "months").endOf("month");

  if (anchor.isAfter(sessionEnd)) return 0;

  let count = 0;

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
      count += 1;
    }
  }

  return count;
}

export function deriveCommonAmount(sectionAmounts = {}) {
  const values = Object.values(sectionAmounts).filter((item) => item !== "" && item !== null && item !== undefined);

  if (!values.length) return "";

  return values.every((item) => item === values[0]) ? values[0] : "";
}

export function formatFeeHeadsSummary(feeHeads = []) {
  const labels = feeHeads
    .map((head) => String(head?.name || head?.label || "").trim())
    .filter(Boolean);

  return labels.length ? labels.join(" / ") : "--";
}

export function formatSectionFeesSummary(sectionTotals = {}, sections = []) {
  const values = (sections.length ? sections : Object.keys(sectionTotals).map((id) => ({ id })))
    .map((section) => sectionTotals?.[section.id])
    .filter((amount) => amount !== null && amount !== undefined && amount !== "");

  if (!values.length) return "--";

  return values
    .map((amount) => `₹ ${Number(amount || 0).toLocaleString("en-IN")}`)
    .join(" / ");
}

export function createClassConfig(classItem, feeHeads, existingConfig = {}) {
  const sections = Array.isArray(classItem?.section)
    ? classItem.section.map((section, index) => ({
        id: getSectionId(section, index),
        label: getSectionLabel(section, index),
      }))
    : [];

  const rows = {};

  feeHeads.forEach((head) => {
    const existingRow = existingConfig.rows?.[head.id] || {};
    const sectionAmounts = {};

    sections.forEach((section) => {
      sectionAmounts[section.id] = existingRow.sectionAmounts?.[section.id] ?? "";
    });

    rows[head.id] = {
      commonAmount:
        existingRow.commonAmount ?? deriveCommonAmount(existingRow.sectionAmounts) ?? "",
      sectionAmounts,
      duePattern: existingRow.duePattern || defaultDuePattern(head.headType),
    };
  });

  return {
    classId: classItem?._id || "",
    className: classItem?.name || "",
    sections,
    sectionFeeType: existingConfig.sectionFeeType === "different" ? "different" : "same",
    rows,
  };
}

export function getTableGridTemplate(sectionCount, sectionFeeType) {
  if (sectionFeeType === "same") {
    return "minmax(220px, 2fr) minmax(150px, 1fr) minmax(260px, 1.4fr) minmax(180px, 1fr)";
  }

  return `minmax(220px, 2fr) minmax(150px, 1fr) repeat(${sectionCount}, minmax(140px, 1fr)) minmax(180px, 1fr)`;
}
