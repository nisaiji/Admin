import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosClient } from "../../../services/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import searchp from "../../../assets/images/searchp.png";
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

export default function StudentSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { classId, sectionId, className, sectionName } = location.state;
  const searchInputRef = useRef(null);
  const newStudentRollNoRef = useRef(null);
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
    // rollNumber: "",
    firstname: "",
    lastname: "",
    gender: "",
    parentName: "",
    phone: "",
    classId: classId,
    sectionId: sectionId,
  });
  const genders = ["Male", "Female", "Other"];
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const teacherSectionId = useSelector((state) => state.appAuth.section);
  useEffect(() => {
    fetchStudents();
    if (!isTeacher) {
      getSectionInfo();
    }
  }, []);

  const getSectionInfo = async () => {
    const res = await axiosClient.get(
      `${EndPoints.ADMIN.SECTION_INFO}/${sectionId}`
    );
    // console.log("res", res);
    if (res?.statusCode === 200) {
      setClassTeacher(res.result.teacher);
    }
  };

  const handleShowInfo = (student) => {
    setCurrStudent(student);
    setStudentInfoModelOpen(true);
  };

  const fetchStudents = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.GET_SECTION_STUDENTS;
    else url = EndPoints.ADMIN.GET_SECTION_STUDENTS;
    try {
      setLoading(true);
      let res;
      if (isTeacher) {
        const sectionId = teacherSectionId;
        res = await axiosClient.get(`${url}/${sectionId}`);
      } else res = await axiosClient.get(`${url}/${sectionId}`);
      // console.log(res);
      if (res?.statusCode === 200) {
        const fetchedStudents = res.result.studentList;
        const studentsWithSNos = fetchedStudents.map((student, index) => ({
          ...student,
          SNo: index + 1,
          parentName: student.parent.fullname,
          phone: student.parent.phone,
        }));
        setStudents(studentsWithSNos);
      }
    } catch (error) {
      // console.error(t("student.errorFetching"), error);
    } finally {
      setLoading(false);
    }
  };

  const checkIsStudentExistForSameParent = () => {
    const userExist = students.find(
      (item) => item?.phone === newStudent?.phone
    );
    if (userExist) {
      const existFullName = `${userExist?.firstname.trim()} ${userExist?.lastname.trim()}`;
      const newFullName = `${newStudent?.firstname.trim()} ${newStudent?.lastname.trim()}`;

      if (
        existFullName.toLowerCase() === newFullName.toLowerCase() &&
        userExist?.gender === newStudent?.gender
      ) {
        toast.error("Duplicate child adding for same parent");
        return false;
      } else {
        setPopupVisible(true);
        return false;
      }
    }
    return true;
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const validateData = (student) => {
    if (!student.firstname.trim()) return t("teacherSetup.enterFirstName");
    if (student.firstname.length < 3)
      return t("teacherSetup.validationFirstNameLength");
    if (/\d/.test(student.firstname))
      return t("teacherSetup.validationFirstNameNoNumbers");

    if (!student.lastname.trim()) return t("teacherSetup.enterLastName");
    if (student.lastname.length < 3)
      return t("teacherSetup.validationLastNameLength");
    if (/\d/.test(student.lastname))
      return t("teacherSetup.validationLastNameNoNumbers");

    if (!student.gender) return t("teacherSetup.gender");

    if (!student.parentName.trim()) return t("teacherSetup.parentName");
    if (student.parentName.length < 3)
      return t("teacherSetup.validationParentFullNameLength");
    if (/\d/.test(student.parentName))
      return t("teacherSetup.validationParentFullNameNoNumbers");
    if (!student.phone.trim()) return t("teacherSetup.validationPhone");
    if (!/^[1-5]\d{9}$/.test(student.phone))
      return t("teacherSetup.validationPhoneCount");
    return "";
  };

  const registerStudent = async () => {
    const error = validateData(newStudent);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    if (checkIsStudentExistForSameParent()) {
      handleRegisterStudent();
    }
  };
  const handleRegisterStudent = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.REGISTER_SECTION_STUDENT;
    else url = EndPoints.ADMIN.REGISTER_SECTION_STUDENT;
    delete newStudent.SNo;
    const transformedStudent = {
      ...newStudent,
      firstname: capitalizeFirstLetter(newStudent.firstname.trim()),
      lastname: capitalizeFirstLetter(newStudent.lastname.trim()),
      parentName: capitalizeFirstLetter(newStudent.parentName.trim()),
    };
    // console.log(transformedStudent);

    try {
      setLoading(true);
      let res;
      if (isTeacher) {
        const sectionId = teacherSectionId;
        res = await axiosClient.post(url, {
          ...transformedStudent,
          classId,
          sectionId,
        });
      } else {
        res = await axiosClient.post(url, {
          ...transformedStudent,
          classId,
          sectionId,
        });
      }
      // console.log("res", res);

      if (res?.statusCode === 200 || res?.statusCode === 201) {
        toast.success(<b>{res.result}</b>);
        fetchStudents();
        setNewStudent({
          SNo: null,
          // rollNumber: "",
          firstname: "",
          lastname: "",
          gender: "",
          parentName: "",
          phone: "",
          classId: classId,
          sectionId: sectionId,
        });
        // newStudentRollNoRef.current.focus();
      }
    } catch (e) {
      // console.error(t("messages.student.errorFetching"), e);
    } finally {
      setLoading(false);
      setPopupVisible(false);
    }
  };

  const handleInputChange = (sNo, field, value) => {
    if (sNo === null) {
      setNewStudent({ ...newStudent, [field]: value });
    } else {
      setStudents((prevStudents) => {
        const newItems = [...prevStudents];
        newItems[sNo - 1] = { ...newItems[sNo - 1], [field]: value };
        return newItems;
      });
    }
  };

  const updateStudent = async (student) => {
    const error = validateData(student);
    if (error) {
      toast.error(error);
      return;
    }
    let url;
    if (isTeacher) url = EndPoints.TEACHER.UPDATE_SECTION_STUDENT;
    else url = EndPoints.ADMIN.UPDATE_SECTION_STUDENT;
    try {
      const transformedStudent = {
        firstname: capitalizeFirstLetter(student.firstname.trim()),
        lastname: capitalizeFirstLetter(student.lastname.trim()),
        gender: student.gender,
        parentName: capitalizeFirstLetter(student.parentName.trim()),
        phone: student.phone.trim(),
      };
      setLoading(true);
      console.log(student._id);

      const response = await axiosClient.put(
        `${url}/${student._id}`,
        transformedStudent
      );
      // console.log(response, "update");

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        fetchStudents();
        toast.success(t("messages.student.update"));
        setEditSNo(null);
      }
    } catch (error) {
      toast.error(<b>{error}</b>);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (SNo) => {
    setEditSNo(SNo);
  };

  const handleDelete = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.DELETE_SECTION_STUDENT;
    else url = EndPoints.ADMIN.DELETE_SECTION_STUDENT;
    const studentId = currStudent._id;
    try {
      setLoading(true);
      const response = await axiosClient.delete(`${url}/${studentId}`);
      console.log(response);

      if (response?.statusCode === 200) {
        setShowDeleteConfirmation(false);
        toast.success(t("studentList.toasterMessages.deleteSuccess"));
        setLoading(false);
        fetchStudents();
      }
    } catch (e) {
      toast.error(e);
      // console.error(t("toasterMessages.deleteFailure"), e);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current.focus();
  };

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
        } p-4`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <div className="px-4">
          <div className="flex justify-between">
            <div className="text-4xl font-semibold px-5 py-3">
              {t("studentList.students")}
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
                  : `${t("messages.student.class")} ${className} | ${t(
                      "messages.student.section"
                    )} ${sectionName}`}
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="flex justify-between w-full relative">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img src={Search} alt="" className="size-6" />
                </div>
                <input
                  type="text"
                  placeholder={t("teacherSetup.search")}
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
                  <th className="px-2 py-2 border border-gray-400">
                    {t("table.columns.sNo")}
                  </th>
                  {/* <th className=" py-2 border border-gray-400">
                      {t("studentDetails.fields.rollNumber")}
                    </th> */}
                  <th className=" py-2 border border-gray-400">
                    {t("studentDetails.fields.firstName")}
                  </th>
                  <th className=" py-2 border border-gray-400">
                    {t("studentDetails.fields.lastName")}
                  </th>
                  <th className=" w-36 py-2 border border-gray-400">
                    {t("studentDetails.fields.gender")}
                  </th>
                  <th className=" py-2 border border-gray-400">
                    {t("studentDetails.fields.guardianName")}
                  </th>
                  <th className=" py-2 border border-gray-400">
                    {t("studentDetails.fields.Phone")}
                  </th>
                  <th className="w-32 py-2 border border-gray-400">
                    {t("studentDetails.fields.Action")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal text-gray-900">
                {filteredStudents.map((student, index) => (
                  <tr key={student.SNo}>
                    <td
                      className={`${
                        isDarkMode ? "text-white" : ""
                      } px-2 py-2 font-bold text-center border text-sm border-[#c1c0ca] text-[#6d6ca7]`}
                    >
                      {student.SNo}
                    </td>
                    {/* <td className=" py-2 border text-sm border-[#c1c0ca]">
                        <input
                          type="text"
                          value={student.rollNumber}
                          onChange={(e) =>
                            handleInputChange(
                              student.SNo,
                              "rollNumber",
                              e.target.value
                            )
                          }
                          placeholder="Enter rollNumber"
                          className={`w-full h-full px-2 py-1  font-poppins-bold text-center border-none focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-900"
                          }`}
                          disabled={editSNo !== student.SNo}
                          autoFocus={editSNo === student.SNo}
                        />
                      </td> */}
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
                        placeholder={t("teacherSetup.enterFirstName")}
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
                        placeholder={t("teacherSetup.enterLastName")}
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
                        {/* <option value="">
                          {t("studentDetails.fields.GenderSelect")}
                        </option> */}
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
                        placeholder={t("teacherSetup.parentName")}
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
                        placeholder={t("teacherSetup.Phone")}
                        className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        disabled={editSNo !== student.SNo}
                      />
                    </td>
                    <td
                      className={`${
                        isDarkMode ? "text-white" : ""
                      } pl-3 pr-5 py-2 border border-gray-400`}
                    >
                      {editSNo === student.SNo ? (
                        <button
                          onClick={() => updateStudent(student)}
                          className="bg-[#464590] text-white font-poppins-regular py-1.5 px-3 rounded-xl w-full h-full"
                        >
                          {t("buttons.save")}
                        </button>
                      ) : (
                        <div className="flex justify-around">
                          <button
                            // onClick={() =>
                            //   navigate("/student-update", { state: student })
                            // }
                            onClick={() => handleEdit(student.SNo)}
                          >
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
                <tr>
                  <td className="px-2 py-2 text-center text-[#6d6ca7] font-bold border border-[#c1c0ca]">
                    {students.length + 1}
                  </td>
                  {/* <td className=" py-2 border border-[#c1c0ca]">
                      <input
                        type="text"
                        value={newStudent.rollNumber}
                        onChange={(e) =>
                          handleInputChange(
                            null,
                            "rollNumber",
                            e.target.value
                          )
                        }
                        placeholder="Enter Roll Number"
                        className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        ref={newStudentRollNoRef}
                      />
                    </td> */}
                  <td className=" py-2 border border-[#c1c0ca]">
                    <input
                      type="text"
                      value={newStudent.firstname}
                      onChange={(e) =>
                        handleInputChange(null, "firstname", e.target.value)
                      }
                      placeholder={t("teacherSetup.enterFirstName")}
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
                      placeholder={t("teacherSetup.enterLastName")}
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
                        {t("studentDetails.fields.GenderSelect")}
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
                      placeholder={t("teacherSetup.guardianName")}
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
                      placeholder={t("teacherSetup.Phone")}
                      className={`w-full h-full px-2 py-1 font-poppins-bold text-center  border-none focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </td>
                  <td className="px-2 py-2 border border-[#c1c0ca]">
                    <button
                      onClick={registerStudent}
                      className="bg-[#464590] text-white font-poppins-regular text-[16] py-1.5 px-3 rounded-xl w-full h-full"
                    >
                      {t("studentDetails.fields.addStudent")}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            {validationError !== "" && (
              <div className="text-red-500 text-center mt-2">
                {validationError}
              </div>
            )}
          </div>
        </div>
      </div>
      {studentInfoModelOpen && (
        <StudentInfo
          modelOpen={setStudentInfoModelOpen}
          currStudent={currStudent}
        />
      )}
      {showDeleteConfirmation && (
        <DeletePopup
          isVisible={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onDelete={handleDelete}
        />
      )}
      {popupVisible && (
        <ConformationPopup
          isVisible={popupVisible}
          onClose={() => setPopupVisible(false)}
          submit={handleRegisterStudent}
        />
      )}
    </div>
  );
}
