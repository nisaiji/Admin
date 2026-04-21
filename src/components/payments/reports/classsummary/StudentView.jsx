import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CircleDollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Download,
  ChevronRight,
  MoreVertical,
  Info,
  CirclePercent,
  AlertCircle,
  Calendar,
} from "lucide-react";
import discountimg from "../../../../assets/images/fees/discount.png";
import profile from "../../../../assets/images/profileEmpty.png";
import notification from "../../../../assets/images/fees/notifications.png";

import { axiosClient } from "../../../../services/axiosClient";
import EndPoints from "../../../../services/EndPoints";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../../../Spinner";
import {
  getPaymentStatusColor,
  getPaymentStatusText,
} from "../../../../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { setTempData } from "../../../../store/AppAuthSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../utils/tooltip";

export default function StudentView({ setSelectedView, classAndSectionData }) {
  const dispatch = useDispatch();
  const tempData = useSelector((state) => state.appAuth.tempData);
  const [studentSummary, setStudentSummary] = useState(null);
  const [studentInstallmentData, setStudentInstallmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Refund State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundError, setRefundError] = useState("");

  const dropdownRef = useRef(null);

  const academicStartYear =
    classAndSectionData?.selectedSession?.academicStartYear;

  // Fetch Transactions
  const getStudentSummary = async () => {
    try {
      const start = moment(`${academicStartYear}-04-01`);
      const end = moment();
      // Only fetch if we have a valid student ID
      if (!tempData?.selectedReportsStudentData?._id) return;

      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_TRANSITIONS}?sessionStudentId=${tempData?.selectedReportsStudentData?._id}&limit=${999}&startDate=${start}&endDate=${end}`,
      );

      if (res?.statusCode === 200) {
        setStudentSummary(res?.result?.transactions);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };
  // console.log({tempData});

  const getStudentReports = async () => {
    try {
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_SECTIONS_REPORTS}?sessionStudentId=${tempData?.selectedReportsStudentData?._id}&sectionId=${tempData?.selectedReportsStudentData?.section}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setStudentInstallmentData(res?.result?.[0] ?? null);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    getStudentSummary();
    getStudentReports();
  }, [tempData, academicStartYear]);

  // Send Reminder
  const sendParentReminder = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_REPORT_FEE_REMINDER}`,
        { sessionStudentId: tempData?.selectedReportsStudentData?._id },
      );

      if (res?.statusCode === 200) {
        toast.success(res?.result);
      }
    } catch (e) {
      // console.log("Error sending reminder:", e);
      toast.error("Failed to send reminder");
    } finally {
      setLoading(false);
    }
  };

  // Submit Refund
  const submitRefund = async () => {
    const amount = Number(refundAmount);

    if (!amount || amount <= 0) {
      return setRefundError("Enter a valid refund amount");
    }

    if (amount > selectedTxn?.amount) {
      return setRefundError("Refund amount cannot exceed transaction amount");
    }
    if (amount > tempData?.selectedReportsStudentData?.wallet?.balance) {
      return setRefundError("Refund amount cannot exceed advance balance");
    }

    try {
      setLoading(true);
      const res = await axiosClient.post(`${EndPoints.ADMIN.CREATE_REFUND}`, {
        sessionStudentId: selectedTxn?.sessionStudent,
        paymentId: selectedTxn?.zohoPaymentId,
        amount,
      });

      if (res?.statusCode === 200) {
        toast.success(res?.result?.message ?? "Refund successful");
        setShowRefundModal(false);
        getStudentSummary(); // refresh list
      }
    } catch (e) {
      toast.error("Refund failed");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Financial Summary
  const feeInstallments = studentInstallmentData?.feeInstallments || [];

  const totalFees = feeInstallments.reduce((acc, curr) => {
    const total =
      (curr?.baseAmount ? (curr?.baseAmount ?? 0) : (curr?.amount ?? 0)) +
      (curr?.lateFeeApplied ?? 0);
    return acc + total;
  }, 0);

  const discount = 0;

  const paidAmount = feeInstallments.reduce(
    (acc, curr) => acc + (curr?.amountPaid ?? 0),
    0,
  );

  const interest = feeInstallments.reduce(
    (acc, curr) => acc + (curr?.lateFeeApplied ?? 0),
    0,
  );

  const pendingAmount = feeInstallments.reduce((acc, curr) => {
    if (curr?.amountPaid < curr?.totalPayable) {
      return acc + curr?.baseAmount - curr?.amountPaid;
    }
  }, 0);

  const handleDownloadReceipt = (txn) => {
    // Integration logic for receipt download
    toast.success(`Downloading receipt for ${txn?.zohoPaymentId ?? "NA"}`);
  };

  const deriveInstallmentState = (inst, today = moment()) => {
    const total = Number(inst.totalPayable ?? 0);
    const paid = Number(inst.amountPaid ?? 0);
    const remaining = Math.max(total - paid, 0);

    const isNA = inst?.baseAmount === 0;
    const isPaid = inst?.status === "paid";
    const isOverdue = (inst?.lateFeeApplied ?? 0) > 0;
    const isCurrent = moment(inst?.feeInstallmentDetails?.startDate).isBefore(
      today,
    );

    const isAdvanceCovered =
      isPaid && paid === 0 && (inst.advanceUsed ?? 0) > 0;

    return {
      isNA,
      isPaid,
      isOverdue,
      isCurrent,
      remaining,
      isAdvanceCovered,
    };
  };

  function MonthlyCard({ installment }) {
    const state = deriveInstallmentState(installment);

    const ui = state.isNA
      ? {
        bg: "bg-[#1a1d24]/50",
        border: "border-gray-600",
        text: "text-gray-500",
        label: "Not Set",
        iconBg: "rgba(255,255,255,0.05)",
        icon: <Info className="w-4.5 h-4.5 text-white stroke-[2.5]" />,
      }
      : state.isPaid
        ? {
          bg: "bg-[rgba(0,166,146,0.10)]",
          border: "border-[#4CBC9A]",
          text: "text-[#4CBC9A]",
          label: state.isAdvanceCovered
            ? "Advance Paid"
            : "Payment Completed",
          iconBg: state.isAdvanceCovered ? "#0A81D1" : "#4CBC9A",
          icon: (
            <svg
              className="w-4.5 h-4.5 stroke-[3.5]"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
        }
        : state.isOverdue
          ? {
            bg: "bg-gradient-to-br from-[#2d1a1a] to-[#1a0f0f]",
            border: "border-[#EF4444]",
            text: "text-[#EF4444]",
            label: "Due",
            icon: (
              <AlertCircle className="w-4.5 h-4.5 text-white stroke-[2.5]" />
            ),
          }
          : state.isCurrent
            ? {
              bg: "bg-gradient-to-br from-[#2d2416] to-[#1a1610]",
              border: "border-[#F59E0B]",
              text: "text-[#F59E0B]",
              label: "Pending",
              icon: <Clock className="w-4.5 h-4.5 text-white stroke-[2.5]" />,
            }
            : {
              bg: "bg-gradient-to-br from-[#1a1d28] to-[#0f1216]",
              border: "border-white/20",
              text: "text-gray-400",
              label: "Upcoming",
              icon: <Calendar className="w-4.5 h-4.5 text-white stroke-[2]" />,
            };

    return (
      <div
        className={`${ui.bg} rounded-lg border-l-4 ${ui.border} p-4 shadow-lg`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: ui.iconBg || "rgba(255,255,255,0.1)" }}
            >
              {ui.icon}
            </div>

            <div>
              <h3 className="text-white font-bold">
                {moment(installment?.feeInstallmentDetails?.startDate).format(
                  "MMM",
                )}
              </h3>
              <p className={`text-xs font-semibold ${ui.text}`}>{ui.label}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-white font-bold">
              ₹
              {state.isNA
                ? 0
                : state.isAdvanceCovered
                  ? (installment.amount ?? 0)
                  : state.isPaid
                    ? (installment.amountPaid ?? 0) -
                    (installment.lateFeeApplied ?? 0)
                    : state.isCurrent ? (installment.totalPayable ?? 0) : (installment.amount ?? 0)}
            </span>

            {(installment.lateFeeApplied ?? 0) > 0 && !state.isPaid && (
              <div className="mt-1 bg-[#EF4444] text-white text-xs px-2 py-1 rounded">
                +₹{installment.lateFeeApplied}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster position="top-center" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedView("section");
                dispatch(
                  setTempData({
                    selectedReportsClassTab: "section",
                    selectedReportsStudentData: null,
                  }),
                );
              }}
              className="text-gray-400 hover:text-white hover:bg-[#1a1d24]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span
                onClick={() => {
                  setSelectedView("class");
                  dispatch(
                    setTempData({
                      selectedReportsClassTab: "class",
                      selectedReportsClassData: null,
                      selectedReportsStudentData: null,
                    }),
                  );
                }}
                className="hover:text-white cursor-pointer"
              >
                Reports & Analytics
              </span>
              <ChevronRight className="w-7 h-7" />
              <span
                onClick={() => {
                  setSelectedView("section");
                  dispatch(
                    setTempData({
                      selectedReportsClassTab: "section",
                      selectedReportsStudentData: null,
                    }),
                  );
                }}
                className="hover:text-white cursor-pointer"
              >
                {tempData?.selectedReportsClassData?.className ?? "NA"}{" "}
                {tempData?.selectedReportsClassData?.name ?? ""}
              </span>
              <ChevronRight className="w-7 h-7" />
              <span className="text-[#0A81D1]">
                {tempData?.selectedReportsStudentData?.student?.firstname ?? ""}{" "}
                {tempData?.selectedReportsStudentData?.student?.lastname ?? ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-backgroundBlue15 text-textBlue text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2">
              <img
                src={discountimg}
                alt="d"
                className="size-6 object-contain"
              />
              Dispute
            </button>
            <button
              type="button"
              onClick={() => sendParentReminder()}
              disabled={loading}
              className="bg-backgroundBlue text-textPrimary text-sm font-poppins-regular p-[10px] rounded-md flex justify-center items-center gap-2"
            >
              <img
                src={notification}
                alt="d"
                className="size-6 object-contain"
              />
              Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Title */}
        <h1 className="text-2xl mb-6">Payment Overview</h1>

        {/* Student Info Card */}
        <div className="bg-[#1a1d24] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={studentSummary?.studentPhoto ?? profile}
              alt="Student"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = profile;
              }}
            />
            <div>
              <h2 className="text-xl mb-1">
                {tempData?.selectedReportsStudentData?.student?.firstname}{" "}
                {tempData?.selectedReportsStudentData?.student?.lastname}
              </h2>
              <p className="text-sm text-gray-400">
                Student ID:{" "}
                {tempData?.selectedReportsStudentData?.student?.studentId ??
                  "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Fees (less discount) Card */}
          <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CircleDollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div className="relative inline-block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d24] border border-gray-700 p-4 w-[250px]">
                      <div className="space-y-2">
                        <h4 className="font-medium text-white mb-3">
                          Fee Breakdown
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Annual Tuition:
                            </span>
                            <span className="text-white">
                              ₹ {totalFees - discount - interest}
                            </span>
                          </div>
                          {interest > 0 && (
                            <div className="flex justify-between text-red-500">
                              <span>Interest Applied:</span>
                              <span>+ ₹ {interest ?? 0}</span>
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="flex justify-between text-green-500">
                              <span>Discount Applied:</span>
                              <span>- ₹ {discount ?? 0}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-300">
                                Net Annual Fee:
                              </span>
                              <span className="text-[#0A81D1]">
                                ₹ {totalFees - discount}
                              </span>
                            </div>
                          </div>
                          {/* <div className="flex justify-between text-xs text-gray-500 pt-1">
                          <span>Monthly Fee:</span>
                          <span>₹ {(totalFees - discount) / 12}</span>
                        </div> */}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">
                Total Fees (less discount)
              </p>
              <p className="text-2xl">₹ {totalFees - discount}</p>
              {discount > 0 && (
                <p className="text-xs text-gray-500">
                  Discount: ₹ {discount ?? 0}
                </p>
              )}
            </div>
          </div>

          {/* Fees Accrued Card */}
          <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">
                Fees Accrued (till due date)
              </p>
              <p className="text-2xl text-green-500">₹ {paidAmount ?? 0}</p>
            </div>
          </div>

          {/* Conditional: Pending Amount Card OR Advanced Amount Card */}
          {pendingAmount > 0 ? (
            // Pending Amount Card
            <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Pending Amount</p>
                <p className="text-2xl text-orange-500">₹ {pendingAmount}</p>
              </div>
            </div>
          ) : (
            // Advanced Amount Card
            <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Advanced Amount</p>
                <p className="text-2xl text-purple-500">
                  ₹ {studentInstallmentData?.wallet?.balance ?? 0}
                </p>
              </div>
            </div>
          )}

          {/* Interest Card */}
          <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <CirclePercent className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Interest (if any)</p>
              <p className="text-2xl text-red-500">₹ {interest}</p>
            </div>
          </div>
        </div>

        {/* installment cards */}
        <div className="w-full my-3">
          <div className="mb-6">
            <h2 className="text-white text-2xl font-bold mb-2">
              Monthly Fee Breakdown
            </h2>
            <p className="text-gray-400 text-sm">
              Overview of all monthly installments
            </p>
          </div>

          {/* Monthly Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {feeInstallments?.map((installment, i) => (
              <MonthlyCard key={i} installment={installment} />
            ))}
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-[#1a1d24] rounded-lg p-6">
          {/* Transactions Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg mb-1">Transactions</h2>
              <p className="text-sm text-gray-400">
                Students Paid and Unpaid Status
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            {!studentSummary || studentSummary.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No Transactions Found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-sm text-[#0A81D1]">
                      Transaction ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-[#0A81D1]">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-[#0A81D1]">
                      Refunded
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-[#0A81D1]">
                      Payment Mode
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-[#0A81D1]">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-[#0A81D1]">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-[#0A81D1]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentSummary.map((std, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-800/50 hover:bg-[#0a0a0a]/50"
                    >
                      <td className="py-4 px-4 text-sm">
                        {std?.zohoPaymentId ?? "NA"}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        ₹ {std?.amount ?? 0}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {std?.refundedAmount > 0 ? (
                          <span className="text-textGreen">
                            ₹ {std?.refundedAmount}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span
                          className={`${std?.paymentMethod === "UPI"
                            ? "text-orange-500"
                            : std?.paymentMethod === "Net Banking"
                              ? "text-[#0A81D1]"
                              : "text-gray-300"
                            } uppercase`}
                        >
                          {std?.paymentMethod ?? "NA"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm whitespace-pre-line text-gray-400">
                        {moment(std?.paidAt).format("DD/MM/YYYY hh:mm A")}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(
                            std?.status,
                          )}`}
                        >
                          {getPaymentStatusText(std?.status) ?? "NA"}
                        </span>
                      </td>
                      <td className="py-4 px-2 relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === std?._id ? null : std?._id,
                            )
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
                            {std?.status !== "refunded" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTxn(std);
                                  setRefundAmount("");
                                  setRefundError("");
                                  setShowRefundModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/10 transition"
                              >
                                <img
                                  src={discount}
                                  alt="refund"
                                  className="w-4 h-4"
                                />
                                Refund
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="w-[380px] bg-[#1c1c1c] rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 text-white">Refund Amount</h3>

            <div className="mb-3 text-sm text-gray-400">
              Transaction Amount: ₹{selectedTxn?.amount}
            </div>

            <div className="mb-3 text-sm text-gray-400">
              Advance Balance: ₹
              {tempData?.selectedReportsStudentData?.wallet?.balance ?? 0}
            </div>

            <div className="mb-3 text-sm text-gray-400">
              Refunded Amount should be less than equal to transaction amount
              and advance balance
            </div>

            <input
              type="text"
              value={refundAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setRefundAmount(value);
                setRefundError("");
              }}
              placeholder="Enter refund amount"
              className="w-full px-4 py-3 rounded-lg bg-[#2b2b2b] border border-white/10 text-white outline-none focus:border-[#0A81D1]"
            />

            {refundError && (
              <p className="text-red-400 text-sm mt-2">{refundError}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20"
              >
                Cancel
              </button>

              <button
                onClick={submitRefund}
                className="px-4 py-2 rounded-lg text-sm bg-backgroundBlue text-white"
              >
                Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
