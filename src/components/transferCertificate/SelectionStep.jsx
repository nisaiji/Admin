import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Search, Users, X } from "lucide-react";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Stack,
} from "@mui/material";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { getTH } from "./constants";
import { useTCTheme } from "./ThemeContext";
import { AvatarBadge } from "./shared";
import { mapStudentForTc } from "./utils";

const getFilterSelectSx = (C) => ({

  minWidth: 120,
  backgroundColor: C.cardAlt,
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: `1px solid ${C.border}` },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(10,129,209,0.4)",
    borderWidth: 1,
  },
  "& .MuiInputBase-input": { color: C.text, fontSize: "13px", py: 1 },
  "& .MuiSvgIcon-root": { color: C.muted },

});

const getPaginationSelectSx = (C) => ({

  minWidth: 70,
  backgroundColor: "transparent",
  "& .MuiOutlinedInput-notchedOutline": { border: `1px solid ${C.border}` },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(10,129,209,0.4)",
    borderWidth: 1,
  },
  "& .MuiInputBase-input": { color: C.text, fontSize: "13px", py: 0.5 },
  "& .MuiSvgIcon-root": { color: C.muted },

});

const getSelectMenuSx = (C) => ({
  backgroundColor: C.card,
  color: C.text,
  border: `1px solid ${C.border}`,
});

function getErrorMessage(error, fallbackMessage) {
  if (typeof error === "string") {
    return error;
  }

  return error?.message || fallbackMessage;
}

function SelectionFilters({
  search,
  onSearchChange,
  filterClass,
  filterSec,
  classList,
  sectionList,
  totalStudentCount,
  onClear,
  onFilterClassChange,
  onFilterSectionChange,
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: `1px solid ${C.border}`,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 240,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderRadius: "9px",
          background: C.cardAlt,
          border: `1px solid ${C.border}`,
        }}
      >
        <Search size={14} color={C.muted} style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: C.text,
            fontSize: "13px",
            outline: "none",
          }}
        />
        {search ? (
          <button
            onClick={() => onSearchChange("")}
            style={{
              background: "transparent",
              border: "none",
              color: C.muted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      <FormControl size="small" sx={getFilterSelectSx(C)}>
        <Select
          value={filterClass}
          displayEmpty
          onChange={(event) => onFilterClassChange(event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: getSelectMenuSx(C),
            },
          }}
        >
          <MenuItem
            value=""
            sx={{ fontSize: "13px", backgroundColor: C.card, color: C.text }}
          >
            Class
          </MenuItem>
          {classList?.map((item) => (
            <MenuItem
              key={item?._id}
              value={item?._id}
              sx={{
                fontSize: "13px",
                backgroundColor: C.card,
                color: C.text,
                "&:hover": { backgroundColor: C.rowHov },
              }}
            >
              {item?.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={getFilterSelectSx(C)}>
        <Select
          value={filterSec}
          displayEmpty
          disabled={!filterClass}
          onChange={(event) => onFilterSectionChange(event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: getSelectMenuSx(C),
            },
          }}
        >
          <MenuItem
            value=""
            sx={{ fontSize: "13px", backgroundColor: C.card, color: C.text }}
          >
            Section
          </MenuItem>
          {sectionList.map((item) => (
            <MenuItem
              key={item?._id}
              value={item?._id}
              sx={{
                fontSize: "13px",
                backgroundColor: C.card,
                color: C.text,
                "&:hover": { backgroundColor: C.rowHov },
              }}
            >
              {item?.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filterClass || filterSec || search ? (
        <button
          onClick={onClear}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: "7px",
            background: C.orangeDim,
            border: "1px solid rgba(255,121,63,0.2)",
            color: C.orange,
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <X size={12} /> Reset
        </button>
      ) : null}

      <span style={{ marginLeft: "auto", fontSize: "12px", color: C.muted }}>
        {totalStudentCount} records
      </span>
    </div>
  );
}

function StudentRow({ student, index, pageNo, limit, onSelectStudent }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <tr
      style={{
        background: C.row,
        borderBottom: `1px solid ${C.borderSoft}`,
        transition: "background 0.14s",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = C.rowHov;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = C.row;
      }}
    >
      <td
        style={{
          padding: "13px 18px",
          textAlign: "center",
          fontSize: "12px",
          color: C.muted,
          fontWeight: 600,
        }}
      >
        {(pageNo - 1) * limit + index + 1}
      </td>
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarBadge
            id={student?._id || "student"}
            label={student?.firstName || "S"}
            size={36}
            fontSize={14}
          />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
              {student?.firstName} {student?.lastName}
            </div>
            <div style={{ fontSize: "11px", color: C.muted }}>
              {student?.gender || "-"}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "13px 18px" }}>
        <div
          style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}
        >
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: C.blueDim,
              color: C.blue,
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {student?.className ?? "Class"} {student?.sectionName ?? "Section"}
          </span>
        </div>
      </td>
      <td style={{ padding: "13px 18px", fontSize: "13px", color: C.sub }}>
        {student?.mainParentFullName || "-"}
      </td>
      <td style={{ padding: "13px 18px", fontSize: "13px", color: C.sub }}>
        {student?.parentPhone || "-"}
      </td>
      <td style={{ padding: "13px 18px", textAlign: "center" }}>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onSelectStudent(student);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 18px",
            borderRadius: "8px",
            background: C.blue,
            border: "none",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.opacity = "0.82";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.opacity = "1";
          }}
        >
          Generate TC <ChevronRight size={12} />
        </button>
      </td>
    </tr>
  );
}

function SelectionPaginationControls({
  limit,
  pageNo,
  totalStudentCount,
  onLimitChange,
  onPageChange,
}) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  return (
    <div
      style={{
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "13px", color: C.muted }}>Rows per page:</span>
        <FormControl size="small" sx={getPaginationSelectSx(C)}>
          <Select
            value={limit}
            onChange={(event) => onLimitChange(event.target.value)}
          MenuProps={{
            PaperProps: {
              sx: getSelectMenuSx(C),
            },
          }}
        >
            {[10, 20, 25, 50, 100].map((value) => (
              <MenuItem
                key={value}
                value={value}
                sx={{
                  fontSize: "13px",
                  backgroundColor: C.card,
                  color: C.text,
                  "&:hover": { backgroundColor: C.rowHov },
                }}
              >
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <Stack spacing={2}>
        <Pagination
          count={Math.ceil(totalStudentCount / limit)}
          page={pageNo}
          onChange={onPageChange}
          shape="rounded"
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                color: C.text,
                "&.Mui-selected": {
                  backgroundColor: C.blue,
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(10,129,209,0.8)" },
                },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
              }}
            />
          )}
        />
      </Stack>
    </div>
  );
}

export function SelectionStep({ onSelect }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSec, setFilterSec] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [studentList, setStudentList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedSessionId = useSelector(
    (state) => state.appAuth.classAndSectionData?.selectedSession?._id,
  );
  const debounceTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  const getClassList = useCallback(async () => {
    if (!selectedSessionId) {
      setClassList([]);
      return;
    }

    try {
      const response = await axiosClient.get(
        `${EndPoints.COMMON.CLASS_LIST}/${selectedSessionId}`,
      );
      const filteredSortedClasses = (response?.result || [])
        .filter((item) => item?.section?.length > 0)
        .sort((firstClass, secondClass) => {
          const classA =
            parseInt(firstClass?.name?.replace(/\D/g, ""), 10) || 0;
          const classB =
            parseInt(secondClass?.name?.replace(/\D/g, ""), 10) || 0;
          return classA - classB;
        });

      setClassList(filteredSortedClasses);
    } catch (error) {
      setClassList([]);
      toast.error(getErrorMessage(error, "Failed to fetch classes"));
    }
  }, [selectedSessionId]);

  const fetchStudents = useCallback(
    async ({
      page = pageNo,
      pageLimit = limit,
      searchName = debouncedSearch,
      searchClass = filterClass,
      searchSection = filterSec,
    } = {}) => {
      if (!selectedSessionId) {
        setStudentList([]);
        setTotalStudentCount(0);
        setLoading(false);
        return;
      }

      const query = new URLSearchParams({
        page: String(page),
        limit: String(pageLimit),
        session: selectedSessionId,
      });

      if (searchName) {
        query.set("search", searchName);
      }

      if (searchClass) {
        query.set("classId", searchClass);
      }

      if (searchSection) {
        query.set("section", searchSection);
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        setLoading(true);
        const response = await axiosClient.get(
          `${EndPoints.ADMIN.SEARCH_STUDENT}?${query.toString()}`,
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (response?.statusCode !== 200) {
          throw new Error(response?.message || "Failed to fetch students");
        }

        const { totalStudents, students } = response?.result || {};
        setTotalStudentCount(Number(totalStudents) || 0);
        setStudentList(Array.isArray(students) ? students : []);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setStudentList([]);
        setTotalStudentCount(0);
        toast.error(getErrorMessage(error, "Failed to fetch students"));
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [debouncedSearch, filterClass, filterSec, limit, pageNo, selectedSessionId],
  );

  useEffect(() => {
    if (!selectedSessionId) {
      setStudentList([]);
      setTotalStudentCount(0);
      setClassList([]);
      setSectionList([]);
      setLoading(false);
      return;
    }

    getClassList();
  }, [getClassList, selectedSessionId]);

  useEffect(() => {
    if (!filterClass) {
      setSectionList([]);

      if (filterSec) {
        setFilterSec("");
      }

      return;
    }

    const selectedClass = classList.find((item) => item?._id === filterClass);

    if (!selectedClass) {
      setFilterClass("");
      setFilterSec("");
      setSectionList([]);
      return;
    }

    const nextSections = Array.isArray(selectedClass?.section)
      ? selectedClass.section
      : [];
    setSectionList(nextSections);

    if (
      filterSec &&
      !nextSections.some((item) => item?._id === filterSec)
    ) {
      setFilterSec("");
    }
  }, [classList, filterClass, filterSec]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 1000);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalStudentCount / limit));

    if (totalStudentCount > 0 && pageNo > totalPages) {
      setPageNo(totalPages);
    }
  }, [limit, pageNo, totalStudentCount]);

  function handlePageChange(_event, value) {
    setPageNo(value);
  }

  function handleClear() {
    setSearch("");
    setDebouncedSearch("");
    setFilterClass("");
    setFilterSec("");
    setPageNo(1);
  }

  function handleSelectStudent(student) {
    onSelect(mapStudentForTc(student, classList, sectionList));
  }

  const emptyMessage = selectedSessionId
    ? "No students match your filters"
    : "Select an active session to load students";

  return (
    <div style={{ padding: "28px 28px 60px" }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: "22px",
            fontWeight: 700,
            color: C.text,
          }}
        >
          Select Student
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: C.muted }}>
          Search and select a student to begin the TC generation process
        </p>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          overflow: "visible",
        }}
      >
        <SelectionFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNo(1);
          }}
          filterClass={filterClass}
          filterSec={filterSec}
          classList={classList}
          sectionList={sectionList}
          totalStudentCount={totalStudentCount}
          onClear={handleClear}
          onFilterClassChange={(value) => {
            setFilterClass(value);
            setFilterSec("");
            setPageNo(1);
          }}
          onFilterSectionChange={(value) => {
            setFilterSec(value);
            setPageNo(1);
          }}
        />

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: 48, textAlign: "center" }}>#</th>
                <th style={TH}>Student</th>
                <th style={TH}>Class &amp; Sec</th>
                <th style={TH}>Parent Name</th>
                <th style={TH}>Phone</th>
                <th style={{ ...TH, textAlign: "center", width: 150 }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "56px", textAlign: "center" }}
                  >
                    <div style={{ fontSize: "14px", color: C.muted }}>
                      Loading students...
                    </div>
                  </td>
                </tr>
              ) : studentList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "56px", textAlign: "center" }}
                  >
                    <Users
                      size={28}
                      color={C.muted}
                      style={{ display: "block", margin: "0 auto 10px" }}
                    />
                    <div style={{ fontSize: "14px", color: C.muted }}>
                      {emptyMessage}
                    </div>
                  </td>
                </tr>
              ) : (
                studentList.map((student, index) => (
                  <StudentRow
                    key={student?._id}
                    student={student}
                    index={index}
                    pageNo={pageNo}
                    limit={limit}
                    onSelectStudent={handleSelectStudent}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalStudentCount > 0 ? (
          <SelectionPaginationControls
            limit={limit}
            pageNo={pageNo}
            totalStudentCount={totalStudentCount}
            onLimitChange={(value) => {
              setLimit(Number(value));
              setPageNo(1);
            }}
            onPageChange={handlePageChange}
          />
        ) : null}
      </div>
    </div>
  );
}
