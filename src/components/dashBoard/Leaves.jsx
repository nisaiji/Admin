import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import dropdown from "../../assets/images/dropdown.png";
import { useSelector } from "react-redux";

export default function Leaves() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
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

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log(formData);

    // toast.success("Data saved successfully!");
    setExpandedRow(null);
    setFormData({});
    fetchLeaves();
    // Implement save logic here
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

  return (
    <>
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
          <div className="overflow-x-auto mt-6">
            <table className="w-full shadow-sm overflow-hidden">
              <thead>
                <tr>
                  <th></th>
                  <th className="p-4 text-base font-poppins-bold text-[#0F4189]/75">
                    {t(`labels.classTeacher`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#0F4189]/75">
                    {t(`labels.reasonForLeave`)}
                  </th>
                  <th className="p-4 text-base font-poppins-bold text-[#0F4189]/75">
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
                    className={`${
                      index % 2 === 0 ? "bg-[#4645900D]" : ""
                    } border-t `}
                  >
                    <td className="px-4 py-2">
                      <img
                        src={dropdown}
                        onClick={() =>
                          setExpandedRow((prev) =>
                            prev === index ? null : index
                          )
                        }
                        alt=""
                        className={`size-4 ml-8 ${
                          expandedRow === index ? "rotate-180" : ""
                        }`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium text-center">
                        {req?.teacher?.firstname || ""}{" "}
                        {req?.teacher?.lastname || ""}
                      </p>
                      {expandedRow === index && (
                        <>
                          <p className="text-sm font-medium py-1">username</p>
                          <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            className="mb-4 p-2 border rounded w-full"
                          />
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium text-center">
                        {req?.reason || ""}
                      </p>
                      {expandedRow === index && (
                        <>
                          <p className="text-sm font-medium py-1">full name</p>
                          <input
                            type="fullname"
                            placeholder="fullname"
                            value={formData.fullname}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                fullname: e.target.value,
                              }))
                            }
                            className="mb-4 p-2 border rounded w-full"
                          />
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium text-center">
                        {req?.teacher?.class || ""}{" "}
                        {req?.teacher?.section || ""}
                      </p>
                      {expandedRow === index && (
                        <>
                          <p className="text-sm font-medium py-1">password</p>
                          <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            className="mb-4 p-2 border rounded w-full"
                          />
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium text-center">
                        {req?.pastLeaves || 0}
                      </p>
                      {expandedRow === index && (
                        <button
                          onClick={() => handleSave()}
                          className="bg[#0F4189] text-white px-4 py-2 rounded"
                        >
                          Save
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium text-center">
                        {req?.description || ""}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-center">
                      {req.status === "pending" ? (
                        // expandedRow === index ? (
                        //   <button className="text-[#4CBC9A] font-poppins-bold border-2 border-[#4CBC9A] p-1 rounded-md">
                        //     Approved
                        //   </button>
                        // ) : (
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setExpandedRow(index)}
                            className="text-[#4CBC9A] font-poppins-bold border-2 border-[#4CBC9A] p-1 rounded-md"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleRequestAction(req._id, "reject")
                            }
                            className="text-[#FE4040] font-poppins-bold border-2 border-[#FE4040] p-1 px-3 rounded-md"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        // )
                        <button
                          onClick={() => setExpandedRow(index)}
                          className="text-[#4CBC9A] font-poppins-bold border-2 border-[#4CBC9A] p-1 rounded-md"
                        >
                          {req.status}
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
    </>
  );
}
