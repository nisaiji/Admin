import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import CONSTANT from "../../../utils/constants";

const AVATAR_CLASSES = [
  "bg-[#4F8EF7]",
  "bg-[#4cbc9a]",
  "bg-[#94A3B8]",
  "bg-[#FBBF24]",
  "bg-[#FF793F]",
  "bg-[#fe4040]",
  "bg-[#0a81d1]",
];

export function getStudentRecordId(student) {
  return student?.id ?? student?._id ?? "";
}

export function getDisplayValue(value) {
  if (value === null || value === undefined) return CONSTANT.NA;
  const normalized = String(value).trim();
  return normalized || CONSTANT.NA;
}

export function getFullName(student) {
  const firstName = student?.firstName ?? "";
  const lastName = student?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || CONSTANT.NA;
}

export function getInitials(student) {
  const fullName = getFullName(student);
  if (fullName === CONSTANT.NA) return "NA";

  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarClass(student, index) {
  const source = String(getStudentRecordId(student) || index);
  let hash = 0;

  for (let i = 0; i < source.length; i += 1) {
    hash += source.charCodeAt(i);
  }

  return AVATAR_CLASSES[Math.abs(hash) % AVATAR_CLASSES.length];
}

export function getStudentClassName(student) {
  return getDisplayValue(student?.className ?? student?.class?.name);
}

export function getStudentSectionName(student) {
  return getDisplayValue(student?.sectionName ?? student?.section?.name);
}

export function getStudentRollNo(student) {
  return getDisplayValue(student?.studentId ?? student?.rollNo);
}

export function getStudentParentName(student) {
  return (
    student?.mainParentFullName ??
    student?.parentFullName ??
    student?.parentName ??
    ""
  );
}

export function getStudentParentPhone(student) {
  return String(student?.mainParentPhone ?? student?.parentPhone ?? "").trim();
}

export function getStudentParentEmail(student) {
  return String(student?.mainParentEmail ?? student?.parentEmail ?? "").trim();
}

export function getStudentParentGender(student) {
  return student?.mainParentGender ?? student?.parentGender ?? "";
}

export function getStudentParentQualification(student) {
  return student?.mainParentQualification ?? student?.parentQualification ?? "";
}

export function getStudentParentOccupation(student) {
  return student?.mainParentOccupation ?? student?.parentOccupation ?? "";
}

export function getStudentParentAddress(student) {
  return student?.mainParentAddress ?? student?.parentAddress ?? "";
}

export function getStudentParentDob(student) {
  return student?.mainParentDob ?? student?.parentDob ?? "";
}

export function formatStatusLabel(value) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return CONSTANT.NA;
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatBooleanLabel(value, truthyLabel, falsyLabel) {
  if (value === true) return truthyLabel;
  if (value === false) return falsyLabel;
  return CONSTANT.NA;
}

export function formatDateValue(value) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return CONSTANT.NA;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(utcDate);
  }

  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return getDisplayValue(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export function formatPercentageValue(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return CONSTANT.NA;
  }

  const formattedValue = Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(1).replace(/\.0$/, "");

  return `${formattedValue}%`;
}

export function getSessionLabel(student) {
  const startYear = Number(student?.sessionStartYear);
  const endYear = Number(student?.sessionEndYear);

  if (Number.isFinite(startYear) && Number.isFinite(endYear)) {
    return `${startYear} - ${endYear}`;
  }

  const startDate = student?.sessionStartDate
    ? new Date(student.sessionStartDate)
    : null;
  const endDate = student?.sessionEndDate
    ? new Date(student.sessionEndDate)
    : null;

  if (
    startDate &&
    endDate &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime())
  ) {
    return `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
  }

  return CONSTANT.NA;
}

export function getAttendancePercentage(student) {
  const summaryPercentage = Number(
    student?.attendanceSummary?.currentSessionPercentage,
  );

  if (Number.isFinite(summaryPercentage)) {
    return summaryPercentage;
  }

  const fallbackPercentage = Number(student?.attendancePercentage);
  return Number.isFinite(fallbackPercentage) ? fallbackPercentage : null;
}

export function getStatusTone(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (!normalized) return "blue";

  if (
    [
      "active",
      "verified",
      "accept",
      "accepted",
      "complete",
      "completed",
      "paid",
      "present",
      "published",
      "passed",
    ].includes(normalized)
  ) {
    return "green";
  }

  if (
    [
      "pending",
      "scheduled",
      "ongoing",
      "not issued",
      "published pending",
      "not evaluated",
    ].includes(normalized)
  ) {
    return "amber";
  }

  if (
    [
      "inactive",
      "reject",
      "rejected",
      "cancelled",
      "canceled",
      "failed",
      "absent",
      "expired",
    ].includes(normalized)
  ) {
    return "red";
  }

  return "blue";
}

export function getToneClasses(tone) {
  switch (tone) {
    case "green":
      return "border-[#12B981]/20 bg-[#12B981]/10 text-[#12B981]";
    case "amber":
      return "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]";
    case "red":
      return "border-[#FE4040]/20 bg-[#FE4040]/10 text-[#FE4040]";
    default:
      return "border-[#0A81D1]/20 bg-[#0A81D1]/10 text-[#0A81D1]";
  }
}

export function buildSubjectMeta(subject) {
  return [
    subject?.teacherName ? `Subject Teacher: ${subject.teacherName}` : "",
    subject?.subjectCode ? `Subject Code: ${subject.subjectCode}` : "",
  ].filter(Boolean);
}

export function buildExamMeta(exam) {
  return [
    exam?.examStatus ? formatStatusLabel(exam.examStatus) : "",
    exam?.subjectCount !== undefined ? `Subjects ${exam.subjectCount}` : "",
    // formatBooleanLabel(
    //   exam?.resultPublished,
    //   "Result Published",
    //   "Result Pending",
    // ),
  ].filter(Boolean);
}

export function buildLeaveRequestMeta(request) {
  const hasDateRange = request?.fromDate || request?.toDate;
  const dateRange = hasDateRange
    ? `${formatDateValue(request?.fromDate)} - ${formatDateValue(
        request?.toDate,
      )}`
    : "";

  return [
    request?.status ? formatStatusLabel(request.status) : "",
    dateRange,
  ].filter(Boolean);
}

export async function loadDetailedStudent(student, role) {
  const studentId = student?._id ?? getStudentRecordId(student);

  if (!studentId) {
    throw new Error("Student id is missing");
  }
  const url =
    role === "admin"
      ? `${EndPoints.ADMIN.GET_DETAILED_STUDENT}/${studentId}`
      : `${EndPoints.TEACHER.GET_DETAILED_STUDENT}/${studentId}`;
  const response = await axiosClient.get(url);

  if (response?.statusCode !== 200) {
    throw new Error(response?.message ?? "Failed to load student details");
  }

  return response?.result;
}
