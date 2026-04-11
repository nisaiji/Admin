import React from "react";

export default function ConfirmationPopup({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  confirmImg, // your uploaded confirm images
  cancelImg,
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1E1D1D] rounded-lg shadow-lg w-[450px] p-6 relative">
        {/* Icon & Title */}
        <div className="flex justify-between items-center space-x-3">
          <div className="flex items-center space-x-3">
            <img src={confirmImg} alt="confirm" className="w-12 h-12" />
            <div>
              <h2 className="text-lg font-poppins-bold text-textPrimary">
                {title}
              </h2>
              <p className="text-textGray text-sm font-poppins-regular">
                {message}
              </p>
            </div>
          </div>
          {/* <img
            src={cancelImg}
            alt="close"
            onClick={onCancel}
            className="w-4 h-4 cursor-pointer"
          /> */}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-borderGray3 text-textPrimary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-backgroundBlue text-textPrimary"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
