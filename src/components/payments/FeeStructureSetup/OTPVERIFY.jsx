import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useSelector } from "react-redux";

function StepBadge({ active, done, index, isDarkMode }) {
  if (done) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a81d1] text-white shadow-[0_0_0_1px_rgba(10,129,209,0.35)]">
        <Check size={18} strokeWidth={3} />
      </div>
    );
  }

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
      style={{
        background: active ? "#0a81d1" : (isDarkMode ? "#111827" : "#ffffff"),
        color: active ? "#ffffff" : (isDarkMode ? "#e3e8f3" : "#0f0f0f"),
        border: `1px solid ${active ? "#0a81d1" : (isDarkMode ? "#2b3242" : "#c4c4c4")}`,
      }}
    >
      {index}
    </div>
  );
}

export default function OTPVERIFY({
  title = "OTP Verification",
  description = "Enter the OTP sent to the authorized admin account.",
  stepItems = [],
  currentStep = 1,
  hideStepper = false,
  summaryTitle = "You are verifying changes to:",
  summaryItems = [],
  noteTitle = "OTP Verification is Mandatory",
  noteDescription = "As per security policy, every creation requires OTP verification by the authorized admin.",
  onBack,
  onVerify,
  onResend,
  verifyLabel = "Verify OTP",
  backLabel = "Back",
  otpLength = 6,
}) {
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? false);
  const [otp, setOtp] = useState(() => Array.from({ length: otpLength }, () => ""));
  const [seconds, setSeconds] = useState(45);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef([]);

  // theme tokens
  const t = {
    card: isDarkMode ? "bg-[#111315] border-[#262b36]" : "bg-white border-[#e7e2e2]",
    innerCard: isDarkMode ? "bg-[#151a23] border-[#262b36]" : "bg-[#f0f6f9] border-[#e7e2e2]",
    summaryCard: isDarkMode ? "bg-[#0b0d14] border-[#262b36]" : "bg-white border-[#e7e2e2]",
    infoBox: isDarkMode ? "bg-[rgba(10,129,209,0.08)] border-[#262b36]" : "bg-blue-50 border-blue-100",
    infoIcon: isDarkMode ? "bg-[rgba(10,129,209,0.18)] text-[#4F8EF7]" : "bg-blue-100 text-blue-600",
    text: isDarkMode ? "text-[#e3e8f3]" : "text-[#0f0f0f]",
    subText: isDarkMode ? "text-slate-400" : "text-[#686868]",
    noteText: isDarkMode ? "text-slate-300" : "text-blue-800",
    otpInput: isDarkMode
      ? "bg-[#0b0d14] border-[#2b3242] text-[#e3e8f3] placeholder:text-slate-500 focus:border-[#0a81d1] focus:ring-[#0a81d1]/20"
      : "bg-white border-[#dfe5eb] text-[#0f0f0f] placeholder:text-[#aaa] focus:border-[#0a81d1] focus:ring-[#0a81d1]/20",
    backBtn: isDarkMode
      ? "border-[#2b3242] bg-[#111827] text-slate-300 hover:bg-[#171b24]"
      : "border-[#e7e2e2] bg-white text-[#0f0f0f] hover:bg-gray-50",
    stepBadgePending: isDarkMode ? "bg-[#1f2430] text-slate-400" : "bg-gray-100 text-gray-500",
    stepBadgeDone: "bg-[rgba(76,188,154,0.12)] text-[#4cbc9a]",
    stepBadgeActive: isDarkMode ? "bg-[rgba(10,129,209,0.16)] text-[#4F8EF7]" : "bg-[rgba(10,129,209,0.1)] text-[#0a81d1]",
    divider: isDarkMode ? "bg-[#2b3242]" : "bg-[#c4c4c4]",
    resendActive: isDarkMode ? "text-slate-300 hover:text-[#4F8EF7]" : "text-[#0a81d1] hover:text-[#0970b8]",
    resendDisabled: isDarkMode ? "text-slate-500" : "text-[#aaa]",
  };

  useEffect(() => {
    setOtp(Array.from({ length: otpLength }, () => ""));
    setSeconds(45);
  }, [otpLength]);

  useEffect(() => {
    if (!seconds) return undefined;

    const timer = setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : current));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const code = useMemo(() => otp.join(""), [otp]);
  const isComplete = otp.every((digit) => digit !== "");

  const handleOtpChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);

    setOtp((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isComplete || submitting) return;

    try {
      setSubmitting(true);
      await onVerify?.(code);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={"rounded-2xl border p-6 shadow-sm " + t.card}>
      {!hideStepper && stepItems.length ? (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 px-4 py-4">
          {stepItems.map((item) => {
            const active = currentStep === item.id;
            const done = currentStep > item.id;

            return (
              <div key={item.id} className="flex items-center gap-3">
                <StepBadge active={active} done={done} index={item.id} isDarkMode={isDarkMode} />

                <div>
                  <div className={"text-sm font-semibold " + t.text}>
                    {item.label}
                  </div>
                  <div
                    className={"mt-1 inline-flex rounded-md px-2 py-1 text-xs font-medium " + (done ? t.stepBadgeDone : active ? t.stepBadgeActive : t.stepBadgePending)}
                  >
                    {done ? "Completed" : active ? "In Progress" : "Pending"}
                  </div>
                </div>

                {item.id !== stepItems.length && (
                  <div className={"mx-1 h-px w-10 " + t.divider} />
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className={"text-[18px] font-bold " + t.text}>{title}</h2>
          <p className={"mt-1 text-sm " + t.subText}>{description}</p>
        </div>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className={"inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors " + t.backBtn}
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className={"rounded-2xl border p-6 " + t.innerCard}>
          <h3 className={"text-lg font-bold " + t.text}>Enter OTP</h3>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                className={"h-[52px] w-[52px] rounded-lg border text-center text-[18px] font-semibold outline-none transition-colors focus:ring-2 " + t.otpInput}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-[#4F8EF7]">
              Resend OTP in 0:{String(seconds).padStart(2, "0")}
            </p>

            <button
              type="button"
              onClick={async () => {
                if (onResend) {
                  await onResend();
                }
                setSeconds(45);
              }}
              disabled={seconds > 0}
              className={"text-[13px] font-medium transition-colors " + (seconds > 0 ? t.resendDisabled : t.resendActive)}
            >
              Resend OTP
            </button>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={!isComplete || submitting}
            className="mt-6 h-11 w-full rounded-md bg-[#0a81d1] text-[14px] font-semibold text-white transition-colors hover:bg-[#0970b8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Verifying..." : verifyLabel}
          </button>
        </div>

        <div className="space-y-4">
          <div className={"rounded-xl border p-5 " + t.infoBox}>
            <div className="flex gap-4">
              <div className={"mt-0.5 h-6 w-6 shrink-0 rounded-full text-center text-sm font-bold " + t.infoIcon}>
                i
              </div>

              <div className="space-y-1">
                <p className={"text-[16px] font-bold " + t.text}>{noteTitle}</p>
                <p className={"text-[14px] leading-relaxed " + t.noteText}>
                  {noteDescription}
                </p>
              </div>
            </div>
          </div>

          {summaryItems.length ? (
            <div className="flex flex-col gap-4">
              <p className={"text-[14px] font-medium " + t.subText}>{summaryTitle}</p>

              <div className={"rounded-[14px] border p-6 text-[14px] font-semibold " + t.summaryCard}>
                <div className="space-y-4">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4">
                      <span className={t.subText}>{item.label}</span>
                      <span className={"text-right " + t.text}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
