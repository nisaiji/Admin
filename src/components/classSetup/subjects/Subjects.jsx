import React, { useState, useEffect } from "react";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import Breadcrumbs from "../../BreadCrumbs";
import email from "../../../assets/images/darkmode/email.png";
import phone from "../../../assets/images/darkmode/phone.png";
import KingIcon from "../../../assets/images/darkmode/king.png";
import profileEmpty from "../../../assets/images/profileEmpty.png";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";


export default function Subjects() {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const role = useSelector((state) => state.appAuth.role);

  const [loading, setLoading] = useState(false);
  const [subjectList, setSubjectList] = useState([]);
  const [allSubjectList, setAllSubjectList] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [newSubject, setNewSubject] = useState({
    subjectId: "",
    isMainSubject: false,
    teacherId: "",
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [backupRow, setBackupRow] = useState(null);
  const [selectedAssignedSubjects, setSelectedAssignedSubjects] =
    useState(null);

  const handleEditRow = (index) => {
    setEditingRow(index);
    setBackupRow({ ...assignedSubjects[index] });
  };

  const handleCancel = (index) => {
    const updated = [...assignedSubjects];
    updated[index] = backupRow;
    setAssignedSubjects(updated);
    setEditingRow(null);
    setBackupRow(null);
  };

  // APIs
  const getSubjects = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_SUBJECT}/${classAndSectionData?.sectionId}`
      );
      if (res?.statusCode === 200) setSubjectList(res?.result);
    } catch {}
  };

  const getTeachers = async () => {
    try {
      const res = await axiosClient.get(EndPoints.ADMIN.TEACHER_LIST);
      if (res?.statusCode === 200) setTeachers(res?.result);
    } catch {}
  };

  const getAssignedSubjects = async () => {
    try {
      let res;
      if (role === "admin") {
        res = await axiosClient.get(
          `${EndPoints.ADMIN.GET_ASSIGN_SUBJECTS}/${classAndSectionData?.sectionId}`
        );
      } else if (role === "classTeacher") {
        res = await axiosClient.get(EndPoints.TEACHER.GET_ASSIGN_SUBJECTS);
      }
      if (res?.statusCode === 200) {
        setAssignedSubjects(res?.result);
      }
    } catch {}
  };

  useEffect(() => {
    if (role === "admin") {
      getSubjects();
      getTeachers();
    }
    if (role === "admin" || role === "classTeacher") {
      getAssignedSubjects();
    }
  }, [role]);

  // Update teacher assignment
  const handleAssignTeacher = async (data) => {
    try {
      setLoading(true);
      const res = await axiosClient.put(
        `${EndPoints.ADMIN.UPDATE_ASSIGN_TEACHER_OF_SUBJECT}/${data._id}`,
        {
          classId: data?.classId,
          sectionId: data?.sectionId,
          sessionId: data?.sessionId,
          subjectId: data?.subjectId,
          teacherId: data?.teacherId,
          isMainSubject: data?.isMainSubject,
        }
      );
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        getAssignedSubjects();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (loading) return;
      setLoading(true);
      if (!newSubject.subjectId || !newSubject.teacherId) return;
      const res = await axiosClient.post(
        EndPoints.ADMIN.ASSIGN_SUBJECT_TO_TEACHER,
        {
          classId: classAndSectionData?.classId,
          sectionId: classAndSectionData?.sectionId,
          sessionId: classAndSectionData?.selectedSession?._id,
          subjectId: newSubject.subjectId,
          teacherId: newSubject.teacherId,
          isMainSubject: newSubject.isMainSubject,
        }
      );
      if (res?.statusCode === 201) {
        toast.success(res?.result);
        getAssignedSubjects();
        setSubjectList(
          subjectList.filter((s) => s._id !== newSubject.subjectId)
        );
        setNewSubject({ isMainSubject: false, subjectId: "", teacherId: "" });
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (index, key, value) => {
    const updated = [...assignedSubjects];
    updated[index] = { ...updated[index], [key]: value };
    setAssignedSubjects(updated);
    setSelectedAssignedSubjects(updated[index]);
  };

  return (
    <div
      className={`min-h-screen p-8 flex gap-5 ${
        isDarkMode ? "bg-background2 text-textPrimary" : "text-textBlack"
      }`}
    >
      <Toaster position="top-center" />

      {/* Left side - Subject Table */}
      <div
        className={` bg-background1 rounded-lg p-8 ${
          role === "admin" ? "flex-3 w-3/4" : "w-full"
        }`}
      >
        <Breadcrumbs />
        <h2 className="text-xl font-poppins-bold mb-4">Subjects</h2>
        <hr className="border-[#9391A5]/25 my-5" />

        {/* Table */}
        <table className="w-full text-center">
          <thead>
            <tr className="font-poppins-bold text-base">
              <th className="py-3">List of Subjects</th>
              <th className="py-3">Main Subject</th>
              <th className="py-3">Assigned Teacher</th>
              {role === "admin" && <th className="py-3 w-[250px]">Action</th>}
            </tr>
          </thead>
          <tbody>
            {/* subject assign form */}
            {role === "admin" && (
              <tr>
                <td>
                  {/* Subject dropdown */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      border: "1px solid #2b2e4a80",
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "" : "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDarkMode ? "#E3E8F3" : "black",
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
                      value={newSubject.subjectId}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          subjectId: e.target.value,
                        })
                      }
                      displayEmpty
                      sx={{
                        border: "1px solid #2b2e4a80",
                        borderRadius: "0.5rem",
                        height: "44px",
                        backgroundColor: isDarkMode ? "" : "white",
                        color: !newSubject?.subjectId
                          ? "gray"
                          : isDarkMode
                          ? "#E3E8F3"
                          : "black",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
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
                        Select Subject
                      </MenuItem>
                      {subjectList?.map((s, i) => (
                        <MenuItem
                          key={i}
                          value={s?._id}
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
                          {s?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>

                {/* Main Subject checkbox */}
                <td>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newSubject?.isMainSubject}
                        onChange={(e) =>
                          setNewSubject({
                            ...newSubject,
                            isMainSubject: e.target.checked,
                          })
                        }
                        sx={{
                          color: "white",
                        }}
                      />
                    }
                  />
                </td>

                {/* Teacher dropdown */}
                <td>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      border: "1px solid #2b2e4a80",
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "" : "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDarkMode ? "#E3E8F3" : "black",
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
                      value={newSubject.teacherId || ""}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          teacherId: e.target.value,
                        })
                      }
                      displayEmpty
                      sx={{
                        border: "1px solid #2b2e4a80",
                        borderRadius: "0.5rem",
                        height: "44px",
                        backgroundColor: isDarkMode ? "" : "white",
                        color: !newSubject.teacherId
                          ? "gray"
                          : isDarkMode
                          ? "#E3E8F3"
                          : "black",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
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
                        Select Teacher
                      </MenuItem>
                      {teachers.map((t) => (
                        <MenuItem
                          key={t.id}
                          value={t.id}
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
                          {t.firstname} {t.lastname}
                          {t?.role === "classTeacher" &&
                            t?.sectionId === classAndSectionData?.sectionId && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  backgroundColor: "#FF793F26", // soft badge color
                                  marginLeft: 5,
                                }}
                              >
                                <img
                                  src={KingIcon}
                                  alt="King"
                                  style={{
                                    width: 16,
                                    height: 16,
                                    resize: "contain",
                                  }}
                                />
                              </span>
                            )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>

                {/* Action buttons */}
                <td>
                  <button
                    type="button"
                    className="text-base font-poppins-bold rounded h-[34px] w-[100px] text-textPrimary bg-backgroundBlue"
                    onClick={() => handleCreate()}
                  >
                    Assign
                  </button>
                </td>
              </tr>
            )}
            {/* assigned subject list */}
            {assignedSubjects.map((sub, i) => (
              <tr
                key={i}
                onClick={() => {
                  if (role === "admin") {
                    setSelectedRow(i);
                    setSelectedAssignedSubjects(sub);
                    setSelectedTeacher(
                      teachers.find((t) => t.id === sub?.teacherId)
                    );
                  }
                }}
                className={`${selectedRow === i ? "bg-background3" : ""} `}
              >
                {/* Subject dropdown */}
                <td>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      border: "1px solid #2b2e4a80",
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "" : "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDarkMode ? "#E3E8F3" : "black",
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
                      value={sub}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleSubjectChange(i, "subjectId", e.target.value)
                      }
                      readOnly={editingRow !== i}
                      sx={{
                        border: "1px solid #2b2e4a80",
                        borderRadius: "0.5rem",
                        height: "44px",
                        backgroundColor: isDarkMode ? "" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiSelect-select": {
                          cursor: editingRow === i ? "pointer" : "default",
                        },
                      }}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <span
                              style={{
                                color: "gray",
                              }}
                            >
                              Select Subject
                            </span>
                          );
                        }
                        const subjectObj = subjectList?.find(
                          (subject) => subject?._id === selected?.subjectId
                        );
                        return subjectObj
                          ? subjectObj?.name
                          : selected?.subjectName;
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
                      {subjectList?.map((s, i) => (
                        <MenuItem
                          key={i}
                          value={s?._id}
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
                          {s?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>

                {/* Main Subject checkbox */}
                <td>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sub?.isMainSubject}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleSubjectChange(
                            i,
                            "isMainSubject",
                            e.target.checked
                          )
                        }
                        disabled={editingRow !== i}
                        sx={{
                          color: "white",
                          "&.Mui-disabled": {
                            color: "primary.main",
                          },
                        }}
                      />
                    }
                  />
                </td>

                {/* Teacher dropdown */}
                <td>
                  {role === "classTeacher" ? (
                    <div
                      style={{
                        border: "1px solid #2b2e4a80",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "#000",
                        minHeight: "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <span>
                        {`${sub.teacherFirstName} ${sub.teacherLastName || ""}`}
                      </span>
                    </div>
                  ) : role === "admin" ? (
                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{
                        border: "1px solid #2b2e4a80",
                        borderRadius: "8px",
                        backgroundColor: isDarkMode ? "" : "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: isDarkMode ? "#E3E8F3" : "black",
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
                        value={sub.teacherId}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleSubjectChange(i, "teacherId", e.target.value)
                        }
                        readOnly={editingRow !== i}
                        sx={{
                          border: "1px solid #2b2e4a80",
                          borderRadius: "0.5rem",
                          height: "44px",
                          backgroundColor: isDarkMode ? "" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "& .MuiSelect-select": {
                            cursor: editingRow === i ? "pointer" : "default",
                          },
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
                          Select Teacher
                        </MenuItem>
                        {teachers.map((t, i) => (
                          <MenuItem
                            key={i}
                            value={t?.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                              color: isDarkMode ? "#E3E8F3" : "black",
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? "#2a2a2a"
                                  : "#E9EEF2",
                              },
                            }}
                          >
                            <span>
                              {t?.firstname} {t?.lastname}
                            </span>
                            {t?.role === "classTeacher" &&
                              t?.sectionId ===
                                classAndSectionData?.sectionId && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    backgroundColor: "#FF793F26", // soft badge color
                                    marginLeft: 5,
                                  }}
                                >
                                  <img
                                    src={KingIcon}
                                    alt="King"
                                    style={{
                                      width: 16,
                                      height: 16,
                                      resize: "contain",
                                    }}
                                  />
                                </span>
                              )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    ""
                  )}
                </td>
                {/* Action buttons */}
                {role === "admin" && (
                  <td className="py-2">
                    {editingRow === i ? (
                      <>
                        <button
                          type="button"
                          className="text-base font-poppins-bold rounded h-[34px] w-[100px] text-textPrimary bg-backgroundBlue"
                          onClick={() => {
                            handleAssignTeacher(selectedAssignedSubjects);
                            setEditingRow(null);
                            setBackupRow(null);
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-base font-poppins-bold rounded ml-3 h-[34px] w-[100px] text-textPrimary bg-background4"
                          onClick={() => handleCancel(i)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="text-base font-poppins-bold rounded h-[34px] w-[100px] text-textPrimary bg-background4"
                        onClick={() => handleEditRow(i)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right side - Teacher Profile */}
      {role === "admin" && (
        <div className="flex-1 bg-background1 rounded-lg shadow-md p-6">
          {selectedTeacher ? (
            <div className="flex flex-col items-center">
              {/* Centered Section */}
              <div className="text-center">
                <img
                  src={selectedTeacher?.photo || profileEmpty}
                  alt="teacher"
                  className="size-[180px] rounded-full mx-auto mb-3 object-cover"
                />
                <h3 className="text-base font-poppins-bold">
                  {selectedTeacher?.teacherFirstName}{" "}
                  {selectedTeacher?.teacherLastName}
                </h3>
                {selectedTeacher?.role === "classTeacher" && (
                  <p className="mb-2 text-textOrange bg-backgroundOrange inline-block px-3 py-1 rounded-md">
                    Class Teacher – {selectedTeacher?.className}{" "}
                    {selectedTeacher?.sectionName}
                  </p>
                )}
              </div>

              {/* Left-aligned Section */}
              <div className="w-full mt-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <img src={phone} alt="phone" className="size-6" />
                  <p>{selectedTeacher?.phone}</p>
                </div>

                {selectedTeacher?.email && (
                  <div className="flex items-center gap-2 mb-2">
                    <img src={email} alt="email" className="size-6" />
                    <p>{selectedTeacher?.email}</p>
                  </div>
                )}

                <h4 className="mt-4 font-semibold">Other Classes</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTeacher?.sectionSubjects?.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded text-sm bg-backgroundGray15 text-textPrimary"
                    >
                      {c.className} {c.sectionName} {c.subjectName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center mt-10">
              Select a teacher to view details
            </p>
          )}
        </div>
      )}
    </div>
  );
}
