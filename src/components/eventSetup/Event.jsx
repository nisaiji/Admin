import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import noevents from "../../assets/images/noevents.png";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
// import "tailwindcss/tailwind.css";
import deleteEvent from "../../assets/images/deleteEvent.png";
import Search from "../../assets/images/Search.png";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import moment from "moment";
import { useTranslation } from "react-i18next";
import CONSTANT from "../../utils/constants";
import Breadcrumbs from "../BreadCrumbs";

// Calendar Component - Displays a calendar with month navigation and event handling
const Calendar = ({ month, year, onPrevMonth, onNextMonth }) => {
  const isDarkMode = false;

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#102945] " : "bg-[#fafafa]  "
      } calendar pl-16 rounded-lg w-full `}
    >
      {/* Month Navigation */}
      <div className="month flex items-center justify-between py-4 px-10 text-[16px] font-medium rounded-[8px] h-8 w-11/12 capitalize border-2 border-[rgba(196, 196, 196, 0.50)]">
        <FontAwesomeIcon
          icon={faAngleLeft}
          className={`${
            isDarkMode
              ? "text-white"
              : "text-[#686868] hover:bg-[#E9EEF2] rounded-2xl p-1"
          } cursor-pointer size-5`}
          onClick={onPrevMonth}
          data-testid="prev"
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
          } cursor-pointer size-5`}
          onClick={onNextMonth}
          data-testid="next"
        />
      </div>
      {/* Weekdays header */}
      <div
        className={`${
          isDarkMode ? "text-white" : "text-[#6E6F81]/75"
        } weekdays grid grid-cols-7 pl-6 text-sm font-medium capitalize pt-3`}
      >
        {CONSTANT.WEEKDAYS.map((day) => (
          <div key={day} className="text-left">
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
      return `text-white bg-[#FE4040] border-[#FE4040]`;
    } else if (isSunday) {
      return `text-[#F29E38] bg-[#F29E38]/5 border-[#F29E38]/25`;
    } else if (isToday) {
      return `text-[#0F4189] bg-[#E9EEF2] border-4 border-[#0F4189]`;
    } else {
      return `text-black border-[#6E6F81]/15 bg-[#E9EEF2]`;
    }
  };

  return (
    <div
      className={`day cursor-pointer rounded-[12px] flex font-bold text-[14px] p-2 w-[60px] h-[70px] border-2  ${renderCss()}`}
      onClick={onClick}
    >
      {day}
    </div>
  );
};

// Days Grid Component - Displays all the days of the month in a grid layout
const DaysGrid = ({ days }) => {
  return (
    <div className="days grid grid-cols-7 ml-10 gap-[10px] px-8 py-3">
      {days}
    </div>
  );
};

// Event - Manages the logic of the calendar, events, and month navigation
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
  const [disableButton, setDisableButton] = useState(false);
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

    const isFormValid = newEventForm.title.trim() !== "";

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-[#fafafa] p-6 rounded-lg w-80">
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
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-[#6E6F81]/15 rounded-lg"
              onClick={() => isClose(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  isClose(false);
                }
              }}
            >
              {t("buttons.cancel")}
            </button>
            <button
              className={`px-4 py-2 bg-[#0F4189] text-white rounded-lg ${
                isFormValid ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              disabled={loading || !isFormValid}
              onClick={() =>
                isSubmit(newEventForm, prevData?.editData?.eventId)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  isSubmit(newEventForm, prevData?.editData?.eventId);
                }
              }}
            >
              {prevData?.editData?.eventId
                ? t("buttons.update")
                : t("buttons.submit")}
            </button>
          </div>
        </div>
      </div>
      // <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      //   <div class="bg-white rounded-2xl p-6 w-96 shadow-lg">
      //     <div class="flex justify-between items-center border-b pb-2">
      //       <h2 class="text-lg font-semibold text-gray-700">
      //         Remove Sunday Holiday Title
      //       </h2>
      //       <button class="text-gray-500 hover:text-gray-700">&times;</button>
      //     </div>

      //     <div class="mt-4">
      //       <label class="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
      //         <span class="text-gray-500">📅</span>
      //         <span class="text-gray-700">Sunday, March 16</span>
      //       </label>
      //     </div>

      //     <div class="mt-4">
      //       <label class="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
      //         <span class="text-gray-500">☰</span>
      //         <input
      //           type="text"
      //           placeholder="Add Description"
      //           class="w-full bg-transparent outline-none text-gray-700"
      //         />
      //       </label>
      //     </div>

      //     <div class="mt-4 flex items-center space-x-2">
      //       <input
      //         type="checkbox"
      //         id="working-day"
      //         class="w-5 h-5 border border-gray-400 rounded"
      //       />
      //       <label for="working-day" class="text-gray-700">
      //         Mark As Working Day
      //       </label>
      //     </div>

      //     <div class="mt-6 text-right">
      //       <button class="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
      //         Done
      //       </button>
      //     </div>
      //   </div>
      // </div>
    );
  };

  // Fetch events for the selected month
  const fetchEvents = async () => {
    setEventLoading(true);
    try {
      const response = await axiosClient.post(EndPoints.COMMON.GET_EVENTS, {
        startTime: new Date(year, month, 1).getTime(),
        endTime: new Date(year, month + 1, 0, 23, 59, 59, 999).getTime(),
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

  // set calendar of selected month
  const handleGotoDate = (e) => {
    const [yyyy, mm] = e.target.value.split("/");
    if (mm && yyyy && mm > 0 && mm < 13 && yyyy.length === 4) {
      updateCalendar(mm - 1, parseInt(yyyy));
    }
  };

  // capitalize the first letter
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
    return true;
  };

  // api for handeling register and update event
  const handleAddEvent = async (newEvent, eventId) => {
    if (disableButton) return;
    if (!validateForm(newEvent)) return;

    setDisableButton(true);
    setTimeout(() => setDisableButton(false), 3000);
    try {
      setLoading(true);
      const formattedEvent = {
        title: capitalizeFirstLetter(newEvent?.title?.trim()),
        description: capitalizeFirstLetter(newEvent?.description?.trim()),
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
        toast.success(res?.result);
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
      if (isAdmin) {
        setNewEvent(newTempEvent);
        setShowAddEvent(true);
      }
    }
  };

  // returns days grid
  const renderDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOffset = new Date(year, month, 1).getDay();
    const days = [];
    // Add empty divs for the days before the 1st of the month
    for (let i = 0; i < firstDayOffset; i++)
      days.push(<div key={`empty-${i}`} className="empty" />);
    // Add day cells for each day in the month
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

      const title = checkEventProperty(events, "title", true);
      const description = checkEventProperty(events, "description", true);
      const eventId = checkEventProperty(events, "_id", true);
      const isHoliday = title ? true : false;

      const handleClick = () => {
        if (eventId) {
          handleDayClick(day, "edit", {
            eventId,
            title,
            description,
            holiday: isHoliday,
          });
        } else handleDayClick(day);
      };

      days.push(
        <Day
          key={day}
          day={day}
          isActive={isActive}
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
        toast.success(response.result);
        setShowDeleteConfirmation(false);
        setLoading(false);
        setEvents(events.filter((event) => event._id !== eventToDelete));
      }
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-6 px-6 bg-[#93a3b6]/25">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#F4F5F6] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      {/* left view */}
      <div className="col-span-4 px-10 bg-[#fafafa] rounded-[16px] p-4 mt-4">
        <Breadcrumbs />
        <div className="flex justify-between items-center mb-3">
          <p className="text-2xl font-poppins-bold">
            {t("dashboard.calendar")}
          </p>
          <div
            className={`flex justify-around w-32 h-[36px] bg-[#E9EEF2]/50 border-2 border-[rgba(196, 196, 196, 0.40)] rounded-[8px] overflow-hidden`}
          >
            {/* search input */}
            <button className={`goto-mobnbtn py-1  text-white`}>
              <img src={Search} alt="" className="h-[18px] w-[18px]" />
            </button>
            <input
              type="text"
              placeholder={t("calendar.gotoDatePlaceholder")}
              className={`date-input outline-none text-[14px] w-20 text-black bg-[#E9EEF2]/25`}
              onBlur={handleGotoDate}
              maxLength={7}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

                if (value.length > 4) {
                  value = value.slice(0, 4) + "/" + value.slice(4, 6);
                }

                let [year, month] = value.split("/");

                // if (year && (year < "2000" || year > "2050")) {
                //   year = year.slice(0, 3); // Prevent invalid year entry
                // }

                // if (month && (month < "01" || month > "12")) {
                //   month = month.slice(0, 1); // Prevent invalid month entry
                // }

                e.target.value = [year, month].filter(Boolean).join("/");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGotoDate(e);
                }
              }}
            />
          </div>
        </div>
        <hr className="mb-4" />
        <Calendar
          className="px-10"
          month={month}
          year={year}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          handleMonthYearChange={updateCalendar}
        />
        <DaysGrid days={renderDays()} />
      </div>
      {/* right view */}
      <div className="col-span-2 events-container relative bg-[#fafafa] rounded-[16px] py-3 px-10 mt-4 ">
        {eventLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
            <Spinner />
          </div>
        )}
        <div>
          <div className="text-2xl text-center font-bold my-2 pb-1 text-[#040320]">
            {t("events.title")}
          </div>
          <hr />
          {events.length === 0 ? (
            <div className="relative top-40 w-full h-full">
              <img
                src={noevents}
                alt="noevents"
                className="absolute inset-0 w-auto h-auto object-cover"
              />
            </div>
          ) : (
            <ul className="overflow-y-auto max-h-[450px] mt-4">
              {/* list of events */}
              {events.map((itm, index) => (
                <div
                  key={index}
                  className="mb-4 rounded-lg overflow-hidden border-l-8 border-[#0F4189]"
                >
                  <div className="flex h-0 justify-between items-center bg-[#fafafa] text-[#0F4189] font-poppins mt-4 px-1">
                    <div className="font-medium text-sm mt-2 mb-4 ml-4">
                      {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                    </div>
                    {/* delete icon for admin */}
                    {isAdmin && (
                      <img
                        src={deleteEvent}
                        onClick={() => {
                          setEventToDelete(itm._id);
                          setShowDeleteConfirmation(true);
                        }}
                        className="size-[25px] cursor-pointer"
                      />
                    )}
                  </div>
                  <div className="bg-[#fafafa] mt-2">
                    <div className="flex py-1 justify-between items-center">
                      <div
                        className={`${
                          false ? "bg-[#102945] text-white" : ""
                        } py-0 px-1 ml-4 text-xs font-bold`}
                      >
                        {itm.title}
                      </div>
                    </div>
                    <div className="flex pb-2 justify-between items-center">
                      <div
                        className={`${
                          false ? "bg-[#102945] text-white" : ""
                        } py-0 px-1 ml-4 text-xs font-poppins-regular`}
                      >
                        {itm.description}
                      </div>
                      <div className="flex">
                        <div className="py-0.5 px-3 rounded-3xl text-[#FE4040] bg-[#FE4040]/5 text-[12px] font-bold">
                          {t("dashboard.holiday")}
                        </div>
                      </div>
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
