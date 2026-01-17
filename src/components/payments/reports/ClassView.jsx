import React, { useEffect, useState } from "react";
import classimg from "../../../assets/images/fees/class.png";
import paymentgreen from "../../../assets/images/fees/paymentgreen.png";
import graphup from "../../../assets/images/fees/graphup.png";
import graphdown from "../../../assets/images/fees/graphdown.png";
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
import { BlueCard, GreenCard, RedCard, WhiteCard } from "../TopCard";
import BarChartComponent from "../BarChart";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { useSelector } from "react-redux";
import TransactionModal from "../TransitionPopup";

export default function ClassView() {
  const { classAndSectionData, data } = useSelector((state) => state.appAuth);
  const isDarkMode = true;
  const [t] = useTranslation();
  const [open, setOpen] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);

  const [filterClass, setFilterClass] = useState(null);
  const [classWiseSummary, setClassWiseSummary] = useState([]);
  const [classWiseChart, setClassWiseChart] = useState([]);
  const [classWiseTransactions, setClassWiseTransactions] = useState([]);

  const getClassWiseSummary = async () => {
    try {
      // console.log("classAndSectionData", classAndSectionData);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_CLASS_WISE_SUMMARY}?sessionID=${classAndSectionData?.selectedSession?._id}&school=${data?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setClassWiseSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getClassWiseChart = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_CLASS_WISE_CHART}?sessionID=${classAndSectionData?.selectedSession?._id}&school=${data?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setClassWiseChart(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getClassWiseTransactions = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_CLASS_WISE_TRANSACTIONS}?sessionID=${classAndSectionData?.selectedSession?._id}&school=${data?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setClassWiseTransactions(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    getClassWiseSummary();
    getClassWiseChart();
    getClassWiseTransactions();
  }, []);

  return (
    <>
      {/* Section 1 */}
      <div className="grid grid-cols-4 gap-4 my-6">
        <WhiteCard
          img={classimg}
          heading="Total Classes"
          title1={classWiseSummary?.totalClasses ?? 0}
        />
        <BlueCard
          img={graphup}
          heading="Highest Collection"
          title1={`₹ ${classWiseSummary?.highestCollection?.amount ?? 0}`}
          title2={classWiseSummary?.highestCollection?.class ?? "NA"}
        />
        <RedCard
          img={graphdown}
          heading="Lowest Collection"
          title1={`₹ ${classWiseSummary?.lowestCollection?.amount ?? 0}`}
          title2={classWiseSummary?.lowestCollection?.class ?? "NA"}
        />
        <GreenCard
          img={paymentgreen}
          heading="Overall Paid"
          title1={`₹ ${classWiseSummary?.overallPaid?.totalExpected ?? 0}`}
          title2={`₹ ${classWiseSummary?.overallPaid?.totalCollected ?? 0}`}
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

        {/* MIDDLE SECTION */}
        <div className="w-full h-[350px] flex justify-center items-center">
          <BarChartComponent
            xAxisData={classWiseChart?.map((item) => item?.class)}
            series={classWiseChart?.map((item) => item?.amount)}
          />
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
          {/* <SessionDropdaown /> */}
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-textBlue text-base font-poppins-bold">
              <tr className="border-b border-gray-500/30 bg-[#686868] bg-opacity-5 text-center">
                <th className="py-4 px-2">Class</th>
                <th className="py-4 px-2">Total Fees</th>
                <th className="py-4 px-2">Paid</th>
                <th className="py-4 px-2">Pending</th>
                <th className="py-4 px-2">No of Paid</th>
                <th className="py-4 px-2">No of Unpaid</th>
                <th className="py-4 px-2">Due Date</th>
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {classWiseTransactions?.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                >
                  <td className="py-4 px-2">{item.class}</td>
                  <td className="py-4 px-2">{item.totalFees}</td>
                  <td className="py-4 px-2">{item.paidFees}</td>
                  <td className="py-4 px-2">{item.pendingFees}</td>
                  <td className="py-4 px-2">{item.paidCount}</td>
                  <td className="py-4 px-2 text-textOrange">
                    {item.unPaidCount}
                  </td>
                  <td className={`py-4 px-2 font-semibold ${item.statusColor}`}>
                    {item.dueDate}
                  </td>
                  <td className="py-4 px-2">
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
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
      <TransactionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
