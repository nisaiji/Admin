const fs = require('fs');
const path = require('path');

const targetDir = path.join('c:', 'Users', 'nikhi', 'Desktop', 'SchoolProject', 'Admin', 'src', 'components', 'transferCertificate');

// 1. Update constants.js
const constantsPath = path.join(targetDir, 'constants.js');
let constantsContent = fs.readFileSync(constantsPath, 'utf8');

const C_LIGHT = `
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
`;

if (!constantsContent.includes('C_LIGHT')) {
  constantsContent = constantsContent.replace('export const PENDING_RECORDS', C_LIGHT + '\\nexport const PENDING_RECORDS');
}

// Modify TH to be a function
if (constantsContent.includes('export const TH = {') && !constantsContent.includes('export const getTH')) {
  constantsContent = constantsContent.replace(
    /export const TH = \{[\\s\\S]*?\};/,
    \`export const getTH = (themeC) => ({
  padding: "11px 18px",
  fontSize: "11px",
  fontWeight: 700,
  color: themeC.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "left",
  borderBottom: \\\`1px solid \${themeC.border}\\\`,
  background: themeC.cardAlt,
  whiteSpace: "nowrap",
});\`
  );
}

fs.writeFileSync(constantsPath, constantsContent);
console.log('Updated constants.js');
