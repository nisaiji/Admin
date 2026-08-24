import React, { useEffect, useRef, useState } from "react";
import school from "../../assets/images/darkmode/school.png";
import editPhotow from "../../assets/images/darkmode/editPhotow.png";
import editPhoto from "../../assets/images/darkmode/editPhoto.png";
import edit from "../../assets/images/darkmode/editimg.png";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import {
  setClassAndSectionData,
  updateAdminData,
} from "../../store/AppAuthSlice";
import { Chip, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import { getSessionPhase } from "../../utils/helper";
import { motion, AnimatePresence } from "motion/react";
import { C, C_LIGHT } from "../../utils/constants";
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
import { showToast } from "../../services/toastService";

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
        showToast.success(res?.result);
      }
    } catch (error) {
      // console.error("Photo upload failed", error);
      showToast.error("Photo upload failed.");
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
      if (role !== "admin") return;
      const res = await axiosClient.get(EndPoints.ADMIN.GET_SESSION);
      if (res?.statusCode === 200) {
        const sessions = res?.result || [];
        const activeSession = sessions?.find((s) => s?.status === "ACTIVE");
        const currentSessionId = classAndSectionData?.selectedSession?._id;
        const selectedSession = sessions?.find(
          (s) => s?._id === currentSessionId,
        );
        const sessionToSelect = selectedSession || activeSession;
        setSession(
          [...sessions].sort(
            (a, b) => a?.academicStartYear - b?.academicStartYear,
          ),
        );

        if (sessionToSelect) {
          dispatch(
            setClassAndSectionData({
              selectedSession: sessionToSelect,
              session: sessions,
            }),
          );
        }
      }
    } catch (e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  return (
    <>
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
            background: isDarkMode
              ? "rgba(52,211,153,0.04)"
              : "rgba(21,128,61,0.06)",
            border: `1px solid ${
              isDarkMode ? "rgba(52,211,153,0.12)" : "rgba(21,128,61,0.15)"
            }`,
            marginBottom: "18px",
            boxShadow: !isDarkMode ? "0 4px 16px rgba(15,23,42,0.04)" : "none",
          }}
        >
          <CheckCircle2
            size={16}
            color={isDarkMode ? "#34D399" : "#15803d"}
            style={{ flexShrink: 0 }}
          />

          <span
            style={{
              flex: 1,
              fontSize: "13px",
              color: isDarkMode ? "#94A3B8" : "#475569",
            }}
          >
            Academic session{" "}
            <strong style={{ color: isDarkMode ? C.text : C_LIGHT.text }}>
              {selectedSessionLabel}
            </strong>{" "}
            is active —{" "}
            <span style={{ color: isDarkMode ? C.textSub : C_LIGHT.textSub }}>
              you're ready to set up classes, staff, and students.
            </span>
          </span>

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
          background: isDarkMode ? C.card : C_LIGHT.bg,
          border: `1px solid ${isDarkMode ? C.border : C_LIGHT.border}`,
          borderRadius: "18px",
          overflow: "hidden",
          marginBottom: "20px",
          boxShadow: !isDarkMode ? "0 12px 32px rgba(15,23,42,0.06)" : "none",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: "160px",
            position: "relative",
          }}
        >
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
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <img
                src={data?.photo || school}
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
                className="absolute size-8 bottom-2 right-2 cursor-pointer z-10"
                onClick={() => fileInputRef?.current?.click()}
                style={{
                  background: isDarkMode
                    ? "rgba(15,23,42,0.7)"
                    : "rgba(255,255,255,0.95)",
                  borderRadius: "999px",
                  padding: 4,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
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
              background: isDarkMode
                ? "linear-gradient(to right, transparent 50%, rgba(24,27,36,0.8))"
                : "linear-gradient(to right, transparent 45%, rgba(255,255,255,0.65))",
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
              marginBottom: 6,
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
              margin: "0 0 6px",
              fontSize: "22px",
              fontWeight: 700,
              color: isDarkMode ? C.text : C_LIGHT.text,
              lineHeight: 1.3,
            }}
          >
            {localStorage.getItem("schoolName") || schoolName}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: isDarkMode ? C.textSub : C_LIGHT.textSub,
            }}
          >
            Welcome to School Dashboard!
          </p>
        </div>

        <div
          style={{
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            background: isDarkMode ? "transparent" : "rgba(248,250,252,0.75)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "10px",
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

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: isDarkMode ? C.text : C_LIGHT.text,
                }}
              >
                {dateStr}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "10px",
                background: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(100,116,139,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={14} color={isDarkMode ? "#94A3B8" : "#475569"} />
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
                  color: isDarkMode ? C.text : C_LIGHT.text,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {timeStr}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
