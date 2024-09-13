import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Search from "../../assets/images/Search.png";
import info from "../../assets/images/info.png";
import edit2 from "../../assets/images/edit2.png";
import delete2 from "../../assets/images/delete2.png";
import ellipse from "../../assets/images/ellipse.png";
import TeacherInfo from "./TeacherInfo";
import { useNavigate } from "react-router-dom";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import { useTranslation } from "react-i18next";
import REGEX from "../../utils/regix";

export default function Teacher() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  const newTeacherFirstNameRef = useRef(null);
  const [teacherInfoModelOpen, setTeacherInfoModelOpen] = useState(false);
  const [currTeacher, setCurrTeacher] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [validationError, setValidationError] = useState("");
  const [editSNo, setEditSNo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    SNo: null,
    firstname: "",
    lastname: "",
    phone: "",
  });

  const capitalizeFirstLetter = (string) => {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const validateData = (teacher) => {
    if (!teacher.firstname.trim()) return t("validationError.firstName");
    if (teacher.firstname.length < 3)
      return t("validationError.validationFirstNameLength");
    if (REGEX.NUMBER.test(teacher.firstname))
      return t("validationError.validationFirstNameNoNumbers");
    if (!teacher.lastname.trim())
      return t("validationError.lastName");
    if (teacher.lastname.length < 3)
      return t("validationError.validationLastNameLength");
    if (REGEX.NUMBER.test(teacher.lastname))
      return t("validationError.validationLastNameNoNumbers");
    if (!teacher.phone.trim()) return t("validationError.phone");
    if (!REGEX.PHONE_LENGTH.test(teacher.phone))
      return t("validationError.validationPhoneCount");
    return "";
  };

  const registerTeacher = async () => {
    try {
      const error = validateData(newTeacher);
      if (error) {
        setValidationError(error);
        return;
      }
      setValidationError("");
      setLoading(true);
      const response = await axiosClient.post(
        EndPoints.ADMIN.REGISTER_TEACHER,
        {
          firstname: capitalizeFirstLetter(newTeacher.firstname.trim()),
          lastname: capitalizeFirstLetter(newTeacher.lastname.trim()),
          phone: newTeacher.phone.trim(),
        }
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(t("messages.teacher.registerSuccess"));
        getTeacher();
        setNewTeacher({
          SNo: null,
          firstname: "",
          lastname: "",
          phone: "",
        });
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTeacher = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(EndPoints.ADMIN.TEACHER_LIST);
      if (response?.statusCode === 200) {
        const fetchedTeachers = response.result;
        const teachersWithSNos = fetchedTeachers.map((teacher, index) => ({
          ...teacher,
          SNo: index + 1,
        }));
        setTeachers(teachersWithSNos);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeacher();
  }, []);

  const handleShowInfo = (teacher) => {
    setCurrTeacher(teacher);
    setTeacherInfoModelOpen(true);
  };

  const handleInputChange = (SNo, field, value) => {
    if (SNo === null) {
      setNewTeacher({ ...newTeacher, [field]: value });
    } else {
      const newTeachers = teachers.map((teacher) =>
        teacher.SNo === SNo ? { ...teacher, [field]: value } : teacher
      );
      setTeachers(newTeachers);
    }
  };

  const updateTeacher = async (teacher) => {
    const e = validateData(teacher);
    if (e) {
      toast.error(e);
      return;
    }
    try {
      setLoading(true);
      const transformedTeacher = {
        firstname: capitalizeFirstLetter(teacher.firstname.trim()),
        lastname: capitalizeFirstLetter(teacher.lastname.trim()),
        phone: teacher.phone.trim(),
      };
      const response = await axiosClient.put(
        `${EndPoints.ADMIN.UPDATE_TEACHER}/${teacher._id}`,
        transformedTeacher
      );
      if (response?.statusCode === 200) {
        getTeacher();
        toast.success(t("message.teacher.updateSuccess"));
        setEditSNo(null);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const teacherId = currTeacher._id;
      setLoading(true);
      const response = await axiosClient.delete(
        `/${EndPoints.ADMIN.DELETE_TEACHER}/${teacherId}`
      );
      if (response?.statusCode === 200) {
        getTeacher();
        toast.success(t("message.teacher.deleteSuccess"));
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.phone.includes(searchQuery)
  );

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div className="bg-[#f3f3ff] px-6 py-10 ">
        <div
          className={`${
            isDarkMode ? "bg-[#0D192F] text-white" : "bg-white "
          } p-4 min-h-screen`}
        >
          <Toaster position="top-center" reverseOrder={false} />
          <div className="px-4">
            <div className="text-4xl font-semibold px-5 py-3">
              {t("titles.teacherSetup")}
            </div>
            <div className="p-3">
              <div className="flex justify-between w-full relative z-10">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img src={Search} alt="" className="size-6" />
                  </div>
                  <input
                    type="text"
                    placeholder={t("placeholders.search")}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    ref={searchInputRef}
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-black"
                    } px-10 py-2 rounded-lg focus:outline-none shadow-sm border border-t-gray w-full`}
                    onFocus={() => searchInputRef.current.focus()}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto mt-6">
              <table
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } min-w-full shadow-md overflow-hidden`}
              >
                <thead
                  className={`${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-[#e3e3ee] text-[#6d6ca7]"
                  } text-base font-medium`}
                >
                  <tr>
                    <th className="px-4 py-2 border border-gray-400">
                      {t("labels.sNo")}
                    </th>
                    <th className="px-4 py-2 border border-gray-400 ">
                      {t("labels.firstName")}
                    </th>
                    <th className="px-4 py-2 border border-gray-400">
                      {t("labels.lastName")}
                    </th>
                    <th className="px-4 py-2 border border-gray-400">
                      {t("labels.phoneNumber")}
                    </th>
                    <th className="px-4 py-2 border border-gray-400">
                      {t("labels.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-normal text-gray-900">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.SNo}>
                      <td
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } px-4 py-2 font-bold text-center border text-sm border-[#c1c0ca] text-[#6d6ca7]`}
                      >
                        {teacher.SNo}
                      </td>
                      <td className="px-4 py-2 border text-sm border-[#c1c0ca]">
                        <input
                          type="text"
                          value={teacher.firstname}
                          onChange={(e) =>
                            handleInputChange(
                              teacher.SNo,
                              "firstname",
                              e.target.value
                            )
                          }
                          placeholder={t("placeholders.firstName")}
                          className={`w-full h-full px-2 py-1 font-poppins-bold text-center border-none focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-[#1e1e1e]"
                          }`}
                          disabled={editSNo !== teacher.SNo}
                          autoFocus={editSNo === newTeacher.SNo}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm  border border-[#c1c0ca]">
                        <input
                          type="text"
                          value={teacher.lastname}
                          onChange={(e) =>
                            handleInputChange(
                              teacher.SNo,
                              "lastname",
                              e.target.value
                            )
                          }
                          placeholder={t("placeholders.lastName")}
                          className={`w-full h-full px-2 py-1 font-poppins-bold text-center border-none focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-900"
                          }`}
                          disabled={editSNo !== teacher.SNo}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm border border-[#c1c0ca]">
                        <input
                          type="text"
                          value={teacher.phone}
                          onChange={(e) =>
                            handleInputChange(
                              teacher.SNo,
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder={t("placeholders.phoneNumber")}
                          className={`w-full h-full px-2 py-1 font-poppins-bold text-center border-none focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-900"
                          }`}
                          disabled={editSNo !== teacher.SNo}
                        />
                      </td>
                      <td className="pl-3 pr-5 py-2 text-sm font-poppins-bold border border-[#c1c0ca]">
                        {editSNo === teacher.SNo ? (
                          <button
                            className="bg-[#464590] text-white font-poppins-regular py-1.5 px-3 rounded-xl w-full h-full"
                            onClick={() => updateTeacher(teacher)}
                          >
                            {t("buttons.save")}
                          </button>
                        ) : (
                          <div className="flex justify-around">
                            <button
                              onClick={() =>
                                navigate("/teacher-update", {
                                  state: teacher,
                                })
                              }
                            >
                              <img
                                src={ellipse}
                                alt=""
                                className="size-6 absolute"
                              />
                              <img
                                src={edit2}
                                alt=""
                                className="size-4 relative top-1 left-1"
                              />
                            </button>
                            <button onClick={() => handleShowInfo(teacher)}>
                              <img
                                src={ellipse}
                                alt=""
                                className="size-6 absolute "
                              />
                              <img
                                src={info}
                                alt=""
                                className="size-4 relative top-1 left-1"
                              />
                            </button>
                            <button
                              onClick={() => {
                                setCurrTeacher(teacher);
                                setShowDeleteConfirmation(true);
                              }}
                            >
                              <img
                                src={ellipse}
                                alt=""
                                className="size-6 absolute "
                              />
                              <img
                                src={delete2}
                                alt=""
                                className="size-4 relative top-1 left-1"
                              />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      className={`${
                        isDarkMode ? "text-white" : ""
                      } px-4 py-2 text-center text-[#6d6ca7] font-bold border border-[#c1c0ca]`}
                    >
                      {teachers.length + 1}
                    </td>
                    <td className="px-4 py-2 border border-[#c1c0ca]">
                      <input
                        type="text"
                        value={newTeacher.firstname}
                        onChange={(e) =>
                          handleInputChange(null, "firstname", e.target.value)
                        }
                        placeholder={t("placeholders.firstName")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        } font-poppins-bold text-center`}
                        ref={newTeacherFirstNameRef}
                        disabled={editSNo !== null}
                      />
                    </td>
                    <td className="px-4 py-2 border border-[#c1c0ca]">
                      <input
                        type="text"
                        value={newTeacher.lastname}
                        onChange={(e) =>
                          handleInputChange(null, "lastname", e.target.value)
                        }
                        placeholder={t("placeholders.lastName")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        } font-poppins-bold text-center`}
                        disabled={editSNo !== null}
                      />
                    </td>
                    <td className="px-4 py-2 border border-[#c1c0ca]">
                      <input
                        type="text"
                        value={newTeacher.phone}
                        onChange={(e) =>
                          handleInputChange(null, "phone", e.target.value)
                        }
                        placeholder={t("placeholders.phoneNumber")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        } font-poppins-bold text-center`}
                        disabled={editSNo !== null}
                      />
                    </td>
                    <td className="px-4 py-2 border border-[#c1c0ca]">
                      <button
                        className="bg-[#464590] text-white font-poppins-regular text-[16] py-1.5 px-3 rounded-xl w-full h-full"
                        onClick={registerTeacher}
                        disabled={editSNo !== null}
                      >
                        {t("buttons.addTeacher")}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {validationError !== "" && (
              <div className="text-red-500 text-center mt-2">
                {validationError}
              </div>
            )}
          </div>
        </div>
      </div>
      {teacherInfoModelOpen && (
        <TeacherInfo
          modelOpen={setTeacherInfoModelOpen}
          currTeacher={currTeacher}
        />
      )}
      {showDeleteConfirmation && (
        <DeletePopup
          isVisible={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
