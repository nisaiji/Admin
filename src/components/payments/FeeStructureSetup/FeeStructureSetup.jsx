import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

import { C, C_LIGHT } from "../../../utils/constants";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { setTempData } from "../../../store/AppAuthSlice";
import Step2 from "./Step2";
import Step3 from "./Step3";
import OTPVERIFY from "./OTPVERIFY";
import {
  createClassConfig,
  defaultDuePattern,
  deriveCommonAmount,
  formatSectionFeesSummary,
  getSectionId,
  getSectionLabel,
} from "./utils";

import complete from "../../../assets/images/darkmode/complete.png";

const INITIAL_FEE_HEADS = [];

function normalizeSelectedClassFeeStructure(rawStructure, feeHeads) {
  if (!rawStructure) return null;

  const classId =
    rawStructure?.classId ||
    rawStructure?.class?._id ||
    rawStructure?.class?.id ||
    "";

  if (!classId) return null;

  const sectionsSource = Array.isArray(rawStructure?.sections)
    ? rawStructure.sections
    : Array.isArray(rawStructure?.class?.section)
      ? rawStructure.class.section
      : Array.isArray(rawStructure?.applicableSections)
        ? rawStructure.applicableSections
            .map(
              (item) => item?.section || item?.sectionData || item?.sectionInfo,
            )
            .filter(Boolean)
        : [];

  const sections = sectionsSource.map((section, index) => ({
    _id: getSectionId(section, index),
    name: getSectionLabel(section, index),
  }));

  const rows = {};
  const rawRows = rawStructure?.rows || {};
  const applicableSections = Array.isArray(rawStructure?.applicableSections)
    ? rawStructure.applicableSections
    : [];

  feeHeads.forEach((head) => {
    const headId = head?._id || head?.id;
    const existingRow = rawRows?.[headId];

    if (existingRow) {
      rows[headId] = {
        commonAmount: existingRow?.commonAmount ?? "",
        sectionAmounts: existingRow?.sectionAmounts ?? {},
        duePattern:
          existingRow?.duePattern ||
          defaultDuePattern(head?.headType || head?.type),
      };
      return;
    }

    const sectionAmounts = {};
    sections.forEach((section) => {
      const sectionConfig = applicableSections.find((item) => {
        const selectedSectionId =
          item?.section?.sectionId ||
          item?.section?._id ||
          item?.section?.id ||
          item?.sectionId;

        return selectedSectionId === section._id;
      });

      const matchedHead = Array.isArray(sectionConfig?.feeHeads)
        ? sectionConfig.feeHeads.find(
            (feeHead) =>
              (feeHead?.feeHeadId || feeHead?.id || feeHead?._id) === headId,
          )
        : null;

      sectionAmounts[section._id] =
        matchedHead?.amount ?? matchedHead?.feeAmount ?? "";
    });

    rows[headId] = {
      commonAmount: deriveCommonAmount(sectionAmounts),
      sectionAmounts,
      duePattern: defaultDuePattern(head?.headType || head?.type),
    };
  });

  const normalizedClass = {
    _id: classId,
    name:
      rawStructure?.className ||
      rawStructure?.class?.name ||
      rawStructure?.class?.label ||
      "",
    section: sections.map((section) => ({
      _id: section._id,
      name: section.name,
    })),
  };

  const normalizedConfig = createClassConfig(normalizedClass, feeHeads, {
    sectionFeeType:
      rawStructure?.sectionFeeType ||
      (rawStructure?.amountForAllSections ? "same" : "different"),
    rows,
  });

  return {
    selectedClassId: normalizedConfig.classId,
    classConfigs: {
      [normalizedConfig.classId]: normalizedConfig,
    },
  };
}

export default function FeeStructureSetup({ setSelected }) {
  const dispatch = useDispatch();
  const { classAndSectionData, data: adminData } = useSelector(
    (state) => state.appAuth ?? {},
  );
  const tempData = useSelector((state) => state.appAuth?.tempData ?? {});
  const isDarkMode = useSelector(
    (state) => state.appConfig?.isDarkMode ?? false,
  );
  const themeC = isDarkMode ? C : C_LIGHT;
  const selectedSessionId = classAndSectionData?.selectedSession?._id;
  const adminPhone = adminData?.phone;
  const feeCycleId = classAndSectionData?.feeStructureData?._id ?? "";
  const selectedClassFeeStructure = tempData?.selectedClassFeeStructure || null;
  const selectedClassFeeStructureId =
    selectedClassFeeStructure?._id ||
    selectedClassFeeStructure?.id ||
    tempData?.selectedClassFeeStructureId ||
    "";
  const isEditingClassFeeStructure = Boolean(selectedClassFeeStructureId);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpReqId, setOtpReqId] = useState(null);
  const [createdFeeStructureId, setCreatedFeeStructureId] = useState("");
  const rawFeeHeads = Array.isArray(classAndSectionData?.feeHeadData)
    ? classAndSectionData.feeHeadData
    : classAndSectionData?.feeHeadData?.feeHeads || INITIAL_FEE_HEADS;

  const feeHeads = useMemo(() => {
    return rawFeeHeads.map((h) => {
      const typeStr = String(h?.type || h?.headType || "").toUpperCase();
      return {
        ...h,
        id: h._id || h.id,
        type: typeStr === "RECURRING" ? "RECURRING" : "ONE_TIME",
        headType: typeStr === "RECURRING" ? "Recurring" : "One-Time",
      };
    });
  }, [rawFeeHeads]);

  const [structure, setStructure] = useState({
    selectedClassId: "",
    classConfigs: {},
  });

  useEffect(() => {
    if (!selectedClassFeeStructure) return;

    const nextStructure = normalizeSelectedClassFeeStructure(
      selectedClassFeeStructure,
      feeHeads,
    );

    if (nextStructure) {
      setStructure(nextStructure);
    }
  }, [feeHeads, selectedClassFeeStructure]);

  const activeClassConfig =
    structure.classConfigs?.[structure.selectedClassId] || null;

  const otpSummaryItems = useMemo(
    () => [
      { label: "Class", value: activeClassConfig?.className || "--" },
      {
        label: "Academic Session",
        value: classAndSectionData?.selectedSession?.name || "--",
      },
      {
        label: "Section Fee Type",
        value:
          activeClassConfig?.sectionFeeType === "different"
            ? "Different Fee Amount"
            : "Same Fee Amount",
      },
      {
        label: "Fee",
        value: formatSectionFeesSummary(
          structure?.summaryTotals?.sectionTotals,
          activeClassConfig?.sections || [],
        ),
      },
    ],
    [activeClassConfig, classAndSectionData, structure?.summaryTotals?.sectionTotals],
  );

  const stepItems = useMemo(
    () => [
      { id: 1, label: "Fee Structure" },
      { id: 2, label: "Review" },
      { id: 3, label: "OTP Verification" },
    ],
    [],
  );

  useEffect(() => {
    if (window?.initSendOTP) {
      window.configuration.widgetId = import.meta.env.VITE_PHONE_WIDGET_ID;
      window.configuration.tokenAuth = import.meta.env.VITE_PHONE_AUTH_TOKEN;
      window.initSendOTP(window.configuration);
    }
  }, []);

  const sendOtpForCreatedStructure = async () => {
    if (!adminPhone) {
      toast.error("Admin phone number not found.");
      return;
    }

    if (!createdFeeStructureId || otpReqId) return;

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

  useEffect(() => {
    if (step === 3 && !otpReqId && adminPhone && createdFeeStructureId) {
      sendOtpForCreatedStructure();
    }
  }, [step, otpReqId, adminPhone, createdFeeStructureId]);

  const handleProceedToOtp = async () => {
    if (saving) return;

    try {
      setSaving(true);
      const feeStructureId = await handleCreateClassFeeStructure();

      if (!feeStructureId) {
        return;
      }

      setCreatedFeeStructureId(feeStructureId);
      setOtpReqId(null);
      setStep(3);
    } catch (error) {
      toast.error(error?.message || error || "Failed to prepare OTP flow");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtp = async (feeStructureId, token) => {
    if (!feeStructureId) {
      toast.error("Created fee structure id not found.");
      return false;
    }

    await axiosClient.put(EndPoints.ADMIN.VERIFY_FEES_STRUCTURE, {
      id: feeStructureId,
      token,
      type: "VERIFY_FEE_STRUCTURE",
    });

    return true;
  };

  const handleVerifyOtpAndSave = async (code) => {
    try {
      setSaving(true);
      await window?.verifyOtp(
        Number(code),
        async (verifyRes) => {
          try {
            if (!createdFeeStructureId) {
              toast.error("Fee structure id not found.");
              return;
            }

            await handleVerifyOtp(createdFeeStructureId, verifyRes?.message);
            toast.success("Verification successful!");
            await dispatch(
              setTempData({
                selectedClassFeeStructure: null,
                selectedClassFeeStructureId: "",
              }),
            );
            setCreatedFeeStructureId("");
            setSelected("viewSetup");
          } catch (e) {
            toast.error(
              e?.message || e || "Verification failed after OTP verification",
            );
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
  // console.log(feeHeads);

  const handleCreateClassFeeStructure = async () => {
    if (isEditingClassFeeStructure && selectedClassFeeStructure?.isVerified) {
      toast.error("Verified fee structures cannot be updated.");
      return "";
    }

    if (!selectedSessionId) {
      toast.error("No active academic session found.");
      return "";
    }

    if (!feeCycleId) {
      toast.error(
        "Please configure the fee cycle before creating a class fee structure.",
      );
      return "";
    }

    if (!activeClassConfig?.classId) {
      toast.error("Select a class before continuing.");
      return "";
    }

    const applicableSections = activeClassConfig.sections.map((section) => {
      const sectionFeeHeads = feeHeads.map((head) => {
        const row = activeClassConfig.rows?.[head._id];
        let amount = 0;

        if (activeClassConfig.sectionFeeType === "same") {
          amount = Number(row?.commonAmount || 0);
        } else {
          amount = Number(row?.sectionAmounts?.[section.id] || 0);
        }

        return {
          feeHeadId: head._id,
          amount: amount,
        };
      });

      return {
        section: {
          sectionId: section.id,
          name: section.name || section.label || "",
        },
        feeHeads: sectionFeeHeads,
      };
    });
    // console.log(applicableSections);

    try {
      const payload = {
        feeCycleId: feeCycleId,
        sessionId: selectedSessionId,
        classId: activeClassConfig.classId,
        amountForAllSections: activeClassConfig?.sectionFeeType === "same",
        applicableSections,
      };

      const response = await axiosClient[
        isEditingClassFeeStructure ? "put" : "post"
      ](
        isEditingClassFeeStructure
          ? `${EndPoints.ADMIN.UPDATE_CLASS_FEES_STRUCTURE}/${selectedClassFeeStructureId}`
          : EndPoints.ADMIN.CREATE_CLASS_FEES_STRUCTURE,
        payload,
      );

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        const feeStructureId =
          response?.result?.feeStructure?._id ||
          response?.result?.feeStructure?.id ||
          response?.result?._id ||
          response?.result?.id ||
          selectedClassFeeStructureId ||
          response?.result?.feeStructure ||
          "";

        if (!feeStructureId) {
          toast.error("Fee structure id not found.");
        }

        return feeStructureId;
      }

      toast.error(
        response?.result?.message || "Failed to create class fee structure.",
      );
      return "";
    } catch (error) {
      console.log(error);

      toast.error(
        error?.message || error || "Failed to create class fee structure.",
      );
      return "";
    }
  };

  const goBackToList = () => setSelected("viewSetup");

  const handleCancel = async () => {
    await dispatch(
      setTempData({
        selectedClassFeeStructure: null,
        selectedClassFeeStructureId: "",
      }),
    );
    setCreatedFeeStructureId("");
    setOtpReqId(null);
    goBackToList();
  };

  return (
    <div
      className="min-h-full px-6 py-6"
      style={{ background: themeC.bg, color: themeC.text }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold">
              {isEditingClassFeeStructure
                ? "Update Fee Structure"
                : "Create Fee Structure"}
            </h1>
            <p className="mt-1 text-sm" style={{ color: themeC.textSub }}>
              {isEditingClassFeeStructure
                ? "Review and update the selected class fee structure before OTP verification."
                : "Build the fee setup in 3 steps: structure, review, and OTP verification."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="h-10 rounded-md border border-[rgba(255,255,255,0.08)] bg-[#111827] px-4 text-sm font-semibold text-[#e3e8f3] transition-colors hover:bg-[#171b24]"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4 py-4">
          {stepItems.map((item) => {
            const active = step === item.id;
            const done = step > item.id;

            const status = done
              ? {
                  text: "Completed",
                  className: "text-[#4cbc9a] bg-[rgba(76,188,154,0.12)]",
                }
              : active
                ? {
                    text: "In Progress",
                    className: "text-[#4F8EF7] bg-[rgba(10,129,209,0.16)]",
                  }
                : { text: "Pending", className: "text-slate-400 bg-[#1f2430]" };

            return (
              <div key={item.id} className="flex items-center gap-3">
                {done ? (
                  <img src={complete} alt="Complete" className="size-12" />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: active || done ? "#0a81d1" : themeC.surface,
                      color: active || done ? "#fff" : themeC.text,
                      border: `1px solid ${active || done ? "#0a81d1" : themeC.border}`,
                    }}
                  >
                    {item.id}
                  </div>
                )}

                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: active ? themeC.text : themeC.textSub }}
                  >
                    {item.label}
                  </div>

                  <div
                    className={`text-xs px-2 py-1 rounded-md w-fit font-medium ${status.className} ${isDarkMode ? "" : "bg-[#D4DCE2]"}`}
                  >
                    {status.text}
                  </div>
                </div>

                {item.id !== stepItems.length && (
                  <div
                    className="mx-1 h-px w-10"
                    style={{ background: themeC.border }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div>
          {step === 1 && (
            <Step2
              feeHeads={feeHeads}
              structure={structure}
              setStructure={setStructure}
              onBack={goBackToList}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <Step3
              feeHeads={feeHeads}
              structure={structure}
              onBack={() => setStep(1)}
              onFinish={handleProceedToOtp}
              primaryActionLabel="Proceed to OTP"
            />
          )}

          {step === 3 && (
            <OTPVERIFY
              hideStepper
              currentStep={3}
              stepItems={stepItems}
              title="OTP Verification"
              description="Verify the fee structure changes before saving them."
              summaryTitle="You are verifying fee structure changes to:"
              summaryItems={otpSummaryItems}
              noteDescription="As per security policy, every creation of a fee structure requires OTP verification by the authorized admin. This ensures accountability and prevents unauthorized changes to fee records."
              onBack={() => setStep(2)}
              onVerify={handleVerifyOtpAndSave}
              onResend={handleResendOtp}
              verifyLabel={
                saving
                  ? isEditingClassFeeStructure
                    ? "Updating..."
                    : "Creating..."
                  : isEditingClassFeeStructure
                    ? "Verify and Update"
                    : "Verify and Finish"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
