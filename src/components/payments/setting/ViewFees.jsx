import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye } from "lucide-react";
import svgPaths from "./svg.jsx";
import { axiosClient } from "../../../services/axiosClient.js";
import EndPoints from "../../../services/EndPoints.js";
import {
  setClassAndSectionData,
  setTempData,
} from "../../../store/AppAuthSlice.js";
import moment from "moment";
import FeeInfo from "./FeeInfo.jsx";
import view from "../../../assets/images/fees/view.png";
import edit from "../../../assets/images/fees/edit.png";
import { showToast } from "../../../services/toastService.js";

function IconSearch() {
  return (
    <svg
      className="size-[18px] shrink-0"
      fill="none"
      viewBox="0 0 18.006 18.006"
    >
      <path d={svgPaths.p2e7aad00} fill="#6E6E6E" />
    </svg>
  );
}

function IconChevronDown({ color = "#686868" }) {
  return (
    <svg className="size-[16px] shrink-0" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p22c96af0} fill={color} />
    </svg>
  );
}

function IconChevronSmall() {
  return (
    <svg className="size-[10px]" fill="none" viewBox="0 0 11.333 6.667">
      <path
        d={svgPaths.p2f39e800}
        stroke="#0F0F0F"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg className="size-[22px] shrink-0" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p1fff9400} fill="#0F0F0F" />
    </svg>
  );
}

function IconFeeSetup() {
  return (
    <svg className="size-[22px] shrink-0" fill="none" viewBox="0 0 24 24">
      <path
        d={svgPaths.p26719e70}
        fill="#0F4189"
        stroke="#0F4189"
        strokeWidth="0.8"
      />
      <path
        d={svgPaths.p375baa40}
        fill="#0F4189"
        stroke="#0F4189"
        strokeWidth="0.8"
      />
      <path
        d={svgPaths.p224ce680}
        fill="#0F4189"
        stroke="#0F4189"
        strokeWidth="0.8"
      />
      <path
        d={svgPaths.p224b1400}
        fill="white"
        stroke="#103F5F"
        strokeWidth="0.2"
      />
    </svg>
  );
}

function IconCollections() {
  return (
    <svg className="size-[22px] shrink-0" fill="none" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d={svgPaths.p1c7a5700}
        fill="#0F0F0F"
        fillRule="evenodd"
      />
    </svg>
  );
}

function IconLookups() {
  return (
    <svg className="size-[22px] shrink-0" fill="none" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d={svgPaths.p28ec7b80}
        fill="#0F0F0F"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d={svgPaths.p36fed730}
        fill="#0F0F0F"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d={svgPaths.p355e7600}
        fill="#0F0F0F"
        fillRule="evenodd"
      />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="size-[18px] shrink-0" fill="none" viewBox="0 0 20 20">
      <path d="M0 20L20 20L20 0L0 0L0 20Z" fill="white" opacity="0" />
      <path d={svgPaths.p13533d00} fill="white" />
    </svg>
  );
}

function IconLoudspeaker() {
  return (
    <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
      <path d={svgPaths.p138799c0} fill="#0F0F0F" />
      <path d={svgPaths.p378b2700} fill="#0F0F0F" />
    </svg>
  );
}

function IconMoney() {
  return (
    <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
      <path d={svgPaths.p1179daf0} fill="#FF793F" />
      <path d={svgPaths.p1858b800} fill="#FF793F" />
      <path d={svgPaths.p3669cf00} fill="#FF793F" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="size-[32px]" fill="none" viewBox="0 0 32 32">
      <path
        clipRule="evenodd"
        d={svgPaths.p90d5400}
        fill="#0F0F0F"
        fillRule="evenodd"
      />
    </svg>
  );
}

function IconReindeer() {
  return (
    <svg className="h-[36px] w-[32px] shrink-0" fill="none" viewBox="0 0 35 40">
      <path d={svgPaths.p13693400} fill="#FF793F" />
    </svg>
  );
}

function DropdownSelect({ label, theme }) {
  return (
    <div
      className={`relative flex items-center gap-3 ${theme.inputBg} border ${theme.border} rounded-[8px] px-3 py-[9px] cursor-pointer select-none`}
    >
      <span
        className={`text-[13px] font-normal font-['Inter',sans-serif] ${theme.inputText} whitespace-nowrap`}
      >
        {label}
      </span>
      <IconChevronDown />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  disabled = false,
  onClick,
  theme,
  isDarkMode,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-[30px] items-center justify-center gap-2 rounded-[4px] border px-3 text-[12px] font-semibold transition-colors ${disabled ? "cursor-not-allowed " + theme.border + " " + theme.subText : "cursor-pointer " + theme.border + " " + theme.text + " " + (isDarkMode ? "hover:bg-[#1f2430]" : "hover:bg-gray-50")}`}
    >
      {icon}
      {label ? <span>{label}</span> : null}
    </button>
  );
}

function StatusBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center justify-center h-[28px] w-[68px] rounded-[6px] bg-[rgba(40,169,135,0.10)] text-[#28a987] text-[13px] font-medium font-['Inter',sans-serif]">
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center h-[28px] w-[68px] rounded-[6px] bg-[rgba(255,195,67,0.10)] text-[#ffa221] text-[13px] font-medium font-['Inter',sans-serif]">
      Draft
    </span>
  );
}

function formatDateTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function FeeStructureView({ setSelected }) {
  const isDarkMode = useSelector(
    (state) => state.appConfig?.isDarkMode ?? false,
  );
  const { classAndSectionData } = useSelector((state) => state.appAuth ?? {});
  const selectedSessionId = classAndSectionData?.selectedSession?._id;
  const selectedSessionName = classAndSectionData?.selectedSession?.name;
  const feeCycleData = classAndSectionData?.feeStructureData;
  const feeHeadData = classAndSectionData?.feeHeadData;
  const canCreateClassFeeStructure =
    feeCycleData?.isVerified && feeHeadData?.isVerified;

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [classFeeStructures, setClassFeeStructures] = useState([]);
  const [feeInfoOpen, setFeeInfoOpen] = useState(false);
  const [feeInfoLoading, setFeeInfoLoading] = useState(false);
  const [feeInfoError, setFeeInfoError] = useState("");
  const [feeInfoData, setFeeInfoData] = useState(null);
  // const [feeStructureData, setFeeStructureData] = useState(null);

  const feeHeads = Array.isArray(feeHeadData)
    ? feeHeadData
    : feeHeadData?.feeHeads || [];

  const closeFeeInfo = () => {
    setFeeInfoOpen(false);
    setFeeInfoLoading(false);
    setFeeInfoError("");
    setFeeInfoData(null);
  };

  const openFeeSetup = async (mode) => {
    localStorage.setItem("selectedFeeSetupMode", mode);
    await dispatch(
      setTempData({
        selectedFeeSetupMode: mode,
        selectedClassFeeStructure: null,
        selectedClassFeeStructureId: "",
      }),
    );
    setSelected("schoolFeeSetting");
  };

  const openClassFeeStructure = async (row) => {
    if (row?.status === "ACTIVE") {
      showToast.error("Verified class fee structures cannot be updated.");
      return;
    }

    const feeStructureId = getClassFeeStructureId(row);

    if (!feeStructureId) {
      showToast.error("Fee structure details are unavailable.");
      return;
    }

    try {
      const response = await axiosClient.get(
        `${EndPoints.ADMIN.GET_SINGLE_CLASS_FEES_STRUCTURE}/${feeStructureId}`,
      );

      const record = response?.result?.feeStructure || response?.result?.feeStructureData || response?.result;

      if (!record) {
        throw new Error("Fee structure details are unavailable.");
      }

      const selectedClassFeeStructure = {
        ...(row?.raw || row || {}),
        ...record,
      };

      localStorage.setItem("selectedFeeSetupMode", "class");

      await dispatch(
        setTempData({
          selectedFeeSetupMode: "class",
          selectedClassFeeStructure,
          selectedClassFeeStructureId: feeStructureId,
        }),
      );
      setSelected("feeStructureSetup");
    } catch (e) {
      showToast.error(
        e?.response?.data?.message || e?.message || "Failed to load fee structure details.",
      );
    }
  };

  const getClassFeeStructureId = (row) => {
    return (
      row?._id ||
      row?.id ||
      row?.feeStructureId ||
      row?.raw?._id ||
      row?.raw?.id ||
      row?.raw?.feeStructureId ||
      ""
    );
  };

  const openFeeInfo = async (row) => {
    // console.log(row);

    const feeStructureId = row?._id;

    if (!feeStructureId) {
      showToast.error("Fee structure details are unavailable.");
      return;
    }

    setFeeInfoOpen(true);
    setFeeInfoLoading(true);

    try {
      const response = await axiosClient.get(
        `${EndPoints.ADMIN.GET_SINGLE_CLASS_FEES_STRUCTURE}/${feeStructureId}`,
      );
      // console.log(response);

      const record = response?.result?.feeStructure;

      setFeeInfoData(record);
    } catch (e) {
      showToast.error(e);
    } finally {
      setFeeInfoLoading(false);
    }
  };

  const theme = {
    bg: isDarkMode ? "bg-[#0B0D14]" : "bg-[#f8fafc]",
    surface: isDarkMode ? "bg-[#111315]" : "bg-white",
    card: isDarkMode ? "bg-[#181b24]" : "bg-white",
    border: isDarkMode ? "border-[#2a2d36]" : "border-[#e7e2e2]",
    text: isDarkMode ? "text-white" : "text-[#0f0f0f]",
    subText: isDarkMode ? "text-[#9ca3af]" : "text-[#686868]",
    inputBg: isDarkMode ? "bg-[#1f2430]" : "bg-[#f0f6f9]",
    inputText: isDarkMode ? "text-[#d1d5db]" : "text-[#0f0f0f]",
    tableHead: isDarkMode ? "bg-[#1a2233]" : "bg-[#f0f6f9]",
    primaryBtn: isDarkMode
      ? "bg-[#0a81d1] hover:bg-[#0970b8]"
      : "bg-[#0a81d1] hover:bg-[#0970b8]",
    outlineBtn: isDarkMode
      ? "border-[#38bdf8] text-[#38bdf8] hover:bg-[#0f172a]"
      : "border-[#0a81d1] text-[#0a81d1] hover:bg-blue-50",
  };

  const getSchoolFeeStructure = async () => {
    if (!selectedSessionId) {
      setClassFeeStructures([]);
      return;
    }

    try {
      setLoading(true);

      const [feeStructureRes, feeHeadRes, classFeeRes] =
        await Promise.allSettled([
          axiosClient.get(
            `${EndPoints.ADMIN.GET_FEES_STRUCTURE_OF_SCHOOL}/${selectedSessionId}`,
          ),
          axiosClient.get(
            `${EndPoints.ADMIN.GET_FEES_HEAD_OF_SCHOOL}/${selectedSessionId}`,
          ),
          axiosClient.get(
            `${EndPoints.ADMIN.GET_CLASS_FEES_STRUCTURE}?sessionId=${selectedSessionId}`,
          ),
        ]);

      if (feeStructureRes?.status === "fulfilled") {
        dispatch(
          setClassAndSectionData({
            feeStructureData: feeStructureRes?.value?.result?.feeCycle ?? null,
          }),
        );
      } else {
        dispatch(setClassAndSectionData({ feeStructureData: null }));
        // log("Fee Structure API failed", feeStructureRes.reason);
      }

      if (feeHeadRes?.status === "fulfilled") {
        dispatch(
          setClassAndSectionData({
            feeHeadData: feeHeadRes?.value?.result?.feeHead ?? [],
          }),
        );
      } else {
        dispatch(setClassAndSectionData({ feeHeadData: [] }));
        // log("Fee Head API failed", feeHeadRes.reason);
      }

      if (classFeeRes?.status === "fulfilled") {
        setClassFeeStructures(classFeeRes?.value?.result?.feeStructures);
      } else {
        setClassFeeStructures([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSchoolFeeStructure();
  }, [selectedSessionId, selectedSessionName]);

  return (
    <div>
      <main className={` pt-[72px] min-h-screen ${theme.bg}`}>
        <div className="px-8 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className={`text-[20px] font-bold ${theme.text} leading-[1.3] mb-1`}
              >
                All Fee Structures
              </h1>
              <p className={`text-[13px] font-medium ${theme.subText}`}>
                View and manage all fee structures.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Unified Fee Setup Button */}
              <button
                onClick={() => openFeeSetup("all")}
                className="flex items-center gap-[6px] h-[42px] px-4 rounded-[6px] bg-[#0a81d1] text-[14px] font-bold text-white hover:bg-[#0970b8] transition-colors cursor-pointer"
              >
                <IconPlus />
                School Fee Setup
              </button>
              <button
                onClick={async () => {
                  if (!canCreateClassFeeStructure) {
                    showToast.error("Create fee cycle and fee heads first.");
                    return;
                  }

                  localStorage.setItem("selectedFeeSetupMode", "class");
                  await dispatch(
                    setTempData({
                      selectedFeeSetupMode: "class",
                      selectedClassFeeStructure: null,
                      selectedClassFeeStructureId: "",
                    }),
                  );
                  setSelected("feeStructureSetup");
                }}
                disabled={!canCreateClassFeeStructure}
                className={`flex items-center gap-[6px] h-[42px] px-4 rounded-[6px] text-[14px] font-bold text-white transition-colors ${canCreateClassFeeStructure ? "bg-[#0f4189] hover:bg-[#0c356d] cursor-pointer" : "bg-[#9ca3af] cursor-not-allowed"}`}
                title={
                  canCreateClassFeeStructure
                    ? "Create or update class fee structure"
                    : "Create fee cycle and fee heads first"
                }
              >
                <IconPlus />
                Class Fee Structure
              </button>
            </div>
          </div>

          {!canCreateClassFeeStructure ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Create and verify fee cycle and fee heads first to add a class fee
              structure.
            </div>
          ) : null}

          {/* Table card */}
          <div
            className={`${theme.card} border ${theme.border} rounded-[14px] overflow-hidden`}
          >
            {/* Filter bar */}
            <div
              className={`flex items-center gap-4 px-5 py-4 border-b ${theme.border}`}
            >
              {/* Search */}
              {/* <div
                className={`flex items-center gap-2.5 ${theme.inputBg} border ${theme.border} rounded-[8px] px-3 py-[9px] w-[280px]`}
              >
                <IconSearch />
                <span className={`text-[13px] font-normal ${theme.inputText}`}>
                  Search by class or academic year
                </span>
              </div>
              <DropdownSelect label="All Classes" theme={theme} />
              <DropdownSelect label="All Academic Years" theme={theme} />
              <DropdownSelect label="All Status" theme={theme} /> */}
            </div>

            {/* Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className={`${theme.tableHead} border-t border-l border-r ${theme.border}`}
                >
                  <th
                    className={`text-left pl-8 pr-2 py-4 text-[13px] font-semibold ${theme.text} w-[180px]`}
                  >
                    Class
                  </th>
                  <th
                    className={`text-center px-2 py-4 text-[13px] font-semibold ${theme.text} w-[160px]`}
                  >
                    Academic Year
                  </th>
                  <th
                    className={`text-center px-2 py-4 text-[13px] font-semibold ${theme.text} w-[140px]`}
                  >
                    Fee Cycle
                  </th>
                  <th
                    className={`text-center px-2 py-4 text-[13px] font-semibold ${theme.text} w-[210px]`}
                  >
                    Created
                  </th>
                  <th
                    className={`text-center px-2 py-4 text-[13px] font-semibold ${theme.text} w-[210px]`}
                  >
                    Last Updated
                  </th>
                  <th
                    className={`text-center px-2 py-4 text-[13px] font-semibold ${theme.text} w-[150px]`}
                  >
                    Status
                  </th>
                  <th
                    className={`text-center px-2 py-4 text-[13px] font-semibold ${theme.text} w-[140px]`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={`px-6 py-10 text-center text-sm ${theme.subText}`}
                    >
                      Loading class fee structures...
                    </td>
                  </tr>
                ) : classFeeStructures?.length ? (
                  classFeeStructures?.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${theme.border} ${idx === classFeeStructures?.length - 1 ? "border-b-0" : ""}`}
                    >
                      <td
                        className={`pl-8 pr-2 py-4 text-[13px] font-normal ${theme.text}`}
                      >
                        {row?.className}
                      </td>
                      <td
                        className={`text-center px-2 py-4 text-[13px] font-normal ${theme.text}`}
                      >
                        {row?.academicYear}
                      </td>
                      <td
                        className={`text-center px-2 py-4 text-[13px] font-normal ${theme.text}`}
                      >
                        {classAndSectionData?.feeStructureData?.frequency}
                      </td>
                      <td
                        className={`text-center px-2 py-4 text-[13px] font-normal ${theme.text}`}
                      >
                        {moment(row?.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td
                        className={`text-center px-2 py-4 text-[13px] font-normal ${theme.text}`}
                      >
                        {moment(row?.updatedAt).format("DD MMM YYYY")}
                      </td>
                      <td className="text-center px-2 py-4">
                        <div className="flex justify-center">
                          <StatusBadge verified={row?.status === "ACTIVE"} />
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton
                            icon={
                              <img
                                src={view}
                                alt="View"
                                className="size-[18px]"
                              />
                            }
                            // label="View"
                            onClick={() => openFeeInfo(row)}
                            theme={theme}
                            isDarkMode={isDarkMode}
                          />
                          <ActionButton
                            icon={
                              <img
                                src={edit}
                                alt="Edit"
                                className="size-[18px]"
                              />
                            }
                            // label={
                            //   row?.status === "ACTIVE" ? "Verified" : "Update"
                            // }
                            disabled={row?.status === "ACTIVE"}
                            onClick={() => openClassFeeStructure(row)}
                            theme={theme}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className={`px-6 py-10 text-center text-sm ${theme.subText}`}
                    >
                      No class fee structures found for this session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <FeeInfo
        open={feeInfoOpen}
        onClose={closeFeeInfo}
        data={feeInfoData}
        feeHeads={feeHeads}
        classAndSectionData={classAndSectionData}
        loading={feeInfoLoading}
        error={feeInfoError}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
