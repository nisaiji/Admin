import React, { useEffect, useState } from "react";
import Spinner from "../../Spinner";
import Breadcrumbs from "../../BreadCrumbs";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import moment from "moment";
import CONSTANT from "../../../utils/constants";
import toast from "react-hot-toast";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";

import DownArroww from "../../../assets/images/dropdown.png";
import DownArrow from "../../../assets/images/darkmode/downArrow.png";
import profileEmpty from "../../../assets/images/profileEmpty.png";
import menu2 from "../../../assets/images/darkmode/menu2.png";
import calb from "../../../assets/images/darkmode/calb.png";
import bell from "../../../assets/images/darkmode/bell.png";
import noteacher from "../../../assets/images/noteacher.png";

export default function Tags() {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [loading, setLoading] = useState(false);
  const [t] = useTranslation();
  const [events, setEvents] = useState([]);
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    moment(today).format("YYYY-MM-DD")
  );

  /**
   * Fetch events and workdays for the selected month.
   */
  const fetchEvents = async () => {
    if (!classAndSectionData?.selectedSession?._id) return;
    setLoading(true);
    try {
      const response = await axiosClient.post(EndPoints.ADMIN.GET_TAGS, {
        startTime: new Date(year, month, 1).getTime(),
        endTime: new Date(year, month + 1, 0, 23, 59, 59, 999).getTime(),
        sectionId: classAndSectionData?.sectionId,
      });
      //   console.log(response);

      if (response?.statusCode === 200) {
        setEvents(
          response?.result?.sort((a, b) => new Date(a.date) - new Date(b.date))
        );
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch events and workdays for the selected month from the backend.
   */
  useEffect(() => {
    fetchEvents();
  }, [month, classAndSectionData?.sectionId]);

  /**
   * Handle previous month navigation.
   */
  const handlePrevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setToday(new Date(newYear, newMonth, 1));
  };

  /**
   * Handle next month navigation.
   */
  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setToday(new Date(newYear, newMonth, 1));
  };

  /** Handle day click */
  const handleDayClick = (day) => {
    const date = moment({ year, month, day }).format("YYYY-MM-DD");
    setSelectedDate(date);
  };

  /** Filter events for the selected date */
  const filteredEvents = events.filter(
    (ev) => moment(ev.date).format("YYYY-MM-DD") === selectedDate
  );

  /**
   * Render the days grid for the calendar.
   * @returns {JSX.Element[]}
   */
  const renderDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOffset = new Date(year, month, 1).getDay();
    const days = [];

    // Create a Set of event dates for faster lookup
    const eventDates = new Set(
      events.map((ev) => moment(ev.date).format("YYYY-MM-DD"))
    );

    // Add empty divs for the days before the 1st of the month
    for (let i = 0; i < firstDayOffset; i++)
      days.push(<div key={`empty-${i}`} className={`empty`} />);

    // Add day cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = moment({ year, month, day }).format("YYYY-MM-DD");
      const isSunday = moment(date).day() === 0;
      const isSelected = selectedDate === date;
      const hasEvent = eventDates.has(date);

      const renderCss = () => {
        if (isSelected) {
          return `${
            isDarkMode
              ? "bg-[#0A81D1] border-[#0A81D1] text-textPrimary"
              : "bg-backgroundLightBlue border-borderBlue text-textBlue"
          }`;
        } else if (isSunday && !hasEvent) {
          return `${
            isDarkMode
              ? "bg-backgroundOrange border-borderHoliday"
              : "bg-backgroundOrange2 border-borderOrange"
          } text-textHoliday`;
        } else {
          return `${
            isDarkMode
              ? "text-textPrimary bg-backgroundGrayDays border-borderGray3"
              : "text-textBlack bg-whiteBackground2 border-borderWhite3"
          }`;
        }
      };

      days.push(
        <div
          className={`day cursor-pointer rounded-[12px] flex flex-col border-[3px] font-bold text-[16px] p-2 w-[60px] h-[70px] ${renderCss()}`}
          onClick={() => handleDayClick(day)}
        >
          <span>{day}</span>

          {/* White rectangle indicator if there’s an event */}
          {hasEvent && (
            <div
              className={`w-[8px] h-[30px] rounded-[4px] ${
                isDarkMode ? "bg-[#E3E8F3]" : "bg-backgroundBlue"
              }`}
            />
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div
      className={`select-none grid grid-cols-6 gap-6 p-6 ${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      }`}
    >
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-whiteBackground bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      {/* left view */}
      <div
        className={`col-span-4 px-10 ${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } rounded-[16px] p-4`}
      >
        <Breadcrumbs />
        <div className={`flex justify-between items-center mb-3`}>
          <p
            className={`text-2xl ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            } font-poppins-bold`}
          >
            {t("dashboard.tags")}
          </p>
        </div>
        <hr
          className={`mb-4 border ${
            isDarkMode ? "border-borderLine" : "border-borderWhite3"
          }`}
        />
        <div className={`bg-transparent rounded-lg w-full`}>
          {/* Month Navigation */}
          <div
            className={`month flex items-center justify-between py-[20px] px-10 mx-10 text-[16px] font-medium rounded-[14px] h-8 capitalize border-2 ${
              isDarkMode ? "border-borderLine" : "border-borderWhite3"
            }`}
          >
            <img
              src={isDarkMode ? DownArrow : DownArroww}
              alt=""
              className={`size-5 rotate-90 cursor-pointer`}
              onClick={handlePrevMonth}
            />
            <div
              className={`${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              }`}
            >
              {moment({ year, month }).format("MMMM YYYY")}
            </div>
            <img
              src={isDarkMode ? DownArrow : DownArroww}
              alt=""
              className={`size-5 -rotate-90 cursor-pointer`}
              onClick={handleNextMonth}
            />
          </div>
          {/* Weekdays header */}
          <div className={`pt-4 grid grid-cols-7 gap-[10px] mx-10`}>
            {CONSTANT.WEEKDAYS1.map((day) => (
              <div
                key={day}
                className={`text-center font-medium capitalize text-md ${
                  isDarkMode ? "text-textBlue" : "text-textBlack"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className={`grid grid-cols-7 ml-8 gap-[10px] px-8 py-3`}>
          {renderDays()}
        </div>
      </div>
      <div
        className={`col-span-2 relative ${
          isDarkMode
            ? "bg-gradient-to-l from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } rounded-[16px] py-3 px-4`}
      >
        <div>
          <div className="flex justify-between items-center">
            <div
              className={`text-2xl text-center font-bold my-2 pb-1 ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              }`}
            >
              {t("dashboard.schedule")}
            </div>
            <div className="flex items-center bg-[#0A81D11A]  px-2 py-1 rounded-md gap-2">
              <img src={calb} alt="" className="size-6" />
              <div className="text-textBlue font-poppins-bold text-base">
                {moment(selectedDate).format("dddd, D MMMM, YYYY")}
              </div>
            </div>
          </div>
          <hr
            className={`mb-6 border-t ${
              isDarkMode ? "border-borderLine" : "border-borderWhite3"
            }`}
          />
          {filteredEvents.length === 0 ? (
            <div className={`relative top-30 w-full h-full`}>
              <img
                src={noteacher}
                alt="noevents"
                className={`absolute inset-0 w-auto h-auto object-cover`}
              />
            </div>
          ) : (
            <ul className="overflow-y-auto max-h-[450px] mt-4">
              {filteredEvents?.map((itm, index) => (
                <div
                  key={index}
                  className="mb-4 rounded-xl bg-[#0A81D11A] text-white font-poppins p-4 border border-[#0A81D140] border-l-[14px] border-l-[#0A81D1]"
                >
                  {/* Teacher name */}
                  <div className="flex items-center mb-2">
                    <img
                      src={
                        itm?.teacherPhoto
                          ? `data:image/jpeg;base64,${itm?.teacherPhoto}`
                          : profileEmpty
                      }
                      alt="teacher"
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="font-poppins-regular text-[16px]">
                      {itm?.teacherFirstName} {itm?.teacherLastName}
                    </span>
                  </div>

                  <hr
                    className={`mb-3 border-t ${
                      isDarkMode ? "border-[#68686880]" : "border-borderWhite3"
                    }`}
                  />

                  {/* Subject */}
                  <div className="flex items-center mb-2 gap-2">
                    <img src={bell} alt="" className="size-5" />
                    <span className="font-poppins-bold text-sm text-textPrimary">
                      {itm?.title}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-2">
                    <img src={menu2} alt="" className="size-5" />
                    <span className="font-poppins-regular text-xs text-textPrimary">
                      {itm?.description}
                    </span>
                  </div>
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
