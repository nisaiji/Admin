import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  GraduationCap,
} from "lucide-react";

import { getTH } from "./constants";
import { useTCTheme } from "./ThemeContext";
import {
  AvatarBadge,
  CertificateSheet,
  ModalShell,
  StatCard,
  TableEmptyState,
  Toolbar,
} from "./shared";
import {
  getClassName,
  getClassSectionLabel,
  getConductTone,
  isApprovedByParentTcRequest,
  mapTcRequestForDisplay,
} from "./utils";
import { showToast } from "../../services/toastService";

const A4_PAGE_WIDTH = 794;
const A4_PAGE_HEIGHT = 1123;

function getCertificateItems(record) {
  return [
    ["Student Name", record?.name],
    ["Parent's Name", record?.mainParentFullName],
    ["Class & Section", getClassSectionLabel(record)],
    ["Date of Birth", record?.dob],
    ["Gender", record?.gender],
    ["Reason for Leaving", record?.reason],
    ["Conduct", record?.conduct],
    ["Promotion Status", record?.promotionStatus],
    ["Fee Status", "Cleared"],
    ["TC Number", record?.certificateNumber],
    ["TC Issue Date", record?.tcDate],
    ["Issued By", record?.issuedBy || "Administrator"],
  ];
}

async function downloadStudentTcPdf(node, fileName) {
  if (!node) {
    throw new Error("Certificate content is not available");
  }

  const canvas = await html2canvas(node, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    width: A4_PAGE_WIDTH,
    height: A4_PAGE_HEIGHT,
    windowWidth: A4_PAGE_WIDTH,
    windowHeight: A4_PAGE_HEIGHT,
  });
  const image = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.addImage(image, "PNG", 0, 0, 210, 297, undefined, "FAST");
  pdf.save(fileName);
}

function PrintableTcPage({ record, printableRef }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const certificateItems = getCertificateItems(record);

  return (
    <div
      ref={printableRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: "-10000px",
        top: 0,
        width: A4_PAGE_WIDTH,
        height: A4_PAGE_HEIGHT,
        background: "#ffffff",
        color: "#111827",
        boxSizing: "border-box",
        padding: "44px 46px",
      }}
    >
      <div
        style={{
          height: "100%",
          border: "1px solid #d4dbe5",
          boxSizing: "border-box",
          padding: "34px 38px 30px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            paddingBottom: 22,
            borderBottom: "2px solid #dbe4f0",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "0.03em",
              }}
            >
              Indira Public School
            </div>
            <div style={{ fontSize: "12px", color: "#475569", marginTop: 6 }}>
              Affiliated - Est. 1990
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: 4 }}>
              Official Transfer Certificate
            </div>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "14px",
              background: "#eef6ff",
              border: "1px solid #bfdbfe",
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#1d4ed8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              TC Number
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#0f172a",
                marginTop: 3,
              }}
            >
              {record?.certificateNumber || "-"}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#2563eb",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Transfer Certificate
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#0f172a",
              marginTop: 8,
            }}
          >
            Student Leaving Certificate
          </div>
          <div
            style={{
              fontSize: "13px",
              lineHeight: 1.7,
              color: "#475569",
              marginTop: 14,
              padding: "0 18px",
            }}
          >
            This is to certify that the following student was enrolled in this
            institution and the details below are issued as part of the official
            transfer certificate record.
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <CheckCircle2 size={18} color="#15803d" />
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}
            >
              TC Successfully Issued
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
            Issued On: {record?.tcDate || "-"}
          </span>
        </div>

        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 28,
            rowGap: 0,
            flex: 1,
            alignContent: "start",
          }}
        >
          {certificateItems.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                padding: "12px 0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {label}
              </span>
              <span
                style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}
              >
                {value || "-"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 26 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 22,
            }}
          >
            {["Class Teacher", "Principal", "Administrator"].map((label) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{ borderTop: "1px solid #94a3b8", marginBottom: 9 }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlumniRecordRow({ record, index, onView }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const conductTone = getConductTone(record?.conduct);

  return (
    <tr
      style={{
        background: C.row,
        borderBottom: `1px solid ${C.borderSoft}`,
        cursor: "pointer",
        transition: "background 0.14s",
      }}
      onClick={() => onView(record)}
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
        {index + 1}
      </td>
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarBadge id={record?.id} label={record?.name} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
              {record?.name}
            </div>
            <div style={{ fontSize: "11px", color: C.muted }}>
              {record?.gender} - DOB: {record?.dob}
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
            {record?.className ?? ""} {record?.sectionName || "-"}
          </span>
        </div>
      </td>
      <td style={{ padding: "13px 18px" }}>
        <span
          style={{
            fontSize: "13px",
            fontFamily: "monospace",
            color: C.green,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            background: C.greenDim,
            border: "1px solid rgba(76,188,154,0.2)",
          }}
        >
          {record?.certificateNumber}
        </span>
      </td>
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={12} color={C.muted} />
          <span style={{ fontSize: "13px", color: C.sub }}>
            {record?.tcDate}
          </span>
        </div>
      </td>
      <td style={{ padding: "13px 18px", fontSize: "13px", color: C.sub }}>
        {record?.reason}
      </td>
      <td style={{ padding: "13px 18px" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 999,
            background: conductTone.background,
            color: conductTone.color,
          }}
        >
          {record?.conduct}
        </span>
      </td>
      <td style={{ padding: "13px 18px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 999,
            background: conductTone.background,
            color: conductTone.color,
          }}
        >
          certificate Issued
        </span>
      </td>
      <td style={{ padding: "13px 18px", textAlign: "center" }}>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onView(record);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 14px",
            borderRadius: "8px",
            background: C.purpleDim,
            border: "1px solid rgba(255,255,255,0.12)",
            color: C.purple,
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "opacity 0.15s",
            width: 100,
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.opacity = "1";
          }}
        >
          <Eye size={12} /> View TC
        </button>
      </td>
    </tr>
  );
}

function IssuedTCModal({ record, onClose }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const printableRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const certificateItems = useMemo(() => getCertificateItems(record), [record]);

  async function handleDownload() {
    if (!record || downloading) {
      return;
    }

    try {
      setDownloading(true);
      const safeName = (record?.name || "student").replace(/[^a-z0-9]+/gi, "");
      const safeTcNumber = (record?.certificateNumber || "StudentTC").replace(
        /[^a-z0-9]+/gi,
        "",
      );

      await downloadStudentTcPdf(
        printableRef.current,
        `${safeTcNumber}_${safeName}.pdf`,
      );
    } catch (error) {
      showToast.error(error?.message || "Failed to download TC PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AnimatePresence>
      {record ? (
        <ModalShell
          onClose={onClose}
          maxWidth={540}
          header={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BadgeCheck size={18} color={C.green} />
              <span
                style={{ fontSize: "16px", fontWeight: 700, color: C.text }}
              >
                Issued TC
              </span>
            </div>
          }
          footer={
            <>
              <button
                onClick={onClose}
                style={{
                  padding: "9px 20px",
                  borderRadius: "9px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 24px",
                  borderRadius: "9px",
                  background: C.blue,
                  border: "none",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: downloading ? "not-allowed" : "pointer",
                  opacity: downloading ? 0.7 : 1,
                }}
              >
                <Download size={14} />{" "}
                {downloading ? "Downloading..." : "Download TC"}
              </button>
            </>
          }
        >
          <CertificateSheet
            items={certificateItems}
            banner={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: 20,
                  background: C.greenDim,
                  border: "1px solid rgba(76,188,154,0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={16} color={C.green} />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: C.green,
                    }}
                  >
                    TC Successfully Issued
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: C.green,
                    fontFamily: "monospace",
                  }}
                >
                  {record?.certificateNumber}
                </span>
              </div>
            }
            lineWidth={72}
          />
          <PrintableTcPage record={record} printableRef={printableRef} />
        </ModalShell>
      ) : null}
    </AnimatePresence>
  );
}

export function AlumniStep({ tcRequests = [], loading = false }) {
  const C = useTCTheme();
  const TH = typeof getTH !== "undefined" ? getTH(C) : {};
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterSec, setFilterSec] = useState("All");
  const [viewRecord, setViewRecord] = useState(null);

  const approvedRecords = useMemo(
    () =>
      (tcRequests || [])
        .filter(isApprovedByParentTcRequest)
        .map(mapTcRequestForDisplay),
    [tcRequests],
  );
  const classOptions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          approvedRecords.map((record) => getClassName(record)).filter(Boolean),
        ),
      ),
    ],
    [approvedRecords],
  );
  const sectionOptions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          approvedRecords
            .map((record) => record?.sectionName || record?.section)
            .filter(Boolean),
        ),
      ),
    ],
    [approvedRecords],
  );
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const thisYearCount = approvedRecords.filter(
    (record) =>
      record?.issuedYear === currentYear ||
      record?.tcDate?.includes(String(currentYear)),
  ).length;
  const lastYearCount = approvedRecords.filter(
    (record) =>
      record?.issuedYear === lastYear ||
      record?.tcDate?.includes(String(lastYear)),
  ).length;
  const passedOutCount = approvedRecords.filter(
    (record) => record?.promoStatus === "Passed Out",
  ).length;

  const filtered = useMemo(() => {
    const query = search.toLowerCase();

    return approvedRecords.filter((record) => {
      const matchesQuery =
        !query ||
        record?.name?.toLowerCase().includes(query) ||
        record?.mainParentFullName?.toLowerCase().includes(query) ||
        record?.admissionNumber?.toLowerCase().includes(query) ||
        record?.certificateNumber?.toLowerCase().includes(query) ||
        record?.reason?.toLowerCase().includes(query);
      const matchesClass =
        filterClass === "All" || getClassName(record) === filterClass;
      const matchesSection =
        filterSec === "All" ||
        record?.sectionName === filterSec ||
        record?.section === filterSec;

      return matchesQuery && matchesClass && matchesSection;
    });
  }, [filterClass, filterSec, approvedRecords, search]);

  return (
    <div style={{ padding: "28px 28px 60px" }}>
      <div style={{ maxWidth: 1384, margin: "0 auto" }}>
        {/* <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard
            label="Approved Requests"
            value={approvedRecords.length}
            color={C.blue}
            bg={C.blueDim}
            icon={<GraduationCap size={18} color={C.blue} />}
          />
          <StatCard
            label={`This Year (${currentYear})`}
            value={thisYearCount}
            color={C.green}
            bg={C.greenDim}
            icon={<GraduationCap size={18} color={C.green} />}
          />
          <StatCard
            label={`Last Year (${lastYear})`}
            value={lastYearCount}
            color={C.amber}
            bg={C.amberDim}
            icon={<GraduationCap size={18} color={C.amber} />}
          />
          <StatCard
            label="Passed Out"
            value={passedOutCount}
            color={C.purple}
            bg={C.purpleDim}
            icon={<GraduationCap size={18} color={C.purple} />}
          />
        </div> */}

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: "14px",
            overflow: "visible",
          }}
        >
          <Toolbar
            search={search}
            setSearch={setSearch}
            filterClass={filterClass}
            setFilterClass={setFilterClass}
            filterSec={filterSec}
            setFilterSec={setFilterSec}
            count={filtered.length}
            countLabel={`record${filtered.length !== 1 ? "s" : ""} found`}
            placeholder="Search by student, parent, admission no, or TC number..."
            classOptions={classOptions}
            sectionOptions={sectionOptions}
          />

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...TH, width: 48, textAlign: "center" }}>#</th>
                  <th style={TH}>Student</th>
                  <th style={TH}>Class</th>
                  <th style={TH}>TC Number</th>
                  <th style={TH}>TC Date</th>
                  <th style={TH}>Reason</th>
                  <th style={TH}>Conduct</th>
                  <th style={TH}>Status</th>
                  <th style={{ ...TH, textAlign: "center", width: 120 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ padding: "56px", textAlign: "center" }}
                    >
                      <div style={{ fontSize: "14px", color: C.muted }}>
                        Loading issued TCs...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <TableEmptyState
                    icon={GraduationCap}
                    message="No issued TC records match your filters"
                    colSpan={9}
                  />
                ) : (
                  filtered.map((record, index) => (
                    <AlumniRecordRow
                      key={record?.id}
                      record={record}
                      index={index}
                      onView={setViewRecord}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <IssuedTCModal
          record={viewRecord}
          onClose={() => setViewRecord(null)}
        />
      </div>
    </div>
  );
}
