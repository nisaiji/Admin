import React, { useEffect, useMemo, useState } from "react";
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

const FINANCIAL_YEAR_MONTHS = [
  { month: "Apr", label: "Apr", year: 2026, days: 30, amount: 124000 },
  { month: "May", label: "May", year: 2026, days: 31, amount: 136500 },
  { month: "Jun", label: "Jun", year: 2026, days: 30, amount: 149250 },
  { month: "Jul", label: "Jul", year: 2026, days: 31, amount: 141000 },
  { month: "Aug", label: "Aug", year: 2026, days: 31, amount: 158750 },
  { month: "Sep", label: "Sep", year: 2026, days: 30, amount: 164000 },
  { month: "Oct", label: "Oct", year: 2026, days: 31, amount: 172500 },
  { month: "Nov", label: "Nov", year: 2026, days: 30, amount: 168250 },
  { month: "Dec", label: "Dec", year: 2026, days: 31, amount: 176400 },
  { month: "Jan", label: "Jan", year: 2027, days: 31, amount: 182300 },
  { month: "Feb", label: "Feb", year: 2027, days: 28, amount: 189600 },
  { month: "Mar", label: "Mar", year: 2027, days: 31, amount: 194900 },
];

function buildDailySeries(totalAmount, totalDays) {
  const weights = Array.from(
    { length: totalDays },
    (_, index) => 1 + (index % 5) * 0.12,
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  return weights.map((weight) =>
    Math.round((totalAmount * weight) / totalWeight),
  );
}

function buildDailyChartData(monthKey) {
  const monthMeta =
    FINANCIAL_YEAR_MONTHS.find((item) => item.month === monthKey) ||
    FINANCIAL_YEAR_MONTHS[FINANCIAL_YEAR_MONTHS.length - 1];
  const series = buildDailySeries(monthMeta.amount, monthMeta.days);

  return {
    monthMeta,
    xAxisData: Array.from(
      { length: monthMeta.days },
      (_, index) => `${index + 1} ${monthMeta.month}`,
    ),
    series,
  };
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

function StatusBadge({ status }) {
  const styles =
    status === "Succeeded"
      ? "bg-[rgba(34,197,94,0.1)] text-[#22c55e]"
      : status === "Failed"
        ? "bg-[rgba(254,64,64,0.1)] text-[#fe4040]"
        : "bg-[rgba(251,191,36,0.1)] text-[#f59e0b]";
  return (
    <div
      className={`flex items-center justify-center h-[32px] w-[78px] rounded-[6px] ${styles}`}
    >
      <span className="font-medium text-[12px] font-['Inter',sans-serif]">
        {status}
      </span>
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
  const [searched, setSearched] = useState(false);
  const [studentListData, setStudentListData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("Mar");

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

  const monthlyChartData = useMemo(
    () => buildDailyChartData(selectedMonth),
    [selectedMonth],
  );

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

  return (
    <div className="p-[24px]">
      <Toaster />
      <div className="flex flex-col gap-[24px]">
        {/* ── Header bar ── */}
        <div className="flex items-center justify-between rounded-[0]">
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

        {/* ── Search bar ── */}
        <div className="flex items-center gap-[12px]">
          <div className="flex-1 bg-white rounded-[6px] border border-[#e7e2e2] flex items-center justify-between px-[13px] py-[9px]">
            <div className="flex items-center gap-[10px]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 18.006 18.006"
                fill="none"
              >
                <path d={svgPaths.p2e7aad00} fill="#6E6E6E" />
              </svg>
              <input
                className="font-medium text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] outline-none bg-transparent w-full"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearched(true)}
                placeholder="Search student..."
              />
            </div>
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  setSearched(false);
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4L20 20"
                    stroke="#686868"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 20L20 4"
                    stroke="#686868"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Search results label ── */}
        {searched && (
          <p className="font-semibold text-[14px] text-[#6a7282] font-['Inter',sans-serif]">
            Search Results for{" "}
            <span className="text-[#101828]">&ldquo;{searchValue}&rdquo;</span>
          </p>
        )}
        {studentListData?.map((data, i) => (
          <div className="flex w-full bg-white border border-[#E5E7EB] rounded-xl p-5 mt-3 justify-between items-center">
            {/* left */}
            <div className="flex space-x-4">
              <div className="flex bg-[#2563EB] rounded-full size-11 justify-center items-center">
                <div
                  className="font-poppins-bold text-md"
                  style={{ color: themeC.text }}
                >
                  SM
                </div>
              </div>
              <div>
                <div
                  className="font-poppins-bold text-sm"
                  style={{ color: themeC.text }}
                >
                  Aarav Sharma
                </div>
                <div
                  className="font-poppins-medium text-xs"
                  style={{ color: themeC.textSub }}
                >
                  ADM-2026-00012
                </div>
              </div>
            </div>
            {/* right */}
            <div className="flex space-x-8">
              <div>
                <div
                  className="font-poppins-medium text-xs"
                  style={{ color: themeC.textSub }}
                >
                  CLASS
                </div>
                <div
                  className="font-poppins-bold text-sm"
                  style={{ color: themeC.text }}
                >
                  1 A
                </div>
              </div>
              <div>
                <div
                  className="font-poppins-medium text-xs"
                  style={{ color: themeC.textSub }}
                >
                  DOB
                </div>
                <div
                  className="font-poppins-bold text-sm"
                  style={{ color: themeC.text }}
                >
                  14 MAR 2002
                </div>
              </div>
              <div>
                <div
                  className="font-poppins-medium text-xs"
                  style={{ color: themeC.textSub }}
                >
                  PHONE
                </div>
                <div
                  className="font-poppins-bold text-sm"
                  style={{ color: themeC.text }}
                >
                  7778889990
                </div>
              </div>
              <div>
                <div
                  className="font-poppins-medium text-xs"
                  style={{ color: themeC.textSub }}
                >
                  GENDER
                </div>
                <div
                  className="font-poppins-bold text-sm"
                  style={{ color: themeC.text }}
                >
                  Male
                </div>
              </div>
              <img
                src={openArrow}
                alt="open"
                className="size-8 object-contain"
              />
            </div>
          </div>
        ))}
        {/* <StudentPaymentInfo
          // studentId=""
          // sessionId={selectedSessionId}
        /> */}
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

            <div className="flex flex-col gap-2 sm:min-w-[180px]">
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
            </div>
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

          <div className="rounded-[8px] overflow-hidden border border-[#e7e2e2]">
            <div className="bg-[#f0f6f9] border-b border-[#e7e2e2] flex items-center h-[36px] pl-[10px]">
              {[
                "Student Name",
                "Class & Section",
                "Phone",
                "Payment Ref",
                "Amount",
                "Payment Mode",
                "Date & Time",
                "Status",
              ]?.map((col, i) => (
                <div
                  key={i}
                  className="flex-1 px-[8px] font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif] text-center first:text-left"
                >
                  {col}
                </div>
              ))}
            </div>
            {transitionHistoryData?.length === 0 ? (
              <div style={{ textAlign: "center", color: themeC.text }}>
                No Data To Display
              </div>
            ) : (
              transitionHistoryData?.map((payment, index) => (
                <div
                  key={index}
                  className={`flex items-center h-[52px] pl-[10px] ${index < transitionHistoryData?.length - 1 ? "border-b border-[#d0d0d0]/25" : ""} border-l border-r border-[#e7e2e2]`}
                >
                  <div className="flex-1 px-[8px] font-normal text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                    {payment?.studentName ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] font-normal text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {`${payment?.class ?? ""} ${payment?.section ?? ""}`}
                  </div>
                  <div className="flex-1 px-[8px] font-normal text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {payment?.phone ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] font-normal text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {payment?.paymentRef ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] font-semibold text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {payment?.amount ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {payment?.paymentMode ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {moment(payment?.dateTime).format("DD MMM YYYY HH:MM A")}
                  </div>
                  <div className="flex-1 px-[8px] flex justify-center">
                    <StatusBadge status={payment?.status ?? ""} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
