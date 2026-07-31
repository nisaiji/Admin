import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import CalendarComponent from "./CalendarComponent";

import noeventsw from "../../assets/images/noevents.png";
import noevents from "../../assets/images/darkmode/noevents.png";
import moment from "moment";
import Spinner from "../Spinner";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { motion } from "motion/react";
import { C, C_LIGHT } from "../../utils/constants";

export default function EventData({
  isDarkMode,
  role,
  teacherData,
  classAndSectionData,
  date,
  setDate,
}) {
  const [t] = useTranslation();
  const [eventLoading, setEventLoading] = useState(false);
  const [calenderEvents, setCalenderEvents] = useState([]);
  const [workdays, setWorkdays] = useState([]);

  /**
   * Fetches calendar events based on the selected month.
   */
  const getCalenderEvents = async () => {
    if (
      role === "classTeacher" || role === "teacher"
        ? !teacherData?.sessionId
        : role === "admin"
          ? !classAndSectionData?.selectedSession?._id
          : ""
    ) {
      return;
    }
    const startTime = new Date(date.year, date.month, 1).getTime();
    const endTime = new Date(
      date.year,
      date.month + 1,
      0,
      23,
      59,
      59,
      999,
    ).getTime();
    try {
      setEventLoading(true);
      let url =
        role === "classTeacher" || role === "teacher"
          ? EndPoints.TEACHER.GET_EVENTS
          : role === "admin"
            ? EndPoints.ADMIN.GET_EVENTS
            : "";
      const res1 = await axiosClient.post(url, {
        startTime,
        endTime,
        sessionId:
          role === "classTeacher" || role === "teacher"
            ? teacherData?.sessionId
            : role === "admin"
              ? classAndSectionData?.selectedSession?._id
              : "",
      });

      if (res1.statusCode === 200) {
        setCalenderEvents(res1?.result);
      }

      url =
        role === "classTeacher" || role === "teacher"
          ? EndPoints.TEACHER.GET_SUNDAY_HOLIDAY
          : role === "admin"
            ? EndPoints.ADMIN.GET_SUNDAY_HOLIDAY
            : "";

      const res = await axiosClient.post(url, {
        startTime,
        endTime,
        sessionId:
          role === "classTeacher" || role === "teacher"
            ? teacherData?.sessionId
            : role === "admin"
              ? classAndSectionData?.selectedSession?._id
              : "",
      });

      if (res?.statusCode === 200) {
        setWorkdays(res?.result);
      }
    } catch (e) {
      // console.log(e);
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    getCalenderEvents();
  }, [date, classAndSectionData?.selectedSession?._id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.36, duration: 0.4 }}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px",
      }}
    >
      {/* Calendar */}
      <CalendarComponent
        events={calenderEvents}
        workdays={workdays}
        updateDate={(newDate) => setDate(newDate)}
      />

      {/* HOLIDAYS */}
      <div
        style={{
          background: isDarkMode ? C.card : C_LIGHT.card,
          border: `1px solid ${isDarkMode ? C.border : C_LIGHT.border}`,
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: !isDarkMode ? "0 10px 28px rgba(15,23,42,0.06)" : "none",
        }}
      >
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: `1px solid ${
              isDarkMode ? C.borderSoft : C_LIGHT.borderSoft
            }`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: isDarkMode ? C.text : C_LIGHT.text,
              }}
            >
              Upcoming Holidays
            </span>
          </div>
        </div>

        {/* List */}
        <div
          style={{
            padding: "12px 16px",
            flex: 1,
            overflowY: "auto",
          }}
        >
          {calenderEvents.length === 0 && workdays.length === 0 ? (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                color: isDarkMode ? C.textMuted : C_LIGHT.textMuted,
                fontSize: "13px",
              }}
            >
              No upcoming holidays in this category
            </div>
          ) : (
            <div>
              {calenderEvents?.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0,
                    marginBottom: 10,
                    borderRadius: "11px",
                    background: isDarkMode
                      ? "rgba(255,255,255,0.02)"
                      : C_LIGHT.surface,
                    border: `1px solid ${
                      isDarkMode ? C.border : C_LIGHT.border
                    }`,
                    overflow: "hidden",
                    boxShadow: !isDarkMode
                      ? "0 4px 14px rgba(15,23,42,0.04)"
                      : "none",
                  }}
                >
                  {/* Left accent */}
                  <div
                    style={{
                      width: 5,
                      flexShrink: 0,
                      background: isDarkMode ? C.red : C_LIGHT.red,
                      borderRadius: "11px 0 0 11px",
                    }}
                  />

                  {/* Date block */}
                  <div
                    style={{
                      width: 150,
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 6px",
                      background: isDarkMode
                        ? "rgba(255,255,255,0.02)"
                        : C_LIGHT.bg,
                      borderRight: `1px solid ${
                        isDarkMode ? C.border : C_LIGHT.border
                      }`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: isDarkMode ? C.red : C_LIGHT.red,
                        lineHeight: 1,
                      }}
                    >
                      {e?.day}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: "10px 12px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: isDarkMode ? C.text : C_LIGHT.text,
                        }}
                      >
                        {e?.title}
                      </span>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: isDarkMode ? C.sub : C_LIGHT.sub,
                        }}
                      >
                        {e?.description}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          background: isDarkMode ? C.redDim : C_LIGHT.redDim,
                          color: isDarkMode ? C.red : C_LIGHT.red,
                        }}
                      >
                        Holiday
                      </span>

                      <span
                        style={{
                          fontSize: "11px",
                          color: isDarkMode ? C.textSub : C_LIGHT.textSub,
                        }}
                      >
                        {moment(e?.date).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {workdays?.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0,
                    marginBottom: 10,
                    borderRadius: "11px",
                    background: isDarkMode
                      ? "rgba(255,255,255,0.02)"
                      : C_LIGHT.surface,
                    border: `1px solid ${
                      isDarkMode ? C.border : C_LIGHT.border
                    }`,
                    overflow: "hidden",
                    boxShadow: !isDarkMode
                      ? "0 4px 14px rgba(15,23,42,0.04)"
                      : "none",
                  }}
                >
                  {/* Left accent */}
                  <div
                    style={{
                      width: 5,
                      flexShrink: 0,
                      background: isDarkMode ? C.green : C_LIGHT.green,
                      borderRadius: "11px 0 0 11px",
                    }}
                  />

                  {/* Date block */}
                  <div
                    style={{
                      width: 150,
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 6px",
                      background: isDarkMode
                        ? "rgba(255,255,255,0.02)"
                        : C_LIGHT.bg,
                      borderRight: `1px solid ${
                        isDarkMode ? C.border : C_LIGHT.border
                      }`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: isDarkMode ? C.green : C_LIGHT.green,
                        lineHeight: 1,
                      }}
                    >
                      {e?.day}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: "10px 12px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: isDarkMode ? C.text : C_LIGHT.text,
                        }}
                      >
                        {e?.title}
                      </span>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: isDarkMode ? C.sub : C_LIGHT.sub,
                        }}
                      >
                        {e?.description}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          background: isDarkMode
                            ? C.greenDim
                            : C_LIGHT.greenDim,
                          color: isDarkMode ? C.green : C_LIGHT.green,
                        }}
                      >
                        Workday
                      </span>

                      <span
                        style={{
                          fontSize: "11px",
                          color: isDarkMode ? C.textSub : C_LIGHT.textSub,
                        }}
                      >
                        {moment(e?.date).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
