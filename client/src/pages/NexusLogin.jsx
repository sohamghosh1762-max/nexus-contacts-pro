import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

import {
  useAuth,
} from "../context/AuthContext";

// ─── Particle Field Background ────────────────────────────────────────────────
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    const orbs = [
      { x: 0.2, y: 0.3, r: 350, hue: 217, sat: 90 },
      { x: 0.8, y: 0.2, r: 280, hue: 258, sat: 85 },
      { x: 0.15, y: 0.75, r: 220, hue: 200, sat: 80 },
      { x: 0.85, y: 0.7, r: 300, hue: 240, sat: 75 },
    ];

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      // Deep space bg
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#03060F");
      bg.addColorStop(0.4, "#05091A");
      bg.addColorStop(1, "#020510");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Orbs
      orbs.forEach((o, i) => {
        const px = Math.sin(t * 0.0005 + i) * 30;
        const py = Math.cos(t * 0.0007 + i * 1.3) * 20;
        const pulse = 0.88 + Math.sin(t * 0.006 + i) * 0.12;
        const x = o.x * W + px, y = o.y * H + py;
        const g = ctx.createRadialGradient(x, y, 0, x, y, o.r * pulse);
        g.addColorStop(0, `hsla(${o.hue},${o.sat}%,55%,0.12)`);
        g.addColorStop(0.4, `hsla(${o.hue},${o.sat}%,45%,0.06)`);
        g.addColorStop(1, `hsla(${o.hue},${o.sat}%,35%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, o.r * pulse, 0, Math.PI * 2); ctx.fill();
      });

      // Fine grid
      ctx.strokeStyle = "rgba(59,130,246,0.045)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 44) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 44) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Particles + connections
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const a = p.opacity * (0.7 + Math.sin(t * 0.01 + p.phase) * 0.3);
        ctx.fillStyle = `rgba(147,197,253,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(99,149,235,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      }

      // Sweep line
      const sweep = (t * 0.5) % (H + 300) - 150;
      const sg = ctx.createLinearGradient(0, sweep - 80, 0, sweep + 80);
      sg.addColorStop(0, "rgba(56,112,255,0)");
      sg.addColorStop(0.5, "rgba(56,112,255,0.025)");
      sg.addColorStop(1, "rgba(56,112,255,0)");
      ctx.fillStyle = sg; ctx.fillRect(0, sweep - 80, W, 160);

      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />;
};

// ─── Cursor glow tracker ──────────────────────────────────────────────────────
const CursorGlow = () => {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const handler = e => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return (
    <motion.div style={{
      position: "fixed", pointerEvents: "none", zIndex: 1,
      width: 500, height: 500, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
      x: sx, y: sy, translateX: "-50%", translateY: "-50%",
    }} />
  );
};

// ─── Stat Nodes ───────────────────────────────────────────────────────────────
const StatNodes = () => {
  const nodes = [
    { pos: ["7%", "14%"], label: "2,841 Contacts", icon: "◎", color: "#3B82F6", delay: 0.2 },
    { pos: ["80%", "10%"], label: "$4.2M Revenue", icon: "◈", color: "#7C3AED", delay: 0.5 },
    { pos: ["5%", "68%"], label: "94% Performance", icon: "◉", color: "#10B981", delay: 0.8 },
    { pos: ["78%", "72%"], label: "23 Teams Active", icon: "⬟", color: "#0EA5E9", delay: 1.1 },
    { pos: ["48%", "4%"], label: "482 Interactions", icon: "✦", color: "#F59E0B", delay: 0.65 },
    { pos: ["87%", "42%"], label: "64% Win Rate", icon: "◫", color: "#F43F5E", delay: 0.95 },
  ];
  return (
    <>
      {nodes.map((n, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: n.delay + 1, duration: 0.5, ease: "easeOut" }}
          style={{ position: "fixed", left: n.pos[0], top: n.pos[1], zIndex: 2, pointerEvents: "none" }}
        >
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 4.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}>
            <div style={{
              background: "rgba(8,13,26,0.88)",
              border: `1px solid ${n.color}28`,
              borderRadius: 14,
              padding: "7px 13px",
              display: "flex", alignItems: "center", gap: 8,
              backdropFilter: "blur(16px)",
              boxShadow: `0 4px 24px ${n.color}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: `${n.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: n.color,
              }}>{n.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(226,232,240,0.72)", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif" }}>{n.label}</span>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: n.color, opacity: 0.7, animation: "pulse 2s infinite" }} />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </>
  );
};

// ─── Strength Indicator ───────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#F43F5E", "#F59E0B", "#3B82F6", "#10B981"];
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      style={{ marginTop: -10, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(i => (
          <motion.div key={i}
            initial={{ scaleX: 0 }} animate={{ scaleX: i <= score ? 1 : 0.25 }}
            style={{
              flex: 1, height: 3, borderRadius: 3,
              background: i <= score ? colors[score] : "rgba(255,255,255,0.08)",
              transformOrigin: "left", transition: "background 0.3s",
            }} />
        ))}
      </div>
      <span style={{ fontSize: 10, color: colors[score], fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
        {score > 0 && labels[score]}
      </span>
    </motion.div>
  );
};

// ─── Input Field ──────────────────────────────────────────────────────────────
const InputField = ({ label, type, placeholder, value, onChange, icon, error, autoComplete, hint }) => {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPwd = type === "password";

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <label style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(148,163,184,0.7)", letterSpacing: "0.1em", fontFamily: "'Outfit', sans-serif" }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: 10, color: "rgba(99,149,242,0.55)", fontFamily: "'Outfit', sans-serif" }}>{hint}</span>}
      </div>
      <div style={{
        position: "relative",
        borderRadius: 13,
        border: `1.5px solid ${error ? "rgba(244,63,94,0.4)" : focused ? "rgba(59,130,246,0.55)" : "rgba(255,255,255,0.07)"}`,
        background: focused ? "rgba(37,99,235,0.05)" : "rgba(255,255,255,0.025)",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.08), 0 2px 12px rgba(0,0,0,0.2)" : error ? "0 0 0 3px rgba(244,63,94,0.06)" : "none",
      }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: focused ? 0.8 : 0.35, transition: "opacity 0.2s" }}>{icon}</span>
        <input
          type={isPwd && showPwd ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: "#E2E8F0", fontSize: 13.5,
            padding: isPwd ? "13px 44px 13px 42px" : "13px 14px 13px 42px",
            fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em",
          }}
        />
        {isPwd && (
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
            position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(148,163,184,0.5)", fontSize: 14, padding: 4, lineHeight: 1,
          }}>
            {showPwd ? "🙈" : "👁"}
          </button>
        )}
        {/* Active indicator line */}
        <motion.div animate={{ scaleX: focused ? 1 : 0 }} style={{
          position: "absolute", bottom: -1, left: "15%", right: "15%", height: 2,
          background: "linear-gradient(90deg, #3B82F6, #7C3AED)",
          borderRadius: 2, transformOrigin: "center",
        }} />
      </div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ fontSize: 11, color: "#F43F5E", marginTop: 5, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            <span>⚠</span> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Social Button ────────────────────────────────────────────────────────────
const SocialBtn = ({ icon, label }) => (
  <motion.button whileHover={{ scale: 1.03, background: "rgba(255,255,255,0.06)" }} whileTap={{ scale: 0.97 }} style={{
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
    padding: "11px 16px",
    background: "rgba(255,255,255,0.035)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: 13, cursor: "pointer",
    color: "rgba(226,232,240,0.7)",
    fontSize: 12.5, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
    transition: "background 0.2s",
  }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    {label}
  </motion.button>
);

// ─── Feature Pill ─────────────────────────────────────────────────────────────
const FeaturePill = ({ icon, text, color, delay }) => (
  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
    style={{ display: "flex", alignItems: "center", gap: 11 }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: `${color}15`, border: `1px solid ${color}25`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, color, flexShrink: 0,
    }}>{icon}</div>
    <span style={{ fontSize: 13, color: "rgba(148,163,184,0.72)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}>{text}</span>
  </motion.div>
);

// ─── Animated Number Counter ──────────────────────────────────────────────────
const Counter = ({ to, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [to]);
  return <span>{val.toLocaleString()}{suffix}</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NexusLogin({
  setLoggedIn,
}) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPwd: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [remember, setRemember] = useState(false);

  const { login } = useAuth();

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (mode !== "forgot") {
      if (!form.password) e.password = "Password is required";
      else if (mode === "signup" && form.password.length < 8) e.password = "Minimum 8 characters";
    }
    if (mode === "signup") {
      if (!form.name.trim()) e.name = "Full name is required";
      if (form.password !== form.confirmPwd) e.confirmPwd = "Passwords do not match";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {

  if (!validate()) return;

  try {

    setLoading(true);

    const url =
      mode === "signup"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

    const res = await axios.post(
      url,
      {
        name: form.name,
        email: form.email,
        password: form.password,
      }
    );

    setLoading(false);

    setSuccess(true);

    // SIGNUP FLOW
    if (mode === "signup") {

      setTimeout(() => {

        switchMode("login");

      }, 1500);

      return;
    }

    // LOGIN FLOW
    login(
      res.data.user,
      res.data.token
    );

    setTimeout(() => {

      setLoggedIn(true);

    }, 1200);

  } catch (error) {

    setLoading(false);

    alert(
      error.response?.data?.message ||
      "Login Failed"
    );
  }
};

  const switchMode = m => {
    setMode(m);
    setErrors({});
    setForm({ email: "", password: "", name: "", confirmPwd: "" });
    setSuccess(false);
  };

  const COPY = {
    login: { title: "Welcome back", sub: "Sign in to your Nexus workspace" },
    signup: { title: "Create account", sub: "Join thousands of enterprise teams" },
    forgot: { title: "Reset password", sub: "We'll send a secure recovery link" },
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Clash+Display:wght@600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: rgba(100,116,139,0.45) !important; font-size: 13px; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px rgba(5,10,20,0.9) inset !important; -webkit-text-fill-color: #E2E8F0 !important; caret-color: #E2E8F0; }
        @keyframes pulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }
      `}</style>

      <ParticleField />
      <CursorGlow />

      {/* Ambient overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(135deg, rgba(37,99,235,0.03) 0%, transparent 60%, rgba(124,58,237,0.03) 100%)" }} />

      <StatNodes />

      {/* ── Left Brand Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed", left: "5%", top: "50%", transform: "translateY(-50%)",
          zIndex: 3, maxWidth: 340, display: "flex", flexDirection: "column", gap: 36,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(37,99,235,0.3)", "0 0 40px rgba(124,58,237,0.4)", "0 0 20px rgba(37,99,235,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)",
              borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
            ✦
          </motion.div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em" }}>Nexus Pro</div>
            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "0.18em", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>ENTERPRISE CRM</div>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 16 }}>
            Intelligence
            <br />
            <span style={{ background: "linear-gradient(90deg, #60A5FA, #A78BFA, #60A5FA)", backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "none" }}>
              driven
            </span>
            <br />
            by data.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(148,163,184,0.65)", lineHeight: 1.75, fontFamily: "'Outfit', sans-serif" }}>
            The enterprise contact platform that turns relationships into revenue — powered by AI.
          </p>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, overflow: "hidden",
          }}
        >
          {[
            { val: 12400, suf: "+", label: "Contacts" },
            { val: 98, suf: "%", label: "Uptime" },
            { val: 4200000, suf: "", label: "Revenue Tracked" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "16px 14px",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              textAlign: "center",
            }}>
              <div style={{ fontSize: i === 2 ? 13 : 18, fontWeight: 800, color: "#E2E8F0", fontFamily: "'Syne', sans-serif", marginBottom: 3 }}>
                {i === 2 ? "$4.2M" : <Counter to={s.val} suffix={s.suf} />}
              </div>
              <div style={{ fontSize: 10, color: "rgba(148,163,184,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <FeaturePill icon="◎" text="Unified contact intelligence across all channels" color="#3B82F6" delay={0.7} />
          <FeaturePill icon="✦" text="AI-powered insights & smart automation" color="#7C3AED" delay={0.85} />
          <FeaturePill icon="◈" text="Real-time pipeline analytics & forecasting" color="#10B981" delay={1.0} />
          <FeaturePill icon="⬟" text="Team collaboration workspace" color="#0EA5E9" delay={1.15} />
        </div>

        {/* Compliance badges */}
        <div style={{ display: "flex", gap: 8 }}>
          {["SOC 2 TYPE II", "GDPR", "ISO 27001", "HIPAA"].map(b => (
            <div key={b} style={{
              fontSize: 9, fontWeight: 700, color: "rgba(148,163,184,0.4)",
              letterSpacing: "0.06em", padding: "4px 8px",
              border: "1px solid rgba(255,255,255,0.065)", borderRadius: 6,
              fontFamily: "'Outfit', sans-serif",
            }}>{b}</div>
          ))}
        </div>
      </motion.div>

      {/* ── Login Card ── */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 430, margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "rgba(8,12,24,0.93)",
              border: "1px solid rgba(255,255,255,0.085)",
              borderRadius: 26,
              padding: "42px 40px",
              backdropFilter: "blur(32px) saturate(180%)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(59,130,246,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Top shimmer line */}
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(99,130,255,0.7), rgba(167,139,250,0.7), transparent)",
            }} />

            {/* Corner accents */}
            <div style={{ position: "absolute", top: 12, right: 12, width: 40, height: 40, borderTop: "1px solid rgba(59,130,246,0.2)", borderRight: "1px solid rgba(59,130,246,0.2)", borderRadius: "0 8px 0 0" }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 40, height: 40, borderBottom: "1px solid rgba(124,58,237,0.2)", borderLeft: "1px solid rgba(124,58,237,0.2)", borderRadius: "0 0 0 8px" }} />

            {/* Card logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
              <div style={{
                width: 38, height: 38,
                background: "linear-gradient(135deg, #1D4ED8, #6D28D9)",
                borderRadius: 11,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
                boxShadow: "0 0 20px rgba(37,99,235,0.3)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
                ✦
              </div>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>Nexus Pro</div>
                <div style={{ fontSize: 9, color: "rgba(148,163,184,0.45)", letterSpacing: "0.14em", fontFamily: "'Outfit', sans-serif" }}>ENTERPRISE</div>
              </div>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em", marginBottom: 6 }}>
                {COPY[mode].title}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(148,163,184,0.6)", fontFamily: "'Outfit', sans-serif" }}>{COPY[mode].sub}</p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "24px 0" }}>
                  <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
                    style={{ fontSize: 54, marginBottom: 18, display: "block" }}>
                    {mode === "forgot" ? "📨" : "🎉"}
                  </motion.div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
                    {mode === "forgot" ? "Recovery email sent!" : mode === "signup" ? "You're all set!" : "Welcome back!"}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(148,163,184,0.6)", fontFamily: "'Outfit', sans-serif", marginBottom: 28, lineHeight: 1.6 }}>
                    {mode === "forgot" ? "Check your inbox for the reset link." : mode === "signup" ? "Your workspace is being prepared…" : "Redirecting to your dashboard…"}
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i}
                        animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.2, delay: i * 0.22, repeat: Infinity }}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "#3B82F6" : i === 1 ? "#8B5CF6" : "#10B981" }} />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                  {/* Social login */}
                  {mode !== "forgot" && (
                    <>
                      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                        <SocialBtn icon="G" label="Google" />
                        <SocialBtn icon="⊞" label="Microsoft" />
                        <SocialBtn icon="⌘" label="SSO" />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                        <span style={{ fontSize: 11, color: "rgba(100,116,139,0.5)", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.04em" }}>or email</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                      </div>
                    </>
                  )}

                  {/* Fields */}
                  {mode === "signup" && (
                    <InputField label="FULL NAME" type="text" placeholder="Jane Smith" value={form.name}
                      onChange={e => set("name", e.target.value)} icon="👤" error={errors.name} autoComplete="name" />
                  )}
                  <InputField label="WORK EMAIL" type="email" placeholder="you@company.com" value={form.email}
                    onChange={e => set("email", e.target.value)} icon="✉" error={errors.email} autoComplete="email" />
                  {mode !== "forgot" && (
                    <>
                      <InputField label="PASSWORD" type="password"
                        placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
                        value={form.password} onChange={e => set("password", e.target.value)}
                        icon="🔒" error={errors.password}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        hint={mode === "login" ? "" : ""}
                      />
                      {mode === "signup" && <PasswordStrength password={form.password} />}
                    </>
                  )}
                  {mode === "signup" && (
                    <InputField label="CONFIRM PASSWORD" type="password" placeholder="Repeat your password"
                      value={form.confirmPwd} onChange={e => set("confirmPwd", e.target.value)}
                      icon="🔒" error={errors.confirmPwd} autoComplete="new-password" />
                  )}

                  {/* Bottom row for login */}
                  {mode === "login" && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: -6 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <div
                          onClick={() => setRemember(!remember)}
                          style={{
                            width: 16, height: 16, borderRadius: 5,
                            border: `1.5px solid ${remember ? "#3B82F6" : "rgba(255,255,255,0.15)"}`,
                            background: remember ? "#3B82F6" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
                            fontSize: 9, color: "#fff",
                          }}
                        >
                          {remember && "✓"}
                        </div>
                        <span style={{ fontSize: 12, color: "rgba(148,163,184,0.55)", fontFamily: "'Outfit', sans-serif" }}>Remember me</span>
                      </label>
                      <button onClick={() => switchMode("forgot")} style={{
                        fontSize: 12, color: "rgba(99,149,242,0.8)",
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "'Outfit', sans-serif", fontWeight: 600,
                      }}>Forgot password?</button>
                    </div>
                  )}

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 36px rgba(37,99,235,0.45)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submit}
                    disabled={loading}
                    style={{
                      width: "100%", padding: "14px",
                      background: loading
                        ? "rgba(37,99,235,0.45)"
                        : "linear-gradient(135deg, #1D4ED8 0%, #2563EB 45%, #4338CA 100%)",
                      border: "none", borderRadius: 14,
                      color: "#fff", fontSize: 14, fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "'Outfit', sans-serif",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                      marginBottom: 18, letterSpacing: "0.02em",
                      boxShadow: loading ? "none" : "0 4px 24px rgba(37,99,235,0.32), inset 0 1px 0 rgba(255,255,255,0.15)",
                      transition: "box-shadow 0.25s, background 0.25s",
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    {/* Shimmer effect */}
                    {!loading && (
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                        style={{
                          position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                          transform: "skewX(-20deg)",
                        }}
                      />
                    )}
                    {loading ? (
                      <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    ) : (
                      <>
                        {mode === "login" ? "Sign in to Nexus" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                        <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                      </>
                    )}
                  </motion.button>

                  {/* Mode switch */}
                  <div style={{ textAlign: "center", fontSize: 12.5, color: "rgba(100,116,139,0.55)", fontFamily: "'Outfit', sans-serif" }}>
                    {mode === "login" ? (
                      <>Don't have an account?{" "}<button onClick={() => switchMode("signup")} style={{ color: "#60A5FA", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: 12.5 }}>Create one</button></>
                    ) : mode === "signup" ? (
                      <>Already have an account?{" "}<button onClick={() => switchMode("login")} style={{ color: "#60A5FA", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: 12.5 }}>Sign in</button></>
                    ) : (
                      <button onClick={() => switchMode("login")} style={{ color: "#60A5FA", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: 12.5 }}>← Back to sign in</button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "rgba(100,116,139,0.35)", fontFamily: "'Outfit', sans-serif" }}>
          By continuing, you agree to our{" "}
          <span style={{ color: "rgba(96,165,250,0.5)", cursor: "pointer" }}>Terms</span> and{" "}
          <span style={{ color: "rgba(96,165,250,0.5)", cursor: "pointer" }}>Privacy Policy</span>
        </motion.div>
      </div>

      {/* ── Right Testimonial ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "fixed", right: "5%", bottom: "14%", zIndex: 3, maxWidth: 290, pointerEvents: "none" }}
      >
        <div style={{
          background: "rgba(8,12,24,0.88)",
          border: "1px solid rgba(255,255,255,0.075)",
          borderRadius: 18,
          padding: "20px 22px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 11 }}>
            {[...Array(5)].map((_, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 + i * 0.08 }}
                style={{ fontSize: 13, color: "#F59E0B" }}>★</motion.span>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "rgba(226,232,240,0.72)", lineHeight: 1.65, fontFamily: "'Outfit', sans-serif", marginBottom: 16, fontStyle: "italic" }}>
            "Nexus Pro transformed how our team manages enterprise relationships. Our deal close rate improved 34% in just 90 days."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>JT</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(241,245,249,0.85)", fontFamily: "'Outfit', sans-serif" }}>James T.</div>
              <div style={{ fontSize: 11, color: "rgba(100,116,139,0.55)", fontFamily: "'Outfit', sans-serif" }}>MD, Meridian Capital</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Trusted by strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        style={{
          position: "fixed", bottom: "4%", left: "50%", transform: "translateX(-50%)",
          zIndex: 3, display: "flex", alignItems: "center", gap: 8, pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 10.5, color: "rgba(100,116,139,0.35)", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>TRUSTED BY</span>
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.08)" }} />
        {["Apex Corp", "NovaTech", "Meridian", "BlueHorizon", "Pinnacle"].map((c, i) => (
          <motion.span key={c} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 + i * 0.08 }}
            style={{
              fontSize: 10.5, fontWeight: 700, color: "rgba(148,163,184,0.22)",
              fontFamily: "'Outfit', sans-serif", padding: "3px 9px",
              border: "1px solid rgba(255,255,255,0.045)", borderRadius: 6, letterSpacing: "0.05em",
            }}>{c}</motion.span>
        ))}
      </motion.div>
    </div>
  );
}