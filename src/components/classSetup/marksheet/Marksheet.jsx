import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "../../BreadCrumbs";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import confirm1 from "../../../assets/images/darkmode/confirm1.png";
import confirm2 from "../../../assets/images/darkmode/confirm2.png";
import cross from "../../../assets/images/darkmode/cross.png";
import crossw from "../../../assets/images/cross.png";
import addIcon from "../../../assets/images/darkmode/plus.png";
import addIconLight from "../../../assets/images/plus.png";
import CreateExamPopup from "./ExamPopup";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import ConfirmationPopup from "../../ConfirmationPopup2";
import { FormControl, MenuItem, Select } from "@mui/material";
import CONSTANT from "../../../utils/constants";
import { showToast } from "../../../services/toastService";

export default function Marksheet() {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const pageText = isDarkMode ? "text-textPrimary" : "text-textBlack";
  const mutedText = isDarkMode ? "text-gray-300" : "text-textGray";
  const tableRowBg = isDarkMode ? "bg-[#68686826]" : "bg-[#F4F7FB]";
  const tableInputBg = isDarkMode ? "bg-background4" : "bg-white";
  const tableInputText = isDarkMode ? "text-textPrimary" : "text-textBlack";
  const tableSurface = isDarkMode ? "#3e3e3e" : "#FFFFFF";
  const tableSurfaceText = isDarkMode ? "#E3E8F3" : "#111827";
  const tableBorder = isDarkMode ? "#2b2e4a40" : "#D9E2EC";
  const tableHoverBg = isDarkMode ? "#2a2a2a" : "#E9EEF2";
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState([]);
  const [selectedExamData, setSelectedExamData] = useState({});
  const [studentData, setStudentData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);

  // Handler when user confirms first dialog; chains to second confirmation
  const handleConfirm1 = () => {
    setShowConfirm1(false);
    setShowConfirm2(true); // trigger second popup if needed
  };

  /**
   * getExamList
   * - Fetches exams for the current section from the server and stores them in state.
   * - Selects the first exam by default when results arrive.
   */
  const getExamList = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_EXAM_OF_SECTION}/${classAndSectionData?.sectionId}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        const exams = res?.result;
        setExamList(exams);

        // Select first exam by default
        if (exams?.length > 0) {
          setSelectedExam(exams[0]);
          setSelectedExamData({ subjectLength: exams?.[0]?.subjects.length() });
        }
      }
    } catch (e) {
      // console.error(e);
    }
  };

  /**
   * getStudentsByExam
   * - Fetches students and their exam results for the currently selected exam.
   * - Stores results in studentData state.
   */
  const getStudentsByExam = async () => {
    try {
      const res = await axiosClient.post(EndPoints.ADMIN.GET_STUDENTS_BY_EXAM, {
        sectionId: classAndSectionData?.sectionId,
        examId: selectedExam?._id,
      });
      // console.log(res);
      if (res?.statusCode === 200) {
        setStudentData(res?.result);
      }
    } catch (e) {
      // console.error(e);
    }
  };

  // Load exam list on component mount
  useEffect(() => {
    getExamList();
  }, []);

  // When selectedExam changes, fetch students for that exam
  useEffect(() => {
    if (selectedExam?._id) {
      getStudentsByExam();
    }
  }, [selectedExam?._id]);

  /**
   * handleSaveAllMarks
   * - Gathers all student results from state, converts to API payload shape,
   *   and posts to UPDATE_STUDENT_MARKS_BULK.
   * - On success refreshes student list and exits edit mode.
   */
  const handleSaveAllMarks = async () => {
    try {
      setLoading(true);

      // Build studentExamResults array from studentData
      const studentExamResults = studentData
        .map((student) => {
          return student?.studentExamResult?.map((res) => ({
            studentExamResultId: res?._id ?? "",
            sessionStudentId: student?._id,
            subjectId: res?.subjectId,
            components: res?.components?.map((c) => ({
              examType: c?.examType,
              marksObtained:
                c?.gradingType === "MARKS"
                  ? (c?.marksObtained ?? undefined)
                  : undefined,
              gradeObtained:
                c?.gradingType === "GRADES"
                  ? (c?.gradeObtained ?? undefined)
                  : undefined,
              maxMarks: c?.maxMarks ?? undefined,
              gradingType: c?.gradingType,
            })),
          }));
        })
        .flat();

      // Prepare payload
      const payload = {
        examId: selectedExam?._id,
        sectionId: classAndSectionData?.sectionId,
        studentExamResults,
      };
      // console.log(payload);

      const res = await axiosClient.post(
        EndPoints.ADMIN.UPDATE_STUDENT_MARKS_BULK,
        payload,
      );

      // console.log(res);

      if (res?.statusCode === 200 || res?.statusCode === 201) {
        showToast.success(res?.result);
        getStudentsByExam();
        setIsEdit(false);
      }
    } catch (e) {
      showToast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleMarksChange
   * - Updates numeric marks locally for a student/subject/component.
   * - Prevents values greater than provided maxMarks and shows an error toast.
   *
   * Params:
   * - studentId: id of the student
   * - subjectId: id of the subject
   * - examType: 'theory' | 'practical'
   * - value: numeric value entered
   * - maxMarks: maximum allowed marks for this component
   */
  const handleMarksChange = (
    studentId,
    subjectId,
    examType,
    value,
    maxMarks,
  ) => {
    // Show toast if value exceeds max
    if (value > maxMarks) {
      showToast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setStudentData((prev) =>
      prev.map((student) => {
        if (student?._id !== studentId) return student;

        let examResult = student.studentExamResult.find(
          (r) => r?.subjectId === subjectId,
        );

        // If examResult doesn't exist, create it
        if (!examResult) {
          examResult = {
            _id: "", // empty string for new
            subjectId,
            components: [],
          };
          student.studentExamResult = [
            ...(student?.studentExamResult || []),
            examResult,
          ];
        }

        // Update existing component or add new one
        const compIndex = examResult?.components?.findIndex(
          (c) => c?.examType === examType,
        );
        if (compIndex >= 0) {
          examResult.components[compIndex].marksObtained = value;
        } else {
          examResult?.components?.push({
            examType,
            marksObtained: value,
            gradingType: "MARKS",
          });
        }

        return { ...student };
      }),
    );
  };

  /**
   * handleGradeChange
   * - Updates grade selections locally for a student/subject/component.
   * - Validates that selected grade is not higher (better) than the allowed maxGrade.
   *
   * Params:
   * - studentId, subjectId, examType ('theory'|'practical'), grade, maxGrade
   */
  const handleGradeChange = (
    studentId,
    subjectId,
    examType,
    grade,
    maxGrade,
  ) => {
    if (!grade) return;

    if (CONSTANT.GRADES.indexOf(grade) < CONSTANT.GRADES.indexOf(maxGrade)) {
      showToast.error(`Grade cannot be higher than max grade ${maxGrade}`);
      return;
    }

    setStudentData((prev) =>
      prev.map((student) => {
        if (student?._id !== studentId) return student;

        let examResult = student?.studentExamResult?.find(
          (r) => r?.subjectId === subjectId,
        );

        // If examResult doesn't exist, create it
        if (!examResult) {
          examResult = {
            _id: "", // empty string for new
            subjectId,
            components: [],
          };
          student.studentExamResult = [
            ...(student?.studentExamResult || []),
            examResult,
          ];
        }

        // Update existing grade component or create new
        const compIndex = examResult?.components?.findIndex(
          (c) => c?.examType === examType,
        );
        if (compIndex >= 0) {
          examResult.components[compIndex].gradeObtained = grade;
        } else {
          examResult?.components?.push({
            examType,
            gradeObtained: grade,
            gradingType: "GRADES",
          });
        }

        return { ...student };
      }),
    );
  };

  const isAllMarksFilled = () => {
    if (!studentData?.length || !selectedExam?.subjects?.length) return false;

    return studentData.every((student) => {
      return selectedExam.subjects.every((subj) => {
        const result = student?.studentExamResult?.find(
          (r) => r?.subjectId === subj?.subject?._id,
        );

        if (!result || !result?.components?.length) return false;

        return subj?.components?.every((examComp) => {
          const comp = result.components.find(
            (c) => c?.examType === examComp?.examType,
          );

          if (!comp) return false;

          // Marks validation
          if (examComp?.gradingType === "MARKS") {
            return (
              comp?.marksObtained !== "" &&
              comp?.marksObtained !== null &&
              comp?.marksObtained !== undefined
            );
          }

          // Grade validation
          if (examComp?.gradingType === "GRADES") {
            return !!comp?.gradeObtained;
          }

          return true;
        });
      });
    });
  };

  /**
   * publishResult
   * - Marks the selected exam as published via API call.
   * - Shows toast on success and closes confirmation modal.
   */
  const publishResult = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.put(
        `${EndPoints.ADMIN.PUBLISH_RESULT}/${selectedExam?._id}`,
        { resultPublished: "true" },
      );
      // console.log(res)
      if (res?.statusCode === 200) {
        showToast.success(res?.result);
        setShowConfirm2(false);
      }
    } catch (e) {
      // console.log(e)
      showToast.error(e);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`${isDarkMode ? "bg-background2" : "bg-whiteBackground2"} px-6 min-h-[calc(100vh-72px)] py-4 `}
      >
        <div className="py-4">
          {/* Toast notifications */}
          <Toaster position="top-center" reverseOrder={false} />
          <div className="px-5">
            <Breadcrumbs />

            {/* Header */}
            <div className="flex justify-between items-center">
              <h1
                className={`text-3xl font-poppins-bold ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                Marksheet
                <span className="text-sm font-poppins-regular ml-2">
                  {classAndSectionData?.className}{" "}
                  {classAndSectionData?.sectionName}
                </span>
              </h1>
              <button
                type="button"
                onClick={() => setShowPopup(true)}
                className="flex flex-row justify-center items-center p-[10px] space-x-[10px] cursor-pointer bg-whiteBackground rounded-md transition-all duration-200 ease-in-out active:scale-90"
              >
                <img
                  src={isDarkMode ? addIcon : addIconLight}
                  alt="+"
                  className="size-4"
                />
                <span className="text-sm font-poppins-bold text-textBlack">
                  Create
                </span>
              </button>
            </div>
            <hr className="border-[#9391A5]/25 my-6" />
            {selectedExam?.resultPublished && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Exam results for <strong>{selectedExam?.name}</strong> have been
                published. Students can now view their marks/grades.
              </div>
            )}
            {examList?.length > 0 && (
              <>
                {/* Exam List + Buttons */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <FormControl
                      size="small"
                      sx={{
                        width: "150px",
                        border: `1px solid ${tableBorder}`,
                        fontSize: "16px",
                        borderRadius: "6px",
                        backgroundColor: tableSurface,
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: `${tableBorder} !important`,
                        },
                        "& .MuiInputBase-root": {
                          color: tableSurfaceText,
                        },
                        "& .MuiSvgIcon-root": {
                          color: tableSurfaceText,
                        },
                      }}
                    >
                      <Select
                        labelId="section-select-label"
                        id="section-select"
                        value={selectedExam?._id}
                        onChange={(e) => {
                          const exam = examList?.find(
                            (ex) => ex?._id === e.target.value,
                          );
                          setSelectedExam(exam);
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: tableSurface,
                              color: tableSurfaceText,
                            },
                          },
                        }}
                      >
                        {examList?.map((exam, i) => (
                          <MenuItem
                            key={i}
                            value={exam._id}
                            sx={{
                              backgroundColor: tableSurface,
                              color: tableSurfaceText,
                              "&:hover": {
                                backgroundColor: tableHoverBg,
                              },
                            }}
                          >
                            {exam?.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="flex gap-[10px]">
                    {isEdit ? (
                      <>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleSaveAllMarks()}
                          className="w-[100px] py-[10px] text-sm font-poppins-bold rounded-md bg-backgroundBlue text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEdit(false)}
                          className="w-[100px] py-[10px] text-sm font-poppins-bold rounded-md bg-background3 text-textPrimary"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEdit(true)}
                          className="w-[100px] py-[10px] text-sm font-poppins-bold rounded-md bg-background3 text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAllMarksFilled()) {
                              showToast.error(
                                "Please fill all marks/grades before publishing",
                              );
                              return;
                            }
                            setShowConfirm1(true);
                          }}
                          disabled={isEdit || loading}
                          className="w-[100px] py-[10px] text-sm font-poppins-bold rounded-md bg-backgroundBlue text-white"
                        >
                          Publish
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr
                        className={`text-center text-base font-poppins-bold ${pageText}`}
                      >
                        <th className="p-2">Student</th>
                        {selectedExam?.subjects?.map((subj, i) => {
                          // console.log(subj);

                          const maxTheoryMarks = subj?.components.find(
                            (c) => c.examType === "THEORY",
                          )?.maxMarks;
                          const maxPracticalMarks = subj?.components.find(
                            (c) => c.examType === "PRACTICAL",
                          )?.maxMarks;

                          return (
                            <th key={i} className="p-2">
                              <div className="flex flex-col items-center space-y-1">
                                <span>
                                  {subj?.subject?.name}
                                  <span className="text-red-500 pl-1">
                                    {subj?.teacherSubjectSection?.isMainSubject
                                      ? "*"
                                      : ""}
                                  </span>
                                </span>
                                <span
                                  className={`text-xs font-poppins-medium ${mutedText}`}
                                >
                                  {subj?.subjectType === "MAIN_SUBJECT"
                                    ? `T/${maxTheoryMarks} P/${maxPracticalMarks}`
                                    : "T/Gr P/Gr"}
                                </span>
                              </div>
                            </th>
                          );
                        })}
                        <th className="p-2">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {studentData?.map((student, i) => {
                        // Filter only main subjects
                        // const mainSubjects = selectedExam?.subjects?.filter(
                        //   (subj) => subj?.subjectType === "mainSubject",
                        // );
                        // console.log(selectedExam);

                        const mainSubjects = selectedExam?.subjects?.filter(
                          (subj) =>
                            subj?.teacherSubjectSection?.isMainSubject === true,
                        );
                        // console.log(mainSubjects);

                        // Calculate total marks obtained
                        const totalMarksObtained = mainSubjects?.reduce(
                          (sum, subj) => {
                            const result = student?.studentExamResult?.find(
                              (r) => r?.subjectId === subj?.subject?._id,
                            );

                            const theoryMarks = Number(
                              result?.components.find(
                                (c) => c.examType === "THEORY",
                              )?.marksObtained ?? 0,
                            );
                            const practicalMarks = Number(
                              result?.components.find(
                                (c) => c.examType === "PRACTICAL",
                              )?.marksObtained ?? 0,
                            );

                            return sum + theoryMarks + practicalMarks;
                          },
                          0,
                        );

                        // Calculate total maximum marks
                        const totalMarks = mainSubjects?.reduce((sum, subj) => {
                          const maxTheoryMarks =
                            subj?.components.find(
                              (c) => c.examType === "THEORY",
                            )?.maxMarks ?? 0;
                          const maxPracticalMarks =
                            subj?.components.find(
                              (c) => c.examType === "PRACTICAL",
                            )?.maxMarks ?? 0;

                          return sum + maxTheoryMarks + maxPracticalMarks;
                        }, 0);

                        return (
                          <tr
                            key={i}
                            className={`${tableRowBg} ${pageText} text-center text-base font-poppins-regular`}
                          >
                            <td className="p-2">
                              {student?.studentFirstName}{" "}
                              {student?.studentLastName}
                            </td>
                            {selectedExam?.subjects?.map((subj, i) => {
                              // Try to find result for this subject from student?.studentExamResult
                              const result = student?.studentExamResult?.find(
                                (r) => r?.subjectId === subj?.subject?._id,
                              );

                              const theoryMarks =
                                result?.components.find(
                                  (c) => c.examType === "THEORY",
                                )?.marksObtained ?? "";
                              const practicalMarks =
                                result?.components.find(
                                  (c) => c.examType === "PRACTICAL",
                                )?.marksObtained ?? "";

                              const theoryMinMarks =
                                subj?.components.find(
                                  (c) => c.examType === "THEORY",
                                )?.passingMarks ?? "";
                              const practicalMinMarks =
                                subj?.components.find(
                                  (c) => c.examType === "PRACTICAL",
                                )?.passingMarks ?? "";

                              const maxTheoryMarks = subj?.components.find(
                                (c) => c.examType === "THEORY",
                              )?.maxMarks;
                              const maxPracticalMarks = subj?.components.find(
                                (c) => c.examType === "PRACTICAL",
                              )?.maxMarks;

                              const theoryGrade =
                                result?.components.find(
                                  (c) => c.examType === "THEORY",
                                )?.gradeObtained ?? "";
                              const practicalGrade =
                                result?.components.find(
                                  (c) => c.examType === "PRACTICAL",
                                )?.gradeObtained ?? "";

                              const minTheoryGrade =
                                subj?.components.find(
                                  (c) => c.examType === "THEORY",
                                )?.passingGrade ?? "";
                              const minPracticleGrade =
                                subj?.components.find(
                                  (c) => c.examType === "PRACTICAL",
                                )?.passingGrade ?? "";

                              const maxTheoryGrade =
                                subj?.components.find(
                                  (c) => c.examType === "THEORY",
                                )?.maxGrade ?? "";
                              const maxPracticleGrade =
                                subj?.components.find(
                                  (c) => c.examType === "PRACTICAL",
                                )?.maxGrade ?? "";

                              const getGradeColor = (grade, passingGrade) => {
                                if (!grade) return "text-white";
                                return CONSTANT.GRADES.indexOf(grade) <=
                                  CONSTANT.GRADES.indexOf(passingGrade)
                                  ? "text-textGreen"
                                  : "text-textRed";
                              };

                              return (
                                <td key={i} className="p-2 text-center">
                                  {subj?.subjectType === "MAIN_SUBJECT" ? (
                                    <div className="flex justify-center items-center space-x-2">
                                      <div
                                        className={`flex items-center justify-center size-10 rounded font-semibold ${tableInputBg} ${
                                          isDarkMode
                                            ? ""
                                            : "border border-borderGray3"
                                        }`}
                                      >
                                        <input
                                          type="text"
                                          placeholder="-"
                                          value={theoryMarks}
                                          disabled={!isEdit}
                                          onChange={(e) => {
                                            let value = e.target.value;
                                            value = value.replace(
                                              /[^0-9]/g,
                                              "",
                                            );
                                            handleMarksChange(
                                              student._id,
                                              subj?.subject?._id,
                                              "THEORY",
                                              value,
                                              maxTheoryMarks,
                                            );
                                          }}
                                          className={`font-semibold w-full bg-transparent size-10 text-center ${
                                            theoryMarks >= theoryMinMarks
                                              ? "text-textGreen"
                                              : "text-textRed"
                                          } ${tableInputText}`}
                                        />
                                      </div>

                                      <div
                                        className={`flex items-center justify-center size-10 rounded font-semibold ${tableInputBg} ${
                                          isDarkMode
                                            ? ""
                                            : "border border-borderGray3"
                                        }`}
                                      >
                                        <input
                                          type="text"
                                          placeholder="-"
                                          value={practicalMarks}
                                          disabled={!isEdit}
                                          onChange={(e) => {
                                            let value = e.target.value;
                                            value = value.replace(
                                              /[^0-9]/g,
                                              "",
                                            );
                                            handleMarksChange(
                                              student._id,
                                              subj?.subject?._id,
                                              "PRACTICAL",
                                              value,
                                              maxPracticalMarks,
                                            );
                                          }}
                                          className={`font-semibold w-full bg-transparent size-10 text-center ${
                                            practicalMarks >= practicalMinMarks
                                              ? "text-textGreen"
                                              : "text-textRed"
                                          } ${tableInputText}`}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center items-center space-x-2">
                                      {/* T grade dropdown */}
                                      <FormControl
                                        size="small"
                                        sx={{
                                          width: "70px",
                                          border: `1px solid ${tableBorder}`,
                                          fontSize: "14px",
                                          borderRadius: "6px",
                                          backgroundColor: tableSurface,
                                          "& .MuiOutlinedInput-notchedOutline":
                                            {
                                              border: "none",
                                            },
                                          "& .MuiSvgIcon-root": {
                                            color: tableSurfaceText,
                                          },
                                          "& .MuiSelect-select": {
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          },
                                          "& .Mui-disabled": {
                                            opacity: 1, // remove default MUI fading
                                            color: "inherit !important", // use inherit so renderValue color works
                                            WebkitTextFillColor:
                                              "inherit !important", // Safari fix
                                          },
                                        }}
                                      >
                                        <Select
                                          value={theoryGrade}
                                          onChange={(e) =>
                                            handleGradeChange(
                                              student._id,
                                              subj?.subject?._id,
                                              "THEORY",
                                              e.target.value,
                                              maxTheoryGrade,
                                            )
                                          }
                                          disabled={!isEdit}
                                          displayEmpty
                                          sx={{ height: "40px" }}
                                          renderValue={(selected) => {
                                            if (!selected)
                                              return (
                                                <span
                                                  style={{
                                                    color: isDarkMode
                                                      ? "#E3E8F3"
                                                      : "#000",
                                                  }}
                                                >
                                                  -
                                                </span>
                                              );

                                            const colorClass = getGradeColor(
                                              selected,
                                              minTheoryGrade,
                                            );
                                            const colorMap = {
                                              "text-textGreen": "#00e676",
                                              "text-textRed": "#ff1744",
                                              "text-white": isDarkMode
                                                ? "#E3E8F3"
                                                : "#000",
                                            };
                                            return (
                                              <span
                                                style={{
                                                  color: colorMap[colorClass],
                                                  WebkitTextFillColor:
                                                    colorMap[colorClass], // Safari fix
                                                }}
                                              >
                                                {selected}
                                              </span>
                                            );
                                          }}
                                          MenuProps={{
                                            PaperProps: {
                                              sx: {
                                                backgroundColor: tableSurface,
                                                color: tableSurfaceText,
                                              },
                                            },
                                          }}
                                        >
                                          {CONSTANT.GRADES.map((g) => (
                                            <MenuItem
                                              key={g}
                                              value={g}
                                              sx={{
                                                backgroundColor: tableSurface,
                                                color: tableSurfaceText,
                                                "&:hover": {
                                                  backgroundColor: tableHoverBg,
                                                },
                                              }}
                                            >
                                              {g}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>

                                      {/* P grade dropdown */}
                                      <FormControl
                                        size="small"
                                        sx={{
                                          width: "70px",
                                          border: `1px solid ${tableBorder}`,
                                          fontSize: "14px",
                                          borderRadius: "6px",
                                          backgroundColor: tableSurface,
                                          "& .MuiOutlinedInput-notchedOutline":
                                            {
                                              border: "none",
                                            },
                                          "& .MuiSvgIcon-root": {
                                            color: tableSurfaceText,
                                          },
                                          "& .MuiSelect-select": {
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          },
                                          "& .Mui-disabled": {
                                            opacity: 1, // remove default MUI fading
                                            color: "inherit !important", // use inherit so renderValue color works
                                            WebkitTextFillColor:
                                              "inherit !important", // Safari fix
                                          },
                                        }}
                                      >
                                        <Select
                                          value={practicalGrade}
                                          onChange={(e) =>
                                            handleGradeChange(
                                              student._id,
                                              subj?.subject?._id,
                                              "PRACTICAL",
                                              e.target.value,
                                              maxPracticleGrade,
                                            )
                                          }
                                          disabled={!isEdit}
                                          displayEmpty
                                          sx={{ height: "40px" }}
                                          renderValue={(selected) => {
                                            if (!selected)
                                              return (
                                                <span
                                                  style={{
                                                    color: isDarkMode
                                                      ? "#E3E8F3"
                                                      : "#000",
                                                  }}
                                                >
                                                  -
                                                </span>
                                              );

                                            const colorClass = getGradeColor(
                                              selected,
                                              minPracticleGrade,
                                            );
                                            const colorMap = {
                                              "text-textGreen": "#00e676",
                                              "text-textRed": "#ff1744",
                                              "text-white": isDarkMode
                                                ? "#E3E8F3"
                                                : "#000",
                                            };
                                            return (
                                              <span
                                                style={{
                                                  color: colorMap[colorClass],
                                                  WebkitTextFillColor:
                                                    colorMap[colorClass], // Safari fix
                                                }}
                                              >
                                                {selected}
                                              </span>
                                            );
                                          }}
                                          MenuProps={{
                                            PaperProps: {
                                              sx: {
                                                backgroundColor: tableSurface,
                                                color: tableSurfaceText,
                                              },
                                            },
                                          }}
                                        >
                                          {CONSTANT.GRADES.map((g) => (
                                            <MenuItem
                                              key={g}
                                              value={g}
                                              sx={{
                                                backgroundColor: tableSurface,
                                                color: tableSurfaceText,
                                                "&:hover": {
                                                  backgroundColor: tableHoverBg,
                                                },
                                              }}
                                            >
                                              {g}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td>
                              <div className="flex justify-center">
                                <p
                                  className={`font-poppins-regular ${tableInputBg} text-center py-2 min-w-[80px] rounded-md ${
                                    isDarkMode
                                      ? ""
                                      : "border border-borderGray3"
                                  } ${
                                    totalMarksObtained >= totalMarks / 2
                                      ? "text-textGreen"
                                      : "text-textRed"
                                  }`}
                                >
                                  {totalMarksObtained}/{totalMarks}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Marksheet Popup */}
      {showPopup && (
        <CreateExamPopup
          onClose={() => setShowPopup(false)}
          classAndSectionData={classAndSectionData}
          getExamList={getExamList}
        />
      )}

      {/* First confirmation popup */}
      <ConfirmationPopup
        visible={showConfirm1}
        onConfirm={handleConfirm1}
        onCancel={() => setShowConfirm1(false)}
        title="Save Changes"
        message="Are you sure you want to save changes?"
        confirmImg={confirm1}
        cancelImg={isDarkMode ? cross : crossw}
      />

      {/* Second confirmation popup */}
      <ConfirmationPopup
        visible={showConfirm2}
        onConfirm={publishResult}
        onCancel={() => setShowConfirm2(false)}
        title="Publish Marksheet"
        message="Are you sure you want to publish this marksheet?"
        confirmImg={confirm2}
        cancelImg={isDarkMode ? cross : crossw}
      />
    </div>
  );
}
