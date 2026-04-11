import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import {
  FormControl,
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

/**
 * `Requests` component displays a list of requests made by users.
 * Allows the admin to filter requests based on their status (approved, rejected, etc.).
 * Provides functionality to approve, reject, or modify the status of requests.
 */
export default function Requests() {
  const { t } = useTranslation();
  const currentDate = new Date();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // Compute the status query based on the selected tab.
  const getStatusQuery = (tab) => {
    switch (tab) {
      case "pending":
        return "pending";
      case "approved":
        return "accept,complete";
      case "rejected":
        return "reject,expired";
      default:
        return "accept,reject,pending,complete,expired,notSet";
    }
  };

  /**
   * Fetches the requests from the API.
   * It calls the API endpoint with the appropriate query parameters and updates the `requests` state.
   */
  const getRequest = async () => {
    try {
      setLoading(true);
      const statusQuery = getStatusQuery(selectedTab);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.REQUESTS}?model=teacher&page=${pageNo}&limit=${limit}&reason=forgetPassword&status=${statusQuery}`
      );
      if (res?.statusCode === 200) {
        setRequests(res?.result?.requests);
        setTotalRequestCount(res?.result?.totalRequests);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest();
  }, [limit, pageNo, selectedTab]);

  /**
   * Returns a label based on the request's status.
   * @param {string} status - The status of the request (e.g., 'accept', 'reject', etc.)
   * @returns {string} - A label based on the request's status
   */
  const requestsStatus = (status) => {
    //accept,reject,complete,pending,notSet,expired
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
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  /**
   * Converts the reason string into a label.
   * @param {string} reason - The reason for the request (e.g., 'forgetPassword', 'changeDevice', etc.)
   * @returns {string} - A reason
   */
  const reasonToChange = (reason) => {
    switch (reason) {
      case "forgetPassword":
        return "Forgot Password";
      case "changeDevice":
        return "Changed Device";
      case "technical":
        return "Technical";
      case "other":
        return "Other";
      default:
        return "";
    }
  };

  /**
   * Handle page change for pagination.
   * @param {Object} event - Event object.
   * @param {number} value - New page number.
   */
  const handlePageChange = (event, value) => setPageNo(value);

  /**
   * Handles the action (approve, reject, etc.) for a specific request.
   * Updates the request's status via the API.
   * @param {string} id - The ID of the request
   * @param {string} action - The action to perform (e.g., 'accept', 'reject')
   */
  const handleRequestAction = async (id, action) => {
    try {
      setLoading(true);
      const res = await axiosClient.put(EndPoints.ADMIN.MODIFY_REQUEST, {
        eventId: id,
        status: action,
      });
      if (res?.statusCode === 200) {
        toast.success(res.result);
        getRequest();
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters the requests based on the selected tab (e.g., "approved", "rejected", etc.).
   * @returns {Array} - The filtered list of requests
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
      <div
        className={`${
          isDarkMode ? "bg-background2" : "bg-whiteBackground2"
        } px-6 py-4`}
      >
        <div
          className={`${
            isDarkMode ? "bg-gradient-to-r from-fromColor1 to-toColor1" : "bg-whiteBackground"
          } min-h-[calc(100vh-100px)] rounded-[16px]`}
        >
          <Toaster position="top-center" reverseOrder={false} />
          <div className={`px-10 py-6`}>
            <Breadcrumbs />
            <div>
              <div
                className={`text-2xl ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } font-poppins-bold`}
              >
                {t("titles.passwordReset")}
              </div>
            </div>
            {/* tabs */}
            <div className={`flex space-x-4 mt-4`}>
              {["pending", "approved", "rejected", "all"].map((tab) => (
                <div
                  key={tab}
                  className={`cursor-pointer text-xs font-poppins font-semibold ${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } w-[75px] text-center ${
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
            <hr className={`border-[#9391A5]/25 px-10 -translate-y-[1px]`} />
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
              <div className={`overflow-x-auto relative h-[400px]`}>
                <table
                  className={`min-w-full border-separate border-spacing-0`}
                >
                  {/* table heading */}
                  <thead
                    className={`${
                      isDarkMode ? "bg-backgroundTableCell" : "bg-whiteBackground"
                    } text-textBlue text-base font-medium sticky top-0 z-10`}
                  >
                    <tr className={`text-base text-textBlue`}>
                      {[
                        "classTeacher",
                        "reasonToReset",
                        "class",
                        "dateOfRequest",
                        "resetBefore",
                        "action",
                        "otp",
                      ].map((label) => (
                        <th
                          key={label}
                          className={`text-center px-4 py-2 max-sm:hidden border border-[#2b2e4a]/25 bg-clip-padding`}
                        >
                          {t(`labels.${label}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {/* table body */}
                  <tbody>
                    {filteredRequests.map((req, i) => (
                      <tr
                        key={i}
                        className={`${
                          i % 2 === 0
                            ? isDarkMode
                              ? "bg-transparent"
                              : "bg-whiteBackground3"
                            : ""
                        } border-t`}
                      >
                        <td
                          className={`py-2 px-4 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } text-sm font-medium text-center border border-[#2b2e4a]/25`}
                        >
                          {req?.teacher?.firstname} {req?.teacher?.lastname}
                        </td>
                        <td
                          className={`py-2 px-4 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } text-sm font-medium text-center border border-[#2b2e4a]/25`}
                        >
                          {reasonToChange(req?.reason)}
                        </td>
                        <td
                          className={`py-2 px-4 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } text-sm font-medium text-center border border-[#2b2e4a]/25`}
                        >
                          {req?.teacher?.class}-{req?.teacher?.section}
                        </td>
                        <td
                          className={`py-2 px-4 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } text-sm font-medium text-center border border-[#2b2e4a]/25`}
                        >
                          {moment(req?.createdAt).format("DD/MM/YYYY")}
                        </td>
                        <td
                          className={`py-2 px-4 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } text-sm font-medium text-center border border-[#2b2e4a]/25`}
                        >
                          {req?.teacher?.forgetPasswordCount}
                        </td>
                        {/* action buttons */}
                        <td
                          className={`py-2 px-4 w-[200px] ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } text-sm font-poppins-bold text-center border border-[#2b2e4a]/25`}
                        >
                          {req.status === "pending" ? (
                            <div className={`flex justify-center gap-3`}>
                              <button
                                onClick={() =>
                                  handleRequestAction(req?._id, "accept")
                                }
                                className={`text-[#4CBC9A] font-poppins-bold border-2 border-[#4CBC9A] p-1 rounded-md`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestAction(req?._id, "reject")
                                }
                                className={`text-[#FE4040] font-poppins-bold border-2 border-[#FE4040] p-1 px-3 rounded-md`}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            requestsStatus(req.status)
                          )}
                        </td>
                        <td
                          className={`py-2 px-4 text-center border border-[#2b2e4a]/25`}
                        >
                          <div
                            className={`h-[35px] border border-bordergray ${
                              isDarkMode ? "text-textPrimary" : "text-textBlack"
                            } rounded-[10px] flex items-center justify-center`}
                          >
                            <div
                              className={` w-18 text-sm font-medium text-center`}
                            >
                              {req?.otp || "-"}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <span className={`text-textBlue`}>
                      {" "}
                      {totalRequestCount}{" "}
                    </span>
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
      </div>
    </>
  );
}
