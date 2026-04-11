import React, { useEffect, useMemo, useState } from "react";
import ArrowLeft from "../../../assets/images/fees/leftarrow.png";
import FeeStructureCreated from "./FeeStructureCreated";
import FeeStructureReview from "./FeeStructureReview";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";

const FREQUENCY_CONFIG = {
  monthly: {
    label: "Monthly",
    months: 1,
    periods: [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ],
    grid: 6,
  },
  bimonthly: {
    label: "Bi-Monthly",
    months: 2,
    periods: ["Apr-May", "Jun-Jul", "Aug-Sep", "Oct-Nov", "Dec-Jan", "Feb-Mar"],
    grid: 3,
  },
  quarterly: {
    label: "Quarterly",
    months: 3,
    periods: ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"],
    grid: 4,
  },
  "half-yearly": {
    label: "Half Yearly",
    months: 6,
    periods: ["Apr-Sep", "Oct-Mar"],
    grid: 2,
  },
  annually: {
    label: "Annually",
    months: 12,
    periods: ["Annual"],
    grid: 2,
  },
};

export default function FeeStructureSetup({ onBack }) {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [t] = useTranslation();

  const [step, setStep] = useState("setup");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [differentSection, setDifferentSection] = useState(false);

  const [periodAmounts, setPeriodAmounts] = useState({});
  const [baseAmount, setBaseAmount] = useState("");

  const frequency = classAndSectionData?.feeStructureData?.installmentType;
  const startDate = moment(
    classAndSectionData?.feeStructureData?.effectiveFromDate,
  ).format("YYYY-MM-DD");
  const lateFeeAmount = classAndSectionData?.feeStructureData?.lateFeePercent;

  const freqConfig = FREQUENCY_CONFIG[frequency];

  useEffect(() => {
    if (!classAndSectionData?.selectedSession?._id) return;

    axiosClient
      .get(
        `${EndPoints.COMMON.CLASS_LIST}/${classAndSectionData.selectedSession._id}`,
      )
      .then((res) => {
        if (res?.statusCode === 200) {
          setClassList(res.result.filter((c) => c.section?.length));
        }
      });
  }, [classAndSectionData?.selectedSession?._id]);

  const getInstallmentDates = (period) => {
    const session = classAndSectionData.selectedSession;
    const sessionEnd = moment(session.endDate).endOf("day");

    if (frequency === "annually") {
      return {
        startDate: moment(session.startDate),
        dueDate: sessionEnd,
      };
    }

    const startMonth = period.includes("-") ? period.split("-")[0] : period;

    let start = moment(startDate)
      .month(startMonth)
      .year(
        ["Jan", "Feb", "Mar"].includes(startMonth)
          ? session.academicEndYear
          : session.academicStartYear,
      );

    let due = start
      .clone()
      .add(freqConfig.months, "months")
      .subtract(1, "day")
      .endOf("day");

    if (due.isAfter(sessionEnd)) due = sessionEnd.clone();

    return { startDate: start, dueDate: due };
  };

  const isPastPeriod = (period) => 
    // false;
  moment(getInstallmentDates(period).dueDate).isBefore(
    moment(startDate).startOf("day"),
  );

  const totalAmount = useMemo(
    () =>
      freqConfig.periods.reduce(
        (sum, p) =>
          isPastPeriod(p) ? sum : sum + Number(periodAmounts[p] || 0),
        0,
      ),
    [periodAmounts, frequency],
  );

  const applyBaseToAll = () =>
    setPeriodAmounts(
      Object.fromEntries(freqConfig.periods.map((p) => [p, baseAmount])),
    );

  const createFees = async () => {
    const sectionsFee = selectedSections.map((s) => ({
      sectionId: s._id,
      feeInstallments: freqConfig.periods.map((p) => ({
        ...getInstallmentDates(p),
        amount: isPastPeriod(p) ? 0 : Number(periodAmounts[p] || 0),
      })),
    }));

    try {
      const res = await axiosClient.post(EndPoints.ADMIN.CREATE_FEES, {
        classId: selectedClass._id,
        sessionId: classAndSectionData.selectedSession._id,
        schoolFeeStructureId: classAndSectionData.feeStructureData._id,
        totalAmount,
        sectionsFee,
      });
      if (res?.statusCode === 201) {
        // console.log(res);
        toast.success(res?.result?.message);
        setStep("complete");
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const classOptions = [
    "preNursery",
    "nursery",
    "LKG",
    "UKG",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
  ].map((key) => t(`options.${key}`));

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

  const getPeriods = (freq) =>
    ({
      Monthly: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ],
      "Bi-Monthly": [
        "Apr-May",
        "Jun-Jul",
        "Aug-Sep",
        "Oct-Nov",
        "Dec-Jan",
        "Feb-Mar",
      ],
      Quarterly: ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"],
      "Half-Yearly": ["Apr-Sep", "Oct-Mar"],
      Annually: ["Annual"],
    })[freq] || [];

  const normalizeFrequency = (freq) => {
    if (!freq) return "";
    return freq
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("-");
  };

  const normalizedFrequency = normalizeFrequency(frequency);

  /**
   * Fetches and sets the list of available classes and their corresponding sections.
   */
  const getClassList = async () => {
    try {
      if (!classAndSectionData?.selectedSession?._id) {
        return;
      }
      const res = await axiosClient.get(
        `${EndPoints.COMMON.CLASS_LIST}/${classAndSectionData?.selectedSession?._id}`,
      );

      if (res?.statusCode === 200) {
        // Filter out classes without sections and then sort them.
        const filteredSortedClasses = res?.result
          .filter((cls) => cls?.section?.length > 0)
          .sort((a, b) => {
            const aIndex = classOptions.indexOf(a.name);
            const bIndex = classOptions.indexOf(b.name);
            return aIndex - bIndex;
          });

        setClassList(filteredSortedClasses);
        const [firstClass] = filteredSortedClasses;
        setSectionList(firstClass?.section || []);
      }
    } catch (e) {
      // toast.error(e);
    }
  };

  useEffect(() => {
    getClassList();
  }, [classAndSectionData?.selectedSession?._id]);

  const updateFee = (period, value) => {
    if (isPastPeriod(period)) return;

    setPeriodAmounts((prev) => ({
      ...prev,
      [period]: value === "" ? "" : value.replace(/\D/g, ""),
    }));
  };

  const applyBaseToRemaining = () => {
    setPeriodAmounts((prev) => {
      const updated = { ...prev };
      getPeriods(normalizedFrequency).forEach((p) => {
        if (!updated[p]) updated[p] = baseAmount; // Only fill if empty
      });
      return updated;
    });
  };

  const getTotalAmount = () => {
    if (!frequency) return 0;

    return getPeriods(normalizedFrequency).reduce((sum, period) => {
      if (isPastPeriod(period)) return sum;

      const value = Number(periodAmounts[period]) || 0;
      return sum + value;
    }, 0);
  };

  const allPeriodsFilledIn = () => {
    const periods = getPeriods(normalizedFrequency);

    return periods.every((period) => {
      const v = periodAmounts[period];

      // Past period → always valid
      if (isPastPeriod(period)) return true;

      // Future / active period → must have amount > 0
      return v !== "" && v !== undefined && Number(v) > 0;
    });
  };

  // View Components for readability
  const Title = ({ children }) => (
    <h2 className="text-xl font-poppins-bold text-white mb-1">{children}</h2>
  );
  const Label = ({ text }) => (
    <label className="text-gray-300 mb-2 block">{text}</label>
  );

  const BackBtn = ({ text }) => (
    <button
      className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      onClick={onBack}
    >
      <img src={ArrowLeft} alt="a" className="size-5 object-contain" /> {text}
    </button>
  );

  // COMPLETE PAGE
  if (step === "complete")
    return (
      <FeeStructureCreated
        onBack={onBack}
        selectedClass={selectedClass}
        selectedSections={selectedSections}
      />
    );

  // REVIEW PAGE
  if (step === "review") {
    return (
      <FeeStructureReview
        onBack={onBack}
        selectedClass={selectedClass}
        selectedSections={selectedSections}
        startDate={startDate}
        frequency={frequency}
        periodAmounts={periodAmounts}
        getTotalAmount={() => getTotalAmount()}
        lateFeeAmount={lateFeeAmount}
        setStep={setStep}
        createFees={() => createFees()}
        getInstallmentDates={getInstallmentDates}
      />
    );
  }

  // ----- MAIN SETUP PAGE -----
  return (
    <div className="p-8 w-full">
      <BackBtn text="Back to Payment Setup" />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-4xl mx-auto bg-[#1a1d24] px-10 py-6 rounded-xl border border-gray-700">
        <Title>Create Fee Structure</Title>
        <p className="text-base font-poppins-bold text-[#A9ACB2] mb-6">
          Define fee structure for a class
        </p>

        {/* Class Selection */}
        <Label text="Select Class" />
        <p className="text-gray-500 text-sm mb-4">
          Choose the class for which you want to define the fee structure
        </p>

        <div className="grid grid-cols-8 gap-2 mb-6">
          {classList?.map((c) => (
            <button
              key={c._id}
              onClick={() => {
                setSelectedClass(c);
                setSectionList(c?.section ?? []);
                setSelectedSections(c?.section);
                setDifferentSection(false);
              }}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                selectedClass === c
                  ? "border-[#0A81D1] bg-[#0A81D1]/10 text-white"
                  : "border-gray-700 bg-[#0f1419] text-gray-400 hover:border-gray-600"
              }`}
            >
              {c?.name ?? ""}
            </button>
          ))}
        </div>

        {/* Show only AFTER class is selected */}
        {selectedClass?._id && (
          <div className="mb-6 mt-4">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={differentSection}
                onChange={(e) => {
                  setDifferentSection(e.target.checked);
                }}
                className="w-4 h-4"
              />
              Fees are different for specific sections
            </label>
            {/* SHOW SECTION SELECTOR ONLY WHEN CHECKED */}
            {differentSection && (
              <div className="mt-4">
                <Label text="Select Section(s)" />
                <p className="text-gray-500 text-sm mb-4">
                  Choose one or more sections with different fee structures
                </p>

                <div className="flex flex-wrap gap-2">
                  {sectionList?.map((sec) => {
                    const active = selectedSections.some(
                      (s) => s._id === sec._id,
                    );

                    return (
                      <button
                        key={sec?._id}
                        onClick={() =>
                          setSelectedSections((prev) => {
                            const exists = prev.some((s) => s._id === sec._id);

                            return exists
                              ? prev.filter((s) => s._id !== sec._id)
                              : [...prev, sec];
                          })
                        }
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          active
                            ? "border-[#0A81D1] bg-[#0A81D1]/10 text-white"
                            : "border-gray-700 bg-[#0f1419] text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        Section {sec?.name}
                      </button>
                    );
                  })}
                </div>
                {selectedSections.length > 0 && (
                  <p className="text-[#0A81D1] mt-2 text-sm">
                    Selected Sections:{" "}
                    {selectedSections.map((sec) => sec.name).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Frequency */}
        {/* <Label text="Payment Frequency" />
        <p className="text-gray-500 text-sm mb-4">
          How often should students pay the fee?
        </p>
        <div className="relative mb-6">
          <select
            value={frequency || ""}
            disabled
            // onChange={(e) => setFrequency(e.target.value)}
            className="w-full bg-[#0f1419] border border-gray-700 text-white rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-[#0A81D1] cursor-not-allowed"
          >
            <option value="">Select Frequency...</option>
            {frequencies.map((freq, i) => (
              <option key={i} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div> */}

        {/* Start Date and Late Fee Amount */}
        {/* <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <Label text="Effective From" />
            <p className="text-gray-500 text-sm mb-4">
              When should this structure start?
            </p>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                disabled
                // min={moment().add(3, "days").format("YYYY-MM-DD")}
                // max={moment(
                //   classAndSectionData?.selectedSession?.endDate
                // ).format("YYYY-MM-DD")}
                // onChange={(e) => setStartDate(e.target.value)}
                // onBlur={() => {
                //   const today = moment().startOf("day");
                //   const selected = moment(startDate);
                //   const sessionEnd = moment(
                //     classAndSectionData?.selectedSession?.endDate
                //   ).startOf("day");

                //   // Past date
                //   if (selected.isBefore(today)) {
                //     setStartDate("");
                //     return;
                //   }

                //   // After session end date
                //   if (selected.isAfter(sessionEnd)) {
                //     setStartDate("");
                //     return;
                //   }
                // }}
                className="w-full bg-[#0f1419] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A81D1] cursor-not-allowed"
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
          <div>
            <Label text="Late Fee Interest (%)" />
            <p className="text-gray-500 text-sm mb-4">
              Penalty for late payment per Annum
            </p>
            <input
              type="text"
              value={lateFeeAmount}
              disabled
              // onChange={(e) => {
              //   const value = e.target.value.replace(/\D/g, "");
              //   setLateFeeAmount(value);
              // }}
              placeholder="Enter late fee"
              className="w-full bg-[#0f1419] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A81D1] cursor-not-allowed"
            />
          </div>
        </div> */}

        {frequency && (
          <>
            <Label text="Fee Amounts per Period (₹)" />
            <p className="text-gray-500 text-sm mb-4">
              {normalizedFrequency === "annually"
                ? "Set the annual fee amount"
                : "Set a base amount and customize specific periods if needed"}
            </p>
            {/* Base Amount with Quick Actions - Only show for non-annual frequencies */}
            {normalizedFrequency !== "annually" && (
              <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-gray-400 text-sm mb-2">
                      Base Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="text"
                        value={baseAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setBaseAmount(value);
                        }}
                        placeholder="0"
                        className="w-full bg-[#0a0a0a] border border-gray-700 text-white rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:border-[#0A81D1] transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={applyBaseToAll}
                    disabled={!baseAmount}
                    className="px-4 py-2.5 bg-[#0A81D1] text-white text-sm rounded-lg hover:bg-[#0873b9] transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Apply to All
                  </button>
                  <button
                    onClick={applyBaseToRemaining}
                    disabled={!baseAmount}
                    className="px-4 py-2.5 bg-[#0f1419] border border-[#0A81D1] text-[#0A81D1] text-sm rounded-lg hover:bg-[#0A81D1]/10 transition-colors disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Fill Remaining
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  <strong>Tip:</strong> Use &quot;Apply to All&quot; for uniform
                  fees, or &quot;Fill Remaining&quot; to fill only unfilled
                  periods
                </p>
              </div>
            )}

            {/* Individual Period Inputs - Compact Table Layout */}
            <div className="bg-[#0f1419] border border-gray-800 rounded-lg overflow-hidden">
              <div
                className={`grid ${
                  frequency === "monthly"
                    ? "grid-cols-6"
                    : frequency === "bi-monthly"
                      ? "grid-cols-3"
                      : frequency === "quarterly"
                        ? "grid-cols-4"
                        : frequency === "half-yearly"
                          ? "grid-cols-2"
                          : "grid-cols-2"
                }`}
              >
                {getPeriods(normalizedFrequency).map((period, index) => (
                  <div
                    key={period}
                    className={`p-3 border-gray-800 ${
                      index %
                        (frequency === "monthly"
                          ? 6
                          : frequency === "bi-monthly"
                            ? 3
                            : frequency === "quarterly"
                              ? 4
                              : 2) !==
                      0
                        ? "border-l"
                        : ""
                    } ${
                      index >=
                      (frequency === "monthly"
                        ? 6
                        : frequency === "bi-monthly"
                          ? 3
                          : frequency === "quarterly"
                            ? 4
                            : frequency === "half-yearly"
                              ? 2
                              : 1)
                        ? "border-t"
                        : ""
                    }`}
                  >
                    <label className="block text-gray-500 text-xs mb-1.5">
                      {period}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        ₹
                      </span>
                      <input
                        type="text"
                        value={
                          isPastPeriod(period)
                            ? "0"
                            : periodAmounts[period] || ""
                        }
                        disabled={isPastPeriod(period)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          updateFee(period, value);
                        }}
                        placeholder="0"
                        className={`w-full text-sm rounded pl-6 pr-2 py-1.5 transition-colors ${
                          isPastPeriod(period)
                            ? "bg-[#0a0a0a] border border-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-[#0a0a0a] border border-gray-700 text-white focus:outline-none focus:border-[#0A81D1]"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(periodAmounts).length > 0 && (
              <div className="mt-3 mb-6 flex items-center justify-between bg-[#0A81D1]/10 border border-[#0A81D1]/30 rounded-lg px-4 py-2.5">
                <span className="text-[#0A81D1] text-sm">Total Annual Fee</span>
                <span className="text-[#0A81D1] text-lg">
                  ₹{getTotalAmount().toFixed(2)}
                </span>
              </div>
            )}

            {/* Info Box */}
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400">
                <strong>Note:</strong> This {frequency} fee structure will apply
                to all students in the selected class. Automatic reminders will
                be sent on the {moment(startDate).format("D")} of every period.
                Late Fee Interest is {lateFeeAmount}% Annually.
              </p>
            </div>

            {/* Proceed Button */}
            <button
              onClick={() => setStep("review")}
              disabled={
                !selectedClass ||
                !frequency ||
                !startDate ||
                !allPeriodsFilledIn()
              }
              className="w-full px-6 py-3 bg-[#0A81D1] text-white rounded-lg hover:bg-[#0873b9] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Proceed to Review
              <img
                src={ArrowLeft}
                alt="a"
                className="size-5 rotate-180 object-contain"
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
