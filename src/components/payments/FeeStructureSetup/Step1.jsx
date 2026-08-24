import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Plus, X, Loader2 } from "lucide-react";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { setClassAndSectionData } from "../../../store/AppAuthSlice";

import editfeeheadDark from "../../../assets/images/darkmode/editfeehead.png";
import deletefeeheadDark from "../../../assets/images/darkmode/deletefeehead.png";
import editfeeheadLight from "../../../assets/images/edit2.png";
import deletefeeheadLight from "../../../assets/images/delete2.png";
import { showToast } from "../../../services/toastService";

const DEFAULT_ROW = {
  name: "",
  type: "ONE_TIME",
  refundable: false,
  label: "",
};

function normalizeHeadType(value) {
  const raw = String(value || "").toUpperCase();

  if (raw === "RECURRING") return "RECURRING";
  return "ONE_TIME";
}

function getHeadTypeLabel(value) {
  return normalizeHeadType(value) === "RECURRING" ? "Recurring" : "One-Time";
}

function buildDraft(row) {
  return {
    name: row?.name || "",
    type: normalizeHeadType(row?.type || row?.headType),
    refundable:
      typeof row?.refundable === "boolean"
        ? row.refundable
        : String(row?.refundable || "").toLowerCase() === "true",
    label: row?.label || "",
  };
}

function getRowId(row) {
  return row?._id || row?.id;
}

export default function Step1({
  feeHeads,
  setFeeHeads,
  onNext,
  onCancel,
  sessionId,
  readOnly = false,
}) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? false);
  const [draft, setDraft] = useState(DEFAULT_ROW);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = {
    card: isDarkMode
      ? "border-[#262b36] bg-[#111315] shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
      : "border-[#e7e2e2] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
    heading: isDarkMode ? "text-[#e3e8f3]" : "text-[#0f0f0f]",
    subText: isDarkMode ? "text-slate-400" : "text-[#686868]",
    verified: isDarkMode
      ? "bg-[rgba(76,188,154,0.12)] text-[#4cbc9a]"
      : "bg-[rgba(76,188,154,0.10)] text-[#2f9a80]",
    tableWrap: isDarkMode
      ? "border-[#262b36] bg-[#0b0d14]"
      : "border-[#e7e2e2] bg-white",
    tableHead: isDarkMode ? "bg-[#151a23]" : "bg-[#e5f0f5]",
    row: isDarkMode ? "border-[#262b36] hover:bg-[#151a23]" : "border-[#e7e2e2] hover:bg-slate-50",
    cellText: isDarkMode ? "text-[#e3e8f3]" : "text-[#0f0f0f]",
    headText: isDarkMode ? "text-[#cbd5e1]" : "text-[#002861]",
    input: isDarkMode
      ? "border-[#2b3242] bg-[#0b0d14] text-[#e3e8f3] placeholder:text-slate-500 focus:border-[#0a81d1]"
      : "border-[#dfe5eb] bg-white text-[#0f0f0f] placeholder:text-[#9ca3af] focus:border-[#0a81d1]",
    actionBtn: isDarkMode
      ? "border-[#2b3242] bg-[#111827] hover:bg-[#1b2230]"
      : "border-[#dfe5eb] bg-white hover:bg-slate-50",
    cancelBtn: isDarkMode
      ? "border-[#2b3242] bg-[#111827] text-slate-300 hover:bg-[rgba(254,64,64,0.12)] hover:text-[#fe4040]"
      : "border-[#dfe5eb] bg-white text-[#0f0f0f] hover:bg-red-50 hover:text-[#fe4040]",
    noteText: isDarkMode ? "text-slate-400" : "text-slate-500",
  };

  const resetDraft = () => {
    setDraft(DEFAULT_ROW);
    setEditingId(null);
  };

  const syncHeads = (updater) => {
    setFeeHeads((previous) => updater(previous || []));
  };

  const saveHead = async () => {
    if (readOnly || loading) return;

    if (!draft.name.trim() || !sessionId) return;

    try {
      setLoading(true);

      const isEditing = Boolean(editingId);
      const payload = {
        ...(!isEditing && { sessionId }),
        name: draft.name.trim(),
        type: draft.type,
        refundable: draft.refundable,
        label: draft.label.trim(),
      };
      const endpoint = isEditing
        ? `${EndPoints.ADMIN.UPDATE_FEES_HEAD_OF_SCHOOL}/${editingId}`
        : EndPoints.ADMIN.CREATE_FEES_HEAD_OF_SCHOOL;
      const response = isEditing
        ? await axiosClient.put(endpoint, { ...payload })
        : await axiosClient.post(endpoint, payload);
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        const normalizedRow = {
          _id:
            response?.result?._id ||
            response?.result?.id ||
            editingId ||
            Date.now(),
          id:
            response?.result?._id ||
            response?.result?.id ||
            editingId ||
            Date.now(),
          name: payload.name,
          type: response?.result?.type || payload.type,
          headType:
            response?.result?.headType || getHeadTypeLabel(payload.type),
          refundable:
            typeof response?.result?.refundable === "boolean"
              ? response.result.refundable
              : payload.refundable,
          label: response?.result?.label || payload.label,
        };

        if (isEditing) {
          syncHeads((previous) =>
            previous.map((row) =>
              getRowId(row) === editingId ? normalizedRow : row,
            ),
          );
          showToast.success(response?.result?.message || "Fee head updated");
        } else {
          syncHeads((previous) => [...previous, normalizedRow]);
          showToast.success(response?.result?.message || "Fee head created");
        }

        // Fetch and update redux after creation/update
        try {
          const fetchRes = await axiosClient.get(
            `${EndPoints.ADMIN.GET_FEES_HEAD_OF_SCHOOL}/${sessionId}`
          );
          if (fetchRes?.result) {
            dispatch(
              setClassAndSectionData({
                feeHeadData: fetchRes?.result?.feeHead ?? [],
              })
            );
          }
        } catch (fetchErr) {
          console.error("Failed to fetch updated fee heads", fetchErr);
        }

        resetDraft();
      }
    } catch (error) {
      showToast.error(error?.message || error || "Failed to save fee head");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    if (readOnly || loading) return;

    setEditingId(getRowId(row));
    setDraft(buildDraft(row));
  };

  const handleDelete = async (row) => {
    if (readOnly || loading) return;

    const rowId = getRowId(row);
    if (!rowId) return;

    try {
      setLoading(true);
      const response = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_FEES_HEAD_OF_SCHOOL}/${rowId}`,
      );

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        syncHeads((previous) =>
          previous.filter((item) => getRowId(item) !== rowId),
        );

        if (editingId === rowId) {
          resetDraft();
        }

        showToast.success(response?.result?.message || "Fee head deleted");

        // Fetch and update redux after deletion
        try {
          const fetchRes = await axiosClient.get(
            `${EndPoints.ADMIN.GET_FEES_HEAD_OF_SCHOOL}/${sessionId}`
          );
          if (fetchRes?.result) {
            dispatch(
              setClassAndSectionData({
                feeHeadData: fetchRes?.result?.feeHead ?? [],
              })
            );
          }
        } catch (fetchErr) {
          console.error("Failed to fetch updated fee heads", fetchErr);
        }
      }
    } catch (error) {
      showToast.error(error?.message || error || "Failed to delete fee head");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`overflow-hidden rounded-2xl border ${theme.card}`}>
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div>
          <h2 className={`text-[18px] font-bold ${theme.heading}`}>
            Create Fee Heads
          </h2>
          <p className={`mt-1 text-sm ${theme.subText}`}>
            Applies for whole school
          </p>
        </div>

        {readOnly ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.verified}`}>
            Verified
          </span>
        ) : null}
      </div>

      <div className={`mx-5 overflow-x-auto rounded-2xl border ${theme.tableWrap}`}>
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className={theme.tableHead}>
              {[
                "Head Name",
                "Head Type",
                "Refundable",
                "UI Label Preview",
                "Actions",
              ].map((label, index) => (
                <th
                  key={label}
                  className={`px-5 py-4 text-[14px] font-semibold ${theme.headText}
              ${index === 0 ? "rounded-tl-2xl text-left" : "text-center"}
              ${index === 4 ? "rounded-tr-2xl" : ""}
            `}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {feeHeads.map((row) => {
              const rowId = getRowId(row);
              const typeValue = row?.type || row?.headType;
              const isRecurring = normalizeHeadType(typeValue) === "RECURRING";

              return (
                <tr
                  key={rowId}
                  className={`border-b transition-colors ${theme.row}`}
                >
                  <td className={`px-5 py-4 text-[14px] font-medium ${theme.cellText}`}>
                    {row?.name}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        isRecurring
                          ? "bg-[rgba(76,188,154,0.12)] text-[#4cbc9a]"
                          : "bg-[rgba(79,142,247,0.12)] text-[#4F8EF7]"
                      }`}
                    >
                      {getHeadTypeLabel(typeValue)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        row?.refundable
                          ? "bg-[rgba(76,188,154,0.12)] text-[#4cbc9a]"
                          : "bg-[rgba(255,121,63,0.12)] text-[#FF793F]"
                      }`}
                    >
                      {row?.refundable ? "Refundable" : "Not Refundable"}
                    </span>
                  </td>

                  <td className={`px-5 py-4 text-center text-[14px] ${theme.noteText}`}>
                    {row?.label}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(row)}
                        disabled={readOnly || loading}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${theme.actionBtn}`}
                      >
                        <img
                          src={isDarkMode ? editfeeheadDark : editfeeheadLight}
                          alt="Edit fee head"
                          className="h-4 w-4"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        disabled={readOnly || loading}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${theme.actionBtn}`}
                      >
                        <img
                          src={isDarkMode ? deletefeeheadDark : deletefeeheadLight}
                          alt="Delete fee head"
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!readOnly ? (
              <tr className={theme.tableHead}>
                <td className="px-5 py-4">
                  <input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    placeholder="Enter Head Name"
                    className={`w-full rounded-lg border px-3 py-2 text-[14px] outline-none ${theme.input}`}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className={`text-xs font-semibold ${draft.type === "RECURRING" ? "text-[#4cbc9a]" : "text-[#4F8EF7]"}`}>
                      {getHeadTypeLabel(draft.type)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          type:
                            draft.type === "ONE_TIME"
                              ? "RECURRING"
                              : "ONE_TIME",
                        })
                      }
                    className={`relative h-6 w-11 rounded-full transition-all duration-200 ${draft.type === "RECURRING" ? "bg-[#4cbc9a]" : "bg-[#0a81d1]"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                          draft.type === "RECURRING" ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className={`text-xs font-semibold ${draft.refundable ? "text-[#4cbc9a]" : "text-[#FF793F]"}`}>
                      {draft.refundable ? "Refundable" : "Not Refundable"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, refundable: !draft.refundable })
                      }
                        className={`relative h-6 w-11 rounded-full transition-all duration-200 ${draft.refundable ? "bg-[#4cbc9a]" : "bg-[#FF793F]"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                          draft.refundable ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <input
                    value={draft.label}
                    onChange={(e) =>
                      setDraft({ ...draft, label: e.target.value })
                    }
                    placeholder="Label shown to parents"
                    className={`w-full rounded-lg border px-3 py-2 text-center text-[14px] outline-none ${theme.input}`}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={saveHead}
                      disabled={loading || !draft.name.trim()}
                      className="flex h-9 items-center gap-2 rounded-lg bg-[#0a81d1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0974bc] disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      {loading
                        ? editingId
                          ? "Updating..."
                          : "Adding..."
                        : editingId
                          ? "Update"
                          : "Add"}
                    </button>

                    <button
                      type="button"
                      onClick={resetDraft}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${theme.cancelBtn}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className={`px-5 py-5 text-center text-sm ${theme.noteText}`}
                >
                  Verified fee heads are read only.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
