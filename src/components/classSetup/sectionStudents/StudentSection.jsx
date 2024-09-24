import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosClient } from "../../../services/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Search from "../../../assets/images/Search.png";
import info from "../../../assets/images/info.png";
import edit2 from "../../../assets/images/edit2.png";
import delete2 from "../../../assets/images/delete2.png";
import ellipse from "../../../assets/images/ellipse.png";
import StudentInfo from "./StudentInfo";
import DeletePopup from "../../DeleteMessagePopup";
import Spinner from "../../Spinner";
import EndPoints from "../../../services/EndPoints";
import { useTranslation } from "react-i18next";
import ConformationPopup from "../../ConformationPopup";
import REGEX from "../../../utils/regix";

export default function StudentSection() {
  const [t] = useTranslation();
  const location = useLocation();
  const { classId, sectionId, className, sectionName } = location.state;
  const searchInputRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [currStudent, setCurrStudent] = useState([]);
  const [classTeacher, setClassTeacher] = useState([]);
  const [studentInfoModelOpen, setStudentInfoModelOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [editSNo, setEditSNo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [newStudent, setNewStudent] = useState({
    SNo: null,
    firstname: "",
    lastname: "",
    gender: "",
    parentName: "",
    phone: "",
    classId,
    sectionId,
  });
  const genders = [t("options.male"), t("options.female"), t("options.other")];
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const teacherSectionId = useSelector((state) => state.appAuth.section);

  useEffect(() => {
    fetchStudents();
    if (!isTeacher) getSectionInfo();
  }, []);

  // get class teacher info api
  const getSectionInfo = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.SECTION_INFO}/${sectionId}`
      );
      if (res?.statusCode === 200) setClassTeacher(res.result.teacher);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleShowInfo = (student) => {
    setCurrStudent(student);
    setStudentInfoModelOpen(true);
  };

  // get student api
  const fetchStudents = async () => {
    const url = isTeacher
      ? EndPoints.TEACHER.GET_SECTION_STUDENTS
      : EndPoints.ADMIN.GET_SECTION_STUDENTS;
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `${url}/${isTeacher ? teacherSectionId : sectionId}`
      );
      if (res?.statusCode === 200) {
        const studentList = res?.result?.studentList.map((student, index) => ({
          ...student,
          SNo: index + 1,
          parentName: student.parent?.fullname || "",
          phone: student.parent?.phone || "",
        }));
        setStudents(studentList);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // const checkIsStudentExistForSameParent = () => {
  //   const userExist = students.find(
  //     (item) => item?.phone === newStudent?.phone
  //   );
  //   if (userExist) {
  //     const existFullName = `${userExist?.firstname.trim()} ${userExist?.lastname.trim()}`;
  //     const newFullName = `${newStudent?.firstname.trim()} ${newStudent?.lastname.trim()}`;

  //     if (
  //       existFullName.toLowerCase() === newFullName.toLowerCase() &&
  //       userExist?.gender === newStudent?.gender
  //     ) {
  //       toast.error(t("duplicate"));
  //       return false;
  //     } else {
  //       setPopupVisible(true);
  //       return false;
  //     }
  //   }
  //   return true;
  // };

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
      !student.parentName.trim() ||
      student.parentName.length < 3 ||
      REGEX.NUMBER.test(student.parentName)
    ) {
      return t("validationError.parentName");
    }
    if (!REGEX.PHONE_LENGTH.test(student.phone.trim())) {
      return t("validationError.validationPhone");
    }
    return "";
  };

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const handleInputChange = (sNo, field, value) => {
    if (sNo === null) {
      setNewStudent({ ...newStudent, [field]: value });
    } else {
      setStudents((prev) =>
        prev.map((student, idx) =>
          idx === sNo - 1 ? { ...student, [field]: value } : student
        )
      );
    }
  };

  // api for registering and updating student
  const handleStudentAction = async (student, isUpdate = false) => {
    const e = validateData(student);
    if (e) {
      toast.error(e);
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

    const transformedStudent = {
      ...student,
      firstname: capitalize(student.firstname.trim()),
      lastname: capitalize(student.lastname.trim()),
      parentName: capitalize(student.parentName.trim()),
      classId,
      sectionId,
    };

    try {
      setLoading(true);

      const response = await axiosClient[isUpdate ? "put" : "post"](
        `${url}${isUpdate ? `/${student._id}` : ""}`,
        transformedStudent
      );
      if ([200, 201].includes(response?.statusCode)) {
        toast.success(t(`messages.student.${isUpdate ? "update" : "success"}`));
        fetchStudents();
        if (!isUpdate) {
          setNewStudent({
            SNo: null,
            firstname: "",
            lastname: "",
            gender: "",
            parentName: "",
            phone: "",
            classId,
            sectionId,
          });
        }
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (SNo) => {
    setEditSNo(SNo);
  };

  // delete student api
  const handleDelete = async () => {
    try {
      setLoading(true);
      const url = isTeacher
        ? EndPoints.TEACHER.DELETE_SECTION_STUDENT
        : EndPoints.ADMIN.DELETE_SECTION_STUDENT;
      const res = await axiosClient.delete(`${url}/${currStudent._id}`);
      if (res?.statusCode === 200) {
        toast.success(t("messages.student.deleteSuccess"));
        fetchStudents();
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

  // filter students
  const filteredStudents = students.filter(
    (student) =>
      student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f3f3ff] px-6 py-10 ">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode ? "bg-[#0D192F] text-white" : "bg-white "
        } p-4 min-h-screen `}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <div className="px-4">
          <div className="flex justify-between">
            <div className="text-4xl font-semibold px-5 py-3">
              {t("titles.students")}
            </div>
            <div className="text-right">
              <div
                className={` ${
                  isDarkMode ? "text-white" : ""
                } text-2xl px-5 font-poppins-bold text-gray-800`}
              >
                {t("roles.classTeacher")} -{" "}
                {isTeacher
                  ? localStorage.getItem("firstname")
                  : `${classTeacher.firstname} ${classTeacher.lastname}`}
              </div>
              <div
                className={` ${
                  isDarkMode ? "text-white" : ""
                } text-xl px-5 py-1 font-semibold text-[#464590]`}
              >
                {isTeacher
                  ? `${localStorage.getItem("class")} ${localStorage.getItem(
                      "section"
                    )}`
                  : `${t("titles.class")} ${className} | ${t(
                      "titles.section"
                    )} ${sectionName}`}
              </div>
            </div>
          </div>
          {/* search bar */}
          <div className="p-3">
            <div className="flex justify-between w-full relative">
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
                {/* table headings */}
                <tr>
                  <th className="px-2 py-2 border border-gray-400">
                    {t("labels.sNo")}
                  </th>
                  <th className=" py-2 border border-gray-400">
                    {t("labels.firstName")}
                  </th>
                  <th className=" py-2 border border-gray-400">
                    {t("labels.lastName")}
                  </th>
                  <th className=" w-36 py-2 border border-gray-400">
                    {t("labels.gender")}
                  </th>
                  <th className=" py-2 border border-gray-400">
                    {t("labels.guardianName")}
                  </th>
                  <th className=" py-2 border border-gray-400">
                    {t("labels.phone")}
                  </th>
                  <th className="w-32 py-2 border border-gray-400">
                    {t("labels.action")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal text-gray-900">
                {/* student data */}
                {filteredStudents.map((student) => (
                  <tr key={student.SNo}>
                    <td
                      className={`${
                        isDarkMode ? "text-white" : ""
                      } px-2 py-2 font-bold text-center border text-sm border-[#c1c0ca] text-[#6d6ca7]`}
                    >
                      {student.SNo}
                    </td>
                    <td className=" py-2 border text-sm border-[#c1c0ca]">
                      <input
                        type="text"
                        value={student.firstname}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "firstname",
                            e.target.value
                          )
                        }
                        placeholder={t("placeholders.firstName")}
                        className={`w-full h-full px-2 py-1  font-poppins-bold text-center border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    <td className=" py-2 border text-sm border-[#c1c0ca]">
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
                        placeholder={t("placeholders.lastName")}
                        className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    <td className="py-2 border text-sm border-[#c1c0ca]">
                      <select
                        value={student.gender}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "gender",
                            e.target.value
                          )
                        }
                        className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-black"
                        }`}
                        disabled={editSNo !== student.SNo}
                      >
                        {genders.map((gender, index) => (
                          <option key={index} value={gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className=" py-2 border text-sm border-[#c1c0ca]">
                      <input
                        type="text"
                        value={student.parentName}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "parentName",
                            e.target.value
                          )
                        }
                        placeholder={t("placeholders.parentName")}
                        className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    <td className=" py-2 border text-sm border-[#c1c0ca]">
                      <input
                        type="text"
                        value={student.phone}
                        onChange={(e) =>
                          handleInputChange(
                            student.SNo,
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder={t("placeholders.phoneNumber")}
                        className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    {/* actions */}
                    <td
                      className={`${
                        isDarkMode ? "text-white" : ""
                      } pl-3 pr-5 py-2 border border-gray-400`}
                    >
                      {editSNo === student.SNo ? (
                        <button
                          onClick={() => handleStudentAction(student, true)}
                          className="bg-[#464590] text-white font-poppins-regular py-1.5 px-3 rounded-xl w-full h-full"
                        >
                          {t("buttons.save")}
                        </button>
                      ) : (
                        <div className="flex justify-around">
                          <button onClick={() => handleEdit(student.SNo)}>
                            <img
                              src={ellipse}
                              alt=""
                              className="size-6 absolute "
                            />
                            <img
                              src={edit2}
                              alt=""
                              className="size-4 relative top-1 left-1"
                            />
                          </button>
                          <button onClick={() => handleShowInfo(student)}>
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
                              setCurrStudent(student);
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
                {/* input fields */}
                <tr>
                  <td className="px-2 py-2 text-center text-[#6d6ca7] font-bold border border-[#c1c0ca]">
                    {students.length + 1}
                  </td>
                  <td className=" py-2 border border-[#c1c0ca]">
                    <input
                      type="text"
                      value={newStudent.firstname}
                      onChange={(e) =>
                        handleInputChange(null, "firstname", e.target.value)
                      }
                      placeholder={t("placeholders.firstName")}
                      className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </td>
                  <td className=" py-2 border border-[#c1c0ca]">
                    <input
                      type="text"
                      value={newStudent.lastname}
                      onChange={(e) =>
                        handleInputChange(null, "lastname", e.target.value)
                      }
                      placeholder={t("placeholders.lastName")}
                      className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </td>
                  <td className=" py-2 border border-[#c1c0ca]">
                    <select
                      value={newStudent.gender}
                      onChange={(e) =>
                        handleInputChange(null, "gender", e.target.value)
                      }
                      className={`w-full h-full px-2 py-1 font-poppins-bold text-center border-none focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-black"
                      }
                      ${
                        newStudent.gender === ""
                          ? "text-gray-400"
                          : "text-black"
                      }
                      `}
                    >
                      <option value="" disabled>
                        {t("placeholders.selectGender")}
                      </option>
                      {genders.map((gender, index) => (
                        <option key={index} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className=" py-2 border border-[#c1c0ca]">
                    <input
                      type="text"
                      value={newStudent.parentName}
                      onChange={(e) =>
                        handleInputChange(null, "parentName", e.target.value)
                      }
                      placeholder={t("placeholders.parentName")}
                      className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </td>
                  <td className=" py-2 border border-[#c1c0ca]">
                    <input
                      type="text"
                      value={newStudent.phone}
                      onChange={(e) =>
                        handleInputChange(null, "phone", e.target.value)
                      }
                      placeholder={t("placeholders.phoneNumber")}
                      className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </td>
                  <td className="px-2 py-2 border border-[#c1c0ca]">
                    <button
                      onClick={() => handleStudentAction(newStudent, false)}
                      className="bg-[#464590] text-white font-poppins-regular text-[16] py-1.5 px-3 rounded-xl w-full h-full"
                    >
                      {t("buttons.addStudent")}
                    </button>
                  </td>
                </tr>
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
      {/* {popupVisible && (
        <ConformationPopup
          isVisible={popupVisible}
          onClose={() => setPopupVisible(false)}
          submit={handleRegisterStudent}
        />
      )} */}
    </div>
  );
}
