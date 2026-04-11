import React, { useState, useRef, useEffect } from "react";
import ArrowRight from "../assets/images/ArrowRight.png";

/**
 * CustomDropdown Component
 * @param {string} label - The label displayed above the dropdown.
 * @param {array} options - Array of option objects with shape { value, label }.
 * @param {string} value - The currently selected value.
 * @param {function} onChange - Callback fired when an option is selected.
 * @param {string} placeholder - Placeholder text when no value is selected.
 * @param {boolean} disabled - Disable dropdown if true.
 */
const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleOptionClick = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

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
    <div className="relative" ref={dropdownRef}>
      <div
        className={`mt-2 cursor-pointer border border-gray-300 rounded-lg py-2 px-5 flex items-center justify-between ${
          disabled ? "bg-gray-100" : "bg-white"
        }`}
        onClick={toggleDropdown}
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <img
          src={ArrowRight}
          alt="dropdown arrow"
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </div>
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option.name}
              className="cursor-pointer px-5 py-2 hover:bg-gray-200"
              onClick={() => handleOptionClick(option.name)}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
