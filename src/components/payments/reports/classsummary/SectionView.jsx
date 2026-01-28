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

const dummyData = [
  {
    _id: "689f1491aa3b1de0f259883d",
    student: {
      _id: "689f0b0f887210aaedf2502a",
      firstname: "Himanshu",
      lastname: "patidar",
      isActive: true,
      gender: "male",
      dob: "2003-08-20",
      address: "bholaram indore",
      parent: "689f0b0f887210aaedf25025",
      schoolParent: "689f0b0f887210aaedf25027",
      admin: "689edec82daf9b7c6ca88842",
      createdAt: "2025-08-15T10:25:19.027Z",
      updatedAt: "2025-08-15T10:25:19.027Z",
      __v: 0,
    },
    section: "689ee11474d391f6f87fd2dc",
    classId: "689ee0b774d391f6f87fd2d5",
    session: "689ee06b74d391f6f87fd2cf",
    school: "689edec82daf9b7c6ca88842",
    transferCertificateIssued: false,
    feeStatus: "pending",
    isActive: true,
    createdAt: "2025-08-15T11:05:53.700Z",
    updatedAt: "2025-08-15T11:05:53.700Z",
    __v: 0,
    studentFeeInstallments: [
      {
        _id: "696d16b67f504deaba6adc81",
        feeInstallment: {
          _id: "694ebe896eb73a5ccc8666b4",
          installmentNumber: 1,
          amount: 5000,
          startDate: 998989898989,
          dueDate: "2025-11-01T16:57:45.481Z",
          sectionFeeStructure: "694ebe896eb73a5ccc8666b2",
          isActive: true,
          createdAt: "2025-12-26T16:57:45.476Z",
          updatedAt: "2025-12-26T16:57:45.476Z",
          __v: 0,
          section: "689ee11474d391f6f87fd2dc",
        },
        sessionStudent: "689f1491aa3b1de0f259883d",
        student: "689f0b0f887210aaedf2502a",
        school: "689edec82daf9b7c6ca88842",
        session: "689ee06b74d391f6f87fd2cf",
        classId: "689ee0b774d391f6f87fd2d5",
        section: "689ee11474d391f6f87fd2dc",
        month: 1,
        baseAmount: 5000,
        lateFeeApplied: 0,
        totalPayable: 5000,
        amountPaid: 5000,
        status: "paid",
        dueDate: "2025-11-01T16:57:45.481Z",
        createdAt: "2026-01-18T17:21:58.847Z",
        updatedAt: "2026-01-18T17:22:55.435Z",
        __v: 0,
      },
      {
        _id: "696d16ef7f504deaba6adcdd",
        feeInstallment: {
          _id: "694ebe896eb73a5ccc8666b6",
          installmentNumber: 2,
          amount: 500,
          startDate: 998989898989,
          dueDate: "2025-12-01T16:57:45.481Z",
          sectionFeeStructure: "694ebe896eb73a5ccc8666b2",
          isActive: true,
          createdAt: "2025-12-26T16:57:45.481Z",
          updatedAt: "2025-12-26T16:57:45.481Z",
          __v: 0,
          section: "689ee11474d391f6f87fd2dc",
        },
        sessionStudent: "689f1491aa3b1de0f259883d",
        student: "689f0b0f887210aaedf2502a",
        school: "689edec82daf9b7c6ca88842",
        session: "689ee06b74d391f6f87fd2cf",
        classId: "689ee0b774d391f6f87fd2d5",
        section: "689ee11474d391f6f87fd2dc",
        month: 2,
        baseAmount: 500,
        lateFeeApplied: 0,
        totalPayable: 500,
        amountPaid: 500,
        status: "paid",
        dueDate: "2025-12-01T16:57:45.481Z",
        createdAt: "2026-01-18T17:22:55.445Z",
        updatedAt: "2026-01-18T17:22:57.211Z",
        __v: 0,
      },
      {
        _id: "696d16f37f504deaba6adcf0",
        feeInstallment: {
          _id: "694ebe896eb73a5ccc8666b4",
          installmentNumber: 1,
          amount: 5000,
          startDate: 998989898989,
          dueDate: "2025-11-01T16:57:45.481Z",
          sectionFeeStructure: "694ebe896eb73a5ccc8666b2",
          isActive: true,
          createdAt: "2025-12-26T16:57:45.476Z",
          updatedAt: "2025-12-26T16:57:45.476Z",
          __v: 0,
          section: "689ee11474d391f6f87fd2dc",
        },
        sessionStudent: "689f1491aa3b1de0f259883d",
        student: "689f0b0f887210aaedf2502a",
        school: "689edec82daf9b7c6ca88842",
        session: "689ee06b74d391f6f87fd2cf",
        classId: "689ee0b774d391f6f87fd2d5",
        section: "689ee11474d391f6f87fd2dc",
        month: 1,
        baseAmount: 5000,
        lateFeeApplied: 12822,
        totalPayable: 17822,
        amountPaid: 500,
        status: "paid",
        dueDate: "2025-11-01T16:57:45.481Z",
        createdAt: "2026-01-18T17:22:59.399Z",
        updatedAt: "2026-01-18T17:22:59.399Z",
        __v: 0,
      },
    ],
  },
  {
    _id: "68a9a4adf727e99a02b477e9",
    student: {
      _id: "68a9a4adf727e99a02b477e7",
      firstname: "Raj",
      lastname: "gurjar",
      isActive: true,
      gender: "male",
      admin: "689edec82daf9b7c6ca88842",
      createdAt: "2025-08-23T11:23:25.792Z",
      updatedAt: "2025-08-23T11:23:25.792Z",
      __v: 0,
    },
    section: "689ee11474d391f6f87fd2dc",
    classId: "689ee0b774d391f6f87fd2d5",
    session: "689ee06b74d391f6f87fd2cf",
    transferCertificateIssued: false,
    feeStatus: "pending",
    isActive: true,
    createdAt: "2025-08-23T11:23:25.800Z",
    updatedAt: "2025-08-23T11:23:25.800Z",
    __v: 0,
    studentFeeInstallments: [],
  },
  {
    _id: "68a9a4eef727e99a02b477f6",
    student: {
      _id: "68a9a4eef727e99a02b477f4",
      firstname: "Rohan",
      lastname: "Gurjar",
      isActive: true,
      gender: "male",
      admin: "689edec82daf9b7c6ca88842",
      createdAt: "2025-08-23T11:24:30.888Z",
      updatedAt: "2025-08-23T11:24:30.888Z",
      __v: 0,
    },
    section: "689ee11474d391f6f87fd2dc",
    classId: "689ee0b774d391f6f87fd2d5",
    session: "689ee06b74d391f6f87fd2cf",
    transferCertificateIssued: false,
    feeStatus: "pending",
    isActive: true,
    createdAt: "2025-08-23T11:24:30.899Z",
    updatedAt: "2025-08-23T11:24:30.899Z",
    __v: 0,
    studentFeeInstallments: [],
  },
];
export default function SectionView({
  setSelectedView,
  filterData,
  setFilterData,
}) {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [feeSummary, setFeeSummary] = useState(null);
  const [sectionList, setSectionList] = useState([]);
  const [filterTable, setFilterTable] = useState([]);

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
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_FEE_SUMMARY}?sessionId=${classAndSectionData?.selectedSession?._id}&sectionId=${filterData?._id}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setFeeSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const normalizeStudentInstallments = (
    student,
    installmentConfig,
    sessionStartDate, // optional (can come from session)
  ) => {
    const existing = student?.studentFeeInstallments || [];

    const existingMap = new Map(existing?.map((i) => [i?.month, i]));

    const installments = [];

    for (let i = 1; i <= installmentConfig?.count; i++) {
      if (existingMap?.has(i)) {
        installments?.push(existingMap?.get(i));
      } else {
        // create missing installment
        const startDate = sessionStartDate
          ? new Date(sessionStartDate)
          : new Date();

        const dueDate = new Date(startDate);
        dueDate?.setMonth(dueDate?.getMonth() + i);

        installments?.push({
          _id: `virtual-${student?._id}-${i}`,
          month: i,
          baseAmount: 0,
          lateFeeApplied: 0,
          totalPayable: 0,
          amountPaid: 0,
          status: "unpaid",
          startDate: startDate?.toISOString(),
          dueDate: dueDate?.toISOString(),
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
        // setSectionList(res?.result);
        // setSectionList(dummyData);
        const sessionStart =
          classAndSectionData?.selectedSession?.academicStartYear;

        // const normalizedData = dummyData.map((student) =>
        //   normalizeStudentInstallments(
        //     student,
        //     installmentConfig,
        //     sessionStart,
        //   ),
        // );
        const normalizedData = res?.result?.map((student) =>
          normalizeStudentInstallments(
            student,
            installmentConfig,
            sessionStart,
          ),
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
    // const effectiveDate = classAndSectionData?.feeStructureData?.effectiveFrom;

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

    setFilterTable(filtered);
  };

  const filterAdvancePayments = () => {
    // setFilterTable(sectionList);
  };

  return (
    <div className="w-full text-white">
      <div className="flex">
        <button
          type="button"
          onClick={() => setSelectedView("class")}
          className="text-sm font-poppins-bold cursor-pointer"
        >
          Reports
        </button>
        <ChevronRight className="w-5 h-5" />
        <p className="text-sm text-textBlue font-poppins-bold">
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
              ₹ {feeSummary?.totalAmount ?? 0}
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
        {/* <button
          type="button"
          onClick={filterAdvancePayments}
          className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundGreen"
        > */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border-b-2 border-b-backgroundGreen">
          <div className="flex gap-4">
            <div className="size-10 bg-backgroundGreen bg-opacity-15 flex justify-center items-center rounded-md">
              <img src={refund} alt="p" className="size-6 object-contain" />
            </div>
            <p className="text-lg font-poppins-bold mt-1">
              ₹ {feeSummary?.totalTransactions ?? 0}
            </p>
          </div>
          <p className="text-md font-poppins-regular mt-2">
            Advanced Paid Amount
          </p>
          {/* </button> */}
        </div>
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
                      return (
                        <td key={i} className="py-4 px-2">
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

      {filterTable.length > 0 && (
        <div className="mt-6">
          {/* Monthly Fee Trends */}
          <div className="p-4 rounded-xl bg-[#1c1c1c] min-h-[260px]">
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2 mb-4">
              Students Paid and Unpaid Status
            </p>

            <div className="w-full rounded-xl overflow-auto">
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
                  {filterTable?.map((std, index) => (
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
