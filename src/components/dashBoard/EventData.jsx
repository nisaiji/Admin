import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import CalendarComponent from "./CalendarComponent";

import noeventsw from "../../assets/images/noevents.png";
import noevents from "../../assets/images/darkmode/noevents.png";
import moment from "moment";
import Spinner from "../Spinner";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";

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
      999
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
    <div className={`flex flex-row mx-5 mt-5 pb-5 space-x-5`}>
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-l from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        }  p-6 w-[60%] rounded-[16px]`}
      >
        <h2
          className={`text-xl font-semibold pl-6 ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {t("dashboard.calendar")}
        </h2>
        <hr
          className={`mt-2 border-t ${
            isDarkMode ? "border-borderLine" : "border-borderWhite3"
          }`}
        />
        <div className={`flex justify-center mt-2`}>
          <div className={`w-full h-screen `}>
            <CalendarComponent
              events={calenderEvents}
              workdays={workdays}
              updateDate={(newDate) => setDate(newDate)}
            />
          </div>
        </div>
      </div>

      {/* event list */}
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-l from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } w-[40%] py-2 px-8 rounded-[16px]`}
      >
        <h2
          className={`text-xl font-semibold my-2 pl-6 mt-4 ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {t("dashboard.holidayAndEvents")}
        </h2>
        <hr
          className={`mb-6 border-t ${
            isDarkMode ? "border-borderLine" : "border-borderWhite3"
          }`}
        />
        {calenderEvents.length === 0 && workdays.length === 0 ? (
          <div className={`relative w-full`}>
            <img
              src={isDarkMode ? noevents : noeventsw}
              alt="Event Background"
              className={`absolute inset-0 w-auto h-auto object-cover`}
            />
          </div>
        ) : (
          <div>
            {/* event loading */}
            {eventLoading && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30`}
              >
                <Spinner />
              </div>
            )}
            {/* event list */}
            <div className={`overflow-y-auto max-h-screen`}>
              {workdays.map((itm, index) => (
                <div
                  key={index}
                  className={`mb-4 ml-6 rounded-lg overflow-hidden border-l-8 border-borderBlue`}
                >
                  <div
                    className={`flex h-0 justify-between items-center bg-transparent text-textBlue font-poppins mt-2 px-2 text-lg`}
                  >
                    <div className={`font-medium text-sm mt-4 mb-2 ml-2`}>
                      {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                    </div>
                  </div>
                  <div className={`bg-transparent mt-4`}>
                    <div className={`flex py-0 justify-between items-center`}>
                      <div
                        className={`${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } py-0 px-2 ml-2 text-base font-semibold`}
                      >
                        {itm.title}
                      </div>
                    </div>
                    <div className={`flex justify-between items-center`}>
                      <div
                        className={`${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } py-0 px-2 ml-2 text-xs font-poppins-regular`}
                      >
                        {itm.description}
                      </div>
                      <div className={`flex`}>
                        <div
                          className={`py-1 mr-6 rounded-3xl text-textRed text-xs font-bold`}
                        >
                          {t("dashboard.workday")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {calenderEvents.map((itm, index) => (
                <div
                  key={index}
                  className={`mb-4 ml-6 rounded-lg overflow-hidden border-l-8 border-borderBlue`}
                >
                  <div
                    className={`flex h-0 justify-between items-center bg-transparent text-textBlue font-poppins mt-2 px-2 text-lg`}
                  >
                    <div className={`font-medium text-sm mt-4 mb-2 ml-2`}>
                      {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                    </div>
                  </div>
                  <div className={`bg-transparent mt-4`}>
                    <div className={`flex py-0 justify-between items-center`}>
                      <div
                        className={`${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } py-0 px-2 ml-2 text-base font-semibold`}
                      >
                        {itm?.title}
                      </div>
                    </div>
                    <div className={`flex justify-between items-center`}>
                      <div
                        className={`${
                          isDarkMode ? "text-textPrimary" : "text-textBlack"
                        } py-0 px-2 ml-2 text-xs font-poppins-regular`}
                      >
                        {itm?.description}
                      </div>
                      <div className={`flex`}>
                        <div
                          className={`py-1 mr-6 text-textRed text-xs font-bold`}
                        >
                          {t("dashboard.holiday")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
