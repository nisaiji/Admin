import React from "react";
import collected from "../../../assets/images/fees/collected.png";
import pending from "../../../assets/images/fees/pending.png";
import due from "../../../assets/images/fees/due.png";
import retry from "../../../assets/images/fees/retry.png";
import refund from "../../../assets/images/fees/refund.png";
import cancel from "../../../assets/images/fees/cancel.png";
import SessionDropdaown from "../SessionDropdaown";
import {
  BarChart,
  barClasses,
  barElementClasses,
  PieChart,
} from "@mui/x-charts";

export default function SectionView({ setSelectedView }) {
  // 8 gradients for 8 maximum sections
  const gradients = [
    ["#8ADEC5", "#4B786B"],
    ["#09F1F5", "#058D8F"],
    ["#1697CB", "#0B4B65"],
    ["#FF9933", "#995C1F"],
    ["#F15613", "#8B320B"],
    ["#B4221A", "#4E0F0B"],
    ["#0A81D1", "#05426B"],
    ["#025994", "#011C2E"],
  ];

  const classSections = {
    1: ["A", "B", "C"],
    2: ["A", "B"],
    3: ["A", "B", "C", "D"],
    4: ["A", "B", "C", "D", "E"],
    5: ["A", "B", "C", "D", "E", "F"],
    6: ["A", "B", "C", "D", "E", "F", "G"],
    7: ["A", "B", "C", "D", "E", "F", "G", "H"],
  };

  const selectedClass = "7"; // from dropdown
  const sections = classSections[selectedClass];

  // STUDENT PAYMENT DATA
  const students = [
    {
      name: "Rohit Sharma",
      status: {
        Jan: "paid",
        Feb: "unpaid",
        Mar: "paid",
        Apr: "paid",
        May: "unpaid",
        Jun: "paid",
        Jul: "paid",
        Aug: "unpaid",
        Sep: "paid",
        Oct: "paid",
        Nov: "unpaid",
        Dec: "paid",
      },
    },
    {
      name: "Anita Verma",
      status: {
        Jan: "paid",
        Feb: "paid",
        Mar: "paid",
        Apr: "unpaid",
        May: "unpaid",
        Jun: "paid",
        Jul: "paid",
        Aug: "paid",
        Sep: "paid",
        Oct: "unpaid",
        Nov: "unpaid",
        Dec: "paid",
      },
    },
    {
      name: "Karan Singh",
      status: {
        Jan: "unpaid",
        Feb: "unpaid",
        Mar: "paid",
        Apr: "paid",
        May: "paid",
        Jun: "unpaid",
        Jul: "paid",
        Aug: "paid",
        Sep: "unpaid",
        Oct: "paid",
        Nov: "paid",
        Dec: "unpaid",
      },
    },
  ];

  const months = [
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
  ];

  return (
    <div className="p-6 w-full text-white">
      <p className="text-sm font-poppins-bold">Payments</p>

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
            <p className="text-lg font-poppins-bold mt-1">₹ 2000000</p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Total Collected Fees
          </p>
          <p className="text-base font-poppins-bold text-textBlue mt-1">
            +18.2%{" "}
            <span className="text-textGray2 text-xs font-poppins-regular">
              than last week
            </span>
          </p>
        </div>

        {/* Pending */}
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
            <span className="text-textGray2 text-xs font-poppins-regular">
              than last week
            </span>
          </p>
        </div>

        {/* Overdue */}
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
            <span className="text-textGray2 text-xs font-poppins-regular">
              than last week
            </span>
          </p>
        </div>
      </div>

      {/* Refund Amount Collection */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <h3 className="text-lg font-poppins-bold">Overdue, Pending, Paid</h3>
        <p className="text-sm font-poppins-regular text-textGray2 mb-4">
          20 payments pending
        </p>
        <div className="grid grid-cols-4 gap-4 my-6">
          {/* === Paid Card === */}
          <div className="bg-[#2b2b2b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Side */}
            <div className="space-y-2">
              {/* Status Badge */}
              <div className="px-3 py-1 bg-backgroundGray15 rounded-lg flex items-center gap-2 w-fit">
                <img src={refund} alt="r" className="size-5 object-contain" />
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
            <div>
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
                <img src={retry} alt="r" className="size-5 object-contain" />
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
                <img src={cancel} alt="r" className="size-6 object-contain" />
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

      {/* BOTTOM SECTION */}
      <div className="">
        {/* Monthly Fee Trends */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] min-h-[260px]">
          <h3 className="text-lg font-poppins-bold">Transactions</h3>
          <p className="text-sm font-poppins-regular text-textGray2 mb-4">
            Students Paid and Unpaid Status
          </p>

          <div className="w-full rounded-xl overflow-auto">
            <table className="w-full text-left">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                  <th className="py-4 px-2">Student</th>
                  {months.map((m) => (
                    <th key={m} className="py-4 px-2">
                      {m}
                    </th>
                  ))}
                  <th className="py-4 px-2">Action</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {students.map((std, index) => (
                  <tr
                    key={index}
                    className="border-b border-backgroundGray15 text-center text-base font-poppins-medium"
                  >
                    {/* STUDENT NAME */}
                    <td className="py-4 px-2 text-white font-poppins-bold">
                      {std.name}
                    </td>

                    {/* MONTH STATUS */}
                    {months.map((m) => (
                      <td key={m} className="py-4 px-2">
                        <span
                          className={`text-sm font-poppins-bold ${
                            std.status[m] === "paid"
                              ? "text-[#4CBC9A]" // green
                              : "text-[#E45858]" // red
                          }`}
                        >
                          {std.status[m] === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                    ))}

                    {/* ACTION */}
                    <td className="py-4 px-2">
                      <button
                        type="button"
                        onClick={() => setSelectedView("student")}
                        className="bg-backgroundBlue text-textPrimary text-sm px-4 py-1 rounded-md"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
