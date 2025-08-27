import React, { useState, useEffect } from "react";
import noeventsw from "../../assets/images/noevents.png";
import noevents from "../../assets/images/darkmode/noevents.png";
import deleteEventw from "../../assets/images/delete2.png";
import DownArroww from "../../assets/images/dropdown.png";
import Searchw from "../../assets/images/Search.png";
import deleteEvent from "../../assets/images/darkmode/delete.png";
import Search from "../../assets/images/darkmode/Search.png";
import DownArrow from "../../assets/images/darkmode/downArrow.png";
import close from "../../assets/images/close.png";
import calendar from "../../assets/images/calendar.png";
import notes from "../../assets/images/notes.png";
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { TextField } from "@mui/material";

// Event - Manages the logic of the calendar, events, and month navigation
const Event = () => {
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const isAdmin = useSelector((state) => state.appAuth.role) === "admin";
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeDay, setActiveDay] = useState(today.getDate());
  const [events, setEvents] = useState([]);
  const [workdays, setWorkdays] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState({});
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
    const isEditMode = Boolean(prevData?.editData?.id);
    const isWorkday = moment(prevData?.date).day() === 0;

    const [newEventForm, setNewEventForm] = useState({
      title: prevData?.editData?.title || "",
      description: prevData?.editData?.description || "",
      holiday: prevData?.editData?.holiday || false,
      workday: isWorkday,
      date: prevData?.date ? moment(prevData.date).format("DD/MM/YYYY") : "",
      startDate: moment(prevData?.date).format("DD/MM/YYYY"),
      endDate: moment(prevData?.date).format("DD/MM/YYYY"),
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setNewEventForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const validateForm = () => {
      let newErrors = {};
      if (!newEventForm?.title?.trim())
        newErrors.title = t("toasts.titleRequired");
      if (newEventForm?.workday && !newEventForm?.description?.trim()) {
        newErrors.description = t("toasts.descRequired");
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    if (!isOpen) return null;

    useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "auto";
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isOpen]);

    return (
      <div
        className={`fixed inset-0 flex items-center justify-center bg-opacity-50 ${
          isDarkMode ? "bg-backgroundTableCell" : "bg-whiteBackground"
        }`}
      >
        <div
          className={`rounded-2xl px-[30px] py-[20px] w-[450px] h-[430px] shadow-lg ${
            isDarkMode ? "bg-background1" : "bg-whiteBackground"
          }`}
        >
          <div className={`flex justify-end`}>
            <img
              src={close}
              onClick={() => {
                isClose(false);
                setErrors({});
              }}
              alt="close"
              className={`size-5 cursor-pointer`}
            />
          </div>
          <input
            className={`w-full text-lg font-medium border-b py-3 outline-none bg-transparent ${
              isDarkMode
                ? "text-textPrimary border-borderLine"
                : "text-textBlack border-borderGray2"
            }`}
            type="text"
            name="title"
            value={newEventForm.title}
            onChange={handleChange}
            onBlur={validateForm}
            placeholder={
              isEditMode
                ? isWorkday
                  ? t("eventForm.title.updateWorkday")
                  : t("eventForm.title.edit")
                : isWorkday
                ? t("eventForm.title.addWorkday")
                : t("eventForm.title.add")
            }
          />
          {errors.title && (
            <p className={`text-textRed text-sm`}>{errors.title}</p>
          )}
          <div className={`mt-5`}>
            <label className={`flex items-center space-x-5 rounded-lg`}>
              <img src={calendar} alt="close" className={`size-5`} />
              <LocalizationProvider dateAdapter={AdapterMoment}>
                {isWorkday || isEditMode ? (
                  <DatePicker
                    views={["day", "month", "year"]}
                    value={moment(prevData.date, "DD/MM/YYYY")}
                    format="DD/MM/YYYY"
                    disabled
                    className={`w-full`}
                    textField={(params) => (
                      <TextField
                        {...params}
                        placeholder={t("placeholders.date")}
                        variant="outlined"
                      />
                    )}
                    sx={{
                      border: `1px solid ${isDarkMode ? "#2b2e4a80" : "gray"}`,
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "" : "white",
                      color: isDarkMode ? "#E3E8F3" : "black",
                      "& .MuiOutlinedInput-root": {
                        padding: 1,
                        fontSize: "16px",
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                      "& .Mui-disabled": {
                        color: isDarkMode ? "#E3E8F3 !important" : "black",
                        WebkitTextFillColor: isDarkMode
                          ? "#E3E8F3 !important"
                          : "black", // Critical for disabled input text
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                        padding: 1,
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                      "& .MuiSvgIcon-root": {
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  />
                ) : (
                  <>
                    <DatePicker
                      views={["day", "month", "year"]}
                      format="DD/MM/YYYY"
                      minDate={moment().startOf("day")}
                      value={moment(newEventForm.startDate, "DD/MM/YYYY")}
                      onChange={(date) => {
                        if (date) {
                          const formattedDate = date
                            .startOf("day")
                            .format("DD/MM/YYYY");
                          setNewEventForm((prev) => ({
                            ...prev,
                            startDate: formattedDate,
                            endDate:
                              prev.endDate &&
                              moment(prev.endDate, "DD/MM/YYYY").isBefore(date)
                                ? formattedDate
                                : prev.endDate,
                          }));
                        }
                      }}
                      textField={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("placeholders.date")}
                          variant="outlined"
                        />
                      )}
                      sx={{
                        width: "100%",
                        height: "40px",
                        border: `1px solid ${
                          isDarkMode ? "#2b2e4a80" : "gray"
                        }`,
                        borderRadius: "8px",
                        backgroundColor: isDarkMode ? "" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        "& .MuiOutlinedInput-root": {
                          padding: 1,
                          fontSize: "16px",
                          minHeight: "40px",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiInputBase-input": {
                          fontSize: "14px",
                          padding: 1,
                          height: "100%",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiSvgIcon-root": {
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                      }}
                    />

                    <DatePicker
                      views={["day", "month", "year"]}
                      format="DD/MM/YYYY"
                      minDate={
                        newEventForm.startDate
                          ? moment(newEventForm.startDate, "DD/MM/YYYY")
                          : moment().startOf("day")
                      }
                      value={moment(newEventForm.endDate, "DD/MM/YYYY")}
                      onChange={(date) => {
                        if (date) {
                          setNewEventForm((prev) => ({
                            ...prev,
                            endDate: date.endOf("day").format("DD/MM/YYYY"),
                          }));
                        }
                      }}
                      textField={(params) => (
                        <TextField {...params} variant="outlined" />
                      )}
                      sx={{
                        width: "100%",
                        height: "40px",
                        border: `1px solid ${
                          isDarkMode ? "#2b2e4a80" : "gray"
                        }`,
                        borderRadius: "8px",
                        backgroundColor: isDarkMode ? "" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        "& .MuiOutlinedInput-root": {
                          padding: 1,
                          fontSize: "16px",
                          minHeight: "40px",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiInputBase-input": {
                          fontSize: "14px",
                          padding: 1,
                          height: "100%",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiSvgIcon-root": {
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                      }}
                    />
                  </>
                )}
              </LocalizationProvider>
            </label>
          </div>

          <div className={`mt-5`}>
            <label className={`flex items-center space-x-5 rounded-lg`}>
              <img src={notes} alt="close" className={`size-5`} />
              <textarea
                type="text"
                name="description"
                placeholder="Add Description"
                value={newEventForm.description}
                onChange={handleChange}
                onBlur={validateForm}
                className={`w-full bg-transparent border ${
                  isDarkMode
                    ? "text-textPrimary border-borderLine"
                    : "text-textBlack border-borderGray2"
                } p-3 outline-none rounded-lg max-h-32 h-32`}
              />
            </label>
            {errors.description && (
              <p className={`text-textRed text-sm`}>{errors.description}</p>
            )}
          </div>

          <div className={`mt-5 text-right`}>
            <button
              className={`bg-backgroundBlue text-white px-6 py-2 rounded-[10px] text-sm`}
              disabled={loading}
              onClick={() => {
                if (validateForm()) {
                  isSubmit(newEventForm, prevData?.editData?.id);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || validateForm()) {
                  isSubmit(newEventForm, prevData?.editData?.id);
                }
              }}
            >
              {prevData?.editData?.id ? t("buttons.update") : t("buttons.done")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Fetch events for the selected month
  const fetchEvents = async () => {
    setEventLoading(true);
    try {
      const response = await axiosClient.post(EndPoints.ADMIN.GET_EVENTS, {
        startTime: new Date(year, month, 1).getTime(),
        endTime: new Date(year, month + 1, 0, 23, 59, 59, 999).getTime(),
        sessionId: classAndSectionData?.session[0]?._id,
      });
      const response2 = await axiosClient.post(
        EndPoints.ADMIN.GET_SUNDAY_HOLIDAY,
        {
          startTime: new Date(year, month, 1).getTime(),
          endTime: new Date(year, month + 1, 0, 23, 59, 59, 999).getTime(),
          sessionId: classAndSectionData?.session[0]?._id,
        }
      );

      if (response?.statusCode === 200) {
        setEvents(
          response?.result?.sort((a, b) => new Date(a.date) - new Date(b.date))
        );
      }
      if (response2?.statusCode === 200) {
        setWorkdays(
          response2?.result?.sort((a, b) => new Date(a.date) - new Date(b.date))
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

  // api for handeling register and update event
  const handleAddEvent = async (newEvent, Id) => {
    if (disableButton) return;

    setDisableButton(true);
    setTimeout(() => setDisableButton(false), 3000);
    try {
      setLoading(true);

      let res;
      let formattedEvent;
      if (Id) {
        formattedEvent = {
          title: capitalizeFirstLetter(newEvent?.title?.trim()),
          description: capitalizeFirstLetter(newEvent?.description?.trim()),
        };
        let url = newEvent?.workday
          ? EndPoints.ADMIN.UPDATE_SUNDAY_HOLIDAY
          : EndPoints.ADMIN.UPDATE_EVENT;
        res = await axiosClient.put(`${url}/${Id}`, formattedEvent);
      } else {
        if (newEvent?.workday) {
          formattedEvent = {
            title: capitalizeFirstLetter(newEvent?.title?.trim()),
            description: capitalizeFirstLetter(newEvent?.description?.trim()),
            date: moment(newEvent.date, "DD/MM/YYYY").valueOf(),
            sessionId: classAndSectionData?.session[0]?._id,
          };
        } else {
          formattedEvent = {
            title: capitalizeFirstLetter(newEvent?.title?.trim()),
            description: capitalizeFirstLetter(newEvent?.description?.trim()),
            startTime: moment(newEvent.startDate, "DD/MM/YYYY").valueOf(),
            endTime: moment(newEvent.endDate, "DD/MM/YYYY").valueOf(),
            sessionId: classAndSectionData?.session[0]?._id,
          };
        }

        let url = newEvent?.workday
          ? EndPoints.ADMIN.REMOVE_SUNDAY_HOLIDAY
          : EndPoints.ADMIN.REGISTER_EVENT;
        res = await axiosClient.post(url, formattedEvent);
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
      days.push(<div key={`empty-${i}`} className={`empty`} />);

    // Add day cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const targetDate = moment({ year, month, day }).format("YYYY-MM-DD");
      const isActive = day === activeDay;
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      // Check if it's a Sunday and not in workdays
      const isSunday =
        moment(targetDate).day() === 0 &&
        !workdays.some(
          (w) => moment(w.date).format("YYYY-MM-DD") === targetDate
        );

      // Find event or workday data
      const findEventByDate = (key) =>
        events.find((item) => moment(item.date).isSame(targetDate, "day"))?.[
          key
        ];

      const title = findEventByDate("title");
      const description = findEventByDate("description");
      const eventId = findEventByDate("_id");
      const isHoliday = !!title;

      const workdayData = workdays.find((w) =>
        moment(w.date).isSame(targetDate, "day")
      );

      const handleClick = () => {
        if (workdayData) {
          handleDayClick(day, "edit", {
            id: workdayData?._id,
            title: workdayData?.title,
            description: workdayData?.description,
            workday: true,
          });
        } else if (eventId) {
          handleDayClick(day, "edit", {
            id: eventId,
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
      if (disableButton) return;

      setDisableButton(true);
      setTimeout(() => setDisableButton(false), 3000);
      setLoading(true);
      let url =
        eventToDelete.day === "Sunday"
          ? EndPoints.ADMIN.DELETE_SUNDAY_HOLIDAY
          : EndPoints.ADMIN.DELETE_EVENT;
      const response = await axiosClient.delete(`${url}/${eventToDelete._id}`);
      if (response?.statusCode === 200) {
        toast.success(response.result);
        setShowDeleteConfirmation(false);
        fetchEvents();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Calendar Component - Displays a calendar with month navigation and event handling
  const Calendar = ({ month, year, onPrevMonth, onNextMonth }) => {
    return (
      <div className={`bg-transparent rounded-lg w-full`}>
        {/* Month Navigation */}
        <div
          className={`month flex items-center justify-between py-4 px-10 mx-10 text-[16px] font-medium rounded-[8px] h-8 capitalize border-2 ${
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
        className={`day cursor-pointer rounded-[12px] flex font-bold text-[14px] p-2 w-[60px] h-[70px] border-[3px] ${renderCss()}`}
        onClick={onClick}
      >
        {day}
      </div>
    );
  };

  // Days Grid Component - Displays all the days of the month in a grid layout
  const DaysGrid = ({ days }) => {
    return (
      <div className={`days grid grid-cols-7 ml-8 gap-[10px] px-8 py-3`}>
        {days}
      </div>
    );
  };

  return (
    <div
      className={`grid grid-cols-6 gap-6 p-6 ${
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
            {t("dashboard.calendar")}
          </p>
          <div
            className={`flex justify-around w-32 h-[36px] bg-transparent border-2 border-borderGray rounded-[8px] overflow-hidden`}
          >
            {/* search input */}
            <button className={`py-1`}>
              <img
                src={isDarkMode ? Search : Searchw}
                alt=""
                className={`h-[18px] w-[18px]`}
              />
            </button>
            <input
              type="text"
              placeholder={t("calendar.gotoDatePlaceholder")}
              className={`date-input outline-none text-[14px] w-20 ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } bg-transparent`}
              onBlur={handleGotoDate}
              maxLength={7}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (value.length > 4) {
                  value = value.slice(0, 4) + "/" + value.slice(4, 6);
                }
                let [year, month] = value.split("/");
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
        <hr
          className={`mb-4 border ${
            isDarkMode ? "border-borderLine" : "border-borderWhite3"
          }`}
        />
        <Calendar
          className={`px-10`}
          month={month}
          year={year}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          handleMonthYearChange={updateCalendar}
        />
        <DaysGrid days={renderDays()} />
      </div>
      {/* right view */}
      <div
        className={`col-span-2 relative ${
          isDarkMode
            ? "bg-gradient-to-l from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } rounded-[16px] py-3 px-4`}
      >
        {eventLoading && (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-whiteBackground bg-opacity-50 z-30`}
          >
            <Spinner />
          </div>
        )}
        <div>
          <div
            className={`text-2xl text-center font-bold my-2 pb-1 ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("events.title")}
          </div>
          <hr
            className={`mb-6 border-t ${
              isDarkMode ? "border-borderLine" : "border-borderWhite3"
            }`}
          />
          {events.length === 0 && workdays.length === 0 ? (
            <div className={`relative top-40 w-full h-full`}>
              <img
                src={isDarkMode ? noevents : noeventsw}
                alt="noevents"
                className={`absolute inset-0 w-auto h-auto object-cover`}
              />
            </div>
          ) : (
            <ul className={`overflow-y-auto max-h-[450px] mt-4`}>
              {/* list of events */}
              {workdays.map((itm, index) => (
                <div
                  key={index}
                  className={`mb-4 rounded-lg overflow-hidden border-l-8 border-borderBlue`}
                >
                  <div
                    className={`flex h-0 justify-between items-center mt-4 px-1`}
                  >
                    <div
                      className={`font-medium text-sm mt-2 mb-4 ml-4 font-poppins text-textBlue`}
                    >
                      {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                    </div>
                    {/* delete icon for admin */}
                    {isAdmin && (
                      <img
                        src={isDarkMode ? deleteEvent : deleteEventw}
                        onClick={() => {
                          setEventToDelete(itm);
                          setShowDeleteConfirmation(true);
                        }}
                        className={`size-[25px] cursor-pointer`}
                      />
                    )}
                  </div>
                  <div className={`bg-transparent mt-2`}>
                    <div className={`flex py-1 justify-between items-center`}>
                      <div
                        className={`py-0 px-1 ml-4 ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } text-xs font-bold`}
                      >
                        {itm.title}
                      </div>
                    </div>
                    <div className={`flex pb-2 justify-between items-center`}>
                      <div
                        className={`py-0 px-1 ml-4 ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } text-xs font-poppins-regular`}
                      >
                        {itm.description}
                      </div>
                      <div className={`flex`}>
                        <div
                          className={`py-0.5 px-3 rounded-3xl text-textRed text-[12px] font-bold`}
                        >
                          {t("dashboard.workday")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {events.map((itm, index) => (
                <div
                  key={index}
                  className={`mb-4 rounded-lg overflow-hidden border-l-8 border-borderBlue`}
                >
                  <div
                    className={`flex h-0 justify-between items-center bg-[#fafafa] text-textBlue font-poppins mt-4 px-1`}
                  >
                    <div className={`font-medium text-sm mt-2 mb-4 ml-4`}>
                      {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                    </div>
                    {/* delete icon for admin */}
                    {isAdmin && (
                      <img
                        src={isDarkMode ? deleteEvent : deleteEventw}
                        onClick={() => {
                          setEventToDelete(itm);
                          setShowDeleteConfirmation(true);
                        }}
                        className={`size-[25px] cursor-pointer`}
                      />
                    )}
                  </div>
                  <div className={`bg-transparent mt-2`}>
                    <div className={`flex py-1 justify-between items-center`}>
                      <div
                        className={`py-0 px-1 ml-4 ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } text-xs font-bold`}
                      >
                        {itm.title}
                      </div>
                    </div>
                    <div className={`flex pb-2 justify-between items-center`}>
                      <div
                        className={`py-0 px-1 ml-4 ${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } text-xs font-poppins-regular`}
                      >
                        {itm.description}
                      </div>
                      <div className={`flex`}>
                        <div
                          className={`py-0.5 px-3 rounded-3xl text-textRed text-[12px] font-bold`}
                        >
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
