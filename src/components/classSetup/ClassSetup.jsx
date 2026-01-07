import React, { useEffect, useRef, useState } from "react";
import addclass from "../../assets/images/addclass.png";
import studentsPto2 from "../../assets/images/darkmode/n-2.png";
import students3to8 from "../../assets/images/darkmode/3-8.png";
import students9to12 from "../../assets/images/darkmode/9-12.png";
import trash from "../../assets/images/darkmode/delete2.png";
import trashw from "../../assets/images/trash.png";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Addsection from "./Addsection";
import { axiosClient } from "../../services/axiosClient";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../BreadCrumbs";
import { setClassAndSectionData } from "../../store/AppAuthSlice";
import FlipCard from "./FlipCard";

function ClassSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [classes, setClasses] = useState([]);
  const [isFlipped, setIsFlipped] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clickedClassId, setClickedClassId] = useState("");
  const [addSectionModelOpen, setAddSectionModelOpen] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  // Class options (mapped with translation keys)
  const classOptions = [
    "preNursery",
    "nursery",
    "LKG",
    "UKG",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
  ].map((key) => t(`options.${key}`));

  // Function to compare class names for sorting
  const compareClasses = (a, b) =>
    classOptions.indexOf(a.name) - classOptions.indexOf(b.name);

  // Toggle the flip state for class cards
  const toggleFlip = (index) =>
    setIsFlipped((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });

  // Function to fetch the list of classes via API
  const getAllClass = async () => {
    try {
      if (loading) {
        return;
      }
      setLoading(true);
      const res = await axiosClient.get(
        `${EndPoints.COMMON.CLASS_LIST}/${classAndSectionData?.selectedSession?._id}`
      );
      if (res?.statusCode === 200) {
        const sortedClasses = res?.result?.sort(compareClasses);
        dispatch(setClassAndSectionData({ classList: sortedClasses }));
        setClasses(sortedClasses);
      }
    } catch (e) {
      // toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the creation of a new class
  const handleNewClassSubmit = async (name) => {
    const existingClassNames = classes.map((cls) => cls.name);
    if (existingClassNames.includes(name))
      return toast.error(t("toasts.classExists"));
    if (existingClassNames.length >= classOptions.length)
      return toast.error(t("toasts.classroomFull"));

    try {
      setLoading(true);
      const res = await axiosClient.post(EndPoints.ADMIN.REGISTER_CLASS, {
        name,
        sessionId: classAndSectionData?.selectedSession?._id,
      });
      if ([200, 201].includes(res?.statusCode)) {
        getAllClass();
        toast.success(res.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // delete class api
  const handleDeleteClass = async () => {
    if (toastDisplayed) return;
    setToastDisplayed(true);
    setTimeout(() => setToastDisplayed(false), 3000);
    try {
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_CLASS}/${clickedClassId}`
      );
      if (response?.statusCode === 200) {
        toast.success(response.result);
        setModalIsOpen(false);
        getAllClass();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classAndSectionData?.selectedSession?._id) {
      getAllClass();
    }
  }, [classAndSectionData?.selectedSession?._id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Available class options that aren't already taken
  const availableClassOptions = classOptions.filter(
    (option) => !classes.some((cls) => cls.name === option)
  );

  return (
    <>
      <Toaster />
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode ? "bg-background2" : "bg-whiteBackground2"
        } w-full`}
      >
        <div className={`px-6 py-3`}>
          <div
            className={`${
              isDarkMode ? "bg-background1" : "bg-whiteBackground"
            } w-full my-1 px-10 py-6 min-h-[calc(100vh-100px)] rounded-[16px]`}
          >
            <Breadcrumbs />
            <h3
              className={`${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } font-poppins-bold text-2xl md:text-2xl`}
            >
              {t("titles.classRoom")}
            </h3>
            <div className={`py-3 flex flex-wrap justify-start`}>
              {/* class cards */}
              {classes.map((data, index) => (
                <FlipCard
                  key={index}
                  isFlipped={isFlipped[index]}
                  onClick={() => toggleFlip(index)}
                  front={
                    <div
                      className={`m-3 md:my-6 md:mx-4 w-40 h-40 rounded-3xl border cursor-pointer ${
                        isDarkMode
                          ? "bg-background5 border-borderGray"
                          : "border-borderLine"
                      }`}
                    >
                      <div
                        className={`relative rounded-full h-[40] w-[40] z-10`}
                      >
                        <img
                          src={isDarkMode ? trash : trashw}
                          onClick={(e) => {
                            e.stopPropagation();
                            setClickedClassId(data._id);
                            setModalIsOpen(true);
                          }}
                          alt="deleteClass"
                          className={`absolute rounded-full size-[26px] top-3 right-2 md:top-3 md:right-3 p-1 ${
                            isDarkMode ? "" : "bg-whiteBackground"
                          }`}
                        />
                      </div>
                      <div
                        // onClick={() => toggleFlip(index)}
                        className={`relative flex flex-col h-full w-full`}
                      >
                        <img
                          src={
                            [
                              "Pre-Nursery",
                              "Nursery",
                              "LKG",
                              "UKG",
                              "1st",
                              "2nd",
                            ].includes(data.name)
                              ? studentsPto2
                              : [
                                  "3rd",
                                  "4th",
                                  "5th",
                                  "6th",
                                  "7th",
                                  "8th",
                                ].includes(data.name)
                              ? students3to8
                              : students9to12
                          }
                          className={` object-contain h-[120px] ${
                            ["9th", "10th", "11th", "12th"].includes(data.name)
                              ? "w-[120px]"
                              : "w-full"
                          }`}
                          alt="students"
                        />
                        <p
                          className={`h-[40px] text-white text-center font-semibold text-xs md:text-base absolute -bottom-2 right-0 left-0 mb-2 bg-black rounded-b-3xl py-1 flex items-center justify-center`}
                        >
                          {data.name}
                        </p>
                      </div>
                    </div>
                  }
                  back={
                    <div
                      className={`${
                        isDarkMode
                          ? "border-borderWhite"
                          : "bg-white border-borderBlue"
                      } mt-3 mx-3 md:mt-6 md:mx-4 w-40 h-40 border font-bold rounded-3xl cursor-pointer`}
                    >
                      <div
                        className={`flex flex-col justify-between h-full`}
                        // onClick={() => toggleFlip(index)}
                      >
                        <div className={`px-4 py-3 flex flex-row flex-wrap`}>
                          {/* section data */}
                          {data.section.map((section, j) => (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(
                                  setClassAndSectionData({
                                    sectionId: section?._id,
                                    classId: data?._id,
                                    className: data?.name,
                                    sectionName: section?.name,
                                    startTime: section?.startTime,
                                  })
                                );
                                setTimeout(() => {
                                  navigate("/class-setup/student-menu");
                                }, 100);
                              }}
                              className={`${
                                isDarkMode
                                  ? "border-borderWhite text-textPrimary"
                                  : "border-borderOrange1 text-textOrange hover:bg-backgroundOrange1 hover:text-white"
                              } w-4 h-4 md:w-6 md:h-6 m-2 border rounded-2xl flex justify-center items-center text-sm`}
                              key={j}
                            >
                              {section.name}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* update section button */}
                      <Link
                        className={`relative -top-8 flex justify-center items-center`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setClickedClassId(data["_id"]);
                          setAddSectionModelOpen(true);
                        }}
                      >
                        <div
                          className={`bg-backgroundBlue text-white text-center text-xs md:text-sm py-1 px-6 rounded-full transition-all duration-200 ease-in-out active:scale-90`}
                        >
                          {t("buttons.update")}
                        </div>
                      </Link>
                    </div>
                  }
                />
              ))}

              {classes.length < 16 && (
                <div
                  className={`m-3 md:my-6 md:mx-4 w-40 h-40 border rounded-3xl flex justify-center items-center ${
                    isDarkMode
                      ? "border-borderWhite"
                      : "bg-white border-borderBlue"
                  } `}
                >
                  {/* available class dropdown */}
                  {!showDropdowns[classes.length] ? (
                    <img
                      src={addclass}
                      alt="addClass"
                      className={`size-[48px] cursor-pointer`}
                      onClick={() =>
                        setShowDropdowns({
                          ...showDropdowns,
                          [classes.length]: true,
                        })
                      }
                    />
                  ) : (
                    <div
                      data-testid="classlist"
                      className={`relative w-10/12`}
                      ref={dropdownRef}
                    >
                      <button
                        onClick={() => setIsOpen((prev) => !prev)}
                        className={`cursor-pointer shadow appearance-none border leading-tight focus:outline-none focus:shadow-outline text-center text-sm font-poppins-bold rounded-lg w-full py-1 px-2 max-h-[150px] mt-0.5 ${
                          isDarkMode
                            ? "border-borderWhite text-textPrimary"
                            : "bg-white border-borderBlue text-textBlue"
                        }`}
                      >
                        {t("buttons.addClass")}
                      </button>

                      {isOpen && (
                        <ul
                          className={`absolute left-0 w-full border rounded-lg shadow-lg max-h-[150px] overflow-y-auto mt-0.5 ${
                            isDarkMode
                              ? "bg-background1 border-borderWhite"
                              : "bg-white border-borderBlue"
                          }`}
                        >
                          {availableClassOptions.map((item, index) => (
                            <li
                              key={index}
                              onClick={() => {
                                handleNewClassSubmit(item);
                                setIsOpen(false);
                              }}
                              className={`py-1 px-2 cursor-pointer text-center text-sm font-poppins-bold ${
                                isDarkMode
                                  ? "text-textPrimary hover:bg-background"
                                  : "text-textBlue hover:bg-backgroundLightBlue"
                              }`}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* No class */}
            {classes.length < 1 && !loading && (
              <div
                className={`flex flex-col justify-center relative items-center`}
              >
                <p
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } text-xl md:text-3xl font-bold`}
                >
                  {t("titles.noClassroom")}
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } text-sm md:text-lg`}
                >
                  {t("titles.noClassroomDesc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* add section model */}
      {addSectionModelOpen && (
        <Addsection
          isVisible={addSectionModelOpen}
          setAddSectionModelOpen={setAddSectionModelOpen}
          clickedClassId={clickedClassId}
          getAllClass={getAllClass}
        />
      )}

      {/* delete confirmation popup */}
      {modalIsOpen && (
        <DeletePopup
          isVisible={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          onDelete={handleDeleteClass}
        />
      )}
    </>
  );
}

export default ClassSetup;
