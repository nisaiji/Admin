import {
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  ThemeProvider,
  createTheme,
  Typography,
  CssBaseline,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import Breadcrumbs from "../../BreadCrumbs";

export default function Subjects() {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const [loading, setLoading] = useState(false);
  const [subjectList, setSubjectList] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [newSubject, setNewSubject] = useState({
    isUpdate: false,
    subjectId: "",
    teacherId: "",
  });

  // MUI Theme based on isDarkMode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });

  const getSubjects = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_SUBJECT}/${classAndSectionData?.sectionId}`
      );
      if (res?.statusCode === 200) {
        setSubjectList(res?.result);
      }
    } catch (e) {}
  };

  const getTeacher = async () => {
    try {
      const res = await axiosClient.get(EndPoints.ADMIN.TEACHER_LIST);
      if (res?.statusCode === 200) {
        setTeachers(res?.result);
      }
    } catch (e) {}
  };

  const getAssignedSubjects = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_ASSIGN_SUBJECTS}/${
          isTeacher
            ? classAndSectionDataOfTeacher?.sectionId
            : classAndSectionData?.sectionId
        }`
      );
      if (res?.statusCode === 200) {
        setAssignedSubjects(res?.result);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!isTeacher) {
      getSubjects();
      getTeacher();
    }
    getAssignedSubjects();
  }, []);

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
        }
      );
      if (res?.statusCode === 201) {
        toast.success(res?.result);
        getAssignedSubjects();
        setSubjectList(
          subjectList.filter((s) => s._id !== newSubject.subjectId)
        );
        setNewSubject({ isUpdate: false, subjectId: "", teacherId: "" });
      }
    } catch (e) {
      console.log({ e });

      toast.error(e.message || "Error adding subject");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (loading) return;
      setLoading(true);
      if (!newSubject.teacherId) {
        toast.error("Please select a teacher");
        return;
      }
      console.log(newSubject);

      const res = await axiosClient.put(
        `${EndPoints.ADMIN.UPDATE_ASSIGN_TEACHER_OF_SUBJECT}/${newSubject?.updateData?._id}`,
        {
          classId: newSubject?.updateData?.classId,
          sectionId: newSubject?.updateData?.sectionId,
          sessionId: newSubject?.updateData?.sessionId,
          subjectId: newSubject?.updateData.subjectId,
          teacherId: newSubject?.teacherId,
        }
      );

      if (res?.statusCode === 200) {
        toast.success(res?.result || "Teacher updated successfully");
        getAssignedSubjects();
        setNewSubject({ isUpdate: false, subjectId: "", teacherId: "" });
      }
    } catch (e) {
      toast.error(e.message || "Error updating teacher");
    } finally {
      setLoading(false);
    }
  };
  // console.log((assignedSubjects));

  const handleDelete = async (id) => {
    try {
      if (loading) return;
      setLoading(true);
      const res = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_ASSIGN_TEACHER_OF_SUBJECT}/${id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        toast.success(res?.result);
        setAssignedSubjects(assignedSubjects.filter((sub) => sub._id !== id));
      }
    } catch (e) {
      // console.log({e});
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-center" reverseOrder={false} />

      <div style={{ padding: "16px", minHeight: "100vh" }}>
        <Breadcrumbs />

        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Subjects
        </Typography>

        {/* Add / Update Form */}
        {!isTeacher && (
          <Card sx={{ mb: 4 }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: "center",
              }}
            >
              {/* Subject Dropdown */}
              <FormControl fullWidth>
                {newSubject?.isUpdate ? (
                  <div
                    style={{
                      padding: "14px 12px",
                      border: "1px solid rgba(255,255,255,0.23)",
                      borderRadius: "4px",
                      color: isDarkMode ? "#fff" : "#000",
                      minHeight: "56px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {newSubject.updateData?.subjectName}
                  </div>
                ) : (
                  <>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={newSubject.subjectId}
                      label="Subject"
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          subjectId: e.target.value,
                        })
                      }
                    >
                      {subjectList.map((s, i) => (
                        <MenuItem key={i} value={s?._id}>
                          {s?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </FormControl>

              {/* Teacher Dropdown */}
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={newSubject.teacherId || ""}
                  label="Teacher"
                  onChange={(e) => {
                    // console.log(e);
                    setNewSubject({ ...newSubject, teacherId: e.target.value });
                  }}
                >
                  {teachers.map((t, i) => (
                    <MenuItem key={i} value={t.id}>
                      {t.firstname} {t.lastname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {newSubject?.isUpdate ? (
                <Button
                  sx={{ minWidth: 150 }}
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdate()}
                >
                  Update
                </Button>
              ) : (
                <Button
                  sx={{ minWidth: 150 }}
                  variant="contained"
                  color="success"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Subject"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        {/* Subject List */}
        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {assignedSubjects.map((sub, i) => (
            <Card key={i} elevation={3}>
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Typography variant="h6">{sub.subjectName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Teacher: {sub?.teacherFirstName}-{sub?.teacherLastName}
                  </Typography>
                </div>
                {!isTeacher && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      onClick={() => {
                        console.log({ sub });
                        setNewSubject({
                          isUpdate: true,
                          updateData: sub,
                          teacherId: sub?.teacherId,
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(sub._id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ThemeProvider>
  );
}
