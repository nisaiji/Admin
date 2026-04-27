import React from "react";
import { Edit3, X } from "lucide-react";
import {
  getAvatarClass,
  getDisplayValue,
  getInitials,
  getStudentRollNo,
  getToneClasses,
} from "./utils";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function SectionTitle({ Icon, title, isDarkMode }) {
  return (
    <div
      className={cn(
        "mb-2 mt-5 flex items-center gap-2 border-b pb-2 text-xs font-poppins-bold uppercase text-[#0A81D1]",
        isDarkMode ? "border-[#0A81D1]/20" : "border-borderWhite",
      )}
    >
      <Icon size={14} />
      {title}
    </div>
  );
}

export function DetailRow({
  Icon,
  label,
  value,
  value2,
  isDarkMode,
  accentClass = "",
}) {
  return (
    <div
      className={cn(
        "flex gap-3 border-b py-3",
        isDarkMode ? "border-white/[0.04]" : "border-borderWhite",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isDarkMode
            ? "bg-white/[0.04] text-slate-500"
            : "bg-whiteBackground2 text-textGray",
        )}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[11px] font-poppins-bold uppercase",
            isDarkMode ? "text-slate-500" : "text-textGray",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-1 break-words text-sm font-poppins-regular",
            accentClass || (isDarkMode ? "text-[#E3E8F3]" : "text-textBlack"),
          )}
        >
          {getDisplayValue(value)}
        </p>
        {value2 && (
          <p
            className={cn(
              "mt-1 break-words text-sm font-poppins-regular",
              accentClass || (isDarkMode ? "text-[#E3E8F3]" : "text-textBlack"),
            )}
          >
            {getDisplayValue(value2)}
          </p>
        )}
      </div>
    </div>
  );
}

export function SubsectionTitle({ title, isDarkMode }) {
  return (
    <p
      className={cn(
        "mt-4 text-[11px] font-poppins-bold uppercase tracking-[0.12em]",
        isDarkMode ? "text-slate-500" : "text-textGray",
      )}
    >
      {title}
    </p>
  );
}

export function StatusChip({ label, value, tone, isDarkMode }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        getToneClasses(tone),
        isDarkMode ? "shadow-[0_0_0_1px_rgba(255,255,255,0.02)]" : "",
      )}
    >
      <p className="text-[10px] font-poppins-bold uppercase opacity-75">
        {label}
      </p>
      <p className="mt-1 text-sm font-poppins-bold">{getDisplayValue(value)}</p>
    </div>
  );
}

export function SummaryStatGrid({ items, isDarkMode }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      {items.map(({ label, value, accentClass = "" }) => (
        <div
          key={label}
          className={cn(
            "rounded-xl border px-3 py-3",
            isDarkMode
              ? "border-white/10 bg-white/[0.03]"
              : "border-borderWhite bg-whiteBackground2",
          )}
        >
          <p
            className={cn(
              "text-[11px] font-poppins-bold uppercase",
              isDarkMode ? "text-slate-500" : "text-textGray",
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-base font-poppins-bold",
              accentClass || (isDarkMode ? "text-[#E3E8F3]" : "text-textBlack"),
            )}
          >
            {getDisplayValue(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function EmptyStateLabel({ label, isDarkMode }) {
  return (
    <div
      className={cn(
        "mt-3 rounded-xl border border-dashed px-4 py-4 text-sm",
        isDarkMode
          ? "border-white/10 bg-white/[0.03] text-slate-500"
          : "border-borderWhite bg-whiteBackground2 text-textGray",
      )}
    >
      {label}
    </div>
  );
}

export function SummaryListCard({ title, meta, badge, badgeTone, isDarkMode }) {
  const metaItems = Array.isArray(meta) ? meta.filter(Boolean) : [];

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isDarkMode
          ? "border-white/10 bg-white/[0.03]"
          : "border-borderWhite bg-whiteBackground2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-poppins-bold">{getDisplayValue(title)}</p>
        {badge ? (
          <span
            className={cn(
              "rounded-full border px-2 py-1 text-[10px] font-poppins-bold uppercase",
              getToneClasses(badgeTone || "blue"),
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {metaItems.length > 0 ? (
        <div
          className={cn(
            "mt-3 space-y-1 text-xs",
            isDarkMode ? "text-slate-400" : "text-textGray",
          )}
        >
          {metaItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SidebarTabs({ tabs, activeTab, onChange, accentClass }) {
  return (
    <div className="flex gap-1 border-b border-white/[0.06]">
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "mb-[-1px] inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-poppins-bold transition",
            activeTab === key
              ? `${accentClass} border-current`
              : "border-transparent text-slate-500 hover:text-[#E3E8F3]",
          )}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

export function SidebarHeader({
  student,
  fullName,
  className,
  sectionName,
  tabs,
  activeTab,
  onTabChange,
  onClose,
  onEdit,
  isDarkMode,
}) {
  const avatarClass = getAvatarClass(student, 0);

  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b px-6 pt-5",
        isDarkMode
          ? "border-white/10 bg-[#111315]"
          : "border-borderWhite bg-whiteBackground",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-poppins-bold uppercase text-slate-500">
          Student Profile
        </p>
        <div className="flex items-center gap-2">
          {typeof onEdit === "function" ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#FF793F]/30 bg-[#FF793F]/10 px-3 text-xs font-poppins-bold text-[#FF793F] transition hover:bg-[#FF793F]/20"
            >
              <Edit3 size={14} />
              Edit
            </button>
          ) : null}
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
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-white/10 text-xl font-poppins-bold text-white",
            avatarClass,
          )}
        >
          {getInitials(student)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-poppins-bold">{fullName}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-[#0A81D1]/15 px-2 py-1 font-poppins-bold text-[#0A81D1]">
              Class {className} - {sectionName}
            </span>
            <span className="text-slate-500">
              Student ID {getStudentRollNo(student)}
            </span>
            <span className="rounded-full bg-white/[0.06] px-2 py-1 text-slate-400">
              {getDisplayValue(student?.gender)}
            </span>
          </div>
        </div>
      </div>

      <SidebarTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={onTabChange}
        accentClass="text-[#0A81D1]"
      />
    </div>
  );
}
