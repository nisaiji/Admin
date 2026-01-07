import React, { useEffect, useState } from "react";
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
import BarChartComponent from "../BarChart";
import { useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";

export default function PeriodicView() {
  const isDarkMode = true;
  const [t] = useTranslation();
  const [view, setView] = useState("yearly");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
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

  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [periodicSummary, setPeriodicSummary] = useState([]);
  const [periodicChart, setPeriodicChart] = useState([]);
  const [periodicTransactions, setPeriodicTransactions] = useState([]);

  const getPeriodicSummary = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_PERIODICALLY_SUMMARY}?sessionID=${classAndSectionData?.selectedSession?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setPeriodicSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getPeriodicChart = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_PERIODICALLY_CHART}?sessionID=${classAndSectionData?.selectedSession?._id}&periodType=${view}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setPeriodicChart(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getPeriodicTransactions = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_PERIODICALLY_TRANSACTIONS}?sessionID=${classAndSectionData?.selectedSession?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setPeriodicTransactions(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    getPeriodicSummary();
  }, []);

  useEffect(() => {
    getPeriodicChart();
    getPeriodicTransactions();
  }, [view]);

  return (
    <>
      {/* Total Collected Fees */}
      <div className="grid grid-cols-4 gap-4 my-6">
        <WhiteCard
          img={collected}
          heading="Total Expected"
          title1={`₹ ${periodicSummary?.totalExpected?.amount ?? 0}`}
          title2={periodicSummary?.totalExpected?.students ?? 0}
        />
        <BlueCard
          img={collected}
          heading="Total Collected"
          title1={`₹ ${periodicSummary?.totalCollected?.amount ?? 0}`}
          title2={periodicSummary?.totalCollected?.students ?? 0}
        />
        <OrangeCard
          img={pending}
          heading="Pending Payments"
          title1={`₹ ${periodicSummary?.pendingPayments?.amount ?? 0}`}
          title2={periodicSummary?.pendingPayments?.students ?? 0}
        />
        <GreenCard
          img={refund}
          heading="Refunded Amount"
          title1={`₹ ${periodicSummary?.refundedAmount?.amount ?? 0}`}
          title2={periodicSummary?.refundedAmount?.students ?? 0}
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
          {/* <SessionDropdaown /> */}
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
          <BarChartComponent
            xAxisData={periodicChart?.map((item) =>
              view === "yearly" ? item?.label : item?.period
            )}
            series={periodicChart?.map((item) => item?.collected)}
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
                <th className="py-4 px-2">Year</th>
                <th className="py-4 px-2">Fees Expected</th>
                <th className="py-4 px-2">Fees Collected</th>
                <th className="py-4 px-2">Familiar Mode</th>
                <th className="py-4 px-2">Refund</th>
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {periodicTransactions?.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                >
                  <td className="py-4 px-2">{item?.year}</td>
                  <td className="py-4 px-2">{item?.feesExpected}</td>
                  <td className="py-4 px-2 text-textGreen">
                    {item?.feesCollected}
                  </td>
                  <td className="py-4 px-2">{item?.familiarMode}</td>
                  <td className="py-4 px-2">{item?.refunds}</td>
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
