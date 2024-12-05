import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import dropdown from "../../assets/images/dropdown.png";
import hide from "../../assets/images/hide.png";
import show from "../../assets/images/show.png";
import ConformationPopup from "../ConformationPopup";

export default function Leaves() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConformationPopup, setshowConformationPopup] = useState(false);
  const [currentReqId, setCurrentReqId] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullname: "",
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_LEAVES}?model=teacher&status=accept,reject,pending,complete&limit=1000`
      );
      if (res?.statusCode === 200) {
        setRequests(res?.result?.leaveRequests[0]?.teachers || []);
        // console.log({ requests });
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

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
      const res = await axiosClient.put(EndPoints.ADMIN.UPDATE_LEAVE, data);
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        setExpandedRow(null);
        setFormData({ username: "", password: "", fullname: "" });
        fetchLeaves();
      }
    } catch (e) {
      toast.error(e);
    }
  };

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

  const requestsStatus = (status) => {
    //accept,reject,complete,pending
    switch (status) {
      case "accept":
        return "Approved";
        break;
      case "reject":
        return "Rejected";
        break;
      case "complete":
        return "Completed";
        break;
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        break;
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-[#E9EEF2] px-6 py-[25px]">
        <div className="bg-[#fafafa] min-h-screen rounded-[16px]">
          <div className="text-2xl font-poppins-bold pl-12 py-6">
            {t("titles.leave")}
          </div>
          <div className="flex space-x-4 mt-4 pl-12">
            {["all", "approved", "rejected"].map((tab) => (
              <div
                key={tab}
                className={`cursor-pointer text-xs font-poppins font-semibold w-[75px] text-center ${selectedTab === tab
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
          <div className="overflow-x-auto mt-6">
            <table className="w-full shadow-sm overflow-hidden">
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
              <tbody>
                {filteredRequests.map((req, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-[#4645900D]" : ""
                      } border-t `}
                  >
                    <td className="px-4 py-2 align-top">
                      <img
                        src={dropdown}
                        onClick={() =>
                          req.status === "accept" &&
                          setExpandedRow((prev) =>
                            prev === index ? null : index
                          )
                        }
                        alt=""
                        className={`size-4 ml-8 ${expandedRow === index ? "rotate-180" : ""
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
                            value={formData.username}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            disabled={req?.status === "accept"}
                            className={`mt-1 p-2 border rounded w-full text-sm font-poppins font-normal focus:outline-none ${req?.status === "accept"
                                ? "bg-gray-200 cursor-not-allowed"
                                : ""
                              }`}
                          />
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <p className="text-sm font-medium">{req?.reason || ""}</p>
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
                            value={formData.fullname}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                fullname: e.target.value,
                              }))
                            }
                            disabled={req?.status === "accept"}
                            className={`mt-1 p-2 border rounded w-full text-sm font-poppins font-normal focus:outline-none ${req?.status === "accept"
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
                              value={formData.password}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              disabled={req?.status === "accept"}
                              className={`mt-1 p-2 border rounded w-full text-sm font-poppins font-normal focus:outline-none ${req?.status === "accept"
                                  ? "bg-gray-200 cursor-not-allowed"
                                  : ""
                                }`}
                            />
                            {req.status === "accept" ? (
                              <></>
                            ) : (
                              <div
                                onClick={() => setShowPassword((prev) => !prev)}
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
                          disabled={req?.status === "accept"}
                          className={`${req.status === "accept"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#0F4189] text-white"
                            } text-xs font-poppins-bold px-4 py-2 rounded-md`}
                        >
                          Save
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <p className="text-sm font-medium text-center">
                        {req?.description || ""}
                      </p>
                    </td>
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
                              setCurrentReqId(req._id);
                              setshowConformationPopup(true);
                            }}
                            className="text-[#FE4040] font-poppins-bold border-2 border-[#FE4040] p-1 px-3 rounded-md"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExpandedRow(index)}
                          className="text-white text-sm font-poppins-regular bg-[#68686880] py-1 px-3 rounded-md"
                        >
                          {requestsStatus(req?.status)}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConformationPopup
        isVisible={showConformationPopup}
        onClose={() => setshowConformationPopup(false)}
        onSubmit={() => {
          handleSave(currentReqId, "reject");
          setshowConformationPopup(false);
        }}
        message={"Please Confirm reject this leave request"}
      />
    </>
  );
}
