import React, { useEffect, useState } from "react";
import {
  axisClasses,
  BarChart,
  barClasses,
  barElementClasses,
  barLabelClasses,
  BarPlot,
  ChartContainer,
  ChartsGrid,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LineChart,
  LinePlot,
  PieChart,
} from "@mui/x-charts";
import collected from "../../assets/images/fees/collected.png";
import pending from "../../assets/images/fees/pending.png";
import due from "../../assets/images/fees/due.png";
import refund from "../../assets/images/fees/refund.png";
import upi from "../../assets/images/fees/upi.png";
import netbanking from "../../assets/images/fees/net-banking.png";
import creditcard from "../../assets/images/fees/creditcard.png";
import BarChartComponent from "./BarChart";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import { set } from "date-fns";
import { useSelector } from "react-redux";
import moment from "moment/moment";

const ALL_PAYMENT_MODES = ["upi", "net_banking", "credit_card"];

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
  credit_card: {
    label: "Credit Card",
    color: "#4CBC9A",
    icon: creditcard,
    textClass: "text-textPrimary",
    bgClass: "bg-white",
  },
};

const apiData = [
  { _id: "2025-05", totalAmount: 4000, transactionCount: 1 },
  { _id: "2025-07", totalAmount: 9000, transactionCount: 1 },
  { _id: "2025-08", totalAmount: 3400, transactionCount: 1 },
  { _id: "2025-11", totalAmount: 6000, transactionCount: 1 },
  { _id: "2025-12", totalAmount: 9000, transactionCount: 2 },
];

const apiData2 = [
  {
    _id: "2025-12-10",
    totalAmount: 1000,
    TransactionCount: 2,
  },
  {
    _id: "2025-12-14",
    totalAmount: 1500,
    TransactionCount: 2,
  },
  {
    _id: "2025-12-18",
    totalAmount: 2000,
    TransactionCount: 2,
  },
  {
    _id: "2025-12-19",
    totalAmount: 3000,
    TransactionCount: 2,
  },
  {
    _id: "2025-12-20",
    totalAmount: 3500,
    TransactionCount: 2,
  },
  {
    _id: "2025-12-25",
    totalAmount: 3000,
    TransactionCount: 2,
  },
  {
    _id: "2025-12-26",
    totalAmount: 2000,
    TransactionCount: 2,
  },
];

const FY_MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

const MONTH_MAP = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export default function Dashboard() {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [feeSummary, setFeeSummary] = useState(null);
  const [paymentByMode, setPaymentByMode] = useState([]);
  const [monthlyPaymentSummary, setMonthlyPaymentSummary] = useState([]);
  const [dailyPaymentSummary, setDailyPaymentSummary] = useState([]);
  // console.log(monthlyPaymentSummary);

  const normalizedPayments = ALL_PAYMENT_MODES.map((mode) => {
    const found = paymentByMode.find((p) => p._id === mode);

    return {
      _id: mode,
      totalAmount: found?.totalAmount ?? 0,
    };
  });

  const totalAmount = normalizedPayments.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  const pieData =
    totalAmount > 0
      ? normalizedPayments.map((item, index) => ({
          id: index,
          value: item.totalAmount,
          color: MODE_META[item._id].color,
        }))
      : [
          {
            id: 0,
            value: 1, // fallback invisible slice
            color: "#2a2a2a",
          },
        ];

  const getDaysInMonth = () => {
    const days = moment().daysInMonth();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const getDailyLineData = (dailyPaymentSummary) => {
    const days = getDaysInMonth(); // current month days

    // If API empty / invalid → flat zero line
    if (
      !Array.isArray(dailyPaymentSummary) ||
      dailyPaymentSummary.length === 0
    ) {
      return days.map(() => 0);
    }

    // Build date → amount map
    const dayAmountMap = {};

    dailyPaymentSummary.forEach((item) => {
      if (!item?._id || typeof item.totalAmount !== "number") return;

      // "2025-12-26" → 26
      const day = moment(item._id, "YYYY-MM-DD").date();
      dayAmountMap[day] = item.totalAmount;
    });

    // Return ordered daily amounts
    return days.map((day) => dayAmountMap[day] || 0);
  };

  const getFinancialYearLineData = () => {
    // Always return 12 values
    if (
      !Array.isArray(monthlyPaymentSummary) ||
      monthlyPaymentSummary.length === 0
    ) {
      return new Array(12).fill(0);
    }

    const monthAmountMap = {};

    monthlyPaymentSummary?.forEach((item) => {
      if (!item?._id || typeof item.totalAmount !== "number") return;

      const [, month] = item?._id?.split("-");
      const monthName = MONTH_MAP[Number(month)];

      if (monthName) {
        monthAmountMap[monthName] = item?.totalAmount;
      }
    });

    return FY_MONTHS.map((month) => monthAmountMap[month] || 0);
  };

  const lineSeriesData = getFinancialYearLineData(monthlyPaymentSummary);

  const getFeeSummary = async () => {
    try {
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_FEE_SUMMARY}?sessionId=${classAndSectionData?.selectedSession?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        let totalAmount =
          res?.result?.collectedFee +
          res?.result?.pending +
          res?.result?.overdue;

        setFeeSummary({
          ...res?.result,
          totalAmount,
        });
        // setFeeSummary({
        //   collectedFee: 15,
        //   pending: 3,
        //   overdue: 2,
        //   refunded: 6,
        //   totalAmount: 20,
        // });
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getPaymentByMode = async () => {
    try {
      const res = await axiosClient.post(EndPoints.ADMIN.GET_PAYMENT_BY_MODE, {
        startDate: classAndSectionData?.selectedSession?.startDate,
        endDate: classAndSectionData?.selectedSession?.endDate,
      });
      // console.log(res);
      if (res?.statusCode === 200) {
        setPaymentByMode(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getDailyPaymentSummary = async () => {
    try {
      const res = await axiosClient.post(
        EndPoints.ADMIN.GET_DAILY_PAYMENT_SUMMARY,
        {
          startDate: moment().startOf("month").valueOf(),
          endDate: moment().endOf("month").valueOf(),
        }
      );

      // console.log(res);
      if (res?.statusCode === 200) {
        setDailyPaymentSummary(res?.result?.payments);
        // setDailyPaymentSummary(apiData2);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getMonthlyPaymentSummary = async () => {
    try {
      const res = await axiosClient.post(
        EndPoints.ADMIN.GET_MONTHLY_PAYMENT_SUMMARY,
        {
          sessionId: classAndSectionData?.selectedSession?._id,
        }
      );
      // console.log(res);
      if (res?.statusCode === 200) {
        setMonthlyPaymentSummary(res?.result?.payments);
        // setMonthlyPaymentSummary(apiData);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    getFeeSummary();
    getPaymentByMode();
    getMonthlyPaymentSummary();
    getDailyPaymentSummary();
  }, []);

  // console.log(feeSummary);

  return (
    <div className="p-6 w-full text-white">
      <p className="text-xl font-poppins-bold">Fee Overview</p>
      {/* TOP CARDS */}
      <div className="grid grid-cols-4 gap-4 my-6">
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
              ₹ {feeSummary?.collectedFee ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Total Collected Fees
          </p>
          <p className="text-base font-poppins-bold text-textBlue mt-1">
            +0%{" "}
            <span className="text-textGray2 text-xs font-poppins-regular ">
              than last week
            </span>
          </p>
        </div>

        {/* Pending Payments */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundOrange1">
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundOrange bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={pending} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.pending ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Pending Payments</p>
          <p className="text-base font-poppins-bold text-textOrange2 mt-1">
            +0%{" "}
            <span className="text-textGray2 text-xs font-poppins-regular ">
              than last week
            </span>
          </p>
        </div>

        {/* Overdue Payments */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundRed">
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundRed bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={due} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.overdue ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Overdue Payments</p>
          <p className="text-base font-poppins-bold text-textRed mt-1">
            +0%{" "}
            <span className="text-textGray2 text-xs font-poppins-regular ">
              than last week
            </span>
          </p>
        </div>

        {/* Refunded Amount */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundGreen">
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundGreen bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={refund} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.refunded ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Refunded Amount</p>
          <p className="text-base font-poppins-bold text-textGreen mt-1">
            +0%{" "}
            <span className="text-textGray2 text-xs font-poppins-regular ">
              than last week
            </span>
          </p>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 p-5 rounded-xl bg-[#1c1c1c] min-h-[400px]">
          <h3 className="text-lg font-poppins-bold">Total Fee Collection</h3>
          <p className="text-sm font-poppins-regular text-textGray2 mb-4">
            Total number of fees collected this month
          </p>
          <div className="w-full h-[350px] flex justify-center items-center">
            <BarChartComponent
              xAxisData={getDaysInMonth().map((day) => day.toString())}
              series={getDailyLineData(dailyPaymentSummary)}
            />
          </div>
        </div>

        {/* Payment Mode */}
        <div className="p-5 rounded-xl bg-[#1c1c1c] min-h-[260px] flex flex-col xl:flex-row gap-6 md:gap-0">
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
          <div className="flex flex-col justify-center gap-6 w-full xl:w-auto">
            {normalizedPayments?.map((item) => {
              const meta = MODE_META[item._id];
              if (!meta) return null;

              return (
                <div key={item._id} className="flex items-center gap-3">
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
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-3 gap-4">
        {/* Overdue, Pending, Paid Fees */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] min-h-[260px]">
          <h3 className="text-lg font-poppins-bold">
            Overdue, Pending, Paid Fees
          </h3>
          <p className="text-sm font-poppins-regular text-textGray2 mb-4">
            {feeSummary?.pending ?? 0} pending in this month
          </p>

          <div className="space-y-4">
            {/* === Paid Card === */}
            <div className="bg-[#2b2b2b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left Side */}
              <div className="space-y-2">
                {/* Status Badge */}
                <div className="px-3 py-1 bg-backgroundGray15 rounded-lg flex items-center gap-2 w-fit">
                  <span className="h-2 w-2 bg-backgroundGreen rounded-full"></span>
                  <span className="text-textGreen font-poppins-regular text-sm">
                    Paid
                  </span>
                </div>

                {/* Amount */}
                <p className="text-textPrimary text-2xl font-poppins-bold">
                  ₹ {feeSummary?.collectedFee ?? 0}
                </p>
              </div>

              {/* Right Pie Chart */}
              <div className="flex justify-center items-center">
                <PieChart
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: feeSummary?.collectedFee,
                          color: "#4CCB6A",
                        },
                        {
                          id: 1,
                          value:
                            feeSummary?.totalAmount - feeSummary?.collectedFee,
                          color: "#3b3b3b",
                        },
                      ],
                      innerRadius: 0,
                      outerRadius: 32,
                    },
                  ]}
                  width={65}
                  height={65}
                  slotProps={{ legend: { hidden: true } }}
                />
              </div>
            </div>

            {/* ==== Pending Card ==== */}
            <div className="bg-[#2b2b2b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="px-3 py-1 bg-backgroundGray15 rounded-lg flex items-center gap-2 w-fit">
                  <span className="h-2 w-2 bg-backgroundOrange rounded-full"></span>
                  <span className="text-textOrange2 font-poppins-regular text-sm">
                    Pending
                  </span>
                </div>
                <p className="text-textPrimary text-2xl font-poppins-bold">
                  ₹ {feeSummary?.pending ?? 0}
                </p>
              </div>

              <div>
                <PieChart
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: feeSummary?.pending,
                          color: "#FACC15",
                        },
                        {
                          id: 1,
                          value: feeSummary?.totalAmount - feeSummary?.pending,
                          color: "#3b3b3b",
                        },
                      ],
                      innerRadius: 0,
                      outerRadius: 32,
                    },
                  ]}
                  width={65}
                  height={65}
                  slotProps={{ legend: { hidden: true } }}
                />
              </div>
            </div>

            {/* ==== Overdue Card ==== */}
            <div className="bg-[#2b2b2b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="px-3 py-1 bg-backgroundGray15 rounded-lg flex items-center gap-2 w-fit">
                  <span className="h-2 w-2 bg-backgroundRed rounded-full"></span>
                  <span className="text-textRed font-poppins-regular text-sm">
                    Overdue
                  </span>
                </div>
                <p className="text-textPrimary text-2xl font-poppins-bold">
                  ₹ {feeSummary?.overdue ?? 0}
                </p>
              </div>

              <div>
                <PieChart
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: feeSummary?.overdue,
                          color: "#EF4444",
                        },
                        {
                          id: 1,
                          value: feeSummary?.totalAmount - feeSummary?.overdue,
                          color: "#3b3b3b",
                        },
                      ],
                      innerRadius: 0,
                      outerRadius: 32,
                    },
                  ]}
                  width={65}
                  height={65}
                  slotProps={{ legend: { hidden: true } }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Fee Trends */}
        <div className="col-span-2 p-4 rounded-xl bg-[#1c1c1c] min-h-[260px]">
          <h3 className="text-lg font-poppins-bold">Monthly Fee Trends</h3>
          <p className="text-sm font-poppins-regular text-textGray2 mb-4">
            Total number of fees collected this month
          </p>
          <div className="w-full h-[300px] rounded-lg">
            <ChartContainer
              sx={{
                [`.${axisClasses.root}`]: {
                  [`.${axisClasses.tick}, .${axisClasses.line}`]: {
                    stroke: "#ffffff", // X & Y axis line color
                    strokeWidth: 1.5,
                  },
                  [`.${axisClasses.tickLabel}`]: {
                    fill: "#ffffff", // X & Y label text color
                  },
                },
              }}
              series={[
                {
                  type: "line",
                  data: lineSeriesData,
                  color: "#0A81D1",
                  curve: "natural",
                  showMark: false,
                  strokeWidth: 3,
                },
              ]}
              xAxis={[
                {
                  id: "months",
                  data: FY_MONTHS,
                  scaleType: "point",
                  tickLabelStyle: { fill: "#fff" },
                  height: 40,
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: { fill: "#fff" },
                  width: 80,
                },
              ]}
              height={300}
            >
              <ChartsGrid horizontal />
              <LinePlot />
              <ChartsXAxis axisId="months" />
              <ChartsYAxis />
              <ChartsTooltip />
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
