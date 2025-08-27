import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import Breadcrumbs from "../BreadCrumbs";
import REGEX from "../../utils/regix";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [toastDisplayed, setToastDisplayed] = useState(false);
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

  // Custom validation function
  const validateData = (student) => {
    if (
      !student.firstname.trim() ||
      student.firstname.length < 3 ||
      REGEX.NUMBER.test(student.firstname)
    ) {
      return t("validationError.enterFirstName");
    }
    if (
      !student.lastname.trim() ||
      student.lastname.length < 3 ||
      REGEX.NUMBER.test(student.lastname)
    ) {
      return t("validationError.enterLastName");
    }
    if (
      !student.parentName.trim() ||
      student.parentName.length < 3 ||
      REGEX.NUMBER.test(student.parentName)
    ) {
      return t("validationError.parentName");
    }
    if (!student.phone.trim()) return t("validationError.phone");
    if (!REGEX.PHONE_LENGTH.test(student.phone))
      return t("validationError.validationPhoneCount");
    if (!student.gender) return t("validationError.gender");
    if (!student.class) return t("validationError.class");
    if (!student.section) return t("validationError.section");
    if (!student.address) return t("validationError.address");
    return "";
  };

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      gender: "",
      parentName: "",
      phone: "",
      class: "",
      section: "",
      bloodGroup: "",
      dob: "",
      address: "",
      parentGender: "",
      parentAge: "",
      parentEmail: "",
      parentQualification: "",
      parentOccupation: "",
      parentAddress: "",
    },
    onSubmit: async (values) => {
      const e = validateData(values);
      if (e) {
        if (!toastDisplayed) {
          setToastDisplayed(true);
          toast.error(e);
          setTimeout(() => setToastDisplayed(false), 3000);
        }
        return;
      }

      try {
        setLoading(true);
        const payload = {
          firstname: capitalize(values.firstname.trim()),
          lastname: capitalize(values.lastname.trim()),
          gender: values.gender,
          parentName: capitalize(values.parentName.trim()),
          phone: values.phone,
          address: values.address,
          ...(values.bloodGroup && { bloodGroup: values.bloodGroup }),
          ...(values.dob && { dob: values.dob }),
          ...(values.parentGender && { parentGender: values.parentGender }),
          ...(values.parentAge && { parentAge: values.parentAge }),
          ...(values.parentEmail && { parentEmail: values.parentEmail }),
          ...(values.parentQualification && {
            parentQualification: values.parentQualification,
          }),
          ...(values.parentOccupation && {
            parentOccupation: values.parentOccupation,
          }),
          ...(values.parentAddress && { parentAddress: values.parentAddress }),
          sectionId: values.section,
        };
        const res = await axiosClient.post(
          EndPoints.ADMIN.REGISTER_SECTION_STUDENT,
          payload
        );

        if (res?.statusCode === 201) {
          toast.success(res?.result);
          navigate(-1);
        }
      } catch (e) {
        toast.error(e);
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

  const options = [t("options.male"), t("options.female"), t("options.other")];
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const fields = [
    { name: "firstname", label: "First Name", type: "text" },
    { name: "lastname", label: "Last Name", type: "text" },
    { name: "parentName", label: "Parent Name", type: "text" },
    { name: "phone", label: "Phone Number", type: "text" },
  ];

  const optionalFields = [
    { name: "address", label: "Address", optional: false },
    { name: "bloodGroup", label: "Blood Group", optional: true },
    { name: "dob", label: "Date of Birth", optional: true },
    { name: "parentGender", label: "Parent Gender", optional: true },
    { name: "parentAge", label: "Parent Age", optional: true },
    {
      name: "parentEmail",
      label: "Parent Email",
      type: "email",
      optional: true,
    },
    {
      name: "parentQualification",
      label: "Parent Qualification",
      optional: true,
    },
    { name: "parentOccupation", label: "Parent Occupation", optional: true },
    { name: "parentAddress", label: "Parent Address", optional: true },
  ];

  const renderField = (name) => {
    const field = fields.find((f) => f.name === name);
    if (!field) return null;

    const preventInvalidInput = (e) => {
      if (
        (name === "firstname" ||
          name === "lastname" ||
          name === "parentName") &&
        /\d/.test(e.key)
      ) {
        e.preventDefault();
      }

      if (name === "phone" && !/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <div key={name} className="flex flex-col flex-1 mt-3">
        <label
          className={`font-semibold mb-2 ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {field.label}
          <span className="text-textRed"> *</span>
        </label>
        <input
          type={field.type}
          name={name}
          placeholder={field.label}
          onKeyPress={preventInvalidInput}
          onChange={formik.handleChange}
          value={formik.values[name]}
          maxLength={
            name === "firstname" || name === "lastname"
              ? 15
              : name === "parentName"
              ? 20
              : name === "phone"
              ? 10
              : ""
          }
          className={`border-2 border-borderLine bg-transparent rounded-lg pl-2 pr-10 py-1.5 w-full ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        />
        {formik.touched[name] && formik.errors[name] && (
          <div className="text-textRed text-sm mt-1">{formik.errors[name]}</div>
        )}
      </div>
    );
  };

  const renderGenderDropdown = () => (
    <div className="flex flex-col w-full mt-3">
      <label
        className={`font-semibold mb-2 ${
          isDarkMode ? "text-textPrimary" : "text-textBlack"
        }`}
      >
        Gender<span className="text-textRed"> *</span>
      </label>
      <FormControl
        fullWidth
        variant="outlined"
        sx={{
          border: "1px solid #2b2e4a80",
          borderRadius: "8px",
          backgroundColor: isDarkMode ? "" : "white",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
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
          name="gender"
          value={formik.values.gender}
          onChange={formik.handleChange}
          displayEmpty
          sx={{
            height: "40px",
            color:
              formik.values.gender === ""
                ? "gray"
                : isDarkMode
                ? "#E3E8F3"
                : "black",
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
            {t("placeholders.selectGender")}
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        {formik.touched.gender && formik.errors.gender && (
          <div className="text-red-600 text-sm mt-1 ml-2">
            {formik.errors.gender}
          </div>
        )}
      </FormControl>
    </div>
  );

  const renderClassDropdown = () => (
    <div className="flex flex-col w-full mt-3">
      <label
        className={`font-semibold mb-2 ${
          isDarkMode ? "text-textPrimary" : "text-textBlack"
        }`}
      >
        Class<span className="text-textRed"> *</span>
      </label>
      <FormControl
        fullWidth
        variant="outlined"
        sx={{
          border: "1px solid #2b2e4a80",
          borderRadius: "8px",
          backgroundColor: isDarkMode ? "" : "white",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
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
            formik.setFieldValue("section", "");
            const foundClass = classList.find(
              (cls) => cls._id === selectedClassId
            );
            setSectionList(foundClass?.section || []);
          }}
          displayEmpty
          sx={{
            height: "40px",
            color:
              formik.values.class === ""
                ? "gray"
                : isDarkMode
                ? "#E3E8F3"
                : "black",
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
            Select Class
          </MenuItem>
          {classList.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
        {formik.touched.class && formik.errors.class && (
          <div className="text-red-600 text-sm mt-1 ml-2">
            {formik.errors.class}
          </div>
        )}
      </FormControl>
    </div>
  );

  const renderSectionDropdown = () => (
    <div className="flex flex-col w-full mt-3">
      <label
        className={`font-semibold mb-2 ${
          isDarkMode ? "text-textPrimary" : "text-textBlack"
        }`}
      >
        Section<span className="text-textRed"> *</span>
      </label>
      <FormControl
        fullWidth
        variant="outlined"
        disabled={!formik.values.class}
        sx={{
          border: "1px solid #2b2e4a80",
          borderRadius: "8px",
          backgroundColor: isDarkMode ? "" : "white",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
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
          sx={{
            height: "40px",
            color:
              formik.values.section === ""
                ? "gray"
                : isDarkMode
                ? "#E3E8F3"
                : "black",
            "&.Mui-disabled .MuiSelect-select": {
              color: "gray !important",
              WebkitTextFillColor: "gray !important",
            },
            "&.Mui-disabled .MuiSelect-icon": {
              color: "gray !important",
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
            Select Section
          </MenuItem>
          {sectionList.map((sec) => (
            <MenuItem key={sec._id} value={sec._id}>
              {sec.name}
            </MenuItem>
          ))}
        </Select>
        {formik.touched.section && formik.errors.section && (
          <div className="text-red-600 text-sm mt-1 ml-2">
            {formik.errors.section}
          </div>
        )}
      </FormControl>
    </div>
  );

  return (
    <div
      className={`flex w-full min-h-[calc(100vh-72px)] p-6 ${
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
        } rounded-2xl w-full h-full flex flex-col items-start py-5 px-10`}
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
          {/* Row 1: First Name, Last Name */}
          <div className="flex gap-4">
            {["firstname", "lastname"].map((name) => renderField(name))}
          </div>

          {/* Row 2: Parent Name, Phone */}
          <div className="flex gap-4 mt-4">
            {["parentName", "phone"].map((name) => renderField(name))}
          </div>

          {/* Row 3: Gender, Class, Section */}
          <div className="flex gap-4 mt-4">
            {renderGenderDropdown()}
            {renderClassDropdown()}
            {renderSectionDropdown()}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {optionalFields.map((field) => (
              <div
                key={field.name}
                className="flex flex-col flex-1 min-w-[500px]"
              >
                <label
                  className={`font-semibold mb-1 ${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  }`}
                >
                  {field.label}
                  {!field.optional && <span className="text-textRed"> *</span>}
                </label>
                {field.name === "bloodGroup" ||
                field.name === "parentGender" ? (
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      border: "1px solid #2b2e4a80",
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "" : "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
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
                      name={field.name}
                      value={formik.values[field.name]}
                      onChange={formik.handleChange}
                      displayEmpty
                      sx={{
                        height: "40px",
                        color:
                          formik.values[field.name] === ""
                            ? "gray"
                            : isDarkMode
                            ? "#E3E8F3"
                            : "black",
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
                        {field.name === "bloodGroup"
                          ? t("placeholders.bloodGroup")
                          : t("placeholders.selectGender")}
                      </MenuItem>
                      {(field.name === "bloodGroup"
                        ? bloodGroupOptions
                        : options
                      ).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched[field.name] &&
                      formik.errors[field.name] && (
                        <div className="text-red-600 text-sm mt-1 ml-2">
                          {formik.errors[field.name]}
                        </div>
                      )}
                  </FormControl>
                ) : field.name === "dob" ? (
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      views={["day", "month", "year"]}
                      format="DD/MM/YYYY"
                      value={
                        formik.values[field.name]
                          ? moment(formik.values[field.name], "DD/MM/YYYY")
                          : null
                      }
                      maxDate={moment().startOf("day")}
                      onChange={(date) => {
                        if (date) {
                          formik.setFieldValue(
                            field.name,
                            moment(date).format("DD/MM/YYYY")
                          );
                        }
                      }}
                      className={`w-full`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("placeholders.date")}
                          variant="outlined"
                        />
                      )}
                      sx={{
                        width: "100%",
                        height: "40px",
                        border: "2px solid #2b2e4a80",
                        borderRadius: "8px",
                        backgroundColor: isDarkMode ? "" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        "& .MuiOutlinedInput-root": {
                          padding: 1,
                          fontSize: "16px",
                          minHeight: "40px",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiInputBase-input": {
                          fontSize: "16px",
                          padding: 1,
                          height: "100%",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiSvgIcon-root": {
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                      }}
                    />
                  </LocalizationProvider>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={field.label}
                    onChange={formik.handleChange}
                    value={formik.values[field.name]}
                    className={`border-2 border-borderLine bg-transparent rounded-lg pl-2 pr-10 py-1.5 w-full ${
                      isDarkMode ? "text-textPrimary" : "text-textBlack"
                    }`}
                  />
                )}
              </div>
            ))}
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
