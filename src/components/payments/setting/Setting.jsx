import React from "react";
import integration from "../../../assets/images/fees/integration.png";
import task from "../../../assets/images/fees/task-due.png";
import tax from "../../../assets/images/fees/tax.png";
import payment from "../../../assets/images/fees/payment-due.png";
import money from "../../../assets/images/fees/hand-money.png";

export default function Setting({ setSelected }) {
  const items = [
    {
      img: money,
      title: "Fee Structure",
      desc: "Define and manage class-wise and term-wise fees.",
      navigate: () => setSelected("paymentSetup"),
    },
    {
      img: payment,
      title: "Payment Terms / Cycle",
      desc: "Set due dates, installment cycles, and auto-reminder intervals.",
    },
    {
      img: tax,
      title: "Tax / Discount Rules",
      desc: "Configure GST, scholarships, and discounts for students.",
    },
    {
      img: task,
      title: "Late Fee Rules",
      desc: "Set penalties for overdue payments, including daily or fixed-rate fines.",
    },
    {
      img: integration,
      title: "Integration Details (Zoho)",
      desc: "Connect your system with Zoho Payments for live status updates.",
    },
  ];

  return (
    <div className="p-6 w-full">
      <p className="text-2xl text-textPrimary font-poppins-bold mb-4">
        Payment Setup
      </p>

      {/* Beautiful Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-10 bg-[#1c1c1c] rounded-xl shadow-lg">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            className="
              p-6 rounded-xl bg-[#2b2b2b] h-[220px] 
              flex flex-col
              transition-all duration-300  
              hover:bg-[#353535] hover:-translate-y-1 hover:shadow-xl
            "
            onClick={() => item.navigate && item.navigate()}
          >
            {/* <div className="flex justify-center"> */}
            <img src={item?.img} alt="i" className="size-16 object-contain" />
            {/* </div> */}

            <p className="mt-6 text-lg text-textPrimary font-poppins-bold">
              {item?.title}
            </p>

            <p className="text-sm text-textGray1 font-poppins-regular mt-1">
              {item?.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
