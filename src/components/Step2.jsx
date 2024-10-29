import React, { useState } from "react";
import ArrowRight from "../assets/images/ArrowRight.png";
import { useTranslation } from "react-i18next";
import Countries from "../utils/Countries.json";
import StateAndDistricts from "../utils/StatesAndDistricts.json";

const Step2 = ({ formik, nextStep, prevStep }) => {
  const [t] = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Handle country selection
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    formik.setFieldValue("country", country);

    // Reset fields when changing the country
    formik.setFieldValue("state", "");
    formik.setFieldValue("district", "");
    formik.setFieldValue("pincode", "");
    formik.setFieldValue("city", "");
    formik.setFieldValue("address", "");

    if (country === "India") {
      // Accessing the states array inside the StateAndDistricts object
      setStates(StateAndDistricts.states);
      setDistricts([]); // Reset districts
    } else {
      setStates([]);
      setDistricts([]);
    }
  };

  // Handle state selection
  const handleStateChange = (e) => {
    const selectedState = StateAndDistricts.states.find(
      (state) => state.state === e.target.value
    );

    // Reset fields when changing the state
    formik.setFieldValue("district", "");
    formik.setFieldValue("pincode", "");
    formik.setFieldValue("city", "");
    formik.setFieldValue("address", "");

    formik.setFieldValue("state", e.target.value);
    if (selectedState) {
      setDistricts(selectedState.districts);
    } else {
      setDistricts([]);
    }
  };

  return (
    <form className="text-black" onSubmit={formik.handleSubmit}>
      <div className="flex">
        {/* Left side of the form */}
        <div className="w-1/2 pr-5">
          <div className="mt-5">
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.country")}
            </p>
            <select
              className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
              name="country"
              value={formik.values.country}
              onChange={handleCountryChange}
            >
              <option value="" label={t("placeholders.selectCountry")} />
              {Countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            {formik.touched.country && formik.errors.country && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.country}
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.state")}
            </p>
            {selectedCountry === "India" ? (
              <select
                className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
                name="state"
                value={formik.values.state}
                onChange={handleStateChange}
              >
                <option value="" label={t("placeholders.selectState")} />
                {states.map((state) => (
                  <option key={state.state} value={state.state}>
                    {state.state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
                type="text"
                name="state"
                placeholder={t("placeholders.state")}
                onChange={formik.handleChange}
                value={formik.values.state}
              />
            )}
            {formik.touched.state && formik.errors.state && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.state}
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.city")}
            </p>
            <input
              className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
              type="text"
              name="city"
              placeholder={t("placeholders.city")}
              onChange={formik.handleChange}
              value={formik.values.city}
            />
            {formik.touched.city && formik.errors.city && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.city}
              </div>
            )}
          </div>
        </div>

        {/* Right side of the form */}
        <div className="w-1/2 pl-5">
          <div className="mt-5">
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.district")}
            </p>
            {selectedCountry === "India" ? (
              <select
                className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
                name="district"
                value={formik.values.district}
                onChange={formik.handleChange}
              >
                <option value="" label={t("placeholders.selectDistrict")} />
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
                type="text"
                name="district"
                placeholder={t("placeholders.district")}
                onChange={formik.handleChange}
                value={formik.values.district}
              />
            )}
            {formik.touched.district && formik.errors.district && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.district}
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.pincode")}
            </p>
            <input
              className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
              type="text"
              name="pincode"
              placeholder={t("placeholders.pincode")}
              onChange={formik.handleChange}
              value={formik.values.pincode}
            />
            {formik.touched.pincode && formik.errors.pincode && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.pincode}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
          {t("adminProfile.address")}
        </p>
        <input
          className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
          type="text"
          name="address"
          placeholder={t("placeholders.address")}
          onChange={formik.handleChange}
          value={formik.values.address}
        />
        {formik.touched.address && formik.errors.address && (
          <div className="text-red-500 text-sm text-left pl-3">
            {formik.errors.address}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="w-full mt-5 flex justify-between">
        <button
          className="rounded-lg px-7 h-10 bg-[#464590] font-semibold flex items-center justify-center text-white"
          type="button"
          onClick={prevStep}
        >
          <div className="flex items-center gap-2">
            <img
              className="w-6 h-6 rotate-180"
              src={ArrowRight}
              alt="Arrow Left"
            />
            <p className="text-base">{t("adminProfile.back")}</p>
          </div>
        </button>

        <button
          className="rounded-lg px-7 h-10 bg-[#464590] font-semibold flex items-center justify-center text-white"
          type="button"
          onClick={nextStep}
        >
          <div className="flex items-center gap-2">
            <p className="text-base">{t("adminProfile.next")}</p>
            <img className="w-6 h-6" src={ArrowRight} alt="Arrow Right" />
          </div>
        </button>
      </div>
    </form>
  );
};

export default Step2;
