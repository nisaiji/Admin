import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";
import { useSelector } from "react-redux";
import { C } from "../../utils/constants";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const HOLIDAY_TYPE_COLOR = {
  national: { color: "#4F8EF7", bg: "rgba(79,142,247,0.12)", label: "National" },
  religious: { color: "#CBD5E1", bg: "rgba(255,255,255,0.06)", label: "Religious" },
  regional: { color: "#4cbc9a", bg: "rgba(76,188,154,0.12)", label: "Regional" },
  school: { color: "#FBBF24", bg: "rgba(251,191,36,0.1)", label: "School" },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// CalendarComponent - Manages the logic of the calendar, events, and month navigation
const CalendarComponent = ({ events = [], workdays = [], updateDate }) => {
  const currentDate = new Date();
  const [today, setToday] = useState(currentDate);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(today.getDate());
  const [hovDay, setHovDay] = useState(null);

  const { classAndSectionData } = useSelector((state) => state.appAuth || {});

  // Handle month navigation
  const updateCalendar = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    setToday(new Date(newYear, newMonth, 1));
    if (updateDate) {
      updateDate({ month: newMonth, year: newYear });
    }
  };

  /**
   * Adjust calendar month when the session changes so that it stays
   * within the start and end year.
   */
  useEffect(() => {
    if (classAndSectionData?.selectedSession) {
      const sessionStartYear = classAndSectionData.selectedSession.academicStartYear;
      const sessionEndYear = classAndSectionData.selectedSession.academicEndYear;
      if (sessionStartYear && sessionEndYear) {
        const d = new Date();
        const minDate = new Date(sessionStartYear, 3, 1); // April 1st
        const maxDate = new Date(sessionEndYear, 2, 31, 23, 59, 59); // March 31st

        let targetDate = d;
        if (d < minDate) {
          targetDate = minDate;
        } else if (d > maxDate) {
          targetDate = maxDate;
        }

        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();
        setMonth(targetMonth);
        setYear(targetYear);
        setToday(targetDate);
        if (updateDate) updateDate({ month: targetMonth, year: targetYear });
      }
    }
  }, [classAndSectionData?.selectedSession]);

  /**
   * Handle previous month navigation.
   */
  const handlePrevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;

    const sessionStartYear = classAndSectionData?.selectedSession?.academicStartYear;
    if (sessionStartYear) {
      const minDate = new Date(sessionStartYear, 3, 1);
      const targetDate = new Date(newYear, newMonth, 1);
      if (targetDate < minDate) return;
    }

    updateCalendar(newMonth, newYear);
    setSelected(null);
  };

  /**
   * Handle next month navigation.
   */
  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;

    const sessionEndYear = classAndSectionData?.selectedSession?.academicEndYear;
    if (sessionEndYear) {
      const maxDate = new Date(sessionEndYear, 2, 1);
      const targetDate = new Date(newYear, newMonth, 1);
      if (targetDate > maxDate) return;
    }

    updateCalendar(newMonth, newYear);
    setSelected(null);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: prevDays - i, type: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: "curr" });
  while (cells.length < 42) cells.push({ day: cells.length - offset - daysInMonth + 1, type: "next" });

  const isToday = (d) =>
    d === currentDate.getDate() &&
    month === currentDate.getMonth() &&
    year === currentDate.getFullYear();

  // Map events to their specific day if they match year/month
  const holidayMap = new Map();
  events.forEach((event) => {
    if (event.title && event.date) {
      const d = new Date(event.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        holidayMap.set(d.getDate(), event);
      }
    }
  });

  const selectedHoliday = selected ? holidayMap.get(selected) : null;
  const selectedDateStr = selected
    ? new Date(year, month, selected).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const sessionStartYear = classAndSectionData?.selectedSession?.academicStartYear;
  const sessionEndYear = classAndSectionData?.selectedSession?.academicEndYear;

  const isPrevDisabled = sessionStartYear && month === 3 && year === sessionStartYear;
  const isNextDisabled = sessionEndYear && month === 2 && year === sessionEndYear;

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${C.borderSoft}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>Calendar</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={!isPrevDisabled ? handlePrevMonth : undefined}
              style={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${C.border}`,
                color: C.textSub,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isPrevDisabled ? "not-allowed" : "pointer",
                opacity: isPrevDisabled ? 0.3 : 1,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isPrevDisabled) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                if (!isPrevDisabled) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: "14px", color: C.text, fontWeight: 700, minWidth: "130px", textAlign: "center" }}>
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={!isNextDisabled ? handleNextMonth : undefined}
              style={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${C.border}`,
                color: C.textSub,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isNextDisabled ? "not-allowed" : "pointer",
                opacity: isNextDisabled ? 0.3 : 1,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isNextDisabled) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                if (!isNextDisabled) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
          {[
            { color: C.blue, label: "Today" },
            { color: C.red, label: "Holiday" },
            { color: C.amber, label: "Weekend" },
            { color: C.green, label: "Workday" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, display: "block" }} />
              <span style={{ fontSize: "11px", color: C.textSub }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
          {DAYS_SHORT.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "#686868", fontWeight: 700, padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((cell, i) => {
            const col = i % 7;
            const isSun = col === 6;
            const isSat = col === 5;
            const isCurr = cell.type === "curr";

            const hol = isCurr ? holidayMap.get(cell.day) : undefined;
            const isTod = isCurr && isToday(cell.day);
            const isSel = isCurr && selected === cell.day && !isTod;
            const isWknd = (isSun) && isCurr;
            const isHovr = isCurr && hovDay === cell.day;

            let bg = isCurr ? "#0f1117" : "transparent";
            let color = isCurr ? C.text : C.textMuted;
            let bdr = `1px solid ${isCurr ? "rgba(255,255,255,0.06)" : "transparent"}`;

            const targetDateStr = isCurr ? moment({ year, month, day: cell.day }).format("YYYY-MM-DD") : null;
            const isWorkday = isCurr && workdays.some((w) => moment(w.date).format("YYYY-MM-DD") === targetDateStr);

            if (isSun && !isWorkday && !hol && !isTod) {
              bg = "rgba(251,191,36,0.06)";
              color = C.amber;
            }
            if (isWorkday && !isTod) {
              bg = "rgba(76,188,154,0.1)";
              color = C.green;
              bdr = "1px solid rgba(76,188,154,0.2)";
            }
            if (hol && !isTod) {
              bg = "rgba(254,64,64,0.1)";
              color = C.red;
              bdr = "1px solid rgba(254,64,64,0.2)";
            }
            if (isSel) {
              bg = C.blueDim;
              color = "#7EB3FF";
              bdr = "1px solid rgba(79,142,247,0.35)";
            }
            if (isTod) {
              bg = C.blue;
              color = "#fff";
              bdr = `1px solid ${C.blue}`;
            }
            if (isHovr && !isTod && !isSel) {
              bg = "rgba(255,255,255,0.08)";
            }

            const holidayType = hol?.type || "school";

            return (
              <div
                key={i}
                // onClick={() => isCurr && setSelected(cell.day)}
                // onMouseEnter={() => isCurr && setHovDay(cell.day)}
                // onMouseLeave={() => setHovDay(null)}
                title={hol?.title}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "10px",
                  background: bg,
                  border: bdr,
                  color: color,
                  fontSize: "13px",
                  fontWeight: isTod || isSel ? 700 : 500,
                  // cursor: isCurr ? "pointer" : "default",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  position: "relative",
                  padding: 0,
                }}
              >
                {cell.day}
                {/* Holiday dot */}
                {hol && !isTod && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: HOLIDAY_TYPE_COLOR[holidayType]?.color || C.red,
                      display: "block",
                      position: "absolute",
                      bottom: 4,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day info */}
      {/* <div style={{ padding: "14px 16px 16px", marginTop: "auto" }}>
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: selectedHoliday ? "rgba(254,64,64,0.07)" : "rgba(79,142,247,0.06)",
                border: selectedHoliday ? "1px solid rgba(254,64,64,0.18)" : `1px solid rgba(79,142,247,0.14)`,
              }}
            >
              <div style={{ fontSize: "11px", color: C.textSub, marginBottom: 3 }}>{selectedDateStr}</div>
              {selectedHoliday ? (
                <>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.red, marginBottom: 2 }}>
                    {selectedHoliday.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background:
                          HOLIDAY_TYPE_COLOR[selectedHoliday.type || "school"]?.bg ||
                          HOLIDAY_TYPE_COLOR["school"].bg,
                        color:
                          HOLIDAY_TYPE_COLOR[selectedHoliday.type || "school"]?.color ||
                          HOLIDAY_TYPE_COLOR["school"].color,
                        fontWeight: 700,
                      }}
                    >
                      {HOLIDAY_TYPE_COLOR[selectedHoliday.type || "school"]?.label || "Event"}
                    </span>
                    {selectedHoliday.desc && (
                      <span style={{ fontSize: "11px", color: C.textSub }}>{selectedHoliday.desc}</span>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "13px", color: C.textSub }}>No events scheduled</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div> */}
      <Toaster />
    </div>
  );
};

export default CalendarComponent;
