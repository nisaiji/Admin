import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import complete from "../../assets/images/complete.png";
import cross from "../../assets/images/cross.png";
import { useSelector } from "react-redux";

export default function Leaves() {
  const { t } = useTranslation();
  const id = useSelector((state) => state.appAuth.id);
  const currentDate = new Date();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [formData, setFormData] = useState({
    class: "",
    section: "",
    username: "",
    password: "",
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`${EndPoints.ADMIN.GET_LEAVES}`);
      if (res?.statusCode === 200) {
        setRequests(res?.result?.leaveRequests[0]?.teachers);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const tableHeaders = [
    {
      key: "teacher",
      label: "classTeacher",
      format: (teacher) => `${teacher?.firstname} ${teacher?.lastname}`,
    },
    {
      key: "reason",
      label: "reasonForLeave",
      format: (title) => reasonToChange(title),
    },
    {
      key: "class",
      label: "class",
      format: (teacher) => `${teacher?.class || ""}-${teacher?.section || ""}`,
    },
    {
      key: "pastLeaves",
      label: "pastLeaves",
      format: (teacher) => teacher?.forgetPasswordCount || 0,
    },
    {
      key: "description",
      label: "description",
      format: (req) => req.description,
    },
    { key: "action", label: "action", format: (req) => renderActions(req) },
    {
      key: "username",
      label: "username",
      format: (teacher) => teacher?.username || "-",
    },
    {
      key: "fullName",
      label: "fullName",
      format: (teacher) =>
        `${teacher?.firstname || ""} ${teacher?.lastname || "-"}`,
    },
  ];

  const reasonToChange = (reason) => {
    switch (reason) {
      case "forgotPassword":
        return "Forgot Password";
      case "sickLeave":
        return "Sick Leave";
      case "other":
        return "Other";
      default:
        return "";
    }
  };

  const handleApprove = (req) => {
    setModalOpen(true);
    setCurrentRequest(req);
  };

  const handleRequestAction = async (id, action) => {
    try {
      setLoading(true);
      const res = await axiosClient.put(EndPoints.ADMIN.MODIFY_REQUEST, {
        eventId: id,
        status: action,
      });
      if (res?.statusCode === 200) {
        toast.success(res.result);
        setRequests((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status: action } : req))
        );
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderActions = (req) => {
    return req.status === "pending" ? (
      <div className="flex justify-center gap-3">
        <button
          onClick={() => handleApprove(req)}
          className="text-[#4CBC9A] font-poppins-bold border-2 border-[#4CBC9A] p-1 rounded-md"
        >
          Approve
        </button>
        <button
          onClick={() => handleRequestAction(req._id, "reject")}
          className="text-[#DD1B10] font-poppins-bold border-2 border-[#DD1B10] p-1 px-3 rounded-md"
        >
          Reject
        </button>
      </div>
    ) : (
      requestsStatus(req.status)
    );
  };

  const requestsStatus = (status) => {
    switch (status) {
      case "accept":
        return "Approved";
      case "reject":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const handleFormSubmit = () => {
    const {
      class: classField,
      section,
      assignTeacher,
      username,
      password,
    } = formData;

    if (!classField || !section || !assignTeacher) {
      toast.error("Please fill Class, Section, and Assign Teacher fields.");
      return;
    }

    if (!username || !password) {
      toast.error("Please fill Username and Password fields.");
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req._id === currentRequest._id
          ? {
              ...req,
              teacher: { ...req.teacher, ...formData },
              status: "accept",
            }
          : req
      )
    );
    toast.success("Request Approved and Teacher Assigned!");
    setModalOpen(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-[#F4F5F6] px-6 py-[25px]">
        <div className="bg-white min-h-screen rounded-[16px]">
          <div className="text-4xl font-poppins-bold pl-12 py-6">
            {t("titles.leave")}
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full shadow-sm overflow-hidden">
              <thead>
                <tr>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.classTeacher`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.reasonForLeave`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.class`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.pastLeaves`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.description`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.action`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.username`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#686868]/75">
                    {t(`labels.fullName`)}
                  </th>
                </tr>
              </thead>
              {/* // Render table body */}
              <tbody>
                {requests.map((req, index) => (
                  <tr key={index}>
                    <td className="p-4 text-sm font-medium text-center">
                      {req.teacher.firstname || ""} {req.teacher.lastname || ""}
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      reason
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      {req.teacher.class || ""} {req.teacher.section || ""}
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      past leaves count
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      {req.description || ""}
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      {renderActions()}
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      username
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      full name
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white py-6 px-20 w-[650px] rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <img src={complete} alt="Close" className="size-8" />
              <p className="text-xl font-poppins-bold">
                Assign Substitute Details
              </p>
              <img
                src={cross}
                onClick={() => setModalOpen(false)}
                alt="Close"
                className="size-10 cursor-pointer"
              />
            </div>
            <hr className="mb-5" />
            <div className="flex justify-between gap-4">
              <div className="w-1/2">
                <label
                  htmlFor="class"
                  className="block text-sm font-medium mb-1"
                >
                  Class
                </label>
                <input
                  id="class"
                  type="text"
                  placeholder="Class"
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                  className="border p-2 rounded mb-2 w-full"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="section"
                  className="block text-sm font-medium mb-1"
                >
                  Section
                </label>
                <input
                  id="section"
                  type="text"
                  placeholder="Section"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  className="border p-2 rounded mb-2 w-full"
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="assign-teacher"
                className="block text-sm font-medium mb-1"
              >
                Assign Teacher
              </label>
              <input
                id="assign-teacher"
                type="text"
                placeholder="Assign Teacher"
                value={formData.assignTeacher}
                onChange={(e) =>
                  setFormData({ ...formData, assignTeacher: e.target.value })
                }
                className="border p-2 rounded mb-2 w-full"
              />
            </div>
            {/* Conditionally render Username and Password fields */}
            {formData.class && formData.section && formData.assignTeacher && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="border p-2 rounded mb-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="border p-2 rounded mb-2 w-full"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleFormSubmit}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
