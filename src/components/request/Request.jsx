import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";
import Breadcrumbs from "../BreadCrumbs";
import noDataFound from "../../assets/images/darkmode/noDataFound.png";
import { useSelector } from "react-redux";
import moment from "moment";
import CONSTANT from "../../utils/constants";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MoreVertical,
  RefreshCw,
  XCircle,
} from "lucide-react";

const TAB_ITEMS = ["PENDING", "APPROVED", "REJECTED", "ALL"];
const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100];

const getApiErrorMessage = (error, fallback) => {
  if (typeof error === "string") return error;

  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
};

const safeText = (value, fallback = CONSTANT.NA) => {
  if (value === null || value === undefined) return fallback;

  const text = String(value).trim();
  return text ? text : fallback;
};

const formatDate = (value) => {
  if (!value) return CONSTANT.NA;

  const date = moment(value);
  return date.isValid() ? date.format("DD/MM/YYYY") : CONSTANT.NA;
};

const getStatusQuery = (tab) => {
  switch (tab) {
    case "PENDING":
      return "PENDING";
    case "APPROVED":
      return "ACCEPT,COMPLETE";
    case "REJECTED":
      return "REJECT,EXPIRED";
    default:
      return "ACCEPT,REJECT,PENDING,COMPLETE,EXPIRED,NOTSET";
  }
};

const getStatusLabel = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "PENDING":
      return "Pending";
    case "ACCEPT":
      return "Approved";
    case "REJECT":
      return "Rejected";
    case "COMPLETE":
      return "Completed";
    case "EXPIRED":
      return "Expired";
    default:
      return safeText(status);
  }
};

const getStatusTone = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "PENDING":
      return "warning";
    case "ACCEPT":
    case "COMPLETE":
      return "success";
    case "REJECT":
    case "EXPIRED":
      return "danger";
    default:
      return "neutral";
  }
};

const getReasonLabel = (reason) => {
  switch (reason) {
    case "FORGET_PASSWORD":
      return "Forget Password";
    case "CHANGE_DEVICE":
      return "Changed Device";
    case "TECHNICAL":
      return "Technical";
    case "OTHER":
      return "Other";
    default:
      return safeText(reason);
  }
};

function StatusPill({ status, dark }) {
  const tone = getStatusTone(status);

  const toneClass =
    tone === "success"
      ? "border-[#4CBC9A]/30 bg-[#4CBC9A]/10 text-[#4CBC9A]"
      : tone === "danger"
        ? "border-[#FE4040]/30 bg-[#FE4040]/10 text-[#FE4040]"
        : tone === "warning"
          ? "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24]"
          : "border-white/10 bg-white/5 text-current";

  const Icon =
    tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-poppins-bold uppercase tracking-[0.08em] ${toneClass} ${dark ? "text-textPrimary" : "text-textBlack"}`}
    >
      <Icon size={12} />
      {getStatusLabel(status)}
    </span>
  );
}

function InfoPill({ label, value, dark }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        dark ? "border-white/10 bg-white/5" : "border-[#E9EEF2] bg-white"
      }`}
    >
      <p
        className={`text-[11px] font-poppins-bold uppercase tracking-[0.08em] ${dark ? "text-slate-400" : "text-textGray"}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-poppins-semibold break-words ${dark ? "text-textPrimary" : "text-textBlack"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function Requests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRequest, setMenuRequest] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState(null);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const filteredRequests = useMemo(() => {
    const normalizedRequests = Array.isArray(requests) ? requests : [];

    switch (selectedTab) {
      case "PENDING":
        return normalizedRequests.filter((req) => req?.status === "PENDING");
      case "APPROVED":
        return normalizedRequests.filter(
          (req) => req?.status === "ACCEPT" || req?.status === "COMPLETE",
        );
      case "REJECTED":
        return normalizedRequests.filter(
          (req) => req?.status === "REJECT" || req?.status === "EXPIRED",
        );
      default:
        return normalizedRequests;
    }
  }, [requests, selectedTab]);

  const totalPages = Math.max(1, Math.ceil(totalRequestCount / limit || 1));
  const showingFrom = totalRequestCount === 0 ? 0 : (pageNo - 1) * limit + 1;
  const showingTo =
    totalRequestCount === 0 ? 0 : Math.min(totalRequestCount, pageNo * limit);

  const getRequest = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const statusQuery = getStatusQuery(selectedTab);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.REQUESTS}?model=TEACHER&page=${pageNo}&limit=${limit}&reason=FORGET_PASSWORD&status=${statusQuery}`,
      );

      if (res?.statusCode === 200) {
        setRequests(
          Array.isArray(res?.result?.requests) ? res.result.requests : [],
        );
        setTotalRequestCount(Number(res?.result?.totalRequests) || 0);
      } else {
        setRequests([]);
        setTotalRequestCount(0);
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to load requests");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest();
    setMenuAnchorEl(null);
    setMenuRequest(null);
  }, [limit, pageNo, selectedTab]);

  const handleTabChange = (tab) => {
    if (selectedTab === tab) return;
    setSelectedTab(tab);
    setPageNo(1);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuRequest(null);
  };

  const submitAction = async (request, action) => {
    if (!request?._id || loading || actionLoadingId) return;

    try {
      setActionLoadingId(request._id);
      const res = await axiosClient.put(EndPoints.ADMIN.MODIFY_REQUEST, {
        eventId: request._id,
        status: action,
      });

      if (res?.statusCode === 200) {
        toast.success(res?.result || "Request updated");
        setConfirmOpen(false);
        setConfirmRequest(null);
        await getRequest();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update request"));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleAction = (request, action) => {
    if (!request?._id || loading || actionLoadingId) return;

    if (action === "REJECT") {
      setConfirmRequest(request);
      setConfirmOpen(true);
      return;
    }

    submitAction(request, action);
  };

  const handleMenuAction = (action) => {
    const request = menuRequest;
    closeMenu();

    if (request) handleAction(request, action);
  };

  const shellClass = isDarkMode ? "bg-background2" : "bg-whiteBackground2";
  const panelClass = isDarkMode
    ? "border border-white/10 bg-gradient-to-r from-fromColor1 to-toColor1"
    : "border border-[#E9EEF2] bg-whiteBackground";
  const textPrimaryClass = isDarkMode ? "text-textPrimary" : "text-textBlack";
  const textMutedClass = isDarkMode ? "text-slate-400" : "text-textGray";
  const rowHoverClass = isDarkMode ? "hover:bg-white/5" : "hover:bg-[#F8FAFC]";
  const controlClass = isDarkMode
    ? "border-white/10 bg-white/5 text-textPrimary"
    : "border-[#E9EEF2] bg-white text-textBlack";

  return (
    <div className={`${shellClass} px-3 py-4 sm:px-4 lg:px-6`}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
        <Breadcrumbs />

        <div className="flex flex-col gap-4 rounded-[24px] border border-transparent bg-transparent sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p
              className={`text-xs font-poppins-bold uppercase tracking-[0.16em] ${textMutedClass}`}
            >
              Requests
            </p>
            <h1
              className={`mt-2 text-2xl font-poppins-bold sm:text-3xl ${textPrimaryClass}`}
            >
              {t("titles.passwordReset")}
            </h1>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${textMutedClass}`}>
              Review teacher password reset requests, then approve or reject
              them with a clearer workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`rounded-2xl border px-4 py-3 ${controlClass}`}>
              <p
                className={`text-[11px] font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`}
              >
                Showing
              </p>
              <p
                className={`mt-1 text-sm font-poppins-semibold ${textPrimaryClass}`}
              >
                {showingFrom}-{showingTo} of {totalRequestCount}
              </p>
            </div>

            <FormControl
              size="small"
              sx={{
                minWidth: 104,
                borderRadius: 3,
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.12)"
                    : "#E9EEF2",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#E3E8F3" : "#111827",
                  fontSize: "0.875rem",
                  fontFamily: "Poppins, sans-serif",
                },
                "& .MuiSvgIcon-root": {
                  color: isDarkMode ? "#E3E8F3" : "#111827",
                },
              }}
            >
              <Select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPageNo(1);
                }}
                disabled={loading || actionLoadingId}
                aria-label="Rows per page"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? "#111827" : "#fff",
                      color: isDarkMode ? "#E3E8F3" : "#111827",
                      border: isDarkMode
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid #E9EEF2",
                    },
                  },
                }}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    sx={{
                      backgroundColor: isDarkMode ? "#111827" : "#fff",
                      color: isDarkMode ? "#E3E8F3" : "#111827",
                      "&:hover": {
                        backgroundColor: isDarkMode
                          ? "rgba(255,255,255,0.06)"
                          : "#F8FAFC",
                      },
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Request status filters"
        >
          {TAB_ITEMS.map((tab) => {
            const active = selectedTab === tab;

            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabChange(tab)}
                className={`rounded-full border px-4 py-2 text-sm font-poppins-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A81D1] focus-visible:ring-offset-2 ${
                  active
                    ? "border-[#FF793F] bg-[#FF793F]/10 text-[#FF793F]"
                    : isDarkMode
                      ? "border-white/10 bg-white/5 text-textPrimary hover:bg-white/10"
                      : "border-[#E9EEF2] bg-white text-textBlack hover:bg-[#F8FAFC]"
                }`}
              >
                {t(`labels.${tab}`)}
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
              isDarkMode
                ? "border-[#FE4040]/20 bg-[#FE4040]/10 text-[#FFD2D2]"
                : "border-[#FE4040]/20 bg-[#FE4040]/5 text-[#B91C1C]"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-poppins-bold">
                  Unable to load requests
                </p>
                <p className="mt-1 text-sm leading-6 break-words">
                  {errorMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={getRequest}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0A81D1] px-4 text-sm font-poppins-bold text-white transition hover:bg-[#0f4189] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A81D1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Retry
            </button>
          </div>
        ) : null}

        <section
          className={`overflow-hidden rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${panelClass}`}
        >
          <div
            className={`flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${isDarkMode ? "border-white/10" : "border-[#E9EEF2]"}`}
          >
            <div>
              <h2 className={`text-base font-poppins-bold ${textPrimaryClass}`}>
                Password reset requests
              </h2>
              <p className={`mt-1 text-sm ${textMutedClass}`}>
                {loading && requests.length > 0
                  ? "Refreshing the list..."
                  : `${filteredRequests.length} request${filteredRequests.length === 1 ? "" : "s"} on this view`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {loading ? (
                <span
                  className={`inline-flex items-center gap-2 text-sm ${textMutedClass}`}
                  aria-live="polite"
                >
                  <CircularProgress size={16} thickness={5} color="inherit" />
                  Loading
                </span>
              ) : null}
            </div>
          </div>

          {loading && requests.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center px-6 py-12">
              <div
                className={`flex flex-col items-center text-center ${textMutedClass}`}
              >
                <CircularProgress size={42} thickness={4} color="inherit" />
                <p className="mt-4 text-sm font-poppins-semibold">
                  Loading requests...
                </p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
              <img
                src={noDataFound}
                alt="No requests found"
                className="h-44 w-44 object-contain sm:h-52 sm:w-52"
              />
              <h3
                className={`mt-4 text-xl font-poppins-bold ${textPrimaryClass}`}
              >
                {selectedTab === "PENDING"
                  ? "No pending requests"
                  : selectedTab === "APPROVED"
                    ? "No approved requests"
                    : selectedTab === "REJECTED"
                      ? "No rejected requests"
                      : "No requests found"}
              </h3>
              <p
                className={`mt-2 max-w-xl text-sm leading-6 ${textMutedClass}`}
              >
                Try a different status filter or refresh the list.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full min-h-[240px] border-separate border-spacing-0">
                  <thead className={isDarkMode ? "bg-white/5" : "bg-[#F8FAFC]"}>
                    <tr>
                      {[
                        "Teacher",
                        "Reason",
                        "Class",
                        "Date",
                        "Count",
                        "Action",
                        "OTP",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className={`border-b px-5 py-4 text-left text-xs font-poppins-bold uppercase tracking-[0.08em] ${isDarkMode ? "border-white/10 text-[#8FB8FF]" : "border-[#E9EEF2] text-[#0A81D1]"} ${heading === "Action" || heading === "OTP" ? "text-center" : ""}`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => {
                      const isPending = req?.status === "PENDING";
                      const isActionLoading = actionLoadingId === req?._id;

                      return (
                        <tr
                          key={
                            req?._id ||
                            `${req?.createdAt}-${req?.teacher?._id || "row"}`
                          }
                          className={`${rowHoverClass} border-b ${isDarkMode ? "border-white/10" : "border-[#E9EEF2]"}`}
                        >
                          <td
                            className={`max-w-[220px] px-5 py-4 align-top text-sm font-medium ${textPrimaryClass}`}
                          >
                            <p className="break-words">
                              {safeText(req?.teacher?.firstName)}{" "}
                              {safeText(req?.teacher?.lastName, "")}
                            </p>
                          </td>
                          <td
                            className={`max-w-[220px] px-5 py-4 align-top text-sm ${textPrimaryClass}`}
                          >
                            <p className="break-words">
                              {getReasonLabel(req?.reason)}
                            </p>
                          </td>
                          <td
                            className={`px-5 py-4 align-top text-sm ${textPrimaryClass}`}
                          >
                            <p className="break-words">
                              {safeText(req?.teacher?.class)}-
                              {safeText(req?.teacher?.section)}
                            </p>
                          </td>
                          <td
                            className={`px-5 py-4 align-top text-sm ${textPrimaryClass}`}
                          >
                            {formatDate(req?.createdAt)}
                          </td>
                          <td
                            className={`px-5 py-4 align-top text-center text-sm ${textPrimaryClass}`}
                          >
                            {safeText(req?.teacher?.forgetPasswordCount, "0")}
                          </td>
                          <td className="px-5 py-4 align-top text-center">
                            {isPending ? (
                              <div className="inline-flex items-center gap-2">
                                <StatusPill
                                  status={req?.status}
                                  dark={isDarkMode}
                                />
                                <IconButton
                                  aria-label={`Open actions for ${safeText(req?.teacher?.firstName)} ${safeText(req?.teacher?.lastName, "")}`}
                                  onClick={(event) => {
                                    setMenuAnchorEl(event.currentTarget);
                                    setMenuRequest(req);
                                  }}
                                  disabled={loading || isActionLoading}
                                  sx={{
                                    color: isDarkMode ? "#E3E8F3" : "#0F172A",
                                    border: isDarkMode
                                      ? "1px solid rgba(255,255,255,0.12)"
                                      : "1px solid #E9EEF2",
                                    borderRadius: 2,
                                    width: 38,
                                    height: 38,
                                    ml: 0.5,
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </IconButton>
                              </div>
                            ) : (
                              <StatusPill
                                status={req?.status}
                                dark={isDarkMode}
                              />
                            )}
                          </td>
                          <td
                            className={`px-5 py-4 align-top text-center text-sm ${textPrimaryClass}`}
                          >
                            <span className="inline-flex min-w-[84px] justify-center rounded-xl border px-3 py-2 font-poppins-semibold break-words">
                              {safeText(req?.otp, "-")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 px-4 py-4 lg:hidden">
                {filteredRequests.map((req) => {
                  const isPending = req?.status === "PENDING";
                  const isActionLoading = actionLoadingId === req?._id;

                  return (
                    <article
                      key={
                        req?._id ||
                        `${req?.createdAt}-${req?.teacher?._id || "card"}`
                      }
                      className={`rounded-2xl border p-4 ${isDarkMode ? "border-white/10 bg-white/5" : "border-[#E9EEF2] bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3
                            className={`truncate text-base font-poppins-bold ${textPrimaryClass}`}
                          >
                            {safeText(req?.teacher?.firstName)}{" "}
                            {safeText(req?.teacher?.lastName, "")}
                          </h3>
                          <p className={`mt-1 text-sm ${textMutedClass}`}>
                            {getReasonLabel(req?.reason)}
                          </p>
                        </div>
                        <StatusPill status={req?.status} dark={isDarkMode} />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <InfoPill
                          label="Class"
                          value={`${safeText(req?.teacher?.class)}-${safeText(req?.teacher?.section)}`}
                          dark={isDarkMode}
                        />
                        <InfoPill
                          label="Date"
                          value={formatDate(req?.createdAt)}
                          dark={isDarkMode}
                        />
                        <InfoPill
                          label="Count"
                          value={safeText(
                            req?.teacher?.forgetPasswordCount,
                            "0",
                          )}
                          dark={isDarkMode}
                        />
                        <InfoPill
                          label="OTP"
                          value={safeText(req?.otp, "-")}
                          dark={isDarkMode}
                        />
                      </div>

                      {isPending ? (
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handleAction(req, "ACCEPT")}
                            disabled={loading || isActionLoading}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#4CBC9A] px-4 text-sm font-poppins-bold text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CBC9A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActionLoading ? (
                              <CircularProgress
                                size={16}
                                thickness={5}
                                color="inherit"
                              />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(req, "REJECT")}
                            disabled={loading || isActionLoading}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#FE4040]/30 bg-[#FE4040]/10 px-4 text-sm font-poppins-bold text-[#FE4040] transition hover:bg-[#FE4040]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE4040] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActionLoading ? (
                              <CircularProgress
                                size={16}
                                thickness={5}
                                color="inherit"
                              />
                            ) : (
                              <XCircle size={16} />
                            )}
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              {totalRequestCount > 0 ? (
                <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className={`text-sm ${textMutedClass}`}>
                    {t("titles.showing")}{" "}
                    <span className="font-poppins-bold text-[#0A81D1]">
                      {showingFrom}-{showingTo}
                    </span>{" "}
                    {t("titles.from")}{" "}
                    <span className="font-poppins-bold text-[#0A81D1]">
                      {totalRequestCount}
                    </span>{" "}
                    {t("titles.data")}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Stack spacing={2}>
                      <Pagination
                        count={totalPages}
                        shape="rounded"
                        page={pageNo}
                        onChange={(_, value) => {
                          if (loading || actionLoadingId) return;
                          setPageNo(value);
                        }}
                        disabled={loading || Boolean(actionLoadingId)}
                        renderItem={(item) => (
                          <PaginationItem
                            {...item}
                            sx={{
                              color: isDarkMode ? "#E3E8F3" : "#111827",
                              borderColor:
                                item.type === "previous" || item.type === "next"
                                  ? "transparent"
                                  : "#0F4189",
                              borderWidth: "1px",
                              borderRadius: "12px",
                              borderStyle: "solid",
                              "&.Mui-selected": {
                                color: "#fff",
                                backgroundColor: "#0F4189",
                              },
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            minWidth: 160,
            mt: 1,
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: isDarkMode ? "#111827" : "#fff",
            color: isDarkMode ? "#E3E8F3" : "#111827",
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid #E9EEF2",
            boxShadow: isDarkMode
              ? "0 20px 40px rgba(0,0,0,0.45)"
              : "0 18px 30px rgba(15,23,42,0.12)",
          },
        }}
      >
        <MenuItem
          onClick={() => handleMenuAction("accept")}
          disabled={loading || Boolean(actionLoadingId)}
          sx={{ gap: 1.25, fontFamily: "Poppins, sans-serif", fontSize: 14 }}
        >
          <CheckCircle2 size={16} />
          Approve
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction("reject")}
          disabled={loading || Boolean(actionLoadingId)}
          sx={{ gap: 1.25, fontFamily: "Poppins, sans-serif", fontSize: 14 }}
        >
          <XCircle size={16} />
          Reject
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmOpen}
        onClose={() => !actionLoadingId && setConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: isDarkMode ? "#111827" : "#fff",
            color: isDarkMode ? "#E3E8F3" : "#111827",
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid #E9EEF2",
          },
        }}
      >
        <DialogTitle
          sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
        >
          Reject request?
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <p
            className={`text-sm leading-6 ${isDarkMode ? "text-slate-300" : "text-textGray"}`}
          >
            This will reject the selected request and cannot be undone from
            here.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={Boolean(actionLoadingId)}
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontFamily: "Poppins, sans-serif",
              borderColor: isDarkMode ? "rgba(255,255,255,0.16)" : "#E9EEF2",
              color: isDarkMode ? "#E3E8F3" : "#111827",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => submitAction(confirmRequest, "reject")}
            disabled={!confirmRequest?._id || Boolean(actionLoadingId)}
            variant="contained"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontFamily: "Poppins, sans-serif",
              backgroundColor: "#FE4040",
              "&:hover": { backgroundColor: "#d91111" },
            }}
          >
            {actionLoadingId === confirmRequest?._id ? (
              <CircularProgress size={18} thickness={5} color="inherit" />
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
