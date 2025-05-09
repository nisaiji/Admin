import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import {
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../BreadCrumbs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";

export default function TransferCertificateApply() {
  // Import necessary modules and hooks
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redux selectors to fetch required state
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // State variables for pagination, modal visibility, and student data
  const [dateOfApplyTC, setDateOfApplyTC] = useState(moment().format("DD/MM/YYYY"))
  const [loading, setLoading] = useState(false);



  return (
    <div
      className={`${isDarkMode ? "bg-background2" : "bg-whiteBackground2"
        } px-6 flex-col`}
    >
      <Toaster />
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? "bg-background1" : "bg-whiteBackground"
            } opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <div
        className={`${isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
          } flex flex-col self-center w-full max-w-[100%] rounded-[16px] max-md:max-w-full min-h-[calc(100vh-72px)]`}
      >
        <div className={`px-14 py-6`}>
          <Breadcrumbs />
          <h1
            className={`text-2xl font-poppins-bold ${isDarkMode ? "text-textPrimary" : "text-textBlack"
              }`}
          >
            {t("titles.transferStudent")}
          </h1>
        </div>
        <div
          className={`pb-[100px] px-10 flex flex-col self-center w-full font-medium max-w-full max-md:max-w-full`}
        >
          <div className="bg-[rgba(104,104,104,0.1)] pb-[100px] text-white p-8 rounded-xl shadow-lg  space-y-6">
            {/* <!-- Header --> */}
            <h2 class="text-xl font-semibold">Student Details</h2>

            {/* <!-- Student info grid --> */}
            <div class="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <div><span class="font-light">Full Name</span> - <strong>Mahi Sharma</strong></div>
              <div><span class="font-light">Gender</span> - <strong>Female</strong></div>
              <div><span class="font-light">Father’s name</span> - <strong>Ajay Sharma</strong></div>
              <div><span class="font-light">Mother’s name</span> - <strong>Ajay Sharma</strong></div>
              <div><span class="font-light">Date of birth</span> - <strong>DD/MM/YYYY</strong></div>
              <div><span class="font-light">Date of first admission</span> - <strong>DD/MM/YYYY</strong></div>
              <div><span class="font-light">Nationality</span> - <strong>Indian</strong></div>
              <div><span class="font-light">School board</span> - <strong>MP BOARD</strong></div>
            </div>

            {/* <!-- Reason for leaving --> */}
            <div>
              <label class="block text-sm mb-1">Reason for leaving</label>
              <textarea class="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm" placeholder="Reason"></textarea>
            </div>

            {/* <!-- Dropdown and Date Picker --> */}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm mb-1">Any dues left</label>
                <select class="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div>
                <label class="block text-sm mb-1">Date of application for TC</label>
                <div class="flex items-center bg-gray-800 border border-gray-700 rounded-md p-2 text-sm">
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
                          setDateOfApplyTC(moment(date).format("DD/MM/YYYY"))
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
              <button class="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">Apply TC</button>
              <button class="border border-blue-600 text-blue-500 font-bold px-5 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
