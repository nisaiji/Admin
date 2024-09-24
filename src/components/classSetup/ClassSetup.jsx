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
  const [clickedClassId, setClickedClassId] = useState("");
  const [addSectionModelOpen, setAddSectionModelOpen] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState({});
  const [loading, setLoading] = useState(false);

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

  const compareClasses = (a, b) =>
    classOptions.indexOf(a.name) - classOptions.indexOf(b.name);

  // card flip
  const toggleFlip = (index) =>
    setIsFlipped((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });

  // get classlist api
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

  // register class api
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
        toast.success(t("messages.class.createSuccess"));
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
        toast.success(t("messages.class.deleteSuccess"));
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

  const availableClassOptions = classOptions.filter(
    (option) => !classes.some((cls) => cls.name === option)
  );

  return (
    <>
      <Toaster />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode ? "bg-[#152f54] bg-opacity-70" : "bg-[#f3f3ff]"
        } w-full max-w-[1600px]`}
      >
        <div className="p-6">
          <div
            className={`${
              isDarkMode ? "bg-[#0d192f]" : "bg-white"
            } w-full my-3 px-12 py-4 min-h-[600px] rounded-[10px]`}
          >
            <h3
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } font-poppins-bold text-2xl md:text-4xl`}
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
                    } my-3 md:my-6 mx-3 md:mx-4 w-16 h-16 md:w-40 md:h-40 border-1 border-[#464590] rounded-3xl cursor-pointer`}
                  >
                    <div className="relative rounded-full h-[40] w-[40] z-10">
                      <img
                        src={trash}
                        onClick={() => {
                          setClickedClassId(data._id);
                          setModalIsOpen(true);
                        }}
                        alt="^"
                        className="absolute rounded-full size-[26px] top-3 right-2 md:top-3 md:right-3 bg-white p-1"
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
                    } mt-3 mx-3 md:mt-6 md:mx-4 w-16 h-16 md:w-40 md:h-40 border border-[#464590] font-bold rounded-3xl cursor-pointer`}
                  >
                    <div
                      className="flex flex-col justify-between h-full"
                      onClick={() => toggleFlip(index)}
                    >
                      <div className="px-4 py-3 flex flex-row flex-wrap ">
                        {/* section data */}
                        {data.section.map((section, j) => (
                          <div
                            onClick={() =>
                              navigate("/student-section", {
                                state: {
                                  classId: data._id,
                                  sectionId: section._id,
                                  className: data.name,
                                  sectionName: section.name,
                                },
                              })
                            }
                            className={`${
                              isDarkMode ? "border-white" : "border-rose-500"
                            } w-4 h-4 md:w-6 md:h-6 mx-2 my-1 border rounded-lg flex justify-center items-center`}
                            key={j}
                          >
                            <div
                              className={`${
                                isDarkMode ? "text-white" : "text-rose-500"
                              } text-xs md:text-base`}
                            >
                              {section.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link
                      className=" relative -top-8 flex justify-center items-center"
                      onClick={() => {
                        setClickedClassId(data["_id"]);
                        setAddSectionModelOpen(true);
                      }}
                    >
                      <div className="bg-[#464590] text-white text-center text-xs md:text-sm py-1 px-3 rounded-full">
                        {t("buttons.update")}
                      </div>
                    </Link>
                  </div>
                </ReactCardFlip>
              ))}

              <div
                className={`${
                  isDarkMode ? "bg-[#152f54] bg-opacity-70" : "bg-white"
                } m-3 md:m-6 w-16 h-16 md:w-40 md:h-40 flex justify-center items-center border-4 border-[#464590] rounded-3xl `}
              >
                {/* available class dropdown */}
                {!showDropdowns[classes.length] ? (
                  <img
                    src={addclass}
                    alt=""
                    className="size-16 cursor-pointer"
                    onClick={() =>
                      setShowDropdowns({
                        ...showDropdowns,
                        [classes.length]: true,
                      })
                    }
                  />
                ) : (
                  <select
                    value=""
                    onChange={(e) => handleNewClassSubmit(e.target.value)}
                    className={`cursor-pointer shadow appearance-none border rounded-lg w-10/12 py-1 px-2 leading-tight focus:outline-none focus:shadow-outline bg-[#464590] text-white text-center text-sm font-semibold max-h-[150px] overflow-y-auto ${
                      isDarkMode ? "bg-[#152f54] text-white" : "text-gray-700"
                    }`}
                  >
                    <option value="">{t("buttons.addClass")}</option>
                    {availableClassOptions.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                )}
              </div>
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
