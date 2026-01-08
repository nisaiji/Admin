import React, { useEffect, useState } from "react";
import collected from "../../../assets/images/fees/collected.png";
import pending from "../../../assets/images/fees/pending.png";
import due from "../../../assets/images/fees/task-due.png";
import { BarChart, } from "@mui/x-charts";
import dots from "../../../assets/images/fees/dots.png";
import {
  Box,
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useTranslation } from "react-i18next";
import {
  BlueCard,
  GreenCard,
  OrangeCard,
  RedCard,
  WhiteCard,
} from "../TopCard";
import { useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";

export default function RefundAndFailedTransition() {
  const isDarkMode = true;
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [t] = useTranslation();
  const [view, setView] = useState("yearly");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const [refundSummary, setRefundSummary] = useState([]);
  const [refundCharts, setRefundCharts] = useState([]);
  const [refundTransactions, setRefundTransactions] = useState([]);
  const [filterClass, setFilterClass] = useState(null);

  const getRefundSummary = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_REFUND_AND_FAILED_SUMMARY}?sessionID=${classAndSectionData?.selectedSession?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setRefundSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };
  const getRefundCharts = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_REFUND_AND_FAILED_CHART}?sessionID=${classAndSectionData?.selectedSession?._id}&classID=${filterClass?._id}&periodType=${view}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setRefundCharts(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };
  const getRefundTransactions = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_REFUND_AND_FAILED_TRANSACTIONS}?sessionID=${classAndSectionData?.selectedSession?._id}&classID=${filterClass?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setRefundTransactions(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    if (filterClass?._id) {
      getRefundSummary();
      getRefundCharts();
      getRefundTransactions();
    }
  }, [filterClass]);

  useEffect(() => {
    if (filterClass?._id) {
      getRefundCharts();
    }
  }, [view]);

  useEffect(() => {
    if (!classAndSectionData?.classList?.length) return;

    const defaultClass = classAndSectionData?.classList[0];

    setFilterClass(defaultClass);
  }, [classAndSectionData]);

  const gradients = [
    ["#B3F2CA", "#53BE7A"],
    ["#FE4040", "#BA2C2C"],
    ["#0A81D1", "#4CBC9A"],
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

  return (
    <>
      {/* Total Collected Fees */}
      <div className="grid grid-cols-4 gap-4 my-6">
        <WhiteCard
          img={collected}
          heading="Total Expected"
          title1={`₹ ${refundSummary?.totalExpected?.amount ?? 0}`}
          title2={refundSummary?.totalExpected?.students ?? 0}
        />
        <BlueCard
          img={collected}
          heading="Total Collected"
          title1={`₹ ${refundSummary?.totalCollected?.amount ?? 0}`}
          title2={refundSummary?.totalCollected?.students ?? 0}
        />
        <OrangeCard
          img={pending}
          heading="Refunded Amount"
          title1={`₹ ${refundSummary?.refunded?.amount ?? 0}`}
          title2={refundSummary?.refunded?.transactions ?? 0}
        />
        <RedCard
          img={due}
          heading="Failed Amount"
          title1={`₹ ${refundSummary?.failed?.amount ?? 0}`}
          title2={refundSummary?.failed?.transactions ?? 0}
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
          <div className="space-x-4">
            <select
              value={filterClass?._id || ""}
              onChange={(e) => {
                const selected = classAndSectionData?.classList?.find(
                  (cls) => cls._id === e.target.value
                );
                setFilterClass(selected);
              }}
              className="w-40 pl-4 pr-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white appearance-none"
            >
              {classAndSectionData?.classList?.map((cls) => (
                <option key={cls?._id} value={cls?._id}>
                  {cls?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex w-full justify-center items-center">
          <div className="border-b border-backgroundGray15">
            <button
              type="button"
              onClick={() => setView("yearly")}
              className={` text-base font-poppins-bold py-2 w-40 ${
                view === "yearly"
                  ? "text-textOrange bg-backgroundOrange1 border-b-2 border-backgroundOrange1 rounded-md bg-opacity-5"
                  : "text-textPrimary"
              }`}
            >
              Yearly
            </button>
            <button
              type="button"
              onClick={() => setView("monthly")}
              className={` text-base font-poppins-bold py-2 w-40 ${
                view === "monthly"
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
          <Box sx={{ width: "100%", height: 350 }}>
            <BarChart
              xAxis={[
                {
                  data: refundCharts?.map((item) =>
                    view === "monthly" ? item?.period : item?.label
                  ),
                  tickLabelStyle: { fill: "#fff" },
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: { fill: "#fff" },
                },
              ]}
              series={[
                {
                  label: "Refunded",
                  data: refundCharts?.map((item) => item?.refunded),
                  color: `url(#gradient-0)`,
                },
                {
                  label: "Failed",
                  data: refundCharts?.map((item) => item?.failed),
                  color: `url(#gradient-1)`,
                },
              ]}
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
          </Box>
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
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-textBlue text-base font-poppins-bold">
              <tr className="border-b border-gray-500/30 bg-[#686868] bg-opacity-5 text-center">
                <th className="py-4 px-2">Transaction ID</th>
                <th className="py-4 px-2">Student</th>
                <th className="py-4 px-2">Class</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Date and Time</th>
                <th className="py-4 px-2">Mode</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {refundTransactions?.data?.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                >
                  <td className="py-4 px-2">{item?.transactionId}</td>
                  <td className="py-4 px-2">{item?.studentName}</td>
                  <td className="py-4 px-2">{item?.class}</td>
                  <td className="py-4 px-2">{item?.amount}</td>
                  <td className="py-4 px-2">{item?.dateTime}</td>
                  <td className="py-4 px-2">{item?.mode}</td>
                  <td
                    className={`py-4 px-2 ${
                      item?.status === "REFUNDED"
                        ? "text-textGreen"
                        : item?.status === "FAILED"
                        ? "text-textRed"
                        : ""
                    }`}
                  >
                    {item?.status}
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
