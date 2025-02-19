import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import PaginationItem from "@mui/material/PaginationItem";
import info from "../../assets/images/info.png";
import edit2 from "../../assets/images/edit2.png";
import delete2 from "../../assets/images/delete2.png";
import Search from "../../assets/images/Search.png";
import clear from "../../assets/images/clear.png";
import {
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
import CONSTANT from "../../utils/constants";

export default function Studentlist() {
  // Import necessary modules and hooks
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redux selectors to fetch required state
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const id = useSelector((state) => state.appAuth.id);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // State variables for pagination, modal visibility, and student data
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalStudentCount, setTotalStudentCount] = useState(5);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  // State variables for managing students, classes, and filters
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [idForDelete, setIdForDelete] = useState();
  const [name, setName] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [searchClass, setSearchClass] = useState(
    () => localStorage.getItem("searchClass") || ""
  );
  const [searchSection, setSearchSection] = useState(
    () => localStorage.getItem("searchSection") || ""
  );

  // State variables for loading and references
  const [loading, setLoading] = useState(false);
  const classRef = useRef(searchClass);
  const sectionRef = useRef(searchSection);

  // Fetch initial data when the component is mounted
  useEffect(() => {
    if (id) {
      getClassList();
      fetchStudents({});
    }
  }, [id]);

  // Update section list when the selected class changes
  useEffect(() => {
    if (searchClass && classList.length > 0) {
      const classData = classList.find((itm) => itm["_id"] === searchClass);
      setSectionList(classData?.section || []);
    }
  }, [searchClass, classList]);

  // Sync local storage and fetch students when the section filter changes
  useEffect(() => {
    localStorage.setItem("searchClass", searchClass);
    localStorage.setItem("searchSection", searchSection);
    classRef.current = searchClass;
    sectionRef.current = searchSection;
    fetchStudents({ searchSection });
  }, [searchSection, pageNo]);

  /**
   * Fetch students based on filters and pagination.
   * @param {Object} params - Contains searchName and searchSection.
   */
  const fetchStudents = async ({ searchName = "", searchSection = "" }) => {
    if (!id) {
      return;
    }

    const url = isTeacher
      ? EndPoints.TEACHER.GET_STUDENT_LIST
      : EndPoints.ADMIN.GET_STUDENT_LIST;

    let query = `?admin=${id}&page=${pageNo}&limit=${limit}&include=parent,class,section`;

    // Determine the query parameters based on the inputs
    if (searchName) {
      query += `&firstname=${searchName}`;
    }
    if (searchSection) {
      query += `&section=${searchSection}`;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get(`${url}${query}`);

      if (response?.statusCode === 200) {
        const { totalStudents, students, pageSize } = response?.result;
        setTotalStudentCount(totalStudents);
        setLimit(pageSize);
        setStudentList(students);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch the list of classes from the API.
   */
  const getClassList = async () => {
    try {
      const res = await axiosClient.get(EndPoints.COMMON.CLASS_LIST);
      setClassList(res.result);
    } catch (e) {
      toast.error(e);
    }
  };

  /**
   * Handle page change for pagination.
   * @param {Object} event - Event object.
   * @param {number} value - New page number.
   */
  const handlePageChange = (event, value) => setPageNo(value);

  /**
   * Handle student search based on name and section.
   */
  const handleSearch = () => fetchStudents({ searchName: name, searchSection });

  /**
   * Show information modal for a specific student.
   * @param {Object} student - Selected student object.
   */
  const handleShowInfo = (student) => {
    setSelectedStudent(student);
    setOpenInfoModal(true);
  };

  /**
   * Clear all search filters and reset pagination.
   */
  const handleClear = () => {
    setName("");
    setSearchClass("");
    setSearchSection("");
    setPageNo(1);
    fetchStudents({});
  };

  /**
   * Trigger delete confirmation modal for a student.
   * @param {string} studentId - ID of the student to be deleted.
   */
  const handleDelete = (studentId) => {
    setIdForDelete(studentId);
    setDeleteConfirmModal(true);
  };

  /**
   * Confirm and delete a student from the list.
   */
  const handleConfirmDelete = async () => {
    const url = isTeacher
      ? EndPoints.TEACHER.DELETE_STUDENT
      : EndPoints.ADMIN.DELETE_STUDENT;

    try {
      const res = await axiosClient.delete(`${url}/${idForDelete}`);
      if (res?.statusCode === 200) {
        fetchStudents({});
        toast.success(res.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setIdForDelete("");
      setDeleteConfirmModal(false);
      setSelectedStudent([]);
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#112138]" : "bg-[#93a3b6]/25"
      } flex px-6 flex-col`}
    >
      <Toaster />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] opacity-50 z-30">
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
          isDarkMode ? "bg-[#112138]" : "bg-[#fafafa]"
        } flex flex-col self-center w-full max-w-[100%] my-4 rounded-[16px] max-md:max-w-full min-h-screen`}
      >
        <h1 className="text-2xl px-14 py-6 font-poppins-bold ">
          {t("titles.students")}
        </h1>
        <div className="flex flex-col self-center w-full font-medium max-w-full max-md:max-w-full">
          {/* Search Bar*/}
          <div className="flex pl-4 gap-5 h-10 mt-5 max-md:flex-wrap max-md:mt-10 mb-10">
            <div className="flex flex-auto justify-around gap-3 text-md text-[#686868]/75 max-md:flex-wrap max-md:max-w-full">
              <div
                className={`flex flex-col grow shrink-0 justify-center items-start py-0.5 rounded-[14px]  basis-0 w-fit max-md:max-w-full max-md:hidden`}
              >
                <div className="flex gap-2 px-10 py-3.5 rounded-3xl w-full">
                  <div className="flex justify-between w-full">
                    {/* class select dropdown */}
                    <FormControl
                      size="medium"
                      className={`${
                        isDarkMode ? "bg-blue-950" : ""
                      } w-[150px] mr-[10px] rounded-[14px]`}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{
                          zIndex: 1,
                          backgroundColor: "white",
                          fontSize: 16,
                        }}
                      >
                        {t("titles.class")}
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
                        data-testid="classlist"
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

                    {/* section select dropdown */}
                    <FormControl
                      size="medium"
                      sx={{ marginX: 1 }}
                      className={`${
                        isDarkMode ? "bg-blue-950" : ""
                      } mx-2 w-[150px] mr-[10px] rounded-[14px]`}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        className=" mr-[10px] text-[14px] bg-white"
                      >
                        {t("titles.section")}
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={searchSection}
                        onChange={(e) => {
                          setSearchSection(e.target.value);
                          setPageNo(1);
                        }}
                        data-testid="sectionlist"
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
                    {/* search Bar */}
                    <div className="flex px-3 rounded-[14px]  mx-2 w-full max-w-[800px] shadow-sm border border-t-gray">
                      <div className=" flex items-center pl-3 pointer-events-none">
                        <img src={Search} alt="" className="size-5" />
                      </div>
                      <input
                        type="text"
                        placeholder={t("placeholders.search")}
                        className="focus:outline-none pl-3 w-full bg-[#fafafa]"
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                        value={name}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                          }
                        }}
                      />
                    </div>
                    {/* clear button */}
                    <button
                      className="hover:bg-[#E9EEF2]/50 text-white bg-white hover:border-[#E9EEF2] hover:border-2 ml-2 w-20 text-lg rounded-md flex items-center justify-center"
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
                    isDarkMode ? "bg-[#0D192F]" : "bg-[#fafafa]"
                  } w-full mt-6 px-10 max-md:max-w-full`}
                >
                  {/* table headings */}
                  <thead>
                    <tr className="text-base text-[#0F4189]/75">
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-sm:hidden`}
                      >
                        {t("labels.fullName")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-xl:hidden`}
                      >
                        {t("labels.gender")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-md:hidden`}
                      >
                        {t("labels.phoneNumber")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-lg:hidden`}
                      >
                        {t("labels.email")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-lg:hidden`}
                      >
                        {t("labels.bloodGroup")}
                      </th>
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2`}
                      >
                        {t("labels.action")}
                      </th>
                    </tr>
                  </thead>
                  {/* list of students */}
                  <tbody>
                    {studentList.map((student, i) => (
                      <tr
                        className={`${
                          i % 2 === 0
                            ? isDarkMode
                              ? "bg-[#0D2137]"
                              : "bg-[#E9EEF2]/50"
                            : ""
                        } border-t `}
                        key={i}
                      >
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center text-sm max-sm:hidden`}
                        >
                          {student?.firstname} {student?.lastname}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center text-sm text-blue-950 max-xl:hidden`}
                        >
                          {student?.gender}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center text-sm max-md:hidden`}
                        >
                          {student?.parentDetails?.phone}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center text-sm max-lg:hidden`}
                        >
                          {student?.parentDetails?.email || CONSTANT.NA}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center text-sm max-lg:hidden`}
                        >
                          {student?.bloodGroup || CONSTANT.NA}
                        </td>
                        {/* Action Buttons */}
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
                              <img src={edit2} alt="editStudent" className="size-5" />
                            </button>
                            <button onClick={() => handleShowInfo(student)}>
                              <img src={info} alt="infoStudent" className="size-5" />
                            </button>
                            <button onClick={() => handleDelete(student._id)}>
                              <img src={delete2} alt="deleteStudent" className="size-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* pagination logic */}
                <div className="flex gap-5 justify-between items-start my-9 mx-10 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                  <div className="mt-4 text-[#040320]">
                    <span
                      className={`${
                        isDarkMode ? "text-white" : "text-[#9391a5] text-xs"
                      } leading-5 `}
                    >
                      {t("titles.showing")}
                    </span>{" "}
                    <span
                      className={`${
                        isDarkMode ? "text-white" : "text-[#152259] text-xs"
                      } leading-5 `}
                    >
                      {pageNo * limit - (limit - 1)} -{" "}
                      {Math.min(totalStudentCount, pageNo * limit)}
                    </span>
                    <span
                      className={`${
                        isDarkMode ? "text-white" : "text-[#9391a5] text-xs"
                      } leading-5 `}
                    >
                      {" "}
                      {t("titles.from")}
                    </span>{" "}
                    <span
                      className={`${
                        isDarkMode ? "text-white" : "text-[#152259] text-xs"
                      } leading-5 `}
                    >
                      {totalStudentCount}
                    </span>
                    <span
                      className={`${
                        isDarkMode ? "text-white" : "text-[#9391a5] text-xs"
                      } leading-5 `}
                    >
                      {" "}
                      {t("titles.data")}
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
                            color: isDarkMode ? "white" : "#0F4189",
                            borderColor:
                              item.type === "previous" || item.type === "next"
                                ? "transparent"
                                : "#0F4189",
                            borderWidth: "2px",
                            borderStyle: "solid",
                            "&.Mui-selected": {
                              color: "white",
                              backgroundColor: "#0F4189",
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* no student */}
              <div className="flex flex-col items-center justify-center text-center pb-6">
                <img src={nostudent} className="mb-4 size-52" />
                <p
                  className={`${
                    isDarkMode ? "text-white" : "text-blue-950"
                  } text-2xl font-bold `}
                >
                  {t("titles.message")}
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-white" : "text-blue-950"
                  }  text-sm`}
                >
                  {t("titles.subMessage")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* student info modal */}
        {openInfoModal && (
          <StudentInfo
            modelOpen={setOpenInfoModal}
            currStudent={selectedStudent}
          />
        )}

        {/* delete confirmation popup */}
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
