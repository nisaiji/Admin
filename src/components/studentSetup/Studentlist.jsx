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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const id = useSelector((state) => state.appAuth.id);

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalStudentCount, setTotalStudentCount] = useState(5);

  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [idForDelete, setIdForDelete] = useState();
  const [name, setName] = useState("");

  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [searchClass, setSearchClass] = useState(
    () => localStorage.getItem("searchClass") || ""
  );
  const [searchSection, setSearchSection] = useState(
    () => localStorage.getItem("searchSection") || ""
  );

  const [loading, setLoading] = useState(false);

  const classRef = useRef(searchClass);
  const sectionRef = useRef(searchSection);

  useEffect(() => {
    if (id) {
      getClassList();
      fetchStudents({});
    }
  }, [id, pageNo]);

  // Update section list when class changes
  useEffect(() => {
    if (searchClass && classList.length > 0) {
      const classData = classList.find((itm) => itm["_id"] === searchClass);
      setSectionList(classData?.section || []);
    }
  }, [searchClass, classList]);

  // Sync local storage and fetch section-wise students when searchSection changes
  useEffect(() => {
    localStorage.setItem("searchClass", searchClass);
    localStorage.setItem("searchSection", searchSection);
    classRef.current = searchClass;
    sectionRef.current = searchSection;
    fetchStudents({ searchSection });
  }, [searchSection]);

  // Generalized function to fetch students based on different conditions
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
    } else if (searchSection) {
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

  // Fetch class list
  const getClassList = async () => {
    try {
      const res = await axiosClient.get(EndPoints.COMMON.CLASS_LIST);
      setClassList(res.result);
    } catch (e) {
      toast.error(e);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => setPageNo(value);

  // Handle search
  const handleSearch = () => fetchStudents({ searchName: name });

  // Show student info
  const handleShowInfo = (student) => {
    setSelectedStudent(student);
    setOpenInfoModal(true);
  };

  // Clear search filters
  const handleClear = () => {
    setName("");
    setSearchClass("");
    setSearchSection("");
    fetchStudents({});
  };

  // Handle student deletion
  const handleDelete = (studentId) => {
    setIdForDelete(studentId);
    setDeleteConfirmModal(true);
  };

  // Confirm student deletion
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
        } flex flex-col self-center w-full max-w-[95%] my-10 rounded  max-md:max-w-full min-h-screen`}
      >
        <h1 className="text-4xl px-14 py-5 font-poppins-bold ">
          {t("titles.students")}
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
                      className={`${
                        isDarkMode ? "bg-blue-950" : ""
                      } w-[200px] mr-[10px]`}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ zIndex: 1, backgroundColor: "white" }}
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
                      className={`${
                        isDarkMode ? "bg-blue-950" : ""
                      } mx-2 w-[200px] mr-[10px]`}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        className="bg-white mr-[10px]"
                      >
                        {t("titles.section")}
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={searchSection}
                        onChange={(e) => {
                          setSearchSection(e.target.value);
                        }}
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
                    <input
                      type="text"
                      placeholder={t("placeholders.search")}
                      className={`${
                        isDarkMode ? " bg-[#0D192F] text-white" : ""
                      } px-3 rounded-lg focus:outline-none w-full shadow-sm border border-t-gray`}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      value={name}
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
                  {/* table headings */}
                  <thead>
                    <tr className="text-base  text-[#686868BF]">
                      <th
                        className={`${
                          isDarkMode ? "text-white" : ""
                        } text-center px-4 py-2 max-sm:hidden`}
                      >
                        {t("labels.firstName")}
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
                              : "bg-[#4645900D]"
                            : ""
                        } border-t `}
                        key={i}
                      >
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
                          {student?.parentDetails?.phone}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center max-lg:hidden`}
                        >
                          {student?.parentDetails?.email || CONSTANT.NA}
                        </td>
                        <td
                          className={`${
                            isDarkMode ? "text-white" : "text-[#1E1E1E]"
                          } p-4 text-center max-lg:hidden`}
                        >
                          {student?.bloodGroup || CONSTANT.NA}
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
                {/* pagination logic */}
                <div className="flex gap-5 justify-between items-start my-9 mx-10 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                  <div className="mt-4 text-blue-950">
                    <span
                      className={`${
                        isDarkMode ? "text-white" : "text-[#87A0C4]"
                      } leading-5 `}
                    >
                      {t("titles.showing")}
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
                      {t("titles.from")}
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
