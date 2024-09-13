import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import deleteIcon from "../../assets/images/deleteIcon.png";
import edit from "../../assets/images/edit.png";
import DeletePopup from "../DeleteMessagePopup";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import { useTranslation } from "react-i18next";

function Addsection({ setAddSectionModelOpen, clickedClassId, getAllClass }) {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [newSection, setNewSection] = useState({
    name: "",
    teacherId: "",
  });
  const { t } = useTranslation();
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [deleteSectionId, setDeleteSectionId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectRef = useRef(null);

  const getNextSectionName = (sections) => {
    const sectionLength = sections.length;
    const letters = t("options.sections");
    return sectionLength <= letters.length ? letters[sectionLength] : "";
  };

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, [sections, activeSection]);

  const handleSaveSection = async () => {
    if (sections.length === 8) {
      return toast.error(t("toasts.sectionLimit"));
    }
    if (!newSection.teacherId) {
      return toast.error(t("toasts.selectTeacher"));
    }
    if (activeSection === null) {
      const sectionName = getNextSectionName(sections);
      const newSectionObj = {
        name: sectionName,
        teacherId: newSection.teacherId,
        classId: clickedClassId,
      };
      try {
        setLoading(true);
        const res = await axiosClient.post(
          EndPoints.ADMIN.REGISTER_SECTION,
          newSectionObj
        );
        if (res?.statusCode === 200) {
          getSections();
          getUnassignedTeacher();
          toast.success(t("messages.section.createSuccess"));
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        getSections();
        getUnassignedTeacher();
        toast.success(t("messages.teacher.updateSuccess"));
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
      setActiveSection(null);
    }
    setNewSection({ name: "", teacherId: "" });
    setShowForm(true);
  };

  const handleSectionDelete = async () => {
    try {
      const sectionId = deleteSectionId;
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_SECTION}/${sectionId}`
      );
      if (response?.statusCode === 200) {
        setShowDeleteConfirmation(false);
        getSections();
        toast.success(t("messages.section.deleteSuccess"));
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSection({
      ...newSection,
      [name]: value,
    });
  };

  const getUnassignedTeacher = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(EndPoints.ADMIN.UNASSIGNED_TEACHER);
      if (res?.statusCode === 200) {
        setTeachers(res.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacherSection = async (section) => {
    try {
      setLoading(true);
      if (!newSection?.teacherId) {
        toast.error(t("toasts.selectTeacher"));
        return;
      }
      const res = await axiosClient.put(EndPoints.ADMIN.REPLACE_TEACHER, {
        sectionId: section._id,
        teacherId: newSection.teacherId,
      });
      if (res?.statusCode === 200) {
        toast.success(t("messages.teacher.updateSuccess"));
        getUnassignedTeacher();
        getSections();
        setNewSection({ name: section.name, teacherId: newSection.teacherId });
        setActiveSection(null);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (section) => {
    getUnassignedTeacher();
    setActiveSection(section._id);
    setNewSection({ name: section.name, teacherId: newSection.teacherId });
  };

  const getSections = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.CLASS_SECTION}/${clickedClassId}`
      );
      if (res?.statusCode === 200) {
        setSections(res.result.class[0].section);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUnassignedTeacher();
    getSections();
  }, [clickedClassId]);

  return (
    <>
      <div className="fixed inset-0 flex justify-center items-end pb-10 bg-black bg-opacity-50">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
            <Spinner />
          </div>
        )}
        <div
          className={`${
            isDarkMode ? "bg-blue-950" : "bg-white"
          } w-full max-w-3xl h-3/4 py-10 px-12 rounded-2xl shadow-lg overflow-y-auto`}
        >
          <div className="flex justify-between items-center mb-4">
            <div
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-black"
              } `}
            >
              {t("createSection")}
            </div>
            <button
              onClick={async () => {
                setAddSectionModelOpen(false);
                await getAllClass();
              }}
              className=" h-[30px] w-[100px] rounded-2xl text-lg bg-[#464590] font-semibold text-white shadow-md hover:bg-blue-800"
            >
              {t("buttons.done")}
            </button>
          </div>
          <div className="flex justify-around mt-[30px] mb-[10px] ">
            <div className="font-medium text-xl">{t("sections")}</div>
            <div className="font-medium text-xl">{t("ClassTeacher")}</div>
            <div className="font-medium text-xl">{t("Actions")}</div>
          </div>
          <hr />
          <div className="my-6 max-h-56 overflow-y-auto">
            {sections.map((section, index) => (
              <div
                key={section._id}
                className={`flex items-center justify-around mb-2 p-4 ${
                  isDarkMode ? "bg-blue-800" : ""
                } rounded-lg shadow-md`}
              >
                <div className="flex justify-center items-center bg-[#DD1B10] size-7 rounded-full ">
                  <div className={`text-lg font-semibold text-white`}>
                    {section.name}
                  </div>
                </div>
                {activeSection === section._id ? (
                  <select
                    name="teacherId"
                    value={newSection.teacherId}
                    onChange={handleChange}
                    className={` bg-white border border-[#7170ac] rounded-full py-1 px-8 ${
                      isDarkMode ? "bg-gray-300" : "text-black bg-[#f2f2ff]"
                    } w-[250px]`}
                    ref={selectRef}
                  >
                    <option
                      value=""
                      className={`${
                        isDarkMode ? "bg-blue-900 text-white" : ""
                      }`}
                    >
                      {t("labels.assignTeacher")}
                    </option>
                    {teachers.map((teacher) => (
                      <option
                        key={teacher._id}
                        value={teacher._id}
                        className={`${
                          isDarkMode ? "bg-blue-900 text-white" : ""
                        }`}
                      >
                        {teacher.firstname} {teacher.lastname}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className={`border border-[#7170ac] rounded-full py-1 px-8 ${
                      isDarkMode ? "bg-gray-300" : "text-gray-500 bg-[#f2f2ff]"
                    } w-[250px] `}
                  >
                    {section.teacher.firstname} {section.teacher.lastname}
                  </div>
                )}
                <div className="flex items-center">
                  {activeSection === section._id ? (
                    <button
                      onClick={() => handleUpdateTeacherSection(section)}
                      className={`mr-2 bg-[#464590] h-[30px] w-[60px] rounded-2xl `}
                    >
                      {t("buttons.save")}
                    </button>
                  ) : (
                    <>
                      <div
                        onClick={() => handleUpdateClick(section)}
                        style={{ marginRight: 5, cursor: "pointer" }}
                        disabled={activeSection !== null}
                      >
                        <img
                          src={edit}
                          alt=""
                          style={{ height: 24, width: 24 }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setDeleteSectionId(section._id);
                          setShowDeleteConfirmation(true);
                        }}
                        className={`${
                          index !== sections.length - 1 &&
                          "opacity-50 cursor-not-allowed"
                        }`}
                        disabled={index !== sections.length - 1}
                      >
                        <img
                          src={deleteIcon}
                          alt=""
                          style={{ height: 30, width: 30 }}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {showForm && (
              <div
                className={`flex items-center justify-around mb-2 p-4 rounded-lg shadow-md ${
                  isDarkMode ? "bg-blue-800" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="flex justify-center items-center bg-[#DD1B10] size-7 rounded-full ">
                    <div className={`text-lg font-semibold text-white`}>
                      {getNextSectionName(sections)}
                    </div>
                  </div>
                </div>
                <select
                  name="teacherId"
                  value={newSection.teacherId}
                  onChange={handleChange}
                  className={`border-2 border-[#7170ac] rounded-full py-1 px-8 ${
                    isDarkMode ? "bg-gray-300" : "text-black bg-[#f2f2ff]"
                  } w-[250px]`}
                  ref={selectRef}
                  disabled={activeSection !== null}
                >
                  <option
                    value=""
                    className={`${isDarkMode ? "bg-blue-900 text-white" : ""}`}
                  >
                    {t("labels.assignTeacher")}
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstname} {teacher.lastname}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveSection}
                  className={`mr-2 bg-[#464590] `}
                  style={{
                    height: 30,
                    width: 60,
                    borderRadius: 20,
                    color: "white",
                  }}
                  disabled={activeSection !== null}
                >
                  {t("buttons.save")}
                </button>
              </div>
            )}
          </div>
        </div>
        {showDeleteConfirmation && (
          <DeletePopup
            isVisible={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onDelete={handleSectionDelete}
          />
        )}
      </div>
    </>
  );
}

export default Addsection;
