import React, { useEffect, useState } from "react";
import collected from "../../../assets/images/fees/collected.png";
import pending from "../../../assets/images/fees/pending.png";
import due from "../../../assets/images/fees/due.png";
import BarChartComponent from "../BarChart";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { useSelector } from "react-redux";

const DUMMY_SECTION_MONTHLY_DATA = [
  {
    _id: "secA",
    sectionName: "A",
    monthlyData: [
      { month: "2025-04", totalAmount: 20000 },
      { month: "2025-05", totalAmount: 35000 },
      { month: "2025-06", totalAmount: 45000 },
      // { month: "2025-07", totalAmount: 90000 },
      { month: "2025-08", totalAmount: 75000 },
      { month: "2025-09", totalAmount: 60000 },
      // { month: "2025-10", totalAmount: 70000 },
      { month: "2025-11", totalAmount: 65000 },
      { month: "2025-12", totalAmount: 55000 },
      // { month: "2026-01", totalAmount: 60000 },
      { month: "2026-02", totalAmount: 45000 },
      { month: "2026-03", totalAmount: 50000 },
    ],
  },
  {
    _id: "secB",
    sectionName: "B",
    monthlyData: [
      { month: "2025-04", totalAmount: 15000 },
      { month: "2025-06", totalAmount: 30000 },
      { month: "2025-07", totalAmount: 50000 },
      { month: "2026-01", totalAmount: 43000 },
      { month: "2026-02", totalAmount: 36000 },
      { month: "2026-03", totalAmount: 40000 },
    ],
  },
  {
    _id: "secC",
    sectionName: "C",
    monthlyData: [
      { month: "2025-04", totalAmount: 10000 },
      { month: "2025-06", totalAmount: 24000 },
      { month: "2025-07", totalAmount: 32000 },
      { month: "2025-08", totalAmount: 30000 },
      { month: "2025-11", totalAmount: 31000 },
      { month: "2025-12", totalAmount: 29000 },
      { month: "2026-02", totalAmount: 26000 },
      { month: "2026-03", totalAmount: 30000 },
    ],
  },
];

export default function ClassView({
  setSelectedView,
  filterClass,
  setFilterClass,
  filterSection,
  setFilterSection,
}) {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [feeSummary, setFeeSummary] = useState(null);
  const [classFeeSummary, setClassFeeSummary] = useState([]);

  const [sections, setSections] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const MONTH_ORDER = [
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
  ];

  const buildBarDataForSection = (sectionName) => {
    const section = classFeeSummary?.find(
      (s) => s?.sectionName === sectionName
    );

    // 🛡️ If section or monthlyData missing
    const monthlyData = Array.isArray(section?.monthlyData)
      ? section?.monthlyData
      : [];

    // Convert monthlyData to map for fast lookup
    const monthAmountMap = monthlyData.reduce((acc, item) => {
      if (item?.month) {
        acc[item?.month] = Number(item?.totalAmount) ?? 0;
      }
      return acc;
    }, {});

    // Always return 12 months in correct order
    return MONTH_ORDER.map((month) => monthAmountMap[month] ?? 0);
  };

  useEffect(() => {
    if (!filterSection || !classFeeSummary.length) {
      setBarChartData(Array(MONTH_ORDER.length).fill(0));
      return;
    }

    const data = buildBarDataForSection(filterSection);
    setBarChartData(data);
  }, [filterSection, classFeeSummary]);

  useEffect(() => {
    if (!classAndSectionData?.classList?.length) return;

    const defaultClass = classAndSectionData?.classList[0];
    const defaultSection = defaultClass?.section?.[0]?.name ?? null;

    setFilterClass(defaultClass);
    setSections(defaultClass.section || []);
    setFilterSection(defaultSection);

    // set default chart
    // if (defaultSection) {
    //   const data = buildBarDataForSection(defaultSection);
    //   setBarChartData(data);
    // } else {
    //   setBarChartData(Array(MONTH_ORDER.length).fill(0));
    // }
  }, [classAndSectionData]);

  const getFeeSummary = async () => {
    try {
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_FEE_SUMMARY}?classId=${filterClass?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setFeeSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };
  const getClassFeeSummary = async () => {
    try {
      const res = await axiosClient.post(
        EndPoints.ADMIN.GET_CLASS_PAYMENT_SUMMARY,
        { classId: filterClass?._id }
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setClassFeeSummary(res?.result);
        // setClassFeeSummary(DUMMY_SECTION_MONTHLY_DATA);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    if (filterClass?._id) {
      getFeeSummary();
      getClassFeeSummary();
    }
  }, [filterClass?._id]);

  const months = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
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
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.collectedFee ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Total Collected Fees
          </p>
          <p className="text-base font-poppins-bold text-textBlue mt-1">
            +0%{" "}
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
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.pending ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Pending Payments</p>
          <p className="text-base font-poppins-bold text-textOrange2 mt-1">
            +0%{" "}
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
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.overdue ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">Overdue Payments</p>
          <p className="text-base font-poppins-bold text-textRed mt-1">
            +0%{" "}
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
          <div className="space-x-4">
            <select
              value={filterClass?._id || ""}
              onChange={(e) => {
                const selected = classAndSectionData?.classList?.find(
                  (cls) => cls._id === e.target.value
                );
                setFilterClass(selected);
                setSections(selected?.section || []);
                setFilterSection(selected?.section?.[0] || null);
              }}
              className="w-40 pl-4 pr-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white appearance-none"
            >
              {classAndSectionData?.classList?.map((cls) => (
                <option key={cls?._id} value={cls?._id}>
                  {cls?.name}
                </option>
              ))}
            </select>
            <select
              value={filterSection || ""}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-40 pl-4 pr-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white appearance-none"
            >
              {sections?.map((sec, i) => (
                <option key={i} value={sec?.name}>
                  Section {sec?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="w-full h-[350px] flex justify-center items-center">
          <BarChartComponent
            xAxisData={[
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
              "Jan",
              "Feb",
              "Mar",
            ]}
            series={barChartData}
          />
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
                  {months?.map((m) => (
                    <th key={m} className="py-4 px-2">
                      {m}
                    </th>
                  ))}
                  <th className="py-4 px-2">Action</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {classFeeSummary?.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                  >
                    {/* CLASS + SECTION */}
                    <td className="py-4 px-2">
                      {/* {selectedClass}{" "} */}
                      {filterClass?.name}{" "}
                      <span className="text-textGray2 text-sm">
                        {item?.sectionName}
                      </span>
                    </td>

                    {/* MONTHS */}
                    {MONTH_ORDER?.map((month, i) => {
                      const match = item?.monthlyData?.find(
                        (m) => m?.month === month
                      );

                      return (
                        <td key={i} className="py-4 px-2">
                          <span className="text-[#4CBC9A] text-sm">
                            {match?.totalAmount ?? 0}
                          </span>
                        </td>
                      );
                    })}

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
