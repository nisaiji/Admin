import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import PaginationItem from "@mui/material/PaginationItem";
import info from "../../assets/images/info.png";
import edit2 from "../../assets/images/edit2.png";
import delete2 from "../../assets/images/delete2.png";
import ellipse from "../../assets/images/ellipse.png";
import searchp from "../../assets/images/searchp.png";
import clear from "../../assets/images/clear.png";
import {
  Modal,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
} from "@mui/material";
import { axiosClient } from "../../services/axiosClient";
import nostudent from "../../assets/images/nostudent.png";
import EndPoints from "../../services/EndPoints";
import StudentInfo from "../classSetup/sectionStudents/StudentInfo";
import { useNavigate } from "react-router-dom";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";

export default function Studentlist() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [totalStudentCount, setTotalStudentCount] = useState(5);
  const [limit, setLimit] = useState(5);
  const [studentList, setStudentList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [idForDelete, setIdForDelete] = useState();
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [searchClass, setSearchClass] = useState(
    () => localStorage.getItem("searchClass") || ""
  );
  const [searchSection, setSearchSection] = useState(
    () => localStorage.getItem("searchSection") || ""
  );
  const [searchStudentName, setSearchStudentName] = useState("");
  const [loading, setLoading] = useState(false);

  const classRef = useRef(searchClass);
  const sectionRef = useRef(searchSection);

  useEffect(() => {
    getClassList();
    getStudent();
  }, [pageNo]);

  useEffect(() => {
    if (searchClass && classList.length > 0) {
      const classData = classList.find((itm) => itm["_id"] === searchClass);
      setSectionList(classData?.section || []);
    }
  }, [searchClass, classList]);

  useEffect(() => {
    localStorage.setItem("searchClass", searchClass);
    localStorage.setItem("searchSection", searchSection);
    // console.log("c", searchClass);
    // console.log("s", searchSection);
    classRef.current = searchClass;
    sectionRef.current = searchSection;
    getStudentsListSectionWise();
  }, [searchSection]);

  const getStudent = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.ALL_STUDENT_LIST;
    else url = EndPoints.ADMIN.ALL_STUDENT_LIST;
    try {
      setLoading(true);
      const response = await axiosClient.get(`${url}/${pageNo}`);
      if (response?.statusCode === 200) {
        const { totalCount, studentList, limit } = response?.result;
        setTotalStudentCount(totalCount);
        setLimit(limit);
        setStudentList(studentList);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentSearchWise = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.STUDENT_LIST_SEARCH_WISE;
    else url = EndPoints.ADMIN.STUDENT_LIST_SEARCH_WISE;
    try {
      setLoading(true);
      const response = await axiosClient.get(`${url}/${searchInput}`);
      if (response?.statusCode === 200) {
        const { totalCount, result, limit } = response;
        setTotalStudentCount(totalCount);
        setLimit(limit);
        setStudentList(result);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentsListSectionWise = async () => {
    try {
      if (searchSection !== "") {
        const sectionId = searchSection;
        // console.log('sectionid',sectionId);
        let url;
        if (isTeacher) url = EndPoints.TEACHER.STUDENT_LIST_SECTION_WISE;
        else url = EndPoints.ADMIN.STUDENT_LIST_SECTION_WISE;
        setLoading(true);
        const studentList = await axiosClient.get(`${url}/${sectionId}`);
        if (studentList?.statusCode === 200) {
          setTotalStudentCount(studentList?.result?.totalCount);
          setLimit(studentList?.result?.limit);
          setStudentList(studentList?.result?.studentList);
        }
      }
    } catch (e) {
      // console.error("error in fetching student", e);
    } finally {
      setLoading(false);
    }
  };

  const getClassList = async () => {
    try {
      const classes = await axiosClient.get(EndPoints.COMMON.CLASS_LIST);
      setClassList(classes.result);
    } catch (error) {
      // console.log(error);
    }
  };

  const handlePageChange = (event, value) => {
    setPageNo(value);
  };

  const handleSearch = () => {
    // const searchInputLower = searchInput.toLowerCase();
    // const searchedStudent = studentList.filter(
    //   (itm) => itm.firstname.toLowerCase() === searchInputLower
    // );
    getStudentSearchWise();
  };

  const handleShowInfo = (student) => {
    setSelectedStudent(student);
    setOpenInfoModal(true);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchClass("");
    setSearchSection("");
    getStudent();
  };

  const handleDelete = (studentId) => {
    setIdForDelete(studentId);
    setDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      let url;
      if (isTeacher) url = EndPoints.TEACHER.DELETE_STUDENT;
      else url = EndPoints.ADMIN.DELETE_STUDENT;
      let response = await axiosClient.delete(`${url}/${idForDelete}`);
      // console.log("r", response);
      if (response?.statusCode === 200) {
        getStudent();
        toast.success(t("studentList.toasterMessages.deleteSuccess"));
      }
    } catch (error) {
      // console.log(error);
      toast.error(t("studentList.toasterMessages.deleteFailure"));
    }
    setIdForDelete("");
    setDeleteConfirmModal(false);
    setSelectedStudent([]);
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#112138]" : "bg-[#8A89FA1A]"
      } flex flex-col`}
    >
      <Toaster />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode ? "bg-blue-950" : " bg-sky-950"
        } flex flex-col justify-center w-full max-md:max-w-full`}
      />
      <div
        className={`${
          isDarkMode ? "bg-[#112138]" : "bg-white"
        } flex flex-col self-center w-full max-w-[95%] my-10 rounded  max-md:max-w-full`}
      >
        <h1 className="text-4xl px-14 py-5 font-poppins-bold ">
          {t("dashboard.students")}
        </h1>
        <div className="flex flex-col self-center w-full font-medium max-w-full max-md:max-w-full">
          {/* Search Bar*/}
          <div className="flex pl-4 gap-5 h-10 mt-5 max-md:flex-wrap max-md:mt-10 mb-10">
            <div className="flex flex-auto justify-around gap-3 text-lg text-sky-950 max-md:flex-wrap max-md:max-w-full">
              <div
                className={`flex flex-col grow shrink-0 justify-center items-start py-0.5 rounded basis-0 w-fit max-md:max-w-full max-md:hidden`}
              >
                <div className="flex gap-2 px-10 py-3.5 rounded-3xl w-full">
                  <div className="flex justify-between w-full">
                    <FormControl
                      size="medium"
                      className={`${isDarkMode ? "bg-blue-950" : ""}`}
                      style={{ width: "200px", marginRight: "10px" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{
                          zIndex: 1,
                          backgroundColor: isDarkMode ? "#1E3A8A" : "white",
                        }}
                      >
                        {t("dashboard.class")}
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={searchClass}
                        onChange={(e) => {
                          setSearchClass(e.target.value);
                          const classData = classList.filter(
                            (itm) => itm["_id"] === e.target.value
                          );
                          setSectionList(classData[0]["section"]);
                        }}
                        style={{ paddingTop: "0px" }}
                      >
                        {classList
                          .sort((a, b) => {
                            const classA = parseInt(
                              a.name.replace(/\D/g, ""),
                              10
                            );
                            const classB = parseInt(
                              b.name.replace(/\D/g, ""),
                              10
                            );
                            return classA - classB;
                          })
                          .map((itm) => (
                            <MenuItem key={itm["_id"]} value={itm["_id"]}>
                              {itm.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      size="medium"
                      className={`${isDarkMode ? "bg-blue-950" : ""} mx-2`}
                      style={{ width: "200px", marginRight: "10px" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{
                          zIndex: 1,
                          backgroundColor: isDarkMode ? "#1E3A8A" : "white",
                          padding: "0 0px",
                          marginRight: "10px",
                        }}
                      >
                        {t("dashboard.section")}
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={searchSection}
                        onChange={(e) => {
                          setSearchSection(e.target.value);
                        }}
                        style={{ paddingTop: "0px" }}
                      >
                        {sectionList.map((itm) => {
                          return (
                            <MenuItem key={itm["_id"]} value={itm["_id"]}>
                              {itm.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>

                    {/* <FormControl
                      size="medium"
                      className={`${
                        isDarkMode ? "bg-blue-950" : ""
                      } mx-2 shadow-sm`}
                      style={{
                        width: "200px",
                        marginRight: "10px",
                        border: "none",
                      }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginRight: "100px" }}
                      >
                        B. group
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={searchSection}
                        label="B. group"
                        onChange={(e) => {
                          setSearchSection(e.target.value);
                        }}
                        style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
                      >
                        {bloodGroupList.map((group) => (
                          <MenuItem key={group} value={group}>
                            {group}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl> */}

                    <input
                      type="text"
                      placeholder={t("studentList.search.placeholder")}
                      className={`${
                        isDarkMode ? " bg-[#0D192F] text-white" : ""
                      } px-3 rounded-lg focus:outline-none w-full shadow-sm border border-t-gray`}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                      }}
                      value={searchInput}
                    />
                    <button
                      className="bg-[#e3e3ee] text-white hover:bg-white hover:border-2 hover:border-blue-950 ml-2 w-20 text-lg rounded-md flex items-center justify-center"
                      onClick={handleSearch}
                      loading="lazy"
                    >
                      <img src={searchp} alt="Search" className="w-6 h-6" />
                    </button>
                    <button
                      className="bg-[#e3e3ee] text-white hover:bg-white hover:border-blue-950 hover:border-2 ml-2 w-20 text-lg rounded-md flex items-center justify-center"
                      onClick={handleClear}
                    >
                      <img src={clear} alt="Clear" className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {studentList?.length > 0 ? (
            <>
              <div className="w-full max-md:max-w-full">
                <table
                  className={`${
                    isDarkMode ? "bg-[#0D192F]" : "bg-white"
                  } w-full mt-6 px-10 max-md:max-w-full`}
                >
                  <thead>
                    <tr className="text-base  text-[#686868BF]">
                      {/* <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2`}
                      >
                        {t("studentDetails.fields.rollNumber")}
                      </th> */}
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-sm:hidden`}
                      >
                        {t("studentDetails.fields.firstName")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-xl:hidden`}
                      >
                        {t("studentDetails.fields.gender")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-md:hidden`}
                      >
                        {t("studentDetails.fields.Phone")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-lg:hidden`}
                      >
                        {t("studentDetails.fields.email")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-lg:hidden`}
                      >
                        {t("studentDetails.fields.bloodGroup")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2`}
                      >
                        {t("studentDetails.fields.Action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentList.map((student, i) => (
                      <tr
                        className={`${
                          i % 2 === 0
                            ? isDarkMode
                              ? "bg-[#0D2137]"
                              : "bg-[#4645900D]"
                            : ""
                        } border-t `}
                        key={i}
                      >
                        {/* <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#303972]"
                          } p-4 text-center`}
                        >
                          #{student?.rollNumber}
                        </td> */}
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center max-sm:hidden`}
                        >
                          {student?.firstname}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center text-blue-950 max-xl:hidden`}
                        >
                          {student?.gender}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center max-md:hidden`}
                        >
                          {student?.parent?.phone}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center max-lg:hidden`}
                        >
                          {student?.parent?.email || "N/A"}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center max-lg:hidden`}
                        >
                          {student?.parent?.bloodGroup || "N/A"}
                        </td>
                        {/* Action Icons */}
                        <td
                          className={`${
                            isDarkMode ? "text-white" : ""
                          } p-4 text-center`}
                        >
                          <div className="flex justify-around">
                            <button
                              onClick={() =>
                                navigate("/student-update", {
                                  state: student,
                                })
                              }
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
                            <button onClick={() => handleDelete(student._id)}>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {searchSection === "" && (
                  <div className="flex gap-5 justify-between items-start my-9 mx-10 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                    <div className="mt-4 text-blue-950">
                      <span
                        className={`${
                          isDarkMode ? "text-white" : "text-[#87A0C4]"
                        } leading-5 `}
                      >
                        {t("studentList.showing")}
                      </span>{" "}
                      <span
                        className={`${
                          isDarkMode ? "text-white" : "text-[#152259]"
                        } leading-5 `}
                      >
                        {pageNo * limit - (limit - 1)} -{" "}
                        {Math.min(totalStudentCount, pageNo * limit)}
                      </span>
                      <span
                        className={`${
                          isDarkMode ? "text-white" : "text-[#87A0C4]"
                        } leading-5 `}
                      >
                        {" "}
                        {t("studentList.from")}
                      </span>{" "}
                      <span
                        className={`${
                          isDarkMode ? "text-white" : "text-[#152259]"
                        } leading-5 `}
                      >
                        {totalStudentCount}
                      </span>
                      <span
                        className={`${
                          isDarkMode ? "text-white" : "text-[#87A0C4]"
                        } leading-5 `}
                      >
                        {" "}
                        {t("studentList.data")}
                      </span>
                    </div>
                    <Stack spacing={2}>
                      <Pagination
                        count={Math.ceil(totalStudentCount / limit)}
                        shape="rounded"
                        page={pageNo}
                        onChange={handlePageChange}
                        renderItem={(item) => (
                          <PaginationItem
                            {...item}
                            sx={{
                              color: isDarkMode ? "white" : "#464590",
                              borderColor:
                                item.type === "previous" || item.type === "next"
                                  ? "transparent"
                                  : "#464590",
                              borderWidth: "2px",
                              borderStyle: "solid",
                              "&.Mui-selected": {
                                color: "white",
                                backgroundColor: "#464590",
                              },
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center text-center pb-6">
                <img src={nostudent} className="mb-4 size-52" />
                <p
                  className={`${
                    isDarkMode ? "text-white" : "text-blue-950"
                  } text-2xl font-bold `}
                >
                  {t("studentList.message")}
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-white" : "text-blue-950"
                  }  text-sm`}
                >
                  {t("studentList.subMessage")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Info Popup */}
        {openInfoModal && (
          <StudentInfo
            modelOpen={setOpenInfoModal}
            currStudent={selectedStudent}
          />
        )}

        {deleteConfirmModal && (
          <DeletePopup
            isVisible={deleteConfirmModal}
            onClose={() => setDeleteConfirmModal(false)}
            onDelete={handleConfirmDelete}
          />
        )}
      </div>
    </div>
  );
}
