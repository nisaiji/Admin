import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Search from "../../assets/images/Search.png";
import info from "../../assets/images/info.png";
import edit2 from "../../assets/images/edit2.png";
import delete2 from "../../assets/images/delete2.png";
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

  // State variables
  const [teacherInfoModelOpen, setTeacherInfoModelOpen] = useState(false);
  const [currTeacher, setCurrTeacher] = useState([]);
  const [teachers, setTeachers] = useState([]);
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

  /**
   * Capitalizes the first letter of a string and converts the rest to lowercase.
   * @param {string} string - Input string to capitalize.
   * @returns {string} - Capitalized string.
   */
  const capitalizeFirstLetter = (string) => {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  /**
   * Validates the teacher's data before submission.
   * @param {object} teacher - Teacher object containing data to validate.
   * @returns {string} - Error message, if any; otherwise, an empty string.
   */
  const validateData = (teacher) => {
    if (
      !teacher.firstname.trim() ||
      teacher.firstname.length < 3 ||
      REGEX.NUMBER.test(teacher.firstname)
    ) {
      return t("validationError.enterFirstName");
    }
    if (
      !teacher.lastname.trim() ||
      teacher.lastname.length < 3 ||
      REGEX.NUMBER.test(teacher.lastname)
    ) {
      return t("validationError.enterLastName");
    }
    if (!teacher?.phone.trim()) return t("validationError.phone");
    if (!REGEX.PHONE_LENGTH.test(teacher.phone))
      return t("validationError.validationPhoneCount");
    return "";
  };

  /**
   * Registers a new teacher by sending their data to the API.
   */
  const registerTeacher = async () => {
    try {
      const e = validateData(newTeacher);
      if (e) {
        toast.error(e);
        return;
      }
      setLoading(true);

      const response = await axiosClient.post(
        EndPoints.ADMIN.REGISTER_TEACHER,
        {
          firstname: capitalizeFirstLetter(newTeacher?.firstname.trim()),
          lastname: capitalizeFirstLetter(newTeacher?.lastname.trim()),
          phone: newTeacher.phone.trim(),
        }
      );

      if ([200, 201].includes(response?.statusCode)) {
        toast.success(response.result);
        getTeacher(); // Refresh the teacher list
        setNewTeacher({ SNo: null, firstname: "", lastname: "", phone: "" });
        newTeacherFirstNameRef.current?.focus(); // Focus on the first name input
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the list of teachers from the server.
   */
  const getTeacher = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(EndPoints.ADMIN.TEACHER_LIST);
      if (response?.statusCode === 200) {
        const teachersWithSNos = response?.result?.map((teacher, index) => ({
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

  // Load teacher data when component mounts
  useEffect(() => {
    getTeacher();
  }, []);

  /**
   * Opens the teacher information modal with selected teacher data.
   * @param {object} teacher - Selected teacher object.
   */
  const handleShowInfo = (teacher) => {
    setCurrTeacher(teacher);
    setTeacherInfoModelOpen(true);
  };

  /**
   * Handles changes in the input fields for both new and existing teachers.
   * @param {number|null} SNo - Serial number of the teacher or null for new teacher.
   * @param {string} field - Field name being updated.
   * @param {string} value - New value for the field.
   */
  const handleInputChange = (SNo, field, value) => {
    if (SNo === null) {
      setNewTeacher({ ...newTeacher, [field]: value });
    } else {
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.SNo === SNo ? { ...teacher, [field]: value } : teacher
        )
      );
    }
  };

  /**
   * Deletes the currently selected teacher.
   */
  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_TEACHER}/${currTeacher._id}`
      );

      if (response?.statusCode === 200) {
        getTeacher();
        // console.log(response);

        toast.success(response.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  /**
   * Handles the search input field's value change.
   * @param {object} e - Event object containing the new search query.
   */
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filters the teachers list based on search input
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher?.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher?.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher?.phone.includes(searchQuery)
  );

  return (
    <>
      {/* Loading spinner */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div className=" bg-[#93a3b6]/25 px-6 py-4 ">
        <div
          className={`${
            isDarkMode ? "bg-[#0D192F] text-white" : "bg-[#fafafa]"
          } p-4 min-h-screen rounded-[16px]`}
        >
          {/* Toast notifications */}
          <Toaster position="top-center" reverseOrder={false} />
          <div className="px-5">
            <div className="text-2xl font-semibold py-3">
              {t("titles.teacherSetup")}
            </div>
            {/* Search bar */}
            <div className="p-0 pt-2">
              <div className="flex justify-between w-full relative z-10">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                    <img src={Search} alt="" className="size-5" />
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
                        : "bg-[#E9EEF2]/50 text-[#686868]"
                    } placeholder-[rgba(196, 196, 196, 0.40)] px-14 py-2 rounded-xl focus:outline-[#05022B]/10 border border-[#05022B]/10 w-full ${
                      searchQuery
                        ? "border-[#0f4189]/25 text-[#2b2e4a] "
                        : "border-[#05022B]/10 "
                    }`}
                    onFocus={() => searchInputRef.current.focus()}
                  />
                </div>
              </div>
            </div>

            {/* Teacher list table */}
            <div className="overflow-x-auto relative mt-6 h-[400px]">
              <table
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } min-w-full border-separate border-spacing-0`}
              >
                <thead
                  className={`${
                    isDarkMode
                      ? "bg-[#2b2e4a] text-white"
                      : "bg-[#fafafa] text-[#0F4189]/75"
                  } text-base font-medium sticky top-0 z-10`}
                >
                  {/* Table headings */}
                  <tr>
                    <th className="px-4 py-2 border border-[#2b2e4a]/25 bg-clip-padding">
                      {t("labels.sNo")}
                    </th>
                    <th className="px-4 py-2 border border-[#2b2e4a]/25 bg-clip-padding">
                      {t("labels.firstName")}
                    </th>
                    <th className="px-4 py-2 border border-[#2b2e4a]/25 bg-clip-padding">
                      {t("labels.lastName")}
                    </th>
                    <th className="px-4 py-2 border border-[#2b2e4a]/25 bg-clip-padding">
                      {t("labels.phoneNumber")}
                    </th>
                    <th className="px-4 py-2 border border-[#2b2e4a]/25 bg-clip-padding">
                      {t("labels.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-normal text-[#2b2e4a]">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.SNo}>
                      {/* SNo */}
                      <td
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } px-4 py-2 font-medium text-center border text-sm border-[#2b2e4a]/25 text-[#040320] `}
                      >
                        {teacher.SNo}
                      </td>
                      {/* First Name */}
                      <td className="px-4 py-2 border text-sm border-[#2b2e4a]/25 ">
                        <input
                          data-testid="savedFirstname"
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
                          className={`w-full h-full px-2 py-1 font-medium text-center border-none focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-[#040320]"
                          }focus:border-[#0F4189]`}
                          disabled={editSNo !== teacher.SNo}
                          autoFocus={editSNo === newTeacher.SNo}
                        />
                      </td>
                      {/* Last Name */}
                      <td className="px-4 py-2 text-sm  border border-[#2b2e4a]/25">
                        <input
                          data-testid="savedLastname"
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
                          className={`w-full h-full px-2 py-1 font-medium text-center border-none focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-[#040320]"
                          }`}
                          disabled={editSNo !== teacher.SNo}
                        />
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-2 text-sm border border-[#2b2e4a]/25">
                        <input
                          data-testid="savedPhone"
                          type="text"
                          value={teacher.phone}
                          maxLength={10}
                          onChange={(e) =>
                            handleInputChange(
                              teacher.SNo,
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder={t("placeholders.phoneNumber")}
                          className={`w-full h-full px-2 py-1 font-medium text-center border-none focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text[#040320]"
                          }`}
                          disabled={editSNo !== teacher.SNo}
                        />
                      </td>
                      {/* Actions */}
                      <td className="pl-3 pr-5 py-2 text-sm font-poppins-bold border border-[#2b2e4a]/25">
                        <div className="flex justify-evenly">
                          <button
                            onClick={() =>
                              navigate("/teacher-update", {
                                state: teacher,
                              })
                            }
                          >
                            <img src={edit2} alt="" className="size-5" />
                          </button>
                          <button onClick={() => handleShowInfo(teacher)}>
                            <img src={info} alt="" className="size-5" />
                          </button>
                          <button
                            onClick={() => {
                              setCurrTeacher(teacher);
                              setShowDeleteConfirmation(true);
                            }}
                          >
                            <img src={delete2} alt="deleteTeacher" className="size-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    {/* SNo */}
                    <td
                      className={`${
                        isDarkMode ? "text-white" : ""
                      } px-4 py-2 text-center text-[#040320] font-medium border border-[#2b2e4a]/25`}
                    >
                      {teachers.length + 1}
                    </td>
                    {/* First Name */}
                    <td className="py-1 px-3 border border-[#2b2e4a]/25">
                      <input
                        data-testid="firstnameInput"
                        type="text"
                        value={newTeacher.firstname}
                        onChange={(e) =>
                          handleInputChange(null, "firstname", e.target.value)
                        }
                        placeholder={t("placeholders.firstName")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-offset-[12px] focus:outline-[#0F4189]/75 ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-[#040320]"
                        } font-poppins font-medium text-center`}
                        ref={newTeacherFirstNameRef}
                        disabled={editSNo !== null}
                      />
                    </td>
                    {/* Last Name */}
                    <td className="py-1 px-3 border border-[#2b2e4a]/25">
                      <input
                        data-testid="lastnameInput"
                        type="text"
                        value={newTeacher.lastname}
                        onChange={(e) =>
                          handleInputChange(null, "lastname", e.target.value)
                        }
                        placeholder={t("placeholders.lastName")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-offset-[12px] focus:outline-[#0F4189]/75 ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-[#040320]"
                        } font-poppins font-medium text-center`}
                        disabled={editSNo !== null}
                      />
                    </td>
                    {/* Phone */}
                    <td className="py-1 px-3 border border-[#2b2e4a]/25">
                      <input
                        data-testid="phoneInput"
                        type="text"
                        value={newTeacher.phone}
                        maxLength={10}
                        onChange={(e) =>
                          handleInputChange(null, "phone", e.target.value)
                        }
                        placeholder={t("placeholders.phoneNumber")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-offset-[12px] focus:outline-[#0F4189]/75 ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-[#040320]"
                        } font-poppins font-medium text-center`}
                        disabled={editSNo !== null}
                      />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-2 border border-[#2b2e4a]/25">
                      <button
                        className="bg-[#0F4189] text-white font-poppins-regular text-[16] py-1.5 px-3 rounded-xl w-full h-full focus:outline-2 focus:outline-[#0F4189]"
                        onClick={registerTeacher}
                        disabled={editSNo !== null}
                        data-testid="addTeacher"
                      >
                        {t("buttons.addTeacher")}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher info modal */}
      {teacherInfoModelOpen && (
        <TeacherInfo
          modelOpen={setTeacherInfoModelOpen}
          currTeacher={currTeacher}
        />
      )}

      {/* Delete confirmation modal */}
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
