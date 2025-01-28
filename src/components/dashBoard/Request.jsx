import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";

/**
 * `Requests` component displays a list of requests made by users.
 * Allows the admin to filter requests based on their status (approved, rejected, etc.).
 * Provides functionality to approve, reject, or modify the status of requests.
 */
export default function Requests() {
  const { t } = useTranslation();
  const currentDate = new Date();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);

  /**
   * Fetches the requests from the API.
   * It calls the API endpoint with the appropriate query parameters and updates the `requests` state.
   */
  const getRequest = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.REQUESTS}?model=teacher&reason=forgetPassword&status=accept,reject,complete,pending,notSet,expired`
      );

      if (res?.statusCode === 200) {
        setRequests(res?.result?.requests);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest();
  }, []);

  /**
   * Returns a label based on the request's status.
   * @param {string} status - The status of the request (e.g., 'accept', 'reject', etc.)
   * @returns {string} - A label based on the request's status
   */
  const requestsStatus = (status) => {
    //accept,reject,complete,pending,notSet,expired
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
    selectedTab === "all"
      ? requests
      : selectedTab === "approved"
      ? requests.filter(
          (req) => req.status === "accept" || req.status === "complete"
        )
      : selectedTab === "rejected"
      ? requests.filter((req) => req.status === "reject")
      : requests;

  return (
    <>
      {/* loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div className="bg-[#93a3b6]/25 px-6 py-4">
        <div className="bg-[#fafafa] min-h-screen rounded-[16px]">
          <Toaster position="top-center" reverseOrder={false} />
          <div>
            <div className="text-2xl font-poppins-bold pl-12 py-6">
              {t("titles.passwordReset")}
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
                      {[
                        "classTeacher",
                        "reasonToReset",
                        "class",
                        "resetBefore",
                        "action",
                        "otp",
                      ].map((label) => (
                        <th
                          key={label}
                          className="p-4 text-base font-poppins-bold text-[#0F4189]/75"
                        >
                          {t(`labels.${label}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {/* table body */}
                  <tbody className="text-sm font-normal text-black">
                    {filteredRequests.map((req, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-[#4645900D]" : ""}
                      >
                        <td className="p-4 text-sm font-medium text-center">
                          {req?.teacher?.firstname} {req?.teacher?.lastname}
                        </td>
                        <td className="p-4 text-sm font-medium text-center">
                          {reasonToChange(req?.reason)}
                        </td>
                        <td className="p-4 text-sm font-medium text-center">
                          {req?.teacher?.class}-{req?.teacher?.section}
                        </td>
                        <td className="p-4 text-sm font-medium text-center">
                          {req?.teacher?.forgetPasswordCount}
                        </td>
                        {/* action buttons */}
                        <td className="py-2 px-4 w-[200px] text-sm font-poppins-bold text-center">
                          {req.status === "pending" ? (
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() =>
                                  handleRequestAction(req?._id, "accept")
                                }
                                className="text-[#4CBC9A] font-poppins-bold border-2 border-[#4CBC9A] p-1 rounded-md"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestAction(req?._id, "reject")
                                }
                                className="text-[#FE4040] font-poppins-bold border-2 border-[#FE4040] p-1 px-3 rounded-md"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            requestsStatus(req.status)
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="h-[35px] border border-[rgba(104, 104, 104, 0.25)] bg-[#fafafa] rounded-[10px] flex items-center justify-center">
                            <div className=" w-18 text-sm font-medium text-center">
                              {req?.otp || "-"}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
