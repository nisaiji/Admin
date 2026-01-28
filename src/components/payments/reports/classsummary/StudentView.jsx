import React, { useEffect, useState, useRef } from "react";
import profile from "../../../../assets/images/profileEmpty.png";
import notification from "../../../../assets/images/fees/notifications.png";
import discount from "../../../../assets/images/fees/discount.png";
import { axiosClient } from "../../../../services/axiosClient";
import EndPoints from "../../../../services/EndPoints";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../../../Spinner";
import {
  ChevronRight,
  MoreVertical,
  Download,
  IndianRupee,
} from "lucide-react";

export default function StudentView({
  setSelectedView,
  filterData,
  classAndSectionData,
}) {
  const [studentSummary, setStudentSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const dropdownRef = useRef(null);
  const academicStartYear =
    classAndSectionData?.selectedSession?.academicStartYear;

  const getStudentSummary = async () => {
    try {
      const start = moment(`${academicStartYear}-04-01`);
      const end = moment();
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_TRANSITIONS}?sessionStudentId=${filterData?.studentData?._id}&limit=${999}&startDate=${start}&endDate=${end}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setStudentSummary(res?.result?.transactions);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const sendParentReminder = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_REPORT_FEE_REMINDER}`,
        { sessionStudentId: filterData?.studentData?._id },
      );

      if (res?.statusCode === 200) {
        toast.success(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStudentSummary();
  }, [filterData]);

  const giveDiscount = async () => {
    try {
      const res = await axiosClient.post(`${EndPoints.ADMIN.CREATE_REFUND}`, {
        sessionStudentId: filterData?.studentData?._id,
        paymentId: "",
        amount: 50,
      });
      // if (res?.statusCode = 200) {
      // }
    } catch (e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const feeInstallments = filterData?.studentData?.studentFeeInstallments || [];
  const advanceAmount = filterData?.studentData?.wallet?.balance ?? 0;
  // console.log(filterData);

  const getStatusStyles = (status) => {
    if (!status) return "bg-gray-500/20 text-gray-200 border-gray-500/30";
    if (status.toLowerCase() === "paid")
      return "bg-green-500/15 text-green-300 border-green-500/30";
    if (status.toLowerCase() === "unpaid")
      return "bg-red-500/15 text-red-300 border-red-500/30";
    return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
  };

  const handleDownloadReceipt = (txn) => {
    setOpenMenuId(null);

    // here you can integrate your receipt download logic
    toast.success(`Downloading receipt for ${txn?.zohoPaymentId ?? "NA"}`);
  };

  const handleRefund = async (txn) => {
    try {
      const res = await axiosClient.post(`${EndPoints.ADMIN.CREATE_REFUND}`, {
        sessionStudentId: txn?.sessionStudent,
        paymentId: txn?.zohoPaymentId,
        amount: txn?.amount,
      });
      // console.log(res);

      // setOpenMenuId(null);
      // console.log(txn);
      // giveDiscount();
      toast.success(`Refund action for ${txn?.zohoPaymentId ?? "NA"}`);
    } catch (e) {
      // console.log(e);
      toast.error(e);
    }
  };

  return (
    <div className="w-full text-white">
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex">
        <button
          type="button"
          onClick={() => setSelectedView("class")}
          className="text-sm font-poppins-bold cursor-pointer"
        >
          Reports
        </button>
        <ChevronRight className="w-5 h-5" />
        <button
          type="button"
          onClick={() => setSelectedView("section")}
          className="text-sm font-poppins-bold cursor-pointer"
        >
          {filterData?.className ?? "NA"} {filterData?.name ?? ""}
        </button>
        <ChevronRight className="w-5 h-5" />
        <p className="text-sm text-textBlue font-poppins-bold">
          {filterData?.studentData?.student?.firstname ?? ""}{" "}
          {filterData?.studentData?.student?.lastname ?? ""}
        </p>
      </div>

      <p className="text-xl font-poppins-bold my-6">
        Nursary Payment Overview{" "}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex gap-6 justify-center items-center">
          <img
            src={studentSummary?.studentPhoto ?? profile}
            alt="p"
            className="size-[50px] object-contain rounded-md"
          />
          <p className="text-textPrimary text-sm font-poppins-bold ">
            {filterData?.studentData?.student?.firstname}{" "}
            {filterData?.studentData?.student?.lastname}
          </p>
        </div>
        <div className="flex gap-6 justify-center items-center">
          {/* <button
            type="button"
            onClick={() => giveDiscount()}
            className="bg-backgroundBlue15 text-textBlue text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2"
          >
            <img src={discount} alt="d" className="size-6 object-contain" />
            Refund
          </button> */}
          <button className="bg-backgroundBlue15 text-textBlue text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2">
            <img src={discount} alt="d" className="size-6 object-contain" />
            Dispute
          </button>
          <button
            type="button"
            onClick={() => sendParentReminder()}
            disabled={loading}
            className="bg-backgroundBlue text-textPrimary text-sm font-poppins-regular p-[10px] rounded-md flex justify-center items-center gap-2"
          >
            <img src={notification} alt="d" className="size-6 object-contain" />
            Reminder
          </button>
        </div>
      </div>

      {/* installment cards */}
      <div className="my-6">
        <div className="flex flex-wrap gap-4">
          {feeInstallments?.length > 0 ? (
            feeInstallments?.map((ins, idx) => (
              <div
                key={idx}
                className="min-w-[230px] flex-1 bg-[#1c1c1c] border border-white/10 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm text-textGray2 font-poppins-regular">
                      Installment
                    </p>
                    <p className="text-base font-poppins-bold text-white">
                      {ins?.month ?? idx + 1}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${getStatusStyles(
                      ins?.status,
                    )}`}
                  >
                    {ins?.status ?? "NA"}
                  </span>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <p className="text-sm text-textGray2 font-poppins-regular">
                    Amount
                  </p>
                  <p className="text-base font-poppins-bold text-textBlue flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {ins?.amount ?? 0}
                  </p>
                </div>

                {ins?.dueDate && (
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm text-textGray2 font-poppins-regular">
                      Due
                    </p>
                    <p className="text-sm text-white font-poppins-medium">
                      {moment(ins?.dueDate).format("DD/MM/YYYY")}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 w-full">
              <p className="text-sm text-textGray2 font-poppins-regular">
                No installments found
              </p>
            </div>
          )}

          {/* ✅ Advance Amount Card */}
          <div className="min-w-[230px] flex-1 bg-[#1c1c1c] border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-textGray2 font-poppins-regular">
              Advance Amount
            </p>
            <p className="text-lg font-poppins-bold text-green-300 mt-1 flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {advanceAmount}
            </p>
            <p className="text-xs text-textGray2 mt-2">
              Extra paid amount will be adjusted
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Fee Trends */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] my-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Student paid unpaid status
            </p>
          </div>
        </div>

        <div className="w-full rounded-xl overflow-auto">
          <table className="w-full text-left">
            <thead className="text-textBlue text-base font-poppins-bold">
              <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                <th className="py-4 px-2">Transaction ID</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Payment Mode</th>
                <th className="py-4 px-2">Date & Time</th>
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {studentSummary?.map((std, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-medium"
                >
                  <td className="py-4 px-2">{std?.zohoPaymentId ?? "NA"}</td>
                  <td className="py-4 px-2">{std?.amount}</td>
                  <td className="py-4 px-2">{std?.paymentMethod ?? "NA"}</td>
                  <td className="py-4 px-2">
                    {moment(std?.paidAt).format("DD/MM/YYYY HH:mm A")}
                  </td>
                  {/* ACTION */}
                  <td className="py-4 px-2 relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(openMenuId === std?._id ? null : std?._id)
                      }
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition"
                    >
                      <MoreVertical className="w-5 h-5 text-white" />
                    </button>

                    {openMenuId === std?._id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-4 top-[55px] z-40 min-w-[180px] bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden shadow-xl"
                      >
                        <button
                          onClick={() => handleDownloadReceipt(std)}
                          className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/10 transition"
                        >
                          <Download className="w-4 h-4 text-textBlue" />
                          Download Receipt
                        </button>

                        <button
                          type="button"
                          // onClick={() => handleRefund(std)}
                          className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/10 transition"
                        >
                          <img
                            src={discount}
                            alt="refund"
                            className="w-4 h-4 object-contain"
                          />
                          Refund
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
