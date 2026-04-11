import React, { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Calendar, Clock, Eye } from "lucide-react";

import { C, TH } from "./constants";
import { AvatarBadge, DetailRows, ModalShell, TableEmptyState, Toolbar } from "./shared";
import { getPendingStatusTone, isPendingTcRequest, mapTcRequestForDisplay } from "./utils";

function PendingRequestRow({ record, index, onView }) {
  // console.log(record);
  
  const tone = getPendingStatusTone(record?.status);

  return (
    <tr
      style={{ background: C.row, borderBottom: `1px solid ${C.borderSoft}`, transition: "background 0.14s" }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = C.rowHov;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = C.row;
      }}
    >
      <td style={{ padding: "13px 18px", textAlign: "center", fontSize: "12px", color: C.muted, fontWeight: 600 }}>{index + 1}</td>
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarBadge id={record?.id} label={record?.name} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{record?.name}</div>
            <div style={{ fontSize: "11px", color: C.muted }}>{record?.parentFullName}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "13px 18px" }}>
        <span style={{ padding: "3px 10px", borderRadius: 999, background: C.blueDim, color: C.blue, fontSize: "12px", fontWeight: 700 }}>
          {record?.className} {record?.sectionName}
        </span>
      </td>
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={12} color={C.muted} />
          <span style={{ fontSize: "13px", color: C.sub }}>{record?.requestDate}</span>
        </div>
      </td>
      <td style={{ padding: "13px 18px", fontSize: "13px", color: C.sub }}>{record?.reason}</td>
      <td style={{ padding: "13px 18px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: tone.background, color: tone.color }}>
          Pending
        </span>
      </td>
      <td style={{ padding: "13px 18px", textAlign: "center" }}>
        <button
          onClick={() => onView(record)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 14px",
            borderRadius: "8px",
            background: C.blue,
            border: "none",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Eye size={12} /> View
        </button>
      </td>
    </tr>
  );
}

function PendingRequestModal({ record, onClose }) {
  if (!record) {
    return null;
  }

  return (
    <ModalShell
      onClose={onClose}
      maxWidth={560}
      header={<span style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>TC Request Details</span>}
      footer={
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
      }
    >
      <DetailRows
        items={[
          ["Student Name", record?.name],
          ["Parent's Name", record?.parentFullName],
          ["Admission Number", record?.admissionNumber],
          ["Class & Section", `${record?.className} - ${record?.sectionName}`],
          ["Request Date", record?.requestDate],
          ["Status", record?.statusLabel],
          ["Reason", record?.reasonLabel],
          ["Reason Description", record?.reasonDescription || "-"],
          ["Last Attendance Date", record?.lastAttendanceDate],
          ["Conduct", record?.conductLabel],
          ["Promotion Status", record?.promotionStatus],
          ["Fee Status", "Cleared"],
          ["Certificate Number", record?.certificateNumber || "-"],
        ]}
      />
    </ModalShell>
  );
}

export function PendingStep({ tcRequests = [], loading = false }) {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterSec, setFilterSec] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const normalizedRequests = useMemo(() => {
    return (tcRequests || []).filter(isPendingTcRequest).map(mapTcRequestForDisplay);
  }, [tcRequests]);

  const classOptions = useMemo(() => ["All", ...Array.from(new Set(normalizedRequests.map((request) => request?.className).filter(Boolean)))], [normalizedRequests]);
  const sectionOptions = useMemo(() => ["All", ...Array.from(new Set(normalizedRequests.map((request) => request?.sectionName).filter(Boolean)))], [normalizedRequests]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();

    return normalizedRequests.filter((record) => {
      const matchesQuery =
        !query ||
        record?.name?.toLowerCase().includes(query) ||
        record?.parentFullName?.toLowerCase().includes(query) ||
        record?.admissionNumber?.toLowerCase().includes(query) ||
        record?.reasonLabel?.toLowerCase().includes(query);
      const matchesClass = filterClass === "All" || record?.className === filterClass;
      const matchesSection = filterSec === "All" || record?.sectionName === filterSec;

      return matchesQuery && matchesClass && matchesSection;
    });
  }, [filterClass, filterSec, normalizedRequests, search]);

  return (
    <div style={{ padding: "28px 28px 60px" }}>
      <div style={{ maxWidth: 1384, margin: "0 auto" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "visible" }}>
          <Toolbar
            search={search}
            setSearch={setSearch}
            filterClass={filterClass}
            setFilterClass={setFilterClass}
            filterSec={filterSec}
            setFilterSec={setFilterSec}
            count={filtered.length}
            countLabel={`request${filtered.length !== 1 ? "s" : ""} found`}
            placeholder="Search by student, parent, admission no, or reason..."
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
                  <th style={TH}>Request Date</th>
                  <th style={TH}>Reason</th>
                  <th style={TH}>Status</th>
                  <th style={{ ...TH, textAlign: "center", width: 120 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "56px", textAlign: "center" }}>
                      <div style={{ fontSize: "14px", color: C.muted }}>Loading TC requests...</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <TableEmptyState icon={Clock} message="No pending TC requests match your filters" colSpan={7} />
                ) : (
                  filtered.map((record, index) => <PendingRequestRow key={record?.id} record={record} index={index} onView={setSelectedRequest} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>{selectedRequest ? <PendingRequestModal record={selectedRequest} onClose={() => setSelectedRequest(null)} /> : null}</AnimatePresence>
    </div>
  );
}
