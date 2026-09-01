import React, { useEffect, useState, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import Breadcrumbs from "../BreadCrumbs";
import { useTranslation } from "react-i18next";
import profile from "../../assets/images/profileEmpty.png";
import userIcon from "../../assets/images/darkmode/userIcon.png";
import adminIcon from "../../assets/images/darkmode/admin.png";
import teacherIcon from "../../assets/images/darkmode/teacher.png";
import check from "../../assets/images/darkmode/check.png";
import menuIcon from "../../assets/images/darkmode/menu.png";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import Spinner from "../Spinner";
import moment from "moment";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { showToast } from "../../services/toastService";

export default function Notice() {
  const { t } = useTranslation();
  const { classAndSectionData, data } = useSelector((state) => state.appAuth);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(0);

  const [filterRole, setFilterRole] = useState("all");
  const [openFilter, setOpenFilter] = useState(false);
  const filterRef = useRef(null);

  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const menuRef = useRef(null);

  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [updatedDescription, setUpdatedDescription] = useState("");

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const [formData, setFormData] = useState({
    description: "",
    toTeacher: false,
    toParent: false,
  });

  const options = [
    { label: "By All", value: "all", icon: adminIcon },
    { label: "By You", value: "admin", icon: userIcon },
    { label: "By Teacher", value: "teacher", icon: teacherIcon },
  ];
  let selectedFilter =
    options.find((opt) => opt.value === filterRole) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilter(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotice = async () => {
    if (!classAndSectionData?.selectedSession?._id) {
      showToast.error("Please select Session");
      return;
    }
    try {
      setLoading(true);
      const resAdmin = await axiosClient.get(
        `${EndPoints.ADMIN.GET_NOTICE}?page=${pageNo}&limit=${limit}&createdBy=${filterRole}&session=${classAndSectionData?.selectedSession?._id}`,
      );

      if (resAdmin?.statusCode === 200) {
        setRequests(resAdmin?.result?.announcements || []);
        setTotalRequestCount(resAdmin?.result?.total || 0);
      }
    } catch (e) {
      showToast.error(
        e?.response?.data?.message || e?.message || "Failed to fetch notices",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [pageNo, limit, filterRole, classAndSectionData]);

  const validateData = () => {
    if (!formData.description.trim()) return t("validationError.description");
    if (!formData.toTeacher && !formData.toParent)
      return t("validationError.selectTeacherOrParent");
    return "";
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    const errorMsg = validateData();
    if (errorMsg) return showToast.error(errorMsg);

    try {
      setIsSubmitting(true);

      let targetAudience = [];
      if (formData.toTeacher) targetAudience.push("TEACHER");
      if (formData.toParent) targetAudience.push("PARENT");

      const res = await axiosClient.post(EndPoints.ADMIN.ADD_NOTICE, {
        description: formData.description.trim(),
        targetAudience,
        sessionId: classAndSectionData?.selectedSession?._id,
      });

      if (res?.statusCode === 201) {
        showToast.success(res?.result || "Notice posted successfully");
        setFormData({ description: "", toTeacher: false, toParent: false });
        setPageNo(1);
        fetchNotice();
      }
    } catch (e) {
      showToast.error(
        e?.response?.data?.message || e?.message || "Failed to post notice",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = (notice) => {
    setEditingNoticeId(notice._id);
    setUpdatedDescription(notice.description);
    setMenuOpenIndex(null);
  };

  const handleConfirmUpdate = async (notice) => {
    if (!updatedDescription.trim())
      return showToast.error("Description cannot be empty");
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await axiosClient.put(
        `${EndPoints.ADMIN.UPDATE_NOTICE}/${notice?._id}`,
        {
          description: updatedDescription.trim(),
          targetAudience: notice.targetAudience,
        },
      );

      if (res?.statusCode === 200) {
        showToast.success("Notice updated successfully");
        setEditingNoticeId(null);
        fetchNotice();
      }
    } catch (e) {
      showToast.error(
        e?.response?.data?.message || e?.message || "Failed to update notice",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelUpdate = () => {
    setEditingNoticeId(null);
    setUpdatedDescription("");
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ open: true, id });
    setMenuOpenIndex(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog.id || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_NOTICE}/${deleteDialog.id}`,
      );
      if (res?.statusCode === 200) {
        showToast.success("Notice deleted successfully");
        if (requests.length === 1 && pageNo > 1) setPageNo((prev) => prev - 1);
        else fetchNotice();
        setRequests((prev) =>
          prev.filter((item) => item._id !== deleteDialog.id),
        );
      }
    } catch (e) {
      showToast.error(
        e?.response?.data?.message || e?.message || "Failed to delete notice",
      );
    } finally {
      setIsSubmitting(false);
      setDeleteDialog({ open: false, id: null });
    }
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <>
      {loading && !isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-50 backdrop-blur-sm transition-opacity">
          <Spinner />
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />

      <div
        className={`${isDarkMode ? "bg-background2" : "bg-whiteBackground2"} px-4 sm:px-6 py-[25px] select-none min-h-screen transition-colors duration-300`}
      >
        <div
          className={`${isDarkMode ? "bg-gradient-to-r from-fromColor1 to-toColor1" : "bg-whiteBackground"} min-h-[calc(100vh-110px)] rounded-2xl shadow-sm overflow-hidden transition-colors duration-300`}
        >
          <div className="px-6 sm:px-10 py-6">
            <Breadcrumbs />
            <h1
              className={`text-2xl mt-4 mb-6 ${isDarkMode ? "text-textPrimary" : "text-textBlack"} font-poppins-bold tracking-tight`}
            >
              {t("titles.noticeBoard")}
            </h1>
            {/* Input Form Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 ${isDarkMode ? "border-borderWhite2/20 bg-[#2D3133]/50 hover:bg-[#2D3133]/80" : "border-borderWhite2 bg-white hover:shadow-md"}`}
            >
              <div className="flex space-x-3 sm:space-x-4">
                <img
                  src={data?.photo ?? profile}
                  alt="Profile"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-transparent shadow-sm"
                  onError={(e) => {
                    e.target.src = profile;
                  }}
                />

                <div className="flex-1 min-w-0">
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    onInput={handleTextareaInput}
                    rows={2}
                    placeholder={t(`placeholders.WriteNotice`)}
                    className={`w-full p-3 sm:p-4 rounded-xl resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0A81D1] ${
                      isDarkMode
                        ? "bg-[#1A1D1F] text-textPrimary placeholder-gray-400 border border-transparent focus:border-[#0A81D1]"
                        : "bg-[#F8FAFC] text-textBlack border border-gray-200 placeholder-gray-400 focus:bg-white"
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            toTeacher: !prev.toTeacher,
                          }))
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 active:scale-95 flex items-center justify-center ${
                          formData.toTeacher
                            ? "bg-[#0A81D1]/10 text-textBlue border-borderBlue"
                            : isDarkMode
                              ? "text-gray-300 border-gray-600 hover:bg-gray-700/50"
                              : "text-gray-600 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        To Teacher
                      </button>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            toParent: !prev.toParent,
                          }))
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 active:scale-95 flex items-center justify-center ${
                          formData.toParent
                            ? "bg-[#0A81D1]/10 text-textBlue border-borderBlue"
                            : isDarkMode
                              ? "text-gray-300 border-gray-600 hover:bg-gray-700/50"
                              : "text-gray-600 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        To Parent
                      </button>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={loading || isSubmitting}
                      className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center min-w-[100px] ${
                        loading || isSubmitting
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:shadow-md"
                      } ${
                        isDarkMode
                          ? "bg-[#0A81D1] text-white hover:bg-[#0970b5]"
                          : "bg-[#0A81D1] text-white hover:bg-[#0970b5]"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <hr
              className={`my-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            />

            {/* Filter */}
            <div className="flex justify-between items-center mb-4">
              <div className="relative" ref={filterRef}>
                <button
                  className="flex items-center space-x-2 bg-[#0A81D11A] hover:bg-[#0A81D12A] px-4 py-2 rounded-xl cursor-pointer transition-colors duration-200 active:scale-95"
                  onClick={() => setOpenFilter((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={openFilter}
                >
                  <img
                    src={selectedFilter.icon}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-textBlue font-medium text-sm">
                    {selectedFilter.label}
                  </span>
                </button>

                {openFilter && (
                  <div
                    className={`absolute left-0 mt-2 w-48 rounded-xl shadow-xl z-20 overflow-hidden border ${isDarkMode ? "bg-[#2D3133] border-gray-700" : "bg-white border-gray-200"}`}
                  >
                    <ul role="listbox">
                      {options.map((option) => (
                        <li
                          key={option.value}
                          role="option"
                          aria-selected={filterRole === option.value}
                          className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                            filterRole === option.value
                              ? isDarkMode
                                ? "bg-gray-700/50"
                                : "bg-blue-50"
                              : isDarkMode
                                ? "hover:bg-gray-700/30"
                                : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setFilterRole(option.value);
                            setPageNo(1);
                            setOpenFilter(false);
                          }}
                        >
                          <img
                            src={option.icon}
                            alt=""
                            className="w-5 h-5 object-contain mr-3"
                          />
                          <span
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                          >
                            {option.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Empty State */}
            {!loading && requests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div
                  className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <img
                    src={selectedFilter.icon}
                    alt="Empty"
                    className="w-10 h-10 opacity-50"
                  />
                </div>
                <h3
                  className={`text-lg font-semibold mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  No notices found
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                >
                  There are currently no notices matching your criteria.
                </p>
              </div>
            )}

            {/* Notices List */}
            <div className="space-y-4" ref={menuRef}>
              {requests.map((req, index) => {
                const isEditing = editingNoticeId === req._id;
                const isMenuOpen = menuOpenIndex === index;
                const creatorPhoto =
                  req?.createdByRole === "admin"
                    ? (data?.photo ?? profile)
                    : req?.createdByRole === "teacher" &&
                        req?.createdByDetails?.photo
                      ? `data:image/jpeg;base64,${req?.createdByDetails?.photo}`
                      : profile;

                const creatorName =
                  req?.createdByRole === "admin"
                    ? "School Admin"
                    : `${req?.createdByDetails?.firstname ?? ""} ${req?.createdByDetails?.lastname ?? ""}`.trim() ||
                      "Teacher";

                return (
                  <div
                    key={req._id}
                    className={`flex space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-xl border transition-all duration-300 group hover:shadow-sm ${
                      isDarkMode
                        ? "border-gray-700/50 bg-[#2D3133]/30 hover:bg-[#2D3133]/60"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <img
                      src={creatorPhoto}
                      alt="Profile"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-transparent shadow-sm flex-shrink-0"
                      onError={(e) => {
                        e.target.src = profile;
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1 gap-1 sm:gap-4">
                        <p className="text-sm font-semibold truncate flex items-center flex-wrap gap-2">
                          <span
                            className={`${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                          >
                            {data?.schoolName || "School"}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                          >
                            {creatorName}
                          </span>
                        </p>
                        <p
                          className={`text-xs whitespace-nowrap ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {moment(req?.updatedAt).format(
                            "DD MMM YYYY, hh:mm A",
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {req?.targetAudience?.map((audience, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md ${
                              isDarkMode
                                ? "bg-blue-900/30 text-blue-300"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {audience.charAt(0).toUpperCase() +
                              audience.slice(1)}
                            <img
                              src={check}
                              alt="tick"
                              className="w-3 h-3 ml-1 opacity-70"
                            />
                          </span>
                        ))}
                      </div>

                      {isEditing ? (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <textarea
                            value={updatedDescription}
                            onChange={(e) =>
                              setUpdatedDescription(e.target.value)
                            }
                            onInput={handleTextareaInput}
                            className={`w-full p-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0A81D1] transition-all ${
                              isDarkMode
                                ? "bg-[#1A1D1F] text-gray-200 border border-gray-700"
                                : "bg-[#F8FAFC] text-gray-800 border border-gray-200"
                            }`}
                            rows={2}
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleConfirmUpdate(req)}
                              disabled={isSubmitting}
                              className="px-4 py-1.5 bg-[#0A81D1] text-white rounded-lg text-sm font-medium hover:bg-[#0970b5] active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={handleCancelUpdate}
                              disabled={isSubmitting}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium active:scale-95 transition-all disabled:opacity-50 ${
                                isDarkMode
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className={`text-sm mt-1 break-words whitespace-pre-wrap leading-relaxed ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {req?.description}
                        </p>
                      )}
                    </div>

                    {req.createdByRole === "admin" && !isEditing && (
                      <div className="relative flex-shrink-0 ml-2">
                        <button
                          className={`p-1.5 rounded-lg transition-colors ${
                            isMenuOpen
                              ? isDarkMode
                                ? "bg-gray-700"
                                : "bg-gray-200"
                              : isDarkMode
                                ? "hover:bg-gray-700/50"
                                : "hover:bg-gray-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenIndex(isMenuOpen ? null : index);
                          }}
                          aria-label="Notice options"
                          aria-haspopup="true"
                          aria-expanded={isMenuOpen}
                        >
                          <img
                            src={menuIcon}
                            alt="Menu"
                            className="w-5 h-5 opacity-70"
                          />
                        </button>

                        {isMenuOpen && (
                          <div
                            className={`absolute right-0 top-full mt-1 w-36 rounded-xl shadow-lg z-10 overflow-hidden border animate-in fade-in zoom-in-95 duration-200 ${
                              isDarkMode
                                ? "bg-[#2D3133] border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <button
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? "text-gray-200 hover:bg-gray-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => handleUpdate(req)}
                            >
                              Edit Notice
                            </button>
                            <button
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? "text-red-400 hover:bg-red-400/10"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              onClick={() => confirmDelete(req._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalRequestCount > 0 && (
              <div
                className={`flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <div
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("titles.showing")}
                  <span className="font-medium text-[#0A81D1] mx-1">
                    {Math.min(pageNo * limit - (limit - 1), totalRequestCount)}{" "}
                    - {Math.min(totalRequestCount, pageNo * limit)}
                  </span>
                  {t("titles.from")}
                  <span className="font-medium text-[#0A81D1] mx-1">
                    {totalRequestCount}
                  </span>
                  {t("titles.data")}
                </div>

                <div className="flex items-center gap-3">
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{
                      minWidth: "70px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: isDarkMode ? "#2D3133" : "#F8FAFC",
                        color: isDarkMode ? "#E3E8F3" : "#334155",
                        "& fieldset": {
                          borderColor: isDarkMode ? "#4B5563" : "#E2E8F0",
                        },
                        "&:hover fieldset": { borderColor: "#0A81D1" },
                        "&.Mui-focused fieldset": { borderColor: "#0A81D1" },
                      },
                      "& .MuiSvgIcon-root": {
                        color: isDarkMode ? "#9CA3AF" : "#64748B",
                      },
                    }}
                  >
                    <Select
                      value={limit}
                      onChange={(e) => {
                        setLimit(e.target.value);
                        setPageNo(1);
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: "8px",
                            backgroundColor: isDarkMode ? "#2D3133" : "white",
                            color: isDarkMode ? "#E3E8F3" : "#334155",
                            boxShadow:
                              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                          },
                        },
                      }}
                    >
                      {[10, 20, 25, 50].map((itm) => (
                        <MenuItem
                          key={itm}
                          value={itm}
                          sx={{
                            fontSize: "0.875rem",
                            "&:hover": {
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#F1F5F9",
                            },
                            "&.Mui-selected": {
                              backgroundColor: isDarkMode
                                ? "rgba(10, 129, 209, 0.2)"
                                : "#E0F2FE",
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? "rgba(10, 129, 209, 0.3)"
                                  : "#BAE6FD",
                              },
                            },
                          }}
                        >
                          {itm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Pagination
                    count={Math.ceil(totalRequestCount / limit)}
                    page={pageNo}
                    onChange={(_, val) => setPageNo(val)}
                    shape="rounded"
                    size="small"
                    renderItem={(item) => (
                      <PaginationItem
                        {...item}
                        sx={{
                          color: isDarkMode ? "#E3E8F3" : "#334155",
                          "&.Mui-selected": {
                            backgroundColor: "#0A81D1",
                            color: "white",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#0970b5" },
                          },
                          "&:hover:not(.Mui-selected)": {
                            backgroundColor: isDarkMode ? "#374151" : "#F1F5F9",
                          },
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          !isSubmitting && setDeleteDialog({ open: false, id: null })
        }
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#2D3133" : "white",
            color: isDarkMode ? "#F3F4F6" : "#111827",
            borderRadius: "16px",
            padding: "8px",
            minWidth: { xs: "300px", sm: "400px" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem", pb: 1 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: isDarkMode ? "#9CA3AF" : "#4B5563" }}>
            Are you sure you want to delete this notice? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null })}
            disabled={isSubmitting}
            sx={{
              color: isDarkMode ? "#9CA3AF" : "#64748B",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: isDarkMode ? "#374151" : "#F1F5F9",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isSubmitting}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
