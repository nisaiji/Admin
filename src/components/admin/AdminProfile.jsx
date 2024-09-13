import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import teacher from "../../assets/images/teacher.png";
import Globe from "../../assets/images/Globe.png";
import facebook from "../../assets/images/facebook.png";
import instagram from "../../assets/images/instagram.png";
import linkedin from "../../assets/images/linkedin.png";
import twitter from "../../assets/images/twitter.png";
import whatsapp from "../../assets/images/whatsapp.png";
import youtube from "../../assets/images/youtube.png";
import * as Yup from "yup";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";

export default function AdminProfile() {
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    schoolName: Yup.string().required(t("validationError.schoolName")),
    principal: Yup.string().required(t("validationError.principalName")),
    username: Yup.string().required(t("validationError.adminName")),
    schoolBoard: Yup.string().required(t("validationError.schoolBoard")),
    affiliationNo: Yup.string().required(
      t("validationError.affiliationNumber")
    ),
    address: Yup.string().required(t("validationError.address")),
    city: Yup.string().required(t("validationError.city")),
    state: Yup.string().required(t("validationError.state")),
    phone: Yup.string().length(10).required(t("validationError.phone")),
    email: Yup.string()
      .email(t("validationError.emailAddress"))
      .required(t("validationError.email")),
  });

  const formik = useFormik({
    initialValues: {
      schoolName: "",
      principal: "",
      username: "",
      schoolBoard: "",
      affiliationNo: "",
      schoolNumber: "",
      address: "",
      email: "",
      city: "",
      state: "",
      phone: "",
      website: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      whatsapp: "",
      youtube: "",
    },
    validationSchema,
    onSubmit: (values) => {},
  });

  const getadmin = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(EndPoints.ADMIN.GET_ADMIN);
      if (res?.statusCode === 200) {
        setAdmin(res.result);
        formik.setValues({
          schoolName: res.result.schoolName || "",
          principal: res.result.principal || "",
          username: res.result.username || "",
          schoolBoard: res.result.schoolBoard || "",
          affiliationNo: res.result.affiliationNo || "",
          schoolNumber: res.result.schoolNumber || "",
          address: res.result.address || "",
          email: res.result.email || "",
          city: res.result.city || "",
          state: res.result.state || "",
          phone: res.result.phone || "",
          website: res.result.website || "",
          facebook: res.result.facebook || "",
          instagram: res.result.instagram || "",
          linkedin: res.result.linkedin || "",
          twitter: res.result.twitter || "",
          whatsapp: res.result.whatsapp || "",
          youtube: res.result.youtube || "",
        });
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const fieldsToValidate = [
        "schoolName",
        "principal",
        "username",
        "schoolBoard",
        "affiliationNo",
        "address",
        "city",
        "state",
        "email",
      ];

      let allValid = true;
      for (const field of fieldsToValidate) {
        try {
          await validationSchema.validateAt(field, formik.values);
        } catch (validationError) {
          allValid = false;
          toast.error(validationError.message);
          break;
        }
      }

      if (allValid) {
        const values = formik.values;
        setLoading(true);
        const requestBody = {
          schoolName: values.schoolName,
          principal: values.principal,
          schoolBoard: values.schoolBoard,
          affiliationNo: values.affiliationNo,
          address: values.address,
          city: values.city,
          state: values.state,
          email: values.email,
          username: values.username,
        };
        if (values.schoolNumber) {
          requestBody.schoolNumber = values.schoolNumber;
        }
        const res = await axiosClient.put(
          EndPoints.ADMIN.PROFILE_UPDATE,
          requestBody
        );
        toast.success(t("messages.admin.updateMsg"));
        getadmin();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSocialProfile = async () => {
    try {
      let res;
      try {
        await validationSchema.validateAt("phone", formik.values);
        res = true;
      } catch (validationError) {
        res = false;
        toast.error(validationError.message);
      }
      if (res) {
        const values = formik.values;
        setLoading(true);
        const res = await axiosClient.put(
          EndPoints.ADMIN.SOCIAL_PROFILE_UPDATE,
          {
            phone: values.phone,
            website: values.website,
            facebook: values.facebook,
            instagram: values.instagram,
            linkedin: values.linkedin,
            twitter: values.twitter,
            whatsapp: values.whatsapp,
            youtube: values.youtube,
          }
        );
        toast.success(t("messages.admin.socialUpdate"));
        getadmin();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getadmin();
  }, []);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col items-center bg-[#f3f3ff] p-10"
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      {/* Account Setting */}
      <div className="flex flex-col p-10 w-full bg-white max-md:px-5 max-md:m-10 max-md:max-w-full">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="text-4xl font-bold tracking-tight leading-8 text-neutral-800">
          {t("adminProfile.accountSettings")}
        </div>
        <div className="flex flex-col md:flex-row gap-5 mt-5 w-full">
          <div className="flex flex-col w-full md:w-3/4">
            <div className="mt-7 w-full">
              <div className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolName")}{" "}
                <span className="text-red-500">*</span>
              </div>
              <div>
                <input
                  name="schoolName"
                  placeholder={t("adminProfile.schoolName")}
                  value={formik.values.schoolName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`p-2 mt-1 w-full text-base leading-6 ${
                    formik.errors.schoolName && formik.touched.schoolName
                      ? "border-red-500"
                      : "border-gray-200"
                  } text-black bg-white border`}
                />
                {formik.errors.schoolName && formik.touched.schoolName && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.schoolName}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 w-full">
              <div className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.principal")}{" "}
                <span className="text-red-500">*</span>
              </div>
              <div>
                <input
                  name="principal"
                  placeholder={t("adminProfile.principal")}
                  value={formik.values.principal}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`p-2 mt-1 w-full text-base leading-6 ${
                    formik.errors.principal && formik.touched.principal
                      ? "border-red-500"
                      : "border-gray-200"
                  } text-black bg-white border`}
                />
                {formik.errors.principal && formik.touched.principal && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.principal}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 w-full">
              <div className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.adminName")}{" "}
                <span className="text-red-500">*</span>
              </div>
              <div>
                <input
                  name="username"
                  placeholder={t("adminProfile.adminName")}
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`p-2 mt-1 w-full text-base leading-6 ${
                    formik.errors.username && formik.touched.username
                      ? "border-red-500"
                      : "border-gray-200"
                  } text-black bg-white border`}
                />
                {formik.errors.username && formik.touched.username && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.username}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-64">
            <div className="flex flex-col justify-center p-8 bg-slate-100">
              <div className="relative flex flex-col items-center pt-20 aspect-square">
                <img
                  loading="lazy"
                  src={teacher}
                  alt={t("adminPhoto")}
                  className="absolute inset-0 object-cover w-full h-full"
                />
                <div className="flex items-center justify-center gap-2 p-3 mt-20 bg-black bg-opacity-50">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/fb627a900256d2692843b0254a890d92734869efd3124ab979ce7d8dfb1f3930?"
                    className="w-6 aspect-square"
                  />
                  <div>{t("adminProfile.uploadPhoto")}</div>
                </div>
              </div>
              <div className="mt-6 text-xs text-center text-stone-500">
                {t("adminProfile.imageSizeInfo")}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-5 text-neutral-800">
            {t("adminProfile.Email")}
            <span className="text-red-500">*</span>
          </div>
          <div>
            <input
              name="email"
              placeholder={t("adminProfile.Email")}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`p-2 mt-1 w-full text-base leading-6 ${
                formik.errors.email && formik.touched.email
                  ? "border-red-500"
                  : "border-gray-200"
              } text-black bg-white border`}
            />
            {formik.errors.email && formik.touched.email && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.email}
              </div>
            )}
          </div>
        </div>
        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-5 text-neutral-800">
            {t("adminProfile.schoolBoard")}
            <span className="text-red-500">*</span>
          </div>
          <div>
            <input
              name="schoolBoard"
              placeholder={t("adminProfile.schoolBoard")}
              value={formik.values.schoolBoard}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`p-2 mt-1 w-full text-base leading-6 ${
                formik.errors.schoolBoard && formik.touched.schoolBoard
                  ? "border-red-500"
                  : "border-gray-200"
              } text-black bg-white border`}
            />
            {formik.errors.schoolBoard && formik.touched.schoolBoard && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.schoolBoard}
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-5 text-neutral-800">
            {t("adminProfile.affiliationNumber")}{" "}
            <span className="text-red-500">*</span>
          </div>
          <div>
            <input
              name="affiliationNo"
              placeholder={t("adminProfile.affiliationNumber")}
              value={formik.values.affiliationNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`p-2 mt-1 w-full text-base leading-6 ${
                formik.errors.affiliationNo && formik.touched.affiliationNo
                  ? "border-red-500"
                  : "border-gray-200"
              } text-black bg-white border`}
            />
            {formik.errors.affiliationNo && formik.touched.affiliationNo && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.affiliationNo}
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-5 text-neutral-800">
            {t("adminProfile.schoolNumber")}
          </div>
          <div>
            <input
              name="schoolNumber"
              placeholder={t("adminProfile.schoolNumber")}
              value={formik.values.schoolNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`p-2 mt-1 w-full text-base leading-6 ${
                formik.errors.schoolNumber && formik.touched.schoolNumber
                  ? "border-red-500"
                  : "border-gray-200"
              } text-black bg-white border`}
            />
            {formik.errors.schoolNumber && formik.touched.schoolNumber && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.schoolNumber}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5 py-2 mt-5 bg-white ">
          <div className="flex flex-col w-full md:w-1/2">
            <label className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.schoolAddress")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              name="address"
              placeholder={t("adminProfile.schoolAddress")}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`flex-auto p-2 mt-1 text-black border ${
                formik.errors.address && formik.touched.address
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            />
            {formik.errors.address && formik.touched.address && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.address}
              </div>
            )}
          </div>
          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.city")} <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`flex-auto px-2 py-1 mt-1 bg-white border ${
                formik.errors.city && formik.touched.city
                  ? "border-red-500"
                  : "border-gray-200"
              } text-black`}
            >
              <option value="">{t("adminProfile.city")}</option>
              <option value="Indore">Indore</option>
            </select>
            {formik.errors.city && formik.touched.city && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.city}
              </div>
            )}
          </div>
          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.state")} <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formik.values.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`flex-auto px-2 py-1 mt-1 bg-white border ${
                formik.errors.state && formik.touched.state
                  ? "border-red-500"
                  : "border-gray-200"
              } text-black`}
            >
              <option value=""> {t("adminProfile.state")}</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
            {formik.errors.state && formik.touched.state && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.state}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-5 mt-7">
          <button
            onClick={handleUpdateProfile}
            type="button"
            className="px-6 py-2 text-white bg-indigo-800 rounded-lg"
          >
            {t("buttons.saveChanges")}
          </button>
        </div>
      </div>

      {/* Social Profile */}
      <div className="flex flex-col p-10 mx-10 mt-10 w-full bg-white max-w-[1320px] max-md:px-5">
        <div className="text-4xl font-bold tracking-tight leading-8 text-neutral-800">
          {t("adminProfile.socialProfile")}
        </div>
        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-5 text-neutral-800">
            {t("adminProfile.phoneNumber")}
            <span className="text-red-500">*</span>
          </div>
          <div
            className={`flex gap-5 px-5 py-2 mt-1 bg-white border ${
              formik.errors.phone && formik.touched.phone
                ? "border-red-500"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium text-indigo-400">
              <div>+91</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/16ca314b6e5de1ff873da6c3d07ade79f8cd3b3ad3f24ffbb3eae32553811ebf?"
                className="w-3 aspect-square"
              />
            </div>
            <input
              name="phone"
              placeholder={t("adminProfile.phoneNumberPlaceholder")}
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="flex-auto text-black bg-transparent outline-none"
            />
            {formik.errors.phone && formik.touched.phone && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.phone}
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-5 text-neutral-800">
            {t("adminProfile.personalWebsite")}
          </div>
          <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
            <img loading="lazy" src={Globe} className="w-5 h-5 aspect-square" />
            <input
              name="website"
              placeholder={t("adminProfile.personalWebsitePlaceholder")}
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="flex-auto bg-transparent text-black outline-none"
            />
            {formik.errors.website && formik.touched.website && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.website}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.facebook")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={facebook}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="facebook"
                placeholder={t("adminProfile.userName")}
                value={formik.values.facebook}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.facebook && formik.touched.facebook && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.facebook}
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.instagram")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={instagram}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="instagram"
                placeholder={t("adminProfile.userName")}
                value={formik.values.instagram}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.instagram && formik.touched.instagram && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.instagram}
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.linkedin")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={linkedin}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="linkedin"
                placeholder={t("adminProfile.userName")}
                value={formik.values.linkedin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.linkedin && formik.touched.linkedin && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.linkedin}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.twitter")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={twitter}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="twitter"
                placeholder={t("adminProfile.userName")}
                value={formik.values.twitter}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.twitter && formik.touched.twitter && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.twitter}
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.whatsapp")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={whatsapp}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="whatsapp"
                placeholder={t("adminProfile.Phone")}
                value={formik.values.whatsapp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.whatsapp && formik.touched.whatsapp && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.whatsapp}
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.youtube")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={youtube}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="youtube"
                placeholder={t("adminProfile.userName")}
                value={formik.values.youtube}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.youtube && formik.touched.youtube && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.youtube}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-5 mt-10">
          <button
            onClick={handleUpdateSocialProfile}
            type="button"
            className="px-6 py-2 text-white bg-indigo-800 rounded-lg"
          >
            {t("buttons.saveChanges")}
          </button>
        </div>
      </div>
    </form>
  );
}
