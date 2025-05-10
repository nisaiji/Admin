import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EndPoints from "../services/EndPoints";
import { axiosClient } from "../services/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../store/AppAuthSlice";
import toast from "react-hot-toast";
import REGEX from "../utils/regix";
import refresh from "../assets/images/refresh.png";

const Step1 = ({ goback, setStep }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.appAuth);
  const [phone, setPhone] = useState("7771872012");
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
      setLoading(true);
      const res = await axiosClient.put(EndPoints.ADMIN.PHONE_OTP_VERIFY, {
        phone,
        otp: Number(otp.join("")),
      });
      console.log({ status });

      if (res.statusCode === 200) {
        dispatch(setAuth({ phoneVerified: true }));
        toast.success(res?.result?.msg);
        localStorage.setItem("temp_access_token", res?.result?.token);
        if (!status?.emailVerified) {
          setStep(2);
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
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

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
      console.log({ data });

      dispatch(setAuth({ ...data, phone }));
      if (!data.phoneVerified) {
        try {
          const response = await axiosClient.post(EndPoints.ADMIN.RESEND_OTP, {
            phone,
          });
          console.log({ response });

          if (response?.statusCode === 200) {
            toast.success(response?.result);
            setOtpVisible(true);
          }
        } catch (e) {
          console.log({ e });
        }
      } else if (
        !data.emailVerified ||
        !data?.passwordUpdated ||
        !data?.affiliationExists ||
        !data?.addressUpdated ||
        !data?.isActive
      ) {
        const response = await axiosClient.post(EndPoints.ADMIN.RESEND_OTP, {
          phone,
        });
        if (response?.statusCode === 200) {
          toast.success(response?.result);
          setOtpVisible(true);
        }
      }
    } catch (err) {
      console.log(err);

      if (err === "Admin not found") {
        const response = await axiosClient.post(EndPoints.ADMIN.PHONE_VERIFY, {
          phone,
        });
        if (response.statusCode === 200) {
          setOtpVisible(true);
        }
      }
    } finally {
      setLoading(false);
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
      const res = await axiosClient.post(EndPoints.ADMIN.RESEND_OTP, {
        phone,
      });
      if (res?.data?.statusCode === 200) {
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
    <form>
      {/* Phone Input */}
      <div className="mt-10">
        <p className="text-textPrimary text-sm text-left font-semibold">
          {t("adminProfile.Phone")}
        </p>
        <p className="absolute mt-[17px] ml-6 text-textPrimary">+91</p>
        <input
          className="text-textPrimary rounded-xl border border-borderWhite2 py-2 pl-[55px] mt-2 w-full bg-backgroundGray15"
          type="text"
          name="phone"
          placeholder={t("placeholders.phoneNumber")}
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
          }
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
                className="w-14 h-14 text-center text-xl rounded-xl bg-backgroundGray15 text-textPrimary border border-gray-300 mx-1 focus:outline-none"
              />
            ))}
            <button type="button" onClick={handleOtpReset}>
              <img
                src={refresh}
                alt="refresh"
                className="size-9 invert top-10 cursor-pointer ml-3"
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
            <p className="text-base">{t("buttons.submit")}</p>
          </button>
        )}
      </div>
    </form>
  );
};

export default Step1;
