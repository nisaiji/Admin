import React from "react";
import ArrowLeft from "../../../assets/images/fees/leftarrow.png";
import file from "../../../assets/images/fees/file.png";
import moment from "moment/moment";

export default function FeeStructureReview({
  onBack,
  selectedClass,
  selectedSections,
  setStep,
  frequency,
  startDate,
  periodAmounts,
  getTotalAmount,
  lateFeeAmount,
  createFees,
  getInstallmentDates,
}) {
  return (
    <div>
      <button
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        onClick={onBack}
      >
        <img src={ArrowLeft} alt="a" className="size-5 object-contain" /> Back
        to Payment Setup
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <img src={file} alt="file" className="size-6 object-contain" />
            <div>
              <h2 className="text-white text-2xl">
                Review Class Fee Structure
              </h2>
              <p className="text-gray-400">
                Review fee structure details for{" "}
                {`Class ${selectedClass?.name}`}
              </p>
            </div>
          </div>

          {/* Setup Info */}
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 mb-4">
            <p className="text-gray-500 text-sm mb-1">Setup Date</p>
            <p className="text-white">{new Date().toLocaleDateString()}</p>
          </div>

          {/* Fee Details */}
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 mb-4">
            <p className="text-gray-500 text-sm mb-1">Class</p>
            <p className="text-white text-xl">{`Class ${selectedClass?.name}`}</p>
          </div>

          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 mb-4">
            <p className="text-gray-500 text-sm mb-1">Section</p>
            <p className="text-white text-xl">{`Selected Sections: ${selectedSections
              .map((sec) => sec.name)
              .join(", ")}`}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
              <p className="text-gray-500 text-sm mb-1">Payment Frequency</p>
              <p className="text-white capitalize">
                {frequency?.replace("-", " ")}
              </p>
            </div>
            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
              <p className="text-gray-500 text-sm mb-1">Effective From</p>
              <p className="text-white">
                {new Date(startDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Period Breakdown */}
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 mb-4">
            <p className="text-gray-500 text-sm mb-3">
              Fee Breakdown by Period
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(periodAmounts).map(([period, amount]) => {
                const { dueDate } = getInstallmentDates(period);
                const isPast = moment(dueDate).isBefore(
                  moment(startDate).startOf("day")
                );

                return (
                  <div
                    key={period}
                    className="flex justify-between items-center bg-[#1a1d24] rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-400 text-sm">{period}</span>

                    <span
                      className={`text-sm ${
                        isPast ? "text-gray-500 italic" : "text-white"
                      }`}
                    >
                      ₹{isPast ? 0 : amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
              <p className="text-gray-500 text-sm mb-1">Total Annual Fee</p>
              <p className="text-white text-3xl">₹{getTotalAmount()}</p>
            </div>
            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
              <p className="text-gray-500 text-sm mb-1">Late Fee Amount</p>
              <p className="text-white text-3xl">
                {lateFeeAmount ? `₹${lateFeeAmount}` : "Not set"}
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#0A81D1]/10 border border-[#0A81D1]/30 rounded-lg p-4 mb-4">
            <p className="text-[#0A81D1]">
              <strong>Note:</strong> This fee structure will apply to all
              students in{" "}
              {`Class ${selectedClass?.name} Section ${selectedSections
                .map((sec) => sec.name)
                .join(", ")}`}
              . Payment reminders will be sent automatically on the{" "}
              {moment(startDate).format("D")} of each period.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-8">
            <p className="text-amber-400">
              <strong>Applies to:</strong> All current and future students
              enrolled in{" "}
              {`Class ${selectedClass?.name} Section ${selectedSections
                .map((sec) => sec.name)
                .join(", ")}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep("setup")}
              className="flex-1 px-6 py-3 bg-[#0f1419] border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Edit
            </button>
            <button
              onClick={() => createFees()}
              className="flex-1 px-6 py-3 bg-[#0A81D1] text-white rounded-lg hover:bg-[#0873b9] transition-colors flex items-center justify-center gap-2"
            >
              Confirm & Create Structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
