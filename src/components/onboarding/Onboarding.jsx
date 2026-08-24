import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ArrowRight } from "lucide-react";
import { SessionCard } from "./SessionCard";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmationModal } from "./ConfirmationModel";
import { Toaster } from "react-hot-toast";

import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { setSessionCreatedStatus } from "../../store/AppAuthSlice";
import { createSession, getErrorMessage } from "../../services/sessionService";
import { C, C_LIGHT } from "../../utils/constants";
import { showToast } from "../../services/toastService";

const getRealSessions = () => {
  const today = moment();
  const isAfterMarch = today.month() >= 3;
  const currentStart = isAfterMarch ? today.year() : today.year() - 1;

  return [
    {
      id: "current",
      year: `${currentStart} – ${String(currentStart + 1).slice(-2)}`,
      status: "Current",
      description: "Ongoing academic year",
      start: currentStart,
      end: currentStart + 1,
    },
    {
      id: "upcoming",
      year: `${currentStart + 1} – ${String(currentStart + 2).slice(-2)}`,
      status: "Upcoming",
      description: "Next academic year",
      start: currentStart + 1,
      end: currentStart + 2,
    },
  ];
};

const defaultSessions = getRealSessions();

export function OnboardingScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? true);
  const themeC = isDarkMode ? C : C_LIGHT;
  const [selectedId, setSelectedId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const tooltipRef = useRef(null);
  // Close tooltip when clicking outside
  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTooltip]);

  const selectedSession = defaultSessions.find((s) => s.id === selectedId);

  const handleActivate = () => {
    if (selectedSession) setShowConfirm(true);
  };
  // console.log(role, isSessionCreated);

  const handleConfirm = async () => {
    if (!selectedSession) return;
    try {
      const res = await createSession({
        academicStartYear: selectedSession?.start,
        academicEndYear: selectedSession?.end,
        status: selectedSession?.id === "current" ? "ACTIVE" : "UPCOMING",
      });

      if (res?.statusCode === 200 || res?.statusCode === 201) {
        showToast.success(res?.result);
        dispatch(setSessionCreatedStatus(true));
        setShowConfirm(false);
        navigate("/", { replace: true });
      }
    } catch (error) {
      showToast.error(getErrorMessage(error, "Error creating session."));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: themeC.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
      }}
    >
      <Toaster />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: "680px",
        }}
      >
        <div
          style={{
            background: themeC.card,
            border: `1px solid ${themeC.border}`,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: isDarkMode
              ? "0 8px 40px rgba(0,0,0,0.4)"
              : "0 18px 40px rgba(15,23,42,0.12)",
          }}
        >
          {/* Top accent bar */}
          <div style={{ height: "3px", background: themeC.blue }} />

          <div style={{ padding: "40px 40px 36px" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: 700,
                      color: themeC.text,
                      margin: 0,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.3,
                    }}
                  >
                    Select Academic Session
                  </h1>
                  <p
                    style={{
                      fontSize: "15px",
                      color: themeC.sub,
                      margin: "10px 0 0",
                      lineHeight: 1.7,
                    }}
                  >
                    Choose the session for which you want to set up and manage
                    your school data.
                  </p>
                </div>

                {/* Info icon with tooltip */}
                <div
                  ref={tooltipRef}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    marginTop: "4px",
                  }}
                >
                  <button
                    aria-label="What does selecting a session mean?"
                    aria-expanded={showTooltip}
                    onClick={() => setShowTooltip((prev) => !prev)}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: themeC.blueDim,
                        border: `1px solid ${showTooltip ? themeC.blue : themeC.border}`,
                        color: themeC.blue,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Info size={18} />
                  </button>

                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 10px)",
                          right: 0,
                          width: "280px",
                          background: themeC.card,
                          border: `1px solid ${themeC.border}`,
                          borderRadius: "12px",
                          padding: "16px",
                          zIndex: 100,
                          boxShadow: isDarkMode
                            ? "0 8px 32px rgba(0,0,0,0.5)"
                            : "0 8px 32px rgba(15,23,42,0.12)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "14px",
                            width: "12px",
                            height: "12px",
                            background: themeC.card,
                            border: `1px solid ${themeC.border}`,
                            borderBottom: "none",
                            borderRight: "none",
                            transform: "rotate(45deg)",
                          }}
                        />
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: themeC.sub,
                            lineHeight: 1.65,
                          }}
                        >
                          <span
                            style={{
                              color: themeC.blue,
                              fontWeight: 600,
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Why does this matter?
                          </span>
                          All classes, students, attendance records, and fee
                          structures will belong to the session you activate
                          here. This keeps your school data organized by year.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: themeC.border,
                marginBottom: "28px",
              }}
            />

            {/* Session cards — 2 equal columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "14px",
                marginBottom: "28px",
              }}
            >
              {defaultSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.08,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <SessionCard
                    session={session}
                    isSelected={selectedId === session.id}
                    themeC={themeC}
                    onSelect={setSelectedId}
                  />
                </motion.div>
              ))}
            </div>

            {/* Selection hint */}
            <AnimatePresence>
              {selectedSession && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: "24px" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      background: themeC.greenDim,
                      border: `1px solid ${themeC.greenDim}`,
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: themeC.green,
                        boxShadow: `0 0 8px ${themeC.greenDim}`,
                        flexShrink: 0,
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: themeC.green,
                        fontWeight: 500,
                      }}
                    >
                      You have selected <strong>{selectedSession.year}</strong>{" "}
                      — click <strong>"Activate &amp; Continue"</strong> to
                      proceed.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: themeC.border,
                marginBottom: "28px",
              }}
            />

            {/* Activate button — full width */}
            <button
              onClick={handleActivate}
              disabled={!selectedId}
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "15px 28px",
                borderRadius: "12px",
                background: selectedId ? themeC.blue : themeC.borderSoft,
                border: `1px solid ${selectedId ? themeC.blue : themeC.border}`,
                color: selectedId ? "#fff" : themeC.textMuted,
                fontSize: "16px",
                fontWeight: 700,
                cursor: selectedId ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                opacity: selectedId ? 1 : 0.45,
              }}
              onMouseEnter={(e) => {
                if (selectedId) e.currentTarget.style.background = isDarkMode ? "#3B7DE8" : "#2563eb";
              }}
              onMouseLeave={(e) => {
                if (selectedId) e.currentTarget.style.background = themeC.blue;
              }}
            >
              Activate &amp; Continue
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Card footer */}
          <div
              style={{
                padding: "16px 40px",
                borderTop: `1px solid ${themeC.border}`,
                background: isDarkMode ? "rgba(0,0,0,0.15)" : themeC.card,
                display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Info size={14} color={themeC.textSub} />
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: themeC.textSub,
                lineHeight: 1.5,
              }}
            >
              You can always manage sessions later from{" "}
              <strong style={{ color: themeC.textMuted }}>
                Settings → Academic Sessions
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "28px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          {[
            { emoji: "🔒", label: "Secure & Private" },
            { emoji: "📊", label: "Organized by Session" },
            { emoji: "⚡", label: "Quick to Set Up" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: themeC.textSub,
              }}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedSession && (
          <ConfirmationModal
            session={selectedSession}
            onConfirm={handleConfirm}
            onBack={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
