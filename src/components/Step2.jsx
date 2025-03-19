import React, { useState } from "react";
import ArrowRight from "../assets/images/ArrowRight.png";
import { useTranslation } from "react-i18next";
// import Countries from "../utils/Countries.json";
import StateAndDistricts from "../utils/StatesAndDistricts.json";
import CustomDropdown from "./CustomDropdown";
import { FormControl, MenuItem, Select } from "@mui/material";

/**
 * Step2 Component - Handles the second step of a multi-step form.
 * Allows users to input address details such as country, state, district, city, pincode, and address.
 * @param {object} formik - Formik object for managing form state and validation.
 * @param {function} nextStep - Callback to proceed to the next step.
 * @param {function} prevStep - Callback to return to the previous step.
 */
const Step2 = ({ formik, goback }) => {
  const [t] = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const Countries = [{ name: "India", code: "IN" }];

  /**
   * Handles the change of the country dropdown.
   * Resets related fields when a new country is selected.
   * Updates the states based on the selected country.
   */
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);

    // Reset fields when changing the country
    formik.setFieldValue("state", "");
    formik.setFieldValue("district", "");
    formik.setFieldValue("pincode", "");
    formik.setFieldValue("city", "");
    formik.setFieldValue("address", "");

    formik.setFieldValue("country", country);
    setStates(country === "India" ? StateAndDistricts.states : []);
    setDistricts([]);
  };

  /**
   * Handles the change of the state dropdown.
   * Resets related fields when a new state is selected.
   * Updates the districts based on the selected state.
   */
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
        <div className="w-1/2">
          {/* country */}
          <div className="mt-5" tabIndex={"1"}>
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.country")}
            </p>
            <FormControl fullWidth>
              <Select
                name="country"
                value={formik.values.country}
                onChange={handleCountryChange}
                data-testid="countrylist"
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: "gray" }}>
                        {t("placeholders.selectCountry")}
                      </span>
                    );
                  }
                  return selected;
                }}
                sx={{
                  color: formik.values.country ? "black" : "gray",
                  border: "1px solid #D1D5DB",
                  borderRadius: "0.5rem",
                  mt: "8px",
                  width: "100%",
                  height: "40px",
                  textAlign: "start",
                  "& .MuiSelect-icon": {
                    color: formik.values.country ? "black" : "gray",
                  },
                  "&.MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                    },
                  },
                }}
                variant="outlined"
              >
                <MenuItem value="" disabled>
                  {t("placeholders.selectCountry")}
                </MenuItem>
                {Countries.map((country) => (
                  <MenuItem key={country.code} value={country.name}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formik.touched.country && formik.errors.country && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.country}
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2 pl-5">
          {/* state */}
          <div className="mt-5" tabIndex={"2"}>
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.state")}
            </p>

            {/* <select
              className={`text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full ${
                formik.values.state ? "text-black" : "text-gray-400"
              }`}
              name="state"
              value={formik.values.state}
              onChange={handleStateChange}
              data-testid="statelist"
              disabled={!formik.values.country}
            >
              <option value="" label={t("placeholders.selectState")} disabled />
              {states.map((state) => (
                <option key={state.state} value={state.state}>
                  {state.state}
                </option>
              ))}
            </select> */}
            <FormControl fullWidth disabled={!formik.values.country}>
              <Select
                name="state"
                value={formik.values.state}
                onChange={handleStateChange}
                data-testid="statelist"
                displayEmpty
                renderValue={(selected) =>
                  !selected ? (
                    <span style={{ color: "gray" }}>
                      {t("placeholders.selectState")}
                    </span>
                  ) : (
                    selected
                  )
                }
                sx={{
                  color: formik.values.state ? "black" : "gray",
                  border: "1px solid #D1D5DB",
                  borderRadius: "0.5rem",
                  mt: "8px",
                  width: "100%",
                  height: "40px",
                  textAlign: "start",
                  "& .MuiSelect-icon": {
                    color: formik.values.state ? "black" : "gray",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
                variant="outlined"
              >
                <MenuItem value="" disabled>
                  {t("placeholders.selectState")}
                </MenuItem>
                {states.map((state) => (
                  <MenuItem key={state.state} value={state.state}>
                    {state.state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formik.touched.state && formik.errors.state && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.state}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="w-1/2">
          {/* district */}
          <div className="mt-5" tabIndex={"3"}>
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.district")}
            </p>
            {/* <select
              className={`text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full ${
                formik.values.district ? "text-black" : "text-gray-400"
              }`}
              name="district"
              value={formik.values.district}
              onChange={formik.handleChange}
              data-testid="districtlist"
              disabled={!formik.values.state}
            >
              <option
                value=""
                label={t("placeholders.selectDistrict")}
                disabled
              />
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select> */}
            <FormControl fullWidth disabled={!formik.values.state}>
              <Select
                name="district"
                value={formik.values.district}
                onChange={formik.handleChange}
                data-testid="districtlist"
                displayEmpty
                renderValue={(selected) =>
                  !selected ? (
                    <span style={{ color: "gray" }}>
                      {t("placeholders.selectDistrict")}
                    </span>
                  ) : (
                    selected
                  )
                }
                sx={{
                  color: formik.values.district ? "black" : "gray",
                  border: "1px solid #D1D5DB",
                  borderRadius: "0.5rem",
                  mt: "8px",
                  width: "100%",
                  height: "40px",
                  textAlign: "start",
                  "& .MuiSelect-icon": {
                    color: formik.values.district ? "black" : "gray",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
                variant="outlined"
              >
                <MenuItem value="" disabled>
                  {t("placeholders.selectDistrict")}
                </MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formik.touched.district && formik.errors.district && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.district}
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2 pl-5">
          {/* city */}
          <div className="mt-5" tabIndex={"4"}>
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.city")}
            </p>
            <input
              className="text-black rounded-lg border h-[39px] border-gray-300 py-2 px-5 mt-2 w-full"
              type="text"
              name="city"
              placeholder={t("placeholders.city")}
              onChange={formik.handleChange}
              value={formik.values.city}
              disabled={!formik.values.district}
            />
            {formik.touched.city && formik.errors.city && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.city}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="w-1/2">
          {/* picode */}
          <div className="mt-5" tabIndex={"5"}>
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              {t("adminProfile.pincode")}
            </p>
            <input
              className="text-black rounded-lg border border-gray-300 h-[39px] py-2 px-5 mt-2 w-full"
              type="text"
              name="pincode"
              placeholder={t("placeholders.pincode")}
              maxLength={6}
              onChange={formik.handleChange}
              value={formik.values.pincode}
              disabled={!formik.values.district}
            />
            {formik.touched.pincode && formik.errors.pincode && (
              <div className="text-red-500 text-sm text-left pl-3">
                {formik.errors.pincode}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5" tabIndex={"6"}>
        <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
          {t("adminProfile.schoolAddress")}
        </p>
        <input
          className="text-black rounded-lg border border-gray-300 h-[39px] py-2 px-5 mt-2 w-full"
          type="text"
          name="address"
          placeholder={t("placeholders.schoolAdress")}
          onChange={formik.handleChange}
          value={formik.values.address}
          disabled={!formik.values.district}
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
          type="button"
          className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          data-testid="back"
          onClick={goback}
        >
          <p className="text-base">{t("buttons.back")}</p>
        </button>
        <button
          className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          type="submit"
        >
          <p className="text-base">{t("buttons.submit")}</p>
        </button>
      </div>
    </form>
  );
};

export default Step2;
