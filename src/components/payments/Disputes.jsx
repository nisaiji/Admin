import { PieChart } from "@mui/x-charts";
import React from "react";
import retry from "../../assets/images/fees/retry.png";
import refund from "../../assets/images/fees/refund.png";
import cancel from "../../assets/images/fees/cancel.png";
import dots from "../../assets/images/fees/dots.png";
import SessionDropdaown from "./SessionDropdaown";

export default function Disputes() {
  const data = [
    {
      id: "12128CNN",
      student: "Anushka Mishra",
      class: "1 A",
      amount: "₹ 7000",
      reason: "Failed",
      dispute: "Failed",
      status: "Under Review",
      statusColor: "text-orange-400",
    },
    {
      id: "123FRT67",
      student: "Vaibhav Trivedi",
      class: "2 B",
      amount: "₹ 8000",
      reason: "Wrong Amount",
      dispute: "Failed",
      status: "Rejected",
      statusColor: "text-red-500",
    },
    {
      id: "563YTU86",
      student: "Janvi Mittal",
      class: "11 B",
      amount: "₹ 24000",
      reason: "Technical Error",
      dispute: "Failed",
      status: "Resolved",
      statusColor: "text-green-400",
    },
    {
      id: "87HSB678",
      student: "Chetan Pandey",
      class: "8 C",
      amount: "₹ 11000",
      reason: "Refund Request",
      dispute: "Failed",
      status: "Refunded",
      statusColor: "text-green-400",
    },
  ];

  return (
    <div className="p-6 w-full text-textPrimary">
      <p className="text-2xl text-textPrimary font-poppins-bold mb-4">
        Disputes and Refunds
      </p>
      {/* Refund Amount Collection */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <h3 className="text-lg font-poppins-bold">
          Refunded Amount, Failed Amount, Cancelled Refunds
        </h3>
        <p className="text-sm font-poppins-regular text-textGray2 mb-4">
          20 payments pending
        </p>
        <div className="grid grid-cols-4 gap-4 my-6">
          {/* ==== Pending Card ==== */}
          <div className="bg-[#2b2b2b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="px-3 py-1 bg-backgroundGray15 rounded-lg flex items-center gap-2 w-fit">
                <img src={retry} alt="r" className="size-5 object-contain" />
                <span className="text-textOrange2 font-poppins-regular text-sm">
                  Failed
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
          {/* === Paid Card === */}
          <div className="bg-[#2b2b2b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Side */}
            <div className="space-y-2">
              {/* Status Badge */}
              <div className="px-3 py-1 bg-backgroundGray15 rounded-lg flex items-center gap-2 w-fit">
                <img src={refund} alt="r" className="size-5 object-contain" />
                <span className="text-textGreen font-poppins-regular text-sm">
                  Refunded
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

          {/* ==== Overdue Card ==== */}
          <div className="bg-[#2b2b2b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="px-3 py-1 bg-backgroundGray15 rounded-lg flex items-center gap-2 w-fit">
                <img src={cancel} alt="r" className="size-6 object-contain" />
                <span className="text-textRed font-poppins-regular text-sm">
                  Cancelled Refunds
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

      {/* transition table */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Disputes and its status
            </p>
          </div>
          <SessionDropdaown />
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-textBlue text-base font-poppins-bold">
              <tr className="border-b border-gray-500/30 bg-[#686868] bg-opacity-5 text-center">
                <th className="py-4 px-2">Transaction ID</th>
                <th className="py-4 px-2">Student</th>
                <th className="py-4 px-2">Class</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Reason</th>
                <th className="py-4 px-2">Dispute</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                >
                  <td className="py-4 px-2">{item.id}</td>
                  <td className="py-4 px-2">{item.student}</td>
                  <td className="py-4 px-2">{item.class}</td>
                  <td className="py-4 px-2">{item.amount}</td>
                  <td className="py-4 px-2">{item.reason}</td>
                  <td className="py-4 px-2 text-red-500">{item.dispute}</td>
                  <td className={`py-4 px-2 font-semibold ${item.statusColor}`}>
                    {item.status}
                  </td>
                  <td className="py-4 px-2 flex justify-center cursor-pointer">
                    <img
                      src={dots}
                      className="h-[22px] w-[4px] object-contain"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
