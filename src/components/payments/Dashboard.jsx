import React, { useEffect, useMemo, useState } from "react";
import { PieChart } from "@mui/x-charts";
import collected from "../../assets/images/fees/collected.png";
import pending from "../../assets/images/fees/pending.png";
import refund from "../../assets/images/fees/refund.png";
import upi from "../../assets/images/fees/upi.png";
import netbanking from "../../assets/images/fees/net-banking.png";
import creditcard from "../../assets/images/fees/creditcard.png";
import BarChartComponent from "./BarChart";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import { useSelector } from "react-redux";
import moment from "moment/moment";
import {
  getPaymentStatusColor,
  getPaymentStatusText,
} from "../../utils/helper";

const ALL_PAYMENT_MODES = [
  { label: "UPI", value: "upi" },
  { label: "Net Banking", value: "net_banking" },
  { label: "Credit Card", value: "card" },
];

const MODE_META = {
  upi: {
    label: "UPI",
    color: "#FF793F",
    icon: upi,
    textClass: "text-textOrange2",
    bgClass: "bg-backgroundOrange",
  },
  net_banking: {
    label: "Net Banking",
    color: "#0A81D1",
    icon: netbanking,
    textClass: "text-textBlue",
    bgClass: "bg-backgroundBlue",
  },
  card: {
    label: "Credit Card",
    color: "#4CBC9A",
    icon: creditcard,
    textClass: "text-textPrimary",
    bgClass: "bg-white",
  },
};

const rows = [
  {
    paidAt: 1759934555000,
    zohoPaymentId: "12128CNN",
    amount: "10",
    paymentMethod: "NET BANKING",
    status: "PAID",
  },
  {
    paidAt: 1762612955000,
    zohoPaymentId: "12128CNN",
    amount: "4000",
    paymentMethod: "UPI",
    status: "PAID",
  },
  {
    paidAt: 1765204955000,
    zohoPaymentId: "12128CNN",
    amount: "3000",
    paymentMethod: "CREDIT CARD",
    status: "FAILED",
  },
  {
    paidAt: 1768848955000,
    zohoPaymentId: "12128CNN",
    amount: "500",
    paymentMethod: "UPI",
    status: "PAID",
  },
];
export default function Dashboard({ setSelected }) {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [feeSummary, setFeeSummary] = useState(null);
  const [paymentTransitions, setPaymentTransitions] = useState([]);
  const [paymentByMode, setPaymentByMode] = useState([]);
  const [dailyPaymentSummary, setDailyPaymentSummary] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    moment().format("YYYY-MM"),
  );

  const academicStartYear =
    classAndSectionData?.selectedSession?.academicStartYear;

  // Generate months from April to current month
  const monthOptions = useMemo(() => {
    if (!academicStartYear) return [];

    const start = moment(`${academicStartYear}-04-01`);
    const end = moment();

    const months = [];
    let current = start.clone();

    while (current.isSameOrBefore(end, "month")) {
      months.push({
        label: current.format("MMMM"),
        value: current.format("YYYY-MM"),
      });
      current.add(1, "month");
    }

    return months;
  }, [academicStartYear]);

  const normalizedPayments = ALL_PAYMENT_MODES?.map((mode) => {
    const found = paymentByMode?.find((p) => p?._id === mode.value);

    return {
      _id: mode.value,
      totalAmount: found?.totalAmount ?? 0,
    };
  });

  const totalAmount = normalizedPayments.reduce(
    (sum, item) => sum + item.totalAmount,
    0,
  );

  const pieData =
    totalAmount > 0
      ? normalizedPayments?.map((item, index) => ({
          id: index,
          value: item?.totalAmount,
          color: MODE_META[item?._id]?.color,
        }))
      : [
          {
            id: 0,
            value: 1, // fallback invisible slice
            color: "#2a2a2a",
          },
        ];

  const getDaysInMonth = (monthValue) => {
    const daysInMonth = moment(monthValue, "YYYY-MM").daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getDailyLineData = (dailyPaymentSummary, monthValue) => {
    const days = getDaysInMonth(monthValue);

    if (
      !Array.isArray(dailyPaymentSummary) ||
      dailyPaymentSummary.length === 0
    ) {
      return days.map(() => 0);
    }

    const dayAmountMap = {};

    dailyPaymentSummary.forEach((item) => {
      if (!item?._id || typeof item.totalAmount !== "number") return;
      const day = moment(item._id, "YYYY-MM-DD").date();
      dayAmountMap[day] = item.totalAmount;
    });

    return days.map((day) => dayAmountMap[day] || 0);
  };

  const getFeeSummary = async () => {
    try {
      const sDate = moment(
        `${classAndSectionData?.selectedSession?.academicStartYear}-04-01`,
      ).startOf("day");

      const eDate = moment().endOf("day");
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_FEE_SUMMARY}?sessionId=${classAndSectionData?.selectedSession?._id}&startDate=${sDate}&endDate=${eDate}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setFeeSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getPaymentTransitions = async () => {
    try {
      const start = moment(`${academicStartYear}-04-01`);
      const end = moment();
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_TRANSITIONS}?sessionId=${classAndSectionData?.selectedSession?._id}&limit=${5}&startDate=${start}&endDate=${end}`,
      );
      // console.log(res);
      if (res?.statusCode === 200) {
        setPaymentTransitions(res?.result?.transactions);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getPaymentByMode = async (monthValue) => {
    try {
      const startDate = moment(monthValue, "YYYY-MM")
        .startOf("month")
        .valueOf();

      const endDate = moment(monthValue, "YYYY-MM").endOf("month").valueOf();
      const res = await axiosClient.post(EndPoints.ADMIN.GET_PAYMENT_BY_MODE, {
        startDate,
        endDate,
      });
      // console.log(res);
      if (res?.statusCode === 200) {
        setPaymentByMode(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getDailyPaymentSummary = async (monthValue) => {
    try {
      const startDate = moment(monthValue, "YYYY-MM")
        .startOf("month")
        .valueOf();

      const endDate = moment(monthValue, "YYYY-MM").endOf("month").valueOf();

      const res = await axiosClient.post(
        EndPoints.ADMIN.GET_DAILY_PAYMENT_SUMMARY,
        {
          startDate,
          endDate,
        },
      );
      if (res?.statusCode === 200) {
        setDailyPaymentSummary(res?.result?.payments);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    getFeeSummary();
    getPaymentTransitions();
  }, []);

  useEffect(() => {
    // console.log(selectedMonth);

    if (selectedMonth) {
      getPaymentByMode(selectedMonth);
      getDailyPaymentSummary(selectedMonth);
    }
  }, [selectedMonth]);

  return (
    <div className="p-6 w-full text-white">
      <p className="text-xl font-poppins-bold">Fee Overview</p>
      {/* TOP CARDS */}
      <div className="grid grid-cols-3 gap-4 my-6">
        {/* Total Collected Fees */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundBlue">
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundBlue bg-opacity-15 flex justify-center items-center rounded-md">
              <img
                src={collected}
                alt="p"
                className="size-6 object-contain z-10"
              />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.totalPaidAmount ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Total Collected Fees
          </p>
        </div>

        {/* Pending Payments */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundOrange1">
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundOrange bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={pending} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.pendingAmount ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Pending Fees till Due Date
          </p>
        </div>

        {/* Advanced Amount */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundGreen">
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundGreen bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={refund} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.totalAdvancedAmount ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Advanced Paid Amount
          </p>
        </div>
      </div>

      {/* Monthly Fee Trends */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] my-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">
              Recent 5 Transactions Details
            </h3>
            {/* <p className="text-sm font-poppins-regular text-textGray2">
              Recent 5 transitions Details
            </p> */}
          </div>
          <button
            type="button"
            onClick={() => setSelected("Reports")}
            className="bg-backgroundBlue text-textPrimary text-sm px-4 py-1 rounded-md"
          >
            View More
          </button>
        </div>

        <div className="w-full rounded-xl overflow-auto">
          {paymentTransitions.length === 0 ? (
            <div className="font-poppins-bold text-lg text-textGray2 text-center">
              No Transition right now
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                  <th className="py-4 px-2">Student Name</th>
                  <th className="py-4 px-2">Class & Section</th>
                  <th className="py-4 px-2">Phone</th>
                  <th className="py-4 px-2">Transaction ID</th>
                  <th className="py-4 px-2">Amount</th>
                  <th className="py-4 px-2">Payment Mode</th>
                  <th className="py-4 px-2">Date & Time</th>
                  <th className="py-4 px-2">Status</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {paymentTransitions?.map((std, index) => (
                  <tr
                    key={index}
                    className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-medium"
                  >
                    {/* STUDENT NAME */}
                    <td className="py-4 px-2">{std?.studentName ?? "NA"}</td>
                    <td className="py-4 px-2">
                      {`${std?.className ?? "NA"} ${std?.sectionName ?? ""}`}
                    </td>
                    <td className="py-4 px-2">{std?.parentPhone ?? "NA"}</td>
                    <td className="py-4 px-2">{std?.zohoPaymentId ?? "NA"}</td>
                    <td className="py-4 px-2">{std?.amount}</td>
                    <td className="py-4 px-2 uppercase">
                      {std?.paymentMethod ?? "NA"}
                    </td>
                    <td className="py-4 px-2">
                      {moment(std?.paidAt).format("DD/MM/YYYY HH:mm A")}
                    </td>
                    <td
                      className={`py-4 px-2 ${getPaymentStatusColor(std?.status)}`}
                    >
                      {getPaymentStatusText(std?.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-4 gap-4 mb-6 bg-[#1c1c1c] rounded-xl">
        <div className="p-5 rounded-xl bg-[#1c1c1c] min-h-[260px] flex flex-col">
          <div className="flex-1 flex justify-center items-center relative">
            {/* Donut Chart */}
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 72,
                  outerRadius: 102,
                },
              ]}
              width={222}
              height={222}
              slotProps={{
                legend: { hidden: true }, // hide default legend
              }}
            />

            {/* Center Text */}
            <div className="absolute flex flex-col justify-center items-center">
              <p className="text-xl font-poppins-bold">₹ {totalAmount}</p>
              <p className="text-sm text-textGray2 text-center leading-4">
                Fees Payment <br /> Mode
              </p>
            </div>
          </div>

          {/* Custom Right Legend */}
          <div className="flex flex-col justify-center items-center gap-6 w-full xl:w-auto">
            {normalizedPayments?.map((item) => {
              const meta = MODE_META[item?._id];
              if (!meta) return null;

              return (
                <div
                  key={item?._id}
                  className="flex items-center gap-3 w-[150px]"
                >
                  <div
                    className={`h-11 w-11 rounded-md ${meta.bgClass} bg-opacity-15 flex justify-center items-center`}
                  >
                    <img
                      src={meta.icon}
                      alt={meta.label}
                      className="size-[32px] object-contain"
                    />
                  </div>

                  <div className="text-[15px] font-poppins-bold">
                    <p className="text-textPrimary">₹ {item?.totalAmount}</p>
                    <p className={meta.textClass}>{meta?.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-3 p-5 rounded-xl bg-[#1c1c1c] min-h-[400px]">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-poppins-bold">Fee Collection</h3>
              <p className="text-sm font-poppins-regular text-textGray2 mb-4">
                Total number of fees collected by month
              </p>
            </div>
            {monthOptions.length > 0 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40 pl-4 pr-4 py-2.5 bg-[#242424] cursor-pointer border border-gray-700 rounded-lg text-white appearance-none"
              >
                {monthOptions?.map((month) => (
                  <option key={month?.value} value={month?.value}>
                    {month?.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="w-full h-[350px] flex justify-center items-center">
            <BarChartComponent
              xAxisData={getDaysInMonth(selectedMonth).map((day) =>
                day.toString(),
              )}
              series={getDailyLineData(dailyPaymentSummary, selectedMonth)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
