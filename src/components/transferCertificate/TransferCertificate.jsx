import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileClock, FileDown, GraduationCap } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

import { AlumniStep } from "./AlumniStep";
import { PAGE_TRANSITION } from "./constants";
import { PendingStep } from "./PendingStep";
import { SelectionStep } from "./SelectionStep";
import { TCFormStep } from "./TCFormStep";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import { getTcRequestsFromResponse } from "./utils";
import { useTCTheme, TCThemeProvider } from "./ThemeContext";

const TAB_ITEMS = [
  { key: "pending", label: "Pending Requests", icon: <FileClock size={14} /> },
  { key: "generate", label: "Generate TC", icon: <FileDown size={14} /> },
  {
    key: "alumni",
    label: "Alumni / Issued",
    icon: <GraduationCap size={14} />,
  },
];

function PageHeader({ activeTab, isInForm, onTabChange }) {
  const C = useTCTheme();
  return (
    <div
      style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}
    >
      <div
        style={{
          padding: "20px 28px 0",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          {isInForm ? (
            <h1
              style={{
                margin: "0 0 2px",
                fontSize: "22px",
                fontWeight: 700,
                color: C.text,
              }}
            >
              Generate Transfer Certificate
            </h1>
          ) : (
            <>
              <h1
                style={{
                  margin: "0 0 2px",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                Transfer Certificate
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: C.muted }}>
                Manage TC generation and view previously issued certificates
              </p>
            </>
          )}
        </div>

        {!isInForm ? (
          <div
            style={{
              display: "flex",
              gap: 2,
              background: C.cardAlt,
              padding: 4,
              borderRadius: "12px",
              border: `1px solid ${C.border}`,
            }}
          >
            {TAB_ITEMS?.map((item) => (
              <button
                key={item?.key}
                onClick={() => onTabChange(item?.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 18px",
                  borderRadius: "9px",
                  background: activeTab === item?.key ? C.blue : "transparent",
                  border: "none",
                  color: activeTab === item?.key ? "#fff" : C.muted,
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                }}
              >
                {item?.icon}
                {item?.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!isInForm ? (
        <div
          style={{ display: "flex", gap: 0, padding: "0 28px", marginTop: 8 }}
        >
          {["pending", "generate", "alumni"]?.map((tab) => (
            <div
              key={tab}
              style={{
                height: 3,
                width: activeTab === tab ? 110 : 0,
                background: C.blue,
                borderRadius: "2px 2px 0 0",
                transition: "width 0.25s ease",
                marginRight: 24,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TCPageInner() {
  const C = useTCTheme();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [alumniRequests, setAlumniRequests] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedSessionId = useSelector(
    (state) => state.appAuth.classAndSectionData?.selectedSession?._id,
  );

  useEffect(() => {
    let isActive = true;

    async function fetchTcRequests(status) {
      const response = await axiosClient.get(EndPoints.ADMIN.GET_ISSUED_TC, {
        params: {
          sessionId: selectedSessionId,
          limit: 500,
          status,
        },
      });

      return getTcRequestsFromResponse(response);
    }

    function getErrorMessage(error, fallbackMessage) {
      if (typeof error === "string") {
        return error;
      }

      return error?.message || fallbackMessage;
    }

    if (!selectedSessionId) {
      setPendingRequests([]);
      setAlumniRequests([]);
      setPendingLoading(false);
      setAlumniLoading(false);
      return;
    }

    if (activeTab !== "pending" && activeTab !== "alumni") {
      return undefined;
    }

    if (activeTab === "pending") {
      (async () => {
        try {
          setPendingLoading(true);
          const requests = await fetchTcRequests("submitted");

          if (isActive) {
            setPendingRequests(requests);
          }
        } catch (error) {
          if (isActive) {
            setPendingRequests([]);
            toast.error(
              getErrorMessage(error, "Failed to fetch pending TC requests"),
            );
          }
        } finally {
          if (isActive) {
            setPendingLoading(false);
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }

    (async () => {
      try {
        setAlumniLoading(true);
        const requests = await fetchTcRequests("approvedByParent");

        if (isActive) {
          setAlumniRequests(requests);
        }
      } catch (error) {
        if (isActive) {
          setAlumniRequests([]);
          toast.error(
            getErrorMessage(error, "Failed to fetch alumni TC requests"),
          );
        }
      } finally {
        if (isActive) {
          setAlumniLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [activeTab, refreshKey, selectedSessionId]);

  useEffect(() => {
    setSelectedStudent(null);
  }, [selectedSessionId]);

  function handleTabChange(tab) {
    if (tab === activeTab && (tab === "pending" || tab === "alumni")) {
      setRefreshKey((current) => current + 1);
      return;
    }
    setActiveTab(tab);
    setSelectedStudent(null);
  }

  const isInForm = activeTab === "generate" && selectedStudent !== null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        userSelect: "none",
      }}
    >
      <Toaster />
      <PageHeader
        activeTab={activeTab}
        isInForm={isInForm}
        onTabChange={handleTabChange}
      />

      <AnimatePresence mode="wait">
        {activeTab === "pending" ? (
          <motion.div
            key="pending"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={PAGE_TRANSITION}
          >
            <PendingStep
              tcRequests={pendingRequests}
              loading={pendingLoading}
            />
          </motion.div>
        ) : null}

        {activeTab === "generate" && !selectedStudent ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={PAGE_TRANSITION}
          >
            <SelectionStep onSelect={setSelectedStudent} />
          </motion.div>
        ) : null}

        {activeTab === "generate" && selectedStudent ? (
          <motion.div
            key={`form-${selectedStudent?.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={PAGE_TRANSITION}
          >
            <TCFormStep
              student={selectedStudent}
              onBack={() => setSelectedStudent(null)}
              onRequestSubmitted={() => {
                setSelectedStudent(null);
                setActiveTab("pending");
                setRefreshKey((current) => current + 1);
              }}
            />
          </motion.div>
        ) : null}

        {activeTab === "alumni" ? (
          <motion.div
            key="alumni"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={PAGE_TRANSITION}
          >
            <AlumniStep tcRequests={alumniRequests} loading={alumniLoading} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function TCPage() {
  return (
    <TCThemeProvider>
      <TCPageInner />
    </TCThemeProvider>
  );
}
