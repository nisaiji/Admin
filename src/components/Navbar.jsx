import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Tools from "../assets/images/Tools.png";
import Down from "../assets/images/Down.png";
import { useTranslation } from "react-i18next";
import {
  getItem,
  KEY_ACCESS_TOKEN,
  removeItem,
} from "../services/LocalStorageManager";

const Navbar = () => {
  const navigate = useNavigate();
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";

  const sectionId = useSelector((state) => state.appAuth.section);
  const classId = useSelector((state) => state.appAuth.class);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const { t } = useTranslation();

  const handleToggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const handleToggleProfileMenu = () => {
    setProfileMenuOpen((prevState) => !prevState);
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

  // close menu when click outside
  const handleOutsideClick = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target)
    ) {
      closeMenus();
    }
  };

  const handleLogout = () => {
    if (isTeacher) {
      removeItem("class");
      removeItem("section");
      removeItem("firstname");
    } else {
      removeItem("username");
    }
    removeItem(KEY_ACCESS_TOKEN);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="bg-[#05022B] px-4 py-6 text-white sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center ml-3">
          <Link to="/" className="flex items-center">
            <div className="bg-[#7B79FF] size-10 rounded-2xl flex justify-center items-center">
              <span className="text-3xl font-bold">{t("A")}</span>
            </div>
            <span className="font-bold text-3xl ml-2 text-white">
              {t("logo")}
            </span>
          </Link>
          <div
            className="relative pl-6 z-10 ml-5"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <div
              onClick={handleToggleMenu}
              className="flex justify-center items-center cursor-pointer"
            >
              <img src={Tools} alt="Tools" className="size-8" />
              <button className="text-white px-4 py-2 text-base rounded-md ">
                {t("setup")}
              </button>
              <img src={Down} alt="Dropdown" className="w-4 h-2" />
            </div>
            {/* setup menu */}
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute top-10 left-0 w-40 bg-[#05022B] rounded-xl shadow-lg"
              >
                {isTeacher ? (
                  <div className="py-1" onClick={closeMenus}>
                    <div
                      onClick={() =>
                        navigate("/student-section", {
                          state: { classId, sectionId },
                        })
                      }
                      className="block px-4 py-2 hover:text-[#05022B] hover:bg-white"
                    >
                      {t("titles.classRoom")}
                    </div>
                    <Link
                      to="/event"
                      className="block px-4 py-2 hover:text-[#05022B] hover:bg-white"
                    >
                      {t("event")}
                    </Link>
                  </div>
                ) : (
                  <div className="py-1" onClick={closeMenus}>
                    <Link
                      to="/teacher"
                      className="block px-4 py-2 hover:text-[#05022B] hover:bg-white"
                    >
                      {t("roles.teacher")}
                    </Link>
                    <Link
                      to="/student"
                      className="block px-4 py-2 hover:text-[#05022B] hover:bg-white"
                    >
                      {t("roles.student")}
                    </Link>
                    <Link
                      to="/class-setup"
                      className="block px-4 py-2 hover:text-[#05022B] hover:bg-white"
                    >
                      {t("titles.classRoom")}
                    </Link>
                    <Link
                      to="/event"
                      className="block px-4 py-2 hover:text-[#05022B] hover:bg-white"
                    >
                      {t("event")}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-8">
          <div
            className="relative bg-[#1e1b40] rounded-xl mr-5"
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <div
              onClick={handleToggleProfileMenu}
              className="flex items-center justify-center px-3 py-1 cursor-pointer"
            >
              <div>
                <div className="text-white text-base mr-3">
                  {isTeacher ? getItem("firstname") : getItem("username")}
                </div>
                <div className="text-white text-xs">
                  {isTeacher ? t("roles.teacher") : t("roles.admin")}
                </div>
              </div>
              <img src={Down} alt="Dropdown" className="w-4 h-2" />
            </div>
            {/* profile menu */}
            {profileMenuOpen && (
              <div
                ref={profileMenuRef}
                className="absolute top-full right-0 w-[120px] bg-[#05022B] rounded-xl shadow-lg z-10"
                onClick={closeMenus}
              >
                <div className="py-1">
                  {!isTeacher && (
                    <Link
                      to="/admin-profile"
                      className="block px-4 py-2 hover:bg-white hover:text-[#05022B]"
                    >
                      {t("profile")}
                    </Link>
                  )}
                  <Link
                    onClick={handleLogout}
                    to="/login"
                    className="block px-4 py-2 hover:bg-white hover:text-[#05022B]"
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
