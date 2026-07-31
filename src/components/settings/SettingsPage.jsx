import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Settings,
} from "lucide-react";
import { C } from "../../utils/constants";
import {
  createSession,
  findUpcomingSession,
  getErrorMessage,
  getImmediateNextSessionDraft,
  getSessions,
  getUpcomingSessionCreationError,
} from "../../services/sessionService";

const LIGHT = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "rgba(15,23,42,0.08)",
  text: "#0f172a",
  sub: "#475569",
  textMuted: "#64748b",
  textSub: "#64748b",
  blue: "#0a81d1",
  successBg: "rgba(21,128,61,0.08)",
  successBorder: "rgba(21,128,61,0.18)",
  successText: "#15803d",
  errorBg: "rgba(220,38,38,0.08)",
  errorBorder: "rgba(220,38,38,0.18)",
  errorText: "#dc2626",
  timelineBg: "#ffffff",
  badgeBlueBg: "rgba(10,129,209,0.08)",
  badgeBlueBorder: "rgba(10,129,209,0.18)",
  badgeBlueText: "#0a81d1",
};

const STATUS_STYLES = {
  active: {
    background: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.28)",
    color: "#34D399",
    label: "Active",
  },
  upcoming: {
    background: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.28)",
    color: "#FBBF24",
    label: "Upcoming",
  },
  completed: {
    background: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.24)",
    color: "#94A3B8",
    label: "Completed",
  },
};

function StatusBanner({ message, tone, isDarkMode }) {
  const isSuccess = tone === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 12,
        background: isSuccess
          ? isDarkMode
            ? "rgba(52,211,153,0.08)"
            : LIGHT.successBg
          : isDarkMode
            ? "rgba(254,64,64,0.08)"
            : LIGHT.errorBg,
        border: `1px solid ${
          isSuccess
            ? isDarkMode
              ? "rgba(52,211,153,0.18)"
              : LIGHT.successBorder
            : isDarkMode
              ? "rgba(254,64,64,0.18)"
              : LIGHT.errorBorder
        }`,
      }}
    >
      {isSuccess ? (
        <CheckCircle2
          size={18}
          color={isDarkMode ? "#34D399" : LIGHT.successText}
          style={{ flexShrink: 0 }}
        />
      ) : (
        <AlertCircle
          size={18}
          color={isDarkMode ? "#fe4040" : LIGHT.errorText}
          style={{ flexShrink: 0 }}
        />
      )}

      <span
        style={{
          color: isSuccess
            ? isDarkMode
              ? "#CFFBE9"
              : LIGHT.successText
            : isDarkMode
              ? "#FFD2D2"
              : LIGHT.errorText,
          fontSize: 14,
        }}
      >
        {message}
      </span>
    </div>
  );
}

function SessionStatus({ status }) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.completed;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: statusStyle.background,
        border: `1px solid ${statusStyle.border}`,
        color: statusStyle.color,
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {status === "upcoming" ? (
        <Clock3 size={13} />
      ) : (
        <CalendarDays size={13} />
      )}
      {statusStyle.label}
    </span>
  );
}

function SessionSummaryCard({ title, body, action, theme }) {
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 24,
        boxShadow:
          theme === LIGHT
            ? "0 10px 30px rgba(15,23,42,0.05)"
            : "none",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <p
          style={{
            margin: "0 0 8px",
            color: theme.textMuted,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Academic Sessions
        </p>

        <h2 style={{ margin: 0, color: theme.text, fontSize: 24 }}>
          {title}
        </h2>
      </div>

      <p
        style={{
          margin: 0,
          color: theme.sub,
          fontSize: 15,
          lineHeight: 1.7,
        }}
      >
        {body}
      </p>

      {action ? <div style={{ marginTop: 20 }}>{action}</div> : null}
    </div>
  );
}

function SessionTimelineItem({ session, theme, isDarkMode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "18px 20px",
        borderRadius: 16,
        background: isDarkMode ? "rgba(255,255,255,0.02)" : theme.timelineBg,
        border: `1px solid ${theme.border}`,
        boxShadow: !isDarkMode ? "0 4px 18px rgba(15,23,42,0.04)" : "none",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <strong style={{ color: theme.text, fontSize: 18 }}>
            {session.academicYearLabel}
          </strong>

          <SessionStatus status={session?.status} />
        </div>

        <p style={{ margin: 0, color: theme.sub, fontSize: 14 }}>
          {moment(session?.startDate).format("DD MMM YYYY")} to{" "}
          {moment(session?.endDate).format("DD MMM YYYY")}
        </p>
      </div>

      <div
        style={{
          color: theme.textMuted,
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          textAlign: "right",
        }}
      >
        Session Window
      </div>
    </div>
  );
}

export default function SettingsPage({ isDarkMode }) {
  const theme = isDarkMode ? C : LIGHT;

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadSessions = useCallback(async ({ preserveSuccess = false } = {}) => {
    setIsLoading(true);
    setErrorMessage("");

    if (!preserveSuccess) {
      setSuccessMessage("");
    }

    try {
      const nextSessions = await getSessions();
      setSessions(nextSessions);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Unable to load academic sessions.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const upcomingSession = findUpcomingSession(sessions);
  const nextSessionDraft = getImmediateNextSessionDraft(sessions);

  const creationError =
    !upcomingSession && sessions?.length
      ? getUpcomingSessionCreationError(sessions, nextSessionDraft)
      : "";

  const handleCreateUpcomingSession = async () => {
    setSuccessMessage("");

    const validationMessage = getUpcomingSessionCreationError(
      sessions,
      nextSessionDraft
    );

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      const response = await createSession({
        academicStartYear: nextSessionDraft?.academicStartYear,
        academicEndYear: nextSessionDraft?.academicEndYear,
        status: "upcoming",
      });

      setSuccessMessage(
        response?.result ||
          `Upcoming session ${nextSessionDraft?.academicYearLabel} created successfully.`
      );

      await loadSessions({ preserveSuccess: true });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Unable to create the upcoming session.")
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
      }}
    >
      <main style={{ padding: "28px 32px 40px", maxWidth: 1120 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                background: isDarkMode
                  ? "rgba(79,142,247,0.12)"
                  : theme.badgeBlueBg,
                border: `1px solid ${
                  isDarkMode
                    ? "rgba(79,142,247,0.18)"
                    : theme.badgeBlueBorder
                }`,
                color: isDarkMode ? "#7EB3FF" : theme.badgeBlueText,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 14,
              }}
            >
              <Settings size={14} />
              Settings
            </div>

            <h1 style={{ margin: "0 0 10px", fontSize: 32, color: theme.text }}>
              Academic Session Controls
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 720,
                color: theme.sub,
                lineHeight: 1.7,
              }}
            >
              Manage the next academic session without duplicating or overlapping
              an existing session window.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadSessions()}
            disabled={isLoading || isCreating}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 16px",
              borderRadius: 12,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              cursor: isLoading || isCreating ? "not-allowed" : "pointer",
              opacity: isLoading || isCreating ? 0.65 : 1,
            }}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
          {errorMessage && (
            <StatusBanner
              message={errorMessage}
              tone="error"
              isDarkMode={isDarkMode}
            />
          )}

          {successMessage && (
            <StatusBanner
              message={successMessage}
              tone="success"
              isDarkMode={isDarkMode}
            />
          )}
        </div>

        {isLoading ? (
          <SessionSummaryCard
            title="Loading academic sessions"
            body="Fetching the current and upcoming session timeline for this school."
            theme={theme}
          />
        ) : upcomingSession ? (
          <SessionSummaryCard
            title={`Upcoming session ready: ${upcomingSession?.academicYearLabel}`}
            body={`The next academic session is already scheduled from ${moment(
              upcomingSession?.startDate
            ).format("DD MMM YYYY")} to ${moment(
              upcomingSession?.endDate
            ).format("DD MMM YYYY")}.`}
            theme={theme}
          />
        ) : sessions?.length === 0 ? (
          <SessionSummaryCard
            title="No academic sessions found"
            body="No sessions were returned by the server."
            theme={theme}
          />
        ) : (
          <SessionSummaryCard
            title={`Next upcoming session: ${nextSessionDraft?.academicYearLabel}`}
            body={`This will create an upcoming session from ${moment(
              nextSessionDraft?.startDate
            ).format("DD MMM YYYY")} to ${moment(
              nextSessionDraft?.endDate
            ).format("DD MMM YYYY")}.`}
            theme={theme}
            action={
              <button
                onClick={handleCreateUpcomingSession}
                disabled={Boolean(creationError) || isCreating}
                style={{
                  padding: "13px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: theme.blue,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {isCreating ? "Creating..." : "Create upcoming session"}
              </button>
            }
          />
        )}

        <section style={{ marginTop: 28 }}>
          <h2 style={{ color: theme.text }}>Session Timeline</h2>

          <div style={{ display: "grid", gap: 14 }}>
            {sessions.map((session, i) => (
              <SessionTimelineItem
                key={i}
                session={session}
                theme={theme}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}