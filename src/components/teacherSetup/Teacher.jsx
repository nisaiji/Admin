import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Searchw from "../../assets/images/Search.png";
import crossw from "../../assets/images/cross.png";
import infow from "../../assets/images/info.png";
import editw from "../../assets/images/edit2.png";
import delete2w from "../../assets/images/delete2.png";
import Search from "../../assets/images/darkmode/Search.png";
import cross from "../../assets/images/darkmode/cross.png";
import info from "../../assets/images/darkmode/info.png";
import edit from "../../assets/images/darkmode/edit.png";
import delete2 from "../../assets/images/darkmode/delete.png";
import importIcon from "../../assets/images/importIcon.png";
import downloadIcon from "../../assets/images/downloadIcon.png";
import TeacherInfo from "./TeacherInfo";
import { useNavigate } from "react-router-dom";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import { useTranslation } from "react-i18next";
import REGEX from "../../utils/regix";
import Breadcrumbs from "../BreadCrumbs";
import CONSTANT from "../../utils/constants";

export default function Teacher() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  const newTeacherFirstNameRef = useRef(null);
  const fileInputRef = useRef(null);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  // State variables
  const [teacherInfoModelOpen, setTeacherInfoModelOpen] = useState(false);
  const [currTeacher, setCurrTeacher] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editSNo, setEditSNo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    SNo: null,
    firstName: "",
    lastName: "",
    phone: "",
  });
  // console.log(teachers);

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
      !teacher.firstName.trim() ||
      teacher.firstName.length < 3 ||
      REGEX.NUMBER.test(teacher.firstName)
    ) {
      return t("validationError.enterFirstName");
    }
    if (
      !teacher.lastName.trim() ||
      teacher.lastName.length < 3 ||
      REGEX.NUMBER.test(teacher.lastName)
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
        if (!toastDisplayed) {
          setToastDisplayed(true);
          toast.error(e);
          setTimeout(() => setToastDisplayed(false), 3000);
        }
        return;
      }
      setLoading(true);

      const response = await axiosClient.post(
        EndPoints.ADMIN.REGISTER_TEACHER,
        {
          firstName: capitalizeFirstLetter(newTeacher?.firstName.trim()),
          lastName: capitalizeFirstLetter(newTeacher?.lastName.trim()),
          phone: newTeacher.phone.trim(),
        },
      );

      if ([200, 201].includes(response?.statusCode)) {
        toast.success(response.result);
        getTeacher(); // Refresh the teacher list
        setNewTeacher({ SNo: null, firstName: "", lastName: "", phone: "" });
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
      const response = await axiosClient.post(EndPoints.ADMIN.TEACHER_LIST, {
        sessionId: classAndSectionData?.selectedSession?._id,
      });
      if (response?.statusCode === 200) {
        const teachersWithSNos = response?.result
          ?.map((teacher, index, array) => ({
            ...teacher,
            SNo: array.length - index, // Assigning SNo in reverse order
          }))
          .reverse(); // Reverse the array order
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
    // Allow only single spaces between words
    const formattedValue = value.replace(/[^a-zA-Z0-9]/g, "").trimStart();
    if (SNo === null) {
      setNewTeacher({ ...newTeacher, [field]: formattedValue });
    } else {
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.SNo === SNo
            ? { ...teacher, [field]: formattedValue }
            : teacher,
        ),
      );
    }
  };

  // download the excel sheet in pdf format
  const getDemoExcelSheet = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(
        EndPoints.ADMIN.GET_TEACHER_DEMO_EXCEL,
        {
          responseType: "blob", // Required for binary file download
        },
      );

      // Create a Blob from the response data
      const url = window.URL.createObjectURL(new Blob([response]));
      // console.log({ url });
      const link = document.createElement("a");
      link.href = url;

      // Set the filename for download
      link.setAttribute("download", "teacher-template.xlsx");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  // Uploads an Excel sheet containing teacher data
  const uploadExcelSheet = async (file) => {
    try {
      if (!file) {
        toast.error("Please select a valid Excel file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      setLoading(true);
      const res = await axiosClient.post(
        EndPoints.ADMIN.UPLOAD_TEACHER_EXCEL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res?.statusCode === 201 || res?.statusCode === 200) {
        if (res?.result?.errors.length > 0) {
          toast.error(res?.result?.errors[0]);
        } else {
          toast.success(res?.result?.message);
        }
        getTeacher();
      }
    } catch (e) {
      const err = JSON.parse(e);
      toast.error(`error in student ${err?.student} of ${err?.reason}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadExcelSheet(file); // Call upload API when file is selected
    }
    e.target.value = "";
  };

  /**
   * Deletes the currently selected teacher.
   */
  const handleDelete = async () => {
    if (toastDisplayed) return;
    setToastDisplayed(true);
    setTimeout(() => setToastDisplayed(false), 3000);
    try {
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_TEACHER}/${currTeacher._id ?? currTeacher?.id}`,
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
      teacher?.firstName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      teacher?.lastName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      teacher?.phone?.includes(searchQuery),
  );

  return (
    <>
      {/* Loading spinner */}
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
        } px-6 min-h-[calc(100vh-72px)] py-4 `}
      >
        <div
          className={`${
            isDarkMode
              ? "bg-gradient-to-r from-fromColor1 to-toColor1"
              : "bg-whiteBackground"
          } p-4 rounded-[16px]`}
        >
          {/* Toast notifications */}
          <Toaster position="top-center" reverseOrder={false} />
          <div className={`px-5`}>
            <Breadcrumbs />
            <div
              className={`text-2xl ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } font-semibold py-1`}
            >
              {t("titles.teacherSetup")}
            </div>
            {/* Search bar */}
            <div className={`p-0 pt-2`}>
              <div className={`flex justify-between w-full relative space-x-2`}>
                <div className={`flex justify-between w-full relative z-10`}>
                  <div className={`relative w-full`}>
                    <div
                      className={`absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none`}
                    >
                      <img
                        src={isDarkMode ? Search : Searchw}
                        alt=""
                        className={`size-5`}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={t("placeholders.search")}
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      ref={searchInputRef}
                      className={`bg-transparent ${
                        isDarkMode
                          ? "text-textPrimary border-borderLine"
                          : "text-textBlack border-borderGray2"
                      } border
                    px-14 py-2 rounded-xl focus:outline-[#05022B]/10 w-full`}
                      onFocus={() => searchInputRef.current.focus()}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className={`absolute inset-y-0 right-0 flex items-center pr-2`}
                      >
                        <img
                          src={isDarkMode ? cross : crossw}
                          alt=""
                          className={`${isDarkMode ? "size-4 mr-2" : "size-8"}`}
                        />
                      </button>
                    )}
                  </div>
                </div>
                {/* Hidden file input */}
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {/* download and import button */}
                <div className={`flex flex-row`}>
                  <button
                    type="button"
                    onClick={() => fileInputRef?.current?.click()}
                    title="Upload Teachers Excel Sheet"
                    className={`bg-backgroundBlue rounded-l-lg h-[40px] py-1.5 px-4 flex flex-row justify-center items-center`}
                  >
                    <img src={importIcon} alt="" className={`size-3 mr-2`} />
                    <div className={`text-textPrimary text-sm font-medium`}>
                      Import
                    </div>
                  </button>
                  <button
                    type="button"
                    title="Sample File Download"
                    onClick={getDemoExcelSheet}
                    className={`bg-white w-[55px] h-[40px] flex justify-center items-center border border-borderBlue rounded-r-lg`}
                  >
                    <img src={downloadIcon} alt="" className={`w-4 h-4`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Teacher list table */}
            <div
              className={`overflow-x-auto relative mt-6 min-h-[300px] max-h-[400px]`}
            >
              <table
                className={`${
                  isDarkMode ? "bg-transparent" : "bg-whiteBackground"
                } min-w-full border-separate border-spacing-0`}
              >
                <thead
                  className={`${
                    isDarkMode ? "bg-backgroundTableCell" : "bg-whiteBackground"
                  } text-textBlue text-base font-medium sticky top-0 z-10`}
                >
                  {/* Table headings */}
                  <tr>
                    <th
                      className={`px-4 py-2 border border-borderLine2 bg-clip-padding`}
                    >
                      {t("labels.sNo")}
                    </th>
                    <th
                      className={`px-4 py-2 border border-borderLine2 bg-clip-padding`}
                    >
                      {t("labels.firstName")}
                    </th>
                    <th
                      className={`px-4 py-2 border border-borderLine2 bg-clip-padding`}
                    >
                      {t("labels.lastName")}
                    </th>
                    <th
                      className={`px-4 py-2 border border-borderLine2 bg-clip-padding`}
                    >
                      {t("labels.phoneNumber")}
                    </th>
                    <th
                      className={`px-4 py-2 border border-borderLine2 bg-clip-padding`}
                    >
                      {t("labels.class")}
                    </th>
                    <th
                      className={`px-4 py-2 border border-borderLine2 bg-clip-padding`}
                    >
                      {t("labels.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className={`text-sm font-normal`}>
                  <tr>
                    {/* SNo */}
                    <td
                      className={`px-4 py-2 text-center ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      } font-medium border border-borderLine2`}
                    >
                      -
                    </td>
                    {/* First Name */}
                    <td className={`py-1 px-3 border border-borderLine2`}>
                      <input
                        data-testid="firstnameInput"
                        type="text"
                        value={newTeacher.firstName}
                        onChange={(e) =>
                          handleInputChange(null, "firstName", e.target.value)
                        }
                        maxLength={15}
                        placeholder={t("placeholders.firstName")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-0 bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[12px] focus:outline-borderBlue`}
                        ref={newTeacherFirstNameRef}
                        disabled={editSNo !== null}
                      />
                    </td>
                    {/* Last Name */}
                    <td className={`py-1 px-3 border border-borderLine2`}>
                      <input
                        data-testid="lastnameInput"
                        type="text"
                        value={newTeacher.lastName}
                        onChange={(e) =>
                          handleInputChange(null, "lastName", e.target.value)
                        }
                        maxLength={15}
                        placeholder={t("placeholders.lastName")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-0 bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[12px] focus:outline-borderBlue`}
                        disabled={editSNo !== null}
                      />
                    </td>
                    {/* Phone */}
                    <td className={`py-1 px-3 border border-borderLine2`}>
                      <input
                        data-testid="phoneInput"
                        type="text"
                        value={newTeacher.phone}
                        maxLength={10}
                        onChange={(e) =>
                          handleInputChange(null, "phone", e.target.value)
                        }
                        placeholder={t("placeholders.phoneNumber")}
                        className={`w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-0 bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[12px] focus:outline-borderBlue`}
                        disabled={editSNo !== null}
                      />
                    </td>
                    {/* class */}
                    <td
                      className={`py-1 px-3 text-center ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      } border border-borderLine2`}
                    >
                      {CONSTANT.NA}
                    </td>
                    {/* Actions */}
                    <td className={`px-4 py-2 border border-borderLine2`}>
                      <button
                        className={`bg-backgroundBlue text-textPrimary font-poppins-regular text-[16] py-1.5 px-3 rounded-xl w-full h-full transition-all duration-200 ease-in-out active:scale-90`}
                        onClick={registerTeacher}
                        disabled={editSNo !== null || loading}
                        data-testid="addTeacher"
                      >
                        {loading ? "Adding..." : t("buttons.addTeacher")}
                      </button>
                    </td>
                  </tr>
                  {filteredTeachers.map((teacher, i) => (
                    <tr key={i} className="bg-transparent">
                      {/* SNo */}
                      <td
                        className={`px-4 py-2 font-medium text-center border text-sm border-borderLine2 ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        }`}
                      >
                        {teacher.SNo}
                      </td>
                      {/* First Name */}
                      <td
                        className={`px-4 py-2 border text-sm border-borderLine2 `}
                      >
                        <input
                          data-testid="savedFirstname"
                          type="text"
                          value={teacher.firstName}
                          onChange={(e) =>
                            handleInputChange(
                              teacher.SNo,
                              "firstName",
                              e.target.value,
                            )
                          }
                          maxLength={15}
                          placeholder={t("placeholders.firstName")}
                          className={`w-full h-full px-2 py-1 font-medium text-center border-none focus:outline-none bg-transparent ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } focus:border-borderBlue`}
                          disabled={editSNo !== teacher.SNo}
                          autoFocus={editSNo === newTeacher.SNo}
                        />
                      </td>
                      {/* Last Name */}
                      <td
                        className={`px-4 py-2 text-sm  border border-borderLine2`}
                      >
                        <input
                          data-testid="savedLastname"
                          type="text"
                          value={teacher.lastName}
                          onChange={(e) =>
                            handleInputChange(
                              teacher.SNo,
                              "lastName",
                              e.target.value,
                            )
                          }
                          maxLength={15}
                          placeholder={t("placeholders.lastName")}
                          className={`w-full h-full px-2 py-1 font-medium text-center border-none focus:outline-none bg-transparent ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } focus:border-borderBlue`}
                          disabled={editSNo !== teacher.SNo}
                        />
                      </td>
                      {/* Phone */}
                      <td
                        className={`px-4 py-2 text-sm border border-borderLine2`}
                      >
                        <input
                          data-testid="savedPhone"
                          type="text"
                          value={teacher.phone}
                          maxLength={10}
                          onChange={(e) =>
                            handleInputChange(
                              teacher.SNo,
                              "phone",
                              e.target.value,
                            )
                          }
                          placeholder={t("placeholders.phoneNumber")}
                          className={`w-full h-full px-2 py-1 font-medium text-center border-none focus:outline-none bg-transparent ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } focus:border-borderBlue`}
                          disabled={editSNo !== teacher.SNo}
                        />
                      </td>
                      {/* class */}
                      <td
                        className={`px-4 py-2 text-sm border border-borderLine2`}
                      >
                        <div
                          className={`w-full h-full px-2 py-1 font-medium text-center border-none focus:outline-none bg-transparent ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } focus:border-borderBlue`}
                        >
                          {`${teacher?.className || CONSTANT.NA} ${
                            teacher?.sectionName || ""
                          }`}
                        </div>
                      </td>
                      {/* Actions */}
                      <td
                        className={`pl-3 pr-5 py-2 text-sm font-poppins-bold border border-borderLine2`}
                      >
                        <div className={`flex justify-evenly`}>
                          <button
                            onClick={() =>
                              navigate("/teacher/edit-teacher", {
                                state: teacher,
                              })
                            }
                          >
                            <img
                              src={isDarkMode ? edit : editw}
                              alt=""
                              className={`size-5`}
                            />
                          </button>
                          <button onClick={() => handleShowInfo(teacher)}>
                            <img
                              src={isDarkMode ? info : infow}
                              alt=""
                              className={`size-5`}
                            />
                          </button>
                          {teacher?.section ? (
                            <img
                              src={isDarkMode ? delete2 : delete2w}
                              alt="deleteTeacher"
                              className={`size-5 cursor-not-allowed opacity-50`}
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setCurrTeacher(teacher);
                                setShowDeleteConfirmation(true);
                              }}
                            >
                              <img
                                src={isDarkMode ? delete2 : delete2w}
                                alt="deleteTeacher"
                                className={`size-5`}
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
