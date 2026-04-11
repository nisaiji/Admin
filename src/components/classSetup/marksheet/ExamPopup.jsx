import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Toaster, toast } from "react-hot-toast";
import ConfirmationPopup from "../../ConfirmationPopup2";
import accept from "../../../assets/images/darkmode/accept.png";
import confirm1 from "../../../assets/images/darkmode/confirm1.png";
import cross from "../../../assets/images/darkmode/cross.png";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { FormControl, MenuItem, Select } from "@mui/material";

export default function CreateExamPopup({
  onClose,
  classAndSectionData,
  getExamList,
}) {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [showConformationPopup, setshowConformationPopup] = useState(false);
  const [examName, setExamName] = useState("");
  const [marksheetSubjects, setMarksheetSubjects] = useState([]);
  const gradeOptions = ["A+", "A", "B", "C", "D", "E", "F"];

  /**
   * getAssignedSubjects
   * - Fetches assigned subjects for the current section from the server.
   * - Normalizes each subject with default metadata used by the UI:
   *     - subjectType default: "mainSubject"
   *     - scores default: {}
   */
  const getAssignedSubjects = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_ASSIGN_SUBJECTS}/${classAndSectionData?.sectionId}`,
      );
      if (res?.statusCode === 200) {
        const data = res?.result?.map((subj) => ({
          ...subj,
          subjectType: "mainSubject",
          scores: {},
        }));
        setMarksheetSubjects(data);
      }
    } catch {}
  };

  // Fetch subjects once when component mounts
  useEffect(() => {
    getAssignedSubjects();
  }, []);

  /**
   * handleScoreChange
   * - Updates the scores object for a subject row.
   * - For numeric (mainSubject) fields, only allow digits (regex).
   *
   * index: row index
   * field: one of 'tMax','tMin','pMax','pMin'
   * value: new value (string)
   */
  const handleScoreChange = (index, field, value) => {
    setMarksheetSubjects((prev) => {
      const updated = [...prev];
      if (updated[index].subjectType === "mainSubject") {
        if (/^\d*$/.test(value)) {
          updated[index].scores[field] = value;
        }
      } else {
        updated[index].scores[field] = value;
      }
      return updated;
    });
  };

  /**
   * handleTypeChange
   * - Switches subjectType between "mainSubject" and "gradeOnlySubject".
   * - Resets scores for the row when type changes.
   *
   * index: row index
   * value: new subjectType string
   */
  const handleTypeChange = (index, value) => {
    setMarksheetSubjects((prev) => {
      const updated = [...prev];
      updated[index].subjectType = value;
      updated[index].scores = {};
      return updated;
    });
  };

  /**
   * validateForm
   * - Ensures examName exists.
   * - For numeric subjects verifies all required numeric inputs are present and are numbers,
   *   and that max >= min for both theory and practical.
   * - For grade-only subjects ensures grades are selected and that max >= min in grade ordering.
   *
   * Returns:
   * - true if validation passes, false otherwise (and shows error toasts).
   */
  const validateForm = () => {
    if (!examName?.trim()) {
      toast.error("Exam Name is required");
      return false;
    }

    for (let subj of marksheetSubjects) {
      if (subj?.subjectType === "mainSubject") {
        const { tMax, tMin, pMax, pMin } = subj?.scores || {};

        // Required + mainSubject checks
        for (let [label, val] of [
          ["T- Max", tMax],
          ["T- Min", tMin],
          ["P- Max", pMax],
          ["P- Min", pMin],
        ]) {
          if (val === undefined || val === "") {
            toast.error(`${subj?.subjectName}: ${label} is required`);
            return false;
          }
          if (isNaN(val)) {
            toast.error(`${subj?.subjectName}: ${label} must be a number`);
            return false;
          }
        }

        // Logical checks
        if (Number(tMax) < Number(tMin)) {
          toast.error(
            `${subj?.subjectName}: T- Max must be greater than T- Min`,
          );
          return false;
        }
        if (Number(pMax) < Number(pMin)) {
          toast.error(
            `${subj?.subjectName}: P- Max must be greater than P- Min`,
          );
          return false;
        }
      } else if (subj?.type === "gradeOnlySubject") {
        const { tMax, tMin, pMax, pMin } = subj?.scores || {};

        // Required checks
        for (let [label, val] of [
          ["T- Max Grade", tMax],
          ["T- Min Grade", tMin],
          ["P- Max Grade", pMax],
          ["P- Min Grade", pMin],
        ]) {
          if (!val) {
            toast.error(`${subj?.subjectName}: ${label} is required`);
            return false;
          }
        }

        // Ensure ordering using gradeOptions index (higher grade = lower index in this array)
        const tMaxIdx = gradeOptions.indexOf(tMax);
        const tMinIdx = gradeOptions.indexOf(tMin);
        const pMaxIdx = gradeOptions.indexOf(pMax);
        const pMinIdx = gradeOptions.indexOf(pMin);

        // If indexes are valid, ensure max grade index is <= min grade index
        if (tMaxIdx > -1 && tMinIdx > -1 && tMaxIdx > tMinIdx) {
          toast.error(
            `${subj?.subjectName}: T- Max Grade must be ≥ T- Min Grade`,
          );
          return false;
        }
        if (pMaxIdx > -1 && pMinIdx > -1 && pMaxIdx > pMinIdx) {
          toast.error(
            `${subj?.subjectName}: P- Max Grade must be ≥ P- Min Grade`,
          );
          return false;
        }
      }
    }

    return true;
  };

  /**
   * handleSubmit
   * - Validates UI state and maps it into the API payload format.
   * - Calls the create exam endpoint and handles the response.
   * - On success: shows success toast, closes modals and refreshes exam list.
   */
  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      // Build subjects payload expected by backend
      const subjectsPayload = marksheetSubjects?.map((subj) => {
        let components = [];

        if (subj?.subjectType === "mainSubject") {
          // numeric mapping for theory
          if (subj?.scores?.tMax || subj?.scores?.tMin) {
            components.push({
              examType: "theory",
              maxMarks: Number(subj?.scores?.tMax || 0),
              passingMarks: Number(subj?.scores?.tMin || 0),
            });
          }
          // numeric mapping for practical
          if (subj?.scores?.pMax || subj?.scores?.pMin) {
            components.push({
              examType: "practical",
              maxMarks: Number(subj?.scores?.pMax || 0),
              passingMarks: Number(subj?.scores?.pMin || 0),
            });
          }
        } else if (subj?.subjectType === "gradeOnlySubject") {
          // grade mapping for theory
          if (subj?.scores?.tMax || subj?.scores?.tMin) {
            components.push({
              examType: "theory",
              maxGrade: subj?.scores?.tMax || "",
              passingGrade: subj?.scores?.tMin || "",
            });
          }
          // grade mapping for practical
          if (subj?.scores?.pMax || subj?.scores?.pMin) {
            components.push({
              examType: "practical",
              maxGrade: subj?.scores?.pMax || "",
              passingGrade: subj?.scores?.pMin || "",
            });
          }
        }

        return {
          subject: subj?.subjectId,
          subjectType: subj?.subjectType,
          components,
        };
      });

      const res = await axiosClient.post(EndPoints.ADMIN.CREATE_EXAM, {
        sessionId: classAndSectionData?.selectedSession?._id,
        classId: classAndSectionData?.classId,
        sectionId: classAndSectionData?.sectionId,
        name: examName,
        subjects: subjectsPayload,
      });

      if (res?.statusCode === 201) {
        toast.success(res?.result);
        setshowConformationPopup(false);
        getExamList();
        onClose();
      }
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className={`max-h-[90vh] w-11/12 max-w-5xl overflow-y-auto rounded-lg shadow-lg p-10 ${
          isDarkMode ? "bg-[#1E1D1D] text-white" : "bg-white text-black"
        }`}
      >
        <Toaster position="top-center" reverseOrder={false} />

        {/* Header with Exam Name */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-poppins-bold">Create Test</h2>
          <div className="flex gap-5">
            <div className="flex gap-5 items-center bg-background3 h-[50px] px-5 rounded-md">
              <label className="text-base font-poppins-regular">
                Exam Name:
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) =>
                  /^[a-zA-Z0-9\s-]*$/.test(e.target.value) &&
                  setExamName(e.target.value)
                }
                placeholder="eg. Term-1"
                className="rounded-md px-3 py-1 bg-background4 focus:outline-none"
              />
            </div>
            <button onClick={onClose} className="ml-3 text-textGray">
              <img src={cross} alt="" className="size-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-9">
          <table className="w-full border-collapse text-sm text-center">
            <thead>
              <tr>
                <th className="p-2">List of subjects</th>
                <th className="p-2">Main</th>
                <th className="p-2">Score Type</th>
                <th className="p-2">T- Max</th>
                <th className="p-2">T- Min</th>
                <th className="p-2">P- Max</th>
                <th className="p-2">P- Min</th>
              </tr>
            </thead>
            <tbody>
              {marksheetSubjects?.map((subj, idx) => (
                <tr key={idx} className="bg-[#68686826]">
                  <td className="p-2">{subj?.subjectName}</td>
                  <td className="flex p-2 justify-center">
                    {subj?.isMainSubject && (
                      <img src={accept} alt="" className="size-6" />
                    )}
                  </td>

                  {/* Type selector */}
                  <td className="p-2">
                    <FormControl
                      size="small"
                      sx={{
                        width: "130px",
                        fontSize: "14px",
                        borderRadius: "6px",
                        backgroundColor: isDarkMode ? "#3e3e3e" : "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "1px solid #2b2e4a40",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: isDarkMode ? "#E3E8F3" : "#000",
                        },
                        "& .MuiInputBase-root": {
                          color: isDarkMode ? "#E3E8F3" : "black",
                          height: 40,
                        },
                        "& .MuiSelect-select": {
                          paddingY: 0.5,
                          paddingX: 1,
                        },
                        "& .MuiSvgIcon-root": {
                          fontSize: 18,
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                      }}
                    >
                      <Select
                        labelId="section-select-label"
                        id="section-select"
                        value={subj?.subjectType || ""}
                        onChange={(e) => handleTypeChange(idx, e.target.value)}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: isDarkMode ? "#3e3e3e" : "white",
                              color: isDarkMode ? "#E3E8F3" : "black",
                            },
                          },
                        }}
                        renderValue={(selected) =>
                          selected === ""
                            ? "Select Type"
                            : selected === "mainSubject"
                              ? "Numeric"
                              : "Grade"
                        }
                      >
                        <MenuItem value="mainSubject">Numeric</MenuItem>
                        <MenuItem value="gradeOnlySubject">Grade</MenuItem>
                      </Select>
                    </FormControl>
                  </td>

                  {/* mainSubject fields */}
                  {["tMax", "tMin", "pMax", "pMin"].map((field) => (
                    <td className="p-2" key={field}>
                      {subj?.subjectType === "mainSubject" ? (
                        <input
                          type="text"
                          placeholder="Score"
                          value={subj?.scores[field] || ""}
                          onChange={(e) =>
                            handleScoreChange(idx, field, e.target.value)
                          }
                          className="w-[130px] h-10 rounded px-2 py-1 bg-background4 text-center"
                        />
                      ) : (
                        <FormControl
                          size="small"
                          sx={{
                            width: "130px",
                            fontSize: "14px",
                            borderRadius: "6px",
                            backgroundColor: isDarkMode ? "#3e3e3e" : "white",
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "1px solid #2b2e4a40",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: isDarkMode ? "#E3E8F3" : "#000",
                            },
                            "& .MuiInputBase-root": {
                              color: isDarkMode ? "#E3E8F3" : "black",
                              height: 40,
                            },
                            "& .MuiSelect-select": {
                              paddingY: 0.5,
                              paddingX: 1,
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: 18,
                              color: isDarkMode ? "#E3E8F3" : "black",
                            },
                          }}
                        >
                          <Select
                            value={subj?.scores[field] || ""}
                            onChange={(e) =>
                              handleScoreChange(idx, field, e.target.value)
                            }
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  backgroundColor: isDarkMode
                                    ? "#3e3e3e"
                                    : "white",
                                  color: isDarkMode ? "#E3E8F3" : "black",
                                },
                              },
                            }}
                            displayEmpty
                            renderValue={(selected) =>
                              selected === "" ? "Select" : selected
                            }
                          >
                            {gradeOptions.map((g) => (
                              <MenuItem key={g} value={g}>
                                {g}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded border border-borderWhite text-textPrimary"
          >
            Cancel
          </button>
          <button
            onClick={() => setshowConformationPopup(true)}
            className="px-4 py-1 rounded bg-backgroundBlue text-textPrimary"
          >
            Create
          </button>
        </div>
      </div>

      {/* confirm popup of section startDate */}
      <ConfirmationPopup
        visible={showConformationPopup}
        onConfirm={handleSubmit}
        onCancel={() => setshowConformationPopup(false)}
        title="Create Exam"
        message="Are you sure you want to create this exam?"
        confirmImg={confirm1}
        cancelImg={cross}
      />
    </div>
  );
}
