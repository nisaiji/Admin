import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  X, User, Phone, Mail, MapPin, Droplets, Calendar,
  BookOpen, Users, DollarSign, Edit3, Trash2, Info,
  CheckCircle2, Clock, AlertCircle, GraduationCap,
  Heart, Briefcase, Download, Shield, Home,
  Save, Check, Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TopNavbar } from "../ui/TopNavbar";

/* ─── Colours ────────────────────────────────────────────────── */
const C = {
  bg:       "#0B0D14",
  nav:      "#0a0c12",
  surface:  "#111315",
  card:     "#181b24",
  border:   "rgba(255,255,255,0.07)",
  soft:     "rgba(255,255,255,0.04)",
  text:     "#E3E8F3",
  sub:      "rgba(227,232,243,0.75)",
  muted:    "#64748B",
  mutedDk:  "#374151",
  blue:     "#0a81d1",
  blueBrt:  "#4F8EF7",
  blueDim:  "rgba(10,129,209,0.12)",
  green:    "#4cbc9a",
  greenDim: "rgba(76,188,154,0.12)",
  amber:    "#FBBF24",
  amberDim: "rgba(251,191,36,0.1)",
  red:      "#fe4040",
  redDim:   "rgba(254,64,64,0.12)",
  orange:   "#FF793F",
};

/* ─── Initial data ───────────────────────────────────────────── */
const INITIAL_STUDENTS = [
  {
    id:"1", firstName:"Mahi",  lastName:"Sharma",  gender:"Female", phone:"9876500001", email:"mahi.sharma@school.in",  bloodGroup:"AB+",
    dob:"2010-03-15", address:"12 Rose Garden, Sector 5, Delhi – 110001",
    class:"8th", section:"A", rollNo:"A001", admissionNo:"ADM2019001", admissionDate:"2019-04-01",
    nationality:"Indian", religion:"Hindu", category:"General",
    father:{ name:"Rajesh Sharma",  phone:"9876543210", email:"rajesh.sharma@gmail.com",  occupation:"Software Engineer" },
    mother:{ name:"Sunita Sharma",  phone:"9876543211", email:"sunita.sharma@gmail.com",  occupation:"Teacher" },
    emergency:{ name:"Rahul Sharma", relation:"Uncle", phone:"9876543299" },
    fees:{ totalAnnual:45000, paid:30000, pending:15000, lastPayment:"2024-07-12",
      installments:[
        {month:"April",     amount:10000, status:"paid",    date:"2024-04-15"},
        {month:"May",       amount:5000,  status:"paid",    date:"2024-05-10"},
        {month:"June",      amount:5000,  status:"paid",    date:"2024-06-08"},
        {month:"July",      amount:5000,  status:"paid",    date:"2024-07-12"},
        {month:"August",    amount:5000,  status:"pending"},
        {month:"September", amount:5000,  status:"overdue"},
        {month:"October",   amount:5000,  status:"pending"},
        {month:"November",  amount:5000,  status:"pending"},
      ]},
    attendance:87,
    subjects:[
      {name:"Mathematics",   marks:88, maxMarks:100, grade:"A"},
      {name:"English",       marks:92, maxMarks:100, grade:"A+"},
      {name:"Science",       marks:85, maxMarks:100, grade:"A"},
      {name:"Hindi",         marks:78, maxMarks:100, grade:"B+"},
      {name:"Social Studies",marks:82, maxMarks:100, grade:"A"},
    ],
  },
  {
    id:"2", firstName:"Tony",  lastName:"Dsouza",  gender:"Male",   phone:"9876500002", email:"tony.dsouza@school.in",  bloodGroup:"O+",
    dob:"2009-07-22", address:"45 Marine Drive, Mumbai – 400001",
    class:"8th", section:"A", rollNo:"A002", admissionNo:"ADM2019002", admissionDate:"2019-04-01",
    nationality:"Indian", religion:"Christian", category:"General",
    father:{ name:"Robert Dsouza",  phone:"9988776655", email:"robert.dsouza@gmail.com",  occupation:"Business" },
    mother:{ name:"Maria Dsouza",   phone:"9988776656", email:"maria.dsouza@gmail.com",   occupation:"Homemaker" },
    emergency:{ name:"James Dsouza", relation:"Grandfather", phone:"9988776699" },
    fees:{ totalAnnual:45000, paid:45000, pending:0, lastPayment:"2024-11-01",
      installments:[
        {month:"April",     amount:10000, status:"paid", date:"2024-04-10"},
        {month:"May",       amount:5000,  status:"paid", date:"2024-05-05"},
        {month:"June",      amount:5000,  status:"paid", date:"2024-06-02"},
        {month:"July",      amount:5000,  status:"paid", date:"2024-07-01"},
        {month:"August",    amount:5000,  status:"paid", date:"2024-08-01"},
        {month:"September", amount:5000,  status:"paid", date:"2024-09-01"},
        {month:"October",   amount:5000,  status:"paid", date:"2024-10-01"},
        {month:"November",  amount:5000,  status:"paid", date:"2024-11-01"},
      ]},
    attendance:94,
    subjects:[
      {name:"Mathematics",   marks:95, maxMarks:100, grade:"A+"},
      {name:"English",       marks:90, maxMarks:100, grade:"A"},
      {name:"Science",       marks:93, maxMarks:100, grade:"A+"},
      {name:"Hindi",         marks:72, maxMarks:100, grade:"B"},
      {name:"Social Studies",marks:88, maxMarks:100, grade:"A"},
    ],
  },
  {
    id:"3", firstName:"Karan", lastName:"Verma",   gender:"Male",   phone:"9876500003", email:"karan.verma@school.in",  bloodGroup:"B+",
    dob:"2009-11-08", address:"7 Park Street, Kolkata – 700016",
    class:"8th", section:"A", rollNo:"A003", admissionNo:"ADM2019003", admissionDate:"2019-04-01",
    nationality:"Indian", religion:"Hindu", category:"OBC",
    father:{ name:"Suresh Verma",   phone:"9123456780", email:"suresh.verma@gmail.com",   occupation:"Govt. Service" },
    mother:{ name:"Priya Verma",    phone:"9123456781", email:"priya.verma@gmail.com",    occupation:"Nurse" },
    emergency:{ name:"Meena Verma", relation:"Aunt", phone:"9123456799" },
    fees:{ totalAnnual:40000, paid:20000, pending:20000, lastPayment:"2024-05-15",
      installments:[
        {month:"April",     amount:8000, status:"paid",    date:"2024-04-20"},
        {month:"May",       amount:8000, status:"paid",    date:"2024-05-15"},
        {month:"June",      amount:8000, status:"overdue"},
        {month:"July",      amount:8000, status:"overdue"},
        {month:"August",    amount:8000, status:"pending"},
      ]},
    attendance:72,
    subjects:[
      {name:"Mathematics",   marks:65, maxMarks:100, grade:"B"},
      {name:"English",       marks:70, maxMarks:100, grade:"B+"},
      {name:"Science",       marks:68, maxMarks:100, grade:"B"},
      {name:"Hindi",         marks:88, maxMarks:100, grade:"A"},
      {name:"Social Studies",marks:75, maxMarks:100, grade:"B+"},
    ],
  },
  {
    id:"4", firstName:"Ravi",  lastName:"Kumar",   gender:"Male",   phone:"9876500004", email:"ravi.kumar@school.in",   bloodGroup:"A+",
    dob:"2010-01-30", address:"33 Gandhi Nagar, Jaipur – 302015",
    class:"8th", section:"A", rollNo:"A004", admissionNo:"ADM2019004", admissionDate:"2019-04-01",
    nationality:"Indian", religion:"Hindu", category:"SC",
    father:{ name:"Anil Kumar",     phone:"9012345678", email:"anil.kumar@gmail.com",     occupation:"Farmer" },
    mother:{ name:"Kamla Kumar",    phone:"9012345679", email:"kamla.kumar@gmail.com",    occupation:"Homemaker" },
    emergency:{ name:"Vijay Kumar", relation:"Uncle", phone:"9012345699" },
    fees:{ totalAnnual:30000, paid:10000, pending:20000, lastPayment:"2024-04-25",
      installments:[
        {month:"April",     amount:10000, status:"paid",    date:"2024-04-25"},
        {month:"May",       amount:5000,  status:"overdue"},
        {month:"June",      amount:5000,  status:"overdue"},
        {month:"July",      amount:5000,  status:"overdue"},
        {month:"August",    amount:5000,  status:"pending"},
      ]},
    attendance:65,
    subjects:[
      {name:"Mathematics",   marks:55, maxMarks:100, grade:"C+"},
      {name:"English",       marks:60, maxMarks:100, grade:"B-"},
      {name:"Science",       marks:58, maxMarks:100, grade:"C+"},
      {name:"Hindi",         marks:80, maxMarks:100, grade:"A"},
      {name:"Social Studies",marks:70, maxMarks:100, grade:"B"},
    ],
  },
  {
    id:"5", firstName:"Neha",  lastName:"Gupta",   gender:"Female", phone:"9876500005", email:"neha.gupta@school.in",   bloodGroup:"AB-",
    dob:"2010-06-14", address:"8 Lotus Colony, Pune – 411001",
    class:"8th", section:"A", rollNo:"A005", admissionNo:"ADM2019005", admissionDate:"2019-04-01",
    nationality:"Indian", religion:"Jain", category:"General",
    father:{ name:"Mohit Gupta",    phone:"8899776655", email:"mohit.gupta@gmail.com",    occupation:"CA" },
    mother:{ name:"Asha Gupta",     phone:"8899776656", email:"asha.gupta@gmail.com",     occupation:"Doctor" },
    emergency:{ name:"Seema Gupta", relation:"Mother (alt)", phone:"8899776699" },
    fees:{ totalAnnual:50000, paid:50000, pending:0, lastPayment:"2024-08-02",
      installments:[
        {month:"April",     amount:10000, status:"paid", date:"2024-04-02"},
        {month:"May",       amount:10000, status:"paid", date:"2024-05-02"},
        {month:"June",      amount:10000, status:"paid", date:"2024-06-02"},
        {month:"July",      amount:10000, status:"paid", date:"2024-07-02"},
        {month:"August",    amount:10000, status:"paid", date:"2024-08-02"},
      ]},
    attendance:96,
    subjects:[
      {name:"Mathematics",   marks:98, maxMarks:100, grade:"A+"},
      {name:"English",       marks:95, maxMarks:100, grade:"A+"},
      {name:"Science",       marks:97, maxMarks:100, grade:"A+"},
      {name:"Hindi",         marks:90, maxMarks:100, grade:"A"},
      {name:"Social Studies",marks:93, maxMarks:100, grade:"A+"},
    ],
  },
  {
    id:"6", firstName:"Rohan", lastName:"Singh",   gender:"Male",   phone:"9876500006", email:"rohan.singh@school.in",  bloodGroup:"O-",
    dob:"2009-09-05", address:"22 Shastri Nagar, Lucknow – 226001",
    class:"8th", section:"A", rollNo:"A006", admissionNo:"ADM2019006", admissionDate:"2019-04-01",
    nationality:"Indian", religion:"Sikh", category:"General",
    father:{ name:"Paramjit Singh",  phone:"7766554433", email:"param.singh@gmail.com",   occupation:"Army (Retd.)" },
    mother:{ name:"Harjeet Kaur",    phone:"7766554434", email:"harjeet.kaur@gmail.com",  occupation:"Teacher" },
    emergency:{ name:"Gurpreet Singh", relation:"Uncle", phone:"7766554499" },
    fees:{ totalAnnual:45000, paid:35000, pending:10000, lastPayment:"2024-10-10",
      installments:[
        {month:"April",     amount:5000,  status:"paid", date:"2024-04-10"},
        {month:"May",       amount:5000,  status:"paid", date:"2024-05-10"},
        {month:"June",      amount:5000,  status:"paid", date:"2024-06-10"},
        {month:"July",      amount:5000,  status:"paid", date:"2024-07-10"},
        {month:"August",    amount:5000,  status:"paid", date:"2024-08-10"},
        {month:"September", amount:5000,  status:"paid", date:"2024-09-10"},
        {month:"October",   amount:5000,  status:"paid", date:"2024-10-10"},
        {month:"November",  amount:5000,  status:"pending"},
        {month:"December",  amount:5000,  status:"pending"},
      ]},
    attendance:89,
    subjects:[
      {name:"Mathematics",   marks:80, maxMarks:100, grade:"A-"},
      {name:"English",       marks:85, maxMarks:100, grade:"A"},
      {name:"Science",       marks:78, maxMarks:100, grade:"B+"},
      {name:"Hindi",         marks:70, maxMarks:100, grade:"B"},
      {name:"Social Studies",marks:88, maxMarks:100, grade:"A"},
    ],
  },
  {
    id:"7", firstName:"Reena", lastName:"Patel",   gender:"Female", phone:"9876500007", email:"reena.patel@school.in",  bloodGroup:"B-",
    dob:"2010-02-28", address:"5 Sardar Patel Road, Ahmedabad – 380001",
    class:"8th", section:"A", rollNo:"A007", admissionNo:"ADM2019007", admissionDate:"2019-04-01",
    nationality:"Indian", religion:"Hindu", category:"General",
    father:{ name:"Kiran Patel",    phone:"9988001122", email:"kiran.patel@gmail.com",    occupation:"Business" },
    mother:{ name:"Rekha Patel",    phone:"9988001123", email:"rekha.patel@gmail.com",    occupation:"Interior Designer" },
    emergency:{ name:"Vijay Patel", relation:"Uncle", phone:"9988001199" },
    fees:{ totalAnnual:45000, paid:25000, pending:20000, lastPayment:"2024-08-15",
      installments:[
        {month:"April",     amount:5000,  status:"paid",    date:"2024-04-15"},
        {month:"May",       amount:5000,  status:"paid",    date:"2024-05-15"},
        {month:"June",      amount:5000,  status:"paid",    date:"2024-06-20"},
        {month:"July",      amount:5000,  status:"paid",    date:"2024-07-15"},
        {month:"August",    amount:5000,  status:"paid",    date:"2024-08-15"},
        {month:"September", amount:5000,  status:"overdue"},
        {month:"October",   amount:5000,  status:"pending"},
        {month:"November",  amount:5000,  status:"pending"},
        {month:"December",  amount:5000,  status:"pending"},
      ]},
    attendance:81,
    subjects:[
      {name:"Mathematics",   marks:75, maxMarks:100, grade:"B+"},
      {name:"English",       marks:88, maxMarks:100, grade:"A"},
      {name:"Science",       marks:80, maxMarks:100, grade:"A-"},
      {name:"Hindi",         marks:84, maxMarks:100, grade:"A"},
      {name:"Social Studies",marks:78, maxMarks:100, grade:"B+"},
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────── */
const AVATAR_COLORS = ["#4F8EF7","#4cbc9a","#94A3B8","#FBBF24","#FF793F","#fe4040","#0a81d1"];
function avatarColor(id) { return AVATAR_COLORS[parseInt(id) % AVATAR_COLORS.length]; }
function initials(s) { return (s.firstName[0]+(s.lastName[0]||"")).toUpperCase(); }
function fmtCurrency(n) { return "₹ "+n.toLocaleString("en-IN"); }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function gradeColor(g) {
  if (g.startsWith("A")) return C.green;
  if (g.startsWith("B")) return C.blueBrt;
  if (g.startsWith("C")) return C.amber;
  return C.red;
}

/* ─── Ring chart ─────────────────────────────────────────────── */
function RingChart({ pct, color, size=72 }) {
  const r=(size-10)/2; const circ=2*Math.PI*r; const dash=(pct/100)*circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition:"stroke-dasharray 1s ease" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill="#E3E8F3" fontSize={size<72?"10":"13"} fontWeight="700">{pct}%</text>
    </svg>
  );
}

/* ─── Fee badge ──────────────────────────────────────────────── */
function FeeBadge({ status }) {
  const m = {
    paid:    {bg:C.greenDim, color:C.green, icon:<CheckCircle2 size={11}/>},
    pending: {bg:C.amberDim, color:C.amber, icon:<Clock size={11}/>},
    overdue: {bg:C.redDim,   color:C.red,   icon:<AlertCircle size={11}/>},
  };
  const s=m[status]??m.pending;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",
      borderRadius:"999px",background:s.bg,color:s.color,fontSize:"11px",fontWeight:700 }}>
      {s.icon}{status.charAt(0).toUpperCase()+status.slice(1)}
    </span>
  );
}

/* ─── Info row ───────────────────────────────────────────────── */
function InfoRow({ icon, label, value, accent }) {
  return (
    <div style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"11px 0",borderBottom:`1px solid ${C.soft}` }}>
      <div style={{ width:32,height:32,borderRadius:"8px",background:C.soft,flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"center",color:C.muted }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:"10px",color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:"15px",color:accent||C.text,fontWeight:500 }}>{value||"—"}</div>
      </div>
    </div>
  );
}

/* ─── Section title ──────────────────────────────────────────── */
function SectionTitle({ icon, title }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:4,marginTop:16,
      paddingBottom:8,borderBottom:`1px solid rgba(10,129,209,0.15)` }}>
      <span style={{ color:C.blue }}>{icon}</span>
      <span style={{ fontSize:"11px",color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>{title}</span>
    </div>
  );
}

/* ─── Form field ─────────────────────────────────────────────── */
function FormField({ label, value, onChange, type="text", options }) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block",fontSize:"11px",color:C.muted,fontWeight:700,
        textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5 }}>{label}</label>
      {options ? (
        <select value={value} onChange={e=>onChange(e.target.value)}
          style={{ width:"100%",padding:"10px 14px",borderRadius:"9px",background:"#1a1d28",
            border:`1px solid ${C.border}`,color:C.text,fontSize:"14px",outline:"none",cursor:"pointer" }}>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e=>onChange(e.target.value)}
          style={{ width:"100%",padding:"10px 14px",borderRadius:"9px",background:"#1a1d28",
            border:`1px solid ${C.border}`,color:C.text,fontSize:"14px",outline:"none",
            boxSizing:"border-box",transition:"border-color 0.15s" }}
          onFocus={e=>(e.currentTarget ).style.borderColor="rgba(10,129,209,0.5)"}
          onBlur={e=>(e.currentTarget).style.borderColor=C.border} />
      )}
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════════
   STUDENT DOWNLOAD MODAL
═══════════════════════════════════════════════════════════════ */
function StudentDownloadModal({ student, onClose }) {
  const acColor  = avatarColor(student.id);
  const paidPct  = Math.round((student.fees.paid / student.fees.totalAnnual) * 100);
  const avgMarks = Math.round(student.subjects.reduce((s, x) => s + x.marks, 0) / student.subjects.length);

  /* inject print CSS once */
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "stu-print-style";
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #stu-print-root { display: block !important; position: fixed; inset: 0; z-index: 999999; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById("stu-print-style")?.remove(); };
  }, []);

  const P = { margin: 0, fontSize: "12px", color: "#374151", lineHeight: 1.6 };
  const PL = { ...P, color: "#6b7280", minWidth: 120, flexShrink: 0 };
  const PV = { ...P, color: "#111827", fontWeight: 600 };

  function Row({ label, value }) {
    return (
      <div style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
        <span style={PL}>{label}</span>
        <span style={PV}>{value || "—"}</span>
      </div>
    );
  }
  function SecHead({ title }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px",
        paddingBottom: 6, borderBottom: "2px solid #d1d5db" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#111827", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {title}
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Printable area */}
      <div id="stu-print-root" style={{ width: "100%", height: "100%", background: "white",
        display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Action bar – hidden when printing */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 28px", background: "#111827", borderBottom: "1px solid rgba(255,255,255,0.1)",
          flexShrink: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#E3E8F3" }}>
            Student Profile – Print Preview
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.print()}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 20px",
                borderRadius: "8px", background: "#FF793F", border: "none",
                color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button onClick={onClose}
              style={{ width: 34, height: 34, borderRadius: "8px", background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)", color: "#94A3B8",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable print content */}
        <div style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 32px 48px",
            background: "white", minHeight: "100%" }}>

            {/* ── School header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingBottom: 16, borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>Indira Public School</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Affiliated · Est. 1990 · Tel: 011-2345-6789</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>Student Information Profile</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                  Printed: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* ── Student header card ── */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "18px 20px",
              background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, marginBottom: 20 }}>
              {/* Avatar */}
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: acColor,
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", fontWeight: 800, color: "white",
                border: "3px solid white", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                {initials(student)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: 4 }}>
                  {student.firstName} {student.lastName}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[
                    { label: "Class", val: `${student.class} – ${student.section}` },
                    { label: "Roll No.", val: student.rollNo },
                    { label: "Adm. No.", val: student.admissionNo },
                    { label: "Blood", val: student.bloodGroup },
                    { label: "Gender", val: student.gender },
                  ].map(b => (
                    <div key={b.label} style={{ padding: "4px 12px", borderRadius: 999,
                      background: "white", border: "1px solid #bae6fd",
                      fontSize: "12px", color: "#0369a1", fontWeight: 600 }}>
                      {b.label}: <span style={{ color: "#111827" }}>{b.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Stats */}
              <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                {[
                  { label: "Attendance", val: `${student.attendance}%`,
                    color: student.attendance >= 85 ? "#4cbc9a" : student.attendance >= 70 ? "#FBBF24" : "#fe4040" },
                  { label: "Avg Marks", val: `${avgMarks}/100`,
                    color: avgMarks >= 80 ? "#4cbc9a" : avgMarks >= 60 ? "#0a81d1" : "#FBBF24" },
                  { label: "Fee Paid", val: `${paidPct}%`,
                    color: paidPct === 100 ? "#4cbc9a" : paidPct >= 60 ? "#0a81d1" : "#FBBF24" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", padding: "8px 14px",
                    background: "white", border: "1px solid #e5e7eb", borderRadius: 10 }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Two-column layout ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              {/* Left col */}
              <div>
                <SecHead title="Personal Information" />
                <Row label="Full Name"      value={`${student.firstName} ${student.lastName}`} />
                <Row label="Date of Birth"  value={fmtDate(student.dob)} />
                <Row label="Blood Group"    value={student.bloodGroup} />
                <Row label="Gender"         value={student.gender} />
                <Row label="Nationality"    value={student.nationality} />
                <Row label="Religion"       value={student.religion} />
                <Row label="Category"       value={student.category} />
                <Row label="Phone"          value={student.phone} />
                <Row label="Email"          value={student.email} />
                <Row label="Address"        value={student.address} />

                <SecHead title="Academic Identity" />
                <Row label="Class & Section"  value={`Class ${student.class} – ${student.section}`} />
                <Row label="Roll Number"      value={student.rollNo} />
                <Row label="Admission No."    value={student.admissionNo} />
                <Row label="Admission Date"   value={fmtDate(student.admissionDate)} />

                <SecHead title="Emergency Contact" />
                <Row label="Name"     value={student.emergency.name} />
                <Row label="Relation" value={student.emergency.relation} />
                <Row label="Phone"    value={student.emergency.phone} />
              </div>

              {/* Right col */}
              <div>
                <SecHead title="Father's Details" />
                <Row label="Name"       value={student.father.name} />
                <Row label="Phone"      value={student.father.phone} />
                <Row label="Email"      value={student.father.email} />
                <Row label="Occupation" value={student.father.occupation} />

                <SecHead title="Mother's Details" />
                <Row label="Name"       value={student.mother.name} />
                <Row label="Phone"      value={student.mother.phone} />
                <Row label="Email"      value={student.mother.email} />
                <Row label="Occupation" value={student.mother.occupation} />

                <SecHead title="Fee Details" />
                <Row label="Total Annual"  value={fmtCurrency(student.fees.totalAnnual)} />
                <Row label="Amount Paid"   value={fmtCurrency(student.fees.paid)} />
                <Row label="Pending"       value={fmtCurrency(student.fees.pending)} />
                <Row label="Last Payment"  value={fmtDate(student.fees.lastPayment)} />
                {/* Fee progress bar */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>Payment Progress</span>
                    <span style={{ fontSize: "11px", fontWeight: 700,
                      color: paidPct === 100 ? "#4cbc9a" : "#d97706" }}>{paidPct}%</span>
                  </div>
                  <div style={{ height: 7, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${paidPct}%`,
                      background: paidPct === 100 ? "#4cbc9a" : "#0a81d1", borderRadius: 999 }} />
                  </div>
                </div>

                <SecHead title="Academic Performance" />
                {student.subjects.map((sub, i) => {
                  const pct = Math.round((sub.marks / sub.maxMarks) * 100);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ ...PL, minWidth: 120 }}>{sub.name}</span>
                      <span style={{ ...PV, minWidth: 50 }}>{sub.marks}/{sub.maxMarks}</span>
                      <div style={{ flex: 1, height: 5, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`,
                          background: gradeColor(sub.grade), borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: gradeColor(sub.grade),
                        minWidth: 26, textAlign: "right" }}>{sub.grade}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #e5e7eb",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                Generated by SikshaOS School Management System
              </span>
              <div style={{ display: "flex", gap: 32 }}>
                {["Class Teacher", "Principal", "Accounts"].map(s => (
                  <div key={s} style={{ textAlign: "center" }}>
                    <div style={{ width: 80, borderBottom: "1px solid #d1d5db", marginBottom: 4 }} />
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW DETAIL PANEL (read-only)
═══════════════════════════════════════════════════════════════ */

function StudentDetailPanel({ student, onClose, onEdit }) {
  const [tab, setTab] = useState<TabKey>("personal");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const tabs = [
    {key:"personal" , label:"Personal",  icon:<User size={14}/>},
    {key:"parents"  , label:"Parents",   icon:<Users size={14}/>},
    {key:"fees"     , label:"Fees",      icon:<DollarSign size={14}/>},
    {key:"academic", label:"Academic",  icon:<GraduationCap size={14}/>},
  ];
  const acColor  = avatarColor(student.id);
  const paidPct  = Math.round((student.fees.paid/student.fees.totalAnnual)*100);
  const avgMarks = Math.round(student.subjects.reduce((s,x)=>s+x.marks,0)/student.subjects.length);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed",inset:0,zIndex:400,display:"flex" }}>
      <div style={{ flex:1,background:"rgba(0,0,0,0.65)" }} onClick={onClose} />
      <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
        transition={{ type:"tween",duration:0.28,ease:[0.22,1,0.36,1] }}
        style={{ width:520,background:C.surface,borderLeft:`1px solid ${C.border}`,
          display:"flex",flexDirection:"column",height:"100vh",overflowY:"auto" }}>

        {/* Sticky header */}
        <div style={{ padding:"18px 22px 0",background:C.surface,position:"sticky",top:0,zIndex:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <span style={{ fontSize:"12px",color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em" }}>
              Student Profile
            </span>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>setDownloadOpen(true)} title="Download profile" style={{
                display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:"8px",
                background:"rgba(10,129,209,0.12)",border:"1px solid rgba(10,129,209,0.25)",
                color:C.blue,fontSize:"13px",fontWeight:700,cursor:"pointer",transition:"all 0.15s" }}
                onMouseEnter={e=>(e.currentTarget).style.background="rgba(10,129,209,0.22)"}
                onMouseLeave={e=>(e.currentTarget).style.background="rgba(10,129,209,0.12)"}>
                <Printer size={13}/> Download
              </button>
              <button onClick={onEdit} title="Edit student" style={{
                display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:"8px",
                background:"rgba(255,121,63,0.12)",border:"1px solid rgba(255,121,63,0.25)",
                color:C.orange,fontSize:"13px",fontWeight:700,cursor:"pointer",transition:"all 0.15s" }}
                onMouseEnter={e=>(e.currentTarget).style.background="rgba(255,121,63,0.22)"}
                onMouseLeave={e=>(e.currentTarget).style.background="rgba(255,121,63,0.12)"}>
                <Edit3 size={13}/> Edit
              </button>
              <button onClick={onClose} style={{ width:32,height:32,borderRadius:"8px",background:C.soft,
                border:`1px solid ${C.border}`,color:C.muted,display:"flex",alignItems:"center",
                justifyContent:"center",cursor:"pointer" }}>
                <X size={15}/>
              </button>
            </div>
          </div>
          {/* Avatar + name */}
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:18 }}>
            <div style={{ width:60,height:60,borderRadius:"50%",background:acColor,flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"20px",fontWeight:800,color:"#fff",border:`3px solid ${C.border}` }}>
              {initials(student)}
            </div>
            <div>
              <h2 style={{ margin:"0 0 4px",fontSize:"20px",fontWeight:700,color:C.text }}>
                {student.firstName} {student.lastName}
              </h2>
              <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                <span style={{ fontSize:"13px",color:C.blue,fontWeight:600 }}>Class {student.class} – {student.section}</span>
                <span style={{ fontSize:"11px",color:C.muted }}>Roll: {student.rollNo}</span>
                <span style={{ padding:"2px 8px",borderRadius:"999px",fontSize:"11px",fontWeight:600,
                  background:student.gender==="Female"?"rgba(255,255,255,0.07)":C.blueDim,
                  color:student.gender==="Female"?"#CBD5E1":C.blue }}>
                  {student.gender}
                </span>
              </div>
            </div>
            <div style={{ marginLeft:"auto",display:"flex",gap:12,flexShrink:0 }}>
              <div style={{ textAlign:"center" }}>
                <RingChart pct={student.attendance} size={52}
                  color={student.attendance>=85?C.green:student.attendance>=70?C.amber:C.red} />
                <div style={{ fontSize:"9px",color:C.muted,marginTop:2 }}>Attend.</div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display:"flex",gap:1,borderBottom:`2px solid ${C.soft}` }}>
            {tabs.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                display:"flex",alignItems:"center",gap:5,padding:"9px 14px",
                background:"transparent",border:"none",
                color:tab===t.key?C.blue:C.muted,fontSize:"13px",fontWeight:tab===t.key?700:500,
                cursor:"pointer",borderBottom:tab===t.key?`2px solid ${C.blue}`:"2px solid transparent",
                marginBottom:"-2px",transition:"all 0.15s" }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex:1,padding:"18px 22px 32px",overflowY:"auto" }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
              exit={{ opacity:0,y:-8 }} transition={{ duration:0.18 }}>

              {tab==="personal"&&(
                <div>
                  <SectionTitle icon={<User size={13}/>} title="Basic Info" />
                  <InfoRow icon={<User size={14}/>}        label="Full Name"      value={`${student.firstName} ${student.lastName}`} accent={C.text} />
                  <InfoRow icon={<Calendar size={14}/>}    label="Date of Birth"  value={fmtDate(student.dob)} />
                  <InfoRow icon={<Droplets size={14}/>}    label="Blood Group"    value={student.bloodGroup} accent={C.red} />
                  <InfoRow icon={<Shield size={14}/>}      label="Nationality"    value={student.nationality} />
                  <InfoRow icon={<Heart size={14}/>}       label="Religion"       value={student.religion} />
                  <InfoRow icon={<Users size={14}/>}       label="Category"       value={student.category} />
                  <SectionTitle icon={<Phone size={13}/>} title="Contact" />
                  <InfoRow icon={<Phone size={14}/>}       label="Phone"          value={student.phone} accent={C.blue} />
                  <InfoRow icon={<Mail size={14}/>}        label="Email"          value={student.email} accent={C.blue} />
                  <InfoRow icon={<MapPin size={14}/>}      label="Address"        value={student.address} />
                  <SectionTitle icon={<GraduationCap size={13}/>} title="Academic Identity" />
                  <InfoRow icon={<BookOpen size={14}/>}    label="Class & Section" value={`Class ${student.class} – ${student.section}`} accent={C.blue} />
                  <InfoRow icon={<GraduationCap size={14}/>} label="Roll Number"  value={student.rollNo} />
                  <InfoRow icon={<Home size={14}/>}        label="Admission No."  value={student.admissionNo} />
                  <InfoRow icon={<Calendar size={14}/>}    label="Admission Date" value={fmtDate(student.admissionDate)} />
                </div>
              )}

              {tab==="parents"&&(
                <div>
                  <SectionTitle icon={<Briefcase size={13}/>} title="Father's Details" />
                  <InfoRow icon={<User size={14}/>}      label="Name"        value={student.father.name} accent={C.text} />
                  <InfoRow icon={<Phone size={14}/>}     label="Phone"       value={student.father.phone} accent={C.blue} />
                  <InfoRow icon={<Mail size={14}/>}      label="Email"       value={student.father.email} accent={C.blue} />
                  <InfoRow icon={<Briefcase size={14}/>} label="Occupation"  value={student.father.occupation} />
                  <SectionTitle icon={<Heart size={13}/>} title="Mother's Details" />
                  <InfoRow icon={<User size={14}/>}      label="Name"        value={student.mother.name} accent={C.text} />
                  <InfoRow icon={<Phone size={14}/>}     label="Phone"       value={student.mother.phone} accent={C.blue} />
                  <InfoRow icon={<Mail size={14}/>}      label="Email"       value={student.mother.email} accent={C.blue} />
                  <InfoRow icon={<Briefcase size={14}/>} label="Occupation"  value={student.mother.occupation} />
                  <SectionTitle icon={<AlertCircle size={13}/>} title="Emergency Contact" />
                  <InfoRow icon={<User size={14}/>}      label="Name"        value={student.emergency.name} accent={C.text} />
                  <InfoRow icon={<Users size={14}/>}     label="Relation"    value={student.emergency.relation} />
                  <InfoRow icon={<Phone size={14}/>}     label="Phone"       value={student.emergency.phone} accent={C.red} />
                </div>
              )}

              {tab==="fees"&&(
                <div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
                    {[
                      {label:"Total Annual", value:fmtCurrency(student.fees.totalAnnual), color:C.text,  bg:C.soft},
                      {label:"Paid",         value:fmtCurrency(student.fees.paid),        color:C.green, bg:C.greenDim},
                      {label:"Pending",      value:fmtCurrency(student.fees.pending),     color:student.fees.pending>0?C.amber:C.green, bg:student.fees.pending>0?C.amberDim:C.greenDim},
                    ].map(s=>(
                      <div key={s.label} style={{ background:s.bg,borderRadius:10,padding:"12px",border:`1px solid ${C.border}` }}>
                        <div style={{ fontSize:"10px",color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5 }}>{s.label}</div>
                        <div style={{ fontSize:"15px",fontWeight:800,color:s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                      <span style={{ fontSize:"12px",color:C.muted }}>Payment Progress</span>
                      <span style={{ fontSize:"12px",fontWeight:700,color:paidPct===100?C.green:C.blue }}>{paidPct}%</span>
                    </div>
                    <div style={{ height:8,background:"rgba(255,255,255,0.08)",borderRadius:999,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${paidPct}%`,background:paidPct===100?C.green:C.blue,borderRadius:999,transition:"width 1s ease" }} />
                    </div>
                    <div style={{ fontSize:"11px",color:C.muted,marginTop:4 }}>Last payment: {fmtDate(student.fees.lastPayment)}</div>
                  </div>
                  <SectionTitle icon={<DollarSign size={13}/>} title="Installments" />
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {student.fees.installments.map((inst,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                        padding:"10px 12px",borderRadius:9,background:C.card,border:`1px solid ${C.border}` }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <div style={{ width:6,height:6,borderRadius:"50%",flexShrink:0,
                            background:inst.status==="paid"?C.green:inst.status==="overdue"?C.red:C.amber }} />
                          <div>
                            <div style={{ fontSize:"13px",fontWeight:600,color:C.text }}>{inst.month}</div>
                            {inst.date&&<div style={{ fontSize:"11px",color:C.muted }}>{fmtDate(inst.date)}</div>}
                          </div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <span style={{ fontSize:"13px",fontWeight:700,color:C.text }}>{fmtCurrency(inst.amount)}</span>
                          <FeeBadge status={inst.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                    width:"100%",marginTop:16,padding:"11px",borderRadius:10,
                    background:C.blueDim,border:"1px solid rgba(10,129,209,0.25)",
                    color:C.blue,fontSize:"13px",fontWeight:700,cursor:"pointer",transition:"all 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget).style.background="rgba(10,129,209,0.22)"}
                    onMouseLeave={e=>(e.currentTarget).style.background=C.blueDim}>
                    <Download size={14}/> Download Fee Receipt
                  </button>
                </div>
              )}

              {tab==="academic"&&(
                <div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
                    {[
                      {label:"Attendance", value:`${student.attendance}%`, color:student.attendance>=85?C.green:student.attendance>=70?C.amber:C.red},
                      {label:"Avg Marks",  value:`${avgMarks}/100`,        color:avgMarks>=80?C.green:avgMarks>=60?C.blue:C.amber},
                      {label:"Subjects",   value:`${student.subjects.length}`, color:C.blue},
                    ].map(s=>(
                      <div key={s.label} style={{ background:C.card,borderRadius:10,padding:"12px",border:`1px solid ${C.border}`,textAlign:"center" }}>
                        <div style={{ fontSize:"10px",color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5 }}>{s.label}</div>
                        <div style={{ fontSize:"18px",fontWeight:800,color:s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <SectionTitle icon={<BookOpen size={13}/>} title="Subject Performance" />
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {student.subjects.map((sub,i)=>{
                      const pct=Math.round((sub.marks/sub.maxMarks)*100);
                      return (
                        <div key={i} style={{ padding:"12px 14px",borderRadius:10,background:C.card,border:`1px solid ${C.border}` }}>
                          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7 }}>
                            <span style={{ fontSize:"13px",fontWeight:600,color:C.text }}>{sub.name}</span>
                            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                              <span style={{ fontSize:"13px",color:C.sub }}>{sub.marks}/{sub.maxMarks}</span>
                              <span style={{ width:28,height:28,borderRadius:"7px",background:gradeColor(sub.grade)+"22",
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontSize:"11px",fontWeight:800,color:gradeColor(sub.grade) }}>{sub.grade}</span>
                            </div>
                          </div>
                          <div style={{ height:5,background:"rgba(255,255,255,0.06)",borderRadius:999,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${pct}%`,background:gradeColor(sub.grade),borderRadius:999 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      {downloadOpen&&(
        <StudentDownloadModal student={student} onClose={()=>setDownloadOpen(false)} />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EDIT STUDENT PANEL
═══════════════════════════════════════════════════════════════ */
function EditStudentPanel({ student, onClose, onSave }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(student)));
  const [tab, setTab]     = useState("personal");
  const [saved, setSaved] = useState(false);

  const tabs = [
    {key:"personal", label:"Personal",   icon:<User size={14}/>},
    {key:"parents", label:"Parents",    icon:<Users size={14}/>},
    {key:"academic", label:"Attendance", icon:<GraduationCap size={14}/>},
  ];

  function handleSave() {
    onSave(draft);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  }

  function set(path, val) {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i=0;i<parts.length-1;i++) obj = obj[parts[i]];
      obj[parts[parts.length-1]] = val;
      return next;
    });
  }

  const acColor = avatarColor(student.id);
  const GENDERS   = ["Male","Female"];
  const BLOOD_GRP = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
  const CLASSES   = ["6th","7th","8th","9th","10th"];
  const SECTIONS  = ["A","B","C","D"];
  const CATS      = ["General","OBC","SC","ST","EWS"];

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed",inset:0,zIndex:400,display:"flex" }}>
      <div style={{ flex:1,background:"rgba(0,0,0,0.65)" }} onClick={onClose} />
      <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
        transition={{ type:"tween",duration:0.28,ease:[0.22,1,0.36,1] }}
        style={{ width:560,background:C.surface,borderLeft:`1px solid ${C.border}`,
          display:"flex",flexDirection:"column",height:"100vh" }}>

        {/* Sticky header */}
        <div style={{ padding:"18px 22px 0",background:C.surface,position:"sticky",top:0,zIndex:10,
          borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:40,height:40,borderRadius:"50%",background:acColor,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"15px",fontWeight:800,color:"#fff" }}>
                {initials(draft)}
              </div>
              <div>
                <div style={{ fontSize:"16px",fontWeight:700,color:C.text }}>{draft.firstName} {draft.lastName}</div>
                <div style={{ fontSize:"11px",color:C.muted }}>Editing student record</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={onClose} style={{ width:32,height:32,borderRadius:"8px",background:C.soft,
                border:`1px solid ${C.border}`,color:C.muted,display:"flex",alignItems:"center",
                justifyContent:"center",cursor:"pointer" }}>
                <X size={15}/>
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display:"flex",gap:1 }}>
            {tabs.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                display:"flex",alignItems:"center",gap:5,padding:"9px 14px",
                background:"transparent",border:"none",
                color:tab===t.key?C.orange:C.muted,fontSize:"13px",fontWeight:tab===t.key?700:500,
                cursor:"pointer",borderBottom:tab===t.key?`2px solid ${C.orange}`:"2px solid transparent",
                marginBottom:"-1px",transition:"all 0.15s" }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div style={{ flex:1,padding:"20px 22px 32px",overflowY:"auto" }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
              exit={{ opacity:0,y:-8 }} transition={{ duration:0.18 }}>

              {/* ── PERSONAL ── */}
              {tab==="personal"&&(
                <div>
                  <p style={{ margin:"0 0 16px",fontSize:"12px",color:C.muted }}>
                    Update the student's personal and contact information below.
                  </p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="First Name"  value={draft.firstName}  onChange={v=>set("firstName",v)} />
                    <FormField label="Last Name"   value={draft.lastName}   onChange={v=>set("lastName",v)} />
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Gender"      value={draft.gender}     onChange={v=>set("gender",v)} options={GENDERS} />
                    <FormField label="Blood Group" value={draft.bloodGroup} onChange={v=>set("bloodGroup",v)} options={BLOOD_GRP} />
                  </div>
                  <FormField label="Date of Birth" value={draft.dob} onChange={v=>set("dob",v)} type="date" />
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Nationality" value={draft.nationality} onChange={v=>set("nationality",v)} />
                    <FormField label="Religion"    value={draft.religion}    onChange={v=>set("religion",v)} />
                  </div>
                  <FormField label="Category" value={draft.category} onChange={v=>set("category",v)} options={CATS} />
                  <div style={{ height:1,background:C.border,margin:"8px 0 16px" }} />
                  <p style={{ margin:"0 0 12px",fontSize:"11px",color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>Contact Details</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Phone Number" value={draft.phone} onChange={v=>set("phone",v)} type="tel" />
                    <FormField label="Email Address" value={draft.email} onChange={v=>set("email",v)} type="email" />
                  </div>
                  <FormField label="Home Address" value={draft.address} onChange={v=>set("address",v)} />
                  <div style={{ height:1,background:C.border,margin:"8px 0 16px" }} />
                  <p style={{ margin:"0 0 12px",fontSize:"11px",color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>Academic Identity</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Class"      value={draft.class}   onChange={v=>set("class",v)} options={CLASSES} />
                    <FormField label="Section"    value={draft.section} onChange={v=>set("section",v)} options={SECTIONS} />
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Roll No."     value={draft.rollNo}      onChange={v=>set("rollNo",v)} />
                    <FormField label="Admission No" value={draft.admissionNo} onChange={v=>set("admissionNo",v)} />
                  </div>
                  <FormField label="Admission Date" value={draft.admissionDate} onChange={v=>set("admissionDate",v)} type="date" />
                </div>
              )}

              {/* ── PARENTS ── */}
              {tab==="parents"&&(
                <div>
                  <p style={{ margin:"0 0 16px",fontSize:"12px",color:C.muted }}>
                    Update parent/guardian and emergency contact information.
                  </p>
                  <p style={{ margin:"0 0 12px",fontSize:"11px",color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>Father's Details</p>
                  <FormField label="Father's Name"  value={draft.father.name}       onChange={v=>set("father.name",v)} />
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Phone"       value={draft.father.phone}       onChange={v=>set("father.phone",v)} type="tel" />
                    <FormField label="Email"       value={draft.father.email}       onChange={v=>set("father.email",v)} type="email" />
                  </div>
                  <FormField label="Occupation"    value={draft.father.occupation}  onChange={v=>set("father.occupation",v)} />
                  <div style={{ height:1,background:C.border,margin:"8px 0 16px" }} />
                  <p style={{ margin:"0 0 12px",fontSize:"11px",color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>Mother's Details</p>
                  <FormField label="Mother's Name"  value={draft.mother.name}       onChange={v=>set("mother.name",v)} />
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Phone"       value={draft.mother.phone}       onChange={v=>set("mother.phone",v)} type="tel" />
                    <FormField label="Email"       value={draft.mother.email}       onChange={v=>set("mother.email",v)} type="email" />
                  </div>
                  <FormField label="Occupation"    value={draft.mother.occupation}  onChange={v=>set("mother.occupation",v)} />
                  <div style={{ height:1,background:C.border,margin:"8px 0 16px" }} />
                  <p style={{ margin:"0 0 12px",fontSize:"11px",color:C.red,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>Emergency Contact</p>
                  <FormField label="Contact Name"  value={draft.emergency.name}     onChange={v=>set("emergency.name",v)} />
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                    <FormField label="Relation"    value={draft.emergency.relation} onChange={v=>set("emergency.relation",v)} />
                    <FormField label="Phone"       value={draft.emergency.phone}    onChange={v=>set("emergency.phone",v)} type="tel" />
                  </div>
                </div>
              )}

              {/* ── ATTENDANCE ── */}
              {tab==="academic"&&(
                <div>
                  <p style={{ margin:"0 0 24px",fontSize:"13px",color:C.muted }}>
                    Adjust the student's overall attendance percentage for the current term.
                  </p>

                  {/* Big ring display */}
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
                    padding:"28px 20px",borderRadius:14,background:C.card,
                    border:`1px solid ${C.border}`,marginBottom:24 }}>
                    <RingChart pct={draft.attendance} size={110}
                      color={draft.attendance>=85?C.green:draft.attendance>=70?C.amber:C.red} />
                    <div style={{ marginTop:12,fontSize:"14px",fontWeight:700,
                      color:draft.attendance>=85?C.green:draft.attendance>=70?C.amber:C.red }}>
                      {draft.attendance>=85?"Good Standing":draft.attendance>=70?"Needs Attention":"Critical — Below Minimum"}
                    </div>
                    <div style={{ fontSize:"12px",color:C.muted,marginTop:4 }}>
                      {draft.attendance>=85?"Attendance is satisfactory":"Minimum required: 75%"}
                    </div>
                  </div>

                  {/* Slider */}
                  <div style={{ padding:"20px",borderRadius:12,background:C.card,
                    border:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",
                      alignItems:"center",marginBottom:14 }}>
                      <label style={{ fontSize:"12px",color:C.muted,fontWeight:700,
                        textTransform:"uppercase",letterSpacing:"0.06em" }}>
                        Attendance (%)
                      </label>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <button onClick={()=>setDraft(p=>({...p,attendance:Math.max(0,p.attendance-1)}))}
                          style={{ width:26,height:26,borderRadius:"7px",background:"rgba(255,255,255,0.06)",
                            border:`1px solid ${C.border}`,color:C.text,fontSize:"14px",fontWeight:700,
                            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>−</button>
                        <input type="number" value={draft.attendance} min={0} max={100}
                          onChange={e=>setDraft(p=>({...p,attendance:Math.min(100,Math.max(0,Number(e.target.value)||0))}))}
                          style={{ width:56,padding:"6px 8px",borderRadius:"8px",background:"#1a1d28",
                            border:`1px solid rgba(10,129,209,0.3)`,color:C.blue,fontSize:"16px",
                            fontWeight:800,textAlign:"center",outline:"none" }} />
                        <button onClick={()=>setDraft(p=>({...p,attendance:Math.min(100,p.attendance+1)}))}
                          style={{ width:26,height:26,borderRadius:"7px",background:"rgba(255,255,255,0.06)",
                            border:`1px solid ${C.border}`,color:C.text,fontSize:"14px",fontWeight:700,
                            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>+</button>
                      </div>
                    </div>
                    <input type="range" min={0} max={100} value={draft.attendance}
                      onChange={e=>setDraft(p=>({...p,attendance:Number(e.target.value)}))}
                      style={{ width:"100%",
                        accentColor:draft.attendance>=85?C.green:draft.attendance>=70?C.amber:C.red }} />
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
                      <span style={{ fontSize:"11px",color:C.muted }}>0%</span>
                      <span style={{ fontSize:"11px",color:C.amber }}>75% min</span>
                      <span style={{ fontSize:"11px",color:C.muted }}>100%</span>
                    </div>
                  </div>

                  {/* Threshold hints */}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:16 }}>
                    {[
                      {range:"≥ 85%",  label:"Excellent",  color:C.green, bg:C.greenDim},
                      {range:"75–84%", label:"Satisfactory",color:C.blue,  bg:C.blueDim},
                      {range:"< 75%",  label:"At Risk",    color:C.red,   bg:C.redDim},
                    ].map(t=>(
                      <div key={t.label} style={{ padding:"10px 12px",borderRadius:10,
                        background:t.bg,border:`1px solid ${t.color}22`,textAlign:"center" }}>
                        <div style={{ fontSize:"12px",fontWeight:800,color:t.color }}>{t.range}</div>
                        <div style={{ fontSize:"10px",color:C.muted,marginTop:2 }}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom action bar */}
        <div style={{ padding:"14px 22px",borderTop:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:C.surface }}>
          <span style={{ fontSize:"12px",color:C.muted }}>All changes are saved locally</span>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={onClose} style={{ padding:"9px 18px",borderRadius:"9px",background:"transparent",
              border:`1px solid ${C.border}`,color:C.muted,fontSize:"13px",fontWeight:600,cursor:"pointer",
              transition:"all 0.15s" }}
              onMouseEnter={e=>(e.currentTarget).style.background="rgba(255,255,255,0.04)"}
              onMouseLeave={e=>(e.currentTarget).style.background="transparent"}>
              Cancel
            </button>
            <button onClick={handleSave} style={{
              display:"flex",alignItems:"center",gap:7,padding:"9px 22px",borderRadius:"9px",
              background:saved?C.greenDim:C.orange,border:"none",
              color:saved?C.green:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",transition:"all 0.2s" }}>
              {saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save Changes</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents]       = useState(INITIAL_STUDENTS);
  const [search, setSearch]           = useState("");
  const [selectedClass, setClass]     = useState("8th");
  const [selectedSection, setSection] = useState("A");
  const [classOpen, setClassOpen]     = useState(false);
  const [secOpen,   setSecOpen]       = useState(false);
  const [detailStudent, setDetail]    = useState(null);
  const [editStudent,   setEdit]      = useState(null);
  const [page, setPage]               = useState(1);
  const perPage = 7;

  const classes  = ["6th","7th","8th","9th","10th"];
  const sections = ["A","B","C","D"];

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email} ${s.phone}`.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  const pageData   = filtered.slice((page-1)*perPage, page*perPage);

  function handleSaveStudent(updated) {
    setStudents(prev => prev.map(s => s.id===updated.id ? updated : s));
    if (detailStudent?.id===updated.id) setDetail(updated);
  }

  return (
    <div style={{ minHeight:"100vh",background:C.bg,color:C.text }}>

      <TopNavbar active="sis" />

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <div style={{ padding:"28px 36px" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <div>
            <h1 style={{ margin:"0 0 4px",fontSize:"24px",fontWeight:700,color:C.text }}>Students</h1>
            <p style={{ margin:0,fontSize:"13px",color:C.muted }}>
              Class <span style={{ color:C.blue,fontWeight:600 }}>{selectedClass}</span> – Section{" "}
              <span style={{ color:C.blue,fontWeight:600 }}>{selectedSection}</span>
              {" · "}<span style={{ color:C.muted }}>{filtered.length} students</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
          {/* Class */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setClassOpen(o=>!o)} style={{ display:"flex",alignItems:"center",gap:12,
              padding:"0 16px",height:52,borderRadius:11,background:"rgba(104,104,104,0.1)",
              border:`1px solid ${classOpen?"rgba(255,255,255,0.14)":"transparent"}`,
              color:C.text,fontSize:"14px",fontWeight:600,cursor:"pointer" }}>
              {selectedClass} <ChevronDown size={13} color={C.muted}/>
            </button>
            <AnimatePresence>
              {classOpen&&(
                <motion.div initial={{ opacity:0,y:-6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }}
                  style={{ position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:200,background:"#1a1d28",
                    border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",minWidth:110,
                    boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
                  {classes.map(c=>(
                    <button key={c} onClick={()=>{setClass(c);setClassOpen(false);}} style={{
                      display:"block",width:"100%",textAlign:"left",padding:"9px 14px",
                      background:c===selectedClass?C.blueDim:"transparent",border:"none",
                      color:c===selectedClass?C.blue:C.text,fontSize:"13px",fontWeight:c===selectedClass?700:400,cursor:"pointer" }}>
                      {c}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setSecOpen(o=>!o)} style={{ display:"flex",alignItems:"center",gap:12,
              padding:"0 16px",height:52,borderRadius:11,background:"rgba(104,104,104,0.1)",
              border:`1px solid ${secOpen?"rgba(255,255,255,0.14)":"transparent"}`,
              color:C.text,fontSize:"14px",fontWeight:600,cursor:"pointer" }}>
              Section {selectedSection} <ChevronDown size={13} color={C.muted}/>
            </button>
            <AnimatePresence>
              {secOpen&&(
                <motion.div initial={{ opacity:0,y:-6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }}
                  style={{ position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:200,background:"#1a1d28",
                    border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",minWidth:110,
                    boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
                  {sections.map(s=>(
                    <button key={s} onClick={()=>{setSection(s);setSecOpen(false);}} style={{
                      display:"block",width:"100%",textAlign:"left",padding:"9px 14px",
                      background:s===selectedSection?C.blueDim:"transparent",border:"none",
                      color:s===selectedSection?C.blue:C.text,fontSize:"13px",fontWeight:s===selectedSection?700:400,cursor:"pointer" }}>
                      Section {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div style={{ flex:1,position:"relative" }}>
            <Search size={17} color={C.muted} style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)" }}/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
              placeholder="Search by name, email or phone…"
              style={{ width:"100%",height:52,borderRadius:11,background:"rgba(104,104,104,0.1)",
                border:`1px solid ${search?"rgba(255,255,255,0.14)":"transparent"}`,
                color:C.text,fontSize:"14px",paddingLeft:48,paddingRight:18,
                outline:"none",boxSizing:"border-box" }}/>
          </div>
        </div>

        {/* Table */}
        <div style={{ background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden" }}>
          {/* Header */}
          <div style={{ display:"grid",gridTemplateColumns:"1.6fr 0.9fr 1.3fr 1.8fr 0.9fr 1fr",
            padding:"13px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)",
            background:"rgba(255,255,255,0.02)" }}>
            {["First Name","Gender","Phone","Email","Blood","Action"].map((h,i)=>(
              <span key={h} style={{ fontSize:"12px",fontWeight:700,color:C.blue,
                textTransform:"uppercase",letterSpacing:"0.06em",textAlign:i===5?"right":"left" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {pageData.length===0?(
            <div style={{ padding:"40px",textAlign:"center",color:C.muted,fontSize:"14px" }}>
              No students found matching your search.
            </div>
          ):pageData.map((s,i)=>{
            const isEven=i%2===1;
            return (
              <motion.div key={s.id} initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay:i*0.03 }}
                style={{ display:"grid",gridTemplateColumns:"1.6fr 0.9fr 1.3fr 1.8fr 0.9fr 1fr",
                  padding:"16px 24px",alignItems:"center",
                  background:isEven?"rgba(255,255,255,0.02)":"transparent",
                  borderBottom:`1px solid ${C.soft}`,transition:"background 0.15s",cursor:"default" }}
                onMouseEnter={e=>(e.currentTarget).style.background="rgba(10,129,209,0.04)"}
                onMouseLeave={e=>(e.currentTarget).style.background=isEven?"rgba(255,255,255,0.02)":"transparent"}>
                {/* Name */}
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",background:avatarColor(s.id),
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"12px",fontWeight:800,color:"#fff",flexShrink:0 }}>{initials(s)}</div>
                  <div>
                    <div style={{ fontSize:"14px",fontWeight:600,color:C.text }}>{s.firstName} {s.lastName}</div>
                    <div style={{ fontSize:"11px",color:C.muted }}>Roll {s.rollNo}</div>
                  </div>
                </div>
                {/* Gender */}
                <span style={{ fontSize:"13px",color:C.sub }}>{s.gender}</span>
                {/* Phone */}
                <span style={{ fontSize:"13px",color:C.sub }}>{s.phone}</span>
                {/* Email */}
                <span style={{ fontSize:"12px",color:C.sub }}>{s.email}</span>
                {/* Blood */}
                <span style={{ fontSize:"13px",fontWeight:700,color:C.red }}>{s.bloodGroup}</span>
                {/* Actions */}
                <div style={{ display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end" }}>
                  <button title="Edit" onClick={()=>setEdit(s)} style={{ width:30,height:30,borderRadius:"7px",
                    background:C.soft,border:`1px solid ${C.border}`,color:C.muted,
                    display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s" }}
                    onMouseEnter={e=>{const b=e.currentTarget;b.style.background="rgba(255,121,63,0.12)";b.style.color=C.orange;b.style.borderColor="rgba(255,121,63,0.3)";}}
                    onMouseLeave={e=>{const b=e.currentTarget;b.style.background=C.soft;b.style.color=C.muted;b.style.borderColor=C.border;}}>
                    <Edit3 size={13}/>
                  </button>
                  <button title="Info" onClick={()=>setDetail(s)} style={{ width:30,height:30,borderRadius:"7px",
                    background:C.blueDim,border:"1px solid rgba(10,129,209,0.25)",color:C.blue,
                    display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s" }}
                    onMouseEnter={e=>{const b=e.currentTarget;b.style.background="rgba(10,129,209,0.22)";b.style.transform="scale(1.08)";}}
                    onMouseLeave={e=>{const b=e.currentTarget;b.style.background=C.blueDim;b.style.transform="scale(1)";}}>
                    <Info size={14}/>
                  </button>
                  <button title="Delete" style={{ width:30,height:30,borderRadius:"7px",
                    background:C.soft,border:`1px solid ${C.border}`,color:C.muted,
                    display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s" }}
                    onMouseEnter={e=>{const b=e.currentTarget;b.style.background=C.redDim;b.style.color=C.red;b.style.borderColor="rgba(254,64,64,0.3)";}}
                    onMouseLeave={e=>{const b=e.currentTarget;b.style.background=C.soft;b.style.color=C.muted;b.style.borderColor=C.border;}}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:18 }}>
          <p style={{ margin:0,fontSize:"13px",color:C.sub }}>
            Showing{" "}
            <span style={{ color:C.blue,fontWeight:700 }}>{filtered.length===0?0:(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)}</span>
            {" "}from{" "}
            <span style={{ color:C.blue,fontWeight:700 }}>{filtered.length}</span> students
          </p>
          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ width:28,height:28,
              borderRadius:"50%",background:"transparent",border:`1px solid ${C.blue}`,color:C.blue,
              display:"flex",alignItems:"center",justifyContent:"center",cursor:page===1?"not-allowed":"pointer",
              opacity:page===1?0.4:1 }}>
              <ChevronLeft size={13}/>
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
              <button key={n} onClick={()=>setPage(n)} style={{ width:28,height:28,borderRadius:"50%",
                background:n===page?C.blue:"transparent",border:`1px solid ${C.blue}`,
                color:n===page?"#fff":C.blue,fontSize:"12px",fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                {n}
              </button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ width:28,height:28,
              borderRadius:"50%",background:"transparent",border:`1px solid ${C.blue}`,color:C.blue,
              display:"flex",alignItems:"center",justifyContent:"center",cursor:page===totalPages?"not-allowed":"pointer",
              opacity:page===totalPages?0.4:1 }}>
              <ChevronRight size={13}/>
            </button>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {detailStudent&&!editStudent&&(
          <StudentDetailPanel
            student={detailStudent}
            onClose={()=>setDetail(null)}
            onEdit={()=>{ setEdit(detailStudent); setDetail(null); }}
          />
        )}
      </AnimatePresence>

      {/* Edit panel */}
      <AnimatePresence>
        {editStudent&&(
          <EditStudentPanel
            student={editStudent}
            onClose={()=>setEdit(null)}
            onSave={updated=>{ handleSaveStudent(updated); setEdit(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
