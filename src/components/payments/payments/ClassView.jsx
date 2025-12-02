import React from "react";
import collected from "../../../assets/images/fees/collected.png";
import pending from "../../../assets/images/fees/pending.png";
import due from "../../../assets/images/fees/due.png";
import SessionDropdaown from "../SessionDropdaown";
import {
  BarChart,
  barClasses,
  barElementClasses,
  PieChart,
} from "@mui/x-charts";

export default function ClassView({ setSelectedView }) {
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

  const selectedClass = "3"; // from dropdown
  const sections = classSections[selectedClass];

  // 🔥 Each section gets 12 values (one for each month)
  const sectionValues = sections.map(() =>
    Array.from({ length: 12 }, () => Math.floor(Math.random() * 90000) + 10000)
  );

  // 🔥 Each section becomes a bar series
  const barSeries = sections.map((sec, index) => ({
    label: sec,
    id: `section-${sec}`,
    data: sectionValues[index],
    color: `url(#gradient-${index})`,
  }));

  const feesData = [
    {
      section: "A",
      months: {
        Jan: "₹7000",
        Feb: "₹6200",
        Mar: "₹5000",
        Apr: "₹7200",
        May: "₹8000",
        Jun: "₹6500",
        Jul: "₹4000",
        Aug: "₹9000",
        Sep: "₹7800",
        Oct: "₹7100",
        Nov: "₹6900",
        Dec: "₹8100",
      },
    },
    {
      section: "B",
      months: {
        Jan: "₹6000",
        Feb: "₹5800",
        Mar: "₹5000",
        Apr: "₹6500",
        May: "₹7000",
        Jun: "₹6800",
        Jul: "₹4500",
        Aug: "₹8200",
        Sep: "₹7000",
        Oct: "₹6600",
        Nov: "₹6400",
        Dec: "₹7800",
      },
    },
    {
      section: "C",
      months: {
        Jan: "₹5500",
        Feb: "₹5200",
        Mar: "₹4800",
        Apr: "₹6000",
        May: "₹6500",
        Jun: "₹6300",
        Jul: "₹4200",
        Aug: "₹7800",
        Sep: "₹7200",
        Oct: "₹6900",
        Nov: "₹6700",
        Dec: "₹7600",
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
      <p className="text-xl font-poppins-bold">Payment Overview</p>

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

      {/* BAR CHART */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Total Fee Collection</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Total number of fees collected this month
            </p>
          </div>
          <SessionDropdaown />
        </div>

        {/* MIDDLE SECTION */}
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
                tickLabelStyle: { fill: "#fff" },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: { fill: "#fff" },
              },
            ]}
            series={barSeries}
            sx={{
              // Rounded bars
              [`& .${barElementClasses.root}`]: {
                rx: 4,
              },

              // Axis lines
              "& .MuiChartsAxis-line": {
                stroke: "#fff !important",
              },

              // Axis tick lines
              "& .MuiChartsAxis-tick": {
                stroke: "#fff !important",
              },

              // ✅ FORCE LABELS TO BE SOLID WHITE
              "& text": {
                fill: "#fff !important",
                opacity: "1 !important",
              },

              // Legend
              "& .MuiChartsLegend-root text": {
                fill: "#fff !important",
              },
            }}

            // sx={{
            //   [`& .${barElementClasses.root}`]: {
            //     rx: 4, // rounded corners
            //   },
            //   "& .MuiChartsLegend-root text": {
            //     fill: "white",
            //   },
            //   "& .MuiChartsAxis-line": {
            //     stroke: "#fff !important",
            //   },
            //   "& .MuiChartsAxis-tick": {
            //     stroke: "#fff !important",
            //   },
            // }}
          >
            {/* GRADIENTS */}
            <defs>
              {gradients.map((g, index) => (
                <linearGradient
                  key={index}
                  id={`gradient-${index}`}
                  gradientTransform="rotate(90)"
                >
                  <stop offset="0%" stopColor={g[0]} />
                  <stop offset="100%" stopColor={g[1]} />
                </linearGradient>
              ))}
            </defs>
          </BarChart>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="">
        {/* Monthly Fee Trends */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] min-h-[260px]">
          <h3 className="text-lg font-poppins-bold">Transactions</h3>
          <p className="text-sm font-poppins-regular text-textGray2 mb-4">
            Class-Wise Payments
          </p>
          <div className="w-full rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                  <th className="py-4 px-2">Class</th>
                  {months.map((m) => (
                    <th key={m} className="py-4 px-2">
                      {m}
                    </th>
                  ))}
                  <th className="py-4 px-2">Action</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {feesData.map((item) => (
                  <tr
                    key={item}
                    className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                  >
                    {/* CLASS + SECTION */}
                    <td className="py-4 px-2">
                      {selectedClass}{" "}
                      <span className="text-textGray2 text-sm">
                        {item.section}
                      </span>
                    </td>

                    {/* MONTHS */}
                    {months?.map((m) => (
                      <td key={m} className="py-4 px-2">
                        <span className="text-[#4CBC9A] text-sm">
                          {/* {feesData[selectedClass][section]?.[m] ?? "--"} */}
                          {item.months[m]}
                        </span>
                      </td>
                    ))}

                    {/* ACTION BUTTON */}
                    <td className="py-4 px-2">
                      <button
                        type="button"
                        onClick={() => setSelectedView("section")}
                        className="bg-blue-500 text-white text-sm px-4 py-1 rounded-md"
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
