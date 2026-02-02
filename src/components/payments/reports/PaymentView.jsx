import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { Eraser } from "lucide-react";

const modesData = [
  { label: "UPI", value: "upi" },
  { label: "CREDIT CARD", value: "card" },
  { label: "NET BANKING", value: "net_banking" },
];

export default function PaymentView() {
  const isDarkMode = true;
  const [t] = useTranslation();

  const { classAndSectionData } = useSelector((state) => state.appAuth);

  const [paymentTransitions, setPaymentTransitions] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);

  // Filters (null means ALL)
  const [filterMode, setFilterMode] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [filterSection, setFilterSection] = useState(null);
  const [sections, setSections] = useState([]);

  // Date filters
  const academicStartYear =
    classAndSectionData?.selectedSession?.academicStartYear;

  const defaultStartDate = useMemo(() => {
    if (!academicStartYear) return "";
    return moment(`${academicStartYear}-04-01`).format("YYYY-MM-DD");
  }, [academicStartYear]);

  const defaultEndDate = useMemo(() => {
    return moment().format("YYYY-MM-DD");
  }, []);

  const minDate = academicStartYear
    ? moment(`${academicStartYear}-04-01`).format("YYYY-MM-DD")
    : "";
  // console.log(minDate);

  const today = moment().format("YYYY-MM-DD");

  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  // Set default start/end once session available
  useEffect(() => {
    if (defaultStartDate && defaultEndDate) {
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
    }
  }, [defaultStartDate, defaultEndDate]);

  const getPaymentModeSummary = async () => {
    try {
      const sDate = startDate
        ? moment(startDate).startOf("day")
        : moment(`${academicStartYear}-04-01`).startOf("day");

      const eDate = endDate
        ? moment(endDate).endOf("day")
        : moment().endOf("day");
      // const sDate = moment(`${academicStartYear}-04-01`);
      // const eDate = moment();

      let query = `sessionId=${classAndSectionData?.selectedSession?._id}&page=${pageNo}&limit=${limit}&startDate=${sDate}&endDate=${eDate}`;

      // Only add class/section if selected
      if (filterClass?._id) query = query + `&classId=${filterClass?._id}`;
      if (filterSection?._id)
        query = query + `&sectionId=${filterSection?._id}`;
      if (filterMode) query = query + `&paymentMethod=${filterMode}`;

      // console.log(query);

      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_TRANSITIONS}?${query}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setPaymentTransitions(res?.result?.transactions || []);
        setTotalRequestCount(res?.result?.pagination?.totalCount || 0);
      }
    } catch (e) {
      // console.log(e);
    }
  };

  // Fetch on filter/page/limit/date change
  useEffect(() => {
    if (classAndSectionData?.selectedSession?._id) {
      getPaymentModeSummary();
    }
  }, [
    classAndSectionData?.selectedSession?._id,
    pageNo,
    limit,
    filterClass?._id,
    filterSection?._id,
    filterMode,
    startDate,
    endDate,
  ]);

  // When class list available, keep filters empty (ALL)
  useEffect(() => {
    if (!classAndSectionData?.classList?.length) return;

    // by default show ALL => keep filterClass null
    setSections([]);
    setFilterClass(null);
    setFilterSection(null);
  }, [classAndSectionData]);

  return (
    <>
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-poppins-bold">Transitions Details</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              All Transitions details with different filters
            </p>
          </div>

          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-wrap items-center gap-4">
              {/* Modes dropdown */}
              <select
                value={filterMode || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterMode(val);
                }}
                className="w-44 pl-4 pr-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white appearance-none"
              >
                <option value="">All Modes</option>
                {modesData?.map((cls, i) => (
                  <option key={i} value={cls?.value}>
                    {cls?.label}
                  </option>
                ))}
              </select>

              {/* Class Dropdown (All) */}
              <select
                value={filterClass?._id || ""}
                onChange={(e) => {
                  const val = e.target.value;

                  // ALL
                  if (!val) {
                    setFilterClass(null);
                    setSections([]);
                    setFilterSection(null);
                    setPageNo(1);
                    return;
                  }

                  const selected = classAndSectionData?.classList?.find(
                    (cls) => cls._id === val,
                  );

                  setFilterClass(selected || null);
                  setSections(selected?.section || []);
                  setFilterSection(null); // ✅ section also ALL by default
                  setPageNo(1);
                }}
                className="w-44 pl-4 pr-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white appearance-none"
              >
                <option value="">All Classes</option>
                {classAndSectionData?.classList?.map((cls) => (
                  <option key={cls?._id} value={cls?._id}>
                    {cls?.name}
                  </option>
                ))}
              </select>

              {/* Section Dropdown (All) */}
              <select
                value={filterSection?._id || ""}
                onChange={(e) => {
                  const val = e.target.value;

                  // ALL
                  if (!val) {
                    setFilterSection(null);
                    setPageNo(1);
                    return;
                  }

                  const sectionObj = sections?.find((sec) => sec._id === val);
                  setFilterSection(sectionObj || null);
                  setPageNo(1);
                }}
                disabled={!filterClass?._id} // section only enabled if class selected
                className={`w-44 pl-4 pr-4 py-2.5 border border-gray-700 rounded-lg text-white appearance-none ${
                  !filterClass?._id
                    ? "bg-[#1f1f1f] opacity-60 cursor-not-allowed"
                    : "bg-[#242424]"
                }`}
              >
                <option value="">All Sections</option>
                {sections?.map((sec, i) => (
                  <option key={i} value={sec?._id}>
                    Section {sec?.name}
                  </option>
                ))}
              </select>

              {/* Start Date */}
              <input
                type="date"
                value={startDate || ""}
                min={minDate}
                max={endDate || today}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartDate(newStart);
                  setPageNo(1);
                  // if startDate > endDate then fix endDate
                  if (endDate && moment(newStart).isAfter(endDate)) {
                    setEndDate(newStart);
                  }
                }}
                style={{
                  colorScheme: "dark",
                }}
                className="w-44 px-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white"
              />

              {/* End Date */}
              <input
                type="date"
                value={endDate || ""}
                min={startDate || minDate}
                max={today}
                onChange={(e) => {
                  const newEnd = e.target.value;

                  // prevent selecting future date
                  if (moment(newEnd).isAfter(today)) return;

                  setEndDate(newEnd);
                  setPageNo(1);

                  // if endDate < startDate then fix startDate
                  if (startDate && moment(newEnd).isBefore(startDate)) {
                    setStartDate(newEnd);
                  }
                }}
                style={{
                  colorScheme: "dark",
                }}
                className="w-44 px-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white"
              />
            </div>
            {/* <button
              type="button"
              className="bg-[#242424] border border-gray-700 rounded-lg size-[45px] flex justify-center items-center cursor-pointer"
            >
              <Eraser />
            </button> */}
          </div>
        </div>

        {paymentTransitions?.length === 0 ? (
          <div className="font-poppins-bold text-lg text-textGray2 text-center">
            No Transition right now
          </div>
        ) : (
          <div className="w-full rounded-xl overflow-auto">
            <table className="w-full text-left">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                  <th className="py-4 px-2">Student Name</th>
                  <th className="py-4 px-2">Class & Section</th>
                  <th className="py-4 px-2">Phone</th>
                  <th className="py-4 px-2">Transaction ID</th>
                  <th className="py-4 px-2">Amount</th>
                  <th className="py-4 px-2">Payment Mode</th>
                  <th className="py-4 px-2">Date & Time</th>
                  <th className="py-4 px-2">Status</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {paymentTransitions?.map((std, index) => (
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
                    <td className="py-4 px-2">{std?.amount}</td>
                    <td className="py-4 px-2 uppercase">
                      {std?.paymentMethod ?? "NA"}
                    </td>
                    <td className="py-4 px-2">
                      {moment(std?.paidAt).format("DD/MM/YYYY HH:mm A")}
                    </td>
                    <td
                      className={`py-4 px-2 uppercase ${
                        std?.status === "paid"
                          ? "text-textGreen"
                          : "text-textRed"
                      }`}
                    >
                      {std?.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ Pagination */}
            <div className="flex gap-5 justify-between items-center my-9 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
              <div className="text-[#9391a5] text-base leading-5">
                {t("titles.showing")}
                <span className="text-textBlue">
                  {" "}
                  {pageNo * limit - (limit - 1)} -{" "}
                  {Math.min(totalRequestCount, pageNo * limit)}{" "}
                </span>
                {t("titles.from")}
                <span className="text-textBlue"> {totalRequestCount} </span>
                {t("titles.data")}
              </div>

              <div className="flex items-center gap-4">
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
