import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import noleave from "../../assets/images/noleave.png";
import profileEmpty from "../../assets/images/profileEmpty.png";
import refresh from "../../assets/images/refresh.png";
import dropdown from "../../assets/images/dropdown.png";
import hide from "../../assets/images/hide.png";
import show from "../../assets/images/show.png";
import cross from "../../assets/images/cross.png";
import approve from "../../assets/images/approve.png";
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

export default function Leaves() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConformationPopup, setshowConformationPopup] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentReq, setCurrentReq] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const [toastDisplayed, setToastDisplayed] = useState(false);

  const generateUsername = () => {
    return `GT${Math.floor(100000 + Math.random() * 900000)}`; // GT + 6 random digits
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullname: "",
  });

  // Compute the status query based on the selected tab.
  const getStatusQuery = (tab) => {
    switch (tab) {
      case "approved":
        return "accept,complete";
      case "rejected":
        return "reject,expired";
      default:
        return "accept,reject,pending,complete,expired";
    }
  };

  /**
   * Fetches leave requests from the API
   * Sends a GET request to fetch the leave requests and updates the state accordingly.
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
    fetchLeaves();
  }, [pageNo, limit, selectedTab]);

  const validateData = () => {
    if (!formData.username || !formData.password || !formData.fullname) {
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
        setCurrentReq([]);
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
    selectedTab === "all"
      ? requests
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
        <div className="fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-[#93a3b6]/25 px-6 py-[25px] select-none">
        <div className="bg-[#fafafa] min-h-screen rounded-[16px]">
          <div className="pl-12 py-6">
            <Breadcrumbs />
            <div className="text-2xl font-poppins-bold">
              {t("titles.leave")}
            </div>
          </div>
          {/* tabs */}
          <div className="flex space-x-4 mt-4 px-10">
            {["all", "approved", "rejected"].map((tab) => (
              <div
                key={tab}
                className={`cursor-pointer text-xs font-poppins font-semibold w-[75px] text-center ${
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
          <hr className="border-[#9391A5]/25 mx-10 -translate-y-[1px]" />
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-[400px]">
              <img
                src={noleave}
                alt="noleave"
                className="w-[300px] h-[200px]"
              />
              <p className="text-[28px] font-poppins-bold mt-10">
                {t("labels.noleave")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex px-10 items-start">
                <div
                  className="flex-1 overflow-auto"
                  style={{ maxHeight: "100vh" }}
                >
                  <table className="w-full shadow-sm table-fixed">
                    {/* table heading */}
                    <thead>
                      <tr>
                        <th className="p-4 text-base text-left font-poppins-bold text-[#0F4189]/75">
                          {t(`labels.classTeacher`)}
                        </th>
                        <th className="p-4 text-base text-left font-poppins-bold text-[#0F4189]/75">
                          {t(`labels.phone`)}
                        </th>
                        <th className="p-4 text-base text-left font-poppins-bold text-[#0F4189]/75">
                          {t(`labels.class`)}
                        </th>
                        <th className="p-4 text-base font-poppins-bold text-[#0F4189]/75">
                          {t(`labels.pastLeaves`)}
                        </th>
                        <th className="p-4 text-base text-left font-poppins-bold text-[#0F4189]/75">
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
                              ? "bg-blue-100"
                              : index % 2 === 0
                              ? "bg-[#4645900D]"
                              : ""
                          } border-t`}
                          onClick={() => setCurrentReq(req)}
                        >
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium">
                              {req?.teacher?.firstname || ""}{" "}
                              {req?.teacher?.lastname || ""}
                            </p>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium">
                              {req?.teacher?.phone || "NA"}
                            </p>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium">
                              {req?.teacher?.class || ""}{" "}
                              {req?.teacher?.section || ""}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <p className="text-sm font-medium">
                              {req?.teacher?.leaveRequestCount || 0}
                            </p>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium">
                              {reasonStatus(req?.reason || "")}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <section className="w-[350px] p-5 rounded-2xl bg-slate-200 overflow-y-auto sticky top-4 flex flex-col">
                  <img
                    src={
                      currentReq?.teacher?.photo
                        ? `data:image/jpeg;base64,${currentReq?.teacher?.photo}`
                        : profileEmpty
                    }
                    className="self-center w-[120px] aspect-square object-contain rounded-full"
                    alt="Profile picture"
                  />
                  <header className="flex flex-col items-center mt-3">
                    <h1 className="text-base font-bold text-zinc-900">
                      {currentReq?.teacher?.firstname || ""}
                      {currentReq?.teacher?.lastname || CONSTANT.NA}
                    </h1>
                    <p className="text-sm text-stone-500">
                      {currentReq?.teacher?.class || ""}{" "}
                      {currentReq?.teacher?.section || CONSTANT.NA}
                    </p>
                  </header>

                  <section className="mt-4">
                    <label className="text-xs font-semibold text-zinc-900">
                      Leave Data
                    </label>
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm bg-slate-200 text-stone-900">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/2697c956f2650260c1e6c6c65f7f3b4c5a2a1948?placeholderIfAbsent=true&apiKey=a8cc6c1bf626485c842deb8f5c2a2105"
                        className="w-6 aspect-square object-contain"
                        alt="Calendar icon"
                      />
                      <time className="px-2 py-2 rounded-lg bg-slate-200">
                        {moment(currentReq?.startTime).format("DD/MM/YYYY")} -{" "}
                        {moment(currentReq?.endTime).format("DD/MM/YYYY")}
                      </time>
                    </div>
                  </section>

                  <section className="mt-[10px]">
                    <label className="text-xs font-semibold text-zinc-900">
                      {t(`labels.description`)}
                    </label>
                    <p className="p-2 text-sm leading-5 text-stone-500 overflow-hidden">
                      {currentReq?.description || ""}
                    </p>
                  </section>

                  <section className="mt-[10px]">
                    <label className="text-xs font-semibold text-zinc-900">
                      {t(`labels.username`)}
                    </label>
                    <input
                      type="text"
                      placeholder={t(`placeholders.username`)}
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
                      className="w-full p-2 mb-[10px] text-sm bg-gray-100 rounded-lg text-stone-500"
                    />
                    {currentReq?.status === "pending" && (
                      // <button

                      //   className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      //   title="Generate New Username"
                      // >
                      //   🔄
                      // </button>
                      <div
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            username: generateUsername(),
                          }))
                        }
                        className="relative"
                      >
                        <img
                          src={refresh}
                          alt="passwordIcon"
                          className="transform size-6 absolute right-2 bottom-4 cursor-pointer text-gray-600"
                          style={{
                            filter:
                              "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
                          }}
                        />
                      </div>
                    )}
                    <label className="text-xs font-semibold text-zinc-900">
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
                      className="w-full p-2 mb-[10px] text-sm bg-gray-100 rounded-lg text-stone-500"
                    />
                    <label className="text-xs font-semibold text-zinc-900">
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
                      className="w-full p-2 mb-[10px] text-sm bg-gray-100 rounded-lg text-stone-500"
                    />
                    {currentReq?.status === "pending" && (
                      <div
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="relative"
                      >
                        <img
                          src={showPassword ? hide : show}
                          alt="passwordIcon"
                          className="transform size-6 absolute right-2 bottom-4 cursor-pointer text-gray-600"
                          style={{
                            filter:
                              "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
                          }}
                        />
                      </div>
                    )}
                  </section>

                  {currentReq?.status === "pending" ? (
                    <div className="flex justify-between mt-5 text-sm font-bold text-white">
                      <button
                        onClick={() => setshowConformationPopup(true)}
                        className="font-poppins-bold bg-[#FE4040] p-1 rounded-md px-5 py-2"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleSave(currentReq?._id, "accept")}
                        className="font-poppins-bold bg-[#4CBC9A] p-1 rounded-md px-5 py-2"
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div
                        className={`text-sm text-center font-poppins-regular py-1 px-3 rounded-md border-2 ${
                          currentReq?.status === "accept" ||
                          currentReq?.status === "complete"
                            ? "border-[#4CBC9A] text-[#4CBC9A] bg-[#4CBC9A26]"
                            : "border-[#FE4040] text-[#FE4040] bg-[#FE404026]"
                        }`}
                      >
                        {requestsStatus(currentReq?.status) || "NA"}
                      </div>
                    </div>
                  )}
                </section>
              </div>
              {/* pagination logic */}
              <div className="flex gap-5 justify-between items-center my-9 mx-10 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                <div className="text-[#9391a5] text-base leading-5">
                  {t("titles.showing")}
                  <span className="text-[#152259]">
                    {" "}
                    {pageNo * limit - (limit - 1)} -{" "}
                    {Math.min(totalRequestCount, pageNo * limit)}{" "}
                  </span>
                  {t("titles.from")}
                  <span className="text-[#152259]"> {totalRequestCount} </span>
                  {t("titles.data")}
                </div>

                <div className="flex items-center gap-4">
                  {/* Dropdown to select how many data per page */}
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={limit}
                      onChange={(e) => {
                        setLimit(e.target.value);
                        setPageNo(1);
                      }}
                      sx={{
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        minWidth: "80px",
                        backgroundColor: "#fafafa",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                      }}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
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
                            color: "#0F4189",
                            borderColor:
                              item.type === "previous" || item.type === "next"
                                ? "transparent"
                                : "#0F4189",
                            borderWidth: "2px",
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
