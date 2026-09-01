import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { C, C_LIGHT } from "../../utils/constants";

import {
  Users,
  BookOpen,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  CheckCircle2,
  UserCheck,
  Clock,
  School,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Chart Dropdown ─────────────────────────────────────────── */
export function ChartDropdown({ value, options, onChange }) {
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? true);
  const themeC = isDarkMode ? C : C_LIGHT;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: "8px",
          background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)"}`,
          color: themeC.text,
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {value}
        <ChevronDown
          size={13}
          color={themeC.textSub}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 200,
              background: themeC.card,
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              overflow: "hidden",
              minWidth: "120px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 14px",
                  background: opt === value ? themeC.blueDim : "transparent",
                  border: "none",
                  color: opt === value ? themeC.blue : themeC.text,
                  fontSize: "13px",
                  fontWeight: opt === value ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (opt !== value)
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (opt !== value)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
