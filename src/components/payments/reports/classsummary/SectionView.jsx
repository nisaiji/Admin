import React, { useEffect, useState } from "react";
import collected from "../../../../assets/images/fees/collected.png";
import pending from "../../../../assets/images/fees/pending.png";
// import refunded from "../../../../assets/images/fees/refunded.png";
// import retry from "../../../assets/images/fees/retry.png";
import refund from "../../../../assets/images/fees/refund.png";
// import cancel from "../../../assets/images/fees/cancel.png";
// import { PieChart } from "@mui/x-charts";
import { axiosClient } from "../../../../services/axiosClient";
import EndPoints from "../../../../services/EndPoints";
import { ChevronRight } from "lucide-react";
import CONSTANT from "../../../../utils/constants";
import { useSelector } from "react-redux";
import moment from "moment";

const INSTALLMENT_CONFIG = {
  monthly: {
    count: 12,
    labels: CONSTANT.FY_MONTHS, // ["Apr","May",...]
  },
  bimonthly: {
    count: 6,
    labels: ["Apr-May", "Jun-Jul", "Aug-Sep", "Oct-Nov", "Dec-Jan", "Feb-Mar"],
  },
  quarterly: {
    count: 4,
    labels: ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"],
  },
  halfyearly: {
    count: 2,
    labels: ["Apr-Sep", "Oct-Mar"],
  },
  yearly: {
    count: 1,
    labels: ["Apr-Mar"],
  },
};

export default function SectionView({
  setSelectedView,
  filterData,
  setFilterData,
}) {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [feeSummary, setFeeSummary] = useState(null);
  const [sectionList, setSectionList] = useState([]);
  const [filterTable, setFilterTable] = useState({});

  const installmentType =
    classAndSectionData?.feeStructureData?.installmentType || "monthly";

  const installmentConfig =
    INSTALLMENT_CONFIG[installmentType] || INSTALLMENT_CONFIG.monthly;

  const getInstallmentByIndex = (installments, index) => {
    return installments?.find((i) => i.month === index + 1);
  };

  const getCurrentInstallmentIndex = () => {
    const start = moment(
      classAndSectionData?.selectedSession?.startDate,
    ).startOf("day");
    const now = moment().startOf("day");

    // If is before effective date → nothing due
    if (now.isBefore(start)) return null;

    const monthsPerInstallment =
      CONSTANT.INSTALLMENT_PERIOD_MONTHS[installmentType] || 1;

    let monthsDiff = now.diff(start, "months");

    // Handle effective day boundary (04 → 03 logic)
    if (now.date() < start.date()) {
      monthsDiff -= 1;
    }

    // Convert months → installment number (1-based)
    const installmentIndex = Math.floor(monthsDiff / monthsPerInstallment) + 1;
    return installmentIndex;
  };

  const getFeeSummary = async () => {
    try {
      const sDate = moment(
        `${classAndSectionData?.selectedSession?.academicStartYear}-04-01`,
      ).startOf("day");

      const eDate = moment().endOf("day");
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_FEE_SUMMARY}?sessionId=${classAndSectionData?.selectedSession?._id}&sectionId=${filterData?._id}&startDate=${sDate}&endDate=${eDate}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setFeeSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const normalizeStudentInstallments = (student, installmentConfig) => {
    // const sessionStart =
    //   classAndSectionData?.selectedSession?.academicStartYear;

    const existing = student?.studentFeeInstallments || [];

    const existingMap = new Map(existing?.map((i) => [i?.month, i]));

    const installments = [];

    for (let i = 1; i <= installmentConfig?.count; i++) {
      if (existingMap?.has(i)) {
        installments?.push(existingMap?.get(i));
      } else {
        // create missing installment
        // const startDate = new Date();

        // const dueDate = new Date(startDate);
        // dueDate?.setMonth(dueDate?.getMonth() + i);
        // console.log(startDate, dueDate);

        installments?.push({
          _id: `virtual-${student?._id}-${i}`,
          month: i,
          baseAmount: 0,
          lateFeeApplied: 0,
          totalPayable: 0,
          amountPaid: 0,
          status: "unpaid",
          // startDate: startDate?.toISOString(),
          // dueDate: dueDate?.toISOString(),
          // startDate: startDate?.toISOString(),
          // dueDate: dueDate?.toISOString(),
          isVirtual: true, // important flag
        });
      }
    }

    return {
      ...student,
      studentFeeInstallments: installments?.sort((a, b) => a?.month - b?.month),
    };
  };

  const getSectionReports = async () => {
    try {
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_SECTIONS_REPORTS}?sectionId=${filterData?._id}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        const normalizedData = res?.result?.map((student) =>
          normalizeStudentInstallments(student, installmentConfig),
        );
        // console.log(normalizedData);

        setSectionList(normalizedData);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    if (filterData?._id) {
      getFeeSummary();
    }
    getSectionReports();
  }, [filterData?._id]);

  const filterPendingPayments = () => {
    const filtered = sectionList?.filter((student) => {
      const currentInstallmentIndex = getCurrentInstallmentIndex();

      if (!currentInstallmentIndex) return false;

      const installment = student.studentFeeInstallments?.find(
        (i) => i?.month === currentInstallmentIndex,
      );

      // Not created yet → treat as unpaid
      if (!installment) return true;

      return installment.status !== "paid";
    });

    setFilterTable({ data: filtered, type: "Pending Payments" });
  };

  const filterAdvancePayments = () => {
    const filtered = sectionList?.filter((student) => {
      // console.log(student);

      return student?.wallet?.balance > 0;
    });
    setFilterTable({ data: filtered, type: "Advance Payments" });
  };

  return (
    <div className="w-full text-white">
      <div className="flex">
        <button
          type="button"
          onClick={() => setSelectedView("class")}
          className="text-xl font-poppins-bold cursor-pointer"
        >
          Reports & Analytics
        </button>
        <ChevronRight className="w-7 h-7" />
        <p className="text-xl text-textBlue font-poppins-bold">
          {filterData?.className ?? "Nursary"} {filterData?.name ?? "A"}
        </p>
      </div>

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
              ₹ {feeSummary?.totalPaidAmount ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Total Collected Fees
          </p>
        </div>

        {/* Pending Payments */}
        <button
          type="button"
          onClick={() => filterPendingPayments()}
          className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundOrange1"
        >
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundOrange bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={pending} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.pendingAmount ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Pending Fees till Due Date
          </p>
        </button>

        {/* Advanced Amount */}
        <button
          type="button"
          onClick={filterAdvancePayments}
          className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundGreen"
        >
          {/* <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundGreen"> */}
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundGreen bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={refund} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.advanceAmount ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Advanced Paid Amount
          </p>
          {/* </div> */}
        </button>
      </div>

      {/* BOTTOM SECTION */}
      <div className="">
        {/* Monthly Fee Trends */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] min-h-[260px]">
          <h3 className="text-lg font-poppins-bold">Transactions</h3>
          <p className="text-sm font-poppins-regular text-textGray2 mb-4">
            Students Paid and Unpaid Status
          </p>

          <div className="max-h-[420px] w-full rounded-xl overflow-auto">
            <table className="w-full text-left">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                  <th className="py-4 px-2">Student</th>
                  {installmentConfig.labels.map((label) => (
                    <th key={label} className="py-4 px-2">
                      {label}
                    </th>
                  ))}
                  <th className="py-4 px-2">Action</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {sectionList?.map((std, index) => (
                  <tr
                    key={index}
                    className="border-b border-backgroundGray15 text-center text-base font-poppins-medium"
                  >
                    {/* STUDENT NAME */}
                    <td className="py-4 px-2 text-white font-poppins-bold">
                      {std?.student?.firstname ?? ""}{" "}
                      {std?.student?.lastname ?? ""}
                    </td>

                    {/* INSTALLMENT STATUS */}
                    {std?.studentFeeInstallments?.map((s, i) => {
                      const isPaid = s?.status === "paid";
                      const isUnpaid =
                        s?.baseAmount > 0 || s?.isVirtual === true;
                      return (
                        <td key={i} className="py-4 px-2">
                          <span
                            className={`text-sm font-poppins-bold ${
                              isPaid
                                ? "text-[#4CBC9A]"
                                : isUnpaid
                                  ? "text-[#E45858]"
                                  : "text-[#FFFFFF]"
                            }`}
                          >
                            {isPaid ? "Paid" : isUnpaid ? "Unpaid" : "-"}
                          </span>
                        </td>
                      );
                    })}

                    {/* ACTION */}
                    <td className="py-4 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterData({ ...filterData, studentData: std });
                          setSelectedView("student");
                        }}
                        className="bg-backgroundBlue text-textPrimary text-sm px-4 py-1 rounded-md"
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

      {filterTable?.data?.length > 0 && (
        <div className="mt-6">
          {/* Monthly Fee Trends */}
          <div className="p-4 rounded-xl bg-[#1c1c1c] min-h-[260px]">
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2 mb-4">
              {filterTable?.type} of Students
            </p>

            <div className="max-h-[420px] w-full rounded-xl overflow-auto">
              <table className="w-full text-left">
                <thead className="text-textBlue text-base font-poppins-bold">
                  <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                    <th className="py-4 px-2">Student</th>
                    {installmentConfig.labels.map((label) => (
                      <th key={label} className="py-4 px-2">
                        {label}
                      </th>
                    ))}
                    <th className="py-4 px-2">Action</th>
                  </tr>
                </thead>

                <tbody className="bg-[#2b2b2b]">
                  {filterTable?.data?.map((std, index) => (
                    <tr
                      key={index}
                      className="border-b border-backgroundGray15 text-center text-base font-poppins-medium"
                    >
                      {/* STUDENT NAME */}
                      <td className="py-4 px-2 text-white font-poppins-bold">
                        {std?.student?.firstname ?? ""}{" "}
                        {std?.student?.lastname ?? ""}
                      </td>

                      {/* INSTALLMENT STATUS */}
                      {installmentConfig.labels.map((_, index) => {
                        const installment = getInstallmentByIndex(
                          std?.studentFeeInstallments,
                          index,
                        );

                        const isPaid = installment?.status === "paid";

                        return (
                          <td key={index} className="py-4 px-2">
                            <span
                              className={`text-sm font-poppins-bold ${
                                isPaid ? "text-[#4CBC9A]" : "text-[#E45858]"
                              }`}
                            >
                              {isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                        );
                      })}

                      {/* ACTION */}
                      <td className="py-4 px-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFilterData({ ...filterData, studentData: std });
                            setSelectedView("student");
                          }}
                          className="bg-backgroundBlue text-textPrimary text-sm px-4 py-1 rounded-md"
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
      )}
    </div>
  );
}
