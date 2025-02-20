import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
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

export default function Leaves() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConformationPopup, setshowConformationPopup] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentReq, setCurrentReq] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullname: "",
  });

  /**
   * Fetches leave requests from the API
   * Sends a GET request to fetch the leave requests and updates the state accordingly.
   */
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_LEAVES}?model=teacher&page=${pageNo}&limit=${limit}&status=accept,reject,pending,complete`
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
  }, [pageNo, limit]);

  /**
   * Handles the action of saving, approving, or rejecting a leave request.
   * Sends a PUT request to update the status of the leave request.
   * @param {string} id - The ID of the leave request
   * @param {string} status - The new status (approve/reject)
   */
  const handleSave = async (id, status) => {
    try {
      let data;
      if (status === "reject") {
        data = {
          leaveRequestId: id,
          status: status,
        };
      } else {
        // Validate form
        if (!formData.username || !formData.password || !formData.fullname) {
          toast.error("Please fill all the fields");
          return;
        }
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
        setExpandedRow(null);
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
      ? requests.filter((req) => req.status === "reject")
      : requests;

  /**
   * Translates status codes to human-readable text.
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
      <div className="bg-[#93a3b6]/25 px-6 py-[25px]">
        <div className="bg-[#fafafa] min-h-screen rounded-[16px]">
          <div className="text-2xl font-poppins-bold pl-12 py-6">
            {t("titles.leave")}
          </div>
          {/* tabs */}
          <div className="flex space-x-4 mt-4 pl-12">
            {["all", "approved", "rejected"].map((tab) => (
              <div
                key={tab}
                className={`cursor-pointer text-xs font-poppins font-semibold w-[75px] text-center ${
                  selectedTab === tab
                    ? "pb-3 border-b-[3px] border-[#FF793F]"
                    : ""
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {t(`labels.${tab}`)}
              </div>
            ))}
          </div>
          <hr className="border-[#9391A5]/25 mx-10 -translate-y-[1px]" />
          {filteredRequests.length === 0 ? (
            <div className="w-full h-48 flex justify-center items-center">
              <p className="text-[#0F4189]/75 text-3xl font-poppins-bold">
                No request right now
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-6">
              <table className="w-full shadow-sm overflow-hidden">
                {/* table heading */}
                <thead>
                  <tr>
                    <th></th>
                    <th className="p-4 text-base text-left font-poppins-bold text-[#0F4189]/75">
                      {t(`labels.classTeacher`)}
                    </th>
                    <th className="p-4 text-base text-left font-poppins-bold text-[#0F4189]/75">
                      {t(`labels.reasonForLeave`)}
                    </th>
                    <th className="p-4 text-base text-left font-poppins-bold text-[#0F4189]/75">
                      {t(`labels.class`)}
                    </th>
                    <th className="p-4 text-base font-poppins-bold text-[#0F4189]/75">
                      {t(`labels.pastLeaves`)}
                    </th>
                    <th className="p-4 text-base font-poppins-bold text-[#0F4189]/75">
                      {t(`labels.description`)}
                    </th>
                    <th className="p-4 text-base font-poppins-bold text-[#0F4189]/75">
                      {t(`labels.action`)}
                    </th>
                  </tr>
                </thead>
                {/* table body */}
                <tbody>
                  {filteredRequests.map((req, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-[#4645900D]" : ""
                      } border-t `}
                    >
                      {/* row expand button */}
                      <td className="px-4 py-2 align-top">
                        <img
                          src={dropdown}
                          onClick={() =>
                            (req?.status === "accept" ||
                              req?.status === "complete") &&
                            setExpandedRow((prev) =>
                              prev === index ? null : index
                            )
                          }
                          alt=""
                          className={`size-4 ml-8 ${
                            expandedRow === index ? "rotate-180" : ""
                          } ${
                            req?.status === "accept" ||
                            req?.status === "complete"
                              ? "cursor-pointer"
                              : "cursor-not-allowed"
                          }`}
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <p className="text-sm font-medium">
                          {req?.teacher?.firstname || ""}{" "}
                          {req?.teacher?.lastname || ""}
                        </p>
                        {expandedRow === index && (
                          <>
                            <p className="text-[#686868BF] text-xs font-poppins font-normal pt-2">
                              username
                            </p>
                            <input
                              autocomplete="off"
                              autocapitalize="none"
                              autoCorrect="off"
                              spellcheck="false"
                              type="text"
                              placeholder="Enter Username"
                              value={
                                req?.status === "accept" ||
                                req?.status === "complete"
                                  ? req?.guestTeacher?.username || ""
                                  : formData.username
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  username: e.target.value,
                                }))
                              }
                              disabled={
                                req?.status === "accept" ||
                                req?.status === "complete"
                              }
                              className={`mt-1 p-2 border rounded w-full text-sm font-poppins font-normal focus:outline-none ${
                                req?.status === "accept" ||
                                req?.status === "complete"
                                  ? "bg-gray-200 cursor-not-allowed"
                                  : ""
                              }`}
                            />
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <p className="text-sm font-medium">
                          {req?.reason || ""}
                        </p>
                        {expandedRow === index && (
                          <>
                            <p className="text-[#686868BF] text-xs font-poppins font-normal pt-2">
                              Teacher name
                            </p>
                            <input
                              autocomplete="off"
                              autocapitalize="none"
                              autoCorrect="off"
                              spellcheck="false"
                              type="fullname"
                              placeholder="Substitute Teacher"
                              value={
                                req?.status === "accept" ||
                                req?.status === "complete"
                                  ? req?.guestTeacher?.tagline || ""
                                  : formData.fullname
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  fullname: e.target.value,
                                }))
                              }
                              disabled={
                                req?.status === "accept" ||
                                req?.status === "complete"
                              }
                              className={`mt-1 p-2 border rounded w-full text-sm font-poppins font-normal focus:outline-none ${
                                req?.status === "accept" ||
                                req?.status === "complete"
                                  ? "bg-gray-200 cursor-not-allowed"
                                  : ""
                              }`}
                            />
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <p className="text-sm font-medium">
                          {req?.teacher?.class || ""}{" "}
                          {req?.teacher?.section || ""}
                        </p>
                        {expandedRow === index && (
                          <>
                            <p className="text-[#686868BF] text-xs font-poppins font-normal pt-2">
                              password
                            </p>
                            <div className="relative">
                              <input
                                autocomplete="off"
                                autocapitalize="none"
                                autoCorrect="off"
                                spellcheck="false"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={
                                  req?.status === "accept" ||
                                  req?.status === "complete"
                                    ? req?.guestTeacher?.secretKey || ""
                                    : formData.password
                                }
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                  }))
                                }
                                disabled={
                                  req?.status === "accept" ||
                                  req?.status === "complete"
                                }
                                className={`mt-1 p-2 border rounded w-full text-sm font-poppins font-normal focus:outline-none ${
                                  req?.status === "accept" ||
                                  req?.status === "complete"
                                    ? "bg-gray-200 cursor-not-allowed"
                                    : ""
                                }`}
                              />
                              {req?.status === "accept" ||
                              req?.status === "complete" ? (
                                <></>
                              ) : (
                                <div
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
                                  className="absolute right-2 top-3 cursor-pointer text-gray-600"
                                >
                                  <img
                                    src={showPassword ? hide : show}
                                    alt="passwordIcon"
                                    className="relative right-1 top-0 transform w-6 h-6 cursor-pointer"
                                    style={{
                                      filter:
                                        "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center space-y-7">
                        <p className="text-sm font-medium">
                          {req?.pastLeaves || 0}
                        </p>
                        {expandedRow === index && (
                          <button
                            onClick={() => handleSave(req._id, "accept")}
                            disabled={
                              req?.status === "accept" ||
                              req?.status === "complete"
                            }
                            className={`${
                              req?.status === "accept" ||
                              req?.status === "complete"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#0F4189] text-white"
                            } text-xs font-poppins-bold px-4 py-2 rounded-md`}
                          >
                            Save
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2 flex justify-center">
                        <img
                          src={approve}
                          alt="description"
                          className="w-[70px] h-[32px] cursor-pointer"
                          onClick={() => {
                            setCurrentReq(req);
                            setIsPopupOpen(true);
                          }}
                        />
                      </td>
                      {/* action buttons */}
                      <td className="px-4 py-2 w-[200px] align-top text-sm font-medium text-center">
                        {req.status === "pending" ? (
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => setExpandedRow(index)}
                              className="text-[#4CBC9A] font-poppins-bold border-2 border-[#4CBC9A] p-1 rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setCurrentReq(req);
                                setshowConformationPopup(true);
                              }}
                              className="text-[#FE4040] font-poppins-bold border-2 border-[#FE4040] p-1 px-3 rounded-md"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button className="text-white text-sm font-poppins-regular bg-[#68686880] py-1 px-3 rounded-md cursor-not-allowed">
                            {requestsStatus(req?.status)}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
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
        message={"Please Confirm reject this leave request"}
      />

      {/* Leave Description Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="p-6 bg-white rounded-2xl shadow-lg max-w-md w-full relative">
            {/* Popup Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {currentReq?.reason || ""}
              </h3>
              <img
                className="h-10 w-10"
                src={cross}
                alt="Close"
                onClick={() => {
                  setCurrentReq([]);
                  setIsPopupOpen(false);
                }}
              />
            </div>

            {/* Dates */}
            <div className="flex flex-row gap-3 mb-4">
              <div className="flex flex-col bg-gray-100 rounded-xl w-full border border-stone-500 border-opacity-30 p-3">
                <span className="text-xs text-stone-500">Start Date</span>
                <span className="text-sm text-slate-950">
                  {moment(currentReq.startTime).format("DD/MM/YYYY") || ""}
                </span>
              </div>
              <div className="flex flex-col bg-gray-100 rounded-xl w-full border border-stone-500 border-opacity-30 p-3">
                <span className="text-xs text-stone-500">End Date</span>
                <span className="text-sm text-slate-950">
                  {moment(currentReq.endTime).format("DD/MM/YYYY") || ""}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                className="w-full h-[150px] px-4 py-2 mt-2 bg-gray-100 rounded-xl border border-stone-500 border-opacity-30"
                placeholder="Description in 160 characters"
                maxLength={160}
                aria-label="Leave request description"
                value={currentReq?.description || ""}
                disabled={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
