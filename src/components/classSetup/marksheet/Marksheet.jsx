import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "../../BreadCrumbs";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

import confirm1 from "../../../assets/images/darkmode/confirm1.png";
import confirm2 from "../../../assets/images/darkmode/confirm2.png";
import cross from "../../../assets/images/darkmode/cross.png";
import addIcon from "../../../assets/images/darkmode/plus.png";
import CreateMarksheetPopup from "./MarksheetPopup";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import ConfirmationPopup from "../../ConfirmationPopup2";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function Marksheet() {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState([]);
  const [selectedExamData, setSelectedExamData] = useState({});
  const [studentData, setStudentData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const activeToastId = useRef(null);
  const gradeOrder = ["A+", "A", "B", "C", "D", "E", "F"];
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);

  const handleConfirm1 = () => {
    setShowConfirm1(false);
    setShowConfirm2(true); // trigger second popup if needed
  };

  const getExamList = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_EXAM_OF_SECTION}/${classAndSectionData?.sectionId}`
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

  useEffect(() => {
    getExamList();
  }, []);

  useEffect(() => {
    if (selectedExam?._id) {
      getStudentsByExam();
    }
  }, [selectedExam?._id]);

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
                c?.gradingType === "marks"
                  ? c?.marksObtained ?? undefined
                  : undefined,
              gradeObtained:
                c?.gradingType === "grades"
                  ? c?.gradeObtained ?? undefined
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
        payload
      );

      // console.log(res);

      if (res?.statusCode === 200 || res?.statusCode === 201) {
        toast.success(res?.result);
        getStudentsByExam();
        setIsEdit(false);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // update marks
  const handleMarksChange = (
    studentId,
    subjectId,
    examType,
    value,
    maxMarks
  ) => {
    // Show toast if value exceeds max
    if (value > maxMarks) {
      toast.dismiss(); // remove any existing toasts
      toast.error(`Marks must be between 0 and ${maxMarks}`, {
        duration: 2000, // optional
      });
      return;
    }

    setStudentData((prev) =>
      prev.map((student) => {
        if (student?._id !== studentId) return student;

        let examResult = student.studentExamResult.find(
          (r) => r?.subjectId === subjectId
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
          (c) => c?.examType === examType
        );
        if (compIndex >= 0) {
          examResult.components[compIndex].marksObtained = value;
        } else {
          examResult?.components?.push({
            examType,
            marksObtained: value,
            gradingType: "marks",
          });
        }

        return { ...student };
      })
    );
  };

  // Update grades
  const handleGradeChange = (
    studentId,
    subjectId,
    examType,
    grade,
    maxGrade
  ) => {
    if (!grade) return;
    // console.log(gradeOrder.indexOf(grade), gradeOrder.indexOf(maxGrade));

    if (gradeOrder.indexOf(grade) < gradeOrder.indexOf(maxGrade)) {
      toast.error(`Grade cannot be higher than max grade ${maxGrade}`);
      return;
    }

    setStudentData((prev) =>
      prev.map((student) => {
        if (student?._id !== studentId) return student;

        let examResult = student?.studentExamResult?.find(
          (r) => r?.subjectId === subjectId
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
          (c) => c?.examType === examType
        );
        if (compIndex >= 0) {
          examResult.components[compIndex].gradeObtained = grade;
        } else {
          examResult?.components?.push({
            examType,
            gradeObtained: grade,
            gradingType: "grades",
          });
        }

        return { ...student };
      })
    );
  };

  const isAllFieldsFilled = studentData?.every((student) => {
    student?.studentExamResult?.every((res) => {
      if (!res?.components || res?.components?.length === 0) return false;

      const gradesValid = res?.components
        ?.filter((c) => c?.gradingType === "grades")
        ?.every((c) => !!c?.gradeObtained);

      const marksValid = res?.components
        ?.filter((c) => c?.gradingType === "marks")
        ?.every((c) => c?.marksObtained !== "" && c?.marksObtained !== null);
      // console.log(gradesValid, marksValid);

      return gradesValid && marksValid;
    });
  });

  const publishResult = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.put(
        `${EndPoints.ADMIN.PUBLISH_RESULT}/${selectedExam?._id}`,
        { resultPublished: "true" }
      );
      // console.log(res)
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        setShowConfirm2(false);
      }
    } catch (e) {
      // console.log(e)
      toast.error(e);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`${
          isDarkMode ? "bg-background2" : "bg-whiteBackground2"
        } px-6 min-h-[calc(100vh-72px)] py-4 `}
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
                <img src={addIcon} alt="+" className="size-4" />
                <span className="text-sm font-poppins-bold text-textBlack">
                  Create
                </span>
              </button>
            </div>

            <hr className="border-[#9391A5]/25 my-6" />

            {examList?.length > 0 && (
              <>
                {/* Exam List + Buttons */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <FormControl
                      size="small"
                      sx={{
                        width: "150px",
                        border: "1px solid #2b2e4a40",
                        fontSize: "16px",
                        borderRadius: "6px",
                        backgroundColor: isDarkMode ? "#3e3e3e" : "white",
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
                      <Select
                        labelId="section-select-label"
                        id="section-select"
                        value={selectedExam?._id}
                        onChange={(e) => {
                          const exam = examList?.find(
                            (ex) => ex?._id === e.target.value
                          );
                          setSelectedExam(exam);
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: isDarkMode ? "#3e3e3e" : "white",
                              color: isDarkMode ? "#E3E8F3" : "black",
                            },
                          },
                        }}
                      >
                        {examList?.map((exam, i) => (
                          <MenuItem
                            key={i}
                            value={exam._id}
                            sx={{
                              backgroundColor: isDarkMode ? "#3e3e3e" : "white",
                              color: isDarkMode ? "#E3E8F3" : "black",
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? "#2a2a2a"
                                  : "#E9EEF2",
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
                          onClick={() => setShowConfirm1(true)}
                          disabled={isEdit}
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
                      <tr className="text-center text-base font-poppins-bold text-white">
                        <th className="p-2">Student</th>
                        {selectedExam?.subjects?.map((subj, i) => {
                          const maxTheoryMarks = subj?.components.find(
                            (c) => c.examType === "theory"
                          )?.maxMarks;
                          const maxPracticalMarks = subj?.components.find(
                            (c) => c.examType === "practical"
                          )?.maxMarks;

                          return (
                            <th key={i} className="p-2">
                              <div className="flex flex-col items-center space-y-1">
                                <span>{subj?.subject?.name}</span>
                                <span className="text-xs font-poppins-medium text-gray-300">
                                  {subj?.subjectType === "mainSubject"
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
                        const mainSubjects = selectedExam?.subjects?.filter(
                          (subj) => subj?.subjectType === "mainSubject"
                        );

                        // Calculate total marks obtained
                        const totalMarksObtained = mainSubjects?.reduce(
                          (sum, subj) => {
                            const result = student?.studentExamResult?.find(
                              (r) => r?.subjectId === subj?.subject?._id
                            );

                            const theoryMarks = Number(
                              result?.components.find(
                                (c) => c.examType === "theory"
                              )?.marksObtained ?? 0
                            );
                            const practicalMarks = Number(
                              result?.components.find(
                                (c) => c.examType === "practical"
                              )?.marksObtained ?? 0
                            );

                            return sum + theoryMarks + practicalMarks;
                          },
                          0
                        );

                        // Calculate total maximum marks
                        const totalMarks = mainSubjects?.reduce((sum, subj) => {
                          const maxTheoryMarks =
                            subj?.components.find(
                              (c) => c.examType === "theory"
                            )?.maxMarks ?? 0;
                          const maxPracticalMarks =
                            subj?.components.find(
                              (c) => c.examType === "practical"
                            )?.maxMarks ?? 0;

                          return sum + maxTheoryMarks + maxPracticalMarks;
                        }, 0);

                        return (
                          <tr
                            key={i}
                            className="bg-[#68686826] text-white text-center text-base font-poppins-regular"
                          >
                            <td className="p-2">
                              {student?.studentFirstName}{" "}
                              {student?.studentLastName}
                            </td>
                            {selectedExam?.subjects?.map((subj, i) => {
                              // Try to find result for this subject from student?.studentExamResult
                              const result = student?.studentExamResult?.find(
                                (r) => r?.subjectId === subj?.subject?._id
                              );

                              const theoryMarks =
                                result?.components.find(
                                  (c) => c.examType === "theory"
                                )?.marksObtained ?? "";
                              const practicalMarks =
                                result?.components.find(
                                  (c) => c.examType === "practical"
                                )?.marksObtained ?? "";

                              const theoryMinMarks =
                                subj?.components.find(
                                  (c) => c.examType === "theory"
                                )?.passingMarks ?? "";
                              const practicalMinMarks =
                                subj?.components.find(
                                  (c) => c.examType === "practical"
                                )?.passingMarks ?? "";

                              const maxTheoryMarks = subj?.components.find(
                                (c) => c.examType === "theory"
                              )?.maxMarks;
                              const maxPracticalMarks = subj?.components.find(
                                (c) => c.examType === "practical"
                              )?.maxMarks;

                              const theoryGrade =
                                result?.components.find(
                                  (c) => c.examType === "theory"
                                )?.gradeObtained ?? "";
                              const practicalGrade =
                                result?.components.find(
                                  (c) => c.examType === "practical"
                                )?.gradeObtained ?? "";

                              const minTheoryGrade =
                                subj?.components.find(
                                  (c) => c.examType === "theory"
                                )?.passingGrade ?? "";
                              const minPracticleGrade =
                                subj?.components.find(
                                  (c) => c.examType === "practical"
                                )?.passingGrade ?? "";

                              const maxTheoryGrade =
                                subj?.components.find(
                                  (c) => c.examType === "theory"
                                )?.maxGrade ?? "";
                              const maxPracticleGrade =
                                subj?.components.find(
                                  (c) => c.examType === "practical"
                                )?.maxGrade ?? "";

                              const getGradeColor = (grade, passingGrade) => {
                                if (!grade) return "text-white";
                                return gradeOrder.indexOf(grade) <=
                                  gradeOrder.indexOf(passingGrade)
                                  ? "text-textGreen"
                                  : "text-textRed";
                              };

                              return (
                                <td key={i} className="p-2 text-center">
                                  {subj?.subjectType === "mainSubject" ? (
                                    <div className="flex justify-center items-center space-x-2">
                                      <div className="flex items-center justify-center size-10 bg-background4 rounded text-white font-semibold">
                                        <input
                                          type="text"
                                          placeholder="-"
                                          value={theoryMarks}
                                          disabled={!isEdit}
                                          onChange={(e) => {
                                            let value = e.target.value;
                                            value = value.replace(
                                              /[^0-9]/g,
                                              ""
                                            );
                                            handleMarksChange(
                                              student._id,
                                              subj?.subject?._id,
                                              "theory",
                                              value,
                                              maxTheoryMarks
                                            );
                                          }}
                                          className={`font-semibold w-full bg-transparent size-10 text-center ${
                                            theoryMarks >= theoryMinMarks
                                              ? "text-textGreen"
                                              : "text-textRed"
                                          }`}
                                        />
                                      </div>

                                      <div className="flex items-center justify-center size-10 bg-background4 rounded text-white font-semibold">
                                        <input
                                          type="text"
                                          placeholder="-"
                                          value={practicalMarks}
                                          disabled={!isEdit}
                                          onChange={(e) => {
                                            let value = e.target.value;
                                            value = value.replace(
                                              /[^0-9]/g,
                                              ""
                                            );
                                            handleMarksChange(
                                              student._id,
                                              subj?.subject?._id,
                                              "practical",
                                              value,
                                              maxPracticalMarks
                                            );
                                          }}
                                          className={`font-semibold w-full bg-transparent size-10 text-center ${
                                            practicalMarks >= practicalMinMarks
                                              ? "text-textGreen"
                                              : "text-textRed"
                                          }`}
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
                                          border: "1px solid #2b2e4a40",
                                          fontSize: "14px",
                                          borderRadius: "6px",
                                          backgroundColor: isDarkMode
                                            ? "#3e3e3e"
                                            : "white",
                                          "& .MuiOutlinedInput-notchedOutline":
                                            { border: "none" },
                                          "& .MuiSvgIcon-root": {
                                            color: isDarkMode
                                              ? "#E3E8F3"
                                              : "black",
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
                                              "theory",
                                              e.target.value,
                                              maxTheoryGrade
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
                                              minTheoryGrade
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
                                                backgroundColor: isDarkMode
                                                  ? "#3e3e3e"
                                                  : "white",
                                                color: isDarkMode
                                                  ? "#E3E8F3"
                                                  : "black",
                                              },
                                            },
                                          }}
                                        >
                                          {[
                                            "A+",
                                            "A",
                                            "B",
                                            "C",
                                            "D",
                                            "E",
                                            "F",
                                          ].map((g) => (
                                            <MenuItem
                                              key={g}
                                              value={g}
                                              sx={{
                                                backgroundColor: isDarkMode
                                                  ? "#3e3e3e"
                                                  : "white",
                                                color: isDarkMode
                                                  ? "#E3E8F3"
                                                  : "black",
                                                "&:hover": {
                                                  backgroundColor: isDarkMode
                                                    ? "#2a2a2a"
                                                    : "#E9EEF2",
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
                                          border: "1px solid #2b2e4a40",
                                          fontSize: "14px",
                                          borderRadius: "6px",
                                          backgroundColor: isDarkMode
                                            ? "#3e3e3e"
                                            : "white",
                                          "& .MuiOutlinedInput-notchedOutline":
                                            { border: "none" },
                                          "& .MuiSvgIcon-root": {
                                            color: isDarkMode
                                              ? "#E3E8F3"
                                              : "black",
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
                                              "practical",
                                              e.target.value,
                                              maxPracticleGrade
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
                                              minPracticleGrade
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
                                                backgroundColor: isDarkMode
                                                  ? "#3e3e3e"
                                                  : "white",
                                                color: isDarkMode
                                                  ? "#E3E8F3"
                                                  : "black",
                                              },
                                            },
                                          }}
                                        >
                                          {[
                                            "A+",
                                            "A",
                                            "B",
                                            "C",
                                            "D",
                                            "E",
                                            "F",
                                          ].map((g) => (
                                            <MenuItem
                                              key={g}
                                              value={g}
                                              sx={{
                                                backgroundColor: isDarkMode
                                                  ? "#3e3e3e"
                                                  : "white",
                                                color: isDarkMode
                                                  ? "#E3E8F3"
                                                  : "black",
                                                "&:hover": {
                                                  backgroundColor: isDarkMode
                                                    ? "#2a2a2a"
                                                    : "#E9EEF2",
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
                                  className={`font-poppins-regular bg-background4 text-center py-2 min-w-[80px] rounded-md ${
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
        <CreateMarksheetPopup
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
        cancelImg={cross}
      />

      {/* Second confirmation popup */}
      <ConfirmationPopup
        visible={showConfirm2}
        onConfirm={publishResult}
        onCancel={() => setShowConfirm2(false)}
        title="Publish Marksheet"
        message="Are you sure you want to publish this marksheet?"
        confirmImg={confirm2}
        cancelImg={cross}
      />
    </div>
  );
}
