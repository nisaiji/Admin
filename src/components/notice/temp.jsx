import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import calendar from "../../assets/images/darkmode/calendar.png";
import noDataFound from "../../assets/images/darkmode/noDataFound.png";
import download from "../../assets/images/darkmode/download.png";
import close from "../../assets/images/close.png";
import cross from "../../assets/images//darkmode/cross.png";
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
import { useSelector } from "react-redux";

export default function Notice() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [showPntReq, setCurrentReq] = useState({});
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalReassword, setShowPassword] = useState(false);
  const [showConformationPopup, setshowConformationPopup] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currequestCount, setTotalRequestCount] = useState(1);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const generateUsername = () => {
    return `GT${Math.floor(100000 + Math.random() * 900000)}`; // GT + 6 random digits
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teacher: false,
    parent: false,
  });

  /**
   * Fetches leave requests from the API
   * Sends a GET request to fetch the leave requests and updates the state accordingly.
   */
  const fetchNotice = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_NOTICE}?page=${pageNo}&limit=${limit}`
      );

      if (res?.statusCode === 200) {
        setRequests(res?.result?.announcements || []);
        setTotalRequestCount(res?.result?.total);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook that runs when the component mounts
   * Fetches the leave requests when the component loads.
   */
  useEffect(() => {
    fetchNotice();
  }, [pageNo, limit, selectedTab]);

  const validateData = () => {
    if (!formData.title.trim()) {
      return t("validationError.title");
    } else if (!formData.description.trim()) {
      return t("validationError.description");
    } else if (!formData.teacher && !formData.parent) {
      return t("validationError.selectTeacherOrParent");
    } else {
      return "";
    }
  };
  /**
   * Handles the action of adding a notice.
   * Sends a POST request to update the status of the leave request.
   */
  const handleSave = async () => {
    try {
      if (toastDisplayed) return;
      setToastDisplayed(true);
      setTimeout(() => setToastDisplayed(false), 3000);
      // Validate form
      const e = validateData();
      if (e) return toast.error(e);

      let targetAudience = [];
      if (formData.teacher) targetAudience.push("teacher");
      if (formData.parent) targetAudience.push("parent");

      // Send POST request
      const res = await axiosClient.post(EndPoints.ADMIN.ADD_NOTICE, {
        title: formData.title,
        description: formData.description,
        targetAudience,
      });
      // console.log(res);

      if (res?.statusCode === 201) {
        toast.success(res?.result);
        setFormData({
          title: "",
          description: "",
          teacher: false,
          parent: false,
        });
        fetchNotice();
      }
    } catch (e) {
      toast.error(e);
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
              {t("titles.issueNotice")}
            </div>
          </div>
          <div className={`overflow-x-auto`}>
            <div className={`flex px-10 items-start`}>
              <section
                className={`w-[350px] p-7 rounded-2xl overflow-y-auto sticky flex flex-col ${
                  isDarkMode ? "bg-[#6868684D]" : "bg-whiteBackground2"
                }`}
              >
                <section>
                  <label
                    className={`text-md font-semibold ${
                      isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                    }`}
                  >
                    Notice Date
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
                      {moment().format("DD/MM/YYYY")}
                    </time>
                  </div>
                </section>

                <section className={`mt-[10px]`}>
                  <label
                    className={`text-xs font-semibold ${
                      isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                    }`}
                  >
                    {t(`labels.title`)}
                  </label>
                  <input
                    type="text"
                    placeholder={t(`placeholders.titleOfNotice`)}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className={`w-full mt-2 p-2 mb-[10px] text-sm bg-[#6868684D] rounded-lg border ${
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
                    {t(`labels.description`)}
                  </label>
                  <textarea
                    placeholder={t(`placeholders.WriteAnnouncement`)}
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={`w-full mt-2 h-[120px] max-h-[200px] min-h-[50px] p-2 mb-[10px] text-sm bg-[#6868684D] rounded-lg border ${
                      isDarkMode
                        ? "text-textPrimary border-borderWhite"
                        : "text-textBlack border-borderGray"
                    }`}
                  />
                </section>

                <div
                  className={`flex justify-between text-sm font-bold text-white`}
                >
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        teacher: !prev.teacher,
                      }))
                    }
                    className={`font-poppins-bold p-1 rounded-md px-5 py-2 border transition-all duration-300 ${
                      formData.teacher
                        ? "bg-backgroundOrange1 text-textPrimary border-borderOrange1"
                        : isDarkMode
                        ? "border-borderWhite text-textPrimary"
                        : ""
                    }`}
                  >
                    To Teacher
                  </button>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        parent: !prev.parent,
                      }))
                    }
                    className={`font-poppins-bold p-1 rounded-md px-5 py-2 border transition-all duration-300 ${
                      formData.parent
                        ? "bg-backgroundOrange1 text-textPrimary border-borderOrange1"
                        : isDarkMode
                        ? "border-borderWhite text-textPrimary"
                        : ""
                    }`}
                  >
                    To Parent
                  </button>
                </div>

                <button
                  onClick={() => handleSave()}
                  className={`font-poppins-bold p-1 rounded-md mt-5 px-5 py-2 ${
                    isDarkMode ? "bg-backgroundBlue text-textPrimary" : ""
                  }`}
                >
                  Send
                </button>
              </section>
              <div
                className={`flex-1 overflow-auto max-h-[600px]`}
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
                        {t(`labels.title`)}
                      </th>
                      <th
                        className={`p-4 text-base text-left font-poppins-bold text-textBlue`}
                      >
                        {t(`labels.notice`)}
                      </th>
                      <th
                        className={`p-4 text-base text-left font-poppins-bold text-textBlue`}
                      >
                        {t(`labels.to`)}
                      </th>
                      <th
                        className={`p-4 text-base font-poppins-bold text-textBlue`}
                      >
                        {t(`labels.dateOfNotice`)}
                      </th>
                    </tr>
                  </thead>
                  {/* table body */}
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="4">
                          <div
                            className={`flex flex-col justify-center items-center`}
                          >
                            <img
                              src={noDataFound}
                              alt="noleave"
                              className={`w-[300px] h-[200px] object-contain`}
                            />
                            <p
                              className={`text-[28px] ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-poppins-bold mt-5`}
                            >
                              {t("labels.noNotice")}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      requests.map((req, index) => (
                        <tr
                          key={index}
                          className={`${
                            isDarkMode ? "" : "bg-whiteBackground1"
                          } border-t`}
                        >
                          <td className={`px-4 py-2.5`}>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-textPrimary"
                                  : "text-textBlack"
                              } font-medium`}
                            >
                              {req?.title || ""}
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
                              <div
                                onClick={() => {
                                  setCurrentReq(req);
                                  setIsPopupOpen(true);
                                }}
                                className="flex items-center border border-borderBlue rounded-xl p-1 w-20 text-textBlue cursor-pointer"
                              >
                                <img
                                  src={download}
                                  alt="download"
                                  className="size-6 object-contain"
                                />
                                Open
                              </div>
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
                              {req?.targetAudience.join(",") || ""}
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
                              {moment(req?.createdAt).format("ddd, DD MMM YYYY HH:MM A")}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
                            backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
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
            {/* Popup */}
            {isPopupOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div
                  className={`p-6 rounded-2xl shadow-lg max-w-md w-full relative ${
                    isDarkMode ? "bg-background3" : "bg-whiteBackground"
                  }`}
                >
                  {/* Popup Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`text-lg font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      Notice
                    </h3>
                    <img
                      className={`cursor-pointer ${
                        isDarkMode ? "h-4 w-4" : "h-7 w-7"
                      }`}
                      src={isDarkMode ? cross : close}
                      alt="Close"
                      onClick={() => {
                        setCurrentReq([]);
                        setIsPopupOpen(false);
                      }}
                    />
                  </div>
                  <hr className="bg-backgroundGray50 mb-3" />
                  <section>
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      Notice Date
                    </label>
                    <div
                      className={`flex items-center gap-1.5 text-sm ${
                        isDarkMode
                          ? "text-textPrimary bg-transparent"
                          : "text-textBlack"
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
                        {moment(currentReq?.createdAt).format("DD/MM/YYYY")}
                      </time>
                    </div>
                  </section>

                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className={`block text-sm font-medium mt-3 ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      Title
                    </label>
                    <div
                      className={`w-full px-4 py-2 mt-2 rounded-xl border border-stone-500 border-opacity-30 ${
                        isDarkMode
                          ? "text-textPrimary bg-backgroundGray2"
                          : "text-textBlack"
                      }`}
                    >
                      {currentReq?.title || ""}
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className={`block text-sm font-medium mt-3 ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      Description
                    </label>
                    <div
                      className={`w-full min-h-28 px-4 py-2 mt-2 rounded-xl border border-stone-500 border-opacity-30 ${
                        isDarkMode
                          ? "text-textPrimary bg-backgroundGray2"
                          : "text-textBlack"
                      }`}
                    >
                      {currentReq?.description || ""}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
