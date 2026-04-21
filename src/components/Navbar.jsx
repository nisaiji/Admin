/**
 * Navbar.jsx
 *
 * Main navigation bar for the admin dashboard.
 * Uses the modern dark UI design with Lucide icons and Framer Motion animations.
 * Preserves role-based navigation, i18n translations, and logout functionality.
 */
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Bell,
  CreditCard,
  User,
  LogOut,
  HelpCircle,
  UserCog,
  BookOpen,
  Umbrella,
  FileText,
  Lock,
  Megaphone,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logo from "../assets/images/deer logo.png";

/* ─── Colours ────────────────────────────────────────────────── */
const C = {
  nav: "#0a0c12",
  bg: "#13161f",
  border: "rgba(255,255,255,0.07)",
  text: "#E3E8F3",
  sub: "rgba(227,232,243,0.85)",
  muted: "#64748B",
  orange: "#FF793F",
  blue: "#0a81d1",
};

/* ─── Reusable dropdown component ────────────────────────────── */
function NavDrop({ label, items, icon, align = "left" }) {
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
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 13px",
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
          border: `1px solid ${open ? "rgba(255,255,255,0.11)" : "transparent"}`,
          borderRadius: "9px",
          color: open ? C.text : C.sub,
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.color = C.text;
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.color = C.sub;
        }}
      >
        {icon && <span style={{ opacity: 0.8, display: "flex" }}>{icon}</span>}
        {label}
        <ChevronDown
          size={13}
          color={C.muted}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            marginLeft: 1,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              [align === "right" ? "right" : "left"]: 0,
              zIndex: 600,
              background: "#111520",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "13px",
              overflow: "hidden",
              minWidth: "190px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
            }}
          >
            {items.map((item, i) =>
              item.divider ? (
                <div
                  key={i}
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                    margin: "4px 0",
                  }}
                />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    width: "100%",
                    padding: "11px 18px",
                    background: "transparent",
                    border: "none",
                    color: C.text,
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {item.icon && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 26,
                        height: 26,
                        borderRadius: "7px",
                        background: item.iconColor
                          ? `${item.iconColor}18`
                          : "rgba(255,255,255,0.05)",
                        color: item.iconColor || C.muted,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Flat nav button ─────────────────────────────────────────── */
function NavBtn({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 13px",
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
        border: "1px solid transparent",
        borderRadius: "9px",
        color: active ? C.text : C.sub,
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget;
        b.style.color = C.text;
        b.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget;
        b.style.color = active ? C.text : C.sub;
        b.style.background = active ? "rgba(255,255,255,0.06)" : "transparent";
      }}
    >
      {icon && <span style={{ display: "flex", opacity: 0.75 }}>{icon}</span>}
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation();

  const { data, teacherData } = useSelector((state) => state.appAuth);
  const role = useSelector((state) => state.appAuth.role);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const isActive = (path) => location.pathname === path;

  // Logout: clear local storage
  const handleLogout = () => {
    localStorage.clear();
  };

  // Determine avatar initial from user data
  const getAvatarInitial = () => {
    if (role === "classTeacher" || role === "teacher") {
      return teacherData?.name?.charAt(0)?.toUpperCase() || "T";
    }
    if (role === "admin") {
      return data?.name?.charAt(0)?.toUpperCase() || "A";
    }
    return "U";
  };

  // Determine profile photo if available
  const profilePhoto =
    role === "classTeacher" || role === "teacher"
      ? teacherData?.photo
      : role === "admin"
        ? data?.photo
        : null;

  // Determine the profile route
  const profileRoute =
    role === "classTeacher" || role === "teacher"
      ? "/teacher-profile"
      : role === "admin"
        ? "/admin-profile"
        : "/";

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 300,
        height: 60,
        background: C.nav,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: 4,
        userSelect: "none",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginRight: 24,
          flexShrink: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 6px",
          borderRadius: 8,
        }}
      >
        <img src={logo} alt="logo" className="size-9 object-contain" />
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: C.text,
              lineHeight: 1.2,
            }}
          >
            SikshaOS
          </div>
          <div
            style={{ fontSize: "9px", color: C.muted, letterSpacing: "0.05em" }}
          >
            SCHOOL MANAGEMENT
          </div>
        </div>
      </button>

      {/* ── Class Teacher: single "Classroom" link ────────── */}
      {role === "classTeacher" && (
        <NavBtn
          label={t("titles.classRoom")}
          icon={<BookOpen size={14} />}
          active={isActive("/student-menu")}
          onClick={() => navigate("/student-menu")}
        />
      )}

      {/* ── Admin navigation items ────────────────────────── */}
      {role === "admin" && (
        <>
          {/* Setup dropdown */}
          <NavDrop
            label={t("setup")}
            items={[
              {
                label: t("roles.teacher"),
                icon: <UserCog size={13} />,
                iconColor: C.orange,
                onClick: () => navigate("/teacher"),
              },
              {
                label: t("titles.classRoom"),
                icon: <BookOpen size={13} />,
                iconColor: C.orange,
                onClick: () => navigate("/class-setup"),
              },
              {
                label: t("event"),
                icon: <Umbrella size={13} />,
                iconColor: C.orange,
                onClick: () => navigate("/event"),
              },
            ]}
          />

          {/* SIS dropdown */}
          <NavDrop
            label={t("roles.student")}
            items={[
              {
                label: t("roles.student"),
                icon: <GraduationCap size={13} />,
                iconColor: C.blue,
                onClick: () => navigate("/student-information-system"),
              },
              {
                label: "TC",
                icon: <FileText size={13} />,
                iconColor: C.blue,
                onClick: () => navigate("/transfer-certificate"),
              },
            ]}
          />

          {/* Requests dropdown */}
          <NavDrop
            label={t("titles.requests")}
            items={[
              {
                label: "Password Reset",
                icon: <Lock size={13} />,
                iconColor: C.orange,
                onClick: () => navigate("/password-reset-requests"),
              },
              {
                label: t("leaves"),
                icon: <FileText size={13} />,
                iconColor: C.orange,
                onClick: () => navigate("/teacher-leave-requests"),
              },
            ]}
          />

          {/* Notice button */}
          <NavBtn
            label={t("titles.notice")}
            icon={<Megaphone size={14} />}
            active={isActive("/notice")}
            onClick={() => navigate("/notice")}
          />

          {/* Payments button */}
          <NavBtn
            label={t("titles.payments")}
            icon={<CreditCard size={14} />}
            // active={isActive("/payments")}
            // onClick={() => navigate("/payments")}
          />
        </>
      )}

      {/* ── Spacer ───────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Bell notification ─────────────────────────────── */}
      {/* <button
        style={{
          width: 34,
          height: 34,
          borderRadius: "9px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: C.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          marginRight: 4,
        }}
      >
        <Bell size={15} />
        <span
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.orange,
            border: `2px solid ${C.nav}`,
          }}
        />
      </button> */}

      {/* ── User avatar / profile dropdown ────────────────── */}
      <NavDrop
        label=""
        align="right"
        icon={
          profilePhoto ? (
            <img
              src={profilePhoto}
              alt="profile"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#1E3A5F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800,
                color: "#7EB3FF",
              }}
            >
              {getAvatarInitial()}
            </div>
          )
        }
        items={[
          {
            label: t("profile"),
            icon: <User size={13} />,
            iconColor: C.muted,
            onClick: () => navigate(profileRoute),
          },
          {
            label: "Support",
            icon: <HelpCircle size={13} />,
            iconColor: C.muted,
            onClick: () => {},
          },
          { divider: true, label: "" },
          {
            label: t("logout"),
            icon: <LogOut size={13} />,
            iconColor: "#fe4040",
            onClick: () => {
              handleLogout();
              navigate("/login");
            },
          },
        ]}
      />
    </nav>
  );
};

export default Navbar;
