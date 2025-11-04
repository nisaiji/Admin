/**
 * Navbar.jsx
 *
 * This component renders the main navigation bar for the admin dashboard.
 * It provides navigation links based on user role, dark mode toggle, and profile/logout menu.
 * Uses React hooks for state, Redux for authentication/config state, and Material UI for switch styling.
 * Handles menu open/close logic, click outside detection, and logout functionality.
 */
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
import notice from "../assets/images/darkmode/notice.png";
import user from "../assets/images/darkmode/user.png";
import logo from "../assets/images/deer logo.png";
import { useTranslation } from "react-i18next";
import { appConfigAction } from "../store/AppConfigSlice";
import { FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/system";

const Navbar = () => {
  // Redux and navigation hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, teacherData } = useSelector((state) => state.appAuth);
  const role = useSelector((state) => state.appAuth.role);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const sectionId = useSelector((state) => state.appAuth.section);
  const classId = useSelector((state) => state.appAuth.class);

  // Local state for menu toggles
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [requestsMenuOpen, setRequestsMenuOpen] = useState(false);

  // Refs for menu elements
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const requestsMenuRef = useRef(null);

  const { t } = useTranslation();

  // Toggle main menu
  const handleToggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  // Toggle profile menu
  const handleToggleProfileMenu = () => {
    setProfileMenuOpen((prevState) => !prevState);
  };

  // Toggle requests menu
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

  // Logout: clear local storage
  const handleLogout = () => {
    localStorage.clear();
  };

  // Attach outside click listener
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    dispatch(appConfigAction.toggleDarkMode());
  };

  // Custom styled Material UI switch for dark mode
  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 50,
    height: 28,
    padding: 7,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      "&.Mui-checked": {
        color: "#fff",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            "#fff"
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#aab4be",
          ...theme.applyStyles("dark", {
            backgroundColor: "#8796A5",
          }),
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: "#001e3c",
      width: 24,
      height: 24,
      "&::before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
      ...theme.applyStyles("dark", {
        backgroundColor: "#003892",
      }),
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: "#aab4be",
      borderRadius: 20 / 2,
      ...theme.applyStyles("dark", {
        backgroundColor: "#8796A5",
      }),
    },
  }));

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground"
      } px-10 py-4 h-[72px] sticky top-0 z-40 shadow-[0px_4px_10px_rgba(102,_116,_204,_0.15)] select-none`}
    >
      <div className={`flex items-center justify-between`}>
        {/* Logo */}
        <div className={`flex items-center ml-3`}>
          <Link to="/" className={`flex items-center`}>
            <img src={logo} alt="logo" className={`size-9`} />
          </Link>
        </div>

        <div className={`flex`}>
          {/* Class Teacher Navigation */}
          {role === "classTeacher" ? (
            <div
              onClick={() => navigate("student-menu")}
              className={`block mx-6 px-4 py-3 ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } cursor-pointer`}
            >
              {t("titles.classRoom")}
            </div>
          ) : role === "admin" ? (
            <div
              className={`relative items-end z-10 mx-6`}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              {/* admin Navigation */}
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
              {/* Setup menu dropdown */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  className={`absolute top-10 -right-10 w-40 ${
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
                        className={`w-4 h-4 relative object-contain`}
                      />
                      {t("roles.teacher")}
                    </Link>
                    <Link
                      to="/class-setup"
                      className={`flex justify-start items-start gap-3 px-3 py-3 ${
                        isDarkMode
                          ? "text-textPrimary hover:bg-background4"
                          : "text-textBlack hover:bg-whiteBackground"
                      } text-sm hover:text-textOrange`}
                    >
                      <img
                        src={classroomicon}
                        alt="classroomicon"
                        className={`w-4 h-4 relative object-contain`}
                      />
                      {t("titles.classRoom")}
                    </Link>
                    <Link
                      to="/event"
                      className={`flex justify-start items-start gap-3 px-3 py-3 ${
                        isDarkMode
                          ? "text-textPrimary hover:bg-background4"
                          : "text-textBlack hover:bg-whiteBackground"
                      } text-sm hover:text-textOrange`}
                    >
                      <img
                        src={calendaricon}
                        alt="calendaricon"
                        className={`w-4 h-4 relative object-contain`}
                      />
                      {t("event")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            ""
          )}

          {/* Student Information System link for admin */}
          {role === "admin" && (
            <>
              <Link to="/student-information-system" className={`py-2 mx-6`}>
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

          {/* Requests menu for admin */}
          {role === "admin" && (
            <div
              className={`relative`}
              onMouseEnter={() => setRequestsMenuOpen(true)}
              onMouseLeave={() => setRequestsMenuOpen(false)}
            >
              <div
                onClick={handleToggleRequestsMenu}
                className={`flex justify-center items-center cursor-pointer mx-6`}
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
                    to="/teacher-leave-requests"
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

          {/* Notice link for admin */}
          {role === "admin" && (
            <Link
              to="/notice"
              className={`flex justify-center items-center cursor-pointer mx-6`}
            >
              <button
                className={`${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } hover:text-textBlue flex flex-row gap-2 px-2 py-3 text-sm font-bold rounded-md relative group`}
              >
                {t("titles.notice")}
                <img
                  src={notice}
                  alt="notice"
                  className={`w-4 h-4 object-contain`}
                />
              </button>
            </Link>
          )}

          {/* Dark mode toggle */}
          <FormControlLabel
            control={
              <MaterialUISwitch
                checked={isDarkMode}
                onChange={toggleDarkMode}
              />
            }
          />
          <div
            className={`relative rounded-xl`}
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            {/* Profile menu */}
            <div
              onClick={handleToggleProfileMenu}
              className={`flex items-center justify-center px-3 py-2 cursor-pointer`}
            >
              <img
                src={
                  role === "classTeacher" || role === "teacher"
                    ? teacherData?.photo || (isDarkMode ? user : userw)
                    : role === "admin"
                    ? data?.photo || (isDarkMode ? user : userw)
                    : ""
                }
                alt="user"
                className={`size-6 rounded-full border border-borderGray2`}
              />
            </div>
            {/* Profile menu dropdown */}
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
                    to={
                      role === "classTeacher" || role === "teacher"
                        ? "/teacher-profile"
                        : role === "admin"
                        ? "/admin-profile"
                        : ""
                    }
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
