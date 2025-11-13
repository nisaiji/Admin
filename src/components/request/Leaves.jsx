/**
 * Leaves.jsx
 *
 * This component manages and displays teacher leave requests for the admin dashboard.
 * It provides tab-based filtering (pending, approved, rejected, all), pagination, and detailed view for each request.
 * Admins can approve or reject leave requests, generate guest teacher credentials, and view leave details.
 * The component fetches leave requests from the backend, validates input, and updates leave status via API.
 * It supports dark mode styling, displays loading and toast notifications, and uses Material UI for controls.
 * Uses React hooks for state, Redux for config state, and i18next for translations.
 *
 * Main features:
 * - Tab-based filtering of leave requests
 * - Pagination and limit selection
 * - Detailed sidebar for selected leave request
 * - Approve/reject actions with guest teacher credential generation
 * - Confirmation popup for rejection
 * - Responsive and dark mode support
 */

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import calendar from "../../assets/images/darkmode/calendar.png";
import noDataFound from "../../assets/images/darkmode/noDataFound.png";
import profileEmpty from "../../assets/images/profileEmpty.png";
import refresh from "../../assets/images/refresh.png";
import hide from "../../assets/images/hide.png";
import show from "../../assets/images/show.png";
import ConformationPopup from "../ConformationPopup";
import moment from "moment";
import {
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

export default function Leaves() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConformationPopup, setshowConformationPopup] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentReq, setCurrentReq] = useState({});
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  /**
   * Generates a random guest teacher username.
   * @returns {string} - Username in format GTXXXXXX
   */
  const generateUsername = () => {
    return `GT${Math.floor(100000 + Math.random() * 900000)}`; // GT + 6 random digits
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullname: "",
  });

  /**
   * Returns the status query string for API based on selected tab.
   * @param {string} tab - Tab name
   * @returns {string} - Status query string
   */
  const getStatusQuery = (tab) => {
    switch (tab) {
      case "pending":
        return "pending";
      case "approved":
        return "accept,complete";
      case "rejected":
        return "reject,expired";
      default:
        return "accept,reject,pending,complete,expired";
    }
  };

  /**
   * Fetches leave requests from the API and updates state.
   */
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const statusQuery = getStatusQuery(selectedTab);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_LEAVES}?model=teacher&page=${pageNo}&limit=${limit}&status=${statusQuery}`
      );
      if (res?.statusCode === 200) {
        setRequests(res?.result?.leaveRequests[0]?.teachers || []);
        setTotalRequestCount(res?.result?.totalLeaveRequests);
        setCurrentReq(res?.result?.leaveRequests[0]?.teachers[0]);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch leave requests when pagination or tab changes.
   */
  useEffect(() => {
    fetchLeaves();
  }, [pageNo, limit, selectedTab]);

  /**
   * Validates guest teacher credential form data.
   * @returns {string} - Error message if invalid, empty string if valid
   */
  const validateData = () => {
    if (
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.fullname.trim()
    ) {
      return t("validationError.fillAll");
    } else if (formData.username.length < 5) {
      return t("validationError.usernameLength");
    } else if (formData.fullname.length < 5) {
      return t("validationError.fullnameLength");
    } else if (formData.password.length < 8) {
      return t("validationError.passwordLength");
    } else {
      return "";
    }
  };

  /**
   * Handles the action of saving, approving, or rejecting a leave request.
   * Sends a PUT request to update the status of the leave request.
   * @param {string} id - The ID of the leave request
   * @param {string} status - The new status (approve/reject)
   */
  const handleSave = async (id, status) => {
    try {
      if (toastDisplayed) return;
      setToastDisplayed(true);
      setTimeout(() => setToastDisplayed(false), 3000);
      let data;
      if (status === "reject") {
        data = {
          leaveRequestId: id,
          status: status,
        };
      } else {
        // Validate form
        const e = validateData();
        if (e) return toast.error(e);

        data = {
          leaveRequestId: id,
          status: status,
          username: formData.username,
          tagline: formData.fullname,
          password: formData.password,
        };
      }
      // Send a PUT request to update the leave status
      const res = await axiosClient.put(EndPoints.ADMIN.UPDATE_LEAVE, data);
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        setFormData({ username: "", password: "", fullname: "" });
        setCurrentReq({});
        fetchLeaves();
      }
    } catch (e) {
      toast.error(e);
    }
  };

  /**
   * Filters the leave requests based on the selected tab (all, approved, rejected)
   * @returns {Array} - The filtered list of leave requests based on the selected tab
   */
  const filteredRequests =
    selectedTab === "pending"
      ? requests.filter((req) => req.status === "pending")
      : selectedTab === "approved"
      ? requests.filter(
          (req) => req.status === "accept" || req.status === "complete"
        )
      : selectedTab === "rejected"
      ? requests.filter(
          (req) => req.status === "reject" || req.status === "expired"
        )
      : requests;

  /**
   * @param {string} status - The status code (accept, reject, complete, etc.)
   * @returns {string} - The translated status string
   */
  const requestsStatus = (status) => {
    //accept,reject,complete,pending
    switch (status) {
      case "pending":
        return "Pending";
      case "accept":
        return "Approved";
      case "reject":
        return "Rejected";
      case "complete":
        return "Completed";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
    }
  };

  /**
   * @param {string} status - The status code (accept, reject, complete, etc.)
   * @returns {string} - The translated status string
   */
  const reasonStatus = (status) => {
    switch (status) {
      case "MedicalLeave":
        return "Medical Leave";
      case "OtherReason":
        return "Other Reason";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  /**
   * Handle page change for pagination.
   * @param {Object} event - Event object.
   * @param {number} value - New page number.
   */
  const handlePageChange = (event, value) => setPageNo(value);

  return (
    <>
      {/* loader */}
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div
        className={`${
          isDarkMode ? "bg-background2" : "bg-whiteBackground2"
        } px-6 py-[25px] select-none`}
      >
        <div
          className={`${
            isDarkMode
              ? "bg-gradient-to-r from-fromColor1 to-toColor1"
              : "bg-whiteBackground"
          } min-h-[calc(100vh-110px)] rounded-[16px]`}
        >
          <div className={`pl-12 py-6`}>
            <Breadcrumbs />
            <div
              className={`text-2xl ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } font-poppins-bold`}
            >
              {t("titles.leave")}
            </div>
          </div>
          {/* tabs */}
          <div className={`flex space-x-4 mt-4 px-10`}>
            {["pending", "approved", "rejected", "all"].map((tab) => (
              <div
                key={tab}
                className={`cursor-pointer ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } text-xs font-poppins font-semibold w-[75px] text-center ${
                  selectedTab === tab
                    ? "pb-3 border-b-[3px] border-[#FF793F]"
                    : ""
                }`}
                onClick={() => {
                  setSelectedTab(tab);
                  setPageNo(1);
                }}
              >
                {t(`labels.${tab}`)}
              </div>
            ))}
          </div>
          <hr className={`border-[#9391A5]/25 mx-10 -translate-y-[1px]`} />
          {filteredRequests.length === 0 ? (
            <div className={`flex flex-col justify-center items-center`}>
              <img
                src={noDataFound}
                alt="noleave"
                className={`w-[300px] h-[200px] object-contain`}
              />
              <p
                className={`text-[28px] ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } font-poppins-bold mt-5`}
              >
                {t("labels.noleave")}
              </p>
            </div>
          ) : (
            <div className={`overflow-x-auto`}>
              <div className={`flex px-10 items-start`}>
                <div
                  className={`flex-1 overflow-auto`}
                  style={{ maxHeight: "100vh" }}
                >
                  <table className={`w-full shadow-sm table-fixed`}>
                    {/* table heading */}
                    <thead>
                      <tr
                        className={`${
                          isDarkMode
                            ? "bg-backgroundTableCell"
                            : "bg-whiteBackground"
                        }`}
                      >
                        <th
                          className={`p-4 text-base text-left font-poppins-bold text-textBlue`}
                        >
                          {t(`labels.classTeacher`)}
                        </th>
                        <th
                          className={`p-4 text-base text-left font-poppins-bold text-textBlue`}
                        >
                          {t(`labels.phone`)}
                        </th>
                        <th
                          className={`p-4 text-base text-left font-poppins-bold text-textBlue`}
                        >
                          {t(`labels.class`)}
                        </th>
                        <th
                          className={`p-4 text-base font-poppins-bold text-textBlue`}
                        >
                          {t(`labels.dateOfRequest`)}
                        </th>
                        <th
                          className={`p-4 text-base font-poppins-bold text-textBlue`}
                        >
                          {t(`labels.pastLeaves`)}
                        </th>
                        <th
                          className={`p-4 text-base text-left font-poppins-bold text-textBlue`}
                        >
                          {t(`labels.reasonForLeave`)}
                        </th>
                      </tr>
                    </thead>
                    {/* table body */}
                    <tbody>
                      {filteredRequests.map((req, index) => (
                        <tr
                          key={index}
                          className={`${
                            currentReq?._id === req._id
                              ? isDarkMode
                                ? "bg-background4"
                                : "bg-whiteBackground1"
                              : ""
                          } border-t`}
                          onClick={() => setCurrentReq(req)}
                        >
                          <td className={`px-4 py-2.5`}>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-medium`}
                            >
                              {req?.teacher?.firstname || ""}{" "}
                              {req?.teacher?.lastname || ""}
                            </p>
                          </td>
                          <td className={`px-4 py-2.5`}>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-medium`}
                            >
                              {req?.teacher?.phone || "NA"}
                            </p>
                          </td>
                          <td className={`px-4 py-2.5`}>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-medium`}
                            >
                              {req?.teacher?.class || CONSTANT.NA}{" "}
                              {req?.teacher?.section || ""}
                            </p>
                          </td>
                          <td className={`px-4 py-2.5 text-center`}>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-medium`}
                            >
                              {moment(req?.createdAt).format("DD/MM/YYYY")}
                            </p>
                          </td>
                          <td className={`px-4 py-2.5 text-center`}>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-medium`}
                            >
                              {req?.teacher?.leaveRequestCount || 0}
                            </p>
                          </td>
                          <td className={`px-4 py-2.5`}>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-medium`}
                            >
                              {reasonStatus(req?.reason || "")}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <section
                  className={`w-[350px] p-5 rounded-2xl overflow-y-auto sticky top-4 flex flex-col ${
                    isDarkMode ? "bg-[#6868684D]" : "bg-whiteBackground2"
                  }`}
                >
                  <img
                    src={
                      currentReq?.teacher?.photo
                        ? `data:image/jpeg;base64,${currentReq?.teacher?.photo}`
                        : profileEmpty
                    }
                    className={`self-center w-[120px] aspect-square object-contain rounded-full`}
                    alt="Profile picture"
                  />
                  <header className={`flex flex-col items-center mt-3`}>
                    <h1
                      className={`text-base font-bold ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {currentReq?.teacher?.firstname || ""}
                      {currentReq?.teacher?.lastname || CONSTANT.NA}
                    </h1>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {currentReq?.teacher?.class || ""}{" "}
                      {currentReq?.teacher?.section || CONSTANT.NA}
                    </p>
                  </header>

                  <section className={`mt-4`}>
                    <label
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      Leave Data
                    </label>
                    <div
                      className={`flex items-center gap-1.5 mt-1.5 text-sm ${
                        isDarkMode
                          ? "text-textPrimary bg-transparent"
                          : "text-textBlack bg-whiteBackground1"
                      }`}
                    >
                      <img
                        src={calendar}
                        className={`w-6 aspect-square object-contain`}
                        alt="Calendar icon"
                        style={{
                          filter: isDarkMode ? "invert(0%)" : "invert(50%)",
                        }}
                      />
                      <time className={`px-2 py-2 rounded-lg`}>
                        {moment(currentReq?.startTime).format("DD/MM/YYYY")} -{" "}
                        {moment(currentReq?.endTime).format("DD/MM/YYYY")}
                      </time>
                    </div>
                  </section>

                  <section className={`mt-[10px]`}>
                    <label
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {t(`labels.description`)}
                    </label>
                    <p
                      className={`p-2 text-sm text-justify leading-5 overflow-hidden ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {currentReq?.description || ""}
                    </p>
                  </section>

                  <section className={`mt-[10px]`}>
                    <label
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {t(`labels.username`)}
                    </label>
                    <input
                      type="text"
                      placeholder={t(`placeholders.generateUsername`)}
                      value={
                        currentReq?.status === "accept" ||
                        currentReq?.status === "complete"
                          ? currentReq?.guestTeacher?.username || ""
                          : formData.username
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      disabled
                      className={`w-full p-2 mb-[10px] text-sm bg-transparent rounded-lg border ${
                        isDarkMode
                          ? "text-textPrimary border-borderWhite"
                          : "text-textBlack border-borderGray"
                      }`}
                    />
                    {currentReq?.status === "pending" && (
                      <div
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            username: generateUsername(),
                          }))
                        }
                        className={`relative`}
                      >
                        <img
                          src={refresh}
                          alt="passwordIcon"
                          className={`transform size-6 absolute right-2 bottom-4 cursor-pointer text-gray-600`}
                          style={{
                            filter: isDarkMode ? "invert(100%)" : "invert(0%)",
                          }}
                        />
                      </div>
                    )}
                    <label
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {t(`labels.teacherName`)}
                    </label>
                    <input
                      type="text"
                      placeholder={t(`placeholders.replacementTeacherName`)}
                      value={
                        currentReq?.status === "accept" ||
                        currentReq?.status === "complete"
                          ? currentReq?.guestTeacher?.tagline || ""
                          : formData.fullname
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullname: e.target.value,
                        }))
                      }
                      disabled={currentReq?.status !== "pending"}
                      className={`w-full p-2 mb-[10px] text-sm bg-transparent rounded-lg border ${
                        isDarkMode
                          ? "text-textPrimary border-borderWhite"
                          : "text-textBlack border-borderGray"
                      }`}
                    />
                    <label
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {t(`labels.password`)}
                    </label>
                    <input
                      placeholder={t(`placeholders.password`)}
                      type={showPassword ? "password" : "text"}
                      value={
                        currentReq?.status === "accept" ||
                        currentReq?.status === "complete"
                          ? currentReq?.guestTeacher?.secretKey || ""
                          : formData.password
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      disabled={currentReq?.status !== "pending"}
                      className={`w-full p-2 mb-[10px] text-sm bg-transparent rounded-lg border ${
                        isDarkMode
                          ? "text-textPrimary border-borderWhite"
                          : "text-textBlack border-borderGray"
                      }`}
                    />
                    {currentReq?.status === "pending" && (
                      <div
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={`relative`}
                      >
                        <img
                          src={showPassword ? hide : show}
                          alt="passwordIcon"
                          className={`transform size-6 absolute right-2 bottom-4 cursor-pointer`}
                          style={{
                            filter: isDarkMode ? "invert(0%)" : "invert(100%)",
                          }}
                        />
                      </div>
                    )}
                  </section>

                  {currentReq?.status === "pending" ? (
                    <div
                      className={`flex justify-between mt-5 text-sm font-bold text-white`}
                    >
                      <button
                        onClick={() => setshowConformationPopup(true)}
                        className={`font-poppins-bold p-1 rounded-md px-5 py-2 ${
                          isDarkMode ? "bg-backgroundRed text-textPrimary" : ""
                        }`}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleSave(currentReq?._id, "accept")}
                        className={`font-poppins-bold p-1 rounded-md px-5 py-2 ${
                          isDarkMode
                            ? "bg-backgroundGreen text-textPrimary"
                            : ""
                        }`}
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <div className={`flex justify-center`}>
                      <div
                        className={`text-sm text-center font-poppins-regular py-1 px-3 rounded-md border-2 ${
                          currentReq?.status === "accept" ||
                          currentReq?.status === "complete"
                            ? isDarkMode
                              ? "bg-backgroundGreen text-textPrimary"
                              : "border-borderGreen text-textGreen bg-backgroundDarkGreen"
                            : currentReq?.status === "reject" ||
                              currentReq?.status === "expired"
                            ? isDarkMode
                              ? " bg-backgroundRed text-textPrimary"
                              : "border-borderRed text-textRed bg-backgroundDarkRed2"
                            : ""
                        }`}
                      >
                        {requestsStatus(currentReq?.status) || "NA"}
                      </div>
                    </div>
                  )}
                </section>
              </div>
              {/* pagination logic */}
              <div
                className={`flex gap-5 justify-between items-center my-9 mx-10 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full`}
              >
                <div className={`text-[#9391a5] text-base leading-5`}>
                  {t("titles.showing")}
                  <span className={`text-textBlue`}>
                    {" "}
                    {pageNo * limit - (limit - 1)} -{" "}
                    {Math.min(totalRequestCount, pageNo * limit)}{" "}
                  </span>
                  {t("titles.from")}
                  <span className={`text-textBlue`}> {totalRequestCount} </span>
                  {t("titles.data")}
                </div>

                <div className={`flex items-center gap-4`}>
                  {/* Dropdown to select how many data per page */}
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      minWidth: "80px",
                      backgroundColor: isDarkMode ? "" : "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .MuiInputBase-root, & .MuiSvgIcon-root": {
                        color: isDarkMode ? "#E3E8F3" : "black",
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
                            backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                            color: isDarkMode ? "#E3E8F3" : "black",
                          },
                        },
                      }}
                    >
                      {[10, 20, 25, 50, 100].map((itm, i) => (
                        <MenuItem
                          key={i}
                          value={itm}
                          sx={{
                            backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                            color: isDarkMode ? "#E3E8F3" : "black",
                            "&:hover": {
                              backgroundColor: isDarkMode
                                ? "#2a2a2a"
                                : "#E9EEF2",
                            },
                          }}
                        >
                          {itm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Stack spacing={2}>
                    <Pagination
                      count={Math.ceil(totalRequestCount / limit)}
                      shape="rounded"
                      page={pageNo}
                      onChange={handlePageChange}
                      renderItem={(item) => (
                        <PaginationItem
                          {...item}
                          sx={{
                            color: isDarkMode ? "white" : "black",
                            borderColor:
                              item.type === "previous" || item.type === "next"
                                ? "transparent"
                                : "#0F4189",
                            borderWidth: "2px",
                            borderRadius: "20px",
                            borderStyle: "solid",
                            "&.Mui-selected": {
                              color: "white",
                              backgroundColor: "#0F4189",
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* confirm popup of reject leave */}
      <ConformationPopup
        isVisible={showConformationPopup}
        onClose={() => setshowConformationPopup(false)}
        onSubmit={() => {
          handleSave(currentReq._id, "reject");
          setshowConformationPopup(false);
        }}
        message={t("confirm.leave")}
      />
    </>
  );
}
