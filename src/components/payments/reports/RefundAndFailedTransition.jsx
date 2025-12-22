import React, { useState } from "react";
import collected from "../../../assets/images/fees/collected.png";
import pending from "../../../assets/images/fees/pending.png";
import due from "../../../assets/images/fees/due.png";
import refund from "../../../assets/images/fees/refund.png";
import classimg from "../../../assets/images/fees/class.png";
import paymentgreen from "../../../assets/images/fees/paymentgreen.png";
import graphup from "../../../assets/images/fees/graphup.png";
import graphdown from "../../../assets/images/fees/graphdown.png";
import SessionDropdaown from "../SessionDropdaown";
import { BarChart, barClasses, barElementClasses } from "@mui/x-charts";
import dots from "../../../assets/images/fees/dots.png";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useTranslation } from "react-i18next";
import { BlueCard, GreenCard, OrangeCard, WhiteCard } from "../TopCard";

export default function RefundAndFailedTransition() {
  const isDarkMode = true;
  const [t] = useTranslation();
  const [view, setView] = useState("year");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);

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

  const selectedClass = "2"; // from dropdown
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

  const data = [
    {
      year: "2024",
      expectedfees: "₹ 700000",
      collectedfees: "₹ 700000",
      mode: "UPI",
      refund: "₹ 20000",
    },
    {
      year: "2025",
      expectedfees: "₹ 700000",
      collectedfees: "₹ 700000",
      mode: "UPI",
      refund: "₹ 20000",
    },
  ];
  return (
    <>
      {/* Total Collected Fees */}
      <div className="grid grid-cols-4 gap-4 my-6">
        <WhiteCard
          img={collected}
          heading="Highest Collection"
          title1="₹ 500000"
          title2="1 st"
        />
        <BlueCard
          img={collected}
          heading="Highest Collection"
          title1="₹ 500000"
          title2="1 st"
        />
        <OrangeCard
          img={pending}
          heading="Lowest Collection"
          title1="₹ 50000"
          title2="2 nd"
        />
        <GreenCard
          img={refund}
          heading="Overall Paid"
          title1="₹ 500000"
          title2="₹ 50000"
        />
      </div>
      {/* BAR CHART */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">
              Class-Wise Fee Collection
            </h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Total number of fees collected this month
            </p>
          </div>
          <SessionDropdaown />
        </div>

        <div className="flex w-full justify-center items-center">
          <div className="border-b border-backgroundGray15">
            <button
              type="button"
              onClick={() => setView("year")}
              className={` text-base font-poppins-bold py-2 w-40 ${
                view === "year"
                  ? "text-textOrange bg-backgroundOrange1 border-b-2 border-backgroundOrange1 rounded-md bg-opacity-5"
                  : "text-textPrimary"
              }`}
            >
              Yearly
            </button>
            <button
              type="button"
              onClick={() => setView("month")}
              className={` text-base font-poppins-bold py-2 w-40 ${
                view === "month"
                  ? "text-textOrange bg-backgroundOrange1 border-b-2 border-backgroundOrange1 rounded-md bg-opacity-5"
                  : "text-textPrimary"
              }`}
            >
              Monthly
            </button>
          </div>
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

      {/* transition table */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Class Wise payments
            </p>
          </div>
          <SessionDropdaown />
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-textBlue text-base font-poppins-bold">
              <tr className="border-b border-gray-500/30 bg-[#686868] bg-opacity-5 text-center">
                <th className="py-4 px-2">Year</th>
                <th className="py-4 px-2">Fees Expected</th>
                <th className="py-4 px-2">Fees Collected</th>
                <th className="py-4 px-2">Familiar Mode</th>
                <th className="py-4 px-2">Refund</th>
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                >
                  <td className="py-4 px-2">{item.year}</td>
                  <td className="py-4 px-2">{item.expectedfees}</td>
                  <td className="py-4 px-2 text-textGreen">
                    {item.collectedfees}
                  </td>
                  <td className="py-4 px-2">{item.mode}</td>
                  <td className="py-4 px-2">{item.refund}</td>
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
        {/* pagination logic */}
        <div
          className={`flex gap-5 justify-between items-center my-9 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full`}
        >
          <div className={`text-[#9391a5] text-base leading-5`}>
            {t("titles.showing")}
            <span className={`text-textBlue`}>
              {" "}
              {pageNo * limit - (limit - 1)} -{" "}
              {Math.min(totalRequestCount, pageNo * limit)}{" "}
            </span>
            {t("titles.from")}
            <span className={`text-textBlue`}> {totalRequestCount} </span>
            {t("titles.data")}
          </div>

          <div className={`flex items-center gap-4`}>
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                minWidth: "80px",
                backgroundColor: isDarkMode ? "" : "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiInputBase-root, & .MuiSvgIcon-root": {
                  color: isDarkMode ? "#E3E8F3" : "black",
                },
              }}
            >
              <Select
                value={limit}
                onChange={(e) => {
                  setLimit(e.target.value);
                  setPageNo(1);
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                  },
                }}
              >
                {[10, 20, 25, 50, 100].map((itm, i) => (
                  <MenuItem
                    key={i}
                    value={itm}
                    sx={{
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      color: isDarkMode ? "#E3E8F3" : "black",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                      },
                    }}
                  >
                    {itm}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(totalRequestCount / limit)}
                shape="rounded"
                page={pageNo}
                onChange={(e) => setPageNo(e.target.value)}
                renderItem={(item) => (
                  <PaginationItem
                    {...item}
                    sx={{
                      color: isDarkMode ? "white" : "black",
                      borderColor:
                        item.type === "previous" || item.type === "next"
                          ? "transparent"
                          : "#0F4189",
                      borderWidth: "2px",
                      borderRadius: "20px",
                      borderStyle: "solid",
                      "&.Mui-selected": {
                        color: "white",
                        backgroundColor: "#0F4189",
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </div>
        </div>
      </div>
    </>
  );
}
