import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { C, C_LIGHT } from "../../utils/constants";
import {
  Search,
  Filter,
  IndianRupee,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import payable from "../../assets/images/payments/payable.png";
import collected from "../../assets/images/payments/collected.png";
import outstanding from "../../assets/images/payments/outstanding.png";
import filter from "../../assets/images/payments/filter.png";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { Toaster } from "react-hot-toast";

const PAGE_LIMIT_OPTIONS = [10, 20, 25, 50, 100];

const SAMPLE_COLLECTIONS = [
  {
    id: 1,
    name: "Ravi Kumar",
    className: "Class 10 A",
    admNo: "ADM-2024-001",
    totalFee: 45000,
    paid: 45000,
    due: 0,
    status: "Paid",
    lastPayment: "12 May 2026",
  },
  {
    id: 2,
    name: "Anita Sharma",
    className: "Class 9 B",
    admNo: "ADM-2024-002",
    totalFee: 42000,
    paid: 35000,
    due: 7000,
    status: "Partial",
    lastPayment: "08 May 2026",
  },
  {
    id: 3,
    name: "Karan Singh",
    className: "Class 8 C",
    admNo: "ADM-2024-003",
    totalFee: 40000,
    paid: 0,
    due: 40000,
    status: "Unpaid",
    lastPayment: "-",
  },
  {
    id: 4,
    name: "Meera Reddy",
    className: "Class 10 B",
    admNo: "ADM-2024-004",
    totalFee: 45000,
    paid: 45000,
    due: 0,
    status: "Paid",
    lastPayment: "15 May 2026",
  },
  {
    id: 5,
    name: "Sunita Verma",
    className: "Class 7 A",
    admNo: "ADM-2024-005",
    totalFee: 38000,
    paid: 20000,
    due: 18000,
    status: "Partial",
    lastPayment: "01 May 2026",
  },
  {
    id: 6,
    name: "Mohd. Irfan",
    className: "Class 9 A",
    admNo: "ADM-2024-006",
    totalFee: 42000,
    paid: 42000,
    due: 0,
    status: "Paid",
    lastPayment: "10 May 2026",
  },
  {
    id: 7,
    name: "Pooja Menon",
    className: "Class 6 B",
    admNo: "ADM-2024-007",
    totalFee: 36000,
    paid: 12000,
    due: 24000,
    status: "Partial",
    lastPayment: "25 Apr 2026",
  },
  {
    id: 8,
    name: "Vikram Shetty",
    className: "Class 8 A",
    admNo: "ADM-2024-008",
    totalFee: 40000,
    paid: 0,
    due: 40000,
    status: "Unpaid",
    lastPayment: "-",
  },
];

function StatusBadge({ status, themeC }) {
  const config = {
    Paid: { bg: "rgba(22,163,74,0.1)", color: themeC.green, label: "Paid" },
    Partial: { bg: themeC.amberDim, color: themeC.amber, label: "Partial" },
    Unpaid: { bg: themeC.redDim, color: themeC.red, label: "Unpaid" },
  };
  const c = config[status] || config.Unpaid;
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 999,
        background: c.bg,
        color: c.color,
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {c.label}
    </span>
  );
}

function getClassFilterLabel(className) {
  const parts = String(className || "").split(" ");
  if (parts.length < 3) return String(className || "");
  return parts.slice(0, -1).join(" ");
}

function getSectionFilterLabel(className) {
  const parts = String(className || "").split(" ");
  if (parts.length < 3) return "";
  return parts[parts.length - 1];
}

function buildVisiblePages(pageNo, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, pageNo - 1, pageNo, pageNo + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);
}

function StatCard({ icon, label, value, color, themeC, isDarkMode }) {
  return (
    <div
      style={{
        flex: 1,
        background: themeC.card,
        border: `1px solid ${themeC.border}`,
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <img src={icon} className="size-12 object-contain" />
      <div>
        <div
          style={{ fontSize: "13px", color: themeC.textSub, marginBottom: 2 }}
        >
          {label}
        </div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: themeC.text }}>
          {`₹${value}`}
        </div>
      </div>
    </div>
  );
}

export default function CollectionScreen() {
  const isDarkMode = useSelector(
    (state) => state.appConfig?.isDarkMode ?? false,
  );
  const themeC = isDarkMode ? C : C_LIGHT;
  const [search, setSearch] = useState("");
  const [feeSummaryData, setFeeSummaryData] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);

  const classOptions = useMemo(
    () =>
      [
        ...new Set(
          SAMPLE_COLLECTIONS.map((item) => getClassFilterLabel(item.className)),
        ),
      ].filter(Boolean),
    [],
  );

  const sectionOptions = useMemo(
    () =>
      [
        ...new Set(
          SAMPLE_COLLECTIONS.map((item) =>
            getSectionFilterLabel(item.className),
          ),
        ),
      ].filter(Boolean),
    [],
  );

  const filtered = useMemo(() => {
    return SAMPLE_COLLECTIONS.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.admNo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      const matchClass =
        classFilter === "All" ||
        getClassFilterLabel(s.className) === classFilter;
      const matchSection =
        sectionFilter === "All" ||
        getSectionFilterLabel(s.className) === sectionFilter;
      return matchSearch && matchStatus && matchClass && matchSection;
    });
  }, [search, statusFilter, classFilter, sectionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  const visiblePages = useMemo(
    () => buildVisiblePages(pageNo, totalPages),
    [pageNo, totalPages],
  );

  const paginated = useMemo(() => {
    const start = (pageNo - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, pageNo, limit]);

  React.useEffect(() => {
    setPageNo(1);
  }, [search, statusFilter, classFilter, sectionFilter]);

  React.useEffect(() => {
    if (pageNo > totalPages) {
      setPageNo(totalPages);
    }
  }, [pageNo, totalPages]);

  const totalCollected = SAMPLE_COLLECTIONS.reduce((s, r) => s + r.paid, 0);
  const totalDue = SAMPLE_COLLECTIONS.reduce((s, r) => s + r.due, 0);
  const paidCount = SAMPLE_COLLECTIONS.filter(
    (r) => r.status === "Paid",
  ).length;
  const partialCount = SAMPLE_COLLECTIONS.filter(
    (r) => r.status === "Partial",
  ).length;

  const getFeeSummary = async () => {
    try {
      const res = await axiosClient.get(EndPoints.GET_FEE_SUMMARY);
      if (res?.statusCode === 200) {
        setFeeSummaryData(res?.data?.result?.data);
      }
    } catch (e) {
      toast.error(e);
    }
  };
  useEffect(() => {
    getFeeSummary();
  }, []);

  const TH = {
    padding: "12px 18px",
    fontSize: "11px",
    fontWeight: 700,
    color: themeC.textSub,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    textAlign: "left",
    borderBottom: `1px solid ${themeC.border}`,
    background: isDarkMode ? "#0d1017" : "#f1f5f9",
    whiteSpace: "nowrap",
  };
  const controlClass = isDarkMode
    ? "bg-background2 border border-borderColor text-textPrimary focus:border-primaryBlue"
    : "bg-white border border-slate-200 text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const optionStyle = {
    backgroundColor: isDarkMode ? "#111827" : "#ffffff",
    color: isDarkMode ? "#f8fafc" : "#1e293b",
  };

  return (
    <div
      style={{
        padding: "28px 28px 60px",
        minHeight: "100%",
        background: themeC.bg,
      }}
    >
      <Toaster />
      <div style={{ maxWidth: 1384, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: themeC.text,
              margin: "0 0 4px",
            }}
          >
            Collection
          </h1>
          <p style={{ fontSize: "13px", color: themeC.textSub, margin: 0 }}>
            Review student collection activity and drill into a student profile
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <StatCard
            icon={payable}
            label="Total Payable"
            value={feeSummaryData?.feeCollectionTrend ?? 0}
            themeC={themeC}
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={collected}
            label="Collected Amount"
            value={feeSummaryData?.totalCollectedFees ?? 0}
            themeC={themeC}
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={outstanding}
            label="Outstanding Dues"
            value={feeSummaryData?.outstandingFees ?? 0}
            themeC={themeC}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Table card */}
        <div
          style={{
            background: themeC.card,
            border: `1px solid ${themeC.border}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            className={`font-poppins-bold text-sm px-5 pt-5`}
            style={{
              color: themeC.text,
            }}
          >
            Students (25)
          </div>
          {/* Toolbar */}
          <div
            style={{
              padding: "16px",
              borderBottom: `1px solid ${themeC.border}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: isDarkMode ? "rgba(255,255,255,0.04)" : "#f1f5f9",
                border: `1px solid ${themeC.border}`,
                borderRadius: "9px",
                padding: "8px 14px",
                flex: "0 0 280px",
              }}
            >
              <Search size={14} color={themeC.textSub} />
              <input
                type="text"
                placeholder="Search by name or admission no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: themeC.text,
                  fontSize: "13px",
                  width: "100%",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: 180,
              }}
            >
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={`h-12 w-full rounded-lg px-4 text-sm font-poppins-regular outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${controlClass}`}
              >
                <option value="All">All Classes</option>
                {classOptions.map((item) => (
                  <option key={item} value={item} style={optionStyle}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: 170,
              }}
            >
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className={`h-12 w-full rounded-lg px-4 text-sm font-poppins-regular outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${controlClass}`}
              >
                <option value="All">All Sections</option>
                {sectionOptions.map((item) => (
                  <option key={item} value={item} style={optionStyle}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }} />
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-poppins-bold cursor-pointer border`}
              style={{
                color: themeC.blue,
                borderColor: themeC.blue,
              }}
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setClassFilter("All");
                setSectionFilter("All");
                setPageNo(1);
              }}
              type="button"
            >
              <img src={filter} className="size-4 object-contain" />
              Clear Filter
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...TH, width: 48, textAlign: "center" }}>#</th>
                  <th style={TH}>Student</th>
                  <th style={TH}>Class</th>
                  <th style={{ ...TH, textAlign: "right" }}>Total Fee</th>
                  <th style={{ ...TH, textAlign: "right" }}>Paid</th>
                  <th style={{ ...TH, textAlign: "right" }}>Due</th>
                  <th style={{ ...TH, textAlign: "center" }}>Status</th>
                  <th style={TH}>Last Payment</th>
                  <th style={{ ...TH, textAlign: "center", width: 80 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 56,
                        textAlign: "center",
                        color: themeC.textSub,
                        fontSize: "14px",
                      }}
                    >
                      No records match your filters
                    </td>
                  </tr>
                ) : (
                  paginated?.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        background: isDarkMode ? "#12151f" : "#fff",
                        borderBottom: `1px solid ${themeC.borderSoft}`,
                        transition: "background 0.14s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDarkMode
                          ? "#1a1e2c"
                          : "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isDarkMode
                          ? "#12151f"
                          : "#fff")
                      }
                    >
                      <td
                        style={{
                          padding: "13px 18px",
                          textAlign: "center",
                          fontSize: "12px",
                          color: themeC.textSub,
                          fontWeight: 600,
                        }}
                      >
                        {(pageNo - 1) * limit + i + 1}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: themeC.text,
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{ fontSize: "11px", color: themeC.textSub }}
                        >
                          {r.admNo}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: themeC.sub,
                        }}
                      >
                        {r.className}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: themeC.text,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        ₹{r.totalFee.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: themeC.green,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        ₹{r.paid.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: r.due > 0 ? themeC.red : themeC.textSub,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        ₹{r.due.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "13px 18px", textAlign: "center" }}>
                        <StatusBadge status={r.status} themeC={themeC} />
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: themeC.sub,
                        }}
                      >
                        {r.lastPayment}
                      </td>
                      <td style={{ padding: "13px 18px", textAlign: "center" }}>
                        <button
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: "7px",
                            background: themeC.blueDim,
                            border: "none",
                            color: themeC.blue,
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: `1px solid ${themeC.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <label
              className="flex items-center gap-2 text-sm"
              style={{ color: themeC.textSub }}
            >
              Rows
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPageNo(1);
                }}
                className={`h-9 rounded-lg border px-3 text-sm outline-none ${controlClass}`}
              >
                {PAGE_LIMIT_OPTIONS.map((item) => (
                  <option key={item} value={item} style={optionStyle}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() =>
                  setPageNo((currentPage) => Math.max(1, currentPage - 1))
                }
                disabled={pageNo === 1}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: `1px solid ${themeC.blue}`,
                  background: themeC.card,
                  color: themeC.blue,
                  cursor: pageNo === 1 ? "not-allowed" : "pointer",
                  opacity: pageNo === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={14} />
              </button>

              {visiblePages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setPageNo(page)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    border: `1px solid ${themeC.blue}`,
                    background: page === pageNo ? themeC.blue : themeC.card,
                    color: page === pageNo ? "#ffffff" : themeC.blue,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPageNo((currentPage) =>
                    Math.min(totalPages, currentPage + 1),
                  )
                }
                disabled={pageNo === totalPages}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: `1px solid ${themeC.blue}`,
                  background: themeC.card,
                  color: themeC.blue,
                  cursor: pageNo === totalPages ? "not-allowed" : "pointer",
                  opacity: pageNo === totalPages ? 0.4 : 1,
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
