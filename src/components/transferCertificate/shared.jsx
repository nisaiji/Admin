import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { C, CERTIFICATE_SIGNERS } from "./constants";
import { useTCTheme } from "./ThemeContext";
import { avatarColorForId } from "./utils";
import moment from "moment/moment";
import { useSelector } from "react-redux";

const FIELD_LABEL_STYLE = {
  fontSize: "12px",
  color: C.muted,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 6,
};

export function MiniSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  isDarkMode,
}) {
  const C = useTCTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const displayValue = value || placeholder;
  const isActive = Boolean(value) && value !== "All";

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 120 }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 12px",
          width: "100%",
          borderRadius: "10px",
          background: isDarkMode ? C.cardAlt : C.surface,
          border: `1px solid ${
            open ? C.blue : isDarkMode ? C.border : C.borderSoft
          }`,
          color: isActive ? C.text : C.muted,
          fontSize: "13px",
          fontWeight: isActive ? 600 : 500,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: open
            ? isDarkMode
              ? "0 4px 14px rgba(0,0,0,0.25)"
              : "0 4px 14px rgba(15,23,42,0.08)"
            : "none",
        }}
      >
        <span
          style={{
            flex: 1,
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayValue}
        </span>

        <ChevronDown
          size={13}
          color={C.muted}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
            flexShrink: 0,
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
              right: 0,
              zIndex: 300,
              background: C.surface,
              border: `1px solid ${C.borderSoft}`,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: isDarkMode
                ? "0 12px 30px rgba(0,0,0,0.45)"
                : "0 12px 30px rgba(15,23,42,0.12)",
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  color: option === value ? C.blue : C.text,
                  fontSize: "13px",
                  fontWeight: option === value ? 700 : 500,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : C.blueDim;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {option}
                {option === value && <Check size={12} color={C.blue} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div>
      <div style={FIELD_LABEL_STYLE}>{label}</div>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((current) => !current)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: "9px",
            background: isDarkMode ? C.cardAlt : C.surface,
            border: `1px solid ${open ? C.blue : isDarkMode ? C.border : C.borderSoft}`,
            color: C.text,
            fontSize: "14px",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
        >
          <span>{value || placeholder}</span>
          <ChevronDown
            size={14}
            color={C.muted}
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
          />
        </button>
        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.13 }}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                zIndex: 400,
                background: C.surface,
                border: `1px solid ${isDarkMode ? C.border : C.borderSoft}`,
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: isDarkMode 
                  ? "0 10px 28px rgba(0,0,0,0.5)" 
                  : "0 12px 30px rgba(15,23,42,0.12)",
              }}
            >
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    color: option === value ? C.blue : C.text,
                    fontSize: "14px",
                    fontWeight: option === value ? 700 : 400,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = isDarkMode
                      ? "rgba(255,255,255,0.05)"
                      : C.blueDim;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  {option}
                  {option === value ? <Check size={13} color={C.blue} /> : null}
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  type = "text",
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div>
      <div style={FIELD_LABEL_STYLE}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "9px",
          background: readOnly ? "rgba(255,255,255,0.02)" : C.cardAlt,
          border: `1px solid ${readOnly ? "rgba(255,255,255,0.04)" : C.border}`,
          color: readOnly ? C.muted : C.text,
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
          cursor: readOnly ? "default" : "text",
          transition: "border-color 0.15s",
        }}
        max={type === "date" ? moment().format("YYYY-MM-DD") : undefined}
        onFocus={(event) => {
          if (!readOnly) {
            event.currentTarget.style.borderColor = "rgba(10,129,209,0.4)";
          }
        }}
        onBlur={(event) => {
          if (!readOnly) {
            event.currentTarget.style.borderColor = C.border;
          }
        }}
      />
    </div>
  );
}

export function SectionCard({ title, accent = C.blue, children }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        overflow: "visible",
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 20px",
          borderBottom: `1px solid ${C.borderSoft}`,
        }}
      >
        <div
          style={{
            width: 4,
            height: 18,
            borderRadius: 2,
            background: accent,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

export function InfoGrid({ items }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 48px" }}
    >
      {items.map(([label, value]) => (
        <div
          key={label}
          style={{
            display: "flex",
            gap: 0,
            padding: "9px 0",
            borderBottom: `1px solid ${C.borderSoft}`,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: C.muted,
              minWidth: 140,
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
            {value || "-"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Toolbar({
  search,
  setSearch,
  filterClass,
  setFilterClass,
  filterSec,
  setFilterSec,
  count,
  countLabel,
  placeholder = "Search...",
  classOptions = [],
  sectionOptions = [],
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const hasFilter = filterClass !== "All" || filterSec !== "All" || search;
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  return (
    <div
      style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: `1px solid ${C.border}`,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 240,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderRadius: "9px",
          background: C.cardAlt,
          border: `1px solid ${C.border}`,
        }}
      >
        <Search size={14} color={C.muted} style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: C.text,
            fontSize: "13px",
            outline: "none",
          }}
        />
        {search ? (
          <button
            onClick={() => setSearch("")}
            style={{
              background: "transparent",
              border: "none",
              color: C.muted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <X size={13} />
          </button>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: "12px",
            color: C.muted,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Class
        </span>
        <MiniSelect
          value={filterClass}
          options={classOptions}
          onChange={setFilterClass}
          isDarkMode={isDarkMode}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: "12px",
            color: C.muted,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Section
        </span>
        <MiniSelect
          value={filterSec}
          options={sectionOptions}
          onChange={setFilterSec}
          isDarkMode={isDarkMode}
        />
      </div>
      {hasFilter ? (
        <button
          onClick={() => {
            setSearch("");
            setFilterClass("All");
            setFilterSec("All");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "8px 12px",
            borderRadius: "9px",
            background: C.orangeDim,
            border: "1px solid rgba(255,121,63,0.2)",
            color: C.orange,
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <X size={12} /> Reset
        </button>
      ) : null}
      <span
        style={{
          marginLeft: "auto",
          fontSize: "12px",
          color: C.muted,
          whiteSpace: "nowrap",
        }}
      >
        {count} {countLabel}
      </span>
    </div>
  );
}

export function AvatarBadge({ id, label, size = 34, fontSize = 13 }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColorForId(id),
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 800,
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.08)",
      }}
    >
      {(label || "S").charAt(0)}
    </div>
  );
}

export function StatCard({ label, value, color, bg, icon }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "22px", fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: "11px", color: C.muted, fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function TableEmptyState({ icon: Icon, message, colSpan }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: "56px", textAlign: "center" }}>
        {Icon ? (
          <Icon
            size={28}
            color={C.muted}
            style={{ display: "block", margin: "0 auto 10px" }}
          />
        ) : null}
        <div style={{ fontSize: "14px", color: C.muted }}>{message}</div>
      </td>
    </tr>
  );
}

export function ModalShell({
  header,
  onClose,
  children,
  footer,
  maxWidth = 560,
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 14 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#1a1e2e",
          border: `1px solid ${C.border}`,
          borderRadius: "18px",
          maxWidth,
          width: "100%",
          maxHeight: "86vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: `1px solid ${C.border}`,
            position: "sticky",
            top: 0,
            background: "#1a1e2e",
            zIndex: 10,
          }}
        >
          {header}
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.border}`,
              color: C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>{children}</div>

        {footer ? (
          <div
            style={{
              padding: "14px 24px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {footer}
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

export function DetailRows({ items, labelMinWidth = 170 }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return items.map(([label, value]) => (
    <div
      key={label}
      style={{
        display: "flex",
        gap: 0,
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{ fontSize: "13px", color: C.muted, minWidth: labelMinWidth }}
      >
        {label}
      </span>
      <span style={{ fontSize: "13px", color: C.text, fontWeight: 600 }}>
        {value || "-"}
      </span>
    </div>
  ));
}

export function SignatureRow({
  signers = CERTIFICATE_SIGNERS,
  lineWidth = 80,
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 24,
        paddingTop: 14,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      {signers.map((signer) => (
        <div key={signer} style={{ textAlign: "center" }}>
          <div
            style={{
              width: lineWidth,
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 4,
            }}
          />
          <div style={{ fontSize: "10px", color: C.muted }}>{signer}</div>
        </div>
      ))}
    </div>
  );
}

export function CertificateSheet({
  certificateNumber,
  items,
  banner,
  lineWidth = 80,
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <>
      {banner}

      <div
        style={{
          textAlign: "center",
          marginBottom: 18,
          paddingBottom: 16,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 800, color: C.text }}>
          Indira Public School
        </div>
        <div style={{ fontSize: "12px", color: C.muted, marginBottom: 6 }}>
          Affiliated - Est. 1990
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: C.blue,
            letterSpacing: "0.05em",
          }}
        >
          TRANSFER CERTIFICATE
        </div>
        {certificateNumber ? (
          <div style={{ fontSize: "12px", color: C.muted, marginTop: 4 }}>
            {certificateNumber}
          </div>
        ) : null}
      </div>

      <DetailRows items={items} />
      <SignatureRow lineWidth={lineWidth} />
    </>
  );
}
