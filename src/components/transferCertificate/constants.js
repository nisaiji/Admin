export const C = {
  bg: "#0B0D14",
  surface: "#111520",
  card: "#161929",
  cardAlt: "#13161f",
  row: "#12151f",
  rowHov: "#1a1e2c",
  border: "rgba(255,255,255,0.07)",
  borderSoft: "rgba(255,255,255,0.04)",
  text: "#E3E8F3",
  sub: "rgba(227,232,243,0.75)",
  muted: "#64748B",
  blue: "#0a81d1",
  blueDim: "rgba(10,129,209,0.12)",
  green: "#4cbc9a",
  greenDim: "rgba(76,188,154,0.12)",
  amber: "#FBBF24",
  amberDim: "rgba(251,191,36,0.1)",
  red: "#fe4040",
  redDim: "rgba(254,64,64,0.12)",
  orange: "#FF793F",
  orangeDim: "rgba(255,121,63,0.12)",
  purple: "#CBD5E1",
  purpleDim: "rgba(255,255,255,0.06)",
};

export const C_LIGHT = {
  bg: "#f8fafc",
  surface: "#ffffff",
  card: "#ffffff",
  cardAlt: "#f1f5f9",
  row: "#ffffff",
  rowHov: "#f8fafc",
  border: "rgba(0,0,0,0.1)",
  borderSoft: "rgba(0,0,0,0.05)",
  text: "#0f172a",
  sub: "#334155",
  muted: "#64748B",
  blue: "#0a81d1",
  blueDim: "rgba(10,129,209,0.1)",
  green: "#15803d",
  greenDim: "rgba(21,128,61,0.1)",
  amber: "#d97706",
  amberDim: "rgba(217,119,6,0.1)",
  red: "#dc2626",
  redDim: "rgba(220,38,38,0.1)",
  orange: "#ea580c",
  orangeDim: "rgba(234,88,12,0.1)",
  purple: "#475569",
  purpleDim: "rgba(0,0,0,0.05)",
};

export const DEFAULT_CHECKLIST = [
  { id: "noc", label: "NOC (No Objection Certificate)", checked: false, isDefault: true },
  { id: "dues", label: "Dues Clearance", checked: false, isDefault: true },
];

export const TC_REASON_OPTIONS = [
  "Parent Transfer",
  "Job Transfer",
  "Admission Elsewhere",
  "Health Issues",
  "Personal Reasons",
  "Others",
];

export const TC_CONDUCT_OPTIONS = ["EXCELLENT", "VERY_GOOD","GOOD", "SATISFACTORY", "NEEDS_IMPROVEMENT"];

export const TC_PROMOTION_OPTIONS = ["Promoted", "Not Promoted", "Detained", "Passed Out"];

export const CERTIFICATE_SIGNERS = ["Principal", "Class Teacher", "Accounts", "Parent/Guardian"];

export const getTH = (themeC) => ({
  padding: "11px 18px",
  fontSize: "11px",
  fontWeight: 700,
  color: themeC.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "left",
  borderBottom: `1px solid ${themeC.border}`,
  background: themeC.cardAlt,
  whiteSpace: "nowrap",
});

export const PAGE_TRANSITION = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};
