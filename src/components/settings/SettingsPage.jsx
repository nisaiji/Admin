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

function StatusBanner({ message, tone }) {
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
          ? "rgba(52,211,153,0.08)"
          : "rgba(254,64,64,0.08)",
        border: `1px solid ${
          isSuccess ? "rgba(52,211,153,0.18)" : "rgba(254,64,64,0.18)"
        }`,
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0 }} />
      ) : (
        <AlertCircle size={18} color="#fe4040" style={{ flexShrink: 0 }} />
      )}
      <span style={{ color: isSuccess ? "#CFFBE9" : "#FFD2D2", fontSize: 14 }}>
        {message}
      </span>
    </div>
  );
}

function SessionStatus({ status }) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES?.completed;

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

function SessionSummaryCard({ title, body, action }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <p
          style={{
            margin: "0 0 8px",
            color: C.textMuted,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Academic Sessions
        </p>
        <h2 style={{ margin: 0, color: C.text, fontSize: 24 }}>{title}</h2>
      </div>
      <p
        style={{
          margin: 0,
          color: C.sub,
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

function SessionTimelineItem({ session }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "18px 20px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${C.border}`,
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
          <strong style={{ color: C.text, fontSize: 18 }}>
            {session.academicYearLabel}
          </strong>
          <SessionStatus status={session?.status} />
        </div>
        <p style={{ margin: 0, color: C.sub, fontSize: 14 }}>
          {moment(session?.startDate).format("DD MMM YYYY")} to{" "}
          {moment(session?.endDate).format("DD MMM YYYY")}
        </p>
      </div>
      <div
        style={{
          color: C.textMuted,
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

export default function SettingsPage() {
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
        getErrorMessage(error, "Unable to load academic sessions."),
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
      nextSessionDraft,
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
          `Upcoming session ${nextSessionDraft?.academicYearLabel} created successfully.`,
      );
      await loadSessions({ preserveSuccess: true });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Unable to create the upcoming session."),
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
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
                background: "rgba(79,142,247,0.12)",
                border: "1px solid rgba(79,142,247,0.18)",
                color: "#7EB3FF",
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
            <h1 style={{ margin: "0 0 10px", fontSize: 32, color: C.text }}>
              Academic Session Controls
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 720,
                color: C.sub,
                lineHeight: 1.7,
              }}
            >
              Manage the next academic session without duplicating or
              overlapping an existing session window.
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
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.text,
              cursor: isLoading || isCreating ? "not-allowed" : "pointer",
              opacity: isLoading || isCreating ? 0.65 : 1,
            }}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
          {errorMessage ? (
            <StatusBanner message={errorMessage} tone="error" />
          ) : null}
          {successMessage ? (
            <StatusBanner message={successMessage} tone="success" />
          ) : null}
        </div>

        {isLoading ? (
          <SessionSummaryCard
            title="Loading academic sessions"
            body="Fetching the current and upcoming session timeline for this school."
          />
        ) : upcomingSession ? (
          <SessionSummaryCard
            title={`Upcoming session ready: ${upcomingSession?.academicYearLabel}`}
            body={`The next academic session is already scheduled from ${moment(
              upcomingSession?.startDate,
            ).format("DD MMM YYYY")} to ${moment(
              upcomingSession?.endDate,
            ).format(
              "DD MMM YYYY",
            )}. Only one upcoming session can exist at a time.`}
          />
        ) : sessions?.length === 0 ? (
          <SessionSummaryCard
            title="No academic sessions found"
            body="No sessions were returned by the server. Complete onboarding or create an active session before scheduling an upcoming one."
          />
        ) : (
          <SessionSummaryCard
            title={`Next upcoming session: ${nextSessionDraft?.academicYearLabel}`}
            body={`This will create an upcoming session from ${moment(
              nextSessionDraft?.startDate,
            ).format("DD MMM YYYY")} to ${moment(
              nextSessionDraft?.endDate,
            ).format(
              "DD MMM YYYY",
            )}. The app only allows the immediate next academic cycle.`}
            action={
              <>
                <button
                  type="button"
                  onClick={handleCreateUpcomingSession}
                  disabled={Boolean(creationError) || isCreating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 18px",
                    borderRadius: 12,
                    border: "none",
                    background: C.blue,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor:
                      creationError || isCreating ? "not-allowed" : "pointer",
                    opacity: creationError || isCreating ? 0.6 : 1,
                  }}
                >
                  <CalendarDays size={16} />
                  {isCreating
                    ? "Creating session..."
                    : "Create upcoming session"}
                </button>
                {creationError ? (
                  <p
                    role="alert"
                    style={{
                      margin: "14px 0 0",
                      color: "#FFD2D2",
                      fontSize: 14,
                    }}
                  >
                    {creationError}
                  </p>
                ) : null}
              </>
            }
          />
        )}

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: C.text, fontSize: 22 }}>
                Session Timeline
              </h2>
              <p style={{ margin: "6px 0 0", color: C.textSub, fontSize: 14 }}>
                Active, upcoming, and completed academic sessions returned by
                the current API.
              </p>
            </div>
          </div>

          {sessions?.length ? (
            <div style={{ display: "grid", gap: 14 }}>
              {sessions
                ?.slice()
                .reverse()
                .map((session, i) => (
                  <SessionTimelineItem key={i} session={session} />
                ))}
            </div>
          ) : (
            <div
              style={{
                padding: 24,
                borderRadius: 16,
                border: `1px dashed ${C.border}`,
                color: C.textSub,
              }}
            >
              No academic session timeline is available yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
