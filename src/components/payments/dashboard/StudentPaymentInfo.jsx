import React, { useState } from "react";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import toast from "react-hot-toast";

export default function StudentPaymentInfo({ studentId = "", sessionId = "" }) {
  const [payments, setPayments] = useState([]);
  const [studentDues, setstudentDues] = useState([]);
  const monthFees = [];

  const getStudentDues = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_STUDENT_DUES}/${sessionId}/${studentId}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setstudentDues([]);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <div>
      <div className="flex gap-[12px] items-start">
        {/* Student info card */}
        <div className="bg-white rounded-[14px] border border-[#e7e2e2] p-[20.8px] w-[484px] flex flex-col gap-[24px]">
          {/* Student header */}
          <div className="flex items-start gap-[12px]">
            <div className="bg-[#0a81d1] rounded-full size-[48px] flex items-center justify-center shrink-0">
              <span className="font-bold text-[16px] text-white font-['Inter',sans-serif]">
                AS
              </span>
            </div>
            <div className="flex flex-col gap-[5px] flex-1">
              <p className="font-bold text-[16px] text-[#101828] font-['Inter',sans-serif]">
                Aarav Sharma
              </p>
              <div className="flex flex-col gap-[5px]">
                <div className="flex items-center gap-[16px]">
                  <span className="text-[14px] text-[#444] font-['Inter',sans-serif]">
                    Class
                  </span>
                  <span className="font-medium text-[14px] text-[#1e2939] font-['Inter',sans-serif]">
                    Class 1-A
                  </span>
                </div>
                <div className="flex items-center gap-[16px]">
                  <span className="text-[14px] text-[#444] font-['Inter',sans-serif]">
                    Roll No
                  </span>
                  <span className="font-medium text-[14px] text-[#1e2939] font-['Inter',sans-serif]">
                    12
                  </span>
                </div>
                <div className="flex items-center gap-[16px]">
                  <span className="text-[14px] text-[#444] font-['Inter',sans-serif]">
                    Phone
                  </span>
                  <span className="font-medium text-[14px] text-[#1e2939] font-['Inter',sans-serif]">
                    +91 90000 00001
                  </span>
                </div>
              </div>
            </div>
            <button className="bg-[#0a81d1] rounded-[8px] h-[30px] px-[12px] flex items-center gap-[6px] self-start">
              <span className="font-semibold text-[12px] text-white font-['Inter',sans-serif] whitespace-nowrap">
                View Full Profile
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
                  ₹14,525
                </span>
              </div>
              <div className="bg-[#f0fdf4] rounded-[10px] border border-[#dcfce7] flex flex-col gap-[5px] items-start px-[12.8px] py-[8.8px] w-[142px]">
                <span className="text-[14px] text-[#008236] font-['Inter',sans-serif]">
                  Collected
                </span>
                <span className="font-bold text-[16px] text-[#016630] font-['Inter',sans-serif]">
                  ₹11,000
                </span>
              </div>
              <div className="bg-[#fff1f1] rounded-[10px] border border-[#ffe2e2] flex flex-col gap-[5px] items-start px-[12.8px] py-[8.8px] w-[142px]">
                <span className="text-[14px] text-[#fe4040] font-['Inter',sans-serif]">
                  Outstanding
                </span>
                <span className="font-bold text-[16px] text-[#d42c2c] font-['Inter',sans-serif]">
                  ₹3,525
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent payments card */}
        <div className="bg-white rounded-[14px] border border-[#e7e2e2] p-[20.8px] flex-1 flex flex-col gap-[12px]">
          <p className="font-bold text-[14px] text-[#101828] font-['Inter',sans-serif]">
            Recent Payments
          </p>

          {/* Table */}
          <div className="rounded-[8px] overflow-hidden border border-[#e7e2e2]">
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
            {payments.map((p, i) => (
              <div
                key={p.ref}
                className={`flex items-center h-[52px] pl-[10px] ${i < payments.length - 1 ? "border-b border-[#d0d0d0]/25" : ""} border-l border-r border-[#e7e2e2]`}
              >
                <div className="flex-1 px-[8px] font-normal text-[14px] text-[#0f0f0f] font-['Inter',sans-serif]">
                  {p.ref}
                </div>
                <div className="flex-1 px-[8px] font-semibold text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                  {p.amount}
                </div>
                <div className="flex-1 px-[8px] text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                  {p.mode}
                </div>
                <div className="flex-1 px-[8px] text-[14px] text-[#0f0f0f] font-['Inter',sans-serif] text-center">
                  {p.dateTime}
                </div>
                <div className="flex-1 px-[8px] flex justify-center">
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}

            {/* Last row border */}
            <div className="h-[1px] border-l border-r border-b border-[#e7e2e2]" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-[8.8px] border-t border-[#f3f4f6]">
            <span className="text-[12px] text-[#686868] font-['Inter',sans-serif]">
              Showing 3 of 6 payments
            </span>
            <button className="font-medium text-[12px] text-[#2563eb] font-['Inter',sans-serif]">
              View complete history →
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[14px] border border-[#e7e2e2] p-[20.8px]">
        <div className="flex items-center justify-between mb-[16px]">
          <p className="font-bold text-[14px] text-[#101828] font-['Inter',sans-serif]">
            Fee Summary
          </p>
          <div className="flex items-center gap-[16px]">
            <span className="font-semibold text-[12px] text-[#22c55e] font-['Inter',sans-serif]">
              Paid (7)
            </span>
            <span className="font-semibold text-[12px] text-[#fe4040] font-['Inter',sans-serif]">
              Unpaid (5)
            </span>
          </div>
        </div>
        <div className="flex gap-[10px] overflow-x-auto pb-[4px]">
          {monthFees.map((fee) => (
            <MonthCard key={fee.month} {...fee} />
          ))}
        </div>
      </div>
    </div>
  );
}
