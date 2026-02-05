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
