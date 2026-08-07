import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import toast from "react-hot-toast";
import paid from "../../../assets/images/payments/paid.png";
import unpaid from "../../../assets/images/payments/unpaid.png";
import moment from "moment";
import {
  StudentDetailSidebar,
  loadDetailedStudent,
} from "../../studentSetup/studentInfoSidebar";

export default function StudentPaymentInfo({
  student = {},
  studentId = "",
  sessionId = "",
  sessionStudentId = "",
  userInfo = {},
}) {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [studentDues, setstudentDues] = useState([]);
  const [studentHistory, setstudentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const getStudentDues = async () => {
    if (!sessionId || !studentId) {
      setstudentDues([]);
      return;
    }

    const res = await axiosClient.get(
      `${EndPoints.ADMIN.GET_STUDENT_DUES}/${sessionId}/${studentId}`,
    );

    if (res?.statusCode === 200) {
      setstudentDues(
        [...(res?.result?.dues ?? [])].sort(
          (a, b) => new Date(a?.dueDate) - new Date(b?.dueDate),
        ),
      );
    }
  };

  const getStudentHistory = async () => {
    if (!sessionStudentId) {
      setstudentHistory([]);
      return;
    }

    const res = await axiosClient.get(
      `${EndPoints.ADMIN.GET_STUDENT_HISTORY}/${sessionStudentId}?page=1&limit=99`,
    );

    if (res?.statusCode === 200) {
      setstudentHistory(res?.result?.payments ?? []);
    }
  };

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);
      setstudentDues([]);
      setstudentHistory([]);

      try {
        await Promise.all([getStudentDues(), getStudentHistory()]);
      } catch (e) {
        toast.error(e?.message || "Failed to load student payment data");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [studentId, sessionId, sessionStudentId]);

  const paidDues = useMemo(
    () => studentDues.filter((d) => d.status === "PAID"),
    [studentDues],
  );
  const unpaidDues = useMemo(
    () => studentDues.filter((d) => d.status === "PENDING"),
    [studentDues],
  );

  const totalPayable = useMemo(
    () =>
      studentDues.reduce((sum, due) => sum + Number(due?.totalAmount ?? 0), 0),
    [studentDues],
  );

  const paidTotal = useMemo(
    () => paidDues.reduce((sum, due) => sum + Number(due?.totalAmount ?? 0), 0),
    [paidDues],
  );

  const unpaidTotal = useMemo(
    () =>
      unpaidDues.reduce((sum, due) => sum + Number(due?.totalAmount ?? 0), 0),
    [unpaidDues],
  );

  const paymentHistoryDisplayDate = (value) => {
    const date = moment(value);
    return date.isValid() ? date.format("DD MMM YYYY, hh:mm A") : "";
  };

  async function handleShowInfo() {
    try {
      setProfileLoading(true);
      const detailedStudent = await loadDetailedStudent(
        { _id: sessionStudentId },
        "admin",
      );
      setDetailStudent(detailedStudent);
    } catch (error) {
      toast.error(error?.message || "Failed to load student details");
    } finally {
      setProfileLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-[12px] items-start">
        {/* Student info card */}
        <div className="bg-white rounded-[14px] border border-[#e7e2e2] p-[20.8px] w-[484px] flex flex-col gap-[24px]">
          {/* Student header */}
          <div className="flex items-start gap-[12px]">
            <div className="bg-[#0a81d1] rounded-full size-[48px] flex items-center justify-center shrink-0">
              <span className="font-bold text-[16px] text-white font-['Inter',sans-serif]">
                {userInfo?.studentName
                  ?.match(/\b\w/g)
                  ?.slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-[5px] flex-1">
              <p className="font-bold text-[16px] text-[#101828] font-['Inter',sans-serif]">
                {userInfo?.studentName}
              </p>
              <div className="flex flex-col gap-[5px]">
                <div className="flex items-center gap-[16px]">
                  <span className="text-[14px] text-[#444] font-['Inter',sans-serif]">
                    Class
                  </span>
                  <span className="font-medium text-[14px] text-[#1e2939] font-['Inter',sans-serif]">
                    {userInfo?.classAndSection}
                  </span>
                </div>
                <div className="flex items-center gap-[16px]">
                  <span className="text-[14px] text-[#444] font-['Inter',sans-serif]">
                    Phone
                  </span>
                  <span className="font-medium text-[14px] text-[#1e2939] font-['Inter',sans-serif]">
                    {userInfo?.phone}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleShowInfo}
              disabled={profileLoading}
              className="bg-[#0a81d1] rounded-[8px] h-[30px] px-[12px] flex items-center gap-[6px] self-start transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="font-semibold text-[12px] text-white font-['Inter',sans-serif] whitespace-nowrap">
                {profileLoading ? "Loading..." : "View Full Profile"}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3.5 3.5H8.5V8.5"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.5 8.5L8.5 3.5"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Payment summary */}
          <div className="flex flex-col gap-[12px]">
            <p className="font-semibold text-[14px] text-[#6a7282] font-['Inter',sans-serif] capitalize">
              Payment Summary
            </p>
            <div className="flex gap-[8px]">
              <div className="bg-[#eff6ff] rounded-[10px] border border-[#dbeafe] flex flex-col gap-[5px] items-start px-[12.8px] py-[8.8px] w-[142px]">
                <span className="text-[14px] text-[#0a81d1] font-['Inter',sans-serif]">
                  Total Payable
                </span>
                <span className="font-bold text-[16px] text-[#025f9d] font-['Inter',sans-serif]">
                  ₹{totalPayable}
                </span>
              </div>
              <div className="bg-[#f0fdf4] rounded-[10px] border border-[#dcfce7] flex flex-col gap-[5px] items-start px-[12.8px] py-[8.8px] w-[142px]">
                <span className="text-[14px] text-[#008236] font-['Inter',sans-serif]">
                  Collected
                </span>
                <span className="font-bold text-[16px] text-[#016630] font-['Inter',sans-serif]">
                  ₹{paidTotal}
                </span>
              </div>
              <div className="bg-[#fff1f1] rounded-[10px] border border-[#ffe2e2] flex flex-col gap-[5px] items-start px-[12.8px] py-[8.8px] w-[142px]">
                <span className="text-[14px] text-[#fe4040] font-['Inter',sans-serif]">
                  Outstanding
                </span>
                <span className="font-bold text-[16px] text-[#d42c2c] font-['Inter',sans-serif]">
                  ₹{unpaidTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent payments table */}
        <div className="bg-white rounded-[14px] border border-[#e7e2e2] p-[20.8px] flex-1 flex flex-col gap-[12px]">
          <p className="font-bold text-[14px] text-[#101828] font-['Inter',sans-serif]">
            Recent Payments
          </p>

          {/* Table */}
          <div className="rounded-[8px] max-h-44 overflow-scroll border border-[#e7e2e2]">
            {/* Header */}
            <div className="bg-[#f0f6f9] border-b border-[#e7e2e2] flex items-center h-[36px] pl-[10px]">
              {[
                "Payment Ref",
                "Amount",
                "Payment Mode",
                "Date & Time",
                "Status",
              ].map((col) => (
                <div
                  key={col}
                  className="flex-1 px-[8px] font-semibold text-[14px] text-[#002861] font-['Inter',sans-serif] text-center first:text-left"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {studentHistory?.length > 0 ? (
              studentHistory?.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center h-[52px] pl-[10px] ${i < studentHistory?.length - 1 ? "border-b border-[#d0d0d0]/25" : ""} border-l border-r border-[#e7e2e2]`}
                >
                  <div className="flex-1 px-[8px] font-normal text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                    {p?.paymentRef ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] font-semibold text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {p?.amount ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {p?.paymentMode ?? ""}
                  </div>
                  <div className="flex-1 px-[8px] text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                    {paymentHistoryDisplayDate(p?.dateTime)}
                  </div>
                  <div className="flex-1 px-[8px] flex justify-center">
                    <div className="w-[100px] shrink-0 flex justify-center">
                      <div
                        className={`flex items-center justify-center h-[32px] w-[78px] rounded-[6px] ${
                          p?.status === "SUCCESS"
                            ? "bg-[rgba(34,197,94,0.1)] text-[#22c55e]"
                            : p?.status === "FAILED"
                              ? "bg-[rgba(254,64,64,0.1)] text-[#fe4040]"
                              : "bg-[rgba(251,191,36,0.1)] text-[#f59e0b]"
                        }`}
                      >
                        <span className="font-poppins-bold text-[12px] font-['Inter',sans-serif]">
                          {p?.status ?? ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : loading ? (
              <div className="border-l border-r border-[#e7e2e2] px-4 py-6 text-center text-sm text-[#6a7282] font-['Inter',sans-serif]">
                Loading recent payments...
              </div>
            ) : (
              <div className="border-l border-r border-[#e7e2e2] px-4 py-6 text-center text-sm text-[#6a7282] font-['Inter',sans-serif]">
                No payment history found.
              </div>
            )}

            {/* Last row border */}
            <div className="h-[1px] border-l border-r border-b border-[#e7e2e2]" />
          </div>

          {/* Footer */}
          {/* <div className="flex items-center justify-between pt-[8.8px] border-t border-[#f3f4f6]">
            <span className="text-[12px] text-[#686868] font-['Inter',sans-serif]">
              Showing 3 of 6 payments
            </span>
            <button className="font-medium text-[12px] text-[#2563eb] font-['Inter',sans-serif]">
              View complete history →
            </button>
          </div> */}
        </div>
      </div>

      {detailStudent ? (
        <StudentDetailSidebar
          student={detailStudent}
          isDarkMode={isDarkMode}
          onClose={() => setDetailStudent(null)}
        />
      ) : null}

      {/* fee cards */}
      <div className="bg-white rounded-[14px] border border-[#e7e2e2] p-[20px] mt-3">
        <div className="flex items-center justify-between mb-[16px]">
          <p className="font-bold text-[14px] text-[#101828] font-['Inter',sans-serif]">
            Fee Summary
          </p>
          <div className="flex items-center gap-[16px]">
            <span className="font-semibold text-[12px] text-[#22c55e] font-['Inter',sans-serif]">
              Paid ({paidDues?.length})
            </span>
            <span className="font-semibold text-[12px] text-[#fe4040] font-['Inter',sans-serif]">
              Unpaid ({unpaidDues?.length})
            </span>
          </div>
        </div>
        <div className="flex gap-[10px] overflow-x-auto pb-[4px]">
          {studentDues?.map((fee, i) => (
            <div
              key={i}
              className="relative h-[123px] min-w-[84px] w-[84px] rounded-[8px] border border-[#e7e2e2] flex flex-col gap-[10px] items-center pt-[10.8px] pb-[12.8px] px-[12.8px] shrink-0"
            >
              <p className="font-medium text-[12px] text-[#686868] font-['Inter',sans-serif] text-center">
                {moment(fee?.dueDate).format("MMMM")}
              </p>
              {fee?.status === "PAID" ? (
                <img src={paid} alt="Paid" className="size-8 object-contain" />
              ) : (
                <img
                  src={unpaid}
                  alt="Unpaid"
                  className="size-8 object-contain"
                />
              )}
              <div className="flex flex-col items-center">
                <p className="font-semibold text-[12px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                  {fee?.totalAmount}
                </p>
                <p
                  className={`font-semibold text-[10px] font-['Inter',sans-serif] text-center tracking-[0.4px] capitalize ${fee?.status === "PAID" ? "text-[#22c55e]" : "text-[#fe4040]"}`}
                >
                  {fee?.status === "PAID" ? "Paid" : "Unpaid"}
                </p>
              </div>
            </div>
          ))}
          {loading && studentDues.length === 0 ? (
            <div className="flex min-w-[180px] items-center justify-center rounded-[8px] border border-dashed border-[#e7e2e2] px-4 py-6 text-sm text-[#6a7282] font-['Inter',sans-serif]">
              Loading fees...
            </div>
          ) : !loading && studentDues.length === 0 ? (
            <div className="flex min-w-[180px] items-center justify-center rounded-[8px] border border-dashed border-[#e7e2e2] px-4 py-6 text-sm text-[#6a7282] font-['Inter',sans-serif]">
              No dues found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
