import React, { useEffect, useState } from "react";
import collected from "../../../assets/images/fees/collectedinvert.png";
import pending from "../../../assets/images/fees/pending.png";
import paymentgreen from "../../../assets/images/fees/paymentgreen.png";
import calred from "../../../assets/images/fees/calred.png";
import {
  PieChart,
} from "@mui/x-charts";
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
import {
  BlueCard,
  GreenCard,
  OrangeCard,
  RedCard,
  WhiteCard,
} from "../TopCard";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { useSelector } from "react-redux";

export default function FeeSummaryView() {
  const isDarkMode = true;
  const [t] = useTranslation();
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const [feeSummary, setFeeSummary] = useState([]);
  const [feeTransactions, setFeeTransactions] = useState([]);
  const [filterClass, setFilterClass] = useState(null);

  const getFeeSummary = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_REPORT_FEE_SUMMARY}?sessionID=${classAndSectionData?.selectedSession?._id}&classID=${filterClass?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setFeeSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const getFeeTransactions = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_REPORT_FEE_TRANSACTIONS}?sessionID=${classAndSectionData?.selectedSession?._id}&classID=${filterClass?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setFeeTransactions(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    if (filterClass?._id) {
      getFeeSummary();
      getFeeTransactions();
    }
  }, [filterClass]);

  useEffect(() => {
    if (!classAndSectionData?.classList?.length) return;

    const defaultClass = classAndSectionData?.classList[0];

    setFilterClass(defaultClass);
  }, [classAndSectionData]);

  return (
    <>
      {/* PIE CHART */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Payment Mode</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Total number of fees collected by different mode of payment
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
        <div className="w-full flex justify-evenly items-center">
          <div className="flex justify-center items-center relative">
            {/* Donut Chart */}
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      value: feeSummary?.totalCollected?.amount ?? 0,
                      color: "#0A81D1",
                    },
                    {
                      id: 1,
                      value: feeSummary?.pending?.amount ?? 0,
                      color: "#FF793F",
                    },
                    {
                      id: 2,
                      value: feeSummary?.overdue?.amount ?? 0,
                      color: "#4CBC9A",
                    },
                  ],
                  innerRadius: 100,
                  outerRadius: 150,
                },
              ]}
              width={300}
              height={300}
              slotProps={{
                legend: { hidden: true }, // hide default legend
              }}
            />

            {/* Center Text */}
            <div className="absolute flex flex-col justify-center items-center">
              <p className="text-xl font-poppins-bold">₹ {feeSummary?.totalFees ?? 0}</p>
              <p className="text-sm text-textGray2 text-center leading-4">
                Fees Payment <br /> Mode
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 w-[600px] gap-4">
            <BlueCard
              img={collected}
              heading="Total Expected"
              title1={`₹ ${feeSummary?.totalExpected?.amount ?? 0}`}
              title2={feeSummary?.totalExpected?.students ?? 0}
              bg="bg-[#2b2b2b]"
            />
            <GreenCard
              img={paymentgreen}
              heading="Total Collected"
              title1={`₹ ${feeSummary?.totalCollected?.amount ?? 0}`}
              title2={feeSummary?.totalCollected?.students ?? 0}
              bg="bg-[#2b2b2b]"
            />
            <OrangeCard
              img={pending}
              heading="Pending Payment"
              title1={`₹ ${feeSummary?.pending?.amount ?? 0}`}
              title2={feeSummary?.pending?.students ?? 0}
              bg="bg-[#2b2b2b]"
            />
            <RedCard
              img={calred}
              heading="Overdue Payment"
              title1={`₹ ${feeSummary?.overdue?.amount ?? 0}`}
              title2={feeSummary?.overdue?.students ?? 0}
              bg="bg-[#2b2b2b]"
            />
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Outstanding Fees & Overdue Students
            </p>
          </div>
        </div>
        <div className="w-full rounded-xl overflow-hidden"></div>
        <div className="w-full rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-textBlue text-base font-poppins-bold">
              <tr className="border-b border-gray-500/30 bg-[#686868] bg-opacity-5 text-center">
                <th className="py-4 px-2">Student</th>
                <th className="py-4 px-2">Class</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Due Date</th>
                <th className="py-4 px-2">Over Due</th>
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {feeTransactions?.data?.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                >
                  <td className="py-4 px-2">{item?.studentName}</td>
                  <td className="py-4 px-2">{item?.class}</td>
                  <td className="py-4 px-2">{item?.amount}</td>
                  <td
                    className={`py-4 px-2 font-semibold text-textOrange ${item?.statusColor}`}
                  >
                    {item?.dueDate}
                  </td>
                  <td className="py-4 px-2">{item?.daysOverdue}</td>
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
