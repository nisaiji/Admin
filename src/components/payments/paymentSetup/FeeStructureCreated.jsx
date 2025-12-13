import React from "react";
import ArrowLeft from "../../../assets/images/fees/leftarrow.png";
import accept from "../../../assets/images/darkmode/accept.png";

export default function FeeStructureCreated({ onBack, selectedGrade }) {
  return (
    <div>
      <button
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        onClick={onBack}
      >
        <img src={ArrowLeft} alt="a" className="size-5 object-contain" /> Back
        to Payment Setup
      </button>
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <img src={accept} alt="a" className="size-10 object-contain" />
          </div>
          <h2 className="text-white text-2xl mb-3">Fee Structure Created!</h2>
          <p className="text-gray-400 mb-6">
            Fee structure for {`Class ${selectedGrade}`} has been successfully
            configured. All students in this class will follow this structure.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#0A81D1] text-white rounded-lg hover:bg-[#0873b9] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
