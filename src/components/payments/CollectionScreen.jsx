import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import CONSTANT, { C, C_LIGHT } from "../../utils/constants";
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
import moment from "moment/moment";
import StudentPaymentInfo from "./dashboard/StudentPaymentInfo";
import { showToast } from "../../services/toastService";

const PAGE_LIMIT_OPTIONS = [10, 20, 25, 50, 100];

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
      <img src={icon} className="size-12 object-contain" alt={label} />
      <div>
        <div
          style={{ fontSize: "13px", color: themeC.textSub, marginBottom: 2 }}
        >
          {label}
        </div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: themeC.text }}>
          {`₹${Number(value || 0).toLocaleString("en-IN")}`}
        </div>
      </div>
    </div>
  );
}

export default function CollectionScreen() {
  const isDarkMode = useSelector(
    (state) => state.appConfig?.isDarkMode ?? false,
  );
  const { classAndSectionData } = useSelector((state) => state.appAuth ?? {});
  const selectedSessionId = classAndSectionData?.selectedSession?._id;

  const themeC = isDarkMode ? C : C_LIGHT;
  const [search, setSearch] = useState("");
  const [feeSummaryData, setFeeSummaryData] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchClass, setSearchClass] = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    let isActive = true;

    async function loadClassList() {
      if (!selectedSessionId) {
        setClassList([]);
        setSectionList([]);
        return;
      }

      try {
        const response = await axiosClient.get(
          `${EndPoints.COMMON.CLASS_LIST}/${selectedSessionId}`,
        );
        const classes = Array.isArray(response?.result) ? response.result : [];
        if (isActive) {
          setClassList(classes);
        }
      } catch (error) {
        if (isActive) {
          setClassList([]);
        }
      }
    }

    loadClassList();

    return () => {
      isActive = false;
    };
  }, [selectedSessionId]);

  useEffect(() => {
    if (!searchClass) {
      setSectionList([]);
      if (searchSection) setSearchSection("");
      return;
    }

    const classData = classList.find((item) => item?._id === searchClass);

    if (!classData && classList.length > 0) {
      setSearchClass("");
      setSearchSection("");
      setSectionList([]);
      return;
    }

    const nextSections = Array.isArray(classData?.section)
      ? classData.section
      : [];
    setSectionList(nextSections);

    if (
      searchSection &&
      !nextSections.some((section) => section?._id === searchSection)
    ) {
      setSearchSection("");
    }
  }, [classList, searchClass, searchSection]);

  const getFeeSummary = async () => {
    if(!selectedSessionId){
      showToast.error("Please select Session")
      return;
    }
    
    try {
      const params = {
        page: pageNo,
        limit: limit,
        sessionId: selectedSessionId
      };

      if (selectedSessionId) params.sessionId = selectedSessionId;
      if (searchClass) params.classId = searchClass;
      if (searchSection) params.sectionId = searchSection;
      if (search) params.search = search;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await axiosClient.get(EndPoints.ADMIN.GET_COLLECTION_DATA, {
        params,
      });
      if (res?.statusCode === 200) {
        setFeeSummaryData(res?.result);
      }
    } catch (e) {
      showToast.error(e?.message || "Failed to load collection data");
    }
  };

  useEffect(() => {
    getFeeSummary();
  }, [
    pageNo,
    limit,
    search,
    statusFilter,
    searchClass,
    searchSection,
    selectedSessionId,
  ]);

  const studentsList = feeSummaryData?.students || [];

  const pagination = feeSummaryData?.pagination;

  const activePage = pagination?.page ?? pageNo;
  const activeLimit = pagination?.limit ?? limit;
  const totalPages = pagination?.totalPages ?? 1;
  const totalStudents = pagination?.total ?? studentsList.length;

  const visiblePages = useMemo(
    () => buildVisiblePages(activePage, totalPages),
    [activePage, totalPages],
  );

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

  if (selectedStudent) {
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
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-poppins-bold cursor-pointer border"
              style={{
                color: themeC.blue,
                borderColor: themeC.blue,
                background: themeC.card,
              }}
            >
              <ChevronLeft size={16} /> Back to Collection
            </button>
          </div>
          <StudentPaymentInfo
            student={selectedStudent}
            studentId={selectedStudent?.studentId ?? ""}
            sessionStudentId={selectedStudent?.sessionStudentId ?? ""}
            sessionId={selectedSessionId ?? ""}
            userInfo={{
              studentName: selectedStudent?.studentName ?? "",
              classAndSection: `${selectedStudent?.class ?? ""} ${selectedStudent?.section ?? ""}`,
              phone: selectedStudent?.mainParentPhone ?? "",
            }}
          />
        </div>
      </div>
    );
  }

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
            value={feeSummaryData?.overview?.totalPayable ?? 0}
            themeC={themeC}
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={collected}
            label="Collected Amount"
            value={feeSummaryData?.overview?.collectedAmount ?? 0}
            themeC={themeC}
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={outstanding}
            label="Outstanding Dues"
            value={feeSummaryData?.overview?.outstandingDues ?? 0}
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
            Students ({totalStudents})
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNo(1);
                }}
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
                value={searchClass}
                onChange={(e) => {
                  setSearchClass(e.target.value);
                  setSearchSection("");
                  setPageNo(1);
                }}
                className={`h-12 w-full rounded-lg px-4 text-sm font-poppins-regular outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${controlClass}`}
                disabled={!selectedSessionId || classList.length === 0}
              >
                <option value="" style={optionStyle}>
                  All classes
                </option>
                {classList.map((item) => (
                  <option key={item?._id} value={item?._id} style={optionStyle}>
                    {item?.name}
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
                value={searchSection}
                onChange={(e) => {
                  setSearchSection(e.target.value);
                  setPageNo(1);
                }}
                className={`h-12 w-full rounded-lg px-4 text-sm font-poppins-regular outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${controlClass}`}
                disabled={!searchClass || sectionList.length === 0}
              >
                <option value="" style={optionStyle}>
                  {searchClass ? "All sections" : "Select class first"}
                </option>
                {sectionList.map((item) => (
                  <option key={item?._id} value={item?._id} style={optionStyle}>
                    {item?.name}
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
                setSearchClass("");
                setSearchSection("");
                setPageNo(1);
              }}
              type="button"
            >
              <img
                src={filter}
                className="size-4 object-contain"
                alt="Filter"
              />
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
                  <th style={{ ...TH, textAlign: "right" }}>Total Payable</th>
                  <th style={{ ...TH, textAlign: "right" }}>Collected</th>
                  <th style={{ ...TH, textAlign: "right" }}>Outstanding</th>
                  <th style={{ ...TH, textAlign: "center" }}>Status</th>
                  <th style={TH}>Last Payment</th>
                  <th style={{ ...TH, textAlign: "center", width: 80 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentsList?.length === 0 ? (
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
                  studentsList?.map((data, i) => (
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
                        {(activePage - 1) * activeLimit + i + 1}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: themeC.text,
                          }}
                        >
                          {data?.studentName ?? CONSTANT.NA}
                        </div>
                        {/* <div
                          style={{ fontSize: "11px", color: themeC.textSub }}
                        >
                          {data?.admNo ?? ""}
                        </div> */}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: themeC.sub,
                        }}
                      >
                        {`${data?.class ?? CONSTANT.NA} ${data?.section ?? ""}`}
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
                        ₹{data?.totalPayable ?? CONSTANT.NA}
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
                        ₹{data?.collected ?? CONSTANT.NA}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color:
                            data.outstanding > 0 ? themeC.red : themeC.textSub,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        ₹{data?.outstanding ?? CONSTANT.NA}
                      </td>
                      <td style={{ padding: "13px 18px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 999,
                            background:
                              data?.latestActivityStatus === "Succeeded"
                                ? "rgba(22,163,74,0.1)"
                                : themeC.redDim,
                            color:
                              data?.latestActivityStatus === "Succeeded"
                                ? themeC.green
                                : themeC.red,
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {data?.latestActivityStatus ?? CONSTANT.NA}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: themeC.sub,
                        }}
                      >
                        {data?.lastActivityDate
                          ? moment(data?.lastActivityDate).format(
                              "DD MMM YYYY HH:MM A",
                            )
                          : CONSTANT.NA}
                      </td>
                      <td style={{ padding: "13px 18px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(data)}
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
                disabled={activePage === 1}
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
                  cursor: activePage === 1 ? "not-allowed" : "pointer",
                  opacity: activePage === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={14} />
              </button>

              {visiblePages?.map((page) => (
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
                    background: page === activePage ? themeC.blue : themeC.card,
                    color: page === activePage ? "#ffffff" : themeC.blue,
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
                disabled={activePage === totalPages || totalPages === 0}
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
                  cursor:
                    activePage === totalPages || totalPages === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    activePage === totalPages || totalPages === 0 ? 0.4 : 1,
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
