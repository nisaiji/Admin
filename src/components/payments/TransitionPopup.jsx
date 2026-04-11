import { jsPDF } from "jspdf";
import React from "react";

export default function TransactionModal({ open, onClose }) {
  if (!open) return null;

  const transaction = {
    student: "Anushka Mishra",
    class: "1 A",
    parent: "Shubhangi Mishra",
    transactionId: "87HSB678",
    dateTime: "12:03 AM, 04/01/2025",
    paymentMode: "UPI",
    status: "Under Review",
    amount: "7000",
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Transaction Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Student: ${transaction.student}`, 20, 40);
    doc.text(`Class: ${transaction.class}`, 20, 50);
    doc.text(`Parent: ${transaction.parent}`, 20, 60);
    doc.text(`Transaction ID: ${transaction.transactionId}`, 20, 70);
    doc.text(`Date & Time: ${transaction.dateTime}`, 20, 80);

    doc.text(`Payment Mode: ${transaction.paymentMode}`, 20, 105);
    doc.text(`Status: ${transaction.status}`, 20, 115);

    doc.setFontSize(14);
    doc.text(`Amount Paid: ${transaction.amount}`, 20, 135);

    doc.save("Transaction_Receipt.pdf");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-[#1f1f1f] p-5 text-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Content */}

        <div className="mx-5 my-5 p-4 rounded-xl space-y-4 text-base bg-[#68686820]">
          <div className="grid grid-cols-2 gap-y-4">
            <span className="text-textBlue">Student</span>
            <span>{transaction.student}</span>

            <span className="text-textBlue">Class</span>
            <span>{transaction.class}</span>

            <span className="text-textBlue">Parent</span>
            <span>{transaction.parent}</span>

            <span className="text-textBlue">Transaction ID</span>
            <span>{transaction.transactionId}</span>

            <span className="text-textBlue">Date & Time</span>
            <span>{transaction.dateTime}</span>
          </div>

          <hr className="border-white/10" />

          <div className="grid grid-cols-2 gap-y-4">
            <span className="text-textBlue">Payment Mode</span>
            <span className="text-orange-400 font-medium">
              {transaction.paymentMode}
            </span>

            <span className="text-textBlue">Status</span>
            <span className="inline-block w-fit rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-400 text-xs">
              {transaction.status}
            </span>

            <span className="text-textBlue">Amount</span>
            <span className="text-lg font-semibold">{transaction.amount}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-white/10">
          <button
            onClick={downloadPDF}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
