import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import moment from "moment";
import CONSTANT from "../../utils/constants";

const Calendar = ({ month, year, onPrevMonth, onNextMonth }) => {
  const isDarkMode = false;

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#102945] " : "bg-white  "
      } calendar rounded-lg w-full `}
    >
      <div className="month flex items-center justify-between p-4 pl-14 pr-14 text-xl font-semibold rounded-lg h-10 w-12/12 capitalize border-2 border-[#7B79FF80]">
        <FontAwesomeIcon
          icon={faAngleLeft}
          className={`${
            isDarkMode ? "text-white" : "text-red-600"
          } cursor-pointer size-6`}
          onClick={onPrevMonth}
        />
        <div className={`${isDarkMode ? "text-white" : ""} date`}>
          {moment({ year, month }).format("MMMM YYYY")}
        </div>
        <FontAwesomeIcon
          icon={faAngleRight}
          className={`${
            isDarkMode ? "text-white" : "text-red-600"
          } cursor-pointer size-6`}
          onClick={onNextMonth}
        />
      </div>
      <div
        className={`${
          isDarkMode ? "text-white" : "text-[#1F317D]"
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

// return days of month with handling styles
const Day = ({ day, hasEvent, isHoliday, onClick, isSunday, isToday }) => {
  const renderCss = () => {
    if (isHoliday && hasEvent) {
      return `
        text-white
        bg-gradient-to-br from-[#D91111] from-45% via-[#ffffff] to-[#464590] to-55%
        border-[#D91111] border-t-0 border-r-0 border-b-0 border-l-0
        `;
    } else if (isHoliday) {
      return `text-white bg-[#D91111] border-[#D91111]`;
    } else if (hasEvent) {
      return `text-white bg-[#464590] border-[#464590]`;
    } else if (isSunday) {
      return `text-[#FF9933] bg-[#FFE5CC] border-[#ff9933]`;
    } else {
      return `text-[#7B79FF] bg-[#8b89fa1a] border-[#b7b5ff] ${
        isToday ? `border-2 border-slate-600 border-[#7B79FF]` : ""
      }`;
    }
  };

  return (
    <div
      className={`day ${renderCss()}
       cursor-pointer rounded-lg flex font-bold pl-2 pt-2 w-20 h-[85px]`}
      onClick={onClick}
    >
      {day}
    </div>
  );
};

const DaysGrid = ({ days }) => {
  return <div className="days grid grid-cols-7 gap-2 p-2 pl-6 ">{days}</div>;
};

// Calendar component
const CalendarComponent = ({ updateDate }) => {
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeDay, setActiveDay] = useState(today.getDate());
  const [eventsArr, setEventsArr] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [month]);

  // get event api
  const fetchEvents = async () => {
    try {
      const response = await axiosClient.post(EndPoints.COMMON.GET_EVENTS, {
        startTime: new Date(year, month, 1).getTime(),
        endTime: new Date(year, month + 1, 0).getTime(),
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

  // handle month change
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
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="empty"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isActive = day === activeDay;
      const isSunday = new Date(year, month, day).getDay() === 0;
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const hasEvent = eventsArr.some(
        (event) =>
          event.event &&
          new Date(event.date).toDateString() ===
            new Date(year, month, day).toDateString()
      );
      const isHoliday = eventsArr.some(
        (event) =>
          event.holiday &&
          new Date(event.date).toDateString() ===
            new Date(year, month, day).toDateString()
      );

      days.push(
        <Day
          key={day}
          day={day}
          isActive={isActive}
          hasEvent={hasEvent}
          isHoliday={isHoliday}
          isSunday={isSunday}
          isToday={isToday}
        />
      );
    }
    return days;
  };

  return (
    <div className=" p-6 rounded-lg  mr-4 mb-4">
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
