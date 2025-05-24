import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import PaginationItem from "@mui/material/PaginationItem";
import infow from "../../assets/images/info.png";
import crossw from "../../assets/images/cross.png";
import Searchw from "../../assets/images/Search.png";
import clearw from "../../assets/images/clear.png";
import info from "../../assets/images/darkmode/info.png";
import cross from "../../assets/images/darkmode/cross.png";
import Search from "../../assets/images/darkmode/Search.png";
import clear from "../../assets/images/darkmode/clear.png";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
} from "@mui/material";
import { axiosClient } from "../../services/axiosClient";
import noDataFound from "../../assets/images/darkmode/noDataFound.png";
import EndPoints from "../../services/EndPoints";
import StudentInfo from "../classSetup/sectionStudents/StudentInfo";
import { useNavigate } from "react-router-dom";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import CONSTANT from "../../utils/constants";
import Breadcrumbs from "../BreadCrumbs";

export default function TransferCertificate() {
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

  // State variables for managing students, classes, and filters
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [name, setName] = useState("");
  const [sessionList, setSessionList] = useState([]);
  const [tab, setTab] = useState("TC");

  // State variables for loading and references
  const [loading, setLoading] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // Fetch initial data when the component is mounted
  useEffect(() => {
    if (id) {
      fetchStudents({});
    }
  }, [id]);

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
      : // : EndPoints.ADMIN.GET_STUDENT_LIST;
        EndPoints.ADMIN.SEARCH_STUDENT;

    // let query = `?admin=${id}&page=${pageNo}&limit=${limit}&include=parent,class,section`;
    let query = `?page=${pageNo}&limit=${limit}`;

    // Determine the query parameters based on the inputs
    if (searchName) {
      // query += `&firstname=${searchName}`;
      query += `&search=${searchName}`;
    }
    if (searchSection) {
      query += `&section=${searchSection}`;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get(`${url}${query}`);

      if (response?.statusCode === 200) {
        const { totalStudents, students } = response?.result;
        setTotalStudentCount(totalStudents);
        setStudentList(students);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
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
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(async () => {
      fetchStudents({ searchName: name, searchSection });
    }, 1000);
  }, [name]);

  /**
   * Show information modal for a specific student.
   * @param {Object} student - Selected student object.
   */
  const handleShowInfo = (student) => {
    setSelectedStudent(student);
    setOpenInfoModal(true);
  };

  /**
   * Redirect to apply TC page.
   * @param {Object} student - Selected student object.
   */
  const handleApplyTC = (student) => {
    navigate("/transfer-certificate-apply", { student });
  };

  /**
   * Clear all search filters and reset pagination.
   */
  const handleClear = () => {
    setName("");
    setPageNo(1);
    fetchStudents({});
  };
  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } p-6 flex-col`}
    >
      <Toaster />
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${
            isDarkMode ? "bg-background1" : "bg-whiteBackground"
          } opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } flex flex-col self-center w-full max-w-[100%] rounded-[16px] max-md:max-w-full min-h-[calc(100vh-72px)]`}
      >
        <div className={`px-14 py-6`}>
          <Breadcrumbs />
          <h1
            className={`text-2xl font-poppins-bold ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("titles.transferStudent")}
          </h1>
        </div>
        <div
          className={`flex flex-col self-center w-full font-medium max-w-full max-md:max-w-full`}
        >
          {/* Search Bar*/}
          <div
            className={`flex gap-5 max-md:flex-wrap pb-5 mb-5 mx-10 border-b-2 border-borderLine2`}
          >
            <div
              className={`flex flex-auto justify-around gap-3 text-md max-md:flex-wrap max-md:max-w-full`}
            >
              <div
                className={`flex flex-col grow shrink-0 justify-center items-start py-0.5 rounded-[14px] w-fit max-md:max-w-full max-md:hidden`}
              >
                <div className={`flex gap-2 rounded-3xl w-full`}>
                  <div className={`flex justify-between w-full space-x-2`}>
                    {/* session dropdown */}
                    <FormControl
                      size="medium"
                      sx={{
                        width: "200px",
                        border: "1px solid #2b2e4a40",
                        borderRadius: "14px",
                        backgroundColor: isDarkMode ? "" : "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "white !important",
                        },
                        "& .MuiInputBase-root": {
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiSvgIcon-root": {
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                      }}
                    >
                      <InputLabel
                        id="session-select-label"
                        sx={{
                          zIndex: 1,
                          backgroundColor: isDarkMode ? "" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                          fontSize: 16,
                          px: 0.5,
                        }}
                      >
                        session
                      </InputLabel>
                      <Select
                        labelId="class-select-label"
                        id="class-select"
                        value={sessionList}
                        onChange={(e) => {
                          setSessionList(e.target.value);
                        }}
                        data-testid="sessionlist"
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                              color: isDarkMode ? "#E3E8F3" : "black",
                            },
                          },
                        }}
                      >
                        <MenuItem
                          value={1}
                          sx={{
                            backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                            color: isDarkMode ? "#E3E8F3" : "black",
                            "&:hover": {
                              backgroundColor: isDarkMode
                                ? "#2a2a2a"
                                : "#E9EEF2",
                            },
                          }}
                        >
                          2024-2025
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* Search Bar */}
                    <div
                      className={`flex px-3 rounded-[14px] w-full shadow-sm border ${
                        isDarkMode ? "border-borderLine" : "border-borderGray2"
                      }`}
                    >
                      <div
                        className={`flex items-center pl-3 pointer-events-none`}
                      >
                        <img
                          src={isDarkMode ? Search : Searchw}
                          alt=""
                          className={`w-7 h-7`}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder={t("placeholders.search")}
                        className={`focus:outline-none pl-3 w-full bg-transparent ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        }`}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                        value={name}
                      />
                      {name && (
                        <button
                          type="button"
                          onClick={() => setName("")}
                          className={`flex items-center`}
                        >
                          <img
                            src={isDarkMode ? cross : crossw}
                            alt=""
                            className={`${
                              isDarkMode ? "size-4 mr-2" : "size-8"
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Clear button */}
                    <button
                      className={`${
                        isDarkMode
                          ? "hover:bg-background4 border-borderLine"
                          : "hover:bg-whiteBackground1 border-borderGray2"
                      } border w-20 text-lg rounded-[14px] flex items-center justify-center`}
                      onClick={handleClear}
                    >
                      <img
                        src={isDarkMode ? clear : clearw}
                        alt="Clear"
                        className={`w-6 h-6`}
                      />
                    </button>

                    <div
                      onClick={() => setTab("TC")}
                      className={`flex items-center cursor-pointer text-base font-bold w-[200px] ${
                        tab === "TC" ? "border-b-4 border-borderOrange1 " : ""
                      } ${isDarkMode ? "text-textPrimary" : "text-textBlack"} `}
                    >
                      Recently Deleted
                    </div>
                    <div
                      onClick={() => setTab("ALUMNI")}
                      className={`flex items-center  cursor-pointer text-base font-bold ${
                        tab === "ALUMNI"
                          ? "border-b-4 border-borderOrange1 font-bold"
                          : ""
                      } ${isDarkMode ? "text-textPrimary" : "text-textBlack"} `}
                    >
                      Alumni
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {studentList?.length > 0 ? (
            <>
              <div className={`overflow-x-auto relative h-[400px] mx-10`}>
                <table
                  className={`${
                    isDarkMode ? "" : "bg-whiteBackground"
                  } min-w-full border-separate border-spacing-0`}
                >
                  {/* table headings */}
                  <thead
                    className={`${
                      isDarkMode
                        ? "bg-backgroundTableCell"
                        : "bg-whiteBackground"
                    } text-base font-bold sticky top-0 z-10`}
                  >
                    <tr className={`text-base text-bold text-textBlue`}>
                      <th
                        className={`text-center px-4 py-2 max-sm:hidden border border-borderLine2 bg-clip-padding`}
                      >
                        {t("labels.fullName")}
                      </th>
                      <th
                        className={`text-center px-4 py-2 max-xl:hidden border border-borderLine2 bg-clip-padding`}
                      >
                        {t("labels.gender")}
                      </th>
                      <th
                        className={`text-center px-4 py-2 max-md:hidden border border-borderLine2 bg-clip-padding`}
                      >
                        {t("labels.phoneNumber")}
                      </th>
                      <th
                        className={`text-center px-4 py-2 max-lg:hidden border border-borderLine2 bg-clip-padding`}
                      >
                        {t("labels.email")}
                      </th>
                      <th
                        className={`text-center px-4 py-2 max-lg:hidden border border-borderLine2 bg-clip-padding`}
                      >
                        {t("labels.class")}
                      </th>
                      <th
                        className={`text-center px-4 py-2 border border-borderLine2 bg-clip-padding`}
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
                              ? ""
                              : "bg-whiteBackground3"
                            : ""
                        } border-t `}
                        key={i}
                      >
                        <td
                          className={`p-4 text-center text-sm font-medium border border-borderLine2 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } max-sm:hidden`}
                        >
                          {student?.firstname} {student?.lastname}
                        </td>
                        <td
                          className={`p-4 text-center text-sm font-medium border border-borderLine2 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } max-xl:hidden`}
                        >
                          {student?.gender}
                        </td>
                        <td
                          className={`p-4 text-center text-sm font-medium border border-borderLine2 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } max-md:hidden`}
                        >
                          {student?.parentDetails?.phone}
                        </td>
                        <td
                          className={`p-4 text-center text-sm font-medium border border-borderLine2 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } max-lg:hidden`}
                        >
                          {student?.parentDetails?.email || CONSTANT.NA}
                        </td>
                        <td
                          className={`p-4 text-center text-sm font-medium border border-borderLine2 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } max-lg:hidden`}
                        >
                          {`${student?.classDetails?.name || ""} ${
                            student?.sectionDetails?.name || CONSTANT.NA
                          }`}
                        </td>
                        {/* Action Buttons */}
                        <td
                          className={`p-4 text-center font-medium border border-borderLine2 ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          }`}
                        >
                          <div className={`flex justify-center`}>
                            <button onClick={() => handleShowInfo(student)}>
                              <img
                                src={isDarkMode ? info : infow}
                                alt="infoStudent"
                                className={`size-5`}
                              />
                            </button>
                            <button
                              onClick={() => handleApplyTC(student)}
                              className="bg-blue-600 text-white px-4 py-1 rounded-lg ml-2 font-bold"
                            >
                              {t("buttons.applyTC")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* pagination logic */}
                <div
                  className={`flex gap-5 justify-between items-center my-9 mx-10 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full`}
                >
                  <div className={`text-[#9391a5] text-base leading-5`}>
                    {t("titles.showing")}
                    <span className={`text-textBlue`}>
                      {" "}
                      {pageNo * limit - (limit - 1)} -{" "}
                      {Math.min(totalStudentCount, pageNo * limit)}{" "}
                    </span>
                    {t("titles.from")}
                    <span className={`text-textBlue`}>
                      {" "}
                      {totalStudentCount}{" "}
                    </span>
                    {t("titles.data")}
                  </div>

                  <div className={`flex items-center gap-4`}>
                    {/* Dropdown to select how many data per page */}
                    <FormControl
                      variant="outlined"
                      size="small"
                      sx={{
                        border: "1px solid #2b2e4a40",
                        borderRadius: "6px",
                        minWidth: "80px",
                        backgroundColor: isDarkMode ? "" : "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputBase-root, & .MuiSvgIcon-root": {
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                      }}
                    >
                      <Select
                        value={limit}
                        onChange={(e) => {
                          setLimit(e.target.value);
                          setPageNo(1);
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                              color: isDarkMode ? "#E3E8F3" : "black",
                            },
                          },
                        }}
                      >
                        {[10, 20, 25, 50, 100].map((itm, i) => (
                          <MenuItem
                            key={i}
                            value={itm}
                            sx={{
                              backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                              color: isDarkMode ? "#E3E8F3" : "black",
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? "#2a2a2a"
                                  : "#E9EEF2",
                              },
                            }}
                          >
                            {itm}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

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
                              color: isDarkMode ? "white" : "black",
                              borderColor:
                                item.type === "previous" || item.type === "next"
                                  ? "transparent"
                                  : "#0F4189",
                              borderWidth: "2px",
                              borderRadius: "20px",
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
              </div>
            </>
          ) : (
            <>
              {/* no student */}
              <div
                className={`flex flex-col items-center justify-center text-center pb-6`}
              >
                <img
                  src={noDataFound}
                  className={`mb-4 h-[200px] w-[250px] object-contain`}
                />
                <p
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } text-2xl font-bold `}
                >
                  {t("titles.message")}
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } text-sm`}
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
      </div>
    </div>
  );
}
