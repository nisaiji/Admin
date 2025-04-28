import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import teachericon from "../assets/images/teachericon.png";
import classroomicon from "../assets/images/classroomicon.png";
import calendaricon from "../assets/images/calendaricon.png";
import leave from "../assets/images/leaves.png";
import passwordReset from "../assets/images/passwordReset.png";
import downArroww from "../assets/images/dropdown.png";
import userw from "../assets/images/user profile.png";
import downArrow from "../assets/images/darkmode/downArrow.png";
import user from "../assets/images/darkmode/user.png";
import logo from "../assets/images/deer logo.png";
import { useTranslation } from "react-i18next";
import { appConfigAction } from "../store/AppConfigSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const sectionId = useSelector((state) => state.appAuth.section);
  const classId = useSelector((state) => state.appAuth.class);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [requestsMenuOpen, setRequestsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const requestsMenuRef = useRef(null);
  const { t } = useTranslation();

  // Handle the toggle state of the main menu
  const handleToggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  // Handle the toggle state of the profile menu
  const handleToggleProfileMenu = () => {
    setProfileMenuOpen((prevState) => !prevState);
  };

  // Handle the toggle state of the requests menu
  const handleToggleRequestsMenu = () => setRequestsMenuOpen((prev) => !prev);

  // Close all menus
  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
    setRequestsMenuOpen(false);
  };

  // close all menus when click outside
  const handleOutsideClick = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target) &&
      requestsMenuRef.current &&
      !requestsMenuRef.current?.contains(event.target)
    ) {
      closeMenus();
    }
  };

  // Logout function that clears the user data and tokens
  const handleLogout = () => {
    localStorage.clear();
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleDarkMode = () => {
    dispatch(appConfigAction.toggleDarkMode());
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground"
      } px-10 py-4 h-[72px] sticky top-0 z-40 shadow-[0px_4px_10px_rgba(102,_116,_204,_0.15)] `}
    >
      <div className={`flex items-center justify-between`}>
        <div className={`flex items-center ml-3`}>
          <Link to="/" className={`flex items-center`}>
            <img src={logo} alt="logo" className={`size-9`} />
          </Link>
        </div>

        <div className={`flex space-x-12`}>
          <button
            onClick={toggleDarkMode}
            className={`${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            } hover:text-textBlue py-2 text-sm font-bold`}
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          {isTeacher ? (
            <div
              onClick={() =>
                navigate("/student-section", {
                  state: { classId, sectionId },
                })
              }
              className={`block px-4 py-3 ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } cursor-pointer`}
            >
              {t("titles.classRoom")}
            </div>
          ) : (
            <div
              className={`relative items-end z-10`}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div
                onClick={handleToggleMenu}
                className={`flex justify-center items-center cursor-pointer`}
              >
                <button
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } hover:text-textBlue flex flex-row gap-2 px-2 py-2.5 text-sm font-bold rounded-md relative group`}
                >
                  {t("setup")}
                  <img
                    src={isDarkMode ? downArrow : downArroww}
                    alt="downArrow"
                    className={`w-4 h-4 transform transition-transform duration-300 group-hover:rotate-180`}
                  />
                </button>
              </div>
              {/* setup menu */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  className={`absolute top-10 w-40 ${
                    isDarkMode ? "bg-background3" : "bg-whiteBackground"
                  } shadow-lg z-10 `}
                >
                  <div className={`py-1`} onClick={closeMenus}>
                    <Link
                      to="/teacher"
                      className={`flex justify-start items-start gap-3 px-3 py-3 ${
                        isDarkMode
                          ? "text-textPrimary hover:bg-background4"
                          : "text-textBlack hover:bg-whiteBackground"
                      } text-sm hover:text-textOrange `}
                    >
                      <img
                        src={teachericon}
                        alt="teachericon"
                        className={`w-4 h-4 relative`}
                      />
                      {t("roles.teacher")}
                    </Link>
                    <Link
                      to="/class-setup"
                      className={`flex justify-start items-start gap-3 px-4 py-3 ${
                        isDarkMode
                          ? "text-textPrimary hover:bg-background4"
                          : "text-textBlack hover:bg-whiteBackground"
                      } text-sm hover:text-textOrange`}
                    >
                      <img
                        src={classroomicon}
                        alt="classroomicon"
                        className={`w-4 h-4 relative`}
                      />
                      {t("titles.classRoom")}
                    </Link>
                    <Link
                      to="/event"
                      className={`flex justify-start items-start gap-3 px-4 py-3 ${
                        isDarkMode
                          ? "text-textPrimary hover:bg-background4"
                          : "text-textBlack hover:bg-whiteBackground"
                      } text-sm hover:text-textOrange`}
                    >
                      <img
                        src={calendaricon}
                        alt="calendaricon"
                        className={`w-4 h-4 relative`}
                      />
                      {t("event")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* students setup*/}
          {!isTeacher && (
            <>
              <Link to="/students-list" className={`py-2`}>
                <span
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } hover:text-textBlue text-sm font-bold`}
                >
                  {t("roles.student")}
                </span>
              </Link>
            </>
          )}

          {/* Requests Menu */}
          {!isTeacher && (
            <div
              className={`relative`}
              onMouseEnter={() => setRequestsMenuOpen(true)}
              onMouseLeave={() => setRequestsMenuOpen(false)}
            >
              <div
                onClick={handleToggleRequestsMenu}
                className={`flex justify-center items-center cursor-pointer`}
              >
                <button
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } hover:text-textBlue flex flex-row gap-2 px-2 py-3 text-sm font-bold rounded-md relative group`}
                >
                  {t("titles.requests")}
                  <img
                    src={isDarkMode ? downArrow : downArroww}
                    alt="downArrow"
                    className={`w-4 h-4 transform transition-transform duration-300 group-hover:rotate-180`}
                  />
                </button>
              </div>
              {requestsMenuOpen && (
                <div
                  ref={requestsMenuRef}
                  className={`absolute top-10 w-40 ${
                    isDarkMode ? "bg-background3" : "bg-whiteBackground"
                  } shadow-lg z-10 `}
                >
                  <Link
                    to="/password-reset-requests"
                    className={`flex justify-start items-center gap-3 px-3 py-3 ${
                      isDarkMode
                        ? "text-textPrimary hover:bg-background4"
                        : "text-textBlack hover:bg-whiteBackground"
                    } text-sm hover:text-textOrange`}
                  >
                    <img
                      src={passwordReset}
                      alt="passwordReset"
                      className={`w-4 h-4 relative`}
                    />
                    Password Reset
                  </Link>
                  <Link
                    to="/teacher-leaves"
                    className={`flex justify-start items-start gap-3 px-3 py-3 ${
                      isDarkMode
                        ? "text-textPrimary hover:bg-background4"
                        : "text-textBlack hover:bg-whiteBackground"
                    } text-sm hover:text-textOrange`}
                  >
                    <img
                      src={leave}
                      alt="leaves"
                      className={`w-4 h-4 relative`}
                    />
                    {t("leaves")}
                  </Link>
                </div>
              )}
            </div>
          )}
          <div
            className={`relative rounded-xl mr-5`}
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <div
              onClick={handleToggleProfileMenu}
              className={`flex items-center justify-center px-3 py-2 cursor-pointer`}
            >
              <img
                src={isDarkMode ? user : userw}
                alt="user"
                className={`size-6`}
              />
            </div>
            {/* profile menu */}
            {profileMenuOpen && (
              <div
                ref={profileMenuRef}
                className={`absolute top-full right-0 w-[120px] ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } text-sm ${
                  isDarkMode ? "bg-background3" : "bg-whiteBackground"
                } shadow-lg z-10 `}
                onClick={closeMenus}
              >
                <div className={`py-1`}>
                  <Link
                    to={isTeacher ? "/teacher-profile" : "/admin-profile"}
                    className={`block px-4 py-3 ${
                      isDarkMode
                        ? "text-textPrimary hover:bg-background4"
                        : "text-textBlack hover:bg-whiteBackground"
                    } text-sm hover:text-textOrange`}
                  >
                    {t("profile")}
                  </Link>
                  <Link
                    onClick={handleLogout}
                    to="/login"
                    className={`block px-4 py-3 ${
                      isDarkMode
                        ? "text-textPrimary hover:bg-background4"
                        : "text-textBlack hover:bg-whiteBackground"
                    } text-sm hover:text-textOrange`}
                  >
                    {t("logout")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
