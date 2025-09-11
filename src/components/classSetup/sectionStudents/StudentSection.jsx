import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Searchw from "../../../assets/images/Search.png";
import crossw from "../../../assets/images/cross.png";
import infow from "../../../assets/images/info.png";
import edit2w from "../../../assets/images/edit2.png";
import delete2w from "../../../assets/images/delete2.png";
import Search from "../../../assets/images/darkmode/Search.png";
import cross from "../../../assets/images/darkmode/cross.png";
import info from "../../../assets/images/darkmode/info.png";
import edit2 from "../../../assets/images/darkmode/edit.png";
import delete2 from "../../../assets/images/darkmode/delete.png";
import book from "../../../assets/images/book.png";
import importIcon from "../../../assets/images/importIcon.png";
import downloadIcon from "../../../assets/images/downloadIcon.png";
import StudentInfo from "./StudentInfo";
import DeletePopup from "../../DeleteMessagePopup";
import Spinner from "../../Spinner";
import EndPoints from "../../../services/EndPoints";
import { useTranslation } from "react-i18next";
import REGEX from "../../../utils/regix";
import AttendancePopup from "../../AttendancePopup";
import Breadcrumbs from "../../BreadCrumbs";

export default function StudentSection() {
  // Importing necessary modules and hooks
  const [t] = useTranslation();
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // References for input and file handling
  const editStudentFirstNameRefs = useRef({});
  const newStudentFirstNameRef = useRef(null);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // State variables for managing component data and UI
  const [students, setStudents] = useState([]);
  const [currStudent, setCurrStudent] = useState([]);
  const [classData, setClassData] = useState([]);
  const [studentInfoModelOpen, setStudentInfoModelOpen] = useState(false);
  const [editSNo, setEditSNo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [newStudent, setNewStudent] = useState({
    SNo: null,
    firstname: "",
    lastname: "",
    gender: "",
    parentFullName: "",
    parentPhone: "",
    sectionId: classAndSectionData?.sectionId,
  });
  const genders = [t("options.male"), t("options.female"), t("options.other")];

  // User role and section details from Redux state
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  // console.log(classAndSectionData);

  useEffect(() => {
    const shouldFetchStudents = isTeacher
      ? classAndSectionDataOfTeacher?.sectionId &&
        classAndSectionDataOfTeacher?.sessionId
      : classAndSectionData?.selectedSession?.school &&
        classAndSectionData?.sectionId &&
        classAndSectionData?.selectedSession?._id;

    const fetchData = async () => {
      if (classAndSectionData?.id && classAndSectionData?.sectionId) {
        await getSectionInfo();
      }
      if (shouldFetchStudents) {
        await fetchStudents();
      }
    };

    fetchData();
  }, [
    isTeacher,
    classAndSectionData?.id,
    classAndSectionData?.sectionId,
    classAndSectionData?.selectedSession?._id,
    classAndSectionDataOfTeacher?.sectionId,
    classAndSectionDataOfTeacher?.sessionId,
  ]);
  // console.log(classAndSectionData);
  // get class teacher info api
  const getSectionInfo = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.SECTION_INFO}/${classAndSectionData?.sectionId}`
      );

      if (res?.statusCode === 200) setClassData(res?.result);
    } catch (e) {
      // toast.error(e);
    }
  };

  // Handles displaying student information in a modal
  const handleShowInfo = (student) => {
    setCurrStudent(student);
    setStudentInfoModelOpen(true);
  };

  // get student api
  const fetchStudents = async () => {
    // console.log(classAndSectionData);
    const url = isTeacher
      ? EndPoints.TEACHER.GET_SECTION_STUDENTS
      : EndPoints.ADMIN.GET_SECTION_STUDENTS;

    let query = `?`;
    if (isTeacher) {
      query += `school=${classAndSectionDataOfTeacher?.school}&section=${classAndSectionDataOfTeacher?.sectionId}&session=${classAndSectionDataOfTeacher?.sessionId}`;
    } else {
      query += `school=${classAndSectionData?.selectedSession?.school}&section=${classAndSectionData?.sectionId}&session=${classAndSectionData?.selectedSession?._id}`;
    }

    try {
      if (loading) return;
      setLoading(true);

      const res = await axiosClient.get(`${url}${query}`);
      // console.log(res);

      if (res?.statusCode === 200) {
        const studentList = res?.result?.map((student, index, array) => ({
          ...student,
          SNo: index + 1,
          parentFullName: student?.parentFullName || "",
          parentPhone: student?.parentPhone || "",
        }));
        // console.table(studentList)
        setStudents(studentList);
      }
    } catch (e) {
      // toast.error(e);
    } finally {
      setLoading(false);
    }
  };
  // console.log(students);

  // check same entry in registration
  const checkIsStudentExistForSameParent = () => {
    const userExist = students.find(
      (item) => item?.parentPhone === newStudent?.parentPhone
    );
    if (userExist) {
      const existFullName = `${userExist?.firstname.trim()} ${userExist?.lastname.trim()}`;
      const newFullName = `${newStudent?.firstname.trim()} ${newStudent?.lastname.trim()}`;

      if (
        existFullName.toLowerCase() === newFullName.toLowerCase() &&
        userExist?.gender === newStudent?.gender
      ) {
        toast.error(t("duplicate"));
        return false;
      }
    }
    return true;
  };

  const registerStudent = async () => {
    if (checkIsStudentExistForSameParent()) {
      handleStudentAction(newStudent, false);
    }
  };

  // validation schema
  const validateData = (student) => {
    if (
      !student.firstname.trim() ||
      student.firstname.length < 3 ||
      REGEX.NUMBER.test(student.firstname)
    ) {
      return t("validationError.enterFirstName");
    }
    if (
      !student.lastname.trim() ||
      student.lastname.length < 3 ||
      REGEX.NUMBER.test(student.lastname)
    ) {
      return t("validationError.enterLastName");
    }
    if (!student.gender) return t("validationError.gender");
    if (
      !student.parentFullName.trim() ||
      student.parentFullName.length < 3 ||
      REGEX.NUMBER.test(student.parentFullName)
    ) {
      return t("validationError.parentName");
    }
    if (!student?.parentPhone.trim()) return t("validationError.phone");
    if (!REGEX.PHONE_LENGTH.test(student.parentPhone))
      return t("validationError.validationPhoneCount");
    return "";
  };

  // Capitalizes the first letter of a string
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Updates student data in state
  const handleInputChange = (sNo, field, value) => {
    let formattedValue = value;

    if (field === "parentPhone") {
      formattedValue = value.replace(/\D/g, "");
    } else {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, "").replace(/\s+/g, " ");
    }

    if (sNo === null) {
      setNewStudent({ ...newStudent, [field]: formattedValue });
    } else {
      setStudents((prev) =>
        prev.map((student, idx) =>
          idx === sNo - 1 ? { ...student, [field]: formattedValue } : student
        )
      );
    }
  };

  // api for registering and updating student
  const handleStudentAction = async (student, isUpdate = false) => {
    const e = validateData(student);
    if (e) {
      if (!toastDisplayed) {
        setToastDisplayed(true);
        toast.error(e);
        setTimeout(() => setToastDisplayed(false), 3000);
      }
      return;
    }

    const url = isTeacher
      ? isUpdate
        ? EndPoints.TEACHER.UPDATE_SECTION_STUDENT
        : EndPoints.TEACHER.REGISTER_SECTION_STUDENT
      : isUpdate
      ? EndPoints.ADMIN.UPDATE_SECTION_STUDENT
      : EndPoints.ADMIN.REGISTER_SECTION_STUDENT;

    if (!isTeacher && !isUpdate) {
      delete student.SNo;
    }

    let transformedStudent = {
      firstname: capitalize(student.firstname.trim()),
      lastname: capitalize(student.lastname.trim()),
      parentName: capitalize(student.parentFullName.trim()),
      gender: student.gender,
      phone: student.parentPhone,
      ...(!isUpdate && { sectionId: classAndSectionData?.sectionId }),
    };

    try {
      setLoading(true);
      // respone based on registered or updated request
      const response = await axiosClient[isUpdate ? "put" : "post"](
        `${url}${isUpdate ? `/${student?.id}` : ""}`,
        transformedStudent
      );
      if ([200, 201].includes(response?.statusCode)) {
        toast.success(response.result);
        fetchStudents();
        if (!isUpdate) {
          setNewStudent({
            SNo: null,
            firstname: "",
            lastname: "",
            gender: "",
            parentFullName: "",
            parentPhone: "",
            sectionId: classAndSectionData?.sectionId,
          });
          newStudentFirstNameRef.current?.focus();
        }
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      setEditSNo(null);
    }
  };

  const handleEdit = (SNo) => {
    setEditSNo(SNo);
    editStudentFirstNameRefs.current[SNo]?.focus();
  };

  // delete student api
  const handleDelete = async () => {
    try {
      setLoading(true);
      const url = isTeacher
        ? EndPoints.TEACHER.DELETE_SECTION_STUDENT
        : EndPoints.ADMIN.DELETE_SECTION_STUDENT;
      const res = await axiosClient.delete(`${url}/${currStudent.id}`);
      if (res?.statusCode === 200) {
        toast.success(res.result);
        fetchStudents();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Uploads an Excel sheet containing student data
  const uploadExcelSheet = async (file) => {
    try {
      if (!file) {
        toast.error("Please select a valid Excel file.");
        return;
      }

      const formData = new FormData();
      formData.append("classId", classAndSectionData?.classId);
      formData.append("sectionId", classAndSectionData?.sectionId);
      formData.append(
        "sessionId",
        isTeacher
          ? classAndSectionDataOfTeacher?.sessionId
          : classAndSectionData?.selectedSession?._id
      );
      formData.append("file", file);
      setLoading(true);
      const res = await axiosClient.post(
        EndPoints.ADMIN.UPLOAD_EXCEL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res?.statusCode === 201 || res?.statusCode === 200) {
        toast.success(res?.result);
        fetchStudents();
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

  // download the excel sheet in pdf format
  const getDemoExcelSheet = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(EndPoints.ADMIN.GET_DEMO_EXCEL, {
        responseType: "blob", // Required for binary file download
      });

      // Create a Blob from the response data
      const url = window.URL.createObjectURL(new Blob([response]));
      // console.log({ url });
      const link = document.createElement("a");
      link.href = url;

      // Set the filename for download
      link.setAttribute("download", "student-template.xlsx");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // filter students
  const filteredStudents = students.filter(
    (student) =>
      student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (editSNo !== null && editStudentFirstNameRefs.current[editSNo]) {
      editStudentFirstNameRefs.current[editSNo].focus();
    }
  }, [editSNo]);

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } px-6 py-6 min-h-[calc(100vh-72px)]`}
    >
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#93a3b6]/25 bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } p-4 rounded-[16px]`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <div className={`px-6`}>
          <Breadcrumbs />
          <div className={`flex justify-between`}>
            <div
              className={`text-2xl ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } font-semibold px-2 py-3`}
            >
              {t("titles.students")}
            </div>
            <div className={`text-right py-3`}>
              <div
                className={`text-[20px] font-bold ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {isTeacher
                  ? localStorage.getItem("firstname")
                  : `${classData?.teacher?.firstname || ""} ${
                      classData?.teacher?.lastname || ""
                    }`}
              </div>
              <div
                className={`flex flex-row justify-end items-center space-x-2`}
              >
                <div
                  className={`text-[14px] py-1 font-poppins-regular ${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  }`}
                >
                  {isTeacher
                    ? `${classAndSectionDataOfTeacher?.className} ${classAndSectionDataOfTeacher?.sectionName}`
                    : `${classAndSectionData?.className}-${classAndSectionData?.sectionName}`}
                </div>
                {/* <div
                  onClick={() => setShowAttendance(true)}
                  className={`flex flex-row justify-center items-center px-2 py-1 space-x-2 cursor-pointer rounded border border-[#FF793F]/10 bg-[#FF793F]/10 transition-all duration-200 ease-in-out active:scale-90`}
                >
                  <img src={book} alt="" className={`size-[10px] `} />
                  <span className={`text-xs font-poppins-bold text-textOrange`}>
                    Attendance
                  </span>
                </div> */}
              </div>
            </div>
          </div>
          {/* search bar */}
          <div className={`py-2`}>
            <div className={`flex justify-between w-full relative space-x-2`}>
              <div className={`relative w-full`}>
                <div
                  className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none`}
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
                      : "text-textBlack border-borderWhite2"
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
          <div
            className={`overflow-x-auto relative mt-6 min-h-[250px] max-h-[400px]`}
          >
            <table
              className={`${
                isDarkMode ? "" : "bg-whiteBackground"
              } min-w-full border-separate border-spacing-0`}
            >
              <thead
                className={`${
                  isDarkMode ? "bg-backgroundTableCell" : "bg-whiteBackground"
                } text-textBlue text-base font-medium sticky top-0 z-10`}
              >
                {/* table headings */}
                <tr>
                  <th
                    className={`px-2 py-2 border border-borderLine2 bg-clip-padding`}
                  >
                    {t("labels.sNo")}
                  </th>
                  <th
                    className={` py-2 border border-borderLine2 bg-clip-padding`}
                  >
                    {t("labels.firstName")}
                  </th>
                  <th
                    className={` py-2 border border-borderLine2 bg-clip-padding`}
                  >
                    {t("labels.lastName")}
                  </th>
                  <th
                    className={` w-36 py-2 border border-borderLine2 bg-clip-padding`}
                  >
                    {t("labels.gender")}
                  </th>
                  <th
                    className={` py-2 border border-borderLine2 bg-clip-padding`}
                  >
                    {t("labels.guardianName")}
                  </th>
                  <th
                    className={` py-2 border border-borderLine2 bg-clip-padding`}
                  >
                    {t("labels.phone")}
                  </th>
                  <th
                    className={`w-36 py-2 border border-borderLine2 bg-clip-padding`}
                  >
                    {t("labels.action")}
                  </th>
                </tr>
              </thead>
              <tbody className={`text-sm font-normal text-gray-900`}>
                {/* input fields */}
                <tr>
                  <td
                    className={`px-2 py-0 text-center ${
                      isDarkMode
                        ? "text-textPrimary border-borderLine"
                        : "text-textBlack border-borderGray2"
                    } font-poppins font-medium border`}
                  >
                    -
                  </td>
                  <td
                    className={`py-1 px-2 border ${
                      isDarkMode ? "border-borderLine2" : "border-borderGray2"
                    }`}
                  >
                    <input
                      type="text"
                      value={newStudent.firstname}
                      onChange={(e) =>
                        handleInputChange(null, "firstname", e.target.value)
                      }
                      maxLength={15}
                      placeholder={t("placeholders.firstName")}
                      className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                      ref={newStudentFirstNameRef}
                    />
                  </td>
                  <td
                    className={`py-1 px-2 border ${
                      isDarkMode ? "border-borderLine2" : "border-borderGray2"
                    }`}
                  >
                    <input
                      type="text"
                      value={newStudent.lastname}
                      onChange={(e) =>
                        handleInputChange(null, "lastname", e.target.value)
                      }
                      maxLength={15}
                      placeholder={t("placeholders.lastName")}
                      className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                    />
                  </td>
                  <td
                    className={`py-1 px-1 border ${
                      isDarkMode ? "border-borderLine2" : "border-borderGray2"
                    }`}
                  >
                    <select
                      data-testid="gender"
                      value={newStudent.gender}
                      onChange={(e) =>
                        handleInputChange(null, "gender", e.target.value)
                      }
                      className={`w-full h-full px-2 py-3 border-none bg-transparent ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      } font-poppins font-medium text-center focus:outline-offset-[4px] focus:outline-borderBlue  ${
                        newStudent.gender === ""
                          ? "text-gray-400"
                          : "text-black"
                      }`}
                    >
                      <option
                        value=""
                        disabled
                        className={`${
                          isDarkMode
                            ? "text-textPrimary bg-background2 "
                            : "text-textBlack bg-whiteBackground"
                        }`}
                      >
                        {t("placeholders.selectGender")}
                      </option>
                      {genders.map((gender, index) => (
                        <option
                          key={index}
                          value={gender}
                          className={`${
                            isDarkMode
                              ? "text-textPrimary bg-background2 "
                              : "text-textBlack bg-whiteBackground"
                          }`}
                        >
                          {gender}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    className={`py-1 px-2 border ${
                      isDarkMode ? "border-borderLine2" : "border-borderGray2"
                    }`}
                  >
                    <input
                      type="text"
                      value={newStudent.parentFullName}
                      onChange={(e) =>
                        handleInputChange(
                          null,
                          "parentFullName",
                          e.target.value
                        )
                      }
                      maxLength={20}
                      placeholder={t("placeholders.parentName")}
                      className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                    />
                  </td>
                  <td
                    className={`py-1 px-2 border ${
                      isDarkMode ? "border-borderLine2" : "border-borderGray2"
                    }`}
                  >
                    <input
                      type="text"
                      value={newStudent.parentPhone}
                      maxLength={10}
                      onChange={(e) =>
                        handleInputChange(null, "parentPhone", e.target.value)
                      }
                      placeholder={t("placeholders.phoneNumber")}
                      className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                    />
                  </td>
                  {/* add student button */}
                  <td
                    className={`px-2 py-2 border ${
                      isDarkMode ? "border-borderLine2" : "border-borderGray2"
                    }`}
                  >
                    <button
                      disabled={loading}
                      onClick={() => registerStudent()}
                      className={`bg-backgroundBlue text-textPrimary font-medium text-[16] py-1.5 px-3 rounded-lg w-full h-full transition-all duration-200 ease-in-out active:scale-90`}
                    >
                      {loading ? "Adding..." : t("buttons.addStudent")}
                    </button>
                  </td>
                </tr>
                {/* student data */}
                {filteredStudents.map((student) => (
                  <tr key={student.SNo}>
                    <td
                      className={`px-2 py-2 font-medium text-center border text-sm ${
                        isDarkMode
                          ? "text-textPrimary border-borderLine2"
                          : "text-textBlack border-borderGray2"
                      }`}
                    >
                      {student.SNo}
                    </td>
                    <td
                      className={`px-2 py-1 border text-sm ${
                        isDarkMode ? "border-borderLine2" : "border-borderGray2"
                      }`}
                    >
                      <input
                        data-testid="firstname"
                        type="text"
                        value={student.firstname}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "firstname",
                            e.target.value
                          )
                        }
                        maxLength={15}
                        placeholder={t("placeholders.firstName")}
                        className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                        disabled={editSNo !== student.SNo}
                        ref={(el) =>
                          (editStudentFirstNameRefs.current[student.SNo] = el)
                        }
                      />
                    </td>
                    <td
                      className={`px-2 py-1 border text-sm ${
                        isDarkMode ? "border-borderLine2" : "border-borderGray2"
                      }`}
                    >
                      <input
                        type="text"
                        value={student.lastname}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "lastname",
                            e.target.value
                          )
                        }
                        maxLength={15}
                        placeholder={t("placeholders.lastName")}
                        className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    <td
                      className={`px-2 py-1 border text-sm ${
                        isDarkMode ? "border-borderLine2" : "border-borderGray2"
                      }`}
                    >
                      <select
                        value={student.gender}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "gender",
                            e.target.value
                          )
                        }
                        className={`w-full h-full px-2 py-3 border-none bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[4px] focus:outline-borderBlue`}
                        disabled={editSNo !== student.SNo}
                      >
                        {genders.map((gender, index) => (
                          <option
                            key={index}
                            value={gender}
                            className={`${
                              isDarkMode
                                ? "text-textPrimary bg-background2 "
                                : "text-textBlack bg-whiteBackground"
                            }`}
                          >
                            {gender}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      className={`px-2 py-1 border text-sm ${
                        isDarkMode ? "border-borderLine2" : "border-borderGray2"
                      }`}
                    >
                      <input
                        type="text"
                        value={student.parentFullName}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "parentFullName",
                            e.target.value
                          )
                        }
                        maxLength={20}
                        placeholder={t("placeholders.parentName")}
                        className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    <td
                      className={`px-2 py-1 border text-sm ${
                        isDarkMode ? "border-borderLine2" : "border-borderGray2"
                      }`}
                    >
                      <input
                        type="text"
                        value={student.parentPhone}
                        maxLength={10}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "parentPhone",
                            e.target.value
                          )
                        }
                        placeholder={t("placeholders.phoneNumber")}
                        className={`w-full h-full p-2 border-none focus:outline-none focus:ring-0 bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } font-poppins font-medium text-center focus:outline-offset-[8px] focus:outline-borderBlue`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    {/* actions buttons */}
                    <td
                      className={`${
                        isDarkMode ? "text-white" : ""
                      } pl-3 pr-5 py-2 border ${
                        isDarkMode ? "border-borderLine2" : "border-borderGray2"
                      }`}
                    >
                      {editSNo === student.SNo ? (
                        <button
                          onClick={() => handleStudentAction(student, true)}
                          className={`bg-backgroundBlue text-textPrimary font-poppins-regular py-1.5 px-3 rounded-lg w-full h-full transition-all duration-200 ease-in-out active:scale-90`}
                        >
                          {t("buttons.save")}
                        </button>
                      ) : (
                        <div className={`flex justify-around`}>
                          <button onClick={() => handleEdit(student.SNo)}>
                            <img
                              src={isDarkMode ? edit2 : edit2w}
                              alt="editStudent"
                              className={`size-5`}
                            />
                          </button>
                          <button onClick={() => handleShowInfo(student)}>
                            <img
                              src={isDarkMode ? info : infow}
                              alt="infoStudent"
                              className={`size-5`}
                            />
                          </button>
                          <button
                            onClick={() => {
                              setCurrStudent(student);
                              setShowDeleteConfirmation(true);
                            }}
                          >
                            <img
                              src={isDarkMode ? delete2 : delete2w}
                              alt="deleteStudent"
                              className={`size-5`}
                            />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* student info model */}
      {studentInfoModelOpen && (
        <StudentInfo
          modelOpen={setStudentInfoModelOpen}
          currStudent={currStudent}
        />
      )}

      {/* delete confirmation popup */}
      {showDeleteConfirmation && (
        <DeletePopup
          isVisible={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
