import React, { useEffect, useMemo, useRef } from "react";
import svgPaths from "./svg.jsx";
import {
  deriveCommonAmount,
  getRecurringInstallmentCount,
} from "../FeeStructureSetup/utils.js";

/* ─────────────── tiny helpers ─────────────── */
function fmt(date) {
  if (!date) return "--";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function fmtMoney(v) {
  const n = Number(v);
  if (!v && v !== 0) return "--";
  return n.toLocaleString("en-IN");
}

function getSectionId(section, index) {
  return (
    section?._id ||
    section?.id ||
    section?.sectionId ||
    section?.section?._id ||
    section?.section?.id ||
    section?.section?.sectionId ||
    section?.name ||
    `section-${index}`
  );
}

function getSectionLabel(section, index) {
  return (
    section?.name ||
    section?.sectionName ||
    section?.section?.name ||
    section?.label ||
    `Section ${String.fromCharCode(65 + index)}`
  );
}

function getHeadId(head) {
  return (
    head?._id ||
    head?.id ||
    head?.feeHeadId ||
    head?.feeHeadDetails?._id ||
    head?.feeHeadDetails?.id ||
    ""
  );
}

function getHeadName(head) {
  return (
    head?.name ||
    head?.headName ||
    head?.label ||
    head?.feeHeadDetails?.name ||
    head?.feeHeadDetails?.headName ||
    "-"
  );
}

function getHeadType(head) {
  return String(
    head?.type || head?.headType || head?.feeHeadDetails?.type || "",
  ).toUpperCase();
}

function findSectionRecord(data, sectionId) {
  const applicableSections = Array.isArray(data?.applicableSections)
    ? data.applicableSections
    : [];

  return applicableSections.find((item, index) => {
    const section =
      item?.section || item?.sectionData || item?.sectionInfo || item;
    return getSectionId(section, index) === sectionId;
  });
}

function getSectionHeadAmount(data, sectionId, headId) {
  const sectionRecord = findSectionRecord(data, sectionId);
  const feeHeads = Array.isArray(sectionRecord?.feeHeads)
    ? sectionRecord.feeHeads
    : [];

  const matchedHead = feeHeads.find(
    (item) => (item?.feeHeadId || item?.id || item?._id) === headId,
  );

  return matchedHead?.amount ?? matchedHead?.feeAmount ?? "";
}

/* ─────────────── icons ─────────────── */
function CloseIcon() {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChalkboardIcon() {
  return (
    <svg className="size-[22px]" fill="none" viewBox="0 0 24 24">
      <g clipPath="url(#ci_clip)">
        <path d={svgPaths.p42cbd00} fill="#0A81D1" stroke="#0A81D1" />
        <path d={svgPaths.pf245980} fill="#0A81D1" />
        <path d={svgPaths.p3ae868f0} stroke="#0A81D1" strokeWidth="0.8" />
        <path d={svgPaths.p2d138680} fill="#0A81D1" />
        <path
          d={svgPaths.p1daca700}
          fill="#0A81D1"
          stroke="#0A81D1"
          strokeWidth="0.5"
        />
      </g>
      <defs>
        <clipPath id="ci_clip">
          <rect fill="white" height="24" width="24" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ─────────────── skeleton row ─────────────── */
function SkeletonRow({ isDarkMode, columns = 4 }) {
  const base = isDarkMode ? "bg-[#2a2d3a]" : "bg-[#e7e2e2]";
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-3">
          <div className={`h-4 rounded ${base} animate-pulse`} />
        </td>
      ))}
    </tr>
  );
}

/* ─────────────── badge components ─────────────── */
function HeadTypeBadge({ type }) {
  const raw = String(type || "").toUpperCase();
  const isRecurring = raw === "RECURRING" || type === "Recurring";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[6px] px-3 py-1 text-[12px] font-medium ${
        isRecurring
          ? "bg-[rgba(40,169,135,0.12)] text-[#28a987]"
          : "bg-[rgba(10,129,209,0.12)] text-[#0a81d1]"
      }`}
    >
      {isRecurring ? "Recurring" : "One-Time"}
    </span>
  );
}

function SectionBadge({ label }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full size-[26px] bg-[rgba(10,129,209,0.12)] text-[#0a81d1] text-[12px] font-semibold shrink-0">
      {label}
    </span>
  );
}

// const data = {
//   _id: "6a3a6a9e08497d0e3b0d0428",
//   adminId: "6995f2ad16a5931a07a93e53",
//   feeCycleId: "6a3198cf998acd717a601a8a",
//   sessionId: "6a270981f4efe22fbad2e89c",
//   classId: "6a2854d9f4efe22fbad2e940",
//   amountForAllSections: false,
//   isVerified: true,
//   applicableSections: [
//     {
//       section: {
//         sectionId: "6a285528f4efe22fbad2e951",
//         name: "A",
//       },
//       feeHeads: [
//         {
//           feeHeadId: "6a319999998acd717a601a92",
//           amount: 1000,
//           feeHeadDetails: {
//             name: "adminssion fee",
//             label: "Admission_FEE",
//             type: "RECURRING",
//             refundable: true,
//             _id: "6a319999998acd717a601a92",
//           },
//         },
//         {
//           feeHeadId: "6a3a4da308497d0e3b0d0406",
//           amount: 3000,
//           feeHeadDetails: {
//             name: "computer fee",
//             label: "COMPUTER_FEE",
//             type: "ONE_TIME",
//             refundable: true,
//             _id: "6a3a4da308497d0e3b0d0406",
//           },
//         },
//       ],
//     },
//     {
//       section: {
//         sectionId: "6a285536f4efe22fbad2e965",
//         name: "B",
//       },
//       feeHeads: [
//         {
//           feeHeadId: "6a319999998acd717a601a92",
//           amount: 1200,
//           feeHeadDetails: {
//             name: "adminssion fee",
//             label: "Admission_FEE",
//             type: "RECURRING",
//             refundable: true,
//             _id: "6a319999998acd717a601a92",
//           },
//         },
//         {
//           feeHeadId: "6a3a4da308497d0e3b0d0406",
//           amount: 3000,
//           feeHeadDetails: {
//             name: "computer fee",
//             label: "COMPUTER_FEE",
//             type: "ONE_TIME",
//             refundable: true,
//             _id: "6a3a4da308497d0e3b0d0406",
//           },
//         },
//       ],
//     },
//   ],
//   status: "ACTIVE",
//   createdAt: "2026-06-23T11:14:38.725Z",
//   updatedAt: "2026-07-06T10:35:22.487Z",
//   classDetails: {
//     _id: "6a2854d9f4efe22fbad2e940",
//     name: "1st",
//   },
// };
/* ─────────────── main component ─────────────── */
export default function FeeInfo({
  open = false,
  onClose,
  data,
  feeHeads = [],
  classAndSectionData,
  loading = false,
  error = "",
  isDarkMode = false,
}) {
  const drawerRef = useRef(null);

  /* prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* theme */
  const t = {
    overlay: "bg-black/50",
    drawer: isDarkMode ? "bg-[#181b24] text-white" : "bg-white text-[#0f0f0f]",
    border: isDarkMode ? "border-[#2a2d36]" : "border-[#e7e2e2]",
    surface: isDarkMode ? "bg-[#1f2430]" : "bg-[#f5f7fa]",
    tableHead: isDarkMode
      ? "bg-[#1a2233] text-white"
      : "bg-[#e5f0f5] text-[#002861]",
    subText: isDarkMode ? "text-[#9ca3af]" : "text-[#686868]",
    rowHover: isDarkMode ? "hover:bg-[#1f2430]" : "hover:bg-[#fafcff]",
    tfoot: isDarkMode ? "bg-[#1a2233]" : "bg-[#e5f0f5]",
  };

  const sectionFeeType =
    data?.sectionFeeType || (data?.amountForAllSections ? "same" : "different");
  const isSameAmount = sectionFeeType === "same";

  const normalizedFeeHeads = useMemo(() => {
    const fromProp = Array.isArray(feeHeads)
      ? feeHeads
      : Array.isArray(feeHeads?.feeHeads)
        ? feeHeads.feeHeads
        : [];

    const fromData = Array.isArray(data?.applicableSections)
      ? data.applicableSections.flatMap((item) =>
          Array.isArray(item?.feeHeads) ? item.feeHeads : [],
        )
      : [];

    const seen = new Set();
    return [...fromData, ...fromProp].filter((head) => {
      const id = head?._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [data, feeHeads]);

  const sections = useMemo(() => {
    const source =
      Array.isArray(data?.sections) && data.sections.length
        ? data.sections
        : Array.isArray(data?.applicableSections)
          ? data.applicableSections
              .map(
                (item) =>
                  item?.section ||
                  item?.sectionData ||
                  item?.sectionInfo ||
                  item,
              )
              .filter(Boolean)
          : [];

    return source
      .map((section, index) => ({
        id: getSectionId(section, index),
        name: getSectionLabel(section, index),
      }))
      .filter((section) => section.id);
  }, [data]);

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

  const feeRows = useMemo(() => {
    if (!Array.isArray(normalizedFeeHeads) || !normalizedFeeHeads.length)
      return [];

    const rawRows =
      data?.rows && typeof data.rows === "object" ? data.rows : {};

    return normalizedFeeHeads.map((head) => {
      const headId = getHeadId(head);
      const existingRow = rawRows?.[headId] || {};
      const headType = getHeadType(head) || getHeadType(existingRow);
      const isRecurring = headType === "RECURRING";

      const sectionAmounts = sections.reduce((acc, section) => {
        const storedAmount = existingRow?.sectionAmounts?.[section.id];
        const sectionAmount =
          storedAmount !== undefined &&
          storedAmount !== null &&
          storedAmount !== ""
            ? storedAmount
            : getSectionHeadAmount(data, section.id, headId);

        acc[section.id] = sectionAmount;
        return acc;
      }, {});

      const commonAmount =
        existingRow?.commonAmount ??
        deriveCommonAmount(sectionAmounts) ??
        Object.values(sectionAmounts).find(
          (item) => item !== "" && item !== null && item !== undefined,
        ) ??
        "";

      return {
        headId,
        name: getHeadName(head),
        type: headType || (isRecurring ? "RECURRING" : "ONE_TIME"),
        isRecurring,
        amount: isSameAmount ? commonAmount : null,
        sectionAmounts,
        duePattern:
          typeof existingRow?.duePattern === "string"
            ? existingRow.duePattern
            : isRecurring
              ? `${classAndSectionData?.feeStructureData?.frequency ?? ""} dues"`
              : "One due item",
      };
    });
  }, [data, isSameAmount, normalizedFeeHeads, sections]);

  // console.log(feeRows);
  const sectionTotals = useMemo(() => {
    if (!sections.length) return {};

    return sections.reduce((totals, section) => {
      totals[section.id] = feeRows.reduce((sum, row) => {
        const rawAmount = isSameAmount
          ? Number(row.amount || 0)
          : Number(row.sectionAmounts?.[section.id] || 0);
        const multiplier = row.isRecurring ? recurringInstallmentCount || 1 : 1;

        return sum + rawAmount * multiplier;
      }, 0);

      return totals;
    }, {});
  }, [feeRows, isSameAmount, recurringInstallmentCount, sections]);

  const primarySectionTotal = sections.length
    ? Number(sectionTotals?.[sections[0]?.id] || 0)
    : feeRows.reduce((sum, row) => {
        const rawAmount = Number(row.amount || 0);
        const multiplier = row.isRecurring ? recurringInstallmentCount || 1 : 1;
        return sum + rawAmount * multiplier;
      }, 0);

  const hasSectionColumns = !isSameAmount && sections.length > 0;
  const recurringSummary =
    feeRows.some((r) => r.type === "RECURRING") &&
    feeRows.some((r) => r.type !== "RECURRING")
      ? "Recurring + One-Time"
      : feeRows.some((r) => r.type === "RECURRING")
        ? "Recurring"
        : "One-Time";

  const metaItems = [
    {
      label: "Academic Year",
      value: `${classAndSectionData?.selectedSession?.academicStartYear} - ${classAndSectionData?.selectedSession?.academicEndYear}`,
    },
    {
      label: "Fee Cycle",
      value: classAndSectionData?.feeStructureData?.frequency ?? "-",
    },
    {
      label: "Section Fee Type",
      value: isSameAmount ? "Same Amount" : "Different Amount",
    },
    { label: "Created On", value: fmt(data?.createdAt) },
  ];

  if (!open) return null;

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 z-[60] ${t.overlay} backdrop-blur-[2px] transition-opacity duration-300`}
        onClick={onClose}
        aria-hidden
      />

      {/* drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-[80px] bottom-6 right-1/4 z-[70] flex min-h-0 w-full max-w-[800px] flex-col overflow-y-auto overscroll-contain shadow-2xl transition-transform duration-300 ${t.drawer}`}
        aria-label="Fee Structure Detail"
        role="dialog"
        aria-modal="true"
      >
        {/* ── header ── */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 shrink-0 ${t.border}`}
        >
          <div>
            <h2 className="text-[18px] font-bold leading-[1.2]">
              Fee Structure
            </h2>
            <p className={`mt-0.5 text-[13px] ${t.subText}`}>
              Detailed view of the class fee structure
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
              isDarkMode ? "hover:bg-[#2a2d36]" : "hover:bg-gray-100"
            }`}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── scrollable body ── */}
        <div className="min-h-0 flex-1 overflow-visible p-6 flex flex-col gap-5">
          {/* error */}
          {error ? (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {/* ── info card ── */}
          <div
            className={`rounded-[14px] border p-5 flex flex-col gap-5 ${t.border} ${isDarkMode ? "bg-[#1f2430]" : "bg-white"}`}
          >
            {/* class row */}
            <div className="flex gap-3 items-start">
              <div className="flex items-center justify-center rounded-full size-[44px] bg-[rgba(10,129,209,0.12)] shrink-0">
                <ChalkboardIcon />
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {loading ? (
                  <div
                    className={`h-5 w-32 rounded animate-pulse ${isDarkMode ? "bg-[#2a2d3a]" : "bg-[#e7e2e2]"}`}
                  />
                ) : (
                  <span className="font-semibold text-[16px] leading-[1.2]">
                    {data?.classDetails?.name || ""}
                  </span>
                )}

                {/* meta columns */}
                <div className="flex flex-wrap gap-4 sm:gap-0 sm:divide-x sm:divide-[#C4C4C4]">
                  {metaItems?.map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col gap-1 sm:pr-5 sm:first:pl-0 sm:pl-5"
                    >
                      <span
                        className={`text-[12px] font-semibold whitespace-nowrap ${t.subText}`}
                      >
                        {label}
                      </span>
                      {loading ? (
                        <div
                          className={`h-4 w-20 rounded animate-pulse ${isDarkMode ? "bg-[#2a2d3a]" : "bg-[#e7e2e2]"}`}
                        />
                      ) : (
                        <span className="text-[13px] font-medium whitespace-nowrap">
                          {value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* sections */}
            {sections.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className={`text-[13px] font-semibold ${t.subText}`}>
                  Sections
                </span>
                <div className="flex flex-wrap gap-2">
                  {sections.map((s, i) => (
                    <SectionBadge
                      key={s.id || i}
                      label={s.name || String.fromCharCode(65 + i)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── fee table ── */}
          <div
            className={`rounded-[14px] border overflow-y-auto ${t.border} ${isDarkMode ? "bg-[#1f2430]" : "bg-white"}`}
          >
            <div className="px-5 pt-4 pb-2">
              <span className="text-[14px] font-semibold">Fee Structure</span>
            </div>

            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                // style={{
                //   minWidth: hasSectionColumns
                //     ? Math.max(860, 460 + sections.length * 160)
                //     : 760,
                // }}
              >
                <thead>
                  <tr className={t.tableHead}>
                    <th
                      className={`py-3 px-2 text-left text-[13px] font-semibold border-b ${t.border} whitespace-nowrap`}
                    >
                      Fee Head
                    </th>
                    <th
                      className={`py-3 px-2 text-center text-[13px] font-semibold border-b ${t.border} whitespace-nowrap`}
                    >
                      Head Type
                    </th>
                    {hasSectionColumns ? (
                      sections.map((section) => (
                        <th
                          key={section.id}
                          className={`py-3 px-2 text-center text-[13px] font-semibold border-b ${t.border} whitespace-nowrap`}
                        >
                          Section {section.name}
                        </th>
                      ))
                    ) : (
                      <th
                        className={`py-3 px-2 text-center text-[13px] font-semibold border-b ${t.border} whitespace-nowrap`}
                      >
                        Amount (₹)
                      </th>
                    )}
                    <th
                      className={`py-3 px-2 text-center text-[13px] font-semibold border-b ${t.border} whitespace-nowrap`}
                    >
                      Due Pattern
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <SkeletonRow
                        key={i}
                        isDarkMode={isDarkMode}
                        columns={hasSectionColumns ? sections.length + 3 : 4}
                      />
                    ))
                  ) : feeRows?.length ? (
                    feeRows?.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b ${t.border} transition-colors ${t.rowHover}`}
                      >
                        <td className="py-3 px-2 text-[13px] font-normal">
                          {row.name}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex justify-center">
                            <HeadTypeBadge type={row.type} />
                          </div>
                        </td>
                        {hasSectionColumns ? (
                          sections?.map((section) => (
                            <td
                              key={section.id}
                              className="py-3 px-2 text-center text-[13px] font-medium"
                            >
                              {fmtMoney(row.sectionAmounts?.[section.id])}
                            </td>
                          ))
                        ) : (
                          <td className="py-3 px-2 text-center text-[13px] font-medium">
                            {fmtMoney(row.amount)}
                          </td>
                        )}
                        <td className="py-3 px-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[13px] font-normal whitespace-nowrap">
                              {row.duePattern}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={hasSectionColumns ? sections.length + 3 : 4}
                        className={`py-8 text-center text-sm ${t.subText}`}
                      >
                        No fee heads available.
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* grand total */}
                {!loading && feeRows?.length > 0 && (
                  <tfoot>
                    <tr className={t.tfoot}>
                      <td className="py-4 px-4 text-[14px] font-semibold whitespace-nowrap">
                        {hasSectionColumns ? "Section Totals" : "Section Total"}
                      </td>
                      <td
                        className={`py-4 px-4 text-center text-[13px] font-medium ${t.subText}`}
                      >
                        {recurringSummary}
                      </td>
                      {hasSectionColumns ? (
                        sections.map((section) => (
                          <td
                            key={section.id}
                            className="py-4 px-4 text-center text-[14px] font-semibold"
                          >
                            ₹{" "}
                            {Number(
                              sectionTotals?.[section.id] || 0,
                            ).toLocaleString("en-IN")}
                          </td>
                        ))
                      ) : (
                        <td className="py-4 px-4 text-center text-[14px] font-semibold">
                          ₹{" "}
                          {Number(primarySectionTotal || 0).toLocaleString(
                            "en-IN",
                          )}
                          {sections.length ? " each section" : ""}
                        </td>
                      )}
                      <td
                        className={`py-4 px-4 text-center text-[13px] font-medium ${t.subText}`}
                      >
                        {hasSectionColumns
                          ? "Section-wise totals"
                          : "Each section receives the same total"}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* ── footer ── */}
        <div
          className={`flex justify-end gap-3 border-t px-6 py-4 shrink-0 ${t.border}`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`h-10 rounded-[8px] px-5 text-[13px] font-semibold transition-colors ${
              isDarkMode
                ? "bg-[#2a2d36] text-white hover:bg-[#373d4d]"
                : "bg-[#f0f2f5] text-[#0f0f0f] hover:bg-[#e4e6ea]"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
