import React, { useEffect, useRef, useState } from "react";
import school from "../../assets/images/darkmode/school.png";
import editPhotow from "../../assets/images/darkmode/editPhotow.png";
import editPhoto from "../../assets/images/darkmode/editPhoto.png";
import edit from "../../assets/images/darkmode/editimg.png";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast from "react-hot-toast";
import {
  setClassAndSectionData,
  updateAdminData,
} from "../../store/AppAuthSlice";
import { Chip, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import { getSessionPhase } from "../../utils/helper";
import { motion, AnimatePresence } from "motion/react";
import { C } from "../../utils/constants";
import {
  Users,
  BookOpen,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  CheckCircle2,
  UserCheck,
  Clock,
  School,
  RefreshCw,
} from "lucide-react";
import { ChartDropdown } from "./ChartDropdown";

export default function SectionData({
  isDarkMode,
  role,
  teacherData,
  classAndSectionData,
  data,
  date,
}) {
  const dispatch = useDispatch();
  const schoolName = useSelector((state) => state.appAuth.schoolName);
  const fileInputRef = useRef(null);
  const [session, setSession] = useState([]);

  const sessionOptions = session?.map(
    (s) => `${s.academicStartYear}-${String(s.academicEndYear).slice(-2)}`,
  );

  const selectedSessionLabel = classAndSectionData?.selectedSession
    ? `${classAndSectionData.selectedSession.academicStartYear}-${String(
        classAndSectionData.selectedSession.academicEndYear,
      ).slice(-2)}`
    : "Select Session";

  function pad(n) {
    return String(n).padStart(2, "0");
  }
  function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
      const t = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(t);
    }, []);
    return now;
  }
  const now = useClock();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // modify photo size to less than 1mb
  const resizeImage = (
    file,
    maxSizeMB = 1,
    maxWidth = 1000,
    maxHeight = 1000,
  ) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        image.src = e.target.result;
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        let width = image.width;
        let height = image.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const reader2 = new FileReader();
            reader2.readAsDataURL(blob);
            reader2.onloadend = () => resolve(reader2.result);
          },
          "image/jpeg",
          0.8, // adjust quality (0.0 - 1.0)
        );
      };

      reader.onerror = reject;
      image.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // upload photo of school by admin
  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let base64Image;

      if (file.size > 1024 * 1024) {
        // Resize if greater than 1MB
        base64Image = await resizeImage(file);
      } else {
        // Convert to Base64
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });

        base64Image = await toBase64(file);
      }

      // Upload the image
      const res = await axiosClient.put(EndPoints.ADMIN.PHOTO_UPLOAD, {
        photo: base64Image,
        method: "POST",
      });

      if (res?.statusCode === 200) {
        dispatch(updateAdminData({ photo: base64Image }));
        toast.success(res?.result);
      }
    } catch (error) {
      // console.error("Photo upload failed", error);
      toast.error("Photo upload failed.");
    }
  };

  // Helper to get next session years
  const getNextSessionYears = () => {
    const today = moment();

    // Academic year starts in April
    const isAfterMarch = today.month() >= 3; // month() is 0-based → April = 3

    const currentAcademicStart = isAfterMarch ? today.year() : today.year() - 1;

    const currentAcademicEnd = currentAcademicStart + 1;

    const nextAcademicStart = currentAcademicStart + 1;
    const nextAcademicEnd = currentAcademicEnd + 1;

    // Check if next session already exists
    const nextSessionExists = session?.some(
      (s) =>
        s?.academicStartYear === nextAcademicStart &&
        s?.academicEndYear === nextAcademicEnd,
    );

    if (!nextSessionExists) {
      return {
        start: nextAcademicStart,
        end: nextAcademicEnd,
        startDate: moment(`${nextAcademicStart}-04-01`).toDate(),
        endDate: moment(`${nextAcademicEnd}-03-31`).toDate(),
      };
    }

    return null;
  };

  // Check if next session exists
  const nextSession = getNextSessionYears();

  /**
   * Fetches calendar events based on the selected month.
   */
  const getSession = async () => {
    try {
      if (role === "admin") {
        const res = await axiosClient.get(EndPoints.ADMIN.GET_SESSION);
        if (res?.statusCode === 200) {
          // console.log(res);

          const activeSession = res?.result?.find((s) => s?.isCurrent === true);

          const selectedExists = res?.result?.some(
            (s) => s?._id === classAndSectionData?.selectedSession?._id,
          );

          if (!selectedExists) {
            dispatch(
              setClassAndSectionData({
                selectedSession: activeSession,
                session: res?.result,
              }),
            );
          }

          setSession(
            res?.result.sort(
              (a, b) => a?.academicStartYear - b?.academicStartYear,
            ),
          );
        }
      }
    } catch (e) {
      // console.log(e);
    }
  };

  // Handler to create new session
  const handleCreateSession = async () => {
    try {
      // setLoading(true);
      // console.log(nextSession);
      const res = await axiosClient.post(EndPoints.ADMIN.CREATE_SESSION, {
        academicStartYear: nextSession.start,
        academicEndYear: nextSession.end,
      });
      // console.log(res);

      if (res?.statusCode === 200) {
        toast.success(res?.result);
        getSession();
      }
    } catch (e) {
      // toast.error("Error creating session.");
    } finally {
      // setLoading(false);
    }
  };

  const handleMarkSessionComplete = async () => {
    try {
      if (!classAndSectionData?.selectedSession?._id) {
        toast.error("No session selected.");
        return;
      }
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.MARK_SESSION_COMPLETE}/${classAndSectionData?.selectedSession?._id}`,
      );
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        getSession(); // Refresh session list
      }
    } catch (e) {
      toast.error(e);
    }
  };

  useEffect(() => {
    getSession();
  }, [date]);

  return (
    <>
      {/* Session status strip */}
      {role === "admin" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 18px",
            borderRadius: "11px",
            background: "rgba(52,211,153,0.04)",
            border: "1px solid rgba(52,211,153,0.12)",
            marginBottom: "18px",
          }}
        >
          <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: "13px", color: "#94A3B8" }}>
            Academic session{" "}
            <strong style={{ color: C.text }}>{selectedSessionLabel}</strong> is
            active —{" "}
            <span style={{ color: C.textSub }}>
              you're ready to set up classes, staff, and students.
            </span>
          </span>
          {/* <button
          // onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: "7px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.09)",
            color: C.textSub,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <RefreshCw size={11} /> Change Session
        </button> */}
          <ChartDropdown
            value={selectedSessionLabel}
            options={sessionOptions}
            onChange={(selectedLabel) => {
              const selected = session.find(
                (s) =>
                  `${s.academicStartYear}-${String(s.academicEndYear).slice(-2)}` ===
                  selectedLabel,
              );

              if (!selected) return;

              localStorage.removeItem("classAndSectionData");
              localStorage.removeItem("tempData");

              dispatch(
                setClassAndSectionData({
                  selectedSession: selected,
                }),
              );
            }}
          />
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.4 }}
        style={{
          display: "flex",
          alignItems: "stretch",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div style={{ flexShrink: 0, width: "160px", position: "relative" }}>
          {role === "classTeacher" || role === "teacher" ? (
            <img
              src={teacherData?.photo || school}
              alt="School"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div className="relative inline-block">
              <img
                src={school}
                alt="School"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <img
                src={isDarkMode ? editPhotow : editPhoto}
                alt="Edit"
                className={`absolute size-8 bottom-0 right-0 cursor-pointer z-10`}
                onClick={() => fileInputRef?.current?.click()}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={uploadPhoto}
              />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, transparent 50%, rgba(24,27,36,0.8))",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            borderRight: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 4,
            }}
          >
            <School size={13} color={C.textMuted} />
            <span
              style={{
                fontSize: "10px",
                color: C.textMuted,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}
            >
              Your School
            </span>
          </div>
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: "22px",
              fontWeight: 700,
              color: C.text,
            }}
          >
            {localStorage.getItem("schoolName") || schoolName}
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: C.textSub }}>
            Welcome to School Dashboard!
          </p>
        </div>
        <div
          style={{
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: C.blueDim,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarDays size={14} color={C.blue} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: C.textMuted,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Date
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                {dateStr}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={14} color="#94A3B8" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: C.textMuted,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Time
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: C.text,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {timeStr}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* 
        <div className={`flex flex-col items-end space-y-4`}>
          {role === "admin" && (
            <div className="flex items-center gap-4">
              {nextSession && (
                <button
                  className="font-bold text-white bg-[#4CBC9A] rounded-lg px-4 py-2 cursor-pointer mr-3  focus:outline-none"
                  onClick={handleCreateSession}
                >
                  Create Session {nextSession?.start}-
                  {String(nextSession?.end).slice(-2)}
                </button>
              )}
              {classAndSectionData?.selectedSession?._id && (
                <button
                  className="font-bold text-white bg-[#0F4189] rounded-lg px-4 py-2 cursor-pointer mr-3 focus:outline-none"
                  onClick={handleMarkSessionComplete}
                >
                  Toggle Session{" "}
                  {classAndSectionData?.selectedSession?.academicStartYear}-
                  {String(
                    classAndSectionData?.selectedSession?.academicEndYear,
                  ).slice(-2)}
                </button>
              )}
              <FormControl sx={{ bgcolor: "#1e1e1e", borderRadius: 3 }}>
                <Select
                  value={
                    session?.some(
                      (s) =>
                        s?._id === classAndSectionData?.selectedSession?._id,
                    )
                      ? classAndSectionData?.selectedSession?._id
                      : ""
                  }
                  onChange={(e) => {
                    const selected = session?.find(
                      (s) => s?._id === e?.target?.value,
                    );
                    localStorage.removeItem("classAndSectionData");
                    localStorage.removeItem("tempData");
                    dispatch(
                      setClassAndSectionData({
                        selectedSession: selected,
                      }),
                    );
                  }}
                  displayEmpty
                  sx={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "bold",
                    borderRadius: 14,
                    ".MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    ".MuiSelect-icon": {
                      color: isDarkMode ? "#fff" : "#000",
                    },
                    bgcolor: "#1e1e1e",
                  }}
                  renderValue={(selectedValue) => {
                    const s = session?.find(
                      (item) => item?._id === selectedValue,
                    );
                    if (!s) return <Typography>Select Session</Typography>;

                    const phase = getSessionPhase(s, moment);
                    const chipLabel =
                      phase === "current"
                        ? "Current"
                        : phase === "upcoming"
                          ? "Upcoming"
                          : "Previous";

                    return (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                        width="100%"
                      >
                        <Typography fontWeight="bold">
                          {s?.academicStartYear}-
                          {String(s?.academicEndYear).slice(-2)}
                        </Typography>
                        {s?._id && (
                          <Chip
                            label={chipLabel}
                            size="small"
                            sx={{
                              bgcolor:
                                phase === "current"
                                  ? "#4CBC9A26"
                                  : phase === "upcoming"
                                    ? "#3A86FF26"
                                    : "#9CA3AF26",
                              color:
                                phase === "current"
                                  ? "#4CBC9A"
                                  : phase === "upcoming"
                                    ? "#3A86FF"
                                    : "#9CA3AF",
                              fontWeight: "bold",
                              fontSize: 14,
                              p: 2,
                            }}
                          />
                        )}
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1e1e1e",
                        color: "#fff",
                        borderRadius: 3,
                        mt: 1,
                      },
                    },
                  }}
                >
                  {session?.map((data) => (
                    <MenuItem
                      key={data?._id}
                      value={data?._id} // ✅ only pass id
                      sx={{
                        fontWeight: "bold",
                        "&:hover": {
                          bgcolor: "#333",
                        },
                      }}
                    >
                      {data?.academicStartYear}-
                      {String(data?.academicEndYear).slice(-2)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
        </div>
      </div> */}
    </>
  );
}
