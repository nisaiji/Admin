import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, CalendarDays, ChevronDown } from "lucide-react";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { setClassAndSectionData } from "../../../store/AppAuthSlice";
import toast, { Toaster } from "react-hot-toast";
import complete from "../../../assets/images/darkmode/complete.png";
import FeeHeadSetup from "../FeeStructureSetup/Step1";
import OTPVERIFY from "../FeeStructureSetup/OTPVERIFY";

const INITIAL_FEE_HEADS = [];

const FREQUENCIES = [
  { value: "", label: "Select Frequency", description: "" },
  { value: "MONTHLY", label: "Monthly", description: "12 payments per year" },
  {
    value: "BY_MONTHLY",
    label: "Bi-Monthly",
    description: "6 payments per year",
  },
  {
    value: "QUARTERLY",
    label: "Quarterly",
    description: "4 payments per year",
  },
  {
    value: "HALF_YEARLY",
    label: "Half Yearly",
    description: "2 payments per year",
  },
  { value: "YEARLY", label: "Annually", description: "1 payment per year" },
];

const FREQUENCY_MONTHS = {
  MONTHLY: 1,
  BY_MONTHLY: 2,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12,
};

function buildSettings(feeStructureData) {
  return {
    frequency: String(
      feeStructureData?.frequency || feeStructureData?.installmentType || "",
    ).toUpperCase(),
    dueDate: feeStructureData?.dueDate ?? feeStructureData?.dueDayOfMonth ?? "",
  };
}

function buildPreviewPeriods(frequency, sessionStartDate, sessionEndDate) {
  const monthsPerPeriod = FREQUENCY_MONTHS[frequency];

  if (!monthsPerPeriod) {
    return [];
  }

  const sessionStart = moment(sessionStartDate).startOf("month");
  const today = moment().startOf("month");

  // Start from current month if session already started
  const start = moment.max(sessionStart, today);

  const sessionEnd =
    sessionEndDate && moment(sessionEndDate).isValid()
      ? moment(sessionEndDate).endOf("month")
      : sessionStart.clone().add(11, "months").endOf("month");

  if (start.isAfter(sessionEnd)) {
    return [];
  }

  const monthsAvailable = sessionEnd.diff(start, "months") + 1;
  const periodCount = Math.ceil(monthsAvailable / monthsPerPeriod);

  return Array.from({ length: periodCount }, (_, index) => {
    const date = start.clone().add(index * monthsPerPeriod, "months");

    return {
      id: `${frequency}-${index}`,
      label: date.format("MMM YYYY"),
      month: date.format("MMM"),
      year: date.format("YYYY"),
      caption:
        monthsPerPeriod === 1 ? "Monthly" : `${monthsPerPeriod} month cycle`,
    };
  });
}

export default function SchoolFeeSetting({ setSelected }) {
  const dispatch = useDispatch();
  const { classAndSectionData, data: adminData } = useSelector(
    (state) => state.appAuth ?? {},
  );
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? false);
  const theme = {
    bg: isDarkMode ? "bg-[#0B0D14]" : "bg-[#f8fafc]",
    surface: isDarkMode ? "bg-[#111315]" : "bg-white",
    card: isDarkMode ? "bg-[#181b24]" : "bg-white",
    border: isDarkMode ? "border-[#2a2d36]" : "border-slate-200",
    text: isDarkMode ? "text-white" : "text-slate-900",
    subText: isDarkMode ? "text-[#9ca3af]" : "text-slate-500",
    inputBg: isDarkMode ? "bg-[#1f2430]" : "bg-slate-50",
    inputDisabledBg: isDarkMode ? "bg-[#181b24]" : "bg-slate-50",
    inputText: isDarkMode ? "text-[#d1d5db]" : "text-slate-700",
    stepCircle: isDarkMode
      ? "bg-[#111315] text-white border-[#2a2d36]"
      : "bg-white text-[#0f0f0f] border-[#c4c4c4]",
    stepCircleActive: "bg-[#0a81d1] text-white border-[#0a81d1]",
    stepLine: isDarkMode ? "bg-[#2a2d36]" : "bg-[#c4c4c4]",
    statusDone: isDarkMode
      ? "bg-[rgba(76,188,154,0.12)] text-[#4cbc9a]"
      : "bg-green-100 text-green-700",
    statusActive: isDarkMode
      ? "bg-[rgba(10,129,209,0.14)] text-[#7cc3f4]"
      : "bg-backgroundBlue15 text-textBlue",
    statusPending: isDarkMode
      ? "bg-[#1f2430] text-slate-300"
      : "bg-gray-200 text-gray-600",
    previewCard: isDarkMode ? "border-[#2a2d36] bg-[#111315]" : "border-slate-200 bg-slate-50",
    infoBox: isDarkMode ? "bg-[rgba(10,129,209,0.08)] border-[#2a2d36]" : "bg-blue-50 border-blue-100",
  };
  const selectedSessionId = classAndSectionData?.selectedSession?._id;
  const adminPhone = adminData?.phone;

  const isFeeCycleVerified = Boolean(
    classAndSectionData?.feeStructureData?.isVerified,
  );
  const isFeeHeadsVerified = Boolean(
    classAndSectionData?.feeHeadData?.isVerified,
  );
  const allVerified = isFeeCycleVerified && isFeeHeadsVerified;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [otpReqId, setOtpReqId] = useState(null);
  const [feeHeads, setFeeHeads] = useState(INITIAL_FEE_HEADS);
  const [settings, setSettings] = useState(() =>
    buildSettings(classAndSectionData?.feeStructureData),
  );

  const feeCycleId =
    classAndSectionData?.feeStructureData?._id ||
    classAndSectionData?.feeStructureData?.id ||
    "";
  const [savedFeeCycleId, setSavedFeeCycleId] = useState(feeCycleId);
  const feeHeadId = classAndSectionData?.feeHeadData?._id ?? "";

  const stepItems = useMemo(() => {
    if (allVerified) {
      return [
        { id: 1, label: "Fee Cycle Setup" },
        { id: 2, label: "Fee Heads" },
      ];
    }
    return [
      { id: 1, label: "Fee Cycle Setup" },
      { id: 2, label: "Fee Heads" },
      { id: 3, label: "OTP Verification" },
    ];
  }, [allVerified]);

  useEffect(() => {
    const feeStructure = classAndSectionData?.feeStructureData;
    const feeHeadsList = classAndSectionData?.feeHeadData;

    setSettings(buildSettings(feeStructure));
    setSavedFeeCycleId(feeStructure?._id || feeStructure?.id || "");

    let loadedFeeHeads = [];
    if (feeHeadsList) {
      const normalizedHeads = Array.isArray(feeHeadsList)
        ? feeHeadsList
        : feeHeadsList?.feeHeads || [];
      loadedFeeHeads =
        normalizedHeads.map((h) => ({
          id: h?._id,
          name: h?.name,
          type: h?.type || h?.headType,
          headType: h?.type || h?.headType,
          refundable: h?.refundable,
          label: h?.label,
        })) || [];
      setFeeHeads(loadedFeeHeads);
    } else {
      setFeeHeads([]);
    }

    setOtpReqId(null);

    const hasFeeCycle = !!feeStructure;
    const hasFeeHeads = loadedFeeHeads.length > 0;

    const cycleVerified = Boolean(feeStructure?.isVerified);
    const headsVerified = Boolean(feeHeadsList?.isVerified);

    if (hasFeeCycle && hasFeeHeads) {
      if (cycleVerified && headsVerified) {
        setStep(1); // Read-only mode, start at step 1 for viewing
      } else {
        setStep(2); // Keep editing heads until user proceeds to OTP
      }
    } else if (hasFeeCycle && !hasFeeHeads) {
      setStep(2); // Pending fee heads
    } else {
      setStep(1); // Start from scratch
    }
  }, [
    classAndSectionData?.feeStructureData,
    classAndSectionData?.feeHeadData,
    selectedSessionId,
  ]);

  useEffect(() => {
    if (window?.initSendOTP) {
      window.configuration.widgetId = import.meta.env.VITE_PHONE_AND_EMAIL_WIDGET_ID;
      window.configuration.tokenAuth = import.meta.env.VITE_PHONE_AND_EMAIL_AUTH_TOKEN;
      window.initSendOTP(window.configuration);
    }
  }, []);

  const previewPeriods = useMemo(
    () =>
      buildPreviewPeriods(
        settings.frequency,
        classAndSectionData?.selectedSession?.startDate,
        classAndSectionData?.selectedSession?.endDate,
      ),
    [
      classAndSectionData?.selectedSession?.startDate,
      classAndSectionData?.selectedSession?.endDate,
      settings.frequency,
    ],
  );

  const selectedFrequencyMeta = FREQUENCIES.find(
    (item) => item.value === settings.frequency,
  );

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const validateSettings = () => {
    if (!settings.frequency) {
      toast.error("Please select fee frequency.");
      return false;
    }

    if (!settings.dueDate) {
      toast.error("Please enter due date.");
      return false;
    }

    const dueDate = Number(settings.dueDate);

    if (Number.isNaN(dueDate) || dueDate < 1 || dueDate > 28) {
      toast.error("Due date must be between 1 and 28.");
      return false;
    }

    return true;
  };

  const saveFeeCycleSettings = async () => {
    if (!selectedSessionId) {
      toast.error("No active academic session found.");
      return false;
    }

    if (!validateSettings()) return false;

    try {
      setSaving(true);
      const currentFeeCycleId = savedFeeCycleId || feeCycleId;
      const shouldUpdateFeeCycle =
        !isFeeCycleVerified && Boolean(currentFeeCycleId);
      const endpoint = shouldUpdateFeeCycle
        ? `${EndPoints.ADMIN.UPDATE_FEES_STRUCTURE}/${currentFeeCycleId}`
        : EndPoints.ADMIN.CREATE_FEES_STRUCTURE;
      const res = shouldUpdateFeeCycle
        ? await axiosClient.put(endpoint, {
            frequency: settings.frequency,
            dueDate: Number(settings.dueDate),
          })
        : await axiosClient.post(endpoint, {
            sessionId: selectedSessionId,
            frequency: settings.frequency,
            dueDate: Number(settings.dueDate),
          });

      if (res?.statusCode === 201 || res?.statusCode === 200) {
        setSavedFeeCycleId(
          res?.result?._id ||
            res?.result?.feeCycle?._id ||
            res?.result?.id ||
            feeCycleId,
        );
        toast.success(
          res?.result?.message ||
            (shouldUpdateFeeCycle
              ? "School fee settings updated."
              : "School fee settings saved."),
        );

        // Fetch and update redux after create/update
        try {
          const fetchRes = await axiosClient.get(
            `${EndPoints.ADMIN.GET_FEES_STRUCTURE_OF_SCHOOL}/${selectedSessionId}`,
          );
          if (fetchRes?.result) {
            dispatch(
              setClassAndSectionData({
                feeStructureData: fetchRes?.result?.feeCycle ?? null,
              }),
            );
          }
        } catch (fetchErr) {
          console.error("Failed to fetch updated fee structure", fetchErr);
        }

        return true;
      }

      toast.error(res?.result?.message || "Failed to save settings.");
      return false;
    } catch (error) {
      toast.error(error?.message || error || "Failed to save settings.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleProceedToFeeHeads = async () => {
    if (isFeeCycleVerified) {
      setStep(2);
      return;
    }

    if (!validateSettings()) return;

    const saved = await saveFeeCycleSettings();
    if (saved) {
      setStep(2);
    }
  };

  const handleProceedToOtp = async () => {
    if (allVerified) return;

    if (!feeHeads.length) {
      toast.error("Please add at least one fee head.");
      return;
    }

    if (!adminPhone) {
      toast.error("Admin phone number not found.");
      return;
    }

    if (otpReqId) return;

    try {
      setLoading(true);
      await window?.sendOtp(
        `91${adminPhone}`,
        (res) => {
          setOtpReqId(res?.message);
          toast.success("OTP sent successfully");
          setLoading(false);
        },
        (err) => {
          toast.error(err?.message || "Failed to send OTP");
          setLoading(false);
        },
      );
    } catch (error) {
      toast.error(error?.message || error || "Failed to send OTP");
      setLoading(false);
    }
  };

  // Auto-send OTP when landing on Step 3
  useEffect(() => {
    if (step === 3 && !otpReqId && adminPhone && !allVerified) {
      handleProceedToOtp();
    }
  }, [step, otpReqId, adminPhone, allVerified]);

  const handleVerifyOtp = async (code) => {
    try {
      setSaving(true);
      await window?.verifyOtp(
        Number(code),
        async (verifyRes) => {
          try {
            const cycleId = savedFeeCycleId || feeCycleId;
            const headId = feeHeadId;

            // if (!isFeeHeadsVerified && headId) {
            await axiosClient.put(EndPoints.ADMIN.VERIFY_FEES_STRUCTURE, {
              id: headId,
              token: verifyRes?.message,
              type: "VERIFY_FEE_HEAD",
            });
            // }

            toast.success("Verification successful!");
            setSelected("viewSetup");
          } catch (e) {
            toast.error(e?.message || e || "Backend verification failed");
          } finally {
            setSaving(false);
          }
        },
        (err) => {
          toast.error(err?.message || "OTP verification failed");
          setSaving(false);
        },
        otpReqId,
      );
    } catch (error) {
      toast.error(error?.message || error || "Verification failed");
      setSaving(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await window?.retryOtp(
        "11",
        (res) => {
          setOtpReqId(res?.message);
          toast.success("OTP resent successfully");
        },
        (err) => {
          toast.error(err?.message || "Failed to resend OTP");
        },
        otpReqId,
      );
    } catch (error) {
      toast.error(error?.message || error || "Failed to resend OTP");
    }
  };

  const renderStepper = () => (
    <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4 py-4">
      {stepItems.map((item) => {
        const active = step === item.id;
        const done = step > item.id;

        return (
          <div key={item.id} className="flex items-center gap-3">
            {done ? (
              <img src={complete} alt="Complete" className="size-12" />
            ) : (
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold ${active ? theme.stepCircleActive : theme.stepCircle}`}
              >
                {item.id}
              </div>
            )}

            <div>
              <div className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-[#0f0f0f]"}`}>
                {item.label}
              </div>
              <div
                className={`mt-1 inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                  done ? theme.statusDone : active ? theme.statusActive : theme.statusPending
                }`}
              >
                {done ? "Completed" : active ? "In Progress" : "Pending"}
              </div>
            </div>

            {item.id !== stepItems.length && (
              <div className={`mx-1 h-px w-10 ${theme.stepLine}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const academicYear =
    classAndSectionData?.selectedSession?.startDate &&
    classAndSectionData?.selectedSession?.endDate
      ? `${moment(classAndSectionData.selectedSession.startDate).format("D MMM YYYY")} - ${moment(
          classAndSectionData.selectedSession.endDate,
        ).format("D MMM YYYY")}`
      : "--";

  const otpSummaryItems = [
    { label: "Academic Year", value: academicYear },
    { label: "Frequency", value: selectedFrequencyMeta?.label || "--" },
    { label: "Due Date", value: settings.dueDate || "--" },
    { label: "Fee Heads", value: String(feeHeads.length) },
    {
      label: "Preview Periods",
      value: previewPeriods.length ? `${previewPeriods.length} cycle(s)` : "--",
    },
  ];

  return (
    <div className={`min-h-screen ${theme.bg} p-6`}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="mb-6 flex items-center gap-2 text-sm">
        <button
          onClick={() => setSelected("viewSetup")}
          className={`${theme.subText} hover:opacity-80`}
          type="button"
        >
          <ArrowLeft size={18} />
        </button>

        <span className={`${theme.subText}`}>Fee Setup</span>
        <span className={`${theme.subText} opacity-70`}>{">"}</span>
        <span className="font-medium text-blue-600">School Fee Setup</span>
      </div>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme.text}`}>
            School Fee Setup
          </h1>
          <p className={`mt-2 text-sm ${theme.subText}`}>
            Set academic year, frequency, due date rules, and fee heads.
          </p>
        </div>

        <button
          onClick={() => setSelected("viewSetup")}
          className="rounded-lg bg-red-50 px-5 py-3 text-red-500 transition hover:bg-red-100"
          type="button"
        >
          Cancel
        </button>
      </div>

      {renderStepper()}

      {step === 1 && (
        <div className={`rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-sm`}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={`mb-3 block text-sm font-semibold ${theme.text}`}>
                Academic Year
              </label>

              <div className="relative">
                <input
                  disabled
                  value={academicYear}
                  className={`h-12 w-full rounded-xl border ${theme.border} ${theme.inputBg} px-4 ${theme.subText}`}
                />

                <CalendarDays
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div />

            <div>
              <label className={`mb-3 block text-sm font-semibold ${theme.text}`}>
                Frequency
              </label>

              <div className="relative">
                <select
                  disabled={isFeeCycleVerified}
                  value={settings.frequency}
                  onChange={(e) =>
                    handleSettingChange("frequency", e.target.value)
                  }
                  className={`h-12 w-full appearance-none rounded-xl border ${theme.border} px-4 pr-10 outline-none ${
                    isFeeCycleVerified
                      ? `${theme.inputDisabledBg} ${theme.inputText} cursor-not-allowed`
                      : `${theme.surface} ${theme.inputText}`
                  }`}
                >
                  {FREQUENCIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${theme.subText}`}
                />
              </div>
            </div>

            <div>
              <label className={`mb-3 block text-sm font-semibold ${theme.text}`}>
                Due Date
              </label>

              <input
                disabled={isFeeCycleVerified}
                type="number"
                min={1}
                max={28}
                value={settings.dueDate || ""}
                onChange={(e) =>
                  handleSettingChange(
                    "dueDate",
                    e.target.value.replace(/\D/g, ""),
                  )
                }
                placeholder="Enter due date (1-28)"
                className={`h-12 w-full rounded-xl border ${theme.border} px-4 outline-none ${isFeeCycleVerified ? theme.inputDisabledBg + " " + theme.subText + " cursor-not-allowed" : theme.surface}`}
              />

              <p className={`mt-2 text-xs ${theme.subText}`}>
                Due date must be between 1 and 28.
              </p>
            </div>
          </div>

          <div className={`my-8 border-t ${theme.border}`} />

          <div>
            <h3 className={`mb-5 text-lg font-semibold ${theme.text}`}>
              Preview periods
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {previewPeriods.map((period) => (
                <div
                  key={period.id}
                  className={`min-w-[90px] rounded-xl border ${theme.previewCard} p-4 text-center`}
                >
                  <div className={`text-lg font-semibold ${theme.text}`}>
                    {period.month}
                  </div>

                  <div className={`mt-3 ${theme.subText}`}>{period.year}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-6 rounded-xl border ${theme.infoBox} p-4`}>
            <p className={`text-sm ${theme.text}`}>
              Dues will be generated from{" "}
              {classAndSectionData?.selectedSession?.startDate
                ? moment(classAndSectionData.selectedSession.startDate).format(
                    "MMMM YYYY",
                  )
                : "--"}{" "}
              to{" "}
              {classAndSectionData?.selectedSession?.endDate
                ? moment(classAndSectionData.selectedSession.endDate).format(
                    "MMMM YYYY",
                  )
                : "--"}{" "}
              on a {selectedFrequencyMeta?.label?.toLowerCase() || "monthly"}{" "}
              basis. Due date: {settings.dueDate || "--"} of every month.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleProceedToFeeHeads}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              type="button"
            >
              {loading
                ? "Loading..."
                : isFeeCycleVerified
                  ? "Next"
                  : "Save & Continue"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={`rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-sm`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text}`}>Fee Heads</h2>
              <p className={`mt-2 text-sm ${theme.subText}`}>
                Set the fee heads that will be used for this fee cycle.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className={"rounded-lg " + theme.border + " " + theme.surface + " px-5 py-3 text-sm font-semibold " + theme.text + " transition " + (isDarkMode ? "hover:bg-[#1f2430]" : "hover:bg-slate-50")}
            >
              Back to Fee Cycle
            </button>
          </div>

          <div className="mt-6">
            <FeeHeadSetup
              feeHeads={feeHeads}
              setFeeHeads={setFeeHeads}
              sessionId={selectedSessionId}
              readOnly={isFeeHeadsVerified}
            />
          </div>

          <div className="mt-6 flex justify-end">
            {!allVerified ? (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Proceed to OTP
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelected("viewSetup")}
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && !allVerified && (
        <div className={`rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-sm`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text}`}>
                OTP Verification
              </h2>
              <p className={`mt-2 text-sm ${theme.subText}`}>
                Verify the school fee setup before saving it.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className={"rounded-lg " + theme.border + " " + theme.surface + " px-5 py-3 text-sm font-semibold " + theme.text + " transition " + (isDarkMode ? "hover:bg-[#1f2430]" : "hover:bg-slate-50")}
            >
              Back to Setup
            </button>
          </div>

          <OTPVERIFY
            hideStepper
            currentStep={3}
            stepItems={stepItems}
            title="OTP Verification"
            description={`Verify the school fee setup before saving it.`}
            summaryTitle={`You are verifying the school fee setup for:`}
            summaryItems={otpSummaryItems}
            noteDescription={`As per security policy, every creation of a fee setup requires OTP verification by the authorized admin. This ensures accountability and prevents unauthorized changes to fee records.`}
            onBack={() => setStep(2)}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            verifyLabel={saving ? "Verifying..." : "Verify and Create"}
          />
        </div>
      )}
    </div>
  );
}
