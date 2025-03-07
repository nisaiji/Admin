import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const CustomDropdown = ({
  title,
  options,
  onSelect,
  renderItem,
  styles,
  maxwidth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [t] = useTranslation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${maxwidth}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`cursor-pointer shadow appearance-none border border-[#0F4189] leading-tight focus:outline-none focus:shadow-outline text-[#0F4189] text-center text-sm font-poppins-bold ${styles}`} // add only border radius padding margin height and width
        data-testid="classlist"
      >
        {title}
      </button>

      {isOpen && (
        <ul className="absolute left-0 w-full border border-[#0F4189] bg-white rounded-lg shadow-lg max-h-[150px] overflow-y-auto mt-0.5">
          {options.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              className="py-1 px-2 cursor-pointer hover:bg-blue-100 text-[#0F4189] text-center text-sm font-poppins-bold"
            >
              {renderItem ? renderItem(item) : item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
