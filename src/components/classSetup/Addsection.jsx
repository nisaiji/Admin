import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const { t } = useTranslation();

  const [newSection, setNewSection] = useState({ name: "", teacherId: "" });
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [deleteSectionId, setDeleteSectionId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectRef = useRef(null);

  // Helper function to get next section name based on length
  const getNextSectionName = (sections) => {
    const letters = t("options.sections");
    return sections.length <= letters.length ? letters[sections.length] : "";
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionsRes, teachersRes] = await Promise.all([
        axiosClient.get(`${EndPoints.ADMIN.CLASS_SECTION}/${clickedClassId}`),
        axiosClient.get(EndPoints.ADMIN.UNASSIGNED_TEACHER),
      ]);

      if (sectionsRes?.statusCode === 200) {
        setSections(sectionsRes?.result?.class[0].section);
      }
      if (teachersRes?.statusCode === 200) {
        setTeachers(teachersRes?.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  }, [clickedClassId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to handle saving a new section
  const handleSaveSection = async () => {
    if (sections.length >= 8) {
      return toast.error(t("toasts.sectionLimit"));
    }
    if (!newSection.teacherId) {
      return toast.error(t("toasts.selectTeacher"));
    }

    try {
      setLoading(true);
      const sectionData = {
        name: getNextSectionName(sections),
        teacherId: newSection.teacherId,
        classId: clickedClassId,
      };
      const res = await axiosClient.post(
        EndPoints.ADMIN.REGISTER_SECTION,
        sectionData
      );
      if ([200, 201].includes(res?.statusCode)) {
        fetchData();
        toast.success(t("messages.section.createSuccess"));
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      setNewSection({ name: "", teacherId: "" });
      setShowForm(true);
    }
  };

  // Function to handle updating a teacher in an existing section
  const handleUpdateTeacherSection = async (section) => {
    if (!newSection.teacherId) {
      return toast.error(t("toasts.selectTeacher"));
    }

    try {
      setLoading(true);
      const res = await axiosClient.put(EndPoints.ADMIN.REPLACE_TEACHER, {
        sectionId: section._id,
        teacherId: newSection.teacherId,
      });

      if (res?.statusCode === 200) {
        fetchData();
        toast.success(t("messages.teacher.updateSuccess"));
        setNewSection({ name: section.name, teacherId: newSection.teacherId });
        setActiveSection(null);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = async (section) => {
    await fetchData();
    setActiveSection(section._id);
    setNewSection({ name: section.name, teacherId: newSection.teacherId });
  };

  // Handle change in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle deletion of a section
  const handleSectionDelete = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_SECTION}/${deleteSectionId}`
      );

      if (res?.statusCode === 200) {
        setShowDeleteConfirmation(false);
        await fetchData();
        toast.success(t("messages.section.deleteSuccess"));
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Focus on the select element if activeSection is set
  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, [activeSection]);

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
            {/* section details */}
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
                {/* teacher dropdown */}
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
                {/* actions */}
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
            {/* add section */}
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

        {/* delete comfirmation popup */}
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
