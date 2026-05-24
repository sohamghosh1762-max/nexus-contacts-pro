import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#050911",
  bgS: "#080E1A",
  bgC: "#0C1525",
  bgCH: "#101C2F",
  bgInput: "#0A1020",
  b: "rgba(255,255,255,0.06)",
  bL: "rgba(255,255,255,0.11)",
  bA: "rgba(37,99,235,0.35)",
  acc: "#2563EB",
  accL: "#3B82F6",
  accD: "#1D4ED8",
  accG: "rgba(37,99,235,0.12)",
  teal: "#0EA5E9",
  purple: "#7C3AED",
  rose: "#F43F5E",
  amber: "#F59E0B",
  green: "#10B981",
  orange: "#F97316",
  tp: "#EFF6FF",
  ts: "#94A3B8",
  tm: "#4B5E7A",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const initials = (n = "") => n.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2);
const PALETTE = [C.acc, C.teal, C.purple, C.rose, C.amber, C.green, C.orange];
const aColor = (name = "") => PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];
const fmtRevenue = v => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`;

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DEPARTMENTS = ["Engineering","Sales","Finance","Marketing","Operations","Product","HR","Legal","Design"];

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Syne:wght@600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; font-family: 'Instrument Sans', sans-serif; color: ${C.tp}; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.4); }
    ::placeholder { color: ${C.tm} !important; opacity: 0.7; }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px ${C.bgInput} inset !important; -webkit-text-fill-color: ${C.tp} !important; }
    select option { background: ${C.bgC}; color: ${C.tp}; }
    input[type=range] { accent-color: ${C.acc}; }
    input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4) brightness(0.8); cursor: pointer; }
    .corp-btn-primary { background: linear-gradient(135deg, ${C.accD}, ${C.acc}); color: #fff; border: none; border-radius: 8px; font-family: 'Instrument Sans', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em; }
    .corp-btn-primary:hover { background: linear-gradient(135deg, ${C.acc}, #4F8EF7); box-shadow: 0 4px 18px rgba(37,99,235,0.35); transform: translateY(-1px); }
    .corp-btn-ghost { background: transparent; color: ${C.ts}; border: 1px solid ${C.b}; border-radius: 8px; font-family: 'Instrument Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .corp-btn-ghost:hover { border-color: ${C.bL}; background: rgba(255,255,255,0.04); color: ${C.tp}; }
    .corp-btn-danger { background: rgba(244,63,94,0.12); color: ${C.rose}; border: 1px solid rgba(244,63,94,0.25); border-radius: 8px; font-family: 'Instrument Sans', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .corp-btn-danger:hover { background: rgba(244,63,94,0.2); border-color: rgba(244,63,94,0.4); }
    .corp-btn-edit { background: rgba(14,165,233,0.1); color: ${C.teal}; border: 1px solid rgba(14,165,233,0.22); border-radius: 8px; font-family: 'Instrument Sans', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .corp-btn-edit:hover { background: rgba(14,165,233,0.18); border-color: rgba(14,165,233,0.4); }
    .row-hover:hover { background: rgba(37,99,235,0.06) !important; }
    .nav-item { transition: background 0.12s, color 0.12s; }
    .nav-item:hover { background: rgba(37,99,235,0.08) !important; color: ${C.accL} !important; }
    .card-lift { transition: transform 0.18s, box-shadow 0.18s; }
    .card-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.35); }
  `}</style>
);

// ─── Micro Components ─────────────────────────────────────────────────────────
const Av = ({ name, size = 36 }) => {
  const col = aColor(name);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${col}1E`, border: `1.5px solid ${col}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.33), fontWeight: 700, color: col, flexShrink: 0, letterSpacing: "-0.01em", fontFamily: "'Syne', sans-serif" }}>
      {initials(name)}
    </div>
  );
};

const Badge = ({ label, color = C.tm }) => (
  <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${color}16`, color, border: `1px solid ${color}28`, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
    {label}
  </span>
);

const StatusDot = ({ status }) => {
  const col = status === "active" ? C.green : status === "away" ? C.amber : C.tm;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: col, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: col, display: "inline-block", boxShadow: status === "active" ? `0 0 5px ${col}` : "none" }} />
      {status}
    </span>
  );
};

const PerfBar = ({ val, color, width = 72 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ height: 4, width, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(val, 0)}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ height: "100%", background: `linear-gradient(90deg, ${color || aColor("x")}, ${color || aColor("x")}bb)`, borderRadius: 99 }} />
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: color || C.ts, minWidth: 28, textAlign: "right" }}>{val}%</span>
  </div>
);

const MiniBar = ({ data, metric, color }) => {
  const max = Math.max(...data.map(d => d[metric]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 76 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d[metric] / max) * 64}px` }} transition={{ duration: 0.7, delay: i * 0.05 }}
            style={{ width: "100%", background: `linear-gradient(180deg, ${color}, ${color}77)`, borderRadius: "3px 3px 2px 2px", minHeight: 3 }} />
          <span style={{ fontSize: 9, color: C.tm, letterSpacing: "0.04em" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.tm, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Nexus Pro</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: C.tp, margin: 0, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: C.ts, marginTop: 4 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Div = ({ style }) => <div style={{ height: 1, background: C.b, ...style }} />;

// ─── Input System ─────────────────────────────────────────────────────────────
const inpBase = { background: C.bgInput, border: `1px solid ${C.b}`, borderRadius: 8, color: C.tp, fontSize: 13, padding: "9px 12px", width: "100%", outline: "none", fontFamily: "'Instrument Sans', sans-serif", transition: "border-color 0.15s" };

const Inp = ({ label, required, ...p }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, marginBottom: 5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}{required && <span style={{ color: C.rose, marginLeft: 3 }}>*</span>}</div>}
    <input style={inpBase} onFocus={e => (e.target.style.borderColor = C.bA)} onBlur={e => (e.target.style.borderColor = C.b)} {...p} />
  </div>
);

const Sel = ({ label, options, ...p }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, marginBottom: 5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>}
    <select style={{ ...inpBase, appearance: "none", cursor: "pointer" }} onFocus={e => (e.target.style.borderColor = C.bA)} onBlur={e => (e.target.style.borderColor = C.b)} {...p}>
      <option value="">— Select —</option>
      {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Pill tag ─────────────────────────────────────────────────────────────────
const Pill = ({ label, onRemove }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 9px", borderRadius: 4, background: `${C.acc}1A`, color: C.accL, border: `1px solid ${C.acc}28`, fontWeight: 500 }}>
    {label}
    {onRemove && <span onClick={onRemove} style={{ cursor: "pointer", opacity: 0.6, fontSize: 13, lineHeight: 1, marginLeft: 1 }}>×</span>}
  </span>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, subtitle, onClose, children, width = 580 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(4px)" }}>
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: C.bgC, border: `1px solid ${C.bL}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.12)" }}>
      <div style={{ padding: "18px 24px 16px", borderBottom: `1px solid ${C.b}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: C.ts, marginTop: 3 }}>{subtitle}</div>}
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.b}`, borderRadius: 6, cursor: "pointer", color: C.ts, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✕</button>
      </div>
      <div style={{ overflowY: "auto", padding: "20px 24px 24px", flex: 1 }}>{children}</div>
    </motion.div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const col = type === "success" ? C.green : type === "error" ? C.rose : C.acc;
  return (
    <motion.div initial={{ opacity: 0, y: 40, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}
      style={{ position: "fixed", bottom: 28, left: "50%", zIndex: 9999, background: C.bgC, border: `1px solid ${col}40`, borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${col}20` }}>
      <span style={{ fontSize: 15 }}>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      <span style={{ fontSize: 13, color: C.tp, fontWeight: 500 }}>{msg}</span>
    </motion.div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const Confirm = ({ title, msg, onConfirm, onCancel, danger = true }) => (
  <Modal title={title} onClose={onCancel} width={400}>
    <p style={{ color: C.ts, fontSize: 14, lineHeight: 1.65, marginBottom: 24 }}>{msg}</p>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <button className="corp-btn-ghost" onClick={onCancel} style={{ padding: "8px 18px", fontSize: 13 }}>Cancel</button>
      <button className={danger ? "corp-btn-danger" : "corp-btn-primary"} onClick={onConfirm} style={{ padding: "8px 18px", fontSize: 13 }}>Confirm</button>
    </div>
  </Modal>
);

// ─── Employee Form ────────────────────────────────────────────────────────────
const EmployeeForm = ({ initial = {}, teams, onSave, onClose, loading }) => {
  const isEdit = !!initial._id || !!initial.id;
  const [form, setForm] = useState({
    name: "", title: "", company: "", email: "", phone: "", department: "", team: "",
    location: "", linkedin: "", birthday: "", notes: "", performance: 75,
    status: "active", tags: [], interactions: 0, tasksCompleted: 0, dealsOwned: 0, revenue: 0,
    ...initial,
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = () => { if (validate()) onSave({ ...form, id: form._id || form.id || uid(), score: form.performance }); };
  const addTag = () => { const t = tagInput.trim(); if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]); setTagInput(""); };

  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.acc, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.b}` }}>Personal Information</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div>
          <Inp label="Full Name" required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" />
          {errors.name && <div style={{ fontSize: 11, color: C.rose, marginTop: -10, marginBottom: 10 }}>{errors.name}</div>}
        </div>
        <Inp label="Job Title" value={form.title} onChange={e => set("title", e.target.value)} placeholder="VP of Sales" />
        <Inp label="Company" value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Corp" />
        <div>
          <Inp label="Work Email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@company.com" />
          {errors.email && <div style={{ fontSize: 11, color: C.rose, marginTop: -10, marginBottom: 10 }}>{errors.email}</div>}
        </div>
        <Inp label="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
        <Inp label="Location" value={form.location} onChange={e => set("location", e.target.value)} placeholder="New York, NY" />
        <Inp label="Birthday" value={form.birthday} onChange={e => set("birthday", e.target.value)} placeholder="March 15" />
        <Inp label="LinkedIn" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/…" />
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: C.acc, letterSpacing: "0.12em", textTransform: "uppercase", margin: "6px 0 12px", paddingTop: 14, paddingBottom: 8, borderTop: `1px solid ${C.b}`, borderBottom: `1px solid ${C.b}` }}>Organization</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <Sel label="Department" value={form.department} onChange={e => set("department", e.target.value)} options={DEPARTMENTS} />
        <Sel label="Team" value={form.team} onChange={e => set("team", e.target.value)} options={teams.map(t => t.name)} />
        <Sel label="Status" value={form.status} onChange={e => set("status", e.target.value)} options={["active", "away", "inactive"]} />
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: C.acc, letterSpacing: "0.12em", textTransform: "uppercase", margin: "6px 0 12px", paddingTop: 14, paddingBottom: 8, borderTop: `1px solid ${C.b}`, borderBottom: `1px solid ${C.b}` }}>Performance Metrics</div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, letterSpacing: "0.1em", textTransform: "uppercase" }}>Performance Score</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: aColor(form.name || "x"), fontFamily: "'Syne', sans-serif" }}>{form.performance}%</div>
        </div>
        <input type="range" min={0} max={100} value={form.performance} onChange={e => set("performance", +e.target.value)} style={{ width: "100%" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.tm, marginTop: 4 }}>
          <span>Poor</span><span>Average</span><span>Excellent</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 12px" }}>
        <Inp label="Interactions" type="number" value={form.interactions} onChange={e => set("interactions", +e.target.value)} placeholder="0" />
        <Inp label="Tasks Done" type="number" value={form.tasksCompleted} onChange={e => set("tasksCompleted", +e.target.value)} placeholder="0" />
        <Inp label="Deals Owned" type="number" value={form.dealsOwned} onChange={e => set("dealsOwned", +e.target.value)} placeholder="0" />
        <Inp label="Revenue ($)" type="number" value={form.revenue} onChange={e => set("revenue", +e.target.value)} placeholder="0" />
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: C.acc, letterSpacing: "0.12em", textTransform: "uppercase", margin: "6px 0 12px", paddingTop: 14, paddingBottom: 8, borderTop: `1px solid ${C.b}`, borderBottom: `1px solid ${C.b}` }}>Notes & Tags</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, marginBottom: 5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Notes</div>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
          style={{ ...inpBase, resize: "vertical" }} placeholder="Key context about this contact…" />
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Tags</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", minHeight: 24 }}>
          {form.tags.map(t => <Pill key={t} label={t} onRemove={() => set("tags", form.tags.filter(x => x !== t))} />)}
          {!form.tags.length && <span style={{ fontSize: 12, color: C.tm }}>No tags yet</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()}
            style={{ ...inpBase, flex: 1 }} placeholder="Type tag & press Enter" />
          <button className="corp-btn-ghost" onClick={addTag} style={{ padding: "9px 14px", fontSize: 12, flexShrink: 0 }}>Add</button>
        </div>
      </div>

      <Div style={{ marginBottom: 18 }} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="corp-btn-ghost" onClick={onClose} style={{ padding: "9px 20px", fontSize: 13 }}>Cancel</button>
        <button className="corp-btn-primary" onClick={save} disabled={loading}
          style={{ padding: "9px 24px", fontSize: 13, opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}>
          {loading ? <><span style={{ width: 12, height: 12, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Saving…</> : isEdit ? "Save Changes" : "Add Contact"}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Overview", icon: "▪" },
  { id: "contacts", label: "Contacts", icon: "◉" },
  { id: "pipeline", label: "Pipeline", icon: "◈" },
  { id: "teams", label: "Teams", icon: "⬡" },
  { id: "analytics", label: "Analytics", icon: "▦" },
  { id: "activity", label: "Activity", icon: "◎" },
  { id: "calendar", label: "Calendar", icon: "⬜" },
  { id: "ai", label: "AI Assistant", icon: "✦" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const Sidebar = ({ active, set, collapsed, setCollapsed, badge }) => (
  <motion.div animate={{ width: collapsed ? 58 : 210 }} transition={{ duration: 0.2, ease: "easeInOut" }}
    style={{ background: C.bgS, borderRight: `1px solid ${C.b}`, display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0, overflow: "hidden" }}>
    <div style={{ padding: "16px 12px", borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, minHeight: 58 }}>
      <img
  src="/logo.png"
  alt="Nexus Contacts Pro"
  style={{
    width: 38,
    height: 38,
    objectFit: "contain",
    flexShrink: 0,
  }}
/>
      {!collapsed && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>Nexus Pro</div>
          <div style={{ fontSize: 9, color: C.tm, letterSpacing: "0.12em", textTransform: "uppercase" }}>Enterprise CRM</div>
        </div>
      )}
    </div>
    <nav style={{ flex: 1, padding: "10px 7px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
      {NAV.map(item => (
        <button key={item.id} className="nav-item" onClick={() => set(item.id)}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px" : "10px 11px", borderRadius: 8, border: "none", cursor: "pointer", background: active === item.id ? C.accG : "transparent", color: active === item.id ? C.accL : C.ts, width: "100%", justifyContent: collapsed ? "center" : "flex-start", position: "relative" }}>
          <span style={{ fontSize: 13, flexShrink: 0, opacity: active === item.id ? 1 : 0.6 }}>{item.icon}</span>
          {!collapsed && <span style={{ fontSize: 12, fontWeight: active === item.id ? 700 : 400, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{item.label}</span>}
          {!collapsed && item.id === "activity" && badge > 0 && (
            <span style={{ marginLeft: "auto", background: C.rose, color: "#fff", borderRadius: 99, fontSize: 9, fontWeight: 800, padding: "1px 6px", letterSpacing: "0.03em" }}>{badge}</span>
          )}
          {active === item.id && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 2, background: C.acc, borderRadius: "0 2px 2px 0" }} />}
        </button>
      ))}
    </nav>
    <div style={{ padding: "8px 7px", borderTop: `1px solid ${C.b}`, flexShrink: 0 }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", padding: "7px", borderRadius: 8, border: `1px solid ${C.b}`, cursor: "pointer", background: "transparent", color: C.tm, fontSize: 11, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-end", gap: 6 }}>
        {!collapsed && <span>Collapse</span>}
        <span style={{ fontSize: 12 }}>{collapsed ? "→" : "←"}</span>
      </button>
    </div>
  </motion.div>
);

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar = ({ searchQuery, setSearchQuery, badge, setPage, onLogout }) => (
  <div style={{ height: 56, background: C.bgS, borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 8, padding: "0 12px", maxWidth: 340, transition: "border-color 0.15s" }}
        onFocusCapture={e => e.currentTarget.style.borderColor = C.bA} onBlurCapture={e => e.currentTarget.style.borderColor = C.b}>
        <span style={{ color: C.tm, fontSize: 13, opacity: 0.7 }}>⌕</span>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search contacts, companies…"
          style={{ background: "transparent", border: "none", outline: "none", color: C.tp, fontSize: 12, padding: "9px 0", width: "100%", fontFamily: "'Instrument Sans', sans-serif" }} />
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => setPage("activity")} style={{ position: "relative", background: "transparent", border: `1px solid ${C.b}`, borderRadius: 8, cursor: "pointer", color: C.ts, fontSize: 14, padding: "6px 9px" }}>
        🔔{badge > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: C.rose, borderRadius: "50%", boxShadow: `0 0 6px ${C.rose}` }} />}
      </button>
      <button onClick={() => setPage("ai")} style={{ background: "linear-gradient(135deg,#1D4ED820,#7C3AED20)", border: `1px solid rgba(124,58,237,0.35)`, borderRadius: 8, cursor: "pointer", color: "#A78BFA", fontSize: 12, padding: "6px 12px", fontWeight: 600, fontFamily: "'Instrument Sans', sans-serif" }}>
        ✦ AI
      </button>
      <div style={{ width: 1, height: 24, background: C.b }} />
      <Av name="You" size={30} />
      {/* ─── LOGOUT BUTTON ─── */}
      <button
        onClick={onLogout}
        style={{
          background: "rgba(244,63,94,0.12)",
          color: C.rose,
          border: `1px solid rgba(244,63,94,0.28)`,
          padding: "7px 14px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "'Instrument Sans', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.15s",
          letterSpacing: "0.02em",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.22)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,63,94,0.12)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.28)"; }}
      >
        <span style={{ fontSize: 13 }}>⎋</span> Logout
      </button>
    </div>
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ employees, teams, setPage }) => {
  const totalRev = employees.reduce((s, e) => s + (e.revenue || 0), 0);
  const avgPerf = employees.length ? Math.round(employees.reduce((s, e) => s + (e.performance || 0), 0) / employees.length) : 0;
  const totalInteractions = employees.reduce((s, e) => s + (e.interactions || 0), 0);

  const teamStats = teams.map(t => {
    const members = employees.filter(e => e.team === t.name);
    const perf = members.length ? Math.round(members.reduce((s, m) => s + (m.performance || 0), 0) / members.length) : 0;
    const rev = members.reduce((s, m) => s + (m.revenue || 0), 0);
    return { ...t, perf, rev, count: members.length };
  });
  const chartData = teamStats.map(t => ({ label: t.name.slice(0, 4), performance: t.perf }));

  return (
    <div style={{ padding: "24px 24px 32px", overflowY: "auto", flex: 1 }}>
      <SectionHeader title="Executive Overview" subtitle="Real-time performance across all teams & contacts" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Contacts", value: employees.length, color: C.acc, icon: "◉", sub: "in database" },
          { label: "Pipeline Revenue", value: fmtRevenue(totalRev), color: C.teal, icon: "◈", sub: "total value" },
          { label: "Avg Performance", value: `${avgPerf}%`, color: C.green, icon: "▪", sub: "team average" },
          { label: "Interactions", value: totalInteractions, color: C.purple, icon: "◎", sub: "total logged" },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -3 }} className="card-lift"
            style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, padding: "18px 18px", position: "relative", overflow: "hidden", cursor: "default" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}00, ${s.color}, ${s.color}00)` }} />
            <div style={{ fontSize: 18, marginBottom: 8, opacity: 0.6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.tp, lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.ts, marginTop: 5 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 4, fontWeight: 600 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 16 }}>
        <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, marginBottom: 2, fontFamily: "'Syne', sans-serif" }}>Team Performance</div>
          <div style={{ fontSize: 11, color: C.tm, marginBottom: 14 }}>Average score per team</div>
          <MiniBar data={chartData} metric="performance" color={C.acc} />
        </div>
        <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Team Summary</div>
          {teamStats.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.tp, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                <div style={{ fontSize: 10, color: C.tm }}>{t.count} members</div>
              </div>
              <PerfBar val={t.perf} color={t.color} width={60} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>Top Performers</div>
            <button onClick={() => setPage("contacts")} style={{ fontSize: 11, color: C.accL, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View All →</button>
          </div>
          {employees.length === 0 && <div style={{ fontSize: 13, color: C.tm, textAlign: "center", padding: "20px 0" }}>No contacts yet.</div>}
          {[...employees].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5).map(e => (
            <div key={e._id || e.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Av name={e.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.tp, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                <div style={{ fontSize: 10, color: C.tm }}>{e.title || e.department}</div>
              </div>
              <PerfBar val={e.performance || 0} color={aColor(e.name)} width={60} />
            </div>
          ))}
        </div>
        <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Revenue by Team</div>
          {teamStats.filter(t => t.rev > 0).map(t => {
            const maxRev = Math.max(...teamStats.map(x => x.rev), 1);
            return (
              <div key={t.id} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.ts }}>{t.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{fmtRevenue(t.rev)}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(t.rev / maxRev) * 100}%` }} transition={{ duration: 0.9 }}
                    style={{ height: "100%", background: t.color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
          {teamStats.every(t => t.rev === 0) && <div style={{ fontSize: 13, color: C.tm, textAlign: "center", padding: "20px 0" }}>No revenue data yet.</div>}
        </div>
      </div>
    </div>
  );
};

// ─── AI INSIGHTS ──────────────────────────────────────────────────────────────
const AIInsights = ({ employees }) => {
  const analyzeEmployee = (emp) => {
    let burnoutRisk = "Low";
    let recommendation = "Keep maintaining current workflow.";
    let productivity = "Average";
    if (emp.tasksCompleted > 40 && emp.performance < 60) {
      burnoutRisk = "High";
      recommendation = "Reduce workload and schedule wellness breaks.";
    }
    if (emp.performance > 85 && emp.tasksCompleted > 20) {
      productivity = "Excellent";
      recommendation = "Eligible for leadership opportunities.";
    }
    if (emp.performance < 50) {
      productivity = "Poor";
      recommendation = "Needs mentoring and performance improvement plan.";
    }
    return { burnoutRisk, productivity, recommendation };
  };

  return (
    <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
      <SectionHeader title="AI Insights" subtitle="AI-powered workforce intelligence" />
      <div style={{ display: "grid", gap: "16px" }}>
        {employees.map((emp) => {
          const ai = analyzeEmployee(emp);
          return (
            <div key={emp._id || emp.id} style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: "14px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: C.tp }}>{emp.name}</div>
                  <div style={{ fontSize: "13px", color: C.ts }}>{emp.department}</div>
                </div>
                <Badge label={ai.burnoutRisk} color={ai.burnoutRisk === "High" ? C.rose : C.green} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: C.tm, marginBottom: "4px" }}>Performance</div>
                  <PerfBar val={emp.performance || 0} color={aColor(emp.name)} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: C.tm, marginBottom: "4px" }}>Productivity</div>
                  <div style={{ color: C.tp, fontWeight: "600" }}>{ai.productivity}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: C.tm, marginBottom: "4px" }}>Tasks Completed</div>
                  <div style={{ color: C.tp, fontWeight: "600" }}>{emp.tasksCompleted || 0}</div>
                </div>
              </div>
              <div style={{ background: `${C.acc}10`, border: `1px solid ${C.acc}25`, padding: "14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: C.accL, marginBottom: "6px" }}>AI Recommendation</div>
                <div style={{ fontSize: "13px", color: C.ts, lineHeight: "1.6" }}>{ai.recommendation}</div>
              </div>
            </div>
          );
        })}
        {employees.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.tm }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>✦</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No contacts to analyze yet.</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CONTACTS ─────────────────────────────────────────────────────────────────
const Contacts = ({ employees, setEmployees, teams, searchQuery, showToast }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selected) {
      const fresh = employees.find(e => (e._id || e.id) === (selected._id || selected.id));
      if (fresh) setSelected(fresh);
    }
  }, [employees]);

  const filtered = employees.filter(e => {
    const q = searchQuery.toLowerCase();
    const hit = e.name.toLowerCase().includes(q) || (e.company || "").toLowerCase().includes(q) || (e.email || "").toLowerCase().includes(q) || (e.department || "").toLowerCase().includes(q) || (e.team || "").toLowerCase().includes(q);
    if (filter === "vip") return hit && (e.tags || []).includes("VIP");
    if (filter === "active") return hit && e.status === "active";
    if (filter === "inactive") return hit && e.status === "inactive";
    return hit;
  });

  const openAdd = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (emp) => { setEditTarget({ ...emp }); setShowForm(true); };

  const saveEmployee = async (data) => {
    setSaving(true);
    try {
      if (editTarget) {
        const id = data._id || data.id;
        const res = await axios.put(`https://nexus-contacts-pro.onrender.com/api/employees/${id}`, data,
  {
    headers: {
      userid: user?._id,
    },
  }
);
        setEmployees(prev => prev.map(e => (e._id || e.id) === (res.data._id || res.data.id) ? res.data : e));
        showToast("Contact updated successfully", "success");
      } else {
        const res = await axios.post("https://nexus-contacts-pro.onrender.com/api/employees", data,
  {
    headers: {
      userid: user?._id,
    },
  }
);
        setEmployees(prev => [...prev, res.data]);
        showToast("Contact added successfully", "success");
      }
      setShowForm(false);
      setEditTarget(null);
    } catch {
      showToast("Failed to save contact. Check server connection.", "error");
    }
    setSaving(false);
  };

  const deleteEmployee = async (emp) => {
    const id = emp._id || emp.id;
    try {
      await axios.delete(`https://nexus-contacts-pro.onrender.com/api/employees/${id}`,
      {
        headers: {
      userid: user?._id,
    },
  }
);
      setEmployees(prev => prev.filter(e => (e._id || e.id) !== id));
      if ((selected?._id || selected?.id) === id) setSelected(null);
      showToast("Contact deleted", "success");
    } catch {
      showToast("Delete failed. Check server connection.", "error");
    }
    setConfirmDel(null);
  };

  const FILTERS = ["all", "active", "vip", "inactive"];

  return (
    <>
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        <div style={{ flex: selected ? "0 0 380px" : 1, borderRight: selected ? `1px solid ${C.b}` : "none", display: "flex", flexDirection: "column", transition: "flex 0.25s ease" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0, background: C.bgS }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>Contacts</span>
              <span style={{ fontSize: 11, color: C.tm, background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 99, padding: "1px 8px" }}>{filtered.length}</span>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: filter === f ? 700 : 400, background: filter === f ? C.accG : "transparent", color: filter === f ? C.accL : C.tm, fontFamily: "inherit", textTransform: "capitalize" }}>
                  {f}
                </button>
              ))}
            </div>
            <button className="corp-btn-primary" onClick={openAdd} style={{ padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>+</span> Add Contact
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 120px", padding: "8px 18px", background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${C.b}`, flexShrink: 0 }}>
            {["Contact", "Status", "Score", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.tm, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 12 }}>◉</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ts, marginBottom: 8 }}>No contacts found</div>
                <div style={{ fontSize: 13, color: C.tm, marginBottom: 16 }}>{searchQuery ? "Try a different search term" : "Get started by adding your first contact"}</div>
                <button className="corp-btn-primary" onClick={openAdd} style={{ padding: "8px 20px", fontSize: 13 }}>Add Contact</button>
              </div>
            )}
            {filtered.map((e, i) => {
              const eid = e._id || e.id;
              const sid = selected?._id || selected?.id;
              const isActive = sid === eid;
              return (
                <motion.div key={eid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                  className="row-hover"
                  style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 120px", alignItems: "center", padding: "11px 18px", cursor: "pointer", borderBottom: `1px solid ${C.b}`, background: isActive ? C.accG : "transparent", transition: "background 0.12s", minHeight: 58 }}
                  onClick={() => setSelected(isActive ? null : e)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Av name={e.name} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.tp, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: C.tm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}{e.company ? ` · ${e.company}` : ""}</div>
                      <div style={{ marginTop: 3, display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(e.tags || []).slice(0, 2).map(t => <Badge key={t} label={t} color={aColor(e.name)} />)}
                      </div>
                    </div>
                  </div>
                  <div><StatusDot status={e.status} /></div>
                  <div><PerfBar val={e.performance || 0} color={aColor(e.name)} width={50} /></div>
                  <div style={{ display: "flex", gap: 6 }} onClick={ev => ev.stopPropagation()}>
                    <button className="corp-btn-edit" onClick={() => openEdit(e)} style={{ padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>✎ Edit</button>
                    <button className="corp-btn-danger" onClick={() => setConfirmDel(e)} style={{ padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>✕ Del</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div key={selected._id || selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}
              style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 22px 18px", borderBottom: `1px solid ${C.b}`, background: C.bgS, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Av name={selected.name} size={52} />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>{selected.name}</div>
                      <div style={{ fontSize: 13, color: C.ts, marginTop: 2 }}>{selected.title}</div>
                      {selected.company && <div style={{ fontSize: 12, color: aColor(selected.name), marginTop: 3, fontWeight: 600 }}>{selected.company}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="corp-btn-edit" onClick={() => openEdit(selected)} style={{ padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>✎ Edit</button>
                    <button className="corp-btn-danger" onClick={() => setConfirmDel(selected)} style={{ padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>✕ Delete</button>
                    <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.b}`, borderRadius: 6, cursor: "pointer", color: C.ts, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {(selected.tags || []).map(t => <Badge key={t} label={t} color={aColor(selected.name)} />)}
                  {selected.team && <Badge label={selected.team} color={C.teal} />}
                  <StatusDot status={selected.status} />
                </div>
              </div>

              <div style={{ padding: "18px 22px", flex: 1 }}>
                <div style={{ background: `${aColor(selected.name)}0E`, border: `1px solid ${aColor(selected.name)}20`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, letterSpacing: "0.1em", textTransform: "uppercase" }}>Performance Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: aColor(selected.name), fontFamily: "'Syne', sans-serif" }}>{selected.performance || 0}%</div>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${selected.performance || 0}%` }} transition={{ duration: 1 }}
                      style={{ height: "100%", background: `linear-gradient(90deg, ${aColor(selected.name)}, ${aColor(selected.name)}88)`, borderRadius: 99 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    {[["Interactions", selected.interactions || 0], ["Tasks", selected.tasksCompleted || 0], ["Deals", selected.dealsOwned || 0], ["Revenue", fmtRevenue(selected.revenue || 0)]].map(([l, v]) => (
                      <div key={l} style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 4px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>{v}</div>
                        <div style={{ fontSize: 9, color: C.tm, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {[["✉", "Email", selected.email], ["📞", "Phone", selected.phone], ["🏢", "Department", selected.department], ["👥", "Team", selected.team], ["📍", "Location", selected.location], ["🎂", "Birthday", selected.birthday], ["🔗", "LinkedIn", selected.linkedin]].map(([ico, lbl, val]) => val ? (
                  <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.b}` }}>
                    <span style={{ fontSize: 14, width: 22, textAlign: "center" }}>{ico}</span>
                    <span style={{ fontSize: 11, color: C.tm, width: 88, flexShrink: 0, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{lbl}</span>
                    <span style={{ fontSize: 13, color: C.tp }}>{val}</span>
                  </div>
                ) : null)}
                {selected.notes && (
                  <div style={{ marginTop: 16, background: C.bgC, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.b}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, marginBottom: 7, letterSpacing: "0.1em", textTransform: "uppercase" }}>Notes</div>
                    <div style={{ fontSize: 13, color: C.ts, lineHeight: 1.65 }}>{selected.notes}</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                  {[["✉ Email", C.acc], ["📞 Call", C.teal], ["📅 Schedule", C.purple]].map(([l, col]) => (
                    <button key={l} style={{ flex: 1, padding: "9px 4px", background: `${col}14`, border: `1px solid ${col}28`, borderRadius: 9, color: col, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.14s" }}>{l}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <Modal title={editTarget ? "Edit Contact" : "Add New Contact"} subtitle={editTarget ? `Updating ${editTarget.name}` : "Fill in the details below"} onClose={() => { setShowForm(false); setEditTarget(null); }} width={640}>
            <EmployeeForm initial={editTarget || {}} teams={teams} onSave={saveEmployee} onClose={() => { setShowForm(false); setEditTarget(null); }} loading={saving} />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDel && (
          <Confirm title="Delete Contact" msg={`Are you sure you want to permanently delete ${confirmDel.name}? This action cannot be undone.`}
            onConfirm={() => deleteEmployee(confirmDel)} onCancel={() => setConfirmDel(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

// ─── TEAMS ────────────────────────────────────────────────────────────────────
const Teams = ({ employees, setEmployees, teams, setTeams, showToast }) => {
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState(C.acc);
  const [addMemberTarget, setAddMemberTarget] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [expandedTeam, setExpandedTeam] = useState(null);

  const teamStats = teams.map(t => {
    const members = employees.filter(e => e.team === t.name);
    const perf = members.length ? Math.round(members.reduce((s, m) => s + (m.performance || 0), 0) / members.length) : 0;
    const rev = members.reduce((s, m) => s + (m.revenue || 0), 0);
    const tasks = members.reduce((s, m) => s + (m.tasksCompleted || 0), 0);
    const deals = members.reduce((s, m) => s + (m.dealsOwned || 0), 0);
    return { ...t, members, perf, rev, tasks, deals };
  });

  const availableForTeam = (tName) => employees.filter(e => (e.team || "") !== tName);

  const addTeam = () => {
    if (!teamName.trim()) return;
    setTeams(prev => [...prev, { id: uid(), name: teamName.trim(), color: teamColor }]);
    setTeamName(""); setTeamColor(C.acc); setShowTeamForm(false);
    showToast("Team created", "success");
  };

  const removeTeam = (id, name) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    setEmployees(prev => prev.map(e => e.team === name ? { ...e, team: "" } : e));
    showToast("Team removed", "success");
  };

  const addMemberToTeam = (empId, tName) => {
    setEmployees(prev => prev.map(e => (e._id || e.id) === empId ? { ...e, team: tName } : e));
    setAddMemberTarget(null); setMemberSearch("");
    showToast("Member added to team", "success");
  };

  const removeMemberFromTeam = (empId) => {
    setEmployees(prev => prev.map(e => (e._id || e.id) === empId ? { ...e, team: "" } : e));
    showToast("Member removed from team", "success");
  };

  const COLORS = [C.acc, C.teal, C.purple, C.rose, C.amber, C.green, C.orange];

  return (
    <div style={{ padding: "24px 24px 32px", overflowY: "auto", flex: 1 }}>
      <SectionHeader title="Teams & Workspaces" subtitle="Manage team structure, members, and performance"
        action={<button className="corp-btn-primary" onClick={() => setShowTeamForm(true)} style={{ padding: "9px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>+ New Team</button>} />

      {teams.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 36, opacity: 0.25, marginBottom: 16 }}>⬡</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.ts, marginBottom: 8 }}>No teams yet</div>
          <div style={{ fontSize: 13, color: C.tm, marginBottom: 20 }}>Create your first workspace to organize contacts</div>
          <button className="corp-btn-primary" onClick={() => setShowTeamForm(true)} style={{ padding: "9px 20px", fontSize: 13 }}>Create Team</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {teamStats.map(t => {
          const isExpanded = expandedTeam === t.id;
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setExpandedTeam(isExpanded ? null : t.id)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${t.color}18`, border: `1.5px solid ${t.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: t.color, fontWeight: 800, fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>
                  {t.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.tm, marginTop: 2 }}>{t.members.length} member{t.members.length !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  {[["Avg Perf", `${t.perf}%`, t.color], ["Revenue", fmtRevenue(t.rev), C.green], ["Tasks", t.tasks, C.teal], ["Deals", t.deals, C.purple]].map(([l, v, col]) => (
                    <div key={l} style={{ textAlign: "center", minWidth: 48 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: col, fontFamily: "'Syne', sans-serif" }}>{v}</div>
                      <div style={{ fontSize: 9, color: C.tm, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginLeft: 12 }} onClick={ev => ev.stopPropagation()}>
                  <button className="corp-btn-primary" onClick={() => { setAddMemberTarget(t); setMemberSearch(""); }} style={{ padding: "6px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>+ Member</button>
                  <button className="corp-btn-danger" onClick={() => removeTeam(t.id, t.name)} style={{ padding: "6px 10px", fontSize: 12 }}>🗑</button>
                </div>
                <span style={{ fontSize: 11, color: C.tm, marginLeft: 4 }}>{isExpanded ? "▲" : "▼"}</span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {t.members.length === 0 ? (
                      <div style={{ padding: "14px 20px", textAlign: "center", borderTop: `1px solid ${C.b}` }}>
                        <span style={{ fontSize: 12, color: C.tm }}>No members yet. </span>
                        <button onClick={() => setAddMemberTarget(t)} style={{ fontSize: 12, color: C.accL, background: "none", border: "none", cursor: "pointer" }}>Add members →</button>
                      </div>
                    ) : (
                      <div style={{ borderTop: `1px solid ${C.b}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 70px 80px 60px", padding: "8px 20px", background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${C.b}` }}>
                          {["Member", "Status", "Perf", "Tasks", "Deals", "Revenue", ""].map(h => (
                            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: C.tm, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
                          ))}
                        </div>
                        {t.members.map((m, mi) => (
                          <div key={m._id || m.id} className="row-hover"
                            style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 70px 80px 60px", alignItems: "center", padding: "11px 20px", borderBottom: mi < t.members.length - 1 ? `1px solid ${C.b}` : "none", transition: "background 0.12s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <Av name={m.name} size={32} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: C.tp, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                                <div style={{ fontSize: 10, color: C.tm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title || m.department}</div>
                              </div>
                            </div>
                            <div><StatusDot status={m.status} /></div>
                            <div><PerfBar val={m.performance || 0} color={aColor(m.name)} width={52} /></div>
                            <div style={{ fontSize: 12, color: C.ts }}>{m.tasksCompleted || 0}</div>
                            <div style={{ fontSize: 12, color: C.ts }}>{m.dealsOwned || 0}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{fmtRevenue(m.revenue || 0)}</div>
                            <div>
                              <button onClick={() => removeMemberFromTeam(m._id || m.id)} style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 6, cursor: "pointer", color: C.rose, fontSize: 11, padding: "4px 8px", fontFamily: "inherit" }}>Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showTeamForm && (
          <Modal title="Create New Team" subtitle="Set up a workspace for your team" onClose={() => setShowTeamForm(false)} width={400}>
            <Inp label="Team Name" required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Sales Frontline" />
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Team Color</div>
              <div style={{ display: "flex", gap: 10 }}>
                {COLORS.map(col => (
                  <div key={col} onClick={() => setTeamColor(col)}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: col, cursor: "pointer", border: teamColor === col ? "3px solid white" : "2px solid transparent", transition: "border 0.12s, transform 0.12s", transform: teamColor === col ? "scale(1.15)" : "scale(1)" }} />
                ))}
              </div>
            </div>
            <Div style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="corp-btn-ghost" onClick={() => setShowTeamForm(false)} style={{ padding: "8px 18px", fontSize: 13 }}>Cancel</button>
              <button className="corp-btn-primary" onClick={addTeam} style={{ padding: "8px 20px", fontSize: 13 }}>Create Team</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addMemberTarget && (
          <Modal title={`Add Member to "${addMemberTarget.name}"`} subtitle="Select from contacts not already in this team" onClose={() => { setAddMemberTarget(null); setMemberSearch(""); }} width={480}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bgInput, border: `1px solid ${C.b}`, borderRadius: 8, padding: "0 12px", marginBottom: 14 }}>
              <span style={{ color: C.tm, fontSize: 13 }}>⌕</span>
              <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Search by name, title, department…"
                style={{ ...inpBase, border: "none", padding: "9px 0", flex: 1 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
              {availableForTeam(addMemberTarget.name).filter(e => {
                const q = memberSearch.toLowerCase();
                return !q || e.name.toLowerCase().includes(q) || (e.title || "").toLowerCase().includes(q) || (e.department || "").toLowerCase().includes(q);
              }).map(emp => (
                <div key={emp._id || emp.id} className="row-hover"
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: C.bgS, borderRadius: 10, border: `1px solid ${C.b}`, cursor: "default", transition: "background 0.12s" }}>
                  <Av name={emp.name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.tp }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: C.tm }}>{emp.title || "—"} {emp.department ? `· ${emp.department}` : ""}</div>
                    {emp.team && <div style={{ fontSize: 10, color: C.amber, marginTop: 2 }}>Currently in: {emp.team}</div>}
                  </div>
                  <PerfBar val={emp.performance || 0} color={aColor(emp.name)} width={48} />
                  <button className="corp-btn-primary" onClick={() => addMemberToTeam(emp._id || emp.id, addMemberTarget.name)} style={{ padding: "6px 14px", fontSize: 12, flexShrink: 0 }}>Add</button>
                </div>
              ))}
              {availableForTeam(addMemberTarget.name).filter(e => {
                const q = memberSearch.toLowerCase();
                return !q || e.name.toLowerCase().includes(q) || (e.title || "").toLowerCase().includes(q) || (e.department || "").toLowerCase().includes(q);
              }).length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: C.tm, fontSize: 13 }}>
                  {employees.length === 0 ? "No contacts exist yet. Add contacts first." : "All contacts are already in this team or no match found."}
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
const Analytics = ({ employees, teams }) => {
  const teamStats = teams.map(t => {
    const members = employees.filter(e => e.team === t.name);
    const perf = members.length ? Math.round(members.reduce((s, m) => s + (m.performance || 0), 0) / members.length) : 0;
    const rev = members.reduce((s, m) => s + (m.revenue || 0), 0);
    const tasks = members.reduce((s, m) => s + (m.tasksCompleted || 0), 0);
    const deals = members.reduce((s, m) => s + (m.dealsOwned || 0), 0);
    return { ...t, members, perf, rev, tasks, deals, count: members.length };
  });
  const deptMap = {};
  employees.forEach(e => { if (e.department) deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
  const deptData = Object.entries(deptMap).map(([name, count], i) => ({ name, count, color: PALETTE[i % PALETTE.length] }));
  const deptTotal = deptData.reduce((s, d) => s + d.count, 0);
  const totalRev = employees.reduce((s, e) => s + (e.revenue || 0), 0);
  const avgPerf = employees.length ? Math.round(employees.reduce((s, e) => s + (e.performance || 0), 0) / employees.length) : 0;

  return (
    <div style={{ padding: "24px 24px 32px", overflowY: "auto", flex: 1 }}>
      <SectionHeader title="Analytics & Insights" subtitle="Performance intelligence across your organization" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[["Total Revenue", fmtRevenue(totalRev), C.acc], ["Avg Performance", `${avgPerf}%`, C.green], ["Total Deals", employees.reduce((s, e) => s + (e.dealsOwned || 0), 0), C.purple], ["Tasks Done", employees.reduce((s, e) => s + (e.tasksCompleted || 0), 0), C.teal]].map(([l, v, col]) => (
          <div key={l} style={{ background: C.bgC, borderRadius: 12, border: `1px solid ${C.b}`, padding: "15px 16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${col}00, ${col}66)` }} />
            <div style={{ fontSize: 10, color: C.tm, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: col, fontFamily: "'Syne', sans-serif" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.b}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>Team Performance Breakdown</span>
          <Badge label={`${teams.length} teams`} color={C.acc} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Team", "Members", "Avg Score", "Revenue", "Deals", "Tasks"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.tm, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${C.b}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamStats.map((t, i) => (
                <tr key={t.id} className="row-hover" style={{ borderBottom: i < teamStats.length - 1 ? `1px solid ${C.b}` : "none", transition: "background 0.1s" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.tp }}>{t.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.ts }}>{t.count}</td>
                  <td style={{ padding: "12px 16px" }}><PerfBar val={t.perf} color={t.color} width={72} /></td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.green }}>{fmtRevenue(t.rev)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.ts }}>{t.deals}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.ts }}>{t.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.tp, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Department Breakdown</div>
          {deptData.length === 0 && <div style={{ fontSize: 13, color: C.tm, textAlign: "center", padding: "20px 0" }}>No department data yet.</div>}
          {deptData.map(d => (
            <div key={d.name} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: C.ts }}>{d.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.count} ({deptTotal ? Math.round((d.count / deptTotal) * 100) : 0}%)</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${deptTotal ? (d.count / deptTotal) * 100 : 0}%` }} transition={{ duration: 0.8 }}
                  style={{ height: "100%", background: d.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.tp, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Individual Top Performers</div>
          {employees.length === 0 && <div style={{ fontSize: 13, color: C.tm, textAlign: "center", padding: "20px 0" }}>No contacts yet.</div>}
          {[...employees].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 7).map((e, i) => (
            <div key={e._id || e.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.tm, width: 18, textAlign: "right", fontFamily: "'Syne', sans-serif" }}>#{i + 1}</span>
              <Av name={e.name} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.tp, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                <div style={{ fontSize: 10, color: C.tm }}>{e.team || e.department || "Unassigned"}</div>
              </div>
              <PerfBar val={e.performance || 0} color={aColor(e.name)} width={56} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
const Calendar = ({ events = [], setEvents }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const mkDate = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEv, setNewEv] = useState({ title: "", type: "meeting", color: C.acc, date: "" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const eventsOn = (d) => events.filter(e => e.date === mkDate(d));
  const selectedDayEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];
  const monthHolidays = events.filter(e => e.type === "holiday" && e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));

  const addEvent = async () => {
    if (!newEv.title.trim() || !newEv.date) return;
    try {
      const res = await axios.post("https://nexus-contacts-pro.onrender.com/api/events", { title: newEv.title, type: newEv.type, date: newEv.date });
      setEvents(prev => [...prev, res.data]);
      setNewEv({ title: "", type: "meeting", color: C.acc, date: "" });
      setShowForm(false);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`https://nexus-contacts-pro.onrender.com/api/employees/${id}`,
      {
    headers: {
      userid: user?._id,
    },
  }
);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const EV_TYPES = ["meeting", "holiday", "reminder", "deadline", "personal", "review"];
  const EV_COLORS = [C.acc, C.teal, C.purple, C.rose, C.amber, C.green, C.orange];

  return (
    <div style={{ padding: "24px 24px 32px", overflowY: "auto", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Nexus Pro</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.tp, margin: 0, fontFamily: "'Syne', sans-serif" }}>{MONTH_NAMES[month]} {year}</h1>
          <p style={{ fontSize: 13, color: C.ts, marginTop: 4 }}>{events.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length} events this month</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="corp-btn-ghost" onClick={() => { const d = new Date(year, month - 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }} style={{ padding: "7px 12px", fontSize: 14 }}>←</button>
          <button className="corp-btn-ghost" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ padding: "7px 12px", fontSize: 12 }}>Today</button>
          <button className="corp-btn-ghost" onClick={() => { const d = new Date(year, month + 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }} style={{ padding: "7px 12px", fontSize: 14 }}>→</button>
          <button className="corp-btn-primary" onClick={() => { setNewEv({ title: "", type: "meeting", color: C.acc, date: selectedDate || todayStr }); setShowForm(true); }} style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>+ Add Event</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 264px", gap: 16 }}>
        <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${C.b}` }}>
            {DAY_NAMES.map(d => <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.tm, letterSpacing: "0.08em", textTransform: "uppercase" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e${i}`} style={{ minHeight: 88, borderRight: `1px solid ${C.b}`, borderBottom: `1px solid ${C.b}`, background: "rgba(0,0,0,0.1)" }} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const ds = mkDate(d);
              const dayEvs = eventsOn(d);
              const isToday = ds === todayStr;
              const isSel = ds === selectedDate;
              return (
                <div key={d} onClick={() => setSelectedDate(isSel ? null : ds)}
                  style={{ minHeight: 88, borderRight: `1px solid ${C.b}`, borderBottom: `1px solid ${C.b}`, padding: "6px 7px", cursor: "pointer", background: isSel ? C.accG : isToday ? "rgba(37,99,235,0.04)" : "transparent", transition: "background 0.12s" }}>
                  <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 400, color: isToday ? "#fff" : C.ts, width: 26, height: 26, borderRadius: isToday ? "50%" : 6, display: "flex", alignItems: "center", justifyContent: "center", background: isToday ? C.acc : "transparent", marginBottom: 4, boxShadow: isToday ? `0 0 12px ${C.acc}66` : "none" }}>
                    {d}
                  </div>
                  {dayEvs.slice(0, 2).map(ev => (
                    <div key={ev._id || ev.id} style={{ fontSize: 10, fontWeight: 600, color: ev.color || C.acc, background: `${ev.color || C.acc}18`, border: `1px solid ${ev.color || C.acc}25`, borderRadius: 4, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvs.length > 2 && <div style={{ fontSize: 9, color: C.tm }}>+{dayEvs.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.b}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>
                {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Select a day"}
              </div>
              {selectedDate && <button onClick={() => { setNewEv(n => ({ ...n, date: selectedDate })); setShowForm(true); }} style={{ fontSize: 10, color: C.accL, background: "none", border: "none", cursor: "pointer" }}>+ Add</button>}
            </div>
            <div style={{ padding: "10px 14px", maxHeight: 180, overflowY: "auto" }}>
              {selectedDayEvents.length === 0 && <div style={{ fontSize: 12, color: C.tm, padding: "4px 0" }}>{selectedDate ? "No events." : "Click a date above."}</div>}
              {selectedDayEvents.map(ev => (
                <div key={ev._id || ev.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${C.b}` }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: ev.color || C.acc, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.tp, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                    <Badge label={ev.type} color={ev.color || C.acc} />
                  </div>
                  <button onClick={() => deleteEvent(ev._id || ev.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.tm, fontSize: 14, padding: "2px 4px" }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.b}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>Holidays</span>
              <button onClick={() => { setNewEv({ title: "", type: "holiday", color: C.green, date: mkDate(1) }); setShowForm(true); }} style={{ fontSize: 10, color: C.accL, background: "none", border: "none", cursor: "pointer" }}>+ Add Holiday</button>
            </div>
            <div style={{ padding: "10px 14px" }}>
              {monthHolidays.length === 0 && <div style={{ fontSize: 12, color: C.tm }}>None this month.</div>}
              {monthHolidays.map(h => (
                <div key={h._id || h.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: h.color || C.green, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.tp }}>{h.title}</div>
                    <div style={{ fontSize: 10, color: C.tm }}>{new Date(h.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                  <button onClick={() => deleteEvent(h._id || h.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.tm, fontSize: 14 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.b}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>Upcoming</span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              {events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6).map(ev => (
                <div key={ev._id || ev.id} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.b}` }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: ev.color || C.acc, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.tp, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                    <div style={{ fontSize: 10, color: C.tm }}>{new Date(ev.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <Modal title="Add Event" subtitle="Schedule a meeting, holiday, or reminder" onClose={() => setShowForm(false)} width={400}>
            <Inp label="Event Title" required value={newEv.title} onChange={e => setNewEv(n => ({ ...n, title: e.target.value }))} placeholder="e.g. Q4 Strategy Review" />
            <Inp label="Date" required type="date" value={newEv.date} onChange={e => setNewEv(n => ({ ...n, date: e.target.value }))} />
            <Sel label="Type" value={newEv.type} onChange={e => setNewEv(n => ({ ...n, type: e.target.value }))} options={EV_TYPES} />
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.tm, marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Color</div>
              <div style={{ display: "flex", gap: 8 }}>
                {EV_COLORS.map(col => <div key={col} onClick={() => setNewEv(n => ({ ...n, color: col }))} style={{ width: 24, height: 24, borderRadius: "50%", background: col, cursor: "pointer", border: newEv.color === col ? "3px solid white" : "2px solid transparent", transition: "transform 0.1s", transform: newEv.color === col ? "scale(1.2)" : "scale(1)" }} />)}
              </div>
            </div>
            <Div style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="corp-btn-ghost" onClick={() => setShowForm(false)} style={{ padding: "8px 18px", fontSize: 13 }}>Cancel</button>
              <button className="corp-btn-primary" onClick={addEvent} style={{ padding: "8px 20px", fontSize: 13 }}>Add Event</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ACTIVITY ─────────────────────────────────────────────────────────────────
const NOTIFS_INIT = [
  { id: uid(), type: "reminder", title: "Follow-up Due", desc: "Demo call scheduled today at 3PM", time: "Now", unread: true },
  { id: uid(), type: "ai", title: "AI Insight", desc: "Engagement score improved this week", time: "5m", unread: true },
  { id: uid(), type: "team", title: "Team Activity", desc: "New member added to Sales Frontline", time: "22m", unread: true },
  { id: uid(), type: "system", title: "Sync Complete", desc: "All contact data is up to date", time: "1h", unread: false },
];

const Activity = ({ notifications, setNotifications }) => {
  const markAll = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));
  const ICONS = { reminder: "⏰", ai: "✦", team: "👥", system: "⚙", meeting: "📅" };
  const ICOLORS = { reminder: C.amber, ai: C.acc, team: C.teal, system: C.tm, meeting: C.purple };
  return (
    <div style={{ padding: "24px 24px 32px", overflowY: "auto", flex: 1 }}>
      <SectionHeader title="Activity & Notifications"
        action={<button className="corp-btn-ghost" onClick={markAll} style={{ padding: "7px 14px", fontSize: 12 }}>Mark all read</button>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 680 }}>
        {notifications.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ background: C.bgC, border: `1px solid ${n.unread ? ICOLORS[n.type] + "35" : C.b}`, borderRadius: 12, padding: "13px 15px", position: "relative", overflow: "hidden" }}>
            {n.unread && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: ICOLORS[n.type] }} />}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${ICOLORS[n.type]}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, border: `1px solid ${ICOLORS[n.type]}22` }}>{ICONS[n.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.tp }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: C.tm }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 13, color: C.ts }}>{n.desc}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── PIPELINE ─────────────────────────────────────────────────────────────────
const PIPELINE_INIT = {
  lead: [{ id: uid(), name: "NovaTech Expansion", value: "$240K", contact: "Alexandra Chen" }, { id: uid(), name: "BlueHorizon Contract", value: "$85K", contact: "Priya Kapoor" }],
  qualified: [{ id: uid(), name: "Apex Dynamics Deal", value: "$320K", contact: "Marcus Williams" }, { id: uid(), name: "BrightSpark Media", value: "$60K", contact: "Elena V." }],
  proposal: [{ id: uid(), name: "Meridian Capital", value: "$500K", contact: "James Thornton" }],
  closed: [{ id: uid(), name: "Pinnacle Ventures", value: "$410K", contact: "Robert Kim" }],
};

const Pipeline = () => {
  const [pipe] = useState(PIPELINE_INIT);
  const COLS = [{ id: "lead", label: "Lead", color: C.tm }, { id: "qualified", label: "Qualified", color: C.amber }, { id: "proposal", label: "Proposal", color: C.acc }, { id: "closed", label: "Closed Won", color: C.green }];
  return (
    <div style={{ padding: "24px 24px 32px", overflowY: "auto", flex: 1 }}>
      <SectionHeader title="Sales Pipeline" subtitle="Track deals through your sales stages" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {COLS.map(col => (
          <div key={col.id} style={{ background: C.bgC, borderRadius: 12, border: `1px solid ${C.b}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: col.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.tp, flex: 1, fontFamily: "'Syne', sans-serif" }}>{col.label}</span>
              <span style={{ fontSize: 10, color: C.tm, background: C.bgS, padding: "2px 7px", borderRadius: 99 }}>{pipe[col.id].length}</span>
            </div>
            <div style={{ padding: "8px" }}>
              {pipe[col.id].map((deal, i) => (
                <motion.div key={deal.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -2 }} className="card-lift"
                  style={{ background: C.bgS, border: `1px solid ${C.b}`, borderRadius: 10, padding: "12px 12px", marginBottom: 7, cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, marginBottom: 3 }}>{deal.name}</div>
                  <div style={{ fontSize: 11, color: C.tm, marginBottom: 8 }}>{deal.contact}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: col.color, fontFamily: "'Syne', sans-serif" }}>{deal.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── AI ASSISTANT ─────────────────────────────────────────────────────────────
const AIAssistant = ({ employees }) => {
  const [messages, setMessages] = useState([{ role: "ai", text: "Hello! I'm your Nexus AI Assistant. I can analyze contacts, draft communications, review team performance, and provide strategic insights. How can I help?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const SUGGESTIONS = ["Analyze team performance", "Who needs attention?", "Draft a follow-up email", "Top performers this month", "Pipeline recommendations"];

  const send = useCallback(async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are the AI assistant for Nexus Contacts Pro, an enterprise CRM. Team data: ${employees.map(e => `${e.name} (${e.title || "—"}, ${e.team || e.department || "Unassigned"}, perf: ${e.performance || 0}%, rev: $${e.revenue || 0})`).join("; ")}. Be professional, concise, action-oriented. Use bullet points. Under 200 words.`,
          messages: [{ role: "user", content: q }],
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "ai", text: data.content?.find(b => b.type === "text")?.text || "Unable to process." }]);
    } catch { setMessages(m => [...m, { role: "ai", text: "Connection unavailable." }]); }
    setLoading(false);
  }, [input, employees]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 22, gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#1D4ED8,#7C3AED)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}>✦</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>Nexus AI Assistant</div>
          <div style={{ fontSize: 12, color: C.green, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", boxShadow: `0 0 6px ${C.green}` }} />Active · Powered by Claude</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
        {SUGGESTIONS.map(s => <button key={s} onClick={() => send(s)} style={{ padding: "5px 12px", background: C.bgC, border: `1px solid ${C.b}`, borderRadius: 99, color: C.ts, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s" }}>{s}</button>)}
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" && <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#1D4ED820,#7C3AED20)", border: "1px solid #7C3AED44", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13 }}>✦</div>}
            <div style={{ maxWidth: "76%", padding: "11px 15px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? C.acc : C.bgC, border: `1px solid ${m.role === "user" ? "transparent" : C.b}`, color: C.tp, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#1D4ED820,#7C3AED20)", border: "1px solid #7C3AED44", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✦</div>
            <div style={{ padding: "12px 15px", background: C.bgC, borderRadius: "16px 16px 16px 4px", border: `1px solid ${C.b}`, display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(j => <motion.div key={j} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, delay: j * 0.2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accL }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, background: C.bgC, border: `1px solid ${C.bL}`, borderRadius: 12, padding: "7px 7px 7px 14px", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about contacts, team performance, pipeline…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.tp, fontSize: 13, fontFamily: "inherit" }} />
        <button className="corp-btn-primary" onClick={() => send()} style={{ padding: "8px 16px", fontSize: 13 }}>Send →</button>
      </div>
    </div>
  );
};

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
const Settings = ({ employees, teams }) => {
  const [notifs, setNotifs] = useState({ email: true, push: true, team: true, ai: true });
  return (
    <div style={{ padding: "24px 24px 32px", overflowY: "auto", flex: 1 }}>
      <SectionHeader title="Settings & Preferences" subtitle="Manage your account, integrations, and preferences" />
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 18, maxWidth: 840 }}>
        <div style={{ background: C.bgC, borderRadius: 14, border: `1px solid ${C.b}`, padding: 18, textAlign: "center" }}>
          <Av name="You" size={58} />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: C.tp, fontFamily: "'Syne', sans-serif" }}>Your Account</div>
          <div style={{ fontSize: 11, color: C.tm, marginTop: 2 }}>Super Admin</div>
          <div style={{ marginTop: 8 }}><Badge label="Enterprise" color={C.acc} /></div>
          <Div style={{ margin: "14px 0" }} />
          <div style={{ fontSize: 12, color: C.ts }}>{employees.length} contacts</div>
          <div style={{ fontSize: 12, color: C.ts, marginTop: 4 }}>{teams.length} teams</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: C.bgC, borderRadius: 12, border: `1px solid ${C.b}`, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>Notification Preferences</div>
            {Object.entries(notifs).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.b}` }}>
                <span style={{ fontSize: 13, color: C.ts }}>{k === "ai" ? "AI Insights" : k === "push" ? "Push Notifications" : `${k.charAt(0).toUpperCase() + k.slice(1)} Notifications`}</span>
                <div onClick={() => setNotifs(n => ({ ...n, [k]: !v }))} style={{ width: 40, height: 22, borderRadius: 11, background: v ? C.acc : "rgba(255,255,255,0.09)", cursor: "pointer", position: "relative", transition: "background 0.2s", boxShadow: v ? `0 0 8px ${C.acc}60` : "none" }}>
                  <motion.div animate={{ x: v ? 20 : 2 }} style={{ position: "absolute", width: 18, height: 18, background: "#fff", borderRadius: "50%", top: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: C.bgC, borderRadius: 12, border: `1px solid ${C.b}`, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.tp, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>Integrations</div>
            {[["Gmail", "✉", C.rose, true], ["Slack", "💬", C.purple, true], ["Google Calendar", "📅", C.green, false], ["Zoom", "📹", C.acc, false]].map(([n, ico, col, conn]) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.b}` }}>
                <span style={{ fontSize: 17 }}>{ico}</span>
                <span style={{ flex: 1, fontSize: 13, color: C.tp }}>{n}</span>
                <Badge label={conn ? "Connected" : "Connect"} color={conn ? C.green : C.tm} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const DEFAULT_TEAMS = [
  { id: uid(), name: "Sales Frontline", color: C.acc },
  { id: uid(), name: "Enterprise Accounts", color: C.purple },
  { id: uid(), name: "Tech Partnerships", color: C.teal },
  { id: uid(), name: "Marketing Ops", color: C.green },
];

export default function App() {
  // ── New User from AuthContext ──────────────────────────────────────────
  const { user } = useAuth();
  // ── Pull logout from AuthContext ──────────────────────────────────────────
  const { logout } = useAuth();
  

  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [notifications, setNotifications] = useState(NOTIFS_INIT);
  const [toast, setToast] = useState(null);

  // Unread badge count
  const badge = notifications.filter(n => n.unread).length;

  const showToast = (msg, type = "success") => setToast({ msg, type, key: uid() });

  useEffect(() => {
    axios.get("https://nexus-contacts-pro.onrender.com/api/employees",
    {
    headers: {
      userid: user?._id,
    },
  }
)
      .then(res => setEmployees(res.data))
      .catch(() => console.log("Employees backend not connected"));

    axios.get("https://nexus-contacts-pro.onrender.com/api/events")
      .then(res => setEvents(res.data))
      .catch(() => console.log("Events backend not connected"));

    axios.get("https://nexus-contacts-pro.onrender.com/api/attendance")
      .then(res => setAttendance(res.data))
      .catch(() => console.log("Attendance backend not connected"));
  }, []);

  const render = () => {
    switch (page) {
      case "dashboard":  return <Dashboard employees={employees} teams={teams} setPage={setPage} />;
      case "ai":         return <AIAssistant employees={employees} />;
      case "contacts":   return <Contacts employees={employees} setEmployees={setEmployees} teams={teams} searchQuery={searchQuery} showToast={showToast} />;
      case "pipeline":   return <Pipeline />;
      case "teams":      return <Teams employees={employees} setEmployees={setEmployees} teams={teams} setTeams={setTeams} showToast={showToast} />;
      case "analytics":  return <Analytics employees={employees} teams={teams} />;
      case "activity":   return <Activity notifications={notifications} setNotifications={setNotifications} />;
      case "calendar":   return <Calendar events={events} setEvents={setEvents} />;
      case "settings":   return <Settings employees={employees} teams={teams} />;
      default:           return <Dashboard employees={employees} teams={teams} setPage={setPage} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden", color: C.tp }}>
      <GlobalStyle />
      <Sidebar active={page} set={setPage} collapsed={collapsed} setCollapsed={setCollapsed} badge={badge} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ── TopBar: badge uses notification count, onLogout calls AuthContext logout ── */}
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          badge={badge}
          setPage={setPage}
          onLogout={logout}
        />
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
            style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {render()}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}