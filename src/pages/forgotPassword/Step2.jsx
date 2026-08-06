/**
 * Step2.jsx
 *
 * This component handles the second step of the admin registration process: email verification.
 * It manages email input, OTP sending and verification, timer for OTP resend, and navigation to the next step.
 * Uses React hooks for state, Redux for authentication state, and various utility functions.
 */
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EndPoints from "../../services/EndPoints";
import { axiosClient } from "../../services/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../../store/AppAuthSlice";
import toast from "react-hot-toast";
import REGEX from "../../utils/regix";
import refresh from "../../assets/images/refresh.png";

const Step2 = ({ goback, setStep, loading, setLoading, currentStep }) => {
  // Hooks and state variables

  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.appAuth);
  const [email, setEmail] = useState("");
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
      if (currentStep === 2) {
        window.configuration.widgetId = import.meta.env.VITE_PHONE_AND_EMAIL_WIDGET_ID;
        window.configuration.tokenAuth = import.meta.env.VITE_PHONE_AND_EMAIL_AUTH_TOKEN;
        window.initSendOTP(window.configuration);
      }
    }
  }, [currentStep]);

  /**
   * Verifies the email using the OTP success token.
   * Updates Redux state and navigates to the next step.
   */
  const emailVerifiedApi = async (otpSuccessToken) => {
    try {
      setLoading(true);
      const res = await axiosClient.put(
        EndPoints.ADMIN.PASSWORD_RESET_EMAIL_VERIFY,
        {
          email,
          emailToken: otpSuccessToken,
          resetPasswordToken: status?.resetPasswordToken,
        }
      );
      if (res?.statusCode === 200) {
        dispatch(
          setAuth({
            resetPasswordToken: res?.result?.resetToken,
          })
        );
        setStep(3);
      }
    } catch (e) {
      toast.error(e);
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
          toast.success("Email verified successfully");
          await emailVerifiedApi(res?.message);
        },
        (err) => {
          toast.error(err?.message);
        },
        status?.emailOtpReqId
      );
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles email submission, sends OTP, and updates Redux state.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!REGEX.EMAIL.test(email)) {
      setError("invalid email");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosClient.post(
        EndPoints.ADMIN.PASSWORD_RESET_EMAIL_CHECK,
        { email, resetPasswordToken: status?.resetPasswordToken }
      );

      if (res?.statusCode === 200) {
        dispatch(
          setAuth({
            email,
            resetPasswordToken: res?.result?.resetToken,
          })
        );
        window?.sendOtp(
          email,
          (res) => {
            dispatch(setAuth({ email, emailOtpReqId: res?.message }));
            toast.success("OTP sent successfully");
            setOtpVisible(true);
            document.getElementById("otp-0")?.focus();
            setTimer(30);
            setIsResendDisabled(true);
          },
          (err) => {
            // console.log({ err });
            toast.error(err?.message);
          }
        );
      }
    } catch (e) {
      // console.log(e);
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
        "3", // '3' = EMAIL
        (res) => {
          dispatch(setAuth({ emailOtpReqId: res?.message }));
          toast.success("OTP resent successfully");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          setTimer(30);
          setIsResendDisabled(true);
        },
        (err) => {
          toast.error(err?.message);
        },
        status?.emailOtpReqId
      );
    } catch (e) {
      // toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Email Input */}
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
          disabled={otpVisible}
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
                className="w-14 h-14 text-center text-xl rounded-xl bg-backgroundGray15 text-textPrimary mx-1"
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
          className="rounded-lg px-4 h-8 border border-backgroundBlue bg-[#0A81D120] font-medium flex items-center justify-center text-textBlue transition-all duration-200 ease-in-out active:scale-90"
          onClick={goback}
        >
          <p className="text-base">{t("buttons.back")}</p>
        </button>
        {otpVisible ? (
          <button
            type="button"
            onClick={verifyOtp}
            disabled={loading}
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

export default Step2;
