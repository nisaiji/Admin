/**
 * Step1.jsx
 *
 * This component handles the first step of the admin registration process: phone verification.
 * It manages phone input, OTP sending and verification, timer for OTP resend, and navigation to the next step.
 * Uses React hooks for state, Redux for authentication state, and various utility functions.
 */

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EndPoints from "../services/EndPoints";
import { axiosClient } from "../services/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../store/AppAuthSlice";
import REGEX from "../utils/regix";
import refresh from "../assets/images/refresh.png";
import { useNavigate } from "react-router-dom";
import { showToast } from "../services/toastService";

const Step1 = ({ goback, setStep, loading, setLoading, currentStep }) => {
  // Hooks and state variables
  const [t] = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.appAuth);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef([]);

  // Timer for OTP resend
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

  // Initialize OTP widget if available
  useEffect(() => {
    if (window?.initSendOTP) {
      if (currentStep === 1) {
        window.configuration.widgetId = import.meta.env.VITE_PHONE_WIDGET_ID;
        window.configuration.tokenAuth = import.meta.env.VITE_PHONE_AUTH_TOKEN;
        window.initSendOTP(window.configuration);
      }
    }
  }, [currentStep]);

  /**
   * Verifies the phone using the OTP success token.
   * Updates Redux state and navigates to the next step based on verification status.
   */
  const phoneVerifiedApi = async (otpSuccessToken) => {
    try {
      setLoading(true);
      const res = await axiosClient.post(EndPoints.ADMIN.PHONE_TOKEN_VERIFY, {
        phone,
        token: otpSuccessToken,
      });
      if (res?.statusCode === 200) {
        dispatch(setAuth({ phoneVerified: true }));
        localStorage.setItem("temp_access_token", res?.result?.token);
        if (!status?.emailVerified) {
          setStep(2);
          window.location.reload();
        } else if (!status?.passwordUpdated) {
          setStep(3);
        } else if (!status?.affiliationExists) {
          setStep(4);
        } else if (!status?.addressUpdated) {
          setStep(5);
        } else if (!status?.isActive) {
          setStep(6);
        }
      }
    } catch (e) {
      showToast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifies the entered OTP using the widget's verifyOtp method.
   */
  const verifyOtp = async () => {
    try {
      setLoading(true);
      await window?.verifyOtp(
        Number(otp.join("")),
        async (res) => {
          showToast.success("Phone verified successfully");
          await phoneVerifiedApi(res?.message);
        },
        (err) => {
          showToast.error(err?.message);
        },
        status?.phoneOtpReqId,
      );
    } catch (e) {
      showToast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles phone number submission, sends OTP if needed, and updates Redux state.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) {
      setError(t("validationError.phone"));
    } else if (!REGEX.PHONE_LENGTH.test(phone)) {
      setError(t("validationError.validationPhoneCount"));
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post(EndPoints.ADMIN.STATUS, { phone });
      const data = res?.result;

      dispatch(setAuth({ ...data, phone }));
      if (
        !data?.phoneVerified ||
        (data?.phoneVerified &&
          (!data.emailVerified ||
            !data?.passwordUpdated ||
            !data?.affiliationExists ||
            !data?.addressUpdated ||
            !data?.isActive))
      ) {
        await window?.sendOtp(
          `91${phone}`,
          (res) => {
            dispatch(setAuth({ phoneOtpReqId: res?.message }));
            showToast.success("OTP sent successfully");
            setOtpVisible(true);
            document.getElementById("otp-0")?.focus();
            setTimer(30);
            setIsResendDisabled(true);
          },
          (err) => {
            showToast.error(err?.message);
          },
        );
      } else if (data?.isActive) {
        showToast.success("Already verified");
        navigate("/signup");
      }
    } catch (e) {
      // console.log({ e });

      if (e === "Admin not found") {
        await window?.sendOtp(
          `91${phone}`,
          (res) => {
            dispatch(setAuth({ phoneOtpReqId: res?.message }));
            showToast.success("OTP sent successfully");
            setOtpVisible(true);
            document.getElementById("otp-0")?.focus();
            setTimer(30);
            setIsResendDisabled(true);
          },
          (err) => {
            showToast.error(err?.message);
          },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles OTP input changes and auto-focuses next input.
   */
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

  /**
   * Resets the OTP input fields.
   */
  const handleOtpReset = () => {
    setOtp(["", "", "", "", "", ""]);
    document.getElementById("otp-0")?.focus();
  };

  /**
   * Handles OTP resend logic and resets timer.
   */
  const resendOtp = async () => {
    try {
      setLoading(true);
      await window?.retryOtp(
        "11", // '11' = SMS
        (res) => {
          dispatch(setAuth({ phoneOtpReqId: res?.message }));
          showToast.success("OTP resent successfully");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          setTimer(30);
          setIsResendDisabled(true);
        },
        (err) => {
          showToast.error(err?.message);
        },
        status?.phoneOtpReqId,
      );
    } catch (e) {
      // showToast.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Phone Input */}
      <div className="mt-10">
        <p className="text-textPrimary text-sm text-left font-semibold">
          {t("adminProfile.Phone")}
        </p>
        <p className="absolute mt-[17px] ml-6 text-textPrimary">+91</p>
        <input
          className="text-textPrimary rounded-xl py-2 pl-[55px] mt-2 w-full bg-backgroundGray15"
          type="text"
          name="phone"
          placeholder={t("placeholders.phoneNumber")}
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
          }
          disabled={otpVisible}
        />
        {error && (
          <div className="text-textRed text-sm text-left p-1">{error}</div>
        )}
      </div>

      {/* OTP Section */}
      {otpVisible && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-2">
            <p className="text-textPrimary text-sm font-semibold">OTP</p>
            {/* Reset Image/Icon */}
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
      <div className="flex justify-between w-full mt-10">
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
            disabled={loading || otp.some((digit) => digit === "")}
            className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          >
            <p className="text-base">{t("buttons.verify")}</p>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          >
            <p className="text-base">{t("buttons.continue")}</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default Step1;
