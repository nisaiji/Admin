import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EndPoints from "../services/EndPoints";
import { axiosClient } from "../services/axiosClient";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/AppAuthSlice";
import toast from "react-hot-toast";
import REGEX from "../utils/regix";
import refresh from "../assets/images/refresh.png";

const Step2 = ({ goback, setStep }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const verifyOtp = async () => {
    try {
      const res = await axiosClient.put(EndPoints.ADMIN.EMAIL_OTP_VERIFY, {
        otp: Number(otp.join("")),
      });
      if (res.statusCode === 200) {
        dispatch(setAuth({ emailVerified: true }));
        toast.success(res?.result?.message);
        localStorage.setItem("temp_access_token", res?.result?.token);
        setStep(3);
      }
    } catch (e) {
      toast.error(e);
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
      if (res?.statusCode === 200) {
        dispatch(setAuth({ email }));
        toast.success(res?.result);
        setOtpVisible(true);
        document.getElementById("otp-0")?.focus();
        setTimer(30);
        setIsResendDisabled(true);
      }
    } catch (e) {
      toast.error(e);
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

  const resendOtp = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post(EndPoints.ADMIN.EMAIL_VERIFY, {
        email,
      });
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        setOtp(["", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setTimer(30);
        setIsResendDisabled(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Phone Input */}
      <div className="mt-5">
        <p className="text-textPrimary text-sm text-left font-semibold">
          {t("adminProfile.Email")}
        </p>
        <input
          className="text-textPrimary rounded-xl py-2 pl-5 mt-2 w-full bg-backgroundGray15"
          type="text"
          name="email"
          placeholder={t("placeholders.emailAddress")}
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
          </div>
          <div className="flex mt-2">
            {otp.map((digit, idx) => (
              <input
                ref={(ref) => (inputRefs.current[idx] = ref)}
                id={`otp-${idx}`}
                value={digit}
                onChange={handleOtpChange(idx)}
                maxLength={1}
                inputMode="numeric"
                autoComplete="one-time-code"
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    if (otp[idx]) {
                      const newOtp = [...otp];
                      newOtp[idx] = "";
                      setOtp(newOtp);
                    } else if (idx > 0) {
                      const newOtp = [...otp];
                      newOtp[idx - 1] = "";
                      setOtp(newOtp);
                      setTimeout(() => {
                        inputRefs.current[idx - 1]?.focus();
                      }, 10);
                    }
                  }
                }}
                className="w-14 h-14 text-center text-xl rounded-xl bg-backgroundGray15 text-textPrimary border border-gray-300 mx-1 focus:outline-none"
              />
            ))}
            <button type="button" onClick={handleOtpReset}>
              <img
                src={refresh}
                alt="refresh"
                className="size-6 invert top-10 cursor-pointer ml-3"
              />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-3 text-left">
            Didn't receive the code?{" "}
            {isResendDisabled ? "resend OTP in " + timer + "s" : ""}
            {!isResendDisabled && (
              <span
                className="text-white font-semibold cursor-pointer"
                onClick={resendOtp}
              >
                Resend code
              </span>
            )}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between w-full mt-6">
        <button
          type="button"
          className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          onClick={goback}
        >
          <p className="text-base">{t("buttons.back")}</p>
        </button>
        {otpVisible ? (
          <button
            type="button"
            onClick={verifyOtp}
            className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          >
            <p className="text-base">{t("buttons.verify")}</p>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          >
            <p className="text-base">{t("buttons.continue")}</p>
          </button>
        )}
      </div>
    </form>
  );
};

export default Step2;
