import React from "react";

export const BlueCard = ({
  img,
  heading,
  title1,
  title2,
  bg = "bg-[#1c1c1c]",
}) => {
  return (
    <div className={`p-4 rounded-xl border-b-2 border-b-backgroundBlue ${bg}`}>
      <div className="flex gap-4">
        <div className="size-10 bg-backgroundBlue bg-opacity-15 flex justify-center items-center rounded-md">
          <img src={img} alt="p" className="size-6 object-contain z-10" />
        </div>
        <p className="text-lg font-poppins-bold mt-1">{heading}</p>
      </div>
      <div className="flex mt-6 justify-between items-center">
        <p className="text-2xl font-poppins-bold">{title1}</p>
        <p className="text-base text-textBlue font-poppins-bold">{title2}</p>
      </div>
    </div>
  );
};

export const RedCard = ({
  img,
  heading,
  title1,
  title2,
  bg = "bg-[#1c1c1c]",
}) => {
  return (
    <div className={`p-4 rounded-xl border-b-2 border-b-backgroundRed ${bg}`}>
      <div className="flex gap-4">
        <div className="size-10 bg-backgroundRed bg-opacity-15 flex justify-center items-center rounded-md">
          <img src={img} alt="p" className="size-6 object-contain" />
        </div>
        <p className="text-lg font-poppins-bold mt-1">{heading}</p>
      </div>
      <div className="flex mt-6 justify-between items-center">
        <p className="text-2xl font-poppins-bold">{title1}</p>
        <p className="text-base text-textRed font-poppins-bold">{title2}</p>
      </div>
    </div>
  );
};

export const GreenCard = ({
  img,
  heading,
  title1,
  title2,
  bg = "bg-[#1c1c1c]",
}) => {
  return (
    <div className={`p-4 rounded-xl border-b-2 border-b-backgroundGreen ${bg}`}>
      <div className="flex gap-4">
        <div className="size-10 bg-backgroundGreen bg-opacity-15 flex justify-center items-center rounded-md">
          <img src={img} alt="p" className="size-6 object-contain" />
        </div>
        <p className="text-lg font-poppins-bold mt-1">{heading}</p>
      </div>
      <div className="flex mt-6 justify-between items-center">
        <p className="text-2xl font-poppins-bold">{title1}</p>
        <p className="text-base text-textGreen font-poppins-bold">{title2}</p>
      </div>
    </div>
  );
};

export const WhiteCard = ({
  img,
  heading,
  title1,
  title2,
  bg = "bg-[#1c1c1c]",
}) => {
  return (
    <div className={`p-4 rounded-xl border-b-2 border-b-whiteBackground ${bg}`}>
      <div className="flex gap-4">
        <div className="size-10 bg-backgroundGray15 bg-opacity-15 flex justify-center items-center rounded-md">
          <img
            src={img}
            alt="p"
            className="size-6 object-contain invert brightness-0"
          />
        </div>
        <p className="text-lg font-poppins-bold mt-1">{heading}</p>
      </div>
      <div className="flex mt-6 justify-between items-center">
        <p className="text-2xl font-poppins-bold">{title1}</p>
        <p className="text-base text-textPrimary font-poppins-bold">{title2}</p>
      </div>
    </div>
  );
};

export const OrangeCard = ({
  img,
  heading,
  title1,
  title2,
  bg = "bg-[#1c1c1c]",
}) => {
  return (
    <div
      className={`p-4 rounded-xl border-b-2 border-b-backgroundOrange1 ${bg}`}
    >
      <div className="flex gap-4">
        <div className="size-10 bg-backgroundOrange1 bg-opacity-15 flex justify-center items-center rounded-md">
          <img src={img} alt="p" className="size-6 object-contain" />
        </div>
        <p className="text-lg font-poppins-bold mt-1">{heading}</p>
      </div>
      <div className="flex mt-6 justify-between items-center">
        <p className="text-2xl font-poppins-bold">{title1}</p>
        <p className="text-base text-textOrange2 font-poppins-bold">{title2}</p>
      </div>
    </div>
  );
};
