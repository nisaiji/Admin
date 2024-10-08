import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import eventBack from "../../assets/images/eventBack.png";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";
import deleteEvent from "../../assets/images/deleteEvent.png";
import Search2 from "../../assets/images/Search2.png";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import moment from "moment";
import { useTranslation } from "react-i18next";
import CONSTANT from "../../utils/constants";

// Calendar Header Component
const Calendar = ({ month, year, onPrevMonth, onNextMonth }) => {
  const isDarkMode = false;

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#102945] " : "bg-white  "
      } calendar rounded-lg w-full `}
    >
      <div className="month flex items-center justify-between p-4 pl-14 pr-14 text-xl font-semibold rounded-lg h-11 w-12/12 capitalize border-2 border-[#7B79FF80]">
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
      className={`day cursor-pointer rounded-lg flex font-bold pl-2 pt-2 w-20 h-24 border-2  ${renderCss()}`}
      onClick={onClick}
    >
      {day}
    </div>
  );
};

const DaysGrid = ({ days }) => {
  return <div className="days grid grid-cols-7 gap-6 px-4 py-3">{days}</div>;
};

// Event Component
const Event = () => {
  const isAdmin = useSelector((state) => state.appAuth.role) === "admin";
  const isDarkMode = false;
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeDay, setActiveDay] = useState(today.getDate());
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState();
  const [t] = useTranslation();

  useEffect(() => {
    fetchEvents();
  }, [month]);

  // edit or update event form
  const EventForm = ({ isOpen, isClose, isSubmit, prevData }) => {
    const [newEventForm, setNewEventForm] = useState({
      title: prevData?.editData?.title || "",
      description: prevData?.editData?.description || "",
      holiday: prevData?.editData?.holiday || false,
      event: prevData?.editData?.event || false,
      date: prevData?.date ? moment(prevData.date).format("YYYY-MM-DD") : "",
    });
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setNewEventForm({
        ...newEventForm,
        [name]: type === "checkbox" ? checked : value,
      });
    };
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
          <h2 className="text-lg font-bold mb-4">
            {prevData?.editData?.eventId
              ? t("eventForm.title.edit")
              : t("eventForm.title.add")}
          </h2>
          <div className="mb-4">
            <input
              type="text"
              name="date"
              value={moment(newEventForm.date).format("YYYY-MM-DD")}
              readOnly
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="title"
              placeholder={t("eventForm.form.title")}
              value={newEventForm.title}
              onChange={handleChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <textarea
              name="description"
              placeholder={t("eventForm.form.description")}
              value={newEventForm.description}
              onChange={handleChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="holiday"
                checked={newEventForm.holiday}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">{t("events.holiday")}</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="event"
                checked={newEventForm.event}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">{t("events.event")}</span>
            </label>
          </div>
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg"
              onClick={() => isClose(false)}
            >
              {t("buttons.cancel")}
            </button>
            <button
              className="px-4 py-2 bg-blue-900 text-white rounded-lg"
              onClick={() =>
                isSubmit(newEventForm, prevData?.editData?.eventId)
              }
            >
              {prevData?.editData?.eventId
                ? t("buttons.update")
                : t("buttons.submit")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // get events api
  const fetchEvents = async () => {
    setEventLoading(true);
    try {
      const response = await axiosClient.post(EndPoints.COMMON.GET_EVENTS, {
        startTime: new Date(year, month, 1).getTime(),
        endTime: new Date(year, month + 1, 0).getTime(),
      });
      if (response?.statusCode === 200) {
        setEvents(
          response?.result?.sort((a, b) => new Date(a.date) - new Date(b.date))
        );
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setEventLoading(false);
    }
  };

  const handleToday = () => {
    const todayDate = new Date();
    setToday(todayDate);
    setMonth(todayDate.getMonth());
    setYear(todayDate.getFullYear());
    setActiveDay(todayDate.getDate());
  };

  const handleGotoDate = (e) => {
    const [mm, yyyy] = e.target.value;
    if (mm && yyyy && mm > 0 && mm < 13 && yyyy.length === 4) {
      updateCalendar(mm - 1, parseInt(yyyy));
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // check validations
  const validateForm = (form) => {
    if (!form.title.trim()) {
      toast.error(t("toasts.titleRequired"));
      return false;
    }
    if (!form.description.trim()) {
      toast.error(t("toasts.descRequired"));
      return false;
    }
    if (!form.holiday && !form.event) {
      toast.error(t("toasts.oneCheckbox"));
      return false;
    }
    return true;
  };

  // api for handeling register and update event
  const handleAddEvent = async (newEvent, eventId) => {
    try {
      setLoading(true);
      if (!validateForm(newEvent)) return;
      const formattedEvent = {
        ...newEvent,
        title: capitalizeFirstLetter(newEvent.title.trim()),
        description: capitalizeFirstLetter(newEvent.description.trim()),
        date: moment(newEvent.date).format("yyyy-MM-DD"),
      };
      let res;
      if (eventId) {
        delete formattedEvent.date;
        res = await axiosClient.put(
          `${EndPoints.ADMIN.UPDATE_EVENT}/${eventId}`,
          formattedEvent
        );
      } else {
        res = await axiosClient.post(
          EndPoints.ADMIN.REGISTER_EVENT,
          formattedEvent
        );
      }
      if (res?.statusCode === 200) {
        setShowAddEvent(false);
        fetchEvents();
        if (eventId) toast.success(t("messages.event.updateSuccess"));
        else toast.success(t("messages.event.createSuccess"));
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // handle month change
  const updateCalendar = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    setToday(new Date(newYear, newMonth, 1));
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

  // handle click on day
  const handleDayClick = (day, isEdit = false, editData) => {
    const todayDate = new Date();
    const currentYear = todayDate.getFullYear();
    const currentMonth = todayDate.getMonth();
    const currentDay = todayDate.getDate();

    setActiveDay(day);
    if (
      year > currentYear ||
      (year === currentYear && month > currentMonth) ||
      (year === currentYear && month === currentMonth && day >= currentDay)
    ) {
      let newTempEvent = { date: new Date(year, month, day) };
      if (isEdit) {
        newTempEvent = { ...newTempEvent, editData };
      }
      setNewEvent(newTempEvent);
      setShowAddEvent(true);
    }
  };

  // returns days grid
  const renderDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOffset = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOffset; i++)
      days.push(<div key={`empty-${i}`} className="empty" />);

    for (let day = 1; day <= daysInMonth; day++) {
      const isActive = day === activeDay;
      const targetDate = moment(new Date(year, month, day)).format(
        "YYYY-MM-DD"
      );

      const isSunday = new Date(year, month, day).getDay() === 0;
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const checkEventProperty = (events, property, returnValue = false) => {
        for (let event of events) {
          if (moment(event.date).format("YYYY-MM-DD") === targetDate) {
            if (event[property]) {
              return returnValue ? event[property] : true;
            }
          }
        }
        return returnValue ? null : false;
      };

      const hasEvent = checkEventProperty(events, "event");
      const isHoliday = checkEventProperty(events, "holiday");
      const title = checkEventProperty(events, "title", true);
      const description = checkEventProperty(events, "description", true);
      const eventId = checkEventProperty(events, "_id", true);

      const handleClick = () => {
        if (eventId) {
          handleDayClick(day, "edit", {
            eventId,
            title,
            description,
            holiday: isHoliday,
            event: hasEvent,
          });
        } else handleDayClick(day);
      };

      days.push(
        <Day
          key={day}
          day={day}
          isActive={isActive}
          hasEvent={hasEvent}
          isHoliday={isHoliday}
          onClick={handleClick}
          isSunday={isSunday}
          isToday={isToday}
        />
      );
    }
    return days;
  };

  // delete event api
  const confirmDeleteEvent = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_EVENT}/${eventToDelete}`
      );
      if (response?.statusCode === 200) {
        toast.success(t("messages.event.deleteSuccess"));
        setShowDeleteConfirmation(false);
        setLoading(false);
        setEvents(events.filter((event) => event._id !== eventToDelete));
      }
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-8 p-4  bg-[#f3f3ff]">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      {/* left view */}
      <div className="col-span-4 px-10 bg-white shadow-lg rounded-lg p-4 mt-5">
        <div className="flex justify-between items-center mb-10">
          <p className="text-4xl font-poppins-bold">
            {t("dashboard.calendar")}
          </p>
          <p className="text-xl text-[#7B79FF] font-poppins-bold">
            {moment(new Date()).format("D MMMM YYYY, dddd")}
          </p>
        </div>
        <Calendar
          className="px-10"
          month={month}
          year={year}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          handleMonthYearChange={updateCalendar}
        />
        <DaysGrid days={renderDays()} />
        <div
          className={`${
            isDarkMode ? "bg-[#102945]" : "text-blue-900"
          } goto-today flex items-center justify-between py-4 mx-5 rounded-xl`}
        >
          <div
            className={`${
              isDarkMode ? "border-purple-900" : ""
            } goto flex items-center border-2 border-[#8A89FA] rounded-md overflow-hidden`}
          >
            {/* search input */}
            <input
              type="text"
              placeholder={t("calendar.gotoDatePlaceholder")}
              className={`${
                isDarkMode ? "bg-gray-800 text-white" : ""
              } date-input w-full h-8 outline-none text-[#8A89FA] px-2`}
              onBlur={handleGotoDate}
            />
            <button
              className={`${
                isDarkMode ? "bg-blue-900" : "bg-[#e2e2ee]"
              } goto-btn px-3 py-1  text-white`}
            >
              <img src={Search2} alt="" className="h-6 w-7" />
            </button>
          </div>
          <button
            className="today-btn px-3 py-1 border-2 border-[#8A89FA] bg-[#f2f2ff] text-[#8A89FA] rounded-md"
            onClick={handleToday}
          >
            {t("buttons.today")}
          </button>
        </div>
      </div>
      {/* right view */}
      <div className="col-span-2 events-container relative bg-white shadow-lg rounded-lg p-4 mt-5 ">
        {eventLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
            <Spinner />
          </div>
        )}
        <div>
          <div className="text-2xl font-bold my-2 dark:text-white">
            {t("events.title")}
          </div>

          {events.length === 0 ? (
            <div className="relative w-full h-full">
              <img
                src={eventBack}
                alt="Event Background"
                className="absolute inset-0 w-auto h-auto object-cover"
              />
            </div>
          ) : (
            <ul className="overflow-y-auto max-h-[750px] mt-10">
              {/* list of events */}
              {events.map((itm) => (
                <div
                  key={itm["_id"]}
                  className=" mb-5 border border-gray-300 shadow-lg rounded-lg overflow-hidden "
                >
                  <div className="flex h-9 justify-between items-center bg-[#464590] text-white py-0 px-4 text-lg">
                    <div className="font-poppins-bold">
                      {moment(itm.date).format("DD-MM-YYYY")}, {itm.day}
                    </div>
                    {/* delete icon for admin */}
                    {isAdmin && (
                      <img
                        src={deleteEvent}
                        onClick={() => {
                          setEventToDelete(itm._id);
                          setShowDeleteConfirmation(true);
                        }}
                        className="size-5 cursor-pointer"
                      />
                    )}
                  </div>
                  <div className="bg-[#f2f2ff]">
                    <div className="flex py-2 justify-between items-center">
                      <div
                        className={`${
                          isDarkMode ? "bg-[#102945] text-white" : " "
                        } py-0 px-4 ml-2 text-2xl font-poppins-bold text-ellipsis whitespace-nowrap overflow-hidden`}
                      >
                        {itm.title}
                      </div>
                      {itm.holiday && (
                        <div className="px-3 mr-3 w-20 rounded-3xl bg-[#d91111] text-white ">
                          {t("dashboard.holiday")}
                        </div>
                      )}
                    </div>
                    <div className="flex pb-3 justify-between items-center">
                      <div
                        className={`${
                          isDarkMode ? "bg-[#102945] text-white" : " "
                        } py-0 px-4 ml-2 text-lg font-poppins-regular text-ellipsis whitespace-nowrap overflow-hidden`}
                      >
                        {itm.description}
                      </div>
                      {itm.event && (
                        <div className="px-3 mr-3 w-20 text-center rounded-3xl bg-[#464590] text-white">
                          {t("dashboard.Event")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>

      <EventForm
        isOpen={showAddEvent}
        isClose={setShowAddEvent}
        isSubmit={handleAddEvent}
        prevData={newEvent}
      />

      {/* delete popup */}
      {showDeleteConfirmation && (
        <DeletePopup
          isVisible={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onDelete={confirmDeleteEvent}
        />
      )}
      <Toaster />
    </div>
  );
};

export default Event;
