import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormControl, MenuItem, Select } from "@mui/material";
import StateAndDistricts from "../utils/StatesAndDistricts.json";
import EndPoints from "../services/EndPoints";
import { axiosClient } from "../services/axiosClient";
import toast from "react-hot-toast";
import REGEX from "../utils/regix";
import { setAuth } from "../store/AppAuthSlice";
import { useDispatch } from "react-redux";

const Step5 = ({ goback, setStep, loading, setLoading }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const Countries = [{ name: "India", code: "IN" }];

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setFormData({
      country,
      state: "",
      district: "",
      city: "",
      pincode: "",
      address: "",
    });
    setStates(country === "India" ? StateAndDistricts.states : []);
    setDistricts([]);
  };

  const handleStateChange = (e) => {
    const stateValue = e.target.value;
    const selectedState = StateAndDistricts.states.find(
      (state) => state.state === stateValue
    );
    setFormData((prev) => ({
      ...prev,
      state: stateValue,
      district: "",
      city: "",
      pincode: "",
      address: "",
    }));
    setDistricts(selectedState ? selectedState.districts : []);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.country.trim())
      newErrors.country = t("validationError.country");
    if (!formData.state.trim()) newErrors.state = t("validationError.state");
    if (!formData.district.trim())
      newErrors.district = t("validationError.district");
    if (!formData.city.trim()) newErrors.city = t("validationError.city");
    if (!formData.pincode.trim()) {
      newErrors.pincode = t("validationError.pincode");
    } else if (!REGEX.PINCODE.test(formData.pincode)) {
      newErrors.pincode = t("validationError.pincodeDigit");
    }
    if (!formData.address.trim())
      newErrors.address = t("validationError.address");
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await axiosClient.put(
        EndPoints.ADMIN.ADMIN_UPDATE_ADDRESS,
        formData
      );
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        dispatch(setAuth({ addressUpdated: true }));
        setStep(6);
      }
    } catch (e) {
      toast.error(e);
      // console.error("Submission error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Country & State */}
      <div className="flex">
        <div className="w-1/2 mt-2">
          <p className="text-textPrimary text-sm text-left font-semibold">
            {t("adminProfile.country")}
          </p>
          <FormControl fullWidth sx={{ mt: "8px" }}>
            <Select
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              displayEmpty
              variant="outlined"
              renderValue={(selected) =>
                selected ? (
                  selected
                ) : (
                  <span data-testid="selectCountry" style={{ color: "#aaa" }}>
                    {t("placeholders.selectCountry")}
                  </span>
                )
              }
              sx={{
                height: "40px",
                borderRadius: "0.5rem",
                backgroundColor: "#68686826",
                color: formData.country ? "#E3E8F3" : "gray",
                textAlign: "left",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiSelect-icon": {
                  color: formData.country ? "#E3E8F3" : "gray",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#1a1a1a",
                    color: "#E3E8F3",
                  },
                },
              }}
            >
              {Countries.map((country) => (
                <MenuItem
                  key={country.code}
                  value={country.name}
                  sx={{
                    backgroundColor: "#1a1a1a",
                    color: "#E3E8F3",
                    "&:hover": {
                      backgroundColor: "#2a2a2a",
                    },
                  }}
                >
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.country && (
            <div className="text-textRed text-left text-sm p-1">
              {errors.country}
            </div>
          )}
        </div>

        <div className="w-1/2 pl-5 mt-2">
          <p className="text-textPrimary text-sm text-left font-semibold">
            {t("adminProfile.state")}
          </p>
          <FormControl
            fullWidth
            disabled={!formData.country}
            sx={{ mt: "8px" }}
            data-testid="State"
          >
            <Select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              displayEmpty
              variant="outlined"
              renderValue={(selected) =>
                selected ? (
                  selected
                ) : (
                  <span data-testid="selectState" style={{ color: "gray" }}>
                    {t("adminProfile.state")}
                  </span>
                )
              }
              sx={{
                height: "40px",
                borderRadius: "0.5rem",
                backgroundColor: "#68686826",
                color: formData.state ? "#E3E8F3" : "gray",
                textAlign: "left",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiSelect-icon": {
                  color: formData.state ? "#E3E8F3" : "gray",
                },
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
                    backgroundColor: "#1a1a1a",
                    color: "#E3E8F3",
                  },
                },
              }}
            >
              {states.map((state) => (
                <MenuItem
                  key={state.state}
                  value={state.state}
                  sx={{
                    backgroundColor: "#1a1a1a",
                    color: "#E3E8F3",
                    "&:hover": {
                      backgroundColor: "#2a2a2a",
                    },
                  }}
                >
                  {state.state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.state && (
            <div className="text-textRed text-left text-sm p-1">
              {errors.state}
            </div>
          )}
        </div>
      </div>

      {/* District & City */}
      <div className="flex">
        <div className="w-1/2 mt-2">
          <p className="text-textPrimary text-sm text-left font-semibold">
            {t("adminProfile.district")}
          </p>
          <FormControl fullWidth disabled={!formData.state} sx={{ mt: "8px" }}>
            <Select
              name="district"
              value={formData.district}
              onChange={handleChange}
              displayEmpty
              variant="outlined"
              renderValue={(selected) =>
                selected ? (
                  selected
                ) : (
                  <span data-testid="selectDistrict" style={{ color: "#aaa" }}>
                    {t("placeholders.selectDistrict")}
                  </span>
                )
              }
              sx={{
                height: "40px",
                borderRadius: "0.5rem",
                backgroundColor: "#68686826",
                color: formData.district ? "#E3E8F3" : "gray",
                textAlign: "left",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiSelect-icon": {
                  color: formData.district ? "#E3E8F3" : "gray",
                },
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
                    backgroundColor: "#1a1a1a",
                    color: "#E3E8F3",
                  },
                },
              }}
            >
              {districts.map((district) => (
                <MenuItem
                  key={district}
                  value={district}
                  sx={{
                    backgroundColor: "#1a1a1a",
                    color: "#E3E8F3",
                    "&:hover": {
                      backgroundColor: "#2a2a2a",
                    },
                  }}
                >
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.district && (
            <div className="text-textRed text-left text-sm p-1 ">
              {errors.district}
            </div>
          )}
        </div>
        {/* city */}
        <div className="w-1/2 pl-5 mt-2">
          <p className="text-textPrimary text-sm text-left font-semibold">
            {t("adminProfile.city")}
          </p>
          <input
            className="text-textPrimary rounded-lg h-[39px] bg-backgroundGray15 py-2 px-5 mt-2 w-full"
            type="text"
            data-testid="city"
            name="city"
            placeholder={t("placeholders.city")}
            onChange={handleChange}
            value={formData.city}
            disabled={!formData.district}
          />
          {errors.city && (
            <div
              data-testid="cityError"
              className="text-textRed text-left text-sm p-1 "
            >
              {errors.city}
            </div>
          )}
        </div>
      </div>

      {/* Pincode */}
      <div className="w-1/2 mt-2">
        <p className="text-textPrimary text-sm text-left font-semibold">
          {t("adminProfile.pincode")}
        </p>
        <input
          className="text-textPrimary rounded-lg h-[39px] bg-backgroundGray15 py-2 px-5 mt-2 w-full"
          type="text"
          data-testid="pincode"
          name="pincode"
          placeholder={t("placeholders.pincode")}
          maxLength={6}
          onChange={handleChange}
          value={formData.pincode}
          disabled={!formData.district}
        />
        {errors.pincode && (
          <div
            data-testid="pincodeError"
            className="text-textRed text-left text-sm p-1 "
          >
            {errors.pincode}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="mt-2">
        <p className="text-textPrimary text-sm text-left font-semibold">
          {t("adminProfile.schoolAddress")}
        </p>
        <input
          className="text-textPrimary rounded-lg bg-backgroundGray15 h-[39px] py-2 px-5 mt-2 w-full"
          type="text"
          data-testid="address"
          name="address"
          placeholder={t("placeholders.schoolAdress")}
          onChange={handleChange}
          value={formData.address}
          disabled={!formData.district}
        />
        {errors.address && (
          <div
            data-testid="addressError"
            className="text-textRed text-left text-sm p-1 "
          >
            {errors.address}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="w-full mt-5 flex justify-between">
        <button
          type="button"
          className="rounded-lg px-4 h-8 bg-backgroundBlue text-white font-medium flex items-center justify-center active:scale-90"
          onClick={goback}
        >
          {t("buttons.back")}
        </button>
        <button
          data-testid="submit"
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg px-4 h-8 bg-backgroundBlue text-white font-medium flex items-center justify-center active:scale-90"
        >
          {t("buttons.continue")}
        </button>
      </div>
    </div>
  );
};

export default Step5;
