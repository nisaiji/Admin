import React, { useState } from "react";
import ArrowLeft from "../../../assets/images/fees/leftarrow.png";
import FeeStructureCreated from "./FeeStructureCreated";
import FeeStructureReview from "./FeeStructureReview";

export default function FeeStructureSetup({ onBack }) {
  const [step, setStep] = useState("setup"); // "setup", "review", "complete"
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [lateFeeAmount, setLateFeeAmount] = useState("");
  const [periodAmounts, setPeriodAmounts] = useState({});
  const [baseAmount, setBaseAmount] = useState("");
  const [differentSection, setDifferentSection] = useState(false);
  const [selectedSections, setSelectedSections] = useState([]);

  const classes = [
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  
  const frequencies = [
    "Monthly",
    "Bi-Monthly",
    "Quarterly",
    "Half-Yearly",
    "Annually",
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
    }[freq] || []);

  const updateFee = (period, value) => {
    setPeriodAmounts((prev) => ({
      ...prev,
      [period]: value === "" ? "" : value.replace(/\D/g, ""),
    }));
  };

  const applyBaseToAll = () =>
    setPeriodAmounts(
      Object.fromEntries(getPeriods(frequency).map((p) => [p, baseAmount]))
    );

  const applyBaseToRemaining = () => {
    setPeriodAmounts((prev) => {
      const updated = { ...prev };
      getPeriods(frequency).forEach((p) => {
        if (!updated[p]) updated[p] = baseAmount; // Only fill if empty
      });
      return updated;
    });
  };

  const getTotalAmount = () => {
    return Object.values(periodAmounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  const allPeriodsFilledIn = () => {
    const periods = getPeriods(frequency);
    return periods.every((period) => {
      const v = periodAmounts[period];
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
      <FeeStructureCreated onBack={onBack} selectedGrade={selectedGrade} />
    );

  // REVIEW PAGE
  if (step === "review") {
    return (
      <FeeStructureReview
        onBack={onBack}
        selectedGrade={selectedGrade}
        startDate={startDate}
        frequency={frequency}
        periodAmounts={periodAmounts}
        getTotalAmount={() => getTotalAmount()}
        lateFeeAmount={lateFeeAmount}
        setStep={setStep}
      />
    );
  }

  // ----- MAIN SETUP PAGE -----
  return (
    <div className="p-8 w-full">
      <BackBtn text="Back to Payment Setup" />

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
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => {
                setSelectedGrade(c);
                setDifferentSection(false);
                setSelectedSections([]);
              }}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                selectedGrade === c
                  ? "border-[#0A81D1] bg-[#0A81D1]/10 text-white"
                  : "border-gray-700 bg-[#0f1419] text-gray-400 hover:border-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Show only AFTER class is selected */}
        {selectedGrade && (
          <div className="mb-6 mt-4">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={differentSection}
                onChange={(e) => {
                  setDifferentSection(e.target.checked);
                  if (!e.target.checked) setSelectedSections([]);
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
                  {["A", "B", "C", "D", "E"].map((sec) => {
                    const active = selectedSections.includes(sec);
                    return (
                      <button
                        key={sec}
                        onClick={() =>
                          setSelectedSections((prev) =>
                            active
                              ? prev.filter((s) => s !== sec)
                              : [...prev, sec]
                          )
                        }
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          active
                            ? "border-[#0A81D1] bg-[#0A81D1]/10 text-white"
                            : "border-gray-700 bg-[#0f1419] text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        Section {sec}
                      </button>
                    );
                  })}
                </div>

                {selectedSections.length > 0 && (
                  <p className="text-[#0A81D1] mt-2 text-sm">
                    Selected Sections: {selectedSections.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Frequency */}
        <Label text="Payment Frequency" />
        <p className="text-gray-500 text-sm mb-4">
          How often should students pay the fee?
        </p>
        <div className="relative mb-6">
          <select
            value={frequency || ""}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full bg-[#0f1419] border border-gray-700 text-white rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-[#0A81D1]"
          >
            <option value="">Select frequency...</option>
            {frequencies.map((freq) => (
              <option key={freq} value={freq}>
                {freq}
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
        </div>

        {/* Start Date and Late Fee Amount */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <Label text="Effective From" />
            <p className="text-gray-500 text-sm mb-4">
              When should this structure start?
            </p>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  const parts = value.split("-");
                  if (parts[0] && parts[0].length > 4) return;

                  setStartDate(value);
                }}
                className="w-full bg-[#0f1419] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A81D1]"
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
            <Label text="Late Fee Amount (₹)" />
            <p className="text-gray-500 text-sm mb-4">
              Penalty for late payment
            </p>
            <input
              type="text"
              value={lateFeeAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setLateFeeAmount(value);
              }}
              placeholder="Enter late fee"
              className="w-full bg-[#0f1419] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A81D1]"
            />
          </div>
        </div>

        {frequency && (
          <>
            <Label text="Fee Amounts per Period (₹)" />
            <p className="text-gray-500 text-sm mb-4">
              {frequency === "annually"
                ? "Set the annual fee amount"
                : "Set a base amount and customize specific periods if needed"}
            </p>
            {/* Base Amount with Quick Actions - Only show for non-annual frequencies */}
            {frequency !== "annually" && (
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
                {getPeriods(frequency).map((period, index) => (
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
                        value={periodAmounts[period] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          updateFee(period, value);
                        }}
                        placeholder="0"
                        className="w-full bg-[#0a0a0a] border border-gray-700 text-white text-sm rounded pl-6 pr-2 py-1.5 focus:outline-none focus:border-[#0A81D1] transition-colors"
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
                <strong>Note:</strong> This fee structure will apply to all
                students in the selected class. Automatic reminders will be sent
                on the 2nd of every period.
              </p>
            </div>

            {/* Proceed Button */}
            <button
              onClick={() => setStep("review")}
              disabled={
                !selectedGrade ||
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
