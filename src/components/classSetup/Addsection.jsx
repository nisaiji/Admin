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

const getNextSectionName = (sections) => {
  const sectionLength = sections.length;
  const letters = "ABCDEFGHI";
  return sectionLength < letters.length ? letters[sectionLength] : "";
};

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

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, [sections, activeSection]);

  const handleSaveSection = async () => {
    if (sections.length === 8) {
      return toast.error("Reached maximum section limit");
    }
    if (!newSection.teacherId) {
      return toast.error("Please select a teacher");
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
        // console.log('add',res);

        // if (res?.statusCode === 200) {
        getSections();
        getUnassignedTeacher();
        toast.success(res.result);
        // }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        // await axiosClient.put(`/section/${activeSection}`, {
        //   teacherId: newSection.teacherId,
        // });
        setLoading(true);
        getSections();
        getUnassignedTeacher();
        toast.success("Teacher updated successfully");
      } catch (error) {
        toast.error("Failed to update teacher");
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
      // console.log("del", response);

      if (response?.statusCode === 200) {
        setShowDeleteConfirmation(false);
        getSections();
        toast.success("Section deleted successfully");
      }
    } catch (e) {
      toast.error("Failed to delete section");
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
      // setLoading(true);
      const res = await axiosClient.get(EndPoints.ADMIN.UNASSIGNED_TEACHER);
      if (res?.statusCode === 200) {
        setTeachers(res.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      // setLoading(false);
    }
  };

  const handleUpdateTeacherSection = async (section) => {
    try {
      setLoading(true);
      if (!newSection?.teacherId) {
        toast.error("please select teacher");
        return;
      }
      const res = await axiosClient.put(EndPoints.ADMIN.REPLACE_TEACHER, {
        sectionId: section._id,
        teacherId: newSection.teacherId,
      });
      // console.log("res", res);

      if (res?.statusCode === 200) {
        toast.success("Teacher updated successfully");
        getUnassignedTeacher();
        getSections();
        setNewSection({ name: section.name, teacherId: newSection.teacherId });
        setActiveSection(null);
      }
    } catch (e) {
      toast.error(e);
      console.log("e", e);
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
      const res = await axiosClient.get(`${EndPoints.ADMIN.CLASS_SECTION}/${clickedClassId}`);
      // console.log(res.result.class[0].section);

      if (res?.statusCode === 200) {
        // const filteredSections = res.result
        //   .filter((item) => item._id === clickedClassId)
        //   .map((item) => item.section)
        // .flat();
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
              className="text-lg bg-[#464590] font-semibold text-white shadow-md hover:bg-blue-800"
              style={{ height: 30, width: 100, borderRadius: 20 }}
            >
              {t("Done")}
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: 30,
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: "500" }}>
              {t("sections")}
            </div>
            <div style={{ fontSize: 20, fontWeight: "500" }}>
              {t("ClassTeacher")}
            </div>
            <div style={{ fontSize: 20, fontWeight: "500" }}>
              {t("Actions")}
            </div>
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
                      {t("SelectTeacher")}
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
                    {section.teacher.firstname}{" "}
                    {section.teacher.lastname}
                    {/* first and last name */}
                  </div>
                )}
                <div className="flex items-center">
                  {activeSection === section._id ? (
                    <button
                      onClick={() => handleUpdateTeacherSection(section)}
                      className={`mr-2 bg-[#464590]`}
                      style={{
                        height: 30,
                        width: 60,
                        borderRadius: 20,
                        color: "white",
                      }}
                    >
                      {t("Save")}
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
                className={`flex items-center justify-around mb-2 p-4  rounded-lg shadow-md ${
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
                    {t("SelectTeacher")}
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
                  {t("Save")}
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
