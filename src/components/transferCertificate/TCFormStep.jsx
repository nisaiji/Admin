import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { AlertCircle, ArrowLeft, Check, CheckCircle2, FileDown, Plus, Printer, X } from "lucide-react";

import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { DEFAULT_CHECKLIST, TC_PROMOTION_OPTIONS } from "./constants";
import { useTCTheme } from "./ThemeContext";
import { CertificateSheet, DropField, InfoGrid, ModalShell, SectionCard, TextField } from "./shared";
import { formatDisplayDate, formatFeeStatus, getClassSectionLabel } from "./utils";
import { showToast } from "../../services/toastService";

const REASON_OPTIONS = [
  { label: "Parent Transfer", value: "PARENT_TRANSFER" },
  { label: "Job Transfer", value: "FAMILY_RELOCATION" },
  { label: "Admission Elsewhere", value: "BETTER_OPPORTUNITY" },
  { label: "Financial Issues", value: "FINANCIAL" },
  { label: "Academic Reasons", value: "ACADEMIC" },
  { label: "Health Issues", value: "MEDICAL" },
  { label: "Disciplinary", value: "DISCIPLINARY" },
  { label: "Other", value: "OTHER" },
];

const CONDUCT_OPTIONS = [
  { label: "Excellent", value: "EXCELLENT" },
  { label: "Very Good", value: "VERY_GOOD" },
  { label: "Good", value: "GOOD" },
  { label: "Satisfactory", value: "SATISFACTORY" },
  { label: "Poor", value: "NEEDS_IMPROVEMENT" },
];

function ChecklistRow({ item, onToggle, onRemove }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      onClick={() => onToggle(item?.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: "9px",
        marginBottom: 6,
        cursor: "pointer",
        background: item?.checked ? "rgba(76,188,154,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${item?.checked ? "rgba(76,188,154,0.2)" : C.borderSoft}`,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "5px",
          flexShrink: 0,
          background: item?.checked ? C.green : "transparent",
          border: `2px solid ${item?.checked ? C.green : C.muted}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {item?.checked ? <Check size={12} color="#fff" strokeWidth={3} /> : null}
      </div>

      <span style={{ flex: 1, fontSize: "14px", color: item.checked ? C.green : C.text, fontWeight: item?.checked ? 600 : 400 }}>
        {item?.label}
      </span>

      {item?.isDefault ? (
        <span
          style={{
            fontSize: "10px",
            padding: "2px 7px",
            borderRadius: 999,
            background: C.blueDim,
            color: C.blue,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Required
        </span>
      ) : (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onRemove(item?.id);
          }}
          style={{
            width: 22,
            height: 22,
            borderRadius: "5px",
            background: C.redDim,
            border: "1px solid rgba(254,64,64,0.2)",
            color: C.red,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function PreviewTCModal({
  previewing,
  onClose,
  onSubmit,
  student,
  leaveReason,
  reasonDescription,
  lastDate,
  conduct,
  promoStatus,
  feeStatusLabel,
  checklist,
  allCleared,
  canSubmit,
  submitting,
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <AnimatePresence>
      {previewing ? (
        <ModalShell
          onClose={onClose}
          header={<span style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>TC Request Preview</span>}
          footer={
            <>
              <button
                onClick={onClose}
                style={{
                  padding: "9px 20px",
                  borderRadius: "9px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={onSubmit}
                disabled={!canSubmit}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 24px",
                  borderRadius: "9px",
                  background: canSubmit ? C.blue : "rgba(10,129,209,0.3)",
                  border: "none",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.6,
                }}
              >
                <FileDown size={14} /> {submitting ? "Sending..." : "Send TC Request"}
              </button>
            </>
          }
        >
          <CertificateSheet
            items={[
              ["Student Name", student?.name],
              ["Parent's Name", student?.mainParentFullName],
              ["Class & Section", getClassSectionLabel(student)],
              ["Admission Number", student?.admissionNumber],
              ["Date of Birth", student?.dob],
              ["Reason for Leaving", leaveReason],
              ["Reason Description", reasonDescription],
              ["Last Date Attended", formatDisplayDate(lastDate)],
              ["Conduct", conduct],
              ["Promotion Status", promoStatus],
              ["Fee Status", feeStatusLabel],
              ["Request Date", formatDisplayDate(new Date())],
              ["Requested By", "Administrator"],
            ]}
          />

          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: "10px",
              background: allCleared ? C.greenDim : C.amberDim,
              border: `1px solid ${allCleared ? "rgba(76,188,154,0.2)" : "rgba(251,191,36,0.2)"}`,
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: allCleared ? C.green : C.amber, marginBottom: 6 }}>CLEARANCE SUMMARY</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {checklist?.map((item) => (
                <span
                  key={item?.id}
                  style={{
                    fontSize: "11px",
                    padding: "3px 9px",
                    borderRadius: 999,
                    fontWeight: 600,
                    background: item?.checked ? "rgba(76,188,154,0.12)" : "rgba(254,64,64,0.1)",
                    color: item?.checked ? C.green : C.red,
                    border: `1px solid ${item?.checked ? "rgba(76,188,154,0.2)" : "rgba(254,64,64,0.2)"}`,
                  }}
                >
                  {item?.checked ? "OK" : "NO"} {item?.label}
                </span>
              ))}
            </div>
          </div>
        </ModalShell>
      ) : null}
    </AnimatePresence>
  );
}

function getRequestReasonValue(label) {
  return REASON_OPTIONS?.find((option) => option.label === label)?.value || "OTHER";
}

function getConductValue(label) {
  return CONDUCT_OPTIONS?.find((option) => option.label === label)?.value || "GOOD";
}

export function TCFormStep({ student, onBack, onRequestSubmitted }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const [leaveReason, setLeaveReason] = useState(REASON_OPTIONS[0].label);
  const [reasonDescription, setReasonDescription] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [conduct, setConduct] = useState(CONDUCT_OPTIONS[0].label);
  const [promoStatus, setPromoStatus] = useState(TC_PROMOTION_OPTIONS[0]);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST.map((item) => ({ ...item })));
  const [newItemText, setNewItemText] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const newItemRef = useRef(null);
  const hasStudentIdentifiers =
    Boolean(student?.studentId) && Boolean(student?.sessionStudentId);
  const allCleared = checklist.every((item) => item.checked);
  const feeStatusLabel = formatFeeStatus(student?.feeStatus);

  const canSubmit =
    hasStudentIdentifiers &&
    Boolean(leaveReason) &&
    Boolean(reasonDescription.trim()) &&
    Boolean(lastDate) &&
    Boolean(conduct) &&
    Boolean(promoStatus) &&
    checklist.length > 0 &&
    checklist.every((item) => item.checked) &&
    !addingItem &&
    !submitting;
  const submitHint = hasStudentIdentifiers
    ? "Complete all fields and clearance items to send the request."
    : "Student data is incomplete. Go back and reselect the student.";

  useEffect(() => {
    if (addingItem) {
      newItemRef.current?.focus();
    }
  }, [addingItem]);

  function toggleCheck(id) {
    setChecklist((current) => current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }

  function addCustomItem() {
    const label = newItemText.trim();
    if (!label) {
      return;
    }

    setChecklist((current) => [...current, { id: `custom-${Date.now()}`, label, checked: false, isDefault: false }]);
    setNewItemText("");
    setAddingItem(false);
  }

  function removeCustomItem(id) {
    setChecklist((current) => current.filter((item) => item.id !== id));
  }

  async function handleSubmit() {
    if (!hasStudentIdentifiers) {
      showToast.error("Student data is incomplete. Please reselect the student.");
      return;
    }

    if (!canSubmit) {
      return;
    }
    const payload = {
      studentId: student?.studentId,
      sessionStudentId: student?.sessionStudentId,
      reason: getRequestReasonValue(leaveReason),
      reasonDescription: reasonDescription.trim(),
      lastAttendanceDate: lastDate,
      conduct: getConductValue(conduct),
      promotionStatus: promoStatus,
      clearanceStatus: checklist.map((item) => ({
        name: item.label,
        status: item.checked,
      })),
    };

    try {
      setSubmitting(true);
      const response = await axiosClient.post(EndPoints.ADMIN.APPLY_TC, payload);
      const successMessage = response?.result?.message || "TC request submitted successfully";

      showToast.success(successMessage);
      setPreviewing(false);
      onRequestSubmitted?.();
    } catch (error) {
      showToast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to submit TC request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "24px 28px 100px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          padding: "14px 20px",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 16px",
            borderRadius: "9px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${C.border}`,
            color: C.sub,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Students
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>{student?.name}</div>
          <div style={{ fontSize: "12px", color: C.muted }}>Class {getClassSectionLabel(student)}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: C.blueDim,
            border: "1px solid rgba(10,129,209,0.25)",
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: C.blue }}>Preparing TC Request</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
        <div>
          <SectionCard title="Student Information" accent={C.blue}>
            <InfoGrid
              items={[
                ["Student Name", student?.name],
                ["Parent's Name", student?.mainParentFullName],
                ["Class", student?.className],
                ["Section", student?.section],
                ["Admission Number", student?.admissionNumber],
                ["Date of Birth", student?.dob],
                ["Gender", student?.gender],
              ]}
            />
          </SectionCard>

          <SectionCard title="Leaving Details" accent={C.amber}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <DropField label="Reason for Leaving" value={leaveReason} onChange={setLeaveReason} options={REASON_OPTIONS.map((option) => option.label)} />
              <DropField label="Conduct" value={conduct} onChange={setConduct} options={CONDUCT_OPTIONS.map((option) => option.label)} />
              <TextField label="Last Date Attended" value={lastDate} onChange={setLastDate} type="date" />
              <DropField label="Promotion Status" value={promoStatus} onChange={setPromoStatus} options={TC_PROMOTION_OPTIONS} />
            </div>

            <div>
              <div style={{ fontSize: "12px", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Reason Description
              </div>
              <textarea
                value={reasonDescription}
                onChange={(event) => setReasonDescription(event.target.value)}
                placeholder="Explain the transfer request..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "9px",
                  background: C.cardAlt,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>
          </SectionCard>

          <SectionCard title="Clearance Checklist" accent={C.green}>
            <div style={{ marginBottom: 12 }}>
              {checklist.map((item) => (
                <ChecklistRow key={item.id} item={item} onToggle={toggleCheck} onRemove={removeCustomItem} />
              ))}

              {addingItem ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: "9px",
                    marginBottom: 6,
                    background: C.orangeDim,
                    border: "1px solid rgba(255,121,63,0.25)",
                  }}
                >
                  <input
                    ref={newItemRef}
                    value={newItemText}
                    onChange={(event) => setNewItemText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        addCustomItem();
                      }

                      if (event.key === "Escape") {
                        setAddingItem(false);
                        setNewItemText("");
                      }
                    }}
                    placeholder="Enter clearance item..."
                    style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontSize: "14px", outline: "none" }}
                  />
                  <button
                    onClick={addCustomItem}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "7px",
                      background: C.orange,
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAddingItem(false);
                      setNewItemText("");
                    }}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "7px",
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${C.border}`,
                      color: C.muted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingItem(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "9px 14px",
                    borderRadius: "9px",
                    marginTop: 4,
                    width: "100%",
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    color: C.muted,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <Plus size={15} /> Add Custom Clearance Item
                </button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                padding: "12px 14px",
                borderRadius: "10px",
                background: allCleared ? "rgba(76,188,154,0.07)" : "rgba(251,191,36,0.07)",
                border: `1px solid ${allCleared ? "rgba(76,188,154,0.2)" : "rgba(251,191,36,0.2)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {allCleared ? <CheckCircle2 size={15} color={C.green} /> : <AlertCircle size={15} color={C.amber} />}
                <span style={{ fontSize: "13px", fontWeight: 600, color: allCleared ? C.green : C.amber }}>
                  {allCleared ? `All ${checklist.length} clearances confirmed` : `${checklist.filter((item) => item.checked).length}/${checklist.length} confirmed`}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div style={{ position: "sticky", top: 80 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: C.blue }} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>TC Request Summary</span>
            </div>

            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Student", student?.name],
                ["Class", getClassSectionLabel(student)],
                ["Reason", leaveReason],
                ["Last Attended", formatDisplayDate(lastDate)],
                ["Conduct", conduct],
                ["Promotion", promoStatus],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "13px" }}>
                  <span style={{ color: C.muted }}>{label}</span>
                  <span style={{ color: C.text, fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{value || "-"}</span>
                </div>
              ))}

              <div style={{ paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
                <div style={{ fontSize: "12px", color: C.muted, fontWeight: 600, marginBottom: 8 }}>DESCRIPTION</div>
                <div style={{ fontSize: "13px", color: reasonDescription.trim() ? C.text : C.muted, lineHeight: 1.5 }}>
                  {reasonDescription.trim() || "Add a reason description to continue."}
                </div>
              </div>

              <div style={{ marginTop: 4, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
                <div style={{ fontSize: "12px", color: C.muted, fontWeight: 600, marginBottom: 8 }}>CLEARANCE</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {checklist.map((item) => (
                    <span
                      key={item.id}
                      style={{
                        fontSize: "10px",
                        padding: "2px 7px",
                        borderRadius: 999,
                        fontWeight: 600,
                        background: item.checked ? C.greenDim : C.redDim,
                        color: item.checked ? C.green : C.red,
                        border: `1px solid ${item.checked ? "rgba(76,188,154,0.2)" : "rgba(254,64,64,0.2)"}`,
                      }}
                    >
                      {item.checked ? "OK" : "NO"} {item.label.replace(" Clearance", "").replace(" (No Objection Certificate)", "")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPreviewing(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px",
              borderRadius: "10px",
              marginBottom: 10,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              color: C.sub,
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Printer size={15} /> Preview TC Request
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px",
              borderRadius: "10px",
              background: canSubmit ? C.blue : "rgba(10,129,209,0.25)",
              border: `1px solid ${canSubmit ? C.blue : "rgba(10,129,209,0.2)"}`,
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            <FileDown size={15} /> {submitting ? "Sending..." : "Send TC Request"}
          </button>

          {!canSubmit ? (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: "9px",
                background: C.amberDim,
                border: "1px solid rgba(251,191,36,0.2)",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: C.amber }}>{submitHint}</span>
            </div>
          ) : null}
        </div>
      </div>

      <PreviewTCModal
        previewing={previewing}
        onClose={() => setPreviewing(false)}
        onSubmit={handleSubmit}
        student={student}
        leaveReason={leaveReason}
        reasonDescription={reasonDescription}
        lastDate={lastDate}
        conduct={conduct}
        promoStatus={promoStatus}
        feeStatusLabel={feeStatusLabel}
        checklist={checklist}
        allCleared={allCleared}
        canSubmit={canSubmit}
        submitting={submitting}
      />
    </div>
  );
}
