import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import moment from "moment";
import CONSTANT from "../../utils/constants";

// Calendar Component - Displays a calendar with month navigation and event handling
const Calendar = ({ month, year, onPrevMonth, onNextMonth }) => {
  const isDarkMode = false;

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#102945] " : "bg-[#fafafa]  "
      } calendar pl-4 rounded-lg w-full `}
    >
      {/* Month Navigation */}
      <div className="month flex items-center justify-between p-4 pl-14 pr-14 text-l font-medium rounded-lg h-10 w-12/12 capitalize border-2 border-[rgba(196, 196, 196, 0.25)] ">
        <FontAwesomeIcon
          icon={faAngleLeft}
          className={`${
            isDarkMode
              ? "text-white"
              : "text-[#686868] hover:bg-[#E9EEF2] rounded-2xl p-1"
          } cursor-pointer size-4`}
          onClick={onPrevMonth}
        />
        <div className={`${isDarkMode ? "text-white" : ""} date`}>
          {moment({ year, month }).format("MMMM YYYY")}
        </div>
        <FontAwesomeIcon
          icon={faAngleRight}
          className={`${
            isDarkMode
              ? "text-white"
              : "text-[#686868] hover:bg-[#E9EEF2] rounded-2xl p-1"
          } cursor-pointer size-4`}
          onClick={onNextMonth}
        />
      </div>
      {/* Weekdays header */}
      <div
        className={`${
          isDarkMode ? "text-white" : "text-[#040320]"
        } weekdays grid grid-cols-7 text-md font-medium capitalize pt-4`}
      >
        {CONSTANT.WEEKDAYS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};
// Day Component - Displays each day in the calendar with appropriate styling
const Day = ({ day, isHoliday, onClick, isSunday, isToday }) => {
  // Render CSS classes based on day conditions (holiday, Sunday, today)
  const renderCss = () => {
    if (isHoliday) {
      return `text-white bg-[#FE4040] border-[#FE4040]`;
    } else if (isSunday) {
      return `text-[#F29E38] bg-[#F29E38]/10 border-[#F29E38]`;
    } else if (isToday) {
      return `text-[#0F4189] bg-[#E9EEF2] border-4 border-[#0F4189]`;
    } else {
      return `text-black border-[#6E6F8126] bg-[#E9EEF2]`;
    }
  };

  return (
    <div
      className={`day ${renderCss()}
       cursor-pointer rounded-[12px] flex font-bold ml-3 p-3 w-[60px] h-[70px]`}
      onClick={onClick}
    >
      {day}
    </div>
  );
};

// Days Grid Component - Displays all the days of the month in a grid layout
const DaysGrid = ({ days }) => {
  return (
    <div className="days grid grid-cols-7 gap-4 p-3 justify-center items-center">
      {days}
    </div>
  );
};

// CalendarComponent - Manages the logic of the calendar, events, and month navigation
const CalendarComponent = ({ updateDate }) => {
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeDay, setActiveDay] = useState(today.getDate());
  const [eventsArr, setEventsArr] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [month]);

  // Fetch events for the selected month
  const fetchEvents = async () => {
    try {
      const response = await axiosClient.post(EndPoints.COMMON.GET_EVENTS, {
        startTime: new Date(year, month, 1).getTime(),
        endTime: new Date(year, month + 1, 0, 23, 59, 59, 999).getTime(),
      });
      if (response?.statusCode === 200) {
        const sortedEvents = response.result.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setEventsArr(sortedEvents);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  // Handle month navigation (previous/next month)
  const updateCalendar = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    setToday(new Date(newYear, newMonth, 1));
    updateDate({ month: newMonth, year: newYear });
  };

  const handlePrevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    updateCalendar(newMonth, newYear);
  };

  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    updateCalendar(newMonth, newYear);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // returns days grid
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];
    // Add empty divs for the days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="empty"></div>);
    }
    // Add day cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isActive = day === activeDay;
      const isSunday = new Date(year, month, day).getDay() === 0;
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const isHoliday = eventsArr.some(
        (event) =>
          event.title &&
          new Date(event.date).toDateString() ===
            new Date(year, month, day).toDateString()
      );

      days.push(
        <Day
          key={day}
          day={day}
          isActive={isActive}
          isHoliday={isHoliday}
          isSunday={isSunday}
          isToday={isToday}
        />
      );
    }
    return days;
  };

  return (
    <div className=" p-4 rounded-lg  mr-4 mb-4">
      <Calendar
        month={month}
        year={year}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        handleMonthYearChange={updateCalendar}
      />
      <DaysGrid days={renderDays()} />
      <Toaster />
    </div>
  );
};

export default CalendarComponent;
