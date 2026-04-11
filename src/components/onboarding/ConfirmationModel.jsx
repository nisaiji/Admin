import React from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { motion } from "motion/react";

export function ConfirmationModal({ session, onConfirm, onBack }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          position: "relative",
          zIndex: 1,
          background: "#161B2E",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "0",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* Top accent — solid color */}
        <div
          style={{
            height: "3px",
            background: "#4F8EF7",
          }}
        />

        <div style={{ padding: "32px" }}>
          {/* Close button */}
          <button
            onClick={onBack}
            aria-label="Close dialog"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9CA3AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "rgba(79,142,247,0.12)",
              border: "1px solid rgba(79,142,247,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <AlertTriangle size={26} color="#4F8EF7" />
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#F1F5F9",
              marginBottom: "16px",
              lineHeight: 1.3,
            }}
          >
            Confirm Session Activation
          </h2>

          {/* Body message */}
          <div
            style={{
              background: "rgba(79,142,247,0.07)",
              border: "1px solid rgba(79,142,247,0.18)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                color: "#CBD5E1",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              You are setting up your school for the{" "}
              <span style={{ color: "#7EB3FF", fontWeight: 700 }}>
                {session.year}
              </span>{" "}
              session. All data — including classes, sections, students,
              attendance, and fees — will be created under this session.
            </p>
          </div>

          {/* Warning note */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              padding: "14px 16px",
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.18)",
              borderRadius: "10px",
              marginBottom: "28px",
            }}
          >
            <AlertTriangle size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "14px", color: "#D1B454", lineHeight: 1.6 }}>
              <strong>Please double-check</strong> your selection. Changing the active session later may require re-setting up your school data.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            {/* Go Back */}
            <button
              onClick={onBack}
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94A3B8",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget).style.color = "#CBD5E1";
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget).style.color = "#94A3B8";
              }}
            >
              Go Back
            </button>

            {/* Confirm */}
            <button
              onClick={onConfirm}
              style={{
                flex: 2,
                padding: "14px 20px",
                borderRadius: "12px",
                background: "#4F8EF7",
                border: "none",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget).style.background = "#3B7DE8";
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.background = "#4F8EF7";
              }}
            >
              <CheckCircle2 size={18} />
              Yes, Activate Session
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}