import React from "react";
import {
  CheckCircle2,
  Clock,
  CalendarCheck,
  CalendarX,
  Ban,
} from "lucide-react";
import { C } from "../../utils/constants";

const statusConfig = {
  Current: {
    color: "#34D399",
    bg: "rgba(52,211,153,0.12)",
    border: "#065F46",
    icon: <CalendarCheck size={14} />,
  },
  Upcoming: {
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
    border: "#78350F",
    icon: <Clock size={14} />,
  },
};

export function SessionCard({ session, isSelected, onSelect, themeC = C }) {
  const config = statusConfig[session.status];

  const handleClick = () => {
    onSelect(session.id);
  };

  return (
    <button
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-label={`Select session ${session.year}`}
      style={{
        background: isSelected ? themeC.blueDim : themeC.card,
        border: `2px solid ${isSelected ? themeC.blue : themeC.border}`,
        boxShadow: isSelected ? `0 0 0 3px ${themeC.blueDim}` : "none",
        borderRadius: "14px",
        padding: "24px 20px",
        cursor: "pointer",
        width: "100%",
        height: "100%",
        textAlign: "left",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        opacity: 1,
      }}
    >
      {/* Top row: badges + check */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Status badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "6px",
              background: config.bg,
              border: `1px solid ${config.border}`,
              color: config.color,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
              width: "fit-content",
            }}
          >
            {config.icon}
            {session.status}
          </span>

          {/* Recommended badge */}
          {session.recommended && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: themeC.blueDim,
                border: `1px solid ${themeC.blueDim}`,
                color: themeC.blue,
                fontSize: "11px",
                fontWeight: 600,
                width: "fit-content",
              }}
            >
              ★ Recommended
            </span>
          )}
        </div>

        {/* Check circle */}
        <div
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSelected ? themeC.blue : themeC.borderSoft,
            border: `2px solid ${isSelected ? themeC.blue : themeC.border}`,
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
        >
          {isSelected && (
            <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
          )}
        </div>
      </div>

      {/* Session year */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: isSelected ? themeC.text : themeC.sub,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: "10px",
          fontVariantNumeric: "tabular-nums",
          transition: "color 0.2s ease",
          marginTop: "auto",
        }}
      >
        {session.year}
      </div>

      {/* Description */}
        <div
          style={{
            fontSize: "13px",
            color: isSelected ? themeC.sub : themeC.textMuted,
            transition: "color 0.2s ease",
          }}
        >
        {session.description}
      </div>

      {/* Bottom selected indicator line */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: themeC.blue,
            borderRadius: "0 0 12px 12px",
          }}
        />
      )}
    </button>
  );
}
