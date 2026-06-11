import React from "react";
import { useNavigate } from "react-router-dom";

const MODULES = [
  { id: "traffic",      icon: "🚦", label: "Traffic",     desc: "Congestion & flow analysis",    color: "#FF6B35" },
  { id: "air_quality",  icon: "🌫️", label: "Air Quality", desc: "Pollution & AQI monitoring",    color: "#4ECDC4" },
  { id: "energy",       icon: "⚡", label: "Energy",      desc: "Grid load & consumption",       color: "#FFE66D" },
  { id: "water",        icon: "💧", label: "Water",       desc: "Supply & infrastructure",       color: "#4A90E2" },
  { id: "public_safety",icon: "🛡️", label: "Safety",      desc: "Emergency & incident data",     color: "#A8E6CF" },
  { id: "waste",        icon: "♻️", label: "Waste",       desc: "Collection & recycling",        color: "#88D8B0" },
];

const STATS = [
  { label: "Population",     value: "3.2M",  trend: "+1.2%", up: true  },
  { label: "Active Sensors", value: "12,847",trend: "+24",   up: true  },
  { label: "Avg AQI",        value: "68",    trend: "-3 pts",up: false },
  { label: "Grid Load",      value: "78%",   trend: "+4%",   up: true  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>U</div>
          <div>
            <div style={styles.logoTitle}>UrbanMind AI</div>
            <div style={styles.logoSub}>Smart City Intelligence</div>
          </div>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate("/map")}>City Map</button>
          <button style={styles.navBtnPrimary} onClick={() => navigate("/chat")}>Open Chat →</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>🏙️ Agentic Smart City Platform</div>
        <h1 style={styles.heroTitle}>
          Your city,<br />
          <span style={styles.heroAccent}>intelligently understood</span>
        </h1>
        <p style={styles.heroDesc}>
          UrbanMind AI connects LLMs, RAG pipelines, and real-time sensor data
          to give city operators instant, accurate answers about traffic, air, energy, water, safety, and waste.
        </p>
        <div style={styles.heroBtns}>
          <button style={styles.btnPrimary} onClick={() => navigate("/chat")}>Start Asking →</button>
          <button style={styles.btnSecondary} onClick={() => navigate("/dashboard")}>View Dashboard</button>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsRow}>
        {STATS.map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={{ ...styles.statTrend, color: s.up ? "#22C55E" : "#FF6B6B" }}>{s.trend}</div>
          </div>
        ))}
      </div>

      {/* MODULES */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>CITY MODULES</div>
        <h2 style={styles.sectionTitle}>Six domains. One platform.</h2>
        <div style={styles.moduleGrid}>
          {MODULES.map(mod => (
            <button
              key={mod.id}
              style={styles.moduleCard}
              onClick={() => navigate(`/chat?module=${mod.id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = mod.color + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1E1E2E"}
            >
              <div style={{ ...styles.moduleIcon, background: mod.color + "22", color: mod.color }}>
                {mod.icon}
              </div>
              <div style={styles.moduleLabel}>{mod.label}</div>
              <div style={styles.moduleDesc}>{mod.desc}</div>
              <div style={{ ...styles.moduleArrow, color: mod.color }}>Ask →</div>
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={{ color: "#333345" }}>UrbanMind AI — Built with FastAPI + React + RAG</span>
      </footer>
    </div>
  );
}

const styles = {
  page:           { minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0" },
  nav:            { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid #1E1E2E", background: "#111118" },
  logo:           { display: "flex", alignItems: "center", gap: 10 },
  logoIcon:       { width: 36, height: 36, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "white" },
  logoTitle:      { fontWeight: 700, fontSize: 15, color: "#E8E8F0", letterSpacing: "-0.3px" },
  logoSub:        { fontSize: 11, color: "#555570" },
  navLinks:       { display: "flex", alignItems: "center", gap: 8 },
  navBtn:         { background: "none", border: "none", color: "#8888A8", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 7, transition: "all 0.15s" },
  navBtnPrimary:  { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 14, cursor: "pointer", padding: "7px 16px", borderRadius: 7, fontWeight: 600 },
  hero:           { maxWidth: 700, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" },
  heroBadge:      { display: "inline-block", background: "#7C3AED22", color: "#A78BFA", fontSize: 13, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: "1px solid #7C3AED44", marginBottom: 28 },
  heroTitle:      { fontSize: 52, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-1.5px", marginBottom: 20 },
  heroAccent:     { background: "linear-gradient(135deg,#7C3AED,#4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroDesc:       { fontSize: 17, color: "#8888A8", lineHeight: 1.7, marginBottom: 36 },
  heroBtns:       { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  btnPrimary:     { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 15, fontWeight: 600, padding: "12px 28px", borderRadius: 10, cursor: "pointer" },
  btnSecondary:   { background: "none", border: "1px solid #2A2A40", color: "#9090B0", fontSize: 15, padding: "12px 28px", borderRadius: 10, cursor: "pointer" },
  statsRow:       { display: "flex", justifyContent: "center", gap: 1, background: "#0D0D15", borderTop: "1px solid #1E1E2E", borderBottom: "1px solid #1E1E2E", overflowX: "auto" },
  statCard:       { flex: "1 1 150px", padding: "18px 28px", borderRight: "1px solid #1E1E2E", textAlign: "center" },
  statValue:      { fontSize: 26, fontWeight: 700, color: "#E8E8F0" },
  statLabel:      { fontSize: 11, color: "#555570", textTransform: "uppercase", letterSpacing: "0.5px", margin: "2px 0" },
  statTrend:      { fontSize: 12 },
  section:        { maxWidth: 1100, margin: "0 auto", padding: "60px 24px" },
  sectionLabel:   { fontSize: 11, fontWeight: 600, color: "#444460", letterSpacing: 2, marginBottom: 10 },
  sectionTitle:   { fontSize: 30, fontWeight: 700, color: "#E8E8F0", marginBottom: 32, letterSpacing: "-0.5px" },
  moduleGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 },
  moduleCard:     { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s", display: "flex", flexDirection: "column", gap: 8 },
  moduleIcon:     { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  moduleLabel:    { fontSize: 15, fontWeight: 600, color: "#E8E8F0" },
  moduleDesc:     { fontSize: 13, color: "#666680", lineHeight: 1.5 },
  moduleArrow:    { fontSize: 13, fontWeight: 600, marginTop: 4 },
  footer:         { textAlign: "center", padding: "28px", borderTop: "1px solid #1E1E2E", fontSize: 13 },
};