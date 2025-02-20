import React, { useEffect, useState } from "react";
import addclass from "../../assets/images/addclass.png";
import students from "../../assets/images/students.png";
import trash from "../../assets/images/trash.png";
import ReactCardFlip from "react-card-flip";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import Addsection from "./Addsection";
import { axiosClient } from "../../services/axiosClient";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import { useTranslation } from "react-i18next";

Modal.setAppElement("#root");

function ClassSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [classes, setClasses] = useState([]);
  const [isFlipped, setIsFlipped] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [clickedClassId, setClickedClassId] = useState("");
  const [addSectionModelOpen, setAddSectionModelOpen] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState({});
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const res = await axiosClient.get(EndPoints.COMMON.CLASS_LIST);
      if (res?.statusCode === 200) {
        const sortedClasses = res?.result?.sort(compareClasses);
        setClasses(sortedClasses);
      }
    } catch (e) {
      toast.error(e);
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
    getAllClass();
  }, []);

  // Available class options that aren't already taken
  const availableClassOptions = classOptions.filter(
    (option) => !classes.some((cls) => cls.name === option)
  );

  return (
    <>
      <Toaster />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode ? "bg-[#152f54] bg-opacity-70" : "bg-[#93a3b6]/25"
        } w-full max-w-[1600px]`}
      >
        <div className="px-6 py-3">
          <div
            className={`${
              isDarkMode ? "bg-[#0d192f]" : "bg-[#fafafa]"
            } w-full my-1 px-10 py-6 min-h-[600px] rounded-[16px]`}
          >
            <h3
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } font-poppins-bold text-2xl md:text-2xl`}
            >
              {t("titles.classRoom")}
            </h3>
            <div className="py-3 flex flex-wrap justify-start">
              {/* class cards */}
              {classes.map((data, index) => (
                <ReactCardFlip
                  isFlipped={isFlipped[index]}
                  flipDirection="horizontal"
                  key={index}
                >
                  {/* frontside */}
                  <div
                    className={`${
                      isDarkMode ? "bg-[#152f54] bg-opacity-70" : ""
                    } my-3 md:my-6 mx-3 md:mx-4 w-16 h-16 md:w-40 md:h-40 border-1 border-[#0F4189] rounded-3xl cursor-pointer`}
                  >
                    <div className="relative rounded-full h-[40] w-[40] z-10">
                      <img
                        src={trash}
                        onClick={() => {
                          setClickedClassId(data._id);
                          setModalIsOpen(true);
                        }}
                        alt="deleteClass"
                        className="absolute rounded-full size-[26px] top-3 right-2 md:top-3 md:right-3 bg-[#fafafa] p-1"
                      />
                    </div>
                    <div onClick={() => toggleFlip(index)} className="relative">
                      <img
                        src={students}
                        className="h-full w-full"
                        alt="students"
                      />
                      <p
                        className={`text-white text-center font-semibold text-xs md:text-base absolute -bottom-2 right-0 left-0 mb-2 bg-opacity-70 bg-black rounded-b-3xl py-1`}
                      >
                        {data.name}
                      </p>
                    </div>
                  </div>
                  {/* backside */}
                  <div
                    className={`${
                      isDarkMode ? "bg-[#152f54] bg-opacity-70" : "bg-white"
                    } mt-3 mx-3 md:mt-6 md:mx-4 w-16 h-16 md:w-40 md:h-40 border border-[#0F4189] font-bold rounded-3xl cursor-pointer`}
                  >
                    <div
                      className="flex flex-col justify-between h-full"
                      onClick={() => toggleFlip(index)}
                    >
                      <div className="px-4 py-3 flex flex-row flex-wrap">
                        {/* section data */}
                        {data.section.map((section, j) => (
                          <div
                            onClick={() =>
                              navigate("/student-section", {
                                state: {
                                  sectionId: section._id,
                                  classId: data._id,
                                  className: data.name,
                                  sectionName: section.name,
                                },
                              })
                            }
                            className={`${
                              isDarkMode
                                ? "border-white"
                                : "border-[#FF793F] text-[#FF793F] hover:bg-[#FF793F] hover:text-white"
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
                      className=" relative -top-8 flex justify-center items-center"
                      onClick={() => {
                        setClickedClassId(data["_id"]);
                        setAddSectionModelOpen(true);
                      }}
                    >
                      <div className="bg-[#0F4189] text-white text-center text-xs md:text-sm py-1 px-6 rounded-full">
                        {t("buttons.update")}
                      </div>
                    </Link>
                  </div>
                </ReactCardFlip>
              ))}

              {classes.length < 16 && (
                <div
                  className={`${
                    isDarkMode ? "bg-[#152f54] bg-opacity-70" : "bg-white"
                  } m-3 md:m-6 w-16 h-16 md:w-40 md:h-40 flex justify-center items-center border border-[#0F4189] rounded-3xl `}
                >
                  {/* available class dropdown */}
                  {!showDropdowns[classes.length] ? (
                    <img
                      src={addclass}
                      alt="addClass"
                      className="size-[48px] cursor-pointer"
                      onClick={() =>
                        setShowDropdowns({
                          ...showDropdowns,
                          [classes.length]: true,
                        })
                      }
                    />
                  ) : (
                    <div className="relative w-10/12">
                      <div
                        value=""
                        onClick={() => setIsOpen(!isOpen)}
                        className="cursor-pointer shadow appearance-none border border-[#0F4189] rounded-lg w-full py-1 px-2 leading-tight 
               focus:outline-none focus:shadow-outline text-[#0F4189] text-center text-sm font-poppins-bold"
                        data-testid="classlist"
                      >
                        {t("buttons.addClass")}
                      </div>

                      {/* Dropdown Options */}
                      {isOpen && (
                        <div
                          className="absolute left-0 w-full border border-[#0F4189] bg-white rounded-lg shadow-lg max-h-[150px] 
                  overflow-y-auto z-50 mt-1"
                        >
                          {availableClassOptions.map((item, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                handleNewClassSubmit(item);
                                setIsOpen(false);
                              }}
                              className="py-1 px-2 cursor-pointer hover:bg-blue-100 text-[#0F4189] text-center text-sm font-poppins-bold"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* No class */}
            {classes.length < 1 && !loading && (
              <div className="flex flex-col justify-center relative top-24 items-center">
                <p
                  className={`${
                    isDarkMode ? "text-white" : "text-[#01345B]"
                  } text-xl md:text-3xl font-bold`}
                >
                  {t("titles.noClassroom")}
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-white" : "text-[#01345b]"
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
