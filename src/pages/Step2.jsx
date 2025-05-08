import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import EndPoints from "../services/EndPoints";
import { axiosClient } from "../services/axiosClient";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/AppAuthSlice";
import toast from "react-hot-toast";
import REGEX from "../utils/regix";

const Step2 = ({ goback, setStep }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("nikhilesh24052002@gmail.com");
  const [error, setError] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]);

  const OTPInput = ({ id, value, onChange }) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      maxLength={1}
      inputMode="numeric"
      autoComplete="one-time-code"
      className="w-14 h-14 text-center text-xl rounded-xl bg-backgroundGray15 text-textPrimary border border-gray-300 mx-1 focus:outline-none"
    />
  );

  const verifyOtp = async () => {
    try {
      const res = await axiosClient.put(EndPoints.ADMIN.EMAIL_OTP_VERIFY, {
        email,
        otp: Number(otp.join("")),
      });
      if (res.statusCode === 200) {
        dispatch(setAuth({ emailVerified: true }));
        toast.success(res?.result?.msg);
        localStorage.setItem("temp_access_token", res?.result?.token);
        setStep(3);
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!REGEX.EMAIL.test(email)) {
      setError("invalid email");
      return;
    }

    try {
      const res = await axiosClient.post(EndPoints.ADMIN.EMAIL_VERIFY, {
        email,
      });
      console.log({ res });
      // dispatch(setAuth({ ...data, email }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleOtpChange = (index) => (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;

    const newOtp = [...otp];
    newOtp[index] = val[0];
    setOtp(newOtp);

    if (val.length === 1 && index < otp.length - 1) {
      setTimeout(() => {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }, 10);
    }
  };

  const handleOtpReset = () => {
    setOtp(["", "", "", "", ""]);
    document.getElementById("otp-0")?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Phone Input */}
      <div className="mt-5">
        <p className="text-textPrimary text-sm text-left font-semibold">
          {t("adminProfile.Email")}
        </p>
        <input
          className="text-textPrimary rounded-xl border border-borderWhite2 py-2 pl-[55px] mt-2 w-full bg-backgroundGray15"
          type="text"
          name="email"
          placeholder={t("placeholders.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && (
          <div className="text-textRed text-sm text-left p-1">{error}</div>
        )}
      </div>

      {/* OTP Section */}
      {otpVisible && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-textPrimary text-sm font-semibold">OTP</p>
            {/* Reset Image/Icon */}
            <span
              className="cursor-pointer text-gray-500 hover:text-gray-700 text-sm"
              onClick={handleOtpReset}
              title="Reset OTP"
            >
              🔄 {/* Replace this with an <img src="..."/> if desired */}
            </span>
          </div>
          <div className="flex mt-2">
            {otp.map((digit, idx) => (
              <OTPInput
                key={idx}
                id={`otp-${idx}`}
                value={digit}
                onChange={handleOtpChange(idx)}
              />
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-3 text-left">
            Didn't receive the code?{" "}
            <span className="text-white font-semibold cursor-pointer">
              Resend code
            </span>
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between w-full mt-6">
        <button
          type="button"
          className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          onClick={goback}
        >
          <p className="text-base">{t("buttons.back")}</p>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
        >
          <p className="text-base">{t("buttons.submit")}</p>
        </button>
      </div>
    </form>
  );
};

export default Step2;
