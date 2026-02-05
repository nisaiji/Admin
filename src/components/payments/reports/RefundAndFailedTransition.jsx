import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  getPaymentStatusColor,
  getPaymentStatusText,
} from "../../../utils/helper";
import { IndianRupee } from "lucide-react";

export default function RefundAndFailedTransition() {
  const [t] = useTranslation();
  const isDarkMode = true;
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const [refundTransactions, setRefundTransactions] = useState([]);
  const [filterClass, setFilterClass] = useState(null);
  const academicStartYear =
    classAndSectionData?.selectedSession?.academicStartYear;

  const getRefundTransactions = async () => {
    try {
      const start = moment(`${academicStartYear}-04-01`);
      const end = moment();
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_TRANSITIONS}?sessionId=${classAndSectionData?.selectedSession?._id}&status=partialRefunded&limit=${limit}&page=${pageNo}&startDate=${start}&endDate=${end}`,
      );
      // console.log(res);
      if (res?.statusCode === 200) {
        setRefundTransactions(res?.result?.transactions);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    if (classAndSectionData?.selectedSession?._id) {
      getRefundTransactions();
    }
  }, [filterClass, pageNo, limit, classAndSectionData]);

  useEffect(() => {
    if (!classAndSectionData?.classList?.length) return;

    const defaultClass = classAndSectionData?.classList[0];

    setFilterClass(defaultClass);
  }, [classAndSectionData]);

  return (
    <>
      {/* transition table */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              All Refunded payments
            </p>
          </div>
        </div>

        {refundTransactions?.length === 0 ? (
          <div className="font-poppins-bold text-lg text-textGray2 text-center">
            No Transition right now
          </div>
        ) : (
          <div className="w-full rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                  <th className="py-4 px-2">Student Name</th>
                  <th className="py-4 px-2">Class & Section</th>
                  <th className="py-4 px-2">Phone</th>
                  <th className="py-4 px-2">Transaction ID</th>
                  <th className="py-4 px-2">Amount</th>
                  <th className="py-4 px-2">Refunded</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-2">Payment Mode</th>
                  <th className="py-4 px-2">Date & Time</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {refundTransactions?.map((std, index) => (
                  <tr
                    key={index}
                    className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-medium"
                  >
                    <td className="py-4 px-2">{std?.studentName ?? "NA"}</td>
                    <td className="py-4 px-2">
                      {`${std?.className ?? "NA"} ${std?.sectionName ?? ""}`}
                    </td>
                    <td className="py-4 px-2">{std?.parentPhone ?? "NA"}</td>
                    <td className="py-4 px-2">{std?.zohoPaymentId ?? "NA"}</td>
                    {/* Amount */}
                    <td className="py-4 px-2">
                      <span className="flex justify-center items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {std?.amount ?? 0}
                      </span>
                    </td>

                    {/* Refunded Amount */}
                    <td className="py-4 px-2">
                      {std?.refundedAmount > 0 ? (
                        <span className="flex justify-center items-center gap-1 text-textGreen font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {std?.refundedAmount}
                        </span>
                      ) : (
                        <span className="text-textGray2">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td
                      className={`py-4 px-2 uppercase ${getPaymentStatusColor(std?.status)}`}
                    >
                      {getPaymentStatusText(std?.status) ?? "NA"}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-4 px-2 uppercase">
                      {std?.paymentMethod ?? "NA"}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-2">
                      {moment(std?.paidAt).format("DD/MM/YYYY HH:mm A")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    onChange={(event, value) => {
                      setPageNo(value);
                    }}
                    renderItem={(item) => (
                      <PaginationItem
                        {...item}
                        sx={{
                          color: isDarkMode ? "white" : "black",
                          borderColor:
                            item?.type === "previous" || item?.type === "next"
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
        )}
      </div>
    </>
  );
}
