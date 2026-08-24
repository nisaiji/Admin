import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Info,
  Plus,
  RefreshCw,
  Save,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import Breadcrumbs from "../BreadCrumbs";
import REGEX from "../../utils/regix";
import {
  SidebarTabs,
  StudentDetailSidebar,
  getAvatarClass,
  getDisplayValue,
  getFullName,
  getInitials,
  getStudentParentAddress,
  getStudentParentDob,
  getStudentParentEmail,
  getStudentParentGender,
  getStudentParentName,
  getStudentParentOccupation,
  getStudentParentPhone,
  getStudentParentQualification,
  getStudentRecordId,
  loadDetailedStudent,
} from "./studentInfoSidebar";
import { showToast } from "../../services/toastService";

const PAGE_LIMIT_OPTIONS = [10, 20, 25, 50, 100];
const CLASS_OPTION_KEYS = [
  "preNursery",
  "nursery",
  "LKG",
  "UKG",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getStoredFilter(key) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) ?? "";
}

function persistFilter(key, value) {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(key, value);
    return;
  }

  window.localStorage.removeItem(key);
}

function getClassSortValue(className, classOptions) {
  const translatedIndex = classOptions.indexOf(className);
  if (translatedIndex >= 0) return translatedIndex;

  const numericValue = Number.parseInt(
    String(className ?? "").replace(/\D/g, ""),
    10,
  );
  return Number.isNaN(numericValue) ? Number.MAX_SAFE_INTEGER : numericValue;
}

function buildVisiblePages(pageNo, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, pageNo - 1, pageNo, pageNo + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);
}

function getApiErrorMessage(error, fallback) {
  if (typeof error === "string") return error;
  return error?.message || error?.data?.message || fallback;
}

function capitalizeValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return normalized.replace(
    /\S+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

function normalizeStudentDraft(student) {
  return {
    id: getStudentRecordId(student),
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    aadharNumber: student?.aadharNumber ?? "",
    gender: student?.gender ?? "",
    bloodGroup: student?.bloodGroup ?? "",
    dob: student?.dob ?? "",
    address: student?.address ?? "",
    parentName: getStudentParentName(student),
    guardianName: student?.guardianName ?? "",
    phone: getStudentParentPhone(student),
    parentGender: getStudentParentGender(student),
    parentDob: student?.mainParentDob ?? "",
    parentEmail: getStudentParentEmail(student),
    parentQualification: getStudentParentQualification(student),
    parentOccupation: getStudentParentOccupation(student),
    parentAddress: getStudentParentAddress(student),
  };
}

function buildStudentUpdatePayload(draft) {
  const requiredValues = {
    firstName: capitalizeValue(draft?.firstName),
    lastName: capitalizeValue(draft?.lastName),
    aadharNumber: String(draft?.aadharNumber ?? "").trim(),
    gender: draft?.gender,
    // parentName: capitalizeValue(draft?.parentName),
    // guardianName: capitalizeValue(draft?.guardianName),
    // phone: String(draft?.phone ?? "").trim(),
  };

  const optionalValues = {
    bloodGroup: draft?.bloodGroup,
    dob: String(draft?.dob ?? "").trim(),
    address: capitalizeValue(draft?.address),
    // parentGender: draft?.parentGender,
    // parentDob: String(draft?.parentDob ?? "").trim(),
    // parentEmail: String(draft?.parentEmail ?? "")
    //   .trim()
    //   .toLowerCase(),
    // parentQualification: capitalizeValue(draft?.parentQualification),
    // parentOccupation: capitalizeValue(draft?.parentOccupation),
    // parentAddress: capitalizeValue(draft?.parentAddress),
  };

  return {
    ...requiredValues,
    ...Object.fromEntries(
      Object.entries(optionalValues).filter(([, value]) => value !== ""),
    ),
  };
}

function validateStudentDraft(draft, t) {
  if (
    !String(draft?.firstName ?? "").trim() ||
    String(draft?.firstName ?? "").trim().length < 3 ||
    REGEX.NUMBER.test(draft?.firstName)
  ) {
    return t("validationError.enterFirstName");
  }

  if (
    !String(draft?.lastName ?? "").trim() ||
    String(draft?.lastName ?? "").trim().length < 3 ||
    REGEX.NUMBER.test(draft?.lastName)
  ) {
    return t("validationError.enterLastName");
  }

  if (!String(draft?.aadharNumber ?? "").trim()) {
    return "Aadhaar number is required";
  }

  if (!/^\d{12}$/.test(String(draft?.aadharNumber ?? "").trim())) {
    return "Aadhaar must be exactly 12 digits";
  }

  if (!draft?.gender) {
    return t("validationError.gender");
  }

  // if (
  //   !String(draft?.parentName ?? "").trim() ||
  //   String(draft?.parentName ?? "").trim().length < 3 ||
  //   REGEX.NUMBER.test(draft?.parentName)
  // ) {
  //   return t("validationError.parentName");
  // }

  // if (
  //   !String(draft?.guardianName ?? "").trim() ||
  //   String(draft?.guardianName ?? "").trim().length < 3 ||
  //   REGEX.NUMBER.test(draft?.guardianName)
  // ) {
  //   return "Guardian name is required";
  // }

  // if (!String(draft?.phone ?? "").trim()) {
  //   return t("validationError.phone");
  // }

  // if (!REGEX.PHONE_LENGTH.test(String(draft?.phone ?? "").trim())) {
  //   return t("validationError.validationPhoneCount");
  // }

  // if (draft?.parentEmail && !REGEX.EMAIL.test(draft?.parentEmail)) {
  //   return t("validationError.emailAddress");
  // }

  return "";
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  options,
  error,
  isDarkMode,
}) {
  const inputClass = cn(
    "mt-2 h-10 w-full rounded-lg border px-3 text-sm outline-none transition",
    isDarkMode
      ? "border-white/10 bg-[#1a1d28] text-[#E3E8F3] focus:border-[#0A81D1]"
      : "border-borderWhite bg-whiteBackground text-textBlack focus:border-borderBlue",
    error && "border-[#FE4040] focus:border-[#FE4040]",
  );
  const optionStyle = isDarkMode
    ? { backgroundColor: "#1a1d28", color: "#E3E8F3" }
    : { backgroundColor: "#ffffff", color: "#0f172a" };

  return (
    <label className="mb-4 block text-xs font-poppins-bold uppercase text-slate-500">
      {label}
      {options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option} style={optionStyle}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          max={
            type === "date" ? new Date().toISOString().split("T")[0] : undefined
          }
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      {error ? (
        <span className="mt-1 block text-xs text-[#FE4040]">{error}</span>
      ) : null}
    </label>
  );
}

function StudentEditSidebar({
  student,
  isDarkMode,
  saving,
  onClose,
  onSave,
  t,
}) {
  const [draft, setDraft] = useState(() => normalizeStudentDraft(student));
  const [tab, setTab] = useState("personal");
  const [errorMessage, setErrorMessage] = useState("");
  const fullName = `${draft?.firstName} ${draft?.lastName}`.trim();
  const avatarClass = getAvatarClass(student, 0);
  const tabs = [{ key: "personal", label: "Personal", Icon: User }];

  function setField(field, value) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
    setErrorMessage("");
  }

  function handleSave() {
    const validationError = validateStudentDraft(draft, t);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    onSave(draft);
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        aria-label="Close edit student"
        className="flex-1 bg-black/65"
        onClick={onClose}
      />
      <aside
        data-testid="student-edit-sidebar"
        className={cn(
          "flex h-screen w-full max-w-[560px] flex-col border-l shadow-2xl",
          isDarkMode
            ? "border-white/10 bg-[#111315] text-[#E3E8F3]"
            : "border-borderWhite bg-whiteBackground text-textBlack",
        )}
      >
        <div
          className={cn(
            "sticky top-0 z-10 border-b px-6 pt-5",
            isDarkMode
              ? "border-white/10 bg-[#111315]"
              : "border-borderWhite bg-whiteBackground",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-poppins-bold text-white",
                  avatarClass,
                )}
              >
                {getInitials(draft)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-poppins-bold">
                  {fullName}
                </h2>
                <p className="text-xs text-slate-500">Editing student record</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg border transition",
                isDarkMode
                  ? "border-white/10 bg-white/[0.04] text-slate-500 hover:text-[#E3E8F3]"
                  : "border-borderWhite bg-whiteBackground2 text-textGray hover:text-textBlack",
              )}
            >
              <X size={16} />
            </button>
          </div>

          <SidebarTabs
            tabs={tabs}
            activeTab={tab}
            onChange={setTab}
            accentClass="text-[#FF793F]"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {errorMessage ? (
            <div className="mb-4 rounded-lg border border-[#FE4040]/30 bg-[#FE4040]/10 px-3 py-2 text-sm text-[#FE4040]">
              {errorMessage}
            </div>
          ) : null}

          {tab === "personal" ? (
            <>
              <p className="mb-4 text-sm text-slate-500">
                Update personal and contact information.
              </p>
              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <EditField
                  label="First Name"
                  value={draft?.firstName}
                  onChange={(value) => setField("firstName", value)}
                  isDarkMode={isDarkMode}
                />
                <EditField
                  label="Last Name"
                  value={draft?.lastName}
                  onChange={(value) => setField("lastName", value)}
                  isDarkMode={isDarkMode}
                />
                <EditField
                  label="Aadhar Number"
                  value={draft?.aadharNumber}
                  onChange={(value) => setField("aadharNumber", value)}
                  isDarkMode={isDarkMode}
                />
                <EditField
                  label="Gender"
                  value={draft?.gender}
                  onChange={(value) => setField("gender", value)}
                  options={["Male", "Female", "Other"]}
                  isDarkMode={isDarkMode}
                />
                <EditField
                  label="Blood Group"
                  value={draft?.bloodGroup}
                  onChange={(value) => setField("bloodGroup", value)}
                  options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
                  isDarkMode={isDarkMode}
                />
              </div>
              <EditField
                type="date"
                label="Date of Birth"
                value={draft?.dob}
                onChange={(value) => setField("dob", value)}
                isDarkMode={isDarkMode}
              />
              <EditField
                label="Address"
                value={draft?.address}
                onChange={(value) => setField("address", value)}
                isDarkMode={isDarkMode}
              />
            </>
          ) : null}
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-3 border-t px-6 py-4",
            isDarkMode
              ? "border-white/10 bg-[#111315]"
              : "border-borderWhite bg-whiteBackground",
          )}
        >
          <span className="text-xs text-slate-500">
            Save changes to the student
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-poppins-bold transition",
                isDarkMode
                  ? "border-white/10 text-slate-400 hover:bg-white/[0.04]"
                  : "border-borderWhite text-textGray hover:bg-whiteBackground2",
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF793F] px-5 py-2 text-sm font-poppins-bold text-white transition hover:bg-[#ff6b2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <RefreshCw size={15} /> : <Save size={15} />}
              {saving ? "Saving" : "Save Changes"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function Studentlist() {
  const { t } = useTranslation();
  const { classAndSectionData } = useSelector((state) => state.appAuth ?? {});
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode);
  const selectedSessionId = classAndSectionData?.selectedSession?._id;

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [studentList, setStudentList] = useState([]);
  const [detailStudent, setDetailStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [searchClass, setSearchClass] = useState(() =>
    getStoredFilter("searchClass"),
  );
  const [searchSection, setSearchSection] = useState(() =>
    getStoredFilter("searchSection"),
  );
  const [loading, setLoading] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestIdRef = useRef(0);

  const classOptions = useMemo(
    () => CLASS_OPTION_KEYS.map((key) => t(`options.${key}`)),
    [t],
  );

  const selectedClass = useMemo(
    () => classList.find((item) => item?._id === searchClass),
    [classList, searchClass],
  );

  const selectedSection = useMemo(
    () => sectionList.find((item) => item?._id === searchSection),
    [sectionList, searchSection],
  );

  const totalPages = Math.max(1, Math.ceil(totalStudentCount / limit) ?? 1);
  const visiblePages = useMemo(
    () => buildVisiblePages(pageNo, totalPages),
    [pageNo, totalPages],
  );
  const showingFrom = totalStudentCount === 0 ? 0 : (pageNo - 1) * limit + 1;
  const showingTo = Math.min(totalStudentCount, pageNo * limit);
  const activeFilterLabel = selectedSessionId
    ? `${selectedClass?.name ?? "All classes"} - ${
        selectedSection?.name ?? "All sections"
      }`
    : "No active session";

  const pageClass = isDarkMode
    ? "bg-[#0B0D14] text-[#E3E8F3]"
    : "bg-whiteBackground2 text-textBlack";
  const panelClass = isDarkMode
    ? "border-white/10 bg-[#111315]"
    : "border-borderWhite bg-whiteBackground";
  const headerClass = isDarkMode
    ? "border-white/[0.05] bg-white/[0.02]"
    : "border-borderWhite bg-whiteBackground1";
  const rowClass = isDarkMode
    ? "border-white/[0.04] hover:bg-[#0a81d1]/10"
    : "border-borderWhite hover:bg-backgroundLightBlue/40";
  const mutedClass = isDarkMode ? "text-slate-500" : "text-textGray";
  const bodyTextClass = isDarkMode ? "text-[#E3E8F3]" : "text-textBlack";
  const secondaryTextClass = isDarkMode ? "text-[#E3E8F3]/75" : "text-textGray";
  const iconButtonClass = isDarkMode
    ? "border-white/10 bg-white/[0.04] text-slate-500 hover:border-[#FF793F]/30 hover:bg-[#FF793F]/10 hover:text-[#FF793F]"
    : "border-borderWhite bg-whiteBackground text-textGray hover:border-borderOrange1 hover:bg-backgroundOrange2 hover:text-textOrange";
  const activeIconButtonClass = isDarkMode
    ? "border-[#0A81D1]/30 bg-[#0A81D1]/15 text-[#0A81D1] hover:bg-[#0A81D1]/25"
    : "border-borderBlue bg-backgroundBlue15 text-textBlue hover:bg-backgroundLightBlue";
  const controlClass = isDarkMode
    ? "bg-background2 border border-borderColor text-textPrimary focus:border-primaryBlue"
    : "bg-white border border-slate-200 text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const optionStyle = {
    backgroundColor: isDarkMode ? "#111827" : "#ffffff",
    color: isDarkMode ? "#f8fafc" : "#1e293b",
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    persistFilter("searchClass", searchClass);
  }, [searchClass]);

  useEffect(() => {
    persistFilter("searchSection", searchSection);
  }, [searchSection]);

  useEffect(() => {
    let isActive = true;

    async function loadClassList() {
      if (!selectedSessionId) {
        setClassList([]);
        setSectionList([]);
        return;
      }

      try {
        const response = await axiosClient.get(
          `${EndPoints.COMMON.CLASS_LIST}/${selectedSessionId}`,
        );
        const classes = Array.isArray(response?.result) ? response.result : [];
        const sortedClasses = classes
          .filter(
            (item) => Array.isArray(item?.section) && item.section.length > 0,
          )
          .sort((firstClass, secondClass) => {
            const firstValue = getClassSortValue(
              firstClass?.name,
              classOptions,
            );
            const secondValue = getClassSortValue(
              secondClass?.name,
              classOptions,
            );
            return firstValue - secondValue;
          });

        if (isActive) {
          setClassList(sortedClasses);
        }
      } catch (error) {
        if (isActive) {
          setClassList([]);
          showToast.error(getApiErrorMessage(error, "Failed to load classes"));
        }
      }
    }

    loadClassList();

    return () => {
      isActive = false;
    };
  }, [classOptions, selectedSessionId]);

  useEffect(() => {
    if (!searchClass) {
      setSectionList([]);
      if (searchSection) setSearchSection("");
      return;
    }

    const classData = classList.find((item) => item?._id === searchClass);

    if (!classData && classList.length > 0) {
      setSearchClass("");
      setSearchSection("");
      setSectionList([]);
      return;
    }

    const nextSections = Array.isArray(classData?.section)
      ? classData.section
      : [];
    setSectionList(nextSections);

    if (
      searchSection &&
      !nextSections.some((section) => section?._id === searchSection)
    ) {
      setSearchSection("");
    }
  }, [classList, searchClass, searchSection]);

  const fetchStudents = useCallback(
    async (overrides = {}) => {
      if (!selectedSessionId) {
        showToast.error("Please select Session");
        setStudentList([]);
        setTotalStudentCount(0);
        setErrorMessage("");
        setLoading(false);
        return;
      }

      const nextPage = overrides.page ?? pageNo;
      const nextLimit = overrides.limit ?? limit;
      const nextSearch = overrides.searchName ?? debouncedSearch;
      const nextSection = overrides.searchSection ?? searchSection;
      const query = new URLSearchParams({
        page: String(nextPage),
        limit: String(nextLimit),
        session: selectedSessionId,
      });

      if (nextSearch) query.set("search", nextSearch);
      if (nextSection) query.set("section", nextSection);

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await axiosClient.get(
          `${EndPoints.ADMIN.SEARCH_STUDENT}?${query.toString()}`,
        );

        if (requestId !== requestIdRef.current) return;

        if (response?.statusCode !== 200) {
          throw new Error(response?.message ?? "Failed to load students");
        }

        const students = Array.isArray(response?.result?.students)
          ? response.result.students
          : [];
        const totalStudents = Number(response?.result?.totalStudents);

        setStudentList(students);
        setTotalStudentCount(
          Number.isFinite(totalStudents) ? totalStudents : students.length,
        );
      } catch (error) {
        if (requestId !== requestIdRef.current) return;

        const message = getApiErrorMessage(error, "Failed to load students");
        setStudentList([]);
        setTotalStudentCount(0);
        setErrorMessage(message);
        showToast.error(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [debouncedSearch, limit, pageNo, searchSection, selectedSessionId],
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (totalStudentCount > 0 && pageNo > totalPages) {
      setPageNo(totalPages);
    }
  }, [pageNo, totalPages, totalStudentCount]);

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setPageNo(1);
  }

  function handleClassChange(event) {
    setSearchClass(event.target.value);
    setSearchSection("");
    setPageNo(1);
  }

  function handleSectionChange(event) {
    setSearchSection(event.target.value);
    setPageNo(1);
  }

  function handleLimitChange(event) {
    setLimit(Number(event.target.value));
    setPageNo(1);
  }

  function handleClear() {
    setSearchTerm("");
    setDebouncedSearch("");
    setSearchClass("");
    setSearchSection("");
    setPageNo(1);
  }

  async function handleShowInfo(student) {
    try {
      const detailedStudent = await loadDetailedStudent(student, "admin");
      setEditStudent(null);
      setDetailStudent(detailedStudent);
    } catch (error) {
      showToast.error(
        getApiErrorMessage(error, "Failed to load student details"),
      );
    }
  }

  async function handleEdit(student) {
    try {
      const detailedStudent = await loadDetailedStudent(student, "admin");
      setEditStudent(detailedStudent);
      setDetailStudent(null);
    } catch (error) {
      showToast.error(
        getApiErrorMessage(error, "Failed to load student details"),
      );
    }
  }

  async function handleSaveStudent(draft) {
    const studentId = draft?.id;

    if (!studentId) {
      showToast.error("Student id is missing");
      return;
    }

    try {
      setSavingStudent(true);
      // console.log(draft);

      const payload = buildStudentUpdatePayload(draft);
      const response = await axiosClient.put(
        `${EndPoints.ADMIN.STUDENT_UPDATE}/${studentId}`,
        payload,
      );

      if (response?.statusCode !== 200) {
        throw new Error(response?.message ?? "Failed to update student");
      }

      showToast.success(response?.result ?? "Student updated");
      setEditStudent(null);
      await fetchStudents();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, "Failed to update student"));
    } finally {
      setSavingStudent(false);
    }
  }

  const emptyTitle = !selectedSessionId
    ? "No active session selected"
    : errorMessage
      ? "Unable to load students"
      : "No students found";
  const emptyMessage = !selectedSessionId
    ? "Choose an academic session to load student records."
    : errorMessage || "Try changing the class, section, or search text.";

  const darkControlClass =
    "border-white/10 bg-[#1a1d28] text-[#E3E8F3] focus:border-[#0A81D1] focus:ring-1 focus:ring-[#0A81D1]";

  return (
    <div className={cn("min-h-[calc(100vh-72px)] p-6", pageClass)}>
      <Toaster />

      <div className="mx-auto w-full max-w-[1600px]">
        <Breadcrumbs />

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-poppins-bold text-current">
              Students
            </h1>
            <p className={cn("mt-1 text-sm", mutedClass)}>
              {activeFilterLabel} - {totalStudentCount} students
              {loading && studentList.length > 0 ? " - Refreshing" : ""}
            </p>
          </div>

          <Link
            to="/student-information-system/add-student"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FF793F] px-4 text-sm font-poppins-bold text-white transition hover:bg-[#ff6b2b] active:scale-95"
          >
            <Plus size={16} />
            Add Student
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[180px_180px_1fr_auto]">
          <label className="sr-only" htmlFor="student-class-filter">
            Class
          </label>
          <select
            id="student-class-filter"
            data-testid="classlist"
            value={searchClass}
            onChange={handleClassChange}
            className={cn(
              "h-12 rounded-lg px-4 text-sm font-poppins-regular outline-none transition",
              "disabled:cursor-not-allowed disabled:opacity-60",
              controlClass,
            )}
            disabled={!selectedSessionId || classList.length === 0}
          >
            <option value="" style={optionStyle}>
              All classes
            </option>
            {classList.map((item) => (
              <option key={item?._id} value={item?._id} style={optionStyle}>
                {getDisplayValue(item?.name)}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="student-section-filter">
            Section
          </label>
          <select
            id="student-section-filter"
            data-testid="sectionlist"
            value={searchSection}
            onChange={handleSectionChange}
            className={cn(
              "h-12 rounded-lg px-4 text-sm font-poppins-regular outline-none transition",
              "disabled:cursor-not-allowed disabled:opacity-60",
              controlClass,
            )}
            disabled={!searchClass || sectionList.length === 0}
          >
            <option value="" style={optionStyle}>
              {searchClass ? "All sections" : "Select class first"}
            </option>
            {sectionList.map((item) => (
              <option key={item?._id} value={item?._id} style={optionStyle}>
                {getDisplayValue(item?.name)}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search
              size={18}
              className={cn(
                "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2",
                mutedClass,
              )}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, email or phone..."
              className={cn(
                "h-12 w-full rounded-lg border py-3 pl-12 pr-11 text-sm outline-none transition",
                controlClass,
              )}
            />
            {searchTerm ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearch("");
                  setPageNo(1);
                }}
                className={cn(
                  "absolute right-3 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg transition",
                  isDarkMode
                    ? "text-slate-500 hover:bg-white/10"
                    : "text-textGray hover:bg-whiteBackground2",
                )}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
          {searchTerm || searchClass || searchSection ? (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-poppins-bold transition",
                controlClass,
              )}
            >
              <X size={16} />
              Clear
            </button>
          ) : null}
        </div>

        <section
          className={cn("overflow-hidden rounded-lg border", panelClass)}
        >
          <div
            className={cn(
              "flex items-center justify-between border-b px-5 py-4",
              headerClass,
            )}
          >
            <div>
              <h2 className={cn("text-sm font-poppins-bold", bodyTextClass)}>
                Student records
              </h2>
              <p className={cn("mt-1 text-xs", mutedClass)}>
                Showing {showingFrom}-{showingTo} from {totalStudentCount}{" "}
                students
              </p>
            </div>

            {errorMessage ? (
              <button
                type="button"
                onClick={() => fetchStudents()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#0A81D1]/40 px-3 py-2 text-xs font-poppins-bold text-[#0A81D1] transition hover:bg-[#0A81D1]/10"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className={cn("border-b", headerClass)}>
                  {[
                    "Student",
                    "Gender",
                    "Phone",
                    "Email",
                    "Blood",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={cn(
                        "px-5 py-3 text-left text-xs font-poppins-bold uppercase text-[#0A81D1]",
                        heading === "Action" && "text-right",
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && studentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className={cn("text-sm", mutedClass)}>
                        Loading students...
                      </div>
                    </td>
                  </tr>
                ) : studentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <Users
                        size={30}
                        className={cn("mx-auto mb-3", mutedClass)}
                      />
                      <p
                        className={cn(
                          "text-sm font-poppins-bold",
                          bodyTextClass,
                        )}
                      >
                        {emptyTitle}
                      </p>
                      <p className={cn("mt-1 text-xs", mutedClass)}>
                        {emptyMessage}
                      </p>
                    </td>
                  </tr>
                ) : (
                  studentList?.map((student, index) => {
                    const fullName = getFullName(student);

                    return (
                      <tr
                        key={index}
                        className={cn(
                          "border-b transition last:border-b-0",
                          index % 2 === 1 &&
                            (isDarkMode
                              ? "bg-white/[0.02]"
                              : "bg-whiteBackground1"),
                          rowClass,
                        )}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-poppins-bold text-white",
                                getAvatarClass(student, index),
                              )}
                            >
                              {getInitials(student)}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "truncate text-sm font-poppins-bold",
                                  bodyTextClass,
                                )}
                              >
                                {fullName}
                              </p>
                              <p
                                className={cn(
                                  "mt-1 truncate text-xs",
                                  mutedClass,
                                )}
                              >
                                Roll {getDisplayValue(student?.studentId)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          className={cn(
                            "px-5 py-4 text-sm",
                            secondaryTextClass,
                          )}
                        >
                          {getDisplayValue(student?.gender)}
                        </td>
                        <td
                          className={cn(
                            "px-5 py-4 text-sm",
                            secondaryTextClass,
                          )}
                        >
                          {getDisplayValue(getStudentParentPhone(student))}
                        </td>
                        <td
                          className={cn(
                            "px-5 py-4 text-sm",
                            secondaryTextClass,
                          )}
                        >
                          <span className="block max-w-[240px] truncate">
                            {getDisplayValue(getStudentParentEmail(student))}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-poppins-bold text-[#FE4040]">
                          {getDisplayValue(student?.bloodGroup)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Edit"
                              aria-label={`Edit ${fullName}`}
                              onClick={() => handleEdit(student)}
                              className={cn(
                                "inline-flex size-8 items-center justify-center rounded-lg border transition",
                                iconButtonClass,
                              )}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              title="Info"
                              aria-label={`Info ${fullName}`}
                              onClick={() => handleShowInfo(student)}
                              className={cn(
                                "inline-flex size-8 items-center justify-center rounded-lg border transition",
                                activeIconButtonClass,
                              )}
                            >
                              <Info size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalStudentCount > 0 ? (
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4",
                headerClass,
              )}
            >
              <label
                className={cn("flex items-center gap-2 text-sm", mutedClass)}
              >
                Rows
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className={cn(
                    "h-9 rounded-lg border px-3 text-sm outline-none",
                    controlClass,
                  )}
                >
                  {PAGE_LIMIT_OPTIONS.map((item) => (
                    <option key={item} value={item} style={optionStyle}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPageNo((currentPage) => Math.max(1, currentPage - 1))
                  }
                  disabled={pageNo === 1 || loading}
                  aria-label="Previous page"
                  className="inline-flex size-8 items-center justify-center rounded-full border border-[#0A81D1] text-[#0A81D1] transition hover:bg-[#0A81D1]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>

                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setPageNo(page)}
                    disabled={loading}
                    aria-label={`Page ${page}`}
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full border border-[#0A81D1] text-xs font-poppins-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                      page === pageNo
                        ? "bg-[#0A81D1] text-white"
                        : "text-[#0A81D1] hover:bg-[#0A81D1]/10",
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPageNo((currentPage) =>
                      Math.min(totalPages, currentPage + 1),
                    )
                  }
                  disabled={pageNo === totalPages || loading}
                  aria-label="Next page"
                  className="inline-flex size-8 items-center justify-center rounded-full border border-[#0A81D1] text-[#0A81D1] transition hover:bg-[#0A81D1]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {detailStudent && !editStudent ? (
        <StudentDetailSidebar
          student={detailStudent}
          isDarkMode={isDarkMode}
          onClose={() => setDetailStudent(null)}
          onEdit={() => handleEdit(detailStudent)}
        />
      ) : null}

      {editStudent ? (
        <StudentEditSidebar
          student={editStudent}
          isDarkMode={isDarkMode}
          saving={savingStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleSaveStudent}
          t={t}
        />
      ) : null}
    </div>
  );
}
