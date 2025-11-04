import React, { useEffect, useRef, useState } from "react";
import Spinner from "../components/Spinner";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import REGEX from "../utils/regix";
import refresh from "../assets/images/refresh.png";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import { setAuth } from "../store/AppAuthSlice";

export default function ForgotPassword() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.appAuth);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ phone: "", email: "" });
  const [otpVisible, setOtpVisible] = useState(false);

  // Separate OTPs and timers
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [phoneTimer, setPhoneTimer] = useState(30);
  const [emailTimer, setEmailTimer] = useState(30);
  const [isPhoneResendDisabled, setIsPhoneResendDisabled] = useState(true);
  const [isEmailResendDisabled, setIsEmailResendDisabled] = useState(true);
  const phoneRefs = useRef([]);
  const emailRefs = useRef([]);

  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (window?.initSendOTP) {
      window.configuration.widgetId =
        import.meta.env.VITE_PHONE_AND_EMAIL_WIDGET_ID;
      window.configuration.tokenAuth =
        import.meta.env.VITE_PHONE_AND_EMAIL_AUTH_TOKEN;
      window.initSendOTP(window.configuration);
    }
  }, []);

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      if (phoneTimer > 0) setPhoneTimer((t) => t - 1);
      else setIsPhoneResendDisabled(false);
      if (emailTimer > 0) setEmailTimer((t) => t - 1);
      else setIsEmailResendDisabled(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneTimer, emailTimer]);

  const handleOtpChange = (type, index) => (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    if (type === "phone") {
      const newOtp = [...phoneOtp];
      newOtp[index] = val[0];
      setPhoneOtp(newOtp);
      if (index < 5) phoneRefs.current[index + 1]?.focus();
    } else {
      const newOtp = [...emailOtp];
      newOtp[index] = val[0];
      setEmailOtp(newOtp);
      if (index < 5) emailRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpReset = (type) => {
    if (type === "phone") {
      setPhoneOtp(["", "", "", "", "", ""]);
      phoneRefs.current[0]?.focus();
    } else {
      setEmailOtp(["", "", "", "", "", ""]);
      emailRefs.current[0]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!REGEX.PHONE_LENGTH.test(phone)) {
      errors.phone = "Enter a valid 10-digit number";
    }
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!REGEX.EMAIL.test(email)) {
      errors.email = "Invalid email address";
    }
    setError(errors);
    if (Object.keys(errors).length) return;

    try {
      setLoading(true);
      const res = await axiosClient.post(
        EndPoints.ADMIN.PHONE_AND_EMAIL_TOKEN_VERIFY,
        {
          phone,
          email,
        }
      );

      if (res?.statusCode === 200) {
        dispatch(
          setAuth({
            phone,
            email,
            resetToken: res?.result?.resetToken,
          })
        );

        // Send OTPs separately
        try {
          const [phoneRes, emailRes] = await Promise.all([
            new Promise((resolve, reject) =>
              window?.sendOtp(
                `91${phone}`,
                (r) => resolve(r),
                (e) => reject(e)
              )
            ),
            new Promise((resolve, reject) =>
              window?.sendOtp(
                email,
                (r) => resolve(r),
                (e) => reject(e)
              )
            ),
          ]);

          toast.success("OTP sent successfully to phone and email");
          // console.log(phoneRes, emailRes);
          if (phoneRes?.type === "success" && emailRes?.type === "success") {
            dispatch(
              setAuth({
                phoneReqId: phoneRes?.message,
                emailReqId: emailRes?.message,
              })
            );
            setOtpVisible(true);
            setPhoneTimer(30);
            setEmailTimer(30);
            setIsPhoneResendDisabled(true);
            setIsEmailResendDisabled(true);
          }
        } catch (error) {
          console.error("OTP send error:", error);
          toast.error("Failed to send OTP. Please try again.");
        }
      }
    } catch (e) {
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    try {
      setLoading(true);
      await window?.verifyOtp(
        Number(phoneOtp.join("")),
        (res) => {
          // console.log("verify phone", res);

          dispatch(
            setAuth({
              phoneToken: res?.message,
            })
          );
          toast.success("Phone OTP verified");
          setPhoneVerified(true);
        },
        (err) => toast.error(err?.message),
        status?.phoneReqId
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      setLoading(true);
      await window?.verifyOtp(
        Number(emailOtp.join("")),
        (res) => {
          // console.log("verify email", res);
          dispatch(
            setAuth({
              emailToken: res?.message,
            })
          );
          toast.success("Email OTP verified");
          setEmailVerified(true);
        },
        (err) => toast.error(err?.message),
        status?.emailReqId
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (type) => {
    try {
      setLoading(true);
      await window?.retryOtp(
        type === "phone" ? "11" : "3",
        (res) => {
          // console.log("resend otp", res);

          toast.success(`${type} OTP resent successfully`);
          dispatch(
            setAuth({
              ...(type === "phone"
                ? { phoneReqId: res?.message }
                : { emailReqId: res?.message }),
            })
          );
          handleOtpReset(type);
          if (type === "phone") {
            setPhoneTimer(30);
            setIsPhoneResendDisabled(true);
          } else {
            setEmailTimer(30);
            setIsEmailResendDisabled(true);
          }
        },
        (err) => {
          // console.log({ err });
          toast.error(err?.message);
        },
        type === "phone" ? status?.phoneReqId : status?.emailReqId
      );
    } catch (err) {
      // console.log({ err });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = () => {
    if (phoneVerified && emailVerified) {
      navigate("/change-password");
    } else {
      toast.error("Please verify both phone and email OTPs");
    }
  };

  return (
    <div className="min-h-screen h-svh select-none bg-background2">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background3 bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" />
      <div className="flex items-center justify-center h-full">
        <div className="bg-gradient-to-t from-fromColor1 to-toColor1 rounded-2xl w-[90%] max-w-[1000px] mx-auto my-6 py-8 px-10 shadow-xl">
          <h2 className="text-center text-3xl font-bold text-textPrimary mb-6">
            Forgot Password
          </h2>

          {/* Form Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* PHONE SECTION */}
            <div>
              <label className="font-semibold text-sm text-textPrimary">
                Phone
              </label>
              <div className="relative mt-2">
                <span className="absolute top-2.5 left-3 text-textPrimary font-medium">
                  +91
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
                  }
                  className="text-textPrimary w-full rounded-xl py-2 pl-12 pr-4 bg-backgroundGray15 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-backgroundBlue transition-all"
                  placeholder="Enter phone number"
                />
              </div>
              {error.phone && (
                <p className="text-red-500 text-sm mt-1">{error.phone}</p>
              )}

              {/* PHONE OTP Section */}
              {otpVisible && (
                <div className="mt-5 pt-4">
                  <p className="font-semibold text-sm text-textPrimary mb-2">
                    Phone OTP
                  </p>
                  <div className="flex items-center">
                    {phoneOtp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(r) => (phoneRefs.current[i] = r)}
                        value={digit}
                        maxLength={1}
                        onChange={handleOtpChange("phone", i)}
                        disabled={phoneVerified}
                        className="w-12 h-12 text-textPrimary text-center text-xl mx-1 rounded-xl bg-backgroundGray15 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-backgroundBlue transition-all"
                      />
                    ))}
                  </div>
                  {!phoneVerified && (
                    <p className="text-sm mt-3 text-gray-400">
                      {isPhoneResendDisabled ? (
                        <>Resend in {phoneTimer}s</>
                      ) : (
                        <span
                          className="text-white font-semibold cursor-pointer"
                          onClick={() => resendOtp("phone")}
                        >
                          Resend OTP
                        </span>
                      )}
                    </p>
                  )}
                  {!phoneVerified && (
                    <button
                      onClick={verifyPhoneOtp}
                      className="mt-3 bg-backgroundBlue text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      Verify Phone OTP
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* EMAIL SECTION */}
            <div>
              <label className="font-semibold text-sm text-textPrimary">
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailVerified}
                className="text-textPrimary w-full rounded-xl py-2 px-4 bg-backgroundGray15 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-backgroundBlue mt-2 transition-all"
                placeholder="Enter email address"
              />
              {error.email && (
                <p className="text-red-500 text-sm mt-1">{error.email}</p>
              )}

              {/* EMAIL OTP Section */}
              {otpVisible && (
                <div className="mt-5 pt-4">
                  <p className="font-semibold text-sm text-textPrimary mb-2">
                    Email OTP
                  </p>
                  <div className="flex items-center">
                    {emailOtp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(r) => (emailRefs.current[i] = r)}
                        value={digit}
                        maxLength={1}
                        onChange={handleOtpChange("email", i)}
                        className="w-12 h-12 text-textPrimary text-center text-xl mx-1 rounded-xl bg-backgroundGray15 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-backgroundBlue transition-all"
                      />
                    ))}
                  </div>
                  {!emailVerified && (
                    <p className="text-sm mt-3 text-gray-400">
                      {isEmailResendDisabled ? (
                        <>Resend in {emailTimer}s</>
                      ) : (
                        <span
                          className="text-white font-semibold cursor-pointer"
                          onClick={() => resendOtp("email")}
                        >
                          Resend OTP
                        </span>
                      )}
                    </p>
                  )}
                  {!emailVerified && (
                    <button
                      onClick={verifyEmailOtp}
                      className="mt-3 bg-backgroundBlue text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      Verify Email OTP
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-10">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg px-6 py-2 bg-backgroundBlue text-white font-medium hover:opacity-90 transition"
            >
              Back
            </button>

            {!otpVisible ? (
              <button
                onClick={handleSubmit}
                className="rounded-lg px-6 py-2 bg-backgroundBlue text-white font-medium hover:opacity-90 transition"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleFinalVerify}
                className="rounded-lg px-6 py-2 bg-backgroundBlue text-white font-medium hover:opacity-90 transition"
              >
                Verify & Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
