import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classroom from "../../assets/images/fees/classroom.png";
import arrow from "../../assets/images/ArrowRight.png";
import { useNavigate } from "react-router-dom";
import { setTempData } from "../../store/AppAuthSlice";

export default function Sidebar({ items, selected, setSelected }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const navigate = useNavigate();

  return (
    <div
      className={`${
        isDarkMode
          ? "bg-gradient-to-t from-[#0A81D11A] to-[#0f0f0f]"
          : "bg-whiteBackground"
      } w-[250px] min-h-[calc(100vh-70px)] pt-[30px] flex flex-col items-center gap-3`}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          onClick={() => {
            setSelected(item.label);
            dispatch(setTempData({ selectedTab: item?.label }));
          }}
          className={`w-full flex justify-center cursor-pointer relative ${
            selected === item.label ? "bg-[#0A81D11A]" : ""
          }`}
        >
          {/* BLUE SELECTED TAB LINE */}
          {selected === item.label && (
            <div className="absolute left-0 h-full w-[6px] bg-gradient-to-b from-[#103F5F] to-[#0A81D1] rounded-md" />
          )}
          <div className="h-[56px] w-[140px] flex items-center gap-4 rounded-lg">
            <img
              src={item.src}
              alt={item.label}
              className="w-6 h-6 object-contain ml-3"
            />

            <p className="text-textPrimary text-sm font-poppins-bold">
              {item.label}
            </p>
          </div>
        </div>
      ))}
      <div
        onClick={() => navigate("/class-setup")}
        className="size-[180px] bg-gradient-to-r from-[#103F5F] to-[#0A81D1] rounded-3xl p-5 cursor-pointer relative"
      >
        <img
          src={arrow}
          alt="a"
          className="size-6 object-contain absolute top-4 right-4"
        />
        <img src={classroom} alt="c" className="size-10 object-contain mt-7" />
        <p className="text-textPrimary text-sm font-poppins-regular">
          Setup Classroom
        </p>
        <p className="text-textPrimary opacity-40 text-xs font-poppins-regular">
          Build your school structure in minutes
        </p>
      </div>
    </div>
  );
}
