import { C } from "./constants";

const AVATAR_COLORS = [
  "#4F8EF7",
  "#4cbc9a",
  "#94A3B8",
  "#FBBF24",
  "#FF793F",
  "#fe4040",
  "#0a81d1",
];

export function avatarColorForId(id) {
  let sum = 0;
  const key = String(id ?? "");

  for (let index = 0; index < key.length; index += 1) {
    sum += key.charCodeAt(index);
  }

  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function newTcNum() {
  return `TC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}`;
}

export function getClassName(record) {
  return record?.className || record?.class || "-";
}

export function getSectionName(record) {
  return record?.sectionName || record?.section || "-";
}

export function getClassSectionLabel(record) {
  return `${getClassName(record)} - ${getSectionName(record)}`;
}

export function mapStudentForTc(student, classList = [], sectionList = []) {
  const className =
    student?.class?.name ||
    classList.find((item) => item?._id === student?.classId)?.name ||
    student?.className ||
    "-";

  const sectionName =
    student?.section?.name ||
    sectionList.find((item) => item?._id === student?.section)?.name ||
    student?.sectionName ||
    "-";

  return {
    id: student?._id,
    studentId: student?.studentId,
    sessionStudentId: student?._id,
    sessionId: student?.sessionId || student?.session?._id,
    classId: student?.classId || student?.class?._id,
    sectionId: student?.sectionId || student?.section?._id,
    admissionNumber: student?.studentId || student?.admissionNumber || "-",
    name:
      [student?.firstName, student?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      student?.name ||
      "-",
    class: className,
    className,
    section: sectionName,
    sectionName,
    mainParentFullName: student?.mainParentFullName || "-",
    phone: student?.parentPhone || "-",
    dob: student?.dob || student?.dateOfBirth || student?.birthDate || "-",
    gender: student?.gender || "-",
    feeStatus: student?.feeStatus || "due",
    raw: student,
  };
}

export function formatFeeStatus(status) {
  switch (status) {
    case "paid":
    case "All Paid":
    case "All Fees Paid":
      return "All Fees Paid";
    case "due":
    case "Fees Due":
      return "Fees Due";
    case "waived":
    case "Fees Waived":
      return "Fees Waived";
    default:
      return status || "-";
  }
}

export function formatDisplayDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function joinName(parts) {
  return parts.filter(Boolean).join(" ").trim();
}

function entityLabel(entity, fallback = "-") {
  if (!entity) {
    return fallback;
  }

  if (typeof entity === "string") {
    return entity || fallback;
  }

  return (
    entity?.name ||
    entity?.fullname ||
    entity?.fullName ||
    entity?.title ||
    fallback
  );
}

function getYearFromDateValue(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getFullYear();
  }

  const yearMatch = String(value).match(/\b\d{4}\b/);
  return yearMatch ? Number(yearMatch[0]) : null;
}

export function getTcRequestsFromResponse(response) {
  const result = response?.result;
  const candidates = [
    result?.requests,
    result?.requests?.docs,
    result?.data,
    result?.items,
    result?.transferCertificates,
    result?.certificates,
    result,
    response?.requests,
    response?.data,
  ];

  const requestList = candidates.find((candidate) => Array.isArray(candidate));
  return requestList || [];
}

export function formatTcReason(reason) {
  switch (reason) {
    case "parentTransfer":
      return "Parent Transfer";
    case "familyRelocation":
      return "Family Relocation";
    case "betterOpportunity":
      return "Better Opportunity";
    case "financial":
      return "Financial";
    case "academic":
      return "Academic";
    case "disciplinary":
      return "Disciplinary";
    case "medical":
      return "Medical";
    case "other":
      return "Other";
    default:
      return reason || "-";
  }
}

export function formatTcStatus(status) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "approvedByParent":
      return "Approved By Parent";
    case "rejectedByParent":
      return "Rejected By Parent";
    case "certificateIssued":
    case "issued":
      return "Certificate Issued";
    default:
      return status || "-";
  }
}

export function formatTcConduct(conduct) {
  switch (conduct) {
    case "excellent":
      return "Excellent";
    case "verygood":
      return "Very Good";
    case "good":
      return "Good";
    case "satisfactory":
      return "Satisfactory";
    case "needsImprovement":
      return "Needs Improvement";
    default:
      return conduct || "-";
  }
}

export function isIssuedTcRequest(request) {
  const status = request?.status;

  if (status) {
    return status === "certificateIssued" || status === "issued";
  }

  return Boolean(
    request?.certificateNumber ||
    request?.tcNumber ||
    request?.transferCertificateNumber ||
    request?.certificate?.number,
  );
}

export function isApprovedByParentTcRequest(request) {
  const status = request?.status;
  return status === "approvedByParent" || status === "In Process";
}

export function isPendingTcRequest(request) {
  return (
    !isIssuedTcRequest(request) &&
    request?.status !== "rejectedByParent" &&
    request?.status !== "rejected"
  );
}

export function mapTcRequestForDisplay(request) {
  const student = request?.student || request?.sessionStudent?.student || {};
  const parent =
    request?.parent || student?.parent || request?.sessionStudent?.parent || {};
  const classSource =
    request?.class || request?.sessionStudent?.class || student?.class || {};
  const sectionSource =
    request?.section ||
    request?.sessionStudent?.section ||
    student?.section ||
    {};
  const certificateNumber =
    request?.certificateNumber ||
    request?.tcNumber ||
    request?.transferCertificateNumber ||
    request?.transferCertificateNo ||
    request?.certificate?.number ||
    "-";
  const issuedDate =
    request?.issuedAt ||
    request?.issuedDate ||
    request?.certificateIssuedDate ||
    request?.tcIssuedAt ||
    request?.tcDate ||
    request?.updatedAt ||
    request?.createdAt;

  return {
    id: request?.requestId || request?._id || certificateNumber,
    name: joinName([student?.firstName, student?.lastName]) || "-",
    mainParentFullName: request?.mainParentFullName || "-",
    className: request?.className || entityLabel(classSource),
    sectionName: request?.sectionName || entityLabel(sectionSource),
    requestDate: formatDisplayDate(
      request?.requestedDate || request?.requestDate || request?.createdAt,
    ),
    reasonLabel: formatTcReason(request?.reason),
    reason: formatTcReason(request?.reason),
    reasonDescription: request?.reasonDescription || "",
    status: request?.status,
    statusLabel: formatTcStatus(request?.status),
    lastAttendanceDate: formatDisplayDate(request?.lastAttendanceDate),
    conductLabel: formatTcConduct(request?.conduct),
    conduct: formatTcConduct(request?.conduct),
    promotionStatus: request?.promotionStatus || "-",
    promoStatus: request?.promotionStatus || "-",
    feeStatus: formatFeeStatus(
      request?.feeStatus ||
        request?.sessionStudent?.feeStatus ||
        student?.feeStatus,
    ),
    certificateNumber,
    tcNumber: certificateNumber,
    tcDate: formatDisplayDate(issuedDate),
    issuedYear: getYearFromDateValue(issuedDate),
    issuedBy: entityLabel(
      request?.issuedBy || request?.issuer || request?.admin,
      "Administrator",
    ),
    admissionNumber:
      request?.admissionNumber ||
      student?.studentId ||
      student?.admissionNumber ||
      "-",
    dob: formatDisplayDate(
      student?.dob ||
        student?.dateOfBirth ||
        student?.birthDate ||
        request?.dob ||
        request?.dateOfBirth,
    ),
    gender: student?.gender || request?.gender || "-",
    raw: request,
  };
}

export function getPendingStatusTone(status) {
  if (status === "submitted" || status === "Pending Approval") {
    return { background: C.amberDim, color: C.amber };
  }

  if (status === "approvedByParent" || status === "In Process") {
    return { background: C.blueDim, color: C.blue };
  }

  if (status === "certificateIssued") {
    return { background: C.greenDim, color: C.green };
  }

  return { background: C.redDim, color: C.red };
}

export function getConductTone(conduct) {
  if (conduct === "Excellent" || conduct === "excellent") {
    return { background: C.greenDim, color: C.green };
  }

  if (
    conduct === "Very Good" ||
    conduct === "verygood" ||
    conduct === "Good" ||
    conduct === "good"
  ) {
    return { background: C.blueDim, color: C.blue };
  }

  if (conduct === "Satisfactory" || conduct === "satisfactory") {
    return { background: C.amberDim, color: C.amber };
  }

  return { background: C.redDim, color: C.red };
}

export function getFeeStatusTone(status) {
  if (status === "All Paid" || status === "All Fees Paid") {
    return { background: C.greenDim, color: C.green };
  }

  if (status === "Fees Waived") {
    return { background: C.blueDim, color: C.blue };
  }

  return { background: C.amberDim, color: C.amber };
}
