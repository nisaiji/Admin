import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import delete2 from "../../assets/images/darkmode/delete.png";
import delete2w from "../../assets/images/delete2.png";
import edit2 from "../../assets/images/darkmode/edit.png";
import edit2w from "../../assets/images/edit2.png";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import cross from "../../assets/images/darkmode/cross.png";
import crossw from "../../assets/images/cross.png";
import ConformationPopup from "../ConformationPopup";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import moment from "moment";

function Addsection({
  isVisible,
  setAddSectionModelOpen,
  clickedClassId,
  getAllClass,
}) {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const { t } = useTranslation();
  const [showConformationPopup, setshowConformationPopup] = useState(false);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVisible]);

  const [newSection, setNewSection] = useState({
    name: "",
    teacherId: "",
    startTime: moment().startOf("day").valueOf(),
  });
  const [sections, setSections] = useState([]);
  const [selectedTeachersList, setSelectedTeachersList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deleteSectionId, setDeleteSectionId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const selectRef = useRef(null);

  // console.log("selectedSection", selectedSection);
  // console.log("sections", sections);
  // console.log("teachers", teachers);
  // console.log("newSection", newSection);

  /**
   * Helper function to generate the next section name based on the length of existing sections.
   * @param {Array} sections - The current list of sections.
   * @returns {string} - The next section name.
   */
  const getNextSectionName = (sections) => {
    const letters = t("options.sections");
    return sections.length <= letters.length ? letters[sections.length] : "";
  };

  /**
   * Fetches data for the sections and teachers.
   * This is an asynchronous function that fetches sections and unassigned teachers from the API.
   * It updates the `sections` and `teachers` states with the fetched data.
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionsRes, teachersRes] = await Promise.all([
        axiosClient.get(`${EndPoints.ADMIN.CLASS_SECTION}/${clickedClassId}`),
        axiosClient.get(EndPoints.ADMIN.UNASSIGNED_TEACHER),
      ]);

      if (sectionsRes?.statusCode === 200) {
        setSections(sectionsRes?.result?.class[0].section);
      }
      if (teachersRes?.statusCode === 200) {
        setTeachers(teachersRes?.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  }, [clickedClassId, t]);

  useEffect(() => {
    fetchData();
  }, []);

  const checkValidation = () => {
    if (sections.length >= 8) {
      if (!toastDisplayed) {
        setToastDisplayed(true);
        toast.error(t("toasts.sectionLimit"));
        setTimeout(() => setToastDisplayed(false), 3000);
      }
      return;
    }
    if (!newSection.teacherId) {
      if (!toastDisplayed) {
        setToastDisplayed(true);
        toast.error(t("toasts.selectTeacher"));
        setTimeout(() => setToastDisplayed(false), 3000);
      }
      return;
    }
    setshowConformationPopup(true);
  };
  /**
   * Handles the saving of a new section.
   * This function checks if the section limit is reached, if a teacher is selected, and then attempts to save the section.
   */
  const handleSaveSection = async () => {
    try {
      setLoading(true);
      const sectionData = {
        name: getNextSectionName(sections),
        teacherId: newSection.teacherId,
        classId: clickedClassId,
        startTime: newSection.startTime,
      };

      const res = await axiosClient.post(
        EndPoints.ADMIN.REGISTER_SECTION,
        sectionData
      );
      if ([200, 201].includes(res?.statusCode)) {
        fetchData();
        toast.success(res.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      // Reset new section form state
      setNewSection({
        name: "",
        teacherId: "",
        startTime: moment().startOf("day").valueOf(),
      });
      setShowForm(true);
    }
  };

  /**
   * Handles updating a teacher in an existing section.
   * This function updates the teacher for a specific section.
   * @param {Object} section - The section to update.
   */
  const handleUpdateTeacherSection = async (section) => {
    if (selectedSection?.teacher?._id === selectedSection.teacherId) {
      setSelectedSection(null);
      return;
    }
    if (!selectedSection.teacherId) {
      return toast.error(t("toasts.selectTeacher"));
    }

    try {
      setLoading(true);
      const res = await axiosClient.put(EndPoints.ADMIN.REPLACE_TEACHER, {
        sectionId: section._id,
        teacherId: selectedSection.teacherId,
      });

      if (res?.statusCode === 200) {
        fetchData();
        toast.success(res.result);
        // setNewSection({ name: section.name, teacherId: newSection.teacherId });
        setSelectedSection(null);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the click event for updating a section.
   * @param {Object} section - The section to update.
   */
  const handleUpdateClick = async (section) => {
    setSelectedSection({ ...section, teacherId: section?.teacher?._id });
    setSelectedTeachersList([section?.teacher, ...teachers]);
    setNewSection({
      name: "",
      teacherId: "",
      startTime: moment().startOf("day").valueOf(),
    });
  };

  /**
   * Handles changes in form inputs.
   * This function updates the `newSection` state when input values change.
   * @param {Event} e - The event triggered by input changes.
   */
  const handleChange = (e, action) => {
    const { name, value } = e.target;
    if (action === "update") {
      setSelectedSection((prev) => ({ ...prev, teacherId: value }));
    } else setNewSection((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the deletion of a section.
   * This function deletes a section based on the section ID and updates the UI accordingly.
   */
  const handleSectionDelete = async () => {
    if (toastDisplayed) return;
    setToastDisplayed(true);
    setTimeout(() => setToastDisplayed(false), 3000);
    try {
      setLoading(true);
      const res = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_SECTION}/${deleteSectionId}`
      );

      if (res?.statusCode === 200) {
        setShowDeleteConfirmation(false);
        await fetchData();
        toast.success(res.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Focus on the select element if active section is set
  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, [selectedSection]);

  // console.log("selectedSection", selectedSection);
  // console.log("sections", sections);

  return (
    <>
      <div
        className={`fixed inset-0 flex justify-center items-end pb-10 bg-[#686868] bg-opacity-50 z-20`}
      >
        {loading && (
          <div
            className={`fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30`}
          >
            <Spinner />
          </div>
        )}
        <div
          className={`${
            isDarkMode ? "bg-background3" : "bg-whiteBackground"
          } w-full max-w-3xl h-4/5 py-5 px-12 rounded-2xl shadow-lg overflow-y-auto`}
        >
          <div className={`flex justify-between items-center mb-4`}>
            <div
              className={`text-2xl font-bold ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } `}
            >
              {t("createSection")}
            </div>
            <img
              onClick={async () => {
                setAddSectionModelOpen(false);
                await getAllClass();
              }}
              className={`cursor-pointer transition-all duration-200 ease-in-out active:scale-90 ${
                isDarkMode ? "h-5 w-5" : "h-10 w-10"
              }`}
              src={isDarkMode ? cross : crossw}
              alt="Close"
            />
          </div>
          <div
            className={`mx-auto grid grid-cols-[140px_250px_164px_78px] items-start mt-8 mb-2 font-medium text-[16px] ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            <div>{t("sections")}</div>
            <div>{t("ClassTeacher")}</div>
            <div>{t("startTime")}</div>
            <div>{t("Actions")}</div>
          </div>
          <hr />
          <div className={`my-6 max-h-72 overflow-y-auto`}>
            {sections.map((section, index) => (
              <div
                key={section._id}
                className={`flex items-center justify-between mb-2 p-4 rounded-lg shadow-sm`}
              >
                <div
                  className={`flex justify-center items-center bg-backgroundDarkRed size-7 rounded-full `}
                >
                  <div className={`text-lg font-medium text-textPrimary`}>
                    {section.name}
                  </div>
                </div>
                {selectedSection && selectedSection?._id === section?._id ? (
                  <FormControl
                    fullWidth
                    sx={{
                      width: "250px",
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      borderRadius: "0.75rem",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "2px solid rgba(104,104,104,0.25)",
                        borderRadius: "0.75rem",
                      },
                      "& .MuiSelect-select": {
                        py: "0.25rem",
                        px: "2rem",
                        color:
                          newSection?.teacherId === ""
                            ? "gray"
                            : isDarkMode
                            ? "#E3E8F3"
                            : "black",
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        borderRadius: "0.75rem",
                      },
                      "& .MuiSvgIcon-root": {
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                    }}
                  >
                    <Select
                      labelId="teacher-select-label"
                      name="teacherId"
                      value={selectedSection?.teacherId}
                      onChange={(e) => handleChange(e, "update")}
                      inputProps={{
                        "data-testid": "selectTeacher",
                        ref: selectRef,
                      }}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <span
                              style={{
                                color: "gray",
                              }}
                            >
                              {t("labels.assignTeacher")}
                            </span>
                          );
                        }
                        const teacherObj = selectedTeachersList.find(
                          (teacher) => teacher._id === selected
                        );
                        return teacherObj
                          ? `${teacherObj.firstname} ${teacherObj.lastname}`
                          : selected;
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
                      <MenuItem value="" disabled>
                        <em>{t("labels.assignTeacher")}</em>
                      </MenuItem>
                      {selectedTeachersList.map((teacher) => (
                        <MenuItem
                          key={teacher._id}
                          value={teacher._id}
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
                          {teacher.firstname} {teacher.lastname}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <div
                    className={`border border-[#686868]/25 rounded-xl py-1 px-8 ${
                      isDarkMode
                        ? "bg-gray-300"
                        : "text-[#686868] bg-[#93a3b6]/10"
                    } w-[250px]`}
                    data-tsetid="savedTeacherName"
                  >
                    {section?.teacher?.firstname} {section?.teacher?.lastname}
                  </div>
                )}
                <DatePicker
                  selected={
                    (selectedSection?._id === section?._id
                      ? selectedSection?.startTime
                      : section?.startTime) || moment()
                  }
                  dateFormat="dd/MM/YYYY"
                  readOnly={true}
                  className={`border-2 rounded-xl py-1 px-4 w-36 z-50 cursor-not-allowed opacity-50 focus:outline-none ${
                    isDarkMode ? "bg-background1 text-textPrimary" : ""
                  }`}
                />
                <div className={`flex items-center`}>
                  {selectedSection?._id === section._id ? (
                    <button
                      onClick={() => handleUpdateTeacherSection(section)}
                      className={`mr-2 w-[75px] h-[32px] border border-borderBlue text-textBlue rounded-xl transition-all duration-200 ease-in-out active:scale-90`}
                    >
                      {selectedSection?.teacher?._id ===
                      selectedSection.teacherId
                        ? t("buttons.cancel")
                        : t("buttons.save")}
                    </button>
                  ) : (
                    <>
                      <div
                        onClick={() => handleUpdateClick(section)}
                        style={{ marginRight: 10, cursor: "pointer" }}
                      >
                        <img
                          src={isDarkMode ? edit2 : edit2w}
                          alt=""
                          className={`size-7`}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setDeleteSectionId(section._id);
                          setShowDeleteConfirmation(true);
                        }}
                        className={`${
                          index !== sections.length - 1 &&
                          "opacity-50 cursor-not-allowed"
                        }`}
                        disabled={index !== sections.length - 1}
                      >
                        <img
                          src={isDarkMode ? delete2 : delete2w}
                          alt="deleteSection"
                          className={`size-7 mr-3`}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {/* add section */}
            {showForm && (
              <div
                className={`flex items-center justify-between mb-2 p-4 rounded-lg shadow-sm`}
              >
                <div className={`flex items-center`}>
                  <div
                    className={`flex justify-center items-center bg-backgroundDarkRed size-7 rounded-full `}
                  >
                    <div className={`text-lg font-medium text-textPrimary`}>
                      {getNextSectionName(sections)}
                    </div>
                  </div>
                </div>
                <FormControl
                  fullWidth
                  disabled={selectedSection}
                  sx={{
                    width: "250px",
                    backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                    borderRadius: "0.75rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "2px solid rgba(104,104,104,0.25)",
                      borderRadius: "0.75rem",
                    },
                    "& .MuiSelect-select": {
                      py: "0.25rem",
                      px: "2rem",
                      color: isDarkMode ? "#E3E8F3" : "black",
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      borderRadius: "0.75rem",
                    },
                    "& .MuiSvgIcon-root": {
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                  }}
                >
                  <Select
                    labelId="teacher-select-label"
                    name="teacherId"
                    value={newSection?.teacherId}
                    onChange={(e) => handleChange(e, "add")}
                    inputProps={{
                      "data-testid": "selectTeacher",
                      ref: selectRef,
                    }}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <span
                            style={{
                              color: "gray",
                            }}
                          >
                            {t("labels.assignTeacher")}
                          </span>
                        );
                      }
                      const teacherObj = teachers.find(
                        (teacher) => teacher._id === selected
                      );
                      return teacherObj
                        ? `${teacherObj.firstname} ${teacherObj.lastname}`
                        : selected;
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "2px solid rgba(104,104,104,0.25)",
                        borderRadius: "0.75rem",
                      },
                      "& .MuiSelect-select": {
                        py: "0.25rem",
                        px: "2rem",
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color:
                          newSection?.teacherId === ""
                            ? "gray"
                            : isDarkMode
                            ? "#E3E8F3"
                            : "black",
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>{t("labels.assignTeacher")}</em>
                    </MenuItem>
                    {teachers.map((teacher) => (
                      <MenuItem
                        key={teacher._id}
                        value={teacher._id}
                        sx={{
                          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                          "&:hover": {
                            backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                          },
                        }}
                      >
                        {teacher.firstname} {teacher.lastname}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <DatePicker
                  selected={newSection.startTime}
                  onChange={(date) => {
                    const timestamp = moment(date).startOf('day').valueOf();
                    setNewSection((prev) => ({
                      ...prev,
                      startTime: timestamp,
                    }));
                  }}
                  dateFormat="dd/MM/YYYY"
                  // maxDate={new Date()}
                  onKeyDown={(e) => e.preventDefault()}
                  showMonthDropdown
                  showYearDropdown
                  scrollableYearDropdown={true}
                  dropdownMode="scroll"
                  disabled={selectedSection}
                  className={`border-2 rounded-xl py-1 px-4 w-36 z-50 ${
                    isDarkMode ? "bg-background1 text-textPrimary" : ""
                  }`}
                />
                <button
                  onClick={checkValidation}
                  className={`mr-2 bg-[#0F4189] transition-all duration-200 ease-in-out active:scale-90`}
                  style={{
                    height: 32,
                    width: 75,
                    borderRadius: 12,
                    color: "white",
                  }}
                  disabled={selectedSection}
                  data-testid="addSection"
                >
                  {t("buttons.save")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* confirm popup of section startDate */}
        <ConformationPopup
          isVisible={showConformationPopup}
          onClose={() => setshowConformationPopup(false)}
          onSubmit={() => {
            handleSaveSection();
            setshowConformationPopup(false);
          }}
          message={t("confirm.sectionStartTime")}
        />

        {/* delete comfirmation popup */}
        {showDeleteConfirmation && (
          <DeletePopup
            isVisible={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onDelete={handleSectionDelete}
          />
        )}
      </div>
    </>
  );
}

export default Addsection;
