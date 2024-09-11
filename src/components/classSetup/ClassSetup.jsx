import React, { useEffect, useState } from "react";
import add from "../../assets/images/add.png";
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

const classOptions = [
  "Pre-Nursery",
  "Nursery",
  "LKG",
  "UKG",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

const compareClasses = (a, b) => {
  return classOptions.indexOf(a.name) - classOptions.indexOf(b.name);
};

const getNextClassName = (classes) => {
  if (classes.length === 0) return classOptions[0];
  const lastClass = classes[classes.length - 1].name;
  switch (lastClass) {
    case "Pre-Nursery":
      return classOptions[1];
    case "Nursery":
      return classOptions[2];
    case "LKG":
      return classOptions[3];
    case "UKG":
      return classOptions[4];
    case "1st":
      return classOptions[5];
    case "2nd":
      return classOptions[6];
    case "3rd":
      return classOptions[7];
    case "4th":
      return classOptions[8];
    case "5th":
      return classOptions[9];
    case "6th":
      return classOptions[10];
    case "7th":
      return classOptions[11];
    case "8th":
      return classOptions[12];
    case "9th":
      return classOptions[13];
    case "10th":
      return classOptions[14];
    case "11th":
      return classOptions[15];
    default:
      return classOptions[0];
  }
};

function ClassSetup() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [classes, setClasses] = useState([]);
  const [isFlipped, setIsFlipped] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [clickedClassId, setClickedClassId] = useState("");
  const [addSectionModelOpen, setAddSectionModelOpen] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCardClick = (index) => {
    setIsFlipped((prevIsFlipped) => {
      const newIsFlipped = [...prevIsFlipped];
      newIsFlipped[index] = !newIsFlipped[index];
      return newIsFlipped;
    });
  };

  const getAllClass = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(EndPoints.COMMON.CLASS_LIST);
      if (res?.statusCode === 200) {
        const sortedClasses = res.result.sort(compareClasses);
        setClasses(sortedClasses);
      }
    } catch (e) {
      // console.error("error in getching class ", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNewClassSubmit = async (name) => {
    try {
      const existingClassNames = classes.map((cls) => cls.name);
      if (existingClassNames.length >= classOptions.length) {
        return toast.error(t("classSetup.errors.classroomFull"));
      }
      if (existingClassNames.includes(name)) {
        return toast.error(t("classSetup.errors.classExists"));
      }
      setLoading(true);
      const res = await axiosClient.post(EndPoints.ADMIN.REGISTER_CLASS, {
        name,
      });
      if (res?.statusCode === 200) {
        getAllClass();
        toast.success(t("classSetup.success.classCreated"));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      const classId = clickedClassId;
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_CLASS}/${classId}`
      );
      if (response?.statusCode === 200) {
        toast.success(t("classSetup.success.classDeleted"));
        setModalIsOpen(false);
        getAllClass();
      }
    } catch (error) {
      toast.error(error);
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
            } w-full my-3 px-12 py-4`}
            style={{ minHeight: "600px", borderRadius: 10 }}
          >
            <h3
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } font-poppins-bold text-2xl md:text-4xl`}
            >
              {t("classSetup.title")}
            </h3>
            <div className="py-3 flex flex-wrap justify-start">
              {classes.map((data, index) => (
                <ReactCardFlip
                  isFlipped={isFlipped[index]}
                  flipDirection="horizontal"
                  key={index}
                >
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
                        className="absolute rounded-full top-3 right-2 md:top-3 md:right-3 bg-white p-1"
                        style={{ height: 26, width: 26 }}
                      />
                    </div>
                    <div
                      onClick={() => handleCardClick(index)}
                      className="relative"
                    >
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
                  <div
                    className={`${
                      isDarkMode ? "bg-[#152f54] bg-opacity-70" : "bg-white"
                    } mt-3 mx-3 md:mt-6 md:mx-4 w-16 h-16 md:w-40 md:h-40 border border-[#464590] font-bold rounded-3xl cursor-pointer`}
                  >
                    <div
                      className="flex flex-col justify-between h-full"
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="px-4 py-3 flex flex-row flex-wrap ">
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
                        {t("classSetup.update")}
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
                    className={`cursor-pointer shadow appearance-none border rounded-lg w-10/12 py-1 px-2 leading-tight focus:outline-none focus:shadow-outline bg-[#464590] text-white text-center text-sm font-semibold  ${
                      isDarkMode ? "bg-[#152f54] text-white" : "text-gray-700"
                    }`}
                    style={{
                      overflowY: "auto",
                      maxHeight: "150px",
                    }}
                  >
                    <option value="">{t("classSetup.selectClass")}</option>
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
                  {t("classSetup.noClassroom")}
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-white" : "text-[#01345b]"
                  } text-sm md:text-lg`}
                >
                  {t("classSetup.noClassroomDesc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {addSectionModelOpen && (
        <Addsection
          setAddSectionModelOpen={setAddSectionModelOpen}
          clickedClassId={clickedClassId}
          getAllClass={getAllClass}
        />
      )}
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
