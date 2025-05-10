import React, { useState } from "react";
import DownArroww from "../../assets/images/dropdown.png";
import DownArrow from "../../assets/images/darkmode/downArrow.png";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";
import CONSTANT from "../../utils/constants";
import { useSelector } from "react-redux";

// CalendarComponent - Manages the logic of the calendar, events, and month navigation
const CalendarComponent = ({ events, workdays, updateDate }) => {
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

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
      days.push(<div key={`empty-${i}`} className={`empty`}></div>);
    }
    // Add day cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const targetDate = moment({ year, month, day }).format("YYYY-MM-DD");
      const isSunday =
        new Date(year, month, day).getDay() === 0 &&
        !workdays.some(
          (w) => moment(w.date).format("YYYY-MM-DD") === targetDate
        );
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const isHoliday = events.some(
        (event) =>
          event.title &&
          new Date(event.date).toDateString() ===
            new Date(year, month, day).toDateString()
      );

      days.push(
        <Day
          key={day}
          day={day}
          isHoliday={isHoliday}
          isSunday={isSunday}
          isToday={isToday}
        />
      );
    }
    return days;
  };

  // Calendar Component - Displays a calendar with month navigation and event handling
  const Calendar = ({ month, year, onPrevMonth, onNextMonth }) => {
    return (
      <div className={`bg-transparent rounded-lg w-full`}>
        {/* Month Navigation */}
        <div
          className={`month flex items-center justify-between py-4 px-10 text-[16px] font-medium rounded-[8px] h-8 capitalize border-2 ${
            isDarkMode ? "border-borderLine" : "border-borderWhite3"
          }`}
        >
          <img
            src={isDarkMode ? DownArrow : DownArroww}
            alt=""
            className={`size-5 rotate-90 cursor-pointer`}
            onClick={onPrevMonth}
          />
          <div
            className={`${isDarkMode ? "text-textPrimary" : "text-textBlack"}`}
          >
            {moment({ year, month }).format("MMMM YYYY")}
          </div>
          <img
            src={isDarkMode ? DownArrow : DownArroww}
            alt=""
            className={`size-5 -rotate-90 cursor-pointer`}
            onClick={onNextMonth}
          />
        </div>
        {/* Weekdays header */}
        <div className={`grid grid-cols-7 font-medium capitalize pt-4`}>
          {CONSTANT.WEEKDAYS1.map((day) => (
            <div
              key={day}
              className={`text-center text-md ${
                isDarkMode ? "text-textBlue" : "text-textBlack"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day Component - Displays each day in the calendar with appropriate styling
  const Day = ({ day, isHoliday, onClick, isSunday, isToday }) => {
    const renderCss = () => {
      if (isHoliday) {
        return `text-textPrimary bg-backgroundRed border-borderRed`;
      } else if (isSunday) {
        return `${
          isDarkMode
            ? "bg-backgroundOrange border-borderHoliday"
            : "bg-backgroundOrange2 border-borderOrange"
        } text-textHoliday`;
      } else if (isToday) {
        return `${
          isDarkMode
            ? "text-textBlue bg-backgroundGrayDays border-borderBlue"
            : "text-textDarkBlue bg-whiteBackground2 border-borderDarkBlue"
        }`;
      } else {
        return `${
          isDarkMode
            ? "text-textPrimary bg-backgroundGrayDays border-borderGray3"
            : "text-textBlack bg-whiteBackground2 border-borderWhite3"
        }`;
      }
    };

    return (
      <div
        className={`day cursor-pointer rounded-[12px] flex font-bold text-[14px] p-2 w-[60px] h-[70px] border-[3px]  ${renderCss()}`}
        onClick={onClick}
      >
        {day}
      </div>
    );
  };

  // Days Grid Component - Displays all the days of the month in a grid layout
  const DaysGrid = ({ days }) => {
    return (
      <div
        className={`days grid grid-cols-7 gap-4 p-3 justify-center items-center`}
      >
        {days}
      </div>
    );
  };

  return (
    <div className={` p-4 rounded-lg`}>
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
