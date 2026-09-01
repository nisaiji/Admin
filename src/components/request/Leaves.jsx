import React, { useEffect, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import noDataFound from "../../assets/images/darkmode/noDataFound.png";
import profileEmpty from "../../assets/images/profileEmpty.png";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";
import Breadcrumbs from "../BreadCrumbs";
import CONSTANT from "../../utils/constants";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { showToast } from "../../services/toastService";

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
      return "ACCEPT,REJECT,PENDING,COMPLETE,EXPIRED";
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
    tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : CalendarDays;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-poppins-bold uppercase tracking-[0.08em] ${toneClass} ${dark ? "text-textPrimary" : "text-textBlack"}`}
    >
      <Icon size={12} />
      {requestsStatus(status)}
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
      <p className={`text-[11px] font-poppins-bold uppercase tracking-[0.08em] ${dark ? "text-slate-400" : "text-textGray"}`}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-poppins-semibold break-words ${dark ? "text-textPrimary" : "text-textBlack"}`}>
        {value}
      </p>
    </div>
  );
}

function requestsStatus(status) {
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
}

function reasonStatus(status) {
  switch (status) {
    case "MedicalLeave":
      return "Medical Leave";
    case "OtherReason":
      return "Other Reason";
    default:
      return safeText(status);
  }
}

export default function Leaves() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullname: "",
  });
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

  const currentReq = useMemo(() => {
    if (!filteredRequests.length) return {};

    return (
      filteredRequests.find((req) => req?._id === selectedRequestId) ||
      filteredRequests[0] ||
      {}
    );
  }, [filteredRequests, selectedRequestId]);

  const totalPages = Math.max(1, Math.ceil(totalRequestCount / limit || 1));
  const showingFrom = totalRequestCount === 0 ? 0 : (pageNo - 1) * limit + 1;
  const showingTo = totalRequestCount === 0 ? 0 : Math.min(totalRequestCount, pageNo * limit);

  const getDisplayName = (teacher) =>
    `${safeText(teacher?.firstName, "")} ${safeText(teacher?.lastName, "")}`.trim() || CONSTANT.NA;

  const validateData = () => {
    if (
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.fullname.trim()
    ) {
      return t("validationError.fillAll");
    }

    if (formData.username.trim().length < 5) {
      return t("validationError.usernameLength");
    }

    if (formData.fullname.trim().length < 5) {
      return t("validationError.fullnameLength");
    }

    if (formData.password.trim().length < 8) {
      return t("validationError.passwordLength");
    }

    return "";
  };

  const generateUsername = () => `GT${Math.floor(100000 + Math.random() * 900000)}`;

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const statusQuery = getStatusQuery(selectedTab);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_LEAVES}?model=TEACHER&page=${pageNo}&limit=${limit}&status=${statusQuery}`,
      );

      if (res?.statusCode === 200) {
        const nextRequests = Array.isArray(res?.result?.leaveRequests?.[0]?.teachers)
          ? res.result.leaveRequests[0].teachers
          : [];

        setRequests(nextRequests);
        setTotalRequestCount(Number(res?.result?.totalLeaveRequests) || 0);
      } else {
        setRequests([]);
        setTotalRequestCount(0);
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to load leave requests");
      setErrorMessage(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    setIsRejectDialogOpen(false);
  }, [pageNo, limit, selectedTab]);

  useEffect(() => {
    if (!filteredRequests.length) {
      setSelectedRequestId("");
      return;
    }

    if (!filteredRequests.some((req) => req?._id === selectedRequestId)) {
      setSelectedRequestId(filteredRequests[0]?._id || "");
    }
  }, [filteredRequests, selectedRequestId]);

  useEffect(() => {
    setIsPasswordVisible(false);

    if (!currentReq?._id) {
      setFormData({ username: "", password: "", fullname: "" });
      return;
    }

    if (currentReq?.status === "pending") {
      setFormData({ username: "", password: "", fullname: "" });
      return;
    }

    setFormData({
      username: safeText(currentReq?.guestTeacher?.username, ""),
      password: safeText(currentReq?.guestTeacher?.secretKey, ""),
      fullname: safeText(currentReq?.guestTeacher?.tagline, ""),
    });
  }, [currentReq?._id, currentReq?.status]);

  const handleTabChange = (tab) => {
    if (tab === selectedTab) return;

    setSelectedTab(tab);
    setPageNo(1);
    setSelectedRequestId("");
  };

  const handleSave = async (id, status) => {
    if (!id || loading || actionLoadingId) return;

    if (status === "ACCEPT") {
      const validationError = validateData();
      if (validationError) {
        showToast.error(validationError);
        return;
      }
    }

    try {
      setActionLoadingId(id);
      const payload =
        status === "REJECT"
          ? { leaveRequestId: id, status }
          : {
              leaveRequestId: id,
              status,
              username: formData.username,
              tagline: formData.fullname,
              password: formData.password,
            };

      const res = await axiosClient.put(EndPoints.ADMIN.UPDATE_LEAVE, payload);

      if (res?.statusCode === 200) {
        showToast.success(res?.result || "Leave request updated");
        setIsRejectDialogOpen(false);
        setRejectTargetId("");
        await fetchLeaves();
      }
    } catch (error) {
      showToast.error(getApiErrorMessage(error, "Failed to update leave request"));
    } finally {
      setActionLoadingId("");
    }
  };

  const openRejectDialog = () => {
    if (!currentReq?._id || loading || actionLoadingId) return;

    setRejectTargetId(currentReq._id);
    setIsRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    if (actionLoadingId) return;

    setIsRejectDialogOpen(false);
    setRejectTargetId("");
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
            <p className={`text-xs font-poppins-bold uppercase tracking-[0.16em] ${textMutedClass}`}>
              Leaves
            </p>
            <h1 className={`mt-2 text-2xl font-poppins-bold sm:text-3xl ${textPrimaryClass}`}>
              {t("titles.leave")}
            </h1>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${textMutedClass}`}>
              Review teacher leave requests, generate guest credentials when needed, and keep the workflow responsive.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`rounded-2xl border px-4 py-3 ${controlClass}`}>
              <p className={`text-[11px] font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`}>
                Showing
              </p>
              <p className={`mt-1 text-sm font-poppins-semibold ${textPrimaryClass}`}>
                {showingFrom}-{showingTo} of {totalRequestCount}
              </p>
            </div>

            <FormControl
              size="small"
              sx={{
                minWidth: 104,
                borderRadius: 3,
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#fff",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? "rgba(255,255,255,0.12)" : "#E9EEF2" },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#E3E8F3" : "#111827",
                  fontSize: "0.875rem",
                  fontFamily: "Poppins, sans-serif",
                },
                "& .MuiSvgIcon-root": { color: isDarkMode ? "#E3E8F3" : "#111827" },
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
                      border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E9EEF2",
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
                        backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#F8FAFC",
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

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Leave status filters">
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
                <p className="text-sm font-poppins-bold">Unable to load leave requests</p>
                <p className="mt-1 text-sm leading-6 break-words">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchLeaves}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0A81D1] px-4 text-sm font-poppins-bold text-white transition hover:bg-[#0f4189] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A81D1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Retry
            </button>
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className={`overflow-hidden rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${panelClass}`}>
            <div className={`flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${isDarkMode ? "border-white/10" : "border-[#E9EEF2]"}`}>
              <div>
                <h2 className={`text-base font-poppins-bold ${textPrimaryClass}`}>
                  Leave requests
                </h2>
                <p className={`mt-1 text-sm ${textMutedClass}`}>
                  {loading && requests.length > 0 ? "Refreshing the list..." : `${filteredRequests.length} request${filteredRequests.length === 1 ? "" : "s"} on this view`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {loading ? (
                  <span className={`inline-flex items-center gap-2 text-sm ${textMutedClass}`} aria-live="polite">
                    <CircularProgress size={16} thickness={5} color="inherit" />
                    Loading
                  </span>
                ) : null}
              </div>
            </div>

            {loading && requests.length === 0 ? (
              <div className="flex min-h-[360px] items-center justify-center px-6 py-12">
                <div className={`flex flex-col items-center text-center ${textMutedClass}`}>
                  <CircularProgress size={42} thickness={4} color="inherit" />
                  <p className="mt-4 text-sm font-poppins-semibold">Loading leave requests...</p>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
                <img
                  src={noDataFound}
                  alt="No leave requests found"
                  className="h-44 w-44 object-contain sm:h-52 sm:w-52"
                />
                <h3 className={`mt-4 text-xl font-poppins-bold ${textPrimaryClass}`}>
                  {selectedTab === "pending"
                    ? "No pending leave requests"
                    : selectedTab === "approved"
                      ? "No approved leave requests"
                      : selectedTab === "rejected"
                        ? "No rejected leave requests"
                        : "No leave requests found"}
                </h3>
                <p className={`mt-2 max-w-xl text-sm leading-6 ${textMutedClass}`}>
                  Try a different filter or refresh the list.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead className={isDarkMode ? "bg-white/5" : "bg-[#F8FAFC]"}>
                      <tr>
                        {[
                          "Teacher",
                          "Phone",
                          "Class",
                          "Date",
                          "Past Leaves",
                          "Reason",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className={`border-b px-5 py-4 text-left text-xs font-poppins-bold uppercase tracking-[0.08em] ${isDarkMode ? "border-white/10 text-[#8FB8FF]" : "border-[#E9EEF2] text-[#0A81D1]"}`}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((req) => {
                        const selected = currentReq?._id === req?._id;

                        return (
                          <tr
                            key={req?._id || `${req?.createdAt}-${req?.teacher?._id || "row"}`}
                            tabIndex={0}
                            role="button"
                            aria-selected={selected}
                            onClick={() => setSelectedRequestId(req?._id || "")}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedRequestId(req?._id || "");
                              }
                            }}
                            className={`${rowHoverClass} cursor-pointer border-b outline-none transition ${selected ? (isDarkMode ? "bg-white/10" : "bg-[#F8FAFC]") : ""} ${isDarkMode ? "border-white/10" : "border-[#E9EEF2]"}`}
                          >
                            <td className="px-5 py-4 align-top">
                              <p className={`text-sm font-poppins-semibold ${textPrimaryClass}`}>
                                {getDisplayName(req?.teacher)}
                              </p>
                            </td>
                            <td className={`px-5 py-4 align-top text-sm ${textPrimaryClass}`}>
                              <div className="inline-flex items-center gap-2 break-words">
                                <Phone size={14} className={textMutedClass} />
                                {safeText(req?.teacher?.phone)}
                              </div>
                            </td>
                            <td className={`px-5 py-4 align-top text-sm ${textPrimaryClass}`}>
                              {safeText(req?.teacher?.class)} {safeText(req?.teacher?.section)}
                            </td>
                            <td className={`px-5 py-4 align-top text-sm ${textPrimaryClass}`}>
                              {formatDate(req?.createdAt)}
                            </td>
                            <td className={`px-5 py-4 align-top text-center text-sm ${textPrimaryClass}`}>
                              {safeText(req?.teacher?.leaveRequestCount, "0")}
                            </td>
                            <td className={`max-w-[260px] px-5 py-4 align-top text-sm ${textPrimaryClass}`}>
                              <p className="break-words">{reasonStatus(req?.reason || "")}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-4 px-4 py-4 lg:hidden">
                  {filteredRequests.map((req) => {
                    const selected = currentReq?._id === req?._id;

                    return (
                      <button
                        key={req?._id || `${req?.createdAt}-${req?.teacher?._id || "card"}`}
                        type="button"
                        onClick={() => setSelectedRequestId(req?._id || "")}
                        className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A81D1] focus-visible:ring-offset-2 ${
                          selected
                            ? isDarkMode
                              ? "border-white/20 bg-white/10"
                              : "border-[#0A81D1]/30 bg-[#0A81D1]/5"
                            : isDarkMode
                              ? "border-white/10 bg-white/5 hover:bg-white/10"
                              : "border-[#E9EEF2] bg-white hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className={`truncate text-base font-poppins-bold ${textPrimaryClass}`}>
                              {getDisplayName(req?.teacher)}
                            </h3>
                            <p className={`mt-1 text-sm ${textMutedClass}`}>
                              {reasonStatus(req?.reason || "")}
                            </p>
                          </div>
                          <StatusPill status={req?.status} dark={isDarkMode} />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <InfoPill label="Phone" value={safeText(req?.teacher?.phone)} dark={isDarkMode} />
                          <InfoPill label="Class" value={`${safeText(req?.teacher?.class)} ${safeText(req?.teacher?.section)}`} dark={isDarkMode} />
                          <InfoPill label="Date" value={formatDate(req?.createdAt)} dark={isDarkMode} />
                          <InfoPill label="Past leaves" value={safeText(req?.teacher?.leaveRequestCount, "0")} dark={isDarkMode} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {totalRequestCount > 0 ? (
                  <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className={`text-sm ${textMutedClass}`}>
                      {t("titles.showing")} <span className="font-poppins-bold text-[#0A81D1]">{showingFrom}-{showingTo}</span> {t("titles.from")} <span className="font-poppins-bold text-[#0A81D1]">{totalRequestCount}</span> {t("titles.data")}
                    </div>

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
                              borderColor: item.type === "previous" || item.type === "next" ? "transparent" : "#0F4189",
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
                ) : null}
              </>
            )}
          </section>

          <aside className={`overflow-hidden rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${panelClass}`}>
            <div className={`border-b px-4 py-4 sm:px-6 ${isDarkMode ? "border-white/10" : "border-[#E9EEF2]"}`}>
              <h2 className={`text-base font-poppins-bold ${textPrimaryClass}`}>
                Leave details
              </h2>
              <p className={`mt-1 text-sm ${textMutedClass}`}>
                Manage the currently selected request.
              </p>
            </div>

            {!currentReq?._id ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
                <img
                  src={noDataFound}
                  alt="Select a leave request"
                  className="h-40 w-40 object-contain"
                />
                <h3 className={`mt-4 text-lg font-poppins-bold ${textPrimaryClass}`}>
                  Select a request
                </h3>
                <p className={`mt-2 text-sm leading-6 ${textMutedClass}`}>
                  Tap a row to view teacher details and action buttons.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={currentReq?.teacher?.photo ? `data:image/jpeg;base64,${currentReq?.teacher?.photo}` : profileEmpty}
                    alt={`${getDisplayName(currentReq?.teacher)} profile`}
                    className={`size-20 shrink-0 rounded-full object-cover ring-4 ${isDarkMode ? "ring-white/10" : "ring-[#F8FAFC]"}`}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className={`truncate text-lg font-poppins-bold ${textPrimaryClass}`}>
                      {getDisplayName(currentReq?.teacher)}
                    </h3>
                    <p className={`mt-1 text-sm ${textMutedClass}`}>
                      {safeText(currentReq?.teacher?.class)} {safeText(currentReq?.teacher?.section)}
                    </p>
                    <div className="mt-3">
                      <StatusPill status={currentReq?.status} dark={isDarkMode} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoPill label="Request date" value={formatDate(currentReq?.createdAt)} dark={isDarkMode} />
                  <InfoPill label="Leave period" value={`${formatDate(currentReq?.startTime)} - ${formatDate(currentReq?.endTime)}`} dark={isDarkMode} />
                  <InfoPill label="Phone" value={safeText(currentReq?.teacher?.phone)} dark={isDarkMode} />
                  <InfoPill label="Past leaves" value={safeText(currentReq?.teacher?.leaveRequestCount, "0")} dark={isDarkMode} />
                </div>

                <div
                  className={`rounded-2xl border px-4 py-4 ${
                    isDarkMode ? "border-white/10 bg-white/5" : "border-[#E9EEF2] bg-white"
                  }`}
                >
                  <p className={`text-[11px] font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`}>
                    Reason
                  </p>
                  <p className={`mt-2 text-sm leading-6 break-words ${textPrimaryClass}`}>
                    {reasonStatus(currentReq?.reason || CONSTANT.NA)}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border px-4 py-4 ${
                    isDarkMode ? "border-white/10 bg-white/5" : "border-[#E9EEF2] bg-white"
                  }`}
                >
                  <p className={`text-[11px] font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`}>
                    Description
                  </p>
                  <p className={`mt-2 text-sm leading-6 break-words ${textPrimaryClass}`}>
                    {safeText(currentReq?.description, "No description provided")}
                  </p>
                </div>

                <div className={`rounded-2xl border px-4 py-4 ${isDarkMode ? "border-white/10 bg-white/5" : "border-[#E9EEF2] bg-white"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={`text-[11px] font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`}>
                        Guest credentials
                      </p>
                      <p className={`mt-1 text-sm ${textMutedClass}`}>
                        {currentReq?.status === "PENDING" ? "Generate credentials before approval." : "View generated guest teacher details."}
                      </p>
                    </div>

                    {currentReq?.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            username: generateUsername(),
                          }))
                        }
                        disabled={loading || Boolean(actionLoadingId)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0A81D1]/30 px-3 text-sm font-poppins-bold text-[#0A81D1] transition hover:bg-[#0A81D1]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A81D1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw size={16} />
                        Generate
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className={`mb-2 block text-xs font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`} htmlFor="leave-username">
                        Username
                      </label>
                      <input
                        id="leave-username"
                        type="text"
                        value={currentReq?.status === "PENDING" ? formData.username : safeText(currentReq?.guestTeacher?.username, "")}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        placeholder={t("placeholders.generateUsername")}
                        readOnly={currentReq?.status !== "PENDING"}
                        disabled={loading || Boolean(actionLoadingId)}
                        className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#0A81D1] ${
                          isDarkMode
                            ? "border-white/10 bg-black/10 text-textPrimary placeholder:text-slate-500"
                            : "border-[#E9EEF2] bg-white text-textBlack placeholder:text-textGray"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      />
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`} htmlFor="leave-fullname">
                        Teacher name
                      </label>
                      <input
                        id="leave-fullname"
                        type="text"
                        value={currentReq?.status === "PENDING" ? formData.fullname : safeText(currentReq?.guestTeacher?.tagline, "")}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            fullname: e.target.value,
                          }))
                        }
                        placeholder={t("placeholders.replacementTeacherName")}
                        readOnly={currentReq?.status !== "PENDING"}
                        disabled={loading || Boolean(actionLoadingId)}
                        className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#0A81D1] ${
                          isDarkMode
                            ? "border-white/10 bg-black/10 text-textPrimary placeholder:text-slate-500"
                            : "border-[#E9EEF2] bg-white text-textBlack placeholder:text-textGray"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      />
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs font-poppins-bold uppercase tracking-[0.08em] ${textMutedClass}`} htmlFor="leave-password">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="leave-password"
                          type={isPasswordVisible ? "text" : "password"}
                          value={currentReq?.status === "PENDING" ? formData.password : safeText(currentReq?.guestTeacher?.secretKey, "")}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          placeholder={t("placeholders.password")}
                          readOnly={currentReq?.status !== "PENDING"}
                          disabled={loading || Boolean(actionLoadingId)}
                          className={`h-11 w-full rounded-xl border px-4 pr-11 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#0A81D1] ${
                            isDarkMode
                              ? "border-white/10 bg-black/10 text-textPrimary placeholder:text-slate-500"
                              : "border-[#E9EEF2] bg-white text-textBlack placeholder:text-textGray"
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible((prev) => !prev)}
                          disabled={loading || Boolean(actionLoadingId)}
                          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                          className={`absolute inset-y-0 right-0 inline-flex items-center justify-center rounded-r-xl px-3 transition ${textMutedClass} hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A81D1] disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {currentReq?.status === "PENDING" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={openRejectDialog}
                      disabled={loading || Boolean(actionLoadingId)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#FE4040]/30 bg-[#FE4040]/10 px-4 text-sm font-poppins-bold text-[#FE4040] transition hover:bg-[#FE4040]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE4040] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoadingId === currentReq?._id && isRejectDialogOpen ? <CircularProgress size={16} thickness={5} color="inherit" /> : <XCircle size={16} />}
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(currentReq?._id, "ACCEPT")}
                      disabled={loading || Boolean(actionLoadingId)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4CBC9A] px-4 text-sm font-poppins-bold text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CBC9A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoadingId === currentReq?._id ? <CircularProgress size={16} thickness={5} color="inherit" /> : <CheckCircle2 size={16} />}
                      Approve
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <StatusPill status={currentReq?.status} dark={isDarkMode} />
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        {totalRequestCount > 0 && loading && requests.length > 0 ? (
          <div className={`text-right text-xs ${textMutedClass}`} aria-live="polite">
            Refreshing data...
          </div>
        ) : null}
      </div>

      <Dialog
        open={isRejectDialogOpen}
        onClose={closeRejectDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: isDarkMode ? "#111827" : "#fff",
            color: isDarkMode ? "#E3E8F3" : "#111827",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E9EEF2",
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
          Reject leave request?
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <p className={`text-sm leading-6 ${isDarkMode ? "text-slate-300" : "text-textGray"}`}>
            This will reject the selected leave request and close the current workflow.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            onClick={closeRejectDialog}
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
            onClick={() => handleSave(rejectTargetId, "REJECT")}
            disabled={!rejectTargetId || Boolean(actionLoadingId)}
            variant="contained"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontFamily: "Poppins, sans-serif",
              backgroundColor: "#FE4040",
              "&:hover": { backgroundColor: "#d91111" },
            }}
          >
            {actionLoadingId === rejectTargetId ? (
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
