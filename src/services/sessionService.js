import moment from "moment";
import { axiosClient } from "./axiosClient";
import EndPoints from "./EndPoints";

const DATE_FORMAT = "YYYY-MM-DD";
const SESSION_STATUS_MAP = {
  active: "active",
  upcoming: "upcoming",
  completed: "completed",
};

const getCurrentAcademicStartYear = (referenceDate = moment()) =>
  referenceDate.month() >= 3 ? referenceDate.year() : referenceDate.year() - 1;

export const getAcademicYearLabel = (academicStartYear, academicEndYear) =>
  `${academicStartYear}-${String(academicEndYear).slice(-2)}`;

export const getSessionDateRange = (academicStartYear, academicEndYear) => ({
  startDate: moment(`${academicStartYear}-04-01`, DATE_FORMAT).format(
    DATE_FORMAT,
  ),
  endDate: moment(`${academicEndYear}-03-31`, DATE_FORMAT).format(DATE_FORMAT),
});

const getNormalizedStatus = (session) => {
  if (session?.status) {
    return SESSION_STATUS_MAP[session.status] || session.status;
  }
  return "";
};

export const normalizeSession = (session) => {
  if (!session) {
    return null;
  }

  const academicStartYear = Number(
    session?.academicStartYear ?? session?.startYear,
  );
  const academicEndYear = Number(session?.academicEndYear ?? session?.endYear);

  if (!academicStartYear || !academicEndYear) {
    return null;
  }

  const { startDate, endDate } = getSessionDateRange(
    academicStartYear,
    academicEndYear,
  );

  return {
    ...session,
    id: session?._id || session?.id || null,
    academicStartYear,
    academicEndYear,
    academicYearLabel: getAcademicYearLabel(academicStartYear, academicEndYear),
    startDate,
    endDate,
    status: getNormalizedStatus(session),
  };
};

export const normalizeSessions = (sessions = []) =>
  sessions
    .map(normalizeSession)
    .filter(Boolean)
    .sort((left, right) => left.academicStartYear - right.academicStartYear);

export const buildSessionDraft = (
  academicStartYear,
  academicEndYear = academicStartYear + 1,
  status = "upcoming",
) => ({
  academicStartYear,
  academicEndYear,
  academicYearLabel: getAcademicYearLabel(academicStartYear, academicEndYear),
  status,
  ...getSessionDateRange(academicStartYear, academicEndYear),
});

export const findUpcomingSession = (sessions = []) =>
  normalizeSessions(sessions).find((session) => session.status === "upcoming");

export const getImmediateNextSessionDraft = (
  sessions = [],
  referenceDate = moment(),
) => {
  const normalizedSessions = normalizeSessions(sessions);
  const latestAcademicStartYear = normalizedSessions.length
    ? normalizedSessions[normalizedSessions.length - 1].academicStartYear
    : getCurrentAcademicStartYear(referenceDate);

  return buildSessionDraft(latestAcademicStartYear + 1);
};

export const hasSessionWithAcademicYears = (sessions = [], candidate) =>
  normalizeSessions(sessions).some(
    (session) =>
      session.academicStartYear === candidate?.academicStartYear &&
      session.academicEndYear === candidate?.academicEndYear,
  );

export const hasOverlappingSession = (sessions = [], candidate) => {
  const normalizedCandidate = normalizeSession(candidate);

  if (!normalizedCandidate) {
    return false;
  }

  const candidateStart = moment(normalizedCandidate.startDate, DATE_FORMAT);
  const candidateEnd = moment(normalizedCandidate.endDate, DATE_FORMAT);

  return normalizeSessions(sessions).some((session) => {
    const sessionStart = moment(session.startDate, DATE_FORMAT);
    const sessionEnd = moment(session.endDate, DATE_FORMAT);

    return (
      candidateStart.isSameOrBefore(sessionEnd, "day") &&
      sessionStart.isSameOrBefore(candidateEnd, "day")
    );
  });
};

export const getUpcomingSessionCreationError = (sessions = [], candidate) => {
  if (!candidate) {
    return "Unable to determine the next academic session.";
  }

  const existingUpcomingSession = findUpcomingSession(sessions);

  if (existingUpcomingSession) {
    return `An upcoming session (${existingUpcomingSession.academicYearLabel}) already exists.`;
  }

  if (hasSessionWithAcademicYears(sessions, candidate)) {
    return `Academic session ${candidate.academicYearLabel} already exists.`;
  }

  if (hasOverlappingSession(sessions, candidate)) {
    return `Academic session ${candidate.academicYearLabel} overlaps an existing session.`;
  }

  return null;
};

export const getErrorMessage = (
  error,
  fallbackMessage = "Something went wrong.",
) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const getSessions = async () => {
  const response = await axiosClient.get(EndPoints.ADMIN.GET_SESSION);
  return normalizeSessions(response?.result);
};

export const createSession = async (payload) =>
  axiosClient.post(EndPoints.ADMIN.CREATE_SESSION, payload);
