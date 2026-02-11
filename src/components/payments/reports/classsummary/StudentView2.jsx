import React, { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    CircleDollarSign,
    Clock,
    CheckCircle2,
    TrendingUp,
    Bell,
    CirclePercent,
    Download,
    IndianRupee,
    ChevronRight,
    MoreVertical,
} from "lucide-react";
import discount from "../../../../assets/images/fees/discount.png";
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

export default function StudentView({
    setSelectedView,
    filterData,
    classAndSectionData,
}) {
    const [studentSummary, setStudentSummary] = useState(null);
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
            if (!filterData?.studentData?._id) return;

            const res = await axiosClient.post(
                `${EndPoints.ADMIN.GET_TRANSITIONS}?sessionStudentId=${filterData?.studentData?._id}&limit=${999}&startDate=${start}&endDate=${end}`
            );

            if (res?.statusCode === 200) {
                setStudentSummary(res?.result?.transactions);
            }
        } catch (e) {
            console.log("Error fetching fee summary:", e);
        }
    };

    useEffect(() => {
        getStudentSummary();
    }, [filterData, academicStartYear]);

    // Send Reminder
    const sendParentReminder = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.post(
                `${EndPoints.ADMIN.GET_REPORT_FEE_REMINDER}`,
                { sessionStudentId: filterData?.studentData?._id }
            );

            if (res?.statusCode === 200) {
                toast.success(res?.result);
            }
        } catch (e) {
            console.log("Error sending reminder:", e);
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
        if (amount > filterData?.studentData?.wallet?.balance ?? 0) {
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
    const feeInstallments = filterData?.studentData?.studentFeeInstallments || [];
    // console.log(feeInstallments);
    const totalFees = feeInstallments.reduce(
        (acc, curr) => acc + (curr?.baseAmount ?? 0) + (curr?.lateFeeApplied ?? 0),
        0
    );

    const paidAmount = feeInstallments.reduce(
        (acc, curr) => acc + (curr?.amountPaid ?? 0),
        0
    );

    const pendingAmount = totalFees - paidAmount;

    const handleDownloadReceipt = (txn) => {
        // Integration logic for receipt download
        toast.success(`Downloading receipt for ${txn?.zohoPaymentId ?? "NA"}`);
    };

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
                            onClick={() => setSelectedView("section")} // Back to Section View
                            className="text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span
                                onClick={() => setSelectedView("class")}
                                className="hover:text-white cursor-pointer"
                            >
                                Reports & Analytics
                            </span>
                            <ChevronRight className="w-7 h-7" />
                            <span
                                onClick={() => setSelectedView("section")}
                                className="hover:text-white cursor-pointer"
                            >
                                {filterData?.className ?? "NA"} {filterData?.name ?? ""}
                            </span>
                            <ChevronRight className="w-7 h-7" />
                            <span className="text-[#0A81D1]">
                                {filterData?.studentData?.student?.firstname ?? ""}{" "}
                                {filterData?.studentData?.student?.lastname ?? ""}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                                {filterData?.studentData?.student?.firstname}{" "}
                                {filterData?.studentData?.student?.lastname}
                            </h2>
                            {/* <p className="text-sm text-gray-400">
                                Roll No: {filterData?.studentData?.student?.rollNumber ?? "N/A"}
                            </p> */}
                        </div>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* Total Fees Card */}
                    <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <CircleDollarSign className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-400">Total Fees</p>
                            <p className="text-2xl">₹ {totalFees.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Paid Amount Card */}
                    <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-400">Paid Amount</p>
                            <p className="text-2xl text-green-500">
                                ₹ {paidAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Pending Amount Card */}
                    <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-400">Pending Amount</p>
                            <p className="text-2xl text-orange-500">
                                ₹ {pendingAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Advance Payment Card */}
                    <div className="bg-[#1a1d24] rounded-lg p-5 border border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-400">Advance Payment</p>
                            <p className="text-2xl text-purple-500">
                                ₹ {filterData?.studentData?.wallet?.balance ?? 0}
                            </p>
                        </div>
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
                                                        std?.status
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
                            Advance Balance: ₹{filterData?.studentData?.wallet?.balance ?? 0}
                        </div>

                        <div className="mb-3 text-sm text-gray-400">
                            Refunded Amount should be less than equal to transaction amount and advance balance
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

