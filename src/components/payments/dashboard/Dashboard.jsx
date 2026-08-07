import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import svgPaths from "./svg";
import payable from "../../../assets/images/payments/payable.png";
import collected from "../../../assets/images/payments/collected.png";
import outstanding from "../../../assets/images/payments/outstanding.png";
import openArrow from "../../../assets/images/payments/openArrow.png";
import { C, C_LIGHT } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import BarChartComponent from "../BarChart";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../../services/axiosClient.js";
import EndPoints from "../../../services/EndPoints";
import moment from "moment";
import { setTempData } from "../../../store/AppAuthSlice.js";
import StudentPaymentInfo from "./StudentPaymentInfo.jsx";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

const PAGE_LIMIT_OPTIONS = [10, 20, 25, 50, 100];

function buildVisiblePages(pageNo, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, pageNo - 1, pageNo, pageNo + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);
}

function getApiErrorMessage(error, fallback) {
  if (typeof error === "string") return error;
  return error?.message || error?.data?.message || fallback;
}

function getStudentDisplayName(student) {
  const firstName = String(student?.firstName ?? "").trim();
  const lastName = String(student?.lastName ?? "").trim();
  const combinedName = `${firstName} ${lastName}`.trim();

  return (
    String(student?.studentName ?? "").trim() ||
    combinedName ||
    String(student?.name ?? "").trim() ||
    "NA"
  );
}

function getStudentInitials(student) {
  const fullName = getStudentDisplayName(student);

  if (fullName === "NA") return "NA";

  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStudentAdmissionNumber(student) {
  return (
    student?.admNo ??
    student?.admissionNo ??
    student?.studentCode ??
    student?.studentId ??
    student?._id ??
    "NA"
  );
}

function getStudentClassLabel(student) {
  const className = String(
    student?.className ?? student?.class?.name ?? student?.class ?? "",
  ).trim();
  const sectionName = String(
    student?.sectionName ?? student?.section?.name ?? student?.section ?? "",
  ).trim();

  return [className, sectionName].filter(Boolean).join(" ") || "NA";
}

function formatStudentDate(value) {
  const date = moment(value);
  return date.isValid() ? date.format("DD MMM YYYY") : "NA";
}

function getStudentPhone(student) {
  return (
    String(
      student?.phone ??
        student?.parentPhone ??
        student?.mainParentPhone ??
        student?.contactNo ??
        student?.mobileNo ??
        "",
    ).trim() || "NA"
  );
}

function getStudentGender(student) {
  return String(student?.gender ?? student?.studentGender ?? "").trim() || "NA";
}

function StatCard({ icon, label, value, themeC }) {
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

export function PaymentDashboard() {
  const isDarkMode = useSelector(
    (state) => state.appConfig?.isDarkMode ?? false,
  );
  const { classAndSectionData } = useSelector((state) => state.appAuth ?? {});
  const selectedSessionId = classAndSectionData?.selectedSession?._id;
  const dispatch = useDispatch();
  const themeC = isDarkMode ? C : C_LIGHT;
  const [feeSummaryData, setFeeSummaryData] = useState({});
  const [transitionHistoryData, setTransitionHistoryData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [studentListData, setStudentListData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState("");
  const requestIdRef = useRef(0);

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
      const t = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(t);
    }, []);
    return now;
  }
  const now = useClock();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const totalPages = Math.max(1, Math.ceil(totalStudentCount / limit) || 1);
  const visiblePages = useMemo(
    () => buildVisiblePages(pageNo, totalPages),
    [pageNo, totalPages],
  );
  const showingFrom = totalStudentCount === 0 ? 0 : (pageNo - 1) * limit + 1;
  const showingTo = Math.min(totalStudentCount, pageNo * limit);

  const getFeeSummary = async () => {
    try {
      const res = await axiosClient.get(EndPoints.ADMIN.GET_FEE_SUMMARY);

      if (res?.statusCode === 200) {
        setFeeSummaryData(res?.result);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const getTransitionHistory = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_TRANSITION_HISTORY}?page=1,limit=5`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setTransitionHistoryData(res?.result?.payments);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  useEffect(() => {
    getFeeSummary();
    getTransitionHistory();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  const fetchStudents = async () => {
    if (!selectedSessionId) {
      setStudentListData([]);
      setTotalStudentCount(0);
      setStudentError("");
      setLoadingStudents(false);
      return;
    }

    const query = new URLSearchParams({
      page: String(pageNo),
      limit: String(limit),
      session: String(selectedSessionId),
    });

    if (debouncedSearch) {
      query.set("search", debouncedSearch);
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setLoadingStudents(true);
      setStudentError("");

      const response = await axiosClient.get(
        `${EndPoints.ADMIN.SEARCH_STUDENT}?${query.toString()}`,
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (response?.statusCode === 200) {
        const result = response?.result ?? {};
        const students = Array.isArray(result?.students)
          ? result.students
          : Array.isArray(result)
            ? result
            : [];
        const totalStudents = Number(
          result?.totalStudents ?? result?.pagination?.total ?? students.length,
        );

        setStudentListData(students);
        setTotalStudentCount(
          Number.isFinite(totalStudents) ? totalStudents : 0,
        );
      }
    } catch (e) {
      toast.error(e);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingStudents(false);
      }
    }
  };

  useEffect(() => {
    if (!debouncedSearch) {
      setStudentListData([]);
      setTotalStudentCount(0);
      setStudentError("");
      setLoadingStudents(false);
      return;
    }

    fetchStudents();
  }, [debouncedSearch, pageNo, limit, selectedSessionId]);

  useEffect(() => {
    if (pageNo > totalPages) {
      setPageNo(totalPages);
    }
  }, [pageNo, totalPages]);

  function handleSearchChange(event) {
    setSearchValue(event.target.value);
    setPageNo(1);
    setSelectedStudent(null);
  }

  function handleLimitChange(event) {
    setLimit(Number(event.target.value));
    setPageNo(1);
  }

  function handleSelectStudent(student) {
    setSelectedStudent(student);
  }

  function handleClearSearch() {
    setSearchValue("");
    setDebouncedSearch("");
    setPageNo(1);
    setSelectedStudent(null);
  }

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
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
          </div>
          <StudentPaymentInfo
            student={selectedStudent}
            studentId={selectedStudent?.studentId ?? ""}
            sessionStudentId={selectedStudent?._id ?? ""}
            sessionId={selectedSessionId ?? ""}
            userInfo={{
              studentName: `${selectedStudent?.firstName ?? ""} ${selectedStudent?.lastName ?? ""}`,
              classAndSection: `${selectedStudent?.className ?? ""} ${selectedStudent?.sectionName ?? ""}`,
              phone: selectedStudent?.mainParentPhone ?? "",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-[24px]">
      <Toaster />
      <div className="flex flex-col gap-[24px]">
        {/* ── Header bar ── */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[5px]">
            <h1 className="font-bold text-[20px] text-[#0f0f0f] font-['Inter',sans-serif] leading-[1.2]">
              Payment Dashboard
            </h1>
            <p className="font-medium text-[14px] text-[#686868] font-['Inter',sans-serif]">
              Fee collection overview
            </p>
          </div>

          {/* Date / time */}
          <div className="bg-white rounded-[36px] flex items-center px-[14px] py-[10px] gap-[19px] h-[72px]">
            <div className="bg-[rgba(10,129,209,0.26)] rounded-full size-[48px] flex items-center justify-center">
              <div className="relative size-[32px]">
                <svg
                  className="absolute inset-0 size-full"
                  fill="none"
                  viewBox="0 0 32 32"
                >
                  <path d="M32 0H0V32H32V0Z" fill="#00558F" opacity="0" />
                  <path d={svgPaths.p141fb70} fill="#00558F" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-[24px]">
              <div className="flex flex-col">
                <span className="text-[12px] text-[#686868] font-['Helvetica',sans-serif]">
                  Date
                </span>
                <span className="font-bold text-[16px] text-[#040320] font-['Nunito_Sans',sans-serif]">
                  {dateStr}
                </span>
              </div>
              <div className="w-0 h-[32px] flex items-center justify-center">
                <svg width="1" height="32" viewBox="0 0 1 32">
                  <path
                    d="M0.5 0.5V31.5"
                    stroke="#686868"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-[#686868] font-['Helvetica',sans-serif]">
                  Time
                </span>
                <span className="font-bold text-[16px] text-[#040320] font-['Nunito_Sans',sans-serif]">
                  {timeStr}
                </span>
              </div>
            </div>
            <div className="size-[48px] flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d={svgPaths.p1f337080} fill="#F0F6F9" />
                <path d={svgPaths.p14243200} fill="#0A81D1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#e7e2e2] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            {/* <div>
              <p className="font-bold text-[14px] text-[#101828] font-['Inter',sans-serif]">
                Students ({totalStudentCount})
              </p>
              <p className="mt-1 text-[13px] text-[#6a7282] font-['Inter',sans-serif]">
                {selectedStudent
                  ? `Viewing ${getStudentDisplayName(selectedStudent)}`
                  : `Showing ${showingFrom}-${showingTo} of ${totalStudentCount} students`}
              </p>
            </div> */}

            {selectedStudent ? (
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2563eb] px-4 py-2 text-sm font-poppins-bold text-[#2563eb] transition hover:bg-[#2563eb]/10"
              >
                <ChevronLeft size={16} />
                Back to Students
              </button>
            ) : null}
          </div>

          <>
            {/* searchbar */}
            <div className="flex items-center gap-[12px] flex-wrap">
              <div className="flex-1 min-w-[280px] bg-white rounded-[6px] border border-[#e7e2e2] flex items-center justify-between px-[13px] py-[9px]">
                <div className="flex items-center gap-[10px] flex-1">
                  <Search size={18} className="text-[#6E6E6E]" />
                  <input
                    className="font-medium text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] outline-none bg-transparent w-full"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search student..."
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearSearch}
                className="flex items-center gap-1 rounded-lg border border-[#2563eb] px-4 py-2 text-sm font-poppins-bold text-[#2563eb] transition hover:bg-[#2563eb]/10"
              >
                Clear Search
              </button>
            </div>
            {/* student list */}
            <div className="space-y-3">
              {studentListData.length === 0 &&
              (loadingStudents || searchValue) ? (
                <div className="rounded-xl border border-dashed border-[#e5e7eb] mt-2 p-4 text-center text-sm text-[#6a7282] font-['Inter',sans-serif]">
                  {loadingStudents ? (
                    <>
                      <RefreshCw
                        className="mx-auto mb-2 animate-spin"
                        size={18}
                      />
                      Loading students...
                    </>
                  ) : (
                    <>
                      <Users className="mx-auto mb-2" size={18} />
                      {studentError || "No students found"}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {studentListData?.map((student, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 text-left transition hover:border-[#2563EB] hover:shadow-sm mt-3"
                    >
                      <div className="flex min-w-0 space-x-4">
                        <div className="flex size-11 items-center justify-center rounded-full bg-[#2563EB]">
                          <div className="font-poppins-bold text-md text-white">
                            {getStudentInitials(student)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div
                            className="truncate font-poppins-bold text-sm"
                            style={{ color: themeC.text }}
                          >
                            {`${student?.firstName ?? ""} ${student?.lastName ?? ""}`}
                          </div>
                          <div
                            className="font-poppins-medium text-xs"
                            style={{ color: themeC.textSub }}
                          >
                            {student?.studentUniqueId ?? ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-8">
                        <div>
                          <div
                            className="font-poppins-medium text-xs uppercase"
                            style={{ color: themeC.textSub }}
                          >
                            Class
                          </div>
                          <div
                            className="font-poppins-bold text-sm"
                            style={{ color: themeC.text }}
                          >
                            {`${student?.className ?? ""} ${student?.sectionName ?? ""}`}
                          </div>
                        </div>
                        <div>
                          <div
                            className="font-poppins-medium text-xs uppercase"
                            style={{ color: themeC.textSub }}
                          >
                            DOB
                          </div>
                          <div
                            className="font-poppins-bold text-sm"
                            style={{ color: themeC.text }}
                          >
                            {student?.dob ?? ""}
                          </div>
                        </div>
                        <div>
                          <div
                            className="font-poppins-medium text-xs uppercase"
                            style={{ color: themeC.textSub }}
                          >
                            Phone
                          </div>
                          <div
                            className="font-poppins-bold text-sm"
                            style={{ color: themeC.text }}
                          >
                            {student?.mainParentPhone ?? ""}
                          </div>
                        </div>
                        <div>
                          <div
                            className="font-poppins-medium text-xs uppercase"
                            style={{ color: themeC.textSub }}
                          >
                            Gender
                          </div>
                          <div
                            className="font-poppins-bold text-sm"
                            style={{ color: themeC.text }}
                          >
                            {student?.gender ?? ""}
                          </div>
                        </div>
                        <img
                          src={openArrow}
                          alt="open"
                          className="size-8 object-contain"
                        />
                      </div>
                    </button>
                  ))}
                  {studentListData.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#e7e2e2] pt-4">
                      <label
                        className="flex items-center gap-2 text-sm"
                        style={{ color: themeC.textSub }}
                      >
                        Rows
                        <select
                          value={limit}
                          onChange={handleLimitChange}
                          className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm outline-none"
                        >
                          {PAGE_LIMIT_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPageNo((currentPage) =>
                              Math.max(1, currentPage - 1),
                            )
                          }
                          disabled={pageNo === 1 || loadingStudents}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-[#2563eb] text-[#2563eb] transition hover:bg-[#2563eb]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft size={15} />
                        </button>

                        {visiblePages.map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setPageNo(page)}
                            disabled={loadingStudents}
                            className={`inline-flex size-8 items-center justify-center rounded-full border border-[#2563eb] text-xs font-poppins-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${page === pageNo ? "bg-[#2563eb] text-white" : "text-[#2563eb] hover:bg-[#2563eb]/10"}`}
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
                          disabled={pageNo === totalPages || loadingStudents}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-[#2563eb] text-[#2563eb] transition hover:bg-[#2563eb]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        </div>

        {/* fee cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
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

        {/* bar chart */}
        <div className="rounded-[14px] border border-[#e7e2e2] bg-white p-[20px]">
          <div className="flex flex-col gap-4 border-b border-[#f3f4f6] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-bold text-[18px] text-[#101828] font-['Inter',sans-serif]">
                Fee Collection Trend
              </h2>
              <p className="mt-1 text-[13px] text-[#6a7282] font-['Inter',sans-serif]">
                Monthly collection trend across the financial year
              </p>
            </div>

            {/* <div className="flex flex-col gap-2 sm:min-w-[180px]">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6a7282] font-['Inter',sans-serif]">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="h-10 rounded-lg border border-[#dfe5eb] bg-white px-4 text-sm font-['Inter',sans-serif] text-[#0f172a] outline-none transition focus:border-[#0A81D1] focus:ring-2 focus:ring-blue-100"
              >
                {FINANCIAL_YEAR_MONTHS.map((item) => (
                  <option key={item.month} value={item.month}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          <div className="mt-4">
            <BarChartComponent
              xAxisData={feeSummaryData?.feeCollectionTrend?.map(
                (item) => item.day,
              )}
              series={feeSummaryData?.feeCollectionTrend?.map(
                (item) => item.amount,
              )}
              // xAxisData={monthlyChartData.xAxisData}
              // series={monthlyChartData.series}
              barColor="#0A81D1"
              isDarkMode={false}
              height={300}
            />
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-[14px] border border-[#e7e2e2] bg-white p-[20px]">
          <div className="flex items-start justify-between gap-4 mb-[16px]">
            <div>
              <p className="font-bold text-[14px] text-[#101828] font-['Inter',sans-serif]">
                Recent Transactions
              </p>
              <p className="mt-1 text-[13px] text-[#6a7282] font-['Inter',sans-serif]">
                Latest successful fee payments
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch(setTempData({ selectedTab: "Collection" }))
              }
              className="font-medium text-[12px] text-[#2563eb] font-['Inter',sans-serif]"
            >
              View complete history →
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="w-full rounded-[8px] overflow-hidden border border-[#e7e2e2]">
              {/* Header */}
              <div className="bg-[#f0f6f9] border-b border-[#e7e2e2] flex items-center h-[40px] pl-[10px]">
                <div className="w-[140px] shrink-0 px-[8px] font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Student Name
                </div>

                <div className="w-[140px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Class & Section
                </div>

                <div className="w-[140px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Phone
                </div>

                <div className="w-[200px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Payment Ref
                </div>

                <div className="w-[120px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Amount
                </div>

                <div className="w-[150px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Payment Mode
                </div>

                <div className="w-[180px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Date & Time
                </div>

                <div className="w-[100px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif]">
                  Status
                </div>
              </div>

              {/* Body */}
              {transitionHistoryData?.length === 0 ? (
                <div
                  className="py-6 text-center"
                  style={{ color: themeC.text }}
                >
                  No Data To Display
                </div>
              ) : (
                transitionHistoryData?.map((payment, index) => (
                  <div
                    key={index}
                    className={`flex items-center h-[56px] pl-[10px] ${
                      index < transitionHistoryData.length - 1
                        ? "border-b border-[#d0d0d0]/25"
                        : ""
                    } border-l border-r border-[#e7e2e2]`}
                  >
                    {/* Student Name */}
                    <div
                      className="w-[140px] shrink-0 px-[8px] text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] truncate"
                      title={payment?.studentName}
                    >
                      {payment?.studentName ?? ""}
                    </div>

                    {/* Class & Section */}
                    <div className="w-[140px] shrink-0 px-[8px] text-center text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                      {`${payment?.class ?? ""} ${payment?.section ?? ""}`}
                    </div>

                    {/* Phone */}
                    <div className="w-[140px] shrink-0 px-[8px] text-center text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                      {payment?.phone ?? ""}
                    </div>

                    {/* Payment Ref */}
                    <div
                      className="w-[200px] shrink-0 px-[8px] text-center text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] truncate"
                      title={payment?.paymentRef}
                    >
                      {payment?.paymentRef ?? ""}
                    </div>

                    {/* Amount */}
                    <div className="w-[120px] shrink-0 px-[8px] text-center font-semibold text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                      ₹{payment?.amount ?? ""}
                    </div>

                    {/* Payment Mode */}
                    <div className="w-[150px] shrink-0 px-[8px] text-center text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                      {payment?.paymentMode ?? ""}
                    </div>

                    {/* Date & Time */}
                    <div className="w-[180px] shrink-0 px-[8px] text-center text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                      {payment?.dateTime
                        ? moment(payment.dateTime).format("DD MMM YYYY hh:mm A")
                        : ""}
                    </div>

                    {/* Status */}
                    <div className="w-[100px] shrink-0 flex justify-center">
                      <div
                        className={`flex items-center justify-center h-[32px] w-[78px] rounded-[6px] ${
                          payment?.status === "SUCCESS"
                            ? "bg-[rgba(34,197,94,0.1)] text-[#22c55e]"
                            : payment?.status === "FAILED"
                              ? "bg-[rgba(254,64,64,0.1)] text-[#fe4040]"
                              : "bg-[rgba(251,191,36,0.1)] text-[#f59e0b]"
                        }`}
                      >
                        <span className="font-poppins-bold text-[12px] font-['Inter',sans-serif]">
                          {payment?.status ?? ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
