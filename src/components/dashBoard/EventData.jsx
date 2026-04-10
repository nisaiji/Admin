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
import { C } from "../../utils/constants";

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
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}
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
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: `1px solid ${C.borderSoft}`,
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
            <span style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
              Upcoming Holidays
            </span>
          </div>
        </div>
        {/* List */}
        <div style={{ padding: "12px 16px", flex: 1, overflowY: "auto" }}>
          {calenderEvents.length === 0 && workdays.length === 0 ? (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                color: C.textMuted,
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
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    overflow: "hidden",
                  }}
                >
                  {/* Left accent */}
                  <div
                    style={{
                      width: 5,
                      flexShrink: 0,
                      background: C.blue,
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
                      background: "rgba(255,255,255,0.02)",
                      borderRight: `1px solid ${C.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: C.red,
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
                          color: C.text,
                        }}
                      >
                        {e?.title}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: C.text,
                        }}
                      >
                        {e?.description}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          background: C?.redDim,
                          color: C?.red,
                        }}
                      >
                        Holiday
                      </span>
                      <span style={{ fontSize: "11px", color: C.textSub }}>
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
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    overflow: "hidden",
                  }}
                >
                  {/* Left accent */}
                  <div
                    style={{
                      width: 5,
                      flexShrink: 0,
                      background: C.blue,
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
                      background: "rgba(255,255,255,0.02)",
                      borderRight: `1px solid ${C.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: C.red,
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
                          color: C.text,
                        }}
                      >
                        {e?.title}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: C.text,
                        }}
                      >
                        {e?.description}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          background: C?.redDim,
                          color: C?.red,
                        }}
                      >
                        Workday
                      </span>
                      <span style={{ fontSize: "11px", color: C.textSub }}>
                        {moment(e?.date).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* <div style={{ padding:"10px 16px 14px",borderTop:`1px solid ${C.borderSoft}` }}>
        <button style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",
          padding:"9px",borderRadius:"10px",background:"rgba(255,255,255,0.03)",
          border:`1px solid ${C.border}`,color:C.blueBright,fontSize:"13px",fontWeight:700,cursor:"pointer",
          transition:"all 0.15s" }}
          onMouseEnter={e=>(e.currentTarget).style.background="rgba(10,129,209,0.1)"}
          onMouseLeave={e=>(e.currentTarget).style.background="rgba(255,255,255,0.03)"}>
          View Full Holiday Calendar <ChevronRight size={13} />
        </button>
      </div> */}
      </div>
    </motion.div>
  );
}
