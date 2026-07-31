import React from "react";
import svgPaths from "./svg";

function DetailRow({
  label,
  value,
  valueClass = "text-[#101828] font-medium",
  border = true,
}) {
  return (
    <div
      className={`flex items-start py-[10px] w-full ${border ? "border-b border-[#f3f4f6]" : ""}`}
    >
      <span className="w-52 shrink-0 text-[13px] text-[#6a7282] font-normal">
        {label}
      </span>
      <span className={`text-[13px] ${valueClass}`}>{value}</span>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="flex items-center justify-center size-8 rounded-full bg-[rgba(10,129,209,0.15)]">
        {icon}
      </div>
      <span className="text-[15px] font-bold text-[#101828]">{title}</span>
    </div>
  );
}

function PaymentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d={svgPaths.p5eca500}
        stroke="#2563EB"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
      <path
        d="M1.5 7.5H16.5"
        stroke="#2563EB"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
    </svg>
  );
}

function StudentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d={svgPaths.p399eca00}
        stroke="#0A81D1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
      <path
        d={svgPaths.pc93b400}
        stroke="#0A81D1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d={svgPaths.p19416e00}
        stroke="#0A81D1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
      <path
        d={svgPaths.p3e059a80}
        stroke="#0A81D1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
      <path
        d="M6.66667 6H5.33333"
        stroke="#0A81D1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
      <path
        d="M10.6667 8.66667H5.33333"
        stroke="#0A81D1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
      <path
        d="M10.6667 11.3333H5.33333"
        stroke="#0A81D1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
    </svg>
  );
}

function PaymentDetailsCard() {
  return (
    <div className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col gap-6">
      <SectionHeader icon={<PaymentIcon />} title="Payment Details" />
      <div className="flex flex-col">
        <DetailRow label="Payment ID" value="PAY-0002" />
        <DetailRow label="Payment Reference" value="PAY-0002" />
        <DetailRow
          label="Student Name"
          value="Aarav Sharma"
          valueClass="text-[#2563eb] font-medium"
        />
        <DetailRow label="Class & Section" value="Class 1 A" />
        <DetailRow label="Amount" value="INR 1,000.00" />
        <DetailRow label="Payment Mode" value="UPI" />
        <DetailRow
          label="Provider"
          value="PhonePe"
          valueClass="text-[#101828] font-semibold"
        />
        <DetailRow label="Provider Transaction ID" value="UPI-512345678901" />
        <DetailRow label="Payment Date & Time" value="12/05/2026, 17:00:00" />
        <DetailRow
          label="Status"
          border={false}
          value={
            <span className="bg-[#dcfce7] text-[#008236] text-[12px] font-semibold px-2 py-0.5 rounded">
              SUCCEEDED
            </span>
          }
        />
      </div>
      {/* Success banner */}
      <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#dcfce7] rounded-[10px] px-4 py-2.5">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path
            d={svgPaths.p185087f0}
            stroke="#00A63E"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
          />
          <path
            d={svgPaths.pc274700}
            stroke="#00A63E"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
          />
        </svg>
        <span className="text-[13px] text-[#008236]">
          This payment was completed successfully.
        </span>
      </div>
    </div>
  );
}

function StudentDetailsCard() {
  return (
    <div className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col gap-4">
      <SectionHeader icon={<StudentIcon />} title="Student Details" />
      <div className="flex flex-col">
        <DetailRow label="Admission No." value="ADM-2026-00012" />
        <DetailRow label="Roll No." value="12" />
        <DetailRow label="Phone" value="+91 90000 00001" />
        <DetailRow
          label="Email"
          value="aarav.sharma@example.com"
          border={false}
        />
      </div>
      <button className="flex items-center justify-center gap-1.5 w-full border border-[#e5e7eb] rounded-[10px] py-2 text-[13px] font-medium text-[#364153] hover:bg-gray-50 transition-colors mt-2">
        View full student profile
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d={svgPaths.p2c0cbc0}
            stroke="#364153"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d="M11.0833 7H2.91667"
            stroke="#364153"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
        </svg>
      </button>
    </div>
  );
}

function LinkedReceiptCard() {
  return (
    <div className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col gap-4">
      <SectionHeader icon={<ReceiptIcon />} title="Linked Receipt" />
      <div className="flex flex-col">
        <DetailRow
          label="Receipt Number"
          value="RCP-2026-000184"
          valueClass="text-[#2563eb] font-medium"
        />
        <DetailRow label="Receipt ID" value="RCPT-184" />
        <DetailRow label="Receipt Date & Time" value="12/05/2026, 17:00:05" />
        <DetailRow label="Amount" value="INR 1,000.00" border={false} />
      </div>
      <div className="flex gap-2 h-[37px]">
        <button className="flex-1 border border-[#0a81d1] rounded-lg flex items-center justify-center text-[13px] font-medium text-[#0a81d1] hover:bg-blue-50 transition-colors">
          View Receipt
        </button>
        <button className="flex-1 border border-[#0a81d1] rounded-lg flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#0a81d1] hover:bg-blue-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d={svgPaths.p34aacb00}
              stroke="#0A81D1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.16667"
            />
            <path
              d={svgPaths.p27169580}
              stroke="#0A81D1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.16667"
            />
            <path
              d="M7 8.75V1.75"
              stroke="#0A81D1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.16667"
            />
          </svg>
          Download receipt
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#f4f8fa] font-['Inter',sans-serif]">
      {/* Main content */}
      <main className="">
        {/* Header bar */}
        <div className="bg-[#f4f8fa] px-6 py-5 flex flex-col gap-1.5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[14px]">
            <button className="flex items-center gap-1 text-[#6a7282] font-medium hover:text-[#0a81d1] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d={svgPaths.p33f6b680}
                  stroke="#0A81D1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.16667"
                />
                <path
                  d="M15.8333 10H4.16667"
                  stroke="#0A81D1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.16667"
                />
              </svg>
              Lookups
            </button>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d={svgPaths.p23079900}
                stroke="#99A1AF"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.08333"
              />
            </svg>
            <span className="text-[#0a81d1] font-medium">Payment Lookup</span>
          </div>

          {/* Title + status */}
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-[#101828]">
              Payment lookup
            </h1>
            <div className="flex items-center gap-1.5 bg-[#e6ffef] border border-[rgba(34,197,94,0.5)] rounded-lg px-3 py-1">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d={svgPaths.p1d11280}
                  stroke="#22C55E"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.08333"
                />
                <path
                  d={svgPaths.p3c156f40}
                  stroke="#22C55E"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.08333"
                />
              </svg>
              <span className="text-[12px] font-semibold text-[#22c55e]">
                Payment Found
              </span>
            </div>
          </div>

          {/* Search info */}
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="text-[#6a7282]">
              Searched by:{" "}
              <span className="text-[#364153] font-medium">Payment ID</span>
            </span>
            <div className="h-4 w-px bg-[#acacac]" />
            <span className="text-[#6a7282]">
              Search value:{" "}
              <span className="text-[#364153] font-medium">PAY-0002</span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="px-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
          <PaymentDetailsCard />
          <div className="flex flex-col gap-6">
            <StudentDetailsCard />
            <LinkedReceiptCard />
          </div>
        </div>
      </main>

      <div className="w-full mt-3 bg-white border-t border-[#e5e7eb] h-[56px] flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d={svgPaths.p2ce04800} fill="#0A81D1" />
            <path d={svgPaths.p21520600} fill="#0A81D1" />
            <path d={svgPaths.p799ec00} fill="white" />
          </svg>
          <span className="text-[13px] text-[#0f0f0f]">
            Payment lookup result — showing non-canonical data.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-lg px-4 py-2 text-[14px] font-medium text-[#0a81d1] hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d={svgPaths.p8cdb700}
                stroke="#0A81D1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
              <path
                d="M12.25 12.25L9.74167 9.74167"
                stroke="#0A81D1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
            </svg>
            New search
          </button>
          <button className="flex items-center gap-2 bg-[#0a81d1] rounded-lg px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#0972b8] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d={svgPaths.pd1f0180}
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
              <path
                d={svgPaths.p1c197ec0}
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
              <path
                d="M5.83333 5.25H4.66667"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
              <path
                d="M9.33333 7.58333H4.66667"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
              <path
                d="M9.33333 9.91667H4.66667"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
            </svg>
            View Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
