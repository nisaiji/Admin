import React, { useEffect, useState } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import { setClassAndSectionData } from "../../../store/AppAuthSlice";
import ConformationPopup from "../../ConformationPopup";
import { ArrowLeft, Save, Clock } from "lucide-react";

export default function SchoolFeeSetting({ setSelected }) {
  const dispatch = useDispatch();
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [loading, setLoading] = useState(false);
  const [showConformationPopup, setshowConformationPopup] = useState(false);
  const [settings, setSettings] = useState({
    frequency: classAndSectionData?.feeStructureData?.installmentType ?? "",
    effectiveDate:
      moment(classAndSectionData?.feeStructureData?.effectiveFrom).format(
        "YYYY-MM-DD"
      ) ?? "",
    lateFee: classAndSectionData?.feeStructureData?.lateFeePercent ?? 12,
  });

  const frequencies = [
    { value: "monthly", label: "Monthly", description: "12 payments per year" },
    {
      value: "bimonthly",
      label: "Bi-Monthly",
      description: "6 payments per year",
    },
    {
      value: "quarterly",
      label: "Quarterly",
      description: "4 payments per year",
    },
    {
      value: "half-yearly",
      label: "Half Yearly",
      description: "2 payments per year",
    },
    { value: "annually", label: "Annually", description: "1 payment per year" },
  ];

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post(
        EndPoints.ADMIN.CREATE_FEES_STRUCTURE,
        {
          sessionId: classAndSectionData?.selectedSession?._id,
          installmentType: settings.frequency,
          lateFeePercent: Number(settings.lateFee),
          effectiveFrom: moment(settings.effectiveDate).valueOf(),
        }
      );
      // console.log(res);
      if (res?.statusCode === 201) {
        // res?.result?.schoolFeeStructure
        // console.log(res);
        toast.success(res?.result?.message);
        getSchoolFeeStructure();
        // setSelected("viewSetup");
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSchoolFeeStructure = async () => {
    try {
      const res = await axiosClient.post(EndPoints.ADMIN.GET_FEES_STRUCTURE, {
        sessionId: classAndSectionData?.selectedSession?._id,
      });
      // console.log(res);
      if (res?.statusCode === 200) {
        dispatch(setClassAndSectionData({ feeStructureData: res?.result }));
      }
    } catch (e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    getSchoolFeeStructure();
  }, []);

  return (
    <div className="max-w-5xl mx-auto my-6">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelected("viewSetup")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-white text-2xl">School Fee Settings</h1>
            <p className="text-gray-400 text-sm mt-1">
              Configure school-wide fee structure settings that apply to all
              classes
            </p>
          </div>
        </div>

        <button
          onClick={() => setshowConformationPopup(true)}
          disabled={classAndSectionData?.feeStructureData?.installmentType}
          className="flex items-center gap-2 px-6 py-3 bg-[#0A81D1] text-white rounded-lg hover:bg-[#0A81D1]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>

      <div className="space-y-6">
        {/* Payment Frequency */}
        <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white text-lg">Payment Frequency</h2>
              <p className="text-gray-400 text-sm">
                Set how often fees will be collected throughout the year
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frequencies.map((freq) => (
              <button
                key={freq.value}
                onClick={() => handleSettingChange("frequency", freq.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.frequency === freq.value
                    ? "border-[#0A81D1] bg-[#0A81D1]/5"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-white">{freq.label}</div>
                  {settings.frequency === freq.value && (
                    <div className="w-5 h-5 bg-[#0A81D1] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{freq.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Effective Date */}
        <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5  text-[#05da70] pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg">Effective Date</h2>
              <p className="text-gray-400 text-sm">
                When these fee settings should take effect
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <label className="block text-gray-400 text-sm mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={settings.effectiveDate}
                min={moment().add(3, "days").format("YYYY-MM-DD")}
                max={moment(
                  classAndSectionData?.selectedSession?.endDate
                ).format("YYYY-MM-DD")}
                onChange={(e) =>
                  handleSettingChange("effectiveDate", e.target.value)
                }
                onBlur={() => {
                  const today = moment().startOf("day");
                  const selected = moment(settings.effectiveDate);
                  const sessionEnd = moment(
                    classAndSectionData?.selectedSession?.endDate
                  ).startOf("day");

                  // Past date
                  if (selected.isBefore(today)) {
                    handleSettingChange("effectiveDate", "");
                    return;
                  }

                  // After session end date
                  if (selected.isAfter(sessionEnd)) {
                    handleSettingChange("effectiveDate", "");
                    return;
                  }
                }}
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#0A81D1]"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
        </div>

        {/* Late Fee */}
        <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <p className="text-textOrange font-poppins-bold text-lg">%</p>
            </div>
            <div>
              <h2 className="text-white text-lg">Late Fee Configuration</h2>
              <p className="text-gray-400 text-sm">
                Set penalties for late fee payments
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="max-w-md">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {settings.lateFee}% Late Fee Interest (per Annum)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 12"
                  value={settings.lateFee}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    handleSettingChange("lateFee", value);
                  }}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-blue-400 mb-2">Important Note</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>These settings apply to all classes across the school</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                After saving, you can set individual fee amounts for each class
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                Changes will take effect from the specified effective date
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Payment frequency cannot be changed once set here</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                Effective date and late fee interest can be modified only once
                before the effective date arrives
              </span>
            </li>
          </ul>
        </div>
      </div>

      <ConformationPopup
        isVisible={showConformationPopup}
        onClose={() => setshowConformationPopup(false)}
        onSubmit={() => {
          handleSave();
          setshowConformationPopup(false);
        }}
        message="Are you sure you want to save these settings? Once saved, the payment frequency cannot be changed. Effective date and late fee interest can be modified only once before the effective date arrives."
      />
    </div>
  );
}
