import moment from "moment";

export const getPaymentStatusText = (status) => {
  if (!status) return "NA";

  const map = {
    active: "Active",
    sessionInitiated: "Session Initiated",
    paid: "Paid",
    failed: "Failed",
    requestedForRefund: "Refund Requested",
    partialRefunded: "Partially Refunded",
    refunded: "Refunded",
  };

  return map[status] || status;
};

export const getPaymentStatusColor = (status) => {
  if (!status) return "text-gray-400";

  const map = {
    active: "text-textRed",
    paid: "text-textGreen",
    failed: "text-textRed",
    partialRefunded: "text-textGreen",
    refunded: "text-textGreen",
  };

  return map[status] || "text-gray-300";
};

export const getSessionWindow = (session) => {
  const startYear = Number(session?.academicStartYear);
  const endYear = Number(session?.academicEndYear);

  if (!startYear || !endYear) {
    return null;
  }

  return {
    start: moment(`${startYear}-04-01`, "YYYY-MM-DD").startOf("day"),
    end: moment(`${endYear}-03-31`, "YYYY-MM-DD").endOf("day"),
  };
};

export const getSessionPhase = (session) => {
  if (session?.status === "active") {
    return "current";
  } else if (session?.status === "upcoming") {
    return "upcoming";
  } else if (session?.status === "completed") {
    return "previous";
  }
  return "current";
};

export const getSessionPermissions = (session) => {
  const phase = getSessionPhase(session);

  return {
    phase,
    canView: true,
    canEdit: phase === "current",
    canCreate: phase === "upcoming",
    canCreateAttendance: phase === "current",
  };
};
