import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { TextField, FormControl, MenuItem, Select } from "@mui/material";
import Breadcrumbs from "../BreadCrumbs";

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

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

  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    gender: Yup.string().required("Gender is required"),
    parentname: Yup.string().required("Parent name is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
    class: Yup.string().required("Class is required"),
    section: Yup.string().required("Section is required"),
  });

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      gender: "",
      parentname: "",
      phone: "",
      class: "",
      section: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await axiosClient.post(
          EndPoints.ADMIN.ADD_STUDENT,
          values
        );
        if (response?.statusCode === 201) {
          toast.success("Student added successfully");
          navigate(-1);
        }
      } catch (error) {
        toast.error("Failed to add student");
      } finally {
        setLoading(false);
      }
    },
  });

  /**
   * Fetch the list of classes from the API.
   */
  const getClassList = async () => {
    try {
      const res = await axiosClient.get(EndPoints.COMMON.CLASS_LIST);

      // Filter out classes without sections and then sort them.
      const filteredSortedClasses = res?.result
        .filter((cls) => cls?.section?.length > 0)
        .sort((a, b) => {
          const aIndex = classOptions.indexOf(a.name);
          const bIndex = classOptions.indexOf(b.name);
          return aIndex - bIndex;
        });

      setClassList(filteredSortedClasses);
    } catch (e) {
      toast.error(e);
    }
  };

  useEffect(() => {
    getClassList();
  }, []);

  const fields = [
    { name: "firstname", label: "First Name", type: "text" },
    { name: "lastname", label: "Last Name", type: "text" },
    {
      name: "gender",
      label: t("labels.gender"),
      type: "select",
      options: [t("options.male"), t("options.female"), t("options.other")],
    },
    { name: "parentname", label: "Parent Name", type: "text" },
    { name: "phone", label: "Phone Number", type: "text" },
  ];

  return (
    <div
      className={`flex justify-center items-center w-full h-full pt-[25px] ${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      }`}
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-white z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" />
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-white"
        } rounded-2xl w-full mx-6 flex flex-col items-start py-3 px-10`}
      >
        <Breadcrumbs />
        <h1
          className={`text-2xl font-poppins-bold mt-3 ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          Add Student
        </h1>

        <form onSubmit={formik.handleSubmit} className="w-full mt-5">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ name, label, type, options }) => (
              <div key={name} className="flex flex-col mx-4 mt-3">
                <label
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  }`}
                >
                  {label}
                </label>
                {type === "select" ? (
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      border: "1px solid #2b2e4a40",
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "" : "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDarkMode ? "#2b2e4a80" : "black",
                      },
                      "& .MuiInputBase-root": {
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                      "& .MuiSvgIcon-root": {
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                    }}
                  >
                    <Select
                      value={formik.values[name]}
                      name={name}
                      onChange={formik.handleChange}
                      displayEmpty
                      sx={{
                        border: "1px solid #2b2e4a80",
                        borderRadius: "0.5rem",
                        height: "40px",
                        backgroundColor: isDarkMode ? "" : "white",
                        color:
                          formik.values[name] === ""
                            ? "gray"
                            : isDarkMode
                            ? "#E3E8F3"
                            : "black",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                            color: isDarkMode ? "#E3E8F3" : "black",
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        {label}
                      </MenuItem>
                      {options.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          sx={{
                            backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                            color: isDarkMode ? "#E3E8F3" : "black",
                            "&:hover": {
                              backgroundColor: isDarkMode
                                ? "#2a2a2a"
                                : "#E9EEF2",
                            },
                          }}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    name={name}
                    type={type}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    placeholder={label}
                    InputProps={{
                      sx: {
                        height: "50px",
                        backgroundColor: isDarkMode ? "transparent" : "#fff",
                        color: isDarkMode ? "#E3E8F3" : "#000",
                        borderRadius: "4px",
                      },
                    }}
                    InputLabelProps={{ shrink: false }}
                    sx={{
                      input: {
                        color: isDarkMode ? "#E3E8F3" : "#000",
                        padding: "0 14px",
                      },
                      "& .MuiOutlinedInput-root": {
                        height: "50px",
                      },
                      "& fieldset": {
                        border: "1px solid #2b2e4a40",
                      },
                    }}
                  />
                )}
                {formik.touched[name] && formik.errors[name] && (
                  <div className="text-textRed text-sm mt-1">
                    {formik.errors[name]}
                  </div>
                )}
              </div>
            ))}
            {/* Class Dropdown */}
            <div className="flex flex-col mx-4 mt-3">
              <label
                className={`font-semibold mb-2 ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                Class
              </label>
              <FormControl
                fullWidth
                sx={{
                  border: "1px solid #2b2e4a40",
                  backgroundColor: isDarkMode ? "" : "white",
                  height: "50px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white !important",
                  },
                  "& .MuiInputBase-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                }}
              >
                <Select
                  value={formik.values.class}
                  name="class"
                  onChange={(e) => {
                    const selectedClassId = e.target.value;
                    formik.setFieldValue("class", selectedClassId);
                    formik.setFieldValue("section", ""); // reset section
                    const foundClass = classList.find(
                      (cls) => cls._id === selectedClassId
                    );
                    setSectionList(foundClass?.section || []);
                  }}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Class
                  </MenuItem>
                  {classList.map((cls) => (
                    <MenuItem
                      key={cls._id}
                      value={cls._id}
                      sx={{
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                        },
                      }}
                    >
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formik.touched.class && formik.errors.class && (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.class}
                </div>
              )}
            </div>

            {/* Section Dropdown */}
            <div className="flex flex-col mx-4 mt-3">
              <label
                className={`font-semibold mb-2 ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                Section
              </label>
              <FormControl
                fullWidth
                disabled={!formik.values.class}
                sx={{
                  border: "1px solid #2b2e4a40",
                  backgroundColor: isDarkMode ? "" : "white",
                  height: "50px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white !important",
                  },
                  "& .MuiInputBase-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                }}
              >
                <Select
                  value={formik.values.section}
                  name="section"
                  onChange={formik.handleChange}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Section
                  </MenuItem>
                  {sectionList.map((sec) => (
                    <MenuItem
                      key={sec._id}
                      value={sec._id}
                      sx={{
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                        },
                      }}
                    >
                      {sec.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formik.touched.section && formik.errors.section && (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.section}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-10 w-full">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`border-2 px-4 py-2 rounded-xl ${
                isDarkMode
                  ? "text-white border-white"
                  : "text-black border-gray-400"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
