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
import { t } from "i18next";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Calendar = ({
  month,
  year,
  handlePrevMonth,
  handleNextMonth,
  handleMonthYearChange,
}) => {
  // const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const isDarkMode = false;
  const { t } = useTranslation();
  const [inputMonth, setInputMonth] = useState(month + 1);
  const [inputYear, setInputYear] = useState(year);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "month") {
      setInputMonth(value);
    } else if (name === "year") {
      setInputYear(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleMonthYearChange(parseInt(inputMonth) - 1, parseInt(inputYear));
  };

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
          onClick={handlePrevMonth}
        />
        <div className={`${isDarkMode ? "text-white" : ""} date`}>
          {`${months[month]} ${year}`}
        </div>
        <FontAwesomeIcon
          icon={faAngleRight}
          className={`${
            isDarkMode ? "text-white" : "text-red-600"
          } cursor-pointer size-6`}
          onClick={handleNextMonth}
        />
      </div>
      <div
        className={`${
          isDarkMode ? "text-white" : "text-[#1F317D]"
        } weekdays grid grid-cols-7 text-md font-medium capitalize pt-4`}
      >
        {[
          t("calendar.sunday"),
          t("calendar.monday"),
          t("calendar.tuesday"),
          t("calendar.wednesday"),
          t("calendar.thursday"),
          t("calendar.friday"),
          t("calendar.saturday"),
        ].map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

const Day = ({
  day,
  isActive,
  hasEvent,
  isHoliday,
  onClick,
  isSunday,
  isToday,
}) => {
  // const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const isDarkMode = false;

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

const Event = () => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isAdmin = useSelector((state) => state.appAuth.role) === "admin";
  // const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const isDarkMode = false;
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeDay, setActiveDay] = useState(today.getDate());
  const [eventsArr, setEventsArr] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState();
  const dayName = dayNames[today.getDay()];
  const monthName = monthNames[today.getMonth()];
  const { t } = useTranslation();

  useEffect(() => {
    fetchEvents();
  }, [month]);

  const EventForm = ({ isOpen, isClose, isSubmit, prevData }) => {
    const [newEventForm, setNewEventForm] = useState({
      title: prevData?.editData?.title || "",
      description: prevData?.editData?.description || "",
      holiday: prevData?.editData?.holiday || false,
      event: prevData?.editData?.event || false,
      date: prevData?.date ? moment(prevData.date).format("YYYY-MM-DD") : "",
    });
    // console.log('prevdata',prevData);
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setNewEventForm({
        ...newEventForm,
        [name]: type === "checkbox" ? checked : value,
      });
    };

    // console.log("newEventForm", newEventForm);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
          <h2 className="text-lg font-bold mb-4">
            {prevData?.editData?.eventId ? "Edit Event" : "Add New Event"}
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
              placeholder="Title"
              value={newEventForm.title}
              onChange={handleChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <textarea
              name="description"
              placeholder="Description"
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
              {t("events.cancel")}
            </button>
            <button
              className="px-4 py-2 bg-blue-900 text-white rounded-lg"
              onClick={() =>
                isSubmit(newEventForm, prevData?.editData?.eventId)
              }
            >
              {prevData?.editData?.eventId ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const fetchEvents = async () => {
    try {
      setEventLoading(true);
      const startTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      ).getTime();
      const endTime = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getTime();
      const response = await axiosClient.post(EndPoints.COMMON.GET_EVENTS, {
        startTime,
        endTime,
      });
      if (response?.statusCode === 200) {
        const sortedEvents = response.result.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setEventsArr(sortedEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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
    // setNewEvent({ ...newEvent, date: todayDate }); // need to discuss
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

  const handleAddEvent = async (newEvent, eventId) => {
    try {
      // console.log(eventId, "eventid");
      if (!newEvent.title.trim()) {
        toast.error(t("events.titleRequired"));
        return;
      }
      if (!newEvent.description.trim()) {
        toast.error(t("events.descRequired"));
        return;
      }
      if (!newEvent.holiday && !newEvent.event) {
        toast.error(t("events.oneCheckbox"));
        return;
      }
      setLoading(true);
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
        if (eventId) toast.success(t("events.eventUpdated"));
        else toast.success(t("events.eventCreated"));
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

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

  const handleMonthYearChange = (newMonth, newYear) => {
    updateCalendar(newMonth, newYear);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

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
      const targetDate = moment(new Date(year, month, day)).format(
        "YYYY-MM-DD"
      );

      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const checkEventProperty = (eventsArr, property, returnValue = false) => {
        for (let event of eventsArr) {
          if (moment(event.date).format("YYYY-MM-DD") === targetDate) {
            if (event[property]) {
              return returnValue ? event[property] : true;
            }
          }
        }
        return returnValue ? null : false;
      };

      const hasEvent = checkEventProperty(eventsArr, "event");
      const isHoliday = checkEventProperty(eventsArr, "holiday");
      const title = checkEventProperty(eventsArr, "title", true);
      const description = checkEventProperty(eventsArr, "description", true);
      const eventId = checkEventProperty(eventsArr, "_id", true);

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

  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteEvent = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_EVENT}/${eventToDelete}`
      );
      if (response?.statusCode === 200) {
        toast.success(t("events.eventDeleted"));
        setShowDeleteConfirmation(false);
        setLoading(false);
        setEventsArr(eventsArr.filter((event) => event._id !== eventToDelete));
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-8 p-4  bg-[#f3f3ff]">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div className="col-span-4 px-10 bg-white shadow-lg rounded-lg p-4 mt-5">
        <div className="flex justify-between items-center mb-10">
          <p className="text-4xl font-poppins-bold">
            {t("dashboard.calendar")}
          </p>
          <p className="text-xl text-[#7B79FF] font-poppins-bold">
            {/* {activeDay} {monthName} {year},{dayName} */}
            {moment(new Date()).format("D MMMM YYYY, dddd")}
          </p>
        </div>
        <Calendar
          className="px-10"
          month={month}
          year={year}
          handlePrevMonth={handlePrevMonth}
          handleNextMonth={handleNextMonth}
          handleMonthYearChange={handleMonthYearChange}
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
            <input
              type="text"
              placeholder="mm/yyyy"
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
            {t("dashboard.today")}
          </button>
        </div>
      </div>
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

          {eventsArr.length === 0 ? (
            <div className="relative w-full h-full">
              <img
                src={eventBack}
                alt="Event Background"
                className="absolute inset-0 w-auto h-auto object-cover"
              />
            </div>
          ) : (
            <ul className="overflow-y-auto max-h-[750px] mt-10">
              {eventsArr.map((itm) => (
                <div
                  key={itm["_id"]}
                  className=" mb-5 border border-gray-300 shadow-lg rounded-lg overflow-hidden "
                >
                  <div className="flex h-9 justify-between items-center bg-[#464590] text-white py-0 px-4 text-lg">
                    <div className="font-poppins-bold">
                      {moment(itm.date).format("DD-MM-YYYY")}, {itm.day}
                    </div>
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
