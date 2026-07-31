const fs = require('fs');
const path = require('path');

const baseDir = path.join('c:', 'Users', 'nikhi', 'Desktop', 'SchoolProject', 'Admin', 'src', 'components');

// 1. Navbar.jsx
const navbarPath = path.join(baseDir, 'Navbar.jsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

navbarContent = navbarContent.replace(/import \{ C \} from "\.\.\/utils\/constants";/g, 'import { C, C_LIGHT } from "../utils/constants";');
navbarContent = navbarContent.replace(/function NavDrop\(\{(.*?)\}\) \{/g, 'function NavDrop({$1, isDarkMode}) {\n  const themeC = isDarkMode ? C : C_LIGHT;');
navbarContent = navbarContent.replace(/function NavBtn\(\{(.*?)\}\) \{/g, 'function NavBtn({$1, isDarkMode}) {\n  const themeC = isDarkMode ? C : C_LIGHT;');
navbarContent = navbarContent.replace(/const Navbar = \(\) => \{/g, 'const Navbar = () => {\n  const themeC = isDarkMode ? C : C_LIGHT;');

// Inside NavDrop
navbarContent = navbarContent.replace(/background: open \? "rgba\\(255,255,255,0\.08\\)" : "transparent",/g, 'background: open ? (isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",');
navbarContent = navbarContent.replace(/border: \`1px solid \$\{open \? "rgba\\(255,255,255,0\.11\\)" : "transparent"\}\`,/g, 'border: `1px solid ${open ? (isDarkMode ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.08)") : "transparent"}`,');
navbarContent = navbarContent.replace(/C\.([a-zA-Z]+)/g, 'themeC.$1'); // Replace all C.* with themeC.* (safe because we replaced `const themeC = ...` above)
navbarContent = navbarContent.replace(/background: "#111520",/g, 'background: themeC.card,');
navbarContent = navbarContent.replace(/border: "1px solid rgba\\(255,255,255,0\.09\\)",/g, 'border: `1px solid ${themeC.border}`,');
navbarContent = navbarContent.replace(/background: "rgba\\(255,255,255,0\.06\\)",/g, 'background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",');
navbarContent = navbarContent.replace(/background: "rgba\\(255,255,255,0\.05\\)"\)/g, 'background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)")');
navbarContent = navbarContent.replace(/background: item\.iconColor\s*\?\s*`\$\{item\.iconColor\}18`\s*:\s*"rgba\\(255,255,255,0\.05\\)",/g, 'background: item.iconColor ? `${item.iconColor}18` : (isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),');
navbarContent = navbarContent.replace(/background: active \? "rgba\\(255,255,255,0\.06\\)" : "transparent",/g, 'background: active ? (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") : "transparent",');

// Inside Navbar component calls
navbarContent = navbarContent.replace(/<NavDrop\s+/g, '<NavDrop isDarkMode={isDarkMode} ');
navbarContent = navbarContent.replace(/<NavBtn\s+/g, '<NavBtn isDarkMode={isDarkMode} ');

// Hardcoded colors in Navbar
navbarContent = navbarContent.replace(/background: "rgba\\(255,255,255,0\.04\\)",/g, 'background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",');
navbarContent = navbarContent.replace(/border: "1px solid rgba\\(255,255,255,0\.07\\)",/g, 'border: `1px solid ${themeC.borderSoft}`,');
navbarContent = navbarContent.replace(/background: "rgba\\(255,255,255,0\.08\\)"/g, 'background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"');
navbarContent = navbarContent.replace(/border: "1px solid rgba\\(255,255,255,0\.12\\)",/g, 'border: `1px solid ${themeC.border}`,');

fs.writeFileSync(navbarPath, navbarContent);


// 2. CustomDropdown.jsx
const customDropdownPath = path.join(baseDir, 'CustomDropdown.jsx');
let customDropdownContent = fs.readFileSync(customDropdownPath, 'utf8');

if (!customDropdownContent.includes('useSelector')) {
  customDropdownContent = customDropdownContent.replace(/import React, \{ useState, useRef, useEffect \} from "react";/g, 'import React, { useState, useRef, useEffect } from "react";\nimport { useSelector } from "react-redux";');
  
  customDropdownContent = customDropdownContent.replace(/const CustomDropdown = \(\{([\s\S]*?)\}\) => \{/g, 'const CustomDropdown = ({$1}) => {\n  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? true);');
  
  customDropdownContent = customDropdownContent.replace(/className=\{`mt-2 cursor-pointer border border-gray-300 rounded-lg py-2 px-5 flex items-center justify-between \$\{[\s\S]*?disabled \? "bg-gray-100" : "bg-white"[\s\S]*?\}`\}/g, 
    'className={`mt-2 cursor-pointer rounded-lg py-2 px-5 flex items-center justify-between ${disabled ? (isDarkMode ? "bg-gray-800" : "bg-gray-100") : (isDarkMode ? "bg-[#161929] border-[rgba(255,255,255,0.07)]" : "bg-white border-gray-300")} `}');

  customDropdownContent = customDropdownContent.replace(/className=\{value \? "text-black" : "text-gray-400"\}/g, 'className={value ? (isDarkMode ? "text-[#E3E8F3]" : "text-black") : "text-gray-400"}');

  customDropdownContent = customDropdownContent.replace(/className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-60 overflow-auto"/g, 
    'className={`absolute z-10 mt-1 w-full rounded-lg max-h-60 overflow-auto ${isDarkMode ? "bg-[#161929] border-[rgba(255,255,255,0.07)]" : "bg-white border-gray-300"}`}');

  customDropdownContent = customDropdownContent.replace(/className="cursor-pointer px-5 py-2 hover:bg-gray-200"/g, 
    'className={`cursor-pointer px-5 py-2 ${isDarkMode ? "hover:bg-gray-800 text-[#E3E8F3]" : "hover:bg-gray-200"}`}');

  fs.writeFileSync(customDropdownPath, customDropdownContent);
}


// 3. ChartDropdown.jsx
const chartDropdownPath = path.join(baseDir, 'dashBoard', 'ChartDropdown.jsx');
if (fs.existsSync(chartDropdownPath)) {
  let chartContent = fs.readFileSync(chartDropdownPath, 'utf8');
  if (!chartContent.includes('useSelector')) {
    chartContent = chartContent.replace(/import React, \{ useEffect, useRef, useState \} from "react";/g, 'import React, { useEffect, useRef, useState } from "react";\nimport { useSelector } from "react-redux";');
    chartContent = chartContent.replace(/import \{ C \} from "\.\.\/\.\.\/utils\/constants";/g, 'import { C, C_LIGHT } from "../../utils/constants";');
    
    chartContent = chartContent.replace(/export function ChartDropdown\(\{ value, options, onChange \}\) \{/g, 'export function ChartDropdown({ value, options, onChange }) {\n  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? true);\n  const themeC = isDarkMode ? C : C_LIGHT;');
    
    chartContent = chartContent.replace(/background: open \? "rgba\\(255,255,255,0\.1\\)" : "rgba\\(255,255,255,0\.05\\)",/g, 'background: open ? (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") : (isDarkMode ? "rgba(255,255,255,0.05)" : "transparent"),');
    chartContent = chartContent.replace(/border: \`1px solid \$\{open \? "rgba\\(255,255,255,0\.18\\)" : "rgba\\(255,255,255,0\.1\\)"\}\`,/g, 'border: `1px solid ${open ? (isDarkMode ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)") : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`,');
    chartContent = chartContent.replace(/C\.([a-zA-Z]+)/g, 'themeC.$1');
    chartContent = chartContent.replace(/background: "#1a1d28",/g, 'background: themeC.card,');
    chartContent = chartContent.replace(/border: "1px solid rgba\\(255,255,255,0\.12\\)",/g, 'border: `1px solid ${themeC.border}`,');
    chartContent = chartContent.replace(/color: opt === value \? "#7EB3FF" : themeC\.text,/g, 'color: opt === value ? themeC.blue : themeC.text,');
    chartContent = chartContent.replace(/e\.currentTarget\.style\.background = "rgba\\(255,255,255,0\.04\\)";/g, 'e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";');

    fs.writeFileSync(chartDropdownPath, chartContent);
  }
}

// 4. ConfirmationModel.jsx
const confirmPath = path.join(baseDir, 'onboarding', 'ConfirmationModel.jsx');
if (fs.existsSync(confirmPath)) {
  let confirmContent = fs.readFileSync(confirmPath, 'utf8');
  if (!confirmContent.includes('useSelector')) {
    confirmContent = confirmContent.replace(/import \{ motion \} from "motion\/react";/g, 'import { motion } from "motion/react";\nimport { useSelector } from "react-redux";\nimport { C, C_LIGHT } from "../../utils/constants";');
    
    confirmContent = confirmContent.replace(/export function ConfirmationModal\(\{ session, onConfirm, onBack \}\) \{/g, 'export function ConfirmationModal({ session, onConfirm, onBack }) {\n  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? true);\n  const themeC = isDarkMode ? C : C_LIGHT;');
    
    confirmContent = confirmContent.replace(/background: "#161B2E",/g, 'background: themeC.card,');
    confirmContent = confirmContent.replace(/border: "1px solid rgba\\(255,255,255,0\.1\\)",/g, 'border: `1px solid ${themeC.border}`,');
    confirmContent = confirmContent.replace(/background: "rgba\\(255,255,255,0\.06\\)",/g, 'background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",');
    confirmContent = confirmContent.replace(/border: "1px solid rgba\\(255,255,255,0\.08\\)",/g, 'border: `1px solid ${themeC.borderSoft}`,');
    confirmContent = confirmContent.replace(/color: "#9CA3AF",/g, 'color: themeC.textSub,');
    confirmContent = confirmContent.replace(/color: "#F1F5F9",/g, 'color: themeC.text,');
    confirmContent = confirmContent.replace(/color: "#CBD5E1",/g, 'color: themeC.sub,');
    confirmContent = confirmContent.replace(/color: "#94A3B8",/g, 'color: themeC.textMuted,');
    confirmContent = confirmContent.replace(/border: "1px solid rgba\\(255,255,255,0\.1\\)",/g, 'border: `1px solid ${themeC.border}`,');
    confirmContent = confirmContent.replace(/background: "rgba\\(255,255,255,0\.1\\)"/g, 'background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"');
    confirmContent = confirmContent.replace(/color = "#CBD5E1"/g, 'color = themeC.sub');
    confirmContent = confirmContent.replace(/color = "#94A3B8"/g, 'color = themeC.textMuted');

    fs.writeFileSync(confirmPath, confirmContent);
  }
}

console.log("Refactoring complete");
