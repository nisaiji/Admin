import React from "react";
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

export default function Dashboard() {
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
            <p className="text-lg font-poppins-bold mt-1">₹ 2000000</p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Total Collected Fees
          </p>
          <p className="text-base font-poppins-bold text-textBlue mt-1">
            +18.2%{" "}
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
            <p className="text-lg font-poppins-bold mt-1">₹ 500000</p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Pending Payments</p>
          <p className="text-base font-poppins-bold text-textOrange2 mt-1">
            +4.5%{" "}
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
            <p className="text-lg font-poppins-bold mt-1">₹ 100000</p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Overdue Payments</p>
          <p className="text-base font-poppins-bold text-textRed mt-1">
            +2%{" "}
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
            <p className="text-lg font-poppins-bold mt-1">₹ 50000</p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Refunded Amount</p>
          <p className="text-base font-poppins-bold text-textGreen mt-1">
            +2%{" "}
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
            <BarChart
              xAxis={[
                {
                  data: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  tickLabelStyle: { fill: "#fff" }, // X-axis text color
                  labelStyle: { fill: "#fff" },
                  stroke: "#fff", // X-axis line color
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: { fill: "#fff" }, // Y-axis text color
                  labelStyle: { fill: "#fff" },
                  stroke: "#fff", // Y-axis line color
                },
              ]}
              series={[
                {
                  data: [
                    20000, 35000, 45000, 90000, 75000, 60000, 70000, 65000,
                    55000, 60000, 45000, 50000,
                  ],
                },
              ]}
              sx={{
                [`& .${barClasses.series} .${barElementClasses.root}`]: {
                  fill: "url(#bar-gradient)",
                  rx: 4,
                  ry: 4,
                },
              }}
            >
              <defs>
                <linearGradient
                  gradientTransform="rotate(90)"
                  id="bar-gradient"
                >
                  <stop offset="0%" stopColor="#0A81D1" />
                  <stop offset="100%" stopColor="#4CBC9A" />
                </linearGradient>
              </defs>
            </BarChart>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="p-5 rounded-xl bg-[#1c1c1c] min-h-[260px] flex flex-col xl:flex-row gap-6 md:gap-0">
          <div className="flex-1 flex justify-center items-center relative">
            {/* Donut Chart */}
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: 10, color: "#0A81D1" },
                    { id: 1, value: 5, color: "#FF793F" },
                    { id: 2, value: 5, color: "#4CBC9A" },
                  ],
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
              <p className="text-xl font-poppins-bold">₹ 20M</p>
              <p className="text-sm text-textGray2 text-center leading-4">
                Fees Payment <br /> Mode
              </p>
            </div>
          </div>

          {/* Custom Right Legend */}
          <div className="flex flex-col justify-center gap-6 w-full xl:w-auto">
            {/* UPI */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-md bg-backgroundOrange bg-opacity-15 flex justify-center items-center">
                <img
                  src={upi}
                  alt="upi"
                  className="w-[34px] h-[22px] object-contain"
                />
              </div>
              <div className="text-[15px] font-poppins-bold">
                <p className="text-textPrimary">₹ 10M</p>
                <p className="text-textOrange2">UPI</p>
              </div>
            </div>

            {/* Net Banking */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-md bg-backgroundBlue bg-opacity-15 flex justify-center items-center">
                <img
                  src={netbanking}
                  alt="upi"
                  className="size-[32px] object-contain"
                />
              </div>
              <div className="text-[15px] font-poppins-bold">
                <p className="text-textPrimary">₹ 5M</p>
                <p className="text-textBlue">Net Banking</p>
              </div>
            </div>

            {/* Credit Card */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-md bg-white bg-opacity-15 flex justify-center items-center">
                <img
                  src={creditcard}
                  alt="upi"
                  className="size-6 object-contain"
                />
              </div>
              <div className="text-[15px] font-poppins-bold">
                <p className="text-textPrimary">₹ 5M</p>
                <p className="text-textPrimary">Credit Card</p>
              </div>
            </div>
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
            5M pending in this month
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
                  ₹ 20M
                </p>
              </div>

              {/* Right Pie Chart */}
              <div className="flex justify-center items-center">
                <PieChart
                  series={[
                    {
                      data: [
                        { id: 0, value: 80, color: "#4CCB6A" },
                        { id: 1, value: 20, color: "#3b3b3b" },
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
                  ₹ 500,000
                </p>
              </div>

              <div>
                <PieChart
                  series={[
                    {
                      data: [
                        { id: 0, value: 40, color: "#FACC15" },
                        { id: 1, value: 60, color: "#3b3b3b" },
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
                  ₹ 100,000
                </p>
              </div>

              <div>
                <PieChart
                  series={[
                    {
                      data: [
                        { id: 0, value: 30, color: "#EF4444" },
                        { id: 1, value: 70, color: "#3b3b3b" },
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
                  data: [
                    20000, 35000, 45000, 90000, 75000, 60000, 70000, 65000,
                    55000, 60000, 45000, 50000,
                  ],
                  color: "#0A81D1",
                  curve: "natural",
                  showMark: false,
                  strokeWidth: 3,
                },
              ]}
              xAxis={[
                {
                  id: "months",
                  data: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
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
