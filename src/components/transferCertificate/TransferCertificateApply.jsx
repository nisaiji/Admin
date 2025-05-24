import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../BreadCrumbs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import TransferCertificateCard from "./TransferCertificateCard";

export default function TransferCertificateApply() {
  // Import necessary modules and hooks
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redux selectors to fetch required state
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // State variables for pagination, modal visibility, and student data
  const [dateOfApplyTC, setDateOfApplyTC] = useState(
    moment().format("DD/MM/YYYY")
  );
  const [loading, setLoading] = useState(false);
  const [due, setDue] = useState("");

  const details = [
    ["Full Name", "Mahi Sharma"],
    ["Gender", "Female"],
    ["Father’s name", "Ajay Sharma"],
    ["Mother’s name", "Ajay Sharma"],
    ["Date of birth", "DD/MM/YYYY"],
    ["Date of first admission", "DD/MM/YYYY"],
    ["Nationality", "Indian"],
    ["School board", "MP BOARD"],
  ];
  const options = ["yes", "no"];

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } p-6 flex-col`}
    >
      <Toaster />
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${
            isDarkMode ? "bg-background1" : "bg-whiteBackground"
          } opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } flex flex-col self-center w-full max-w-[100%] rounded-[16px] max-md:max-w-full min-h-[calc(100vh-72px)]`}
      >
        <div className={`px-14 py-6`}>
          <Breadcrumbs />
          <h1
            className={`text-2xl font-poppins-bold ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("titles.transferStudent")}
          </h1>
        </div>
        <div
          className={`pb-10 px-10 flex flex-col self-center w-full font-medium max-w-full max-md:max-w-full`}
        >
          <div className="bg-[rgba(104,104,104,0.1)] pb-10 text-white p-8 rounded-xl shadow-lg  space-y-6">
            {/* <!-- Header --> */}
            <h2 class="text-xl font-semibold">Student Details</h2>

            {/* <!-- Student info grid --> */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              {details.map(([label, value]) => (
                <div key={label} className="flex items-center w-full">
                  <div className="flex w-full items-center">
                    <span className="flex-1 text-textGray1 font-light">
                      {label}
                    </span>
                    <span className="w-4 text-center">-</span>
                    <strong className="flex-1 text-right">{value}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* <!-- Reason for leaving --> */}
            <div>
              <label class="block text-xl font-semibold mb-1">
                Reason for leaving
              </label>
              <textarea
                class="w-[70%] max-h-40 h-40 bg-backgroundGray2 rounded-md p-2 text-sm"
                placeholder="Reason"
              />
            </div>

            {/* <!-- Dropdown and Date Picker --> */}
            <div class="grid grid-cols-2 gap-4 w-[70%]">
              <div>
                <label class="block text-xl font-semibold mb-1">
                  Any dues left
                </label>
                <FormControl
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: isDarkMode ? "#6868684D" : "#f3f4f6", // same as bg-backgroundGray2
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDarkMode ? "#2b2e4a80" : "black",
                    },
                    "& .MuiInputBase-root": {
                      color: isDarkMode ? "#E3E8F3" : "black",
                      padding: "8px",
                      fontSize: "0.875rem", // text-sm
                    },
                    "& .MuiSvgIcon-root": {
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                  }}
                >
                  <Select
                    name="due"
                    displayEmpty
                    label="Due left"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    sx={{
                      height: "40px",
                      backgroundColor: "transparent",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      color:
                        due === "" ? "gray" : isDarkMode ? "#E3E8F3" : "black",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
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
                      Due left
                    </MenuItem>
                    {options.map((option) => (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                          "&:hover": {
                            backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                          },
                        }}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div>
                <label class="block text-xl font-semibold mb-1">
                  Date of application for TC
                </label>
                <div class="flex items-center bg-backgroundGray2 rounded-md text-sm">
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      views={["day", "month", "year"]}
                      format="DD/MM/YYYY"
                      value={
                        dateOfApplyTC
                          ? moment(dateOfApplyTC, "DD/MM/YYYY")
                          : null
                      }
                      maxDate={moment().startOf("day")}
                      onChange={(date) => {
                        if (date) {
                          setDateOfApplyTC(moment(date).format("DD/MM/YYYY"));
                        }
                      }}
                      className={`w-full h-[30px]`}
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
                </div>
              </div>
            </div>

            {/* <!-- Buttons --> */}
            <div class="flex gap-4">
              <button class="bg-backgroundBlue text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Apply TC
              </button>
              <TransferCertificateCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
