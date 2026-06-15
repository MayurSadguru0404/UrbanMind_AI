import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const MODULES = [
  { id: "traffic", icon: "🚦", label: "Traffic Analysis",  desc: "Real-time congestion, road risk & travel time", color: "#FF6B35" },
  { id: "weather", icon: "🌤️", label: "Weather Intel",     desc: "Live weather conditions for any Indian city",   color: "#4ECDC4" },
  { id: "route",   icon: "🗺️", label: "Route Planning",    desc: "Best departure time & route safety advice",     color: "#A78BFA" },
  { id: "risk",    icon: "⚠️", label: "Risk Assessment",   desc: "Traffic risk scoring based on weather data",    color: "#FFE66D" },
];

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/health`).catch(() => {});
    fetch(`${API_BASE}/monitor`)
      .then(r => r.json())
      .then(data => {
        const cities = data.cities || [];
        const total = data.total_cities || 0;
        const critical = data.critical_cities || 0;
        const avgTemp = cities.length
          ? (cities.reduce((sum, c) => sum + (c.temperature || 0), 0) / cities.length).toFixed(1)
          : "N/A";
        const avgHumidity = cities.length
          ? Math.round(cities.reduce((sum, c) => sum + (c.humidity || 0), 0) / cities.length)
          : "N/A";
        const highRisk = cities.filter(c => c.traffic_risk === "High").length;
        setStats([
          { label: "Cities",      value: total,             trend: "Live",         up: true  },
          { label: "Critical",    value: critical,          trend: critical > 0 ? "⚠ Alert" : "✓ Clear", up: critical === 0 },
          { label: "Avg Temp",    value: `${avgTemp}°C`,    trend: "Real-time",    up: true  },
          { label: "Humidity",    value: `${avgHumidity}%`, trend: "Real-time",    up: true  },
          { label: "High Risk",   value: highRisk,          trend: highRisk > 0 ? "⚠ Alert" : "✓ Clear", up: highRisk === 0 },
        ]);
      })
      .catch(() => {
        setStats([
          { label: "Cities",    value: "—", trend: "Offline", up: false },
          { label: "Critical",  value: "—", trend: "Offline", up: false },
          { label: "Avg Temp",  value: "—", trend: "Offline", up: false },
          { label: "Humidity",  value: "—", trend: "Offline", up: false },
          { label: "High Risk", value: "—", trend: "Offline", up: false },
        ]);
      })
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .mod-card:hover { border-color: var(--hc) !important; transform: translateY(-2px); }
        .mod-card { transition: border-color 0.2s, transform 0.2s; }
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <Logo size={32} />
          <div>
            <div style={s.logoTitle}>UrbanMind AI</div>
            {!isMobile && <div style={s.logoSub}>Smart City Intelligence</div>}
          </div>
        </div>

        {isMobile ? (
          <>
            <button style={s.hamburger} onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? "✕" : "☰"}
            </button>
            {menuOpen && (
              <div style={s.mobileMenu}>
                <button style={s.mobileMenuBtn} onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>📊 Dashboard</button>
                <button style={s.mobileMenuBtn} onClick={() => { navigate("/map"); setMenuOpen(false); }}>🗺️ City Map</button>
                <button style={s.mobileMenuBtnPrimary} onClick={() => { navigate("/chat"); setMenuOpen(false); }}>💬 Open Chat</button>
              </div>
            )}
          </>
        ) : (
          <div style={s.navLinks}>
            <button style={s.navBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button style={s.navBtn} onClick={() => navigate("/map")}>City Map</button>
            <button style={s.navBtnPrimary} onClick={() => navigate("/chat")}>Open Chat →</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroBadge}>🏙️ Agentic Smart City Platform</div>
        <h1 style={{ ...s.heroTitle, fontSize: isMobile ? 32 : 52 }}>
          Your city,<br />
          <span style={s.heroAccent}>intelligently understood</span>
        </h1>
        <p style={{ ...s.heroDesc, fontSize: isMobile ? 15 : 17 }}>
          UrbanMind AI connects LLMs and real-time sensor data to give instant,
          accurate answers about traffic, weather, route planning and risk assessment.
        </p>
        <div style={s.heroBtns}>
          <button style={s.btnPrimary} onClick={() => navigate("/chat")}>Start Asking →</button>
          <button style={s.btnSecondary} onClick={() => navigate("/dashboard")}>View Dashboard</button>
        </div>
      </div>

      {/* STATS */}
      <div style={s.statsRow}>
        {statsLoading ? (
          <div style={{ padding: "16px 20px", color: "#444460", fontSize: 13 }}>Loading live data...</div>
        ) : (stats || []).map(s2 => (
          <div key={s2.label} style={s.statCard}>
            <div style={s.statValue}>{s2.value}</div>
            <div style={s.statLabel}>{s2.label}</div>
            <div style={{ ...s.statTrend, color: s2.up ? "#22C55E" : "#FF6B6B" }}>{s2.trend}</div>
          </div>
        ))}
      </div>

      {/* MODULES */}
      <div style={{ ...s.section, padding: isMobile ? "36px 16px" : "60px 24px" }}>
        <div style={s.sectionLabel}>CITY MODULES</div>
        <h2 style={{ ...s.sectionTitle, fontSize: isMobile ? 22 : 30 }}>Four domains. One platform.</h2>
        <div style={{ ...s.moduleGrid, gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {MODULES.map(mod => (
            <button
              key={mod.id}
              className="mod-card"
              style={{ ...s.moduleCard, "--hc": mod.color + "66" }}
              onClick={() => navigate(`/chat?module=${mod.id}`)}
            >
              <div style={{ ...s.moduleIcon, background: mod.color + "22", color: mod.color }}>{mod.icon}</div>
              <div style={s.moduleLabel}>{mod.label}</div>
              {!isMobile && <div style={s.moduleDesc}>{mod.desc}</div>}
              <div style={{ ...s.moduleArrow, color: mod.color }}>Ask →</div>
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV (mobile only) */}
      {isMobile && (
        <div style={s.bottomNav}>
          <button style={s.bottomNavBtn} onClick={() => navigate("/")}>🏠<span style={s.bottomNavLabel}>Home</span></button>
          <button style={s.bottomNavBtn} onClick={() => navigate("/dashboard")}>📊<span style={s.bottomNavLabel}>Dashboard</span></button>
          <button style={s.bottomNavBtnCenter} onClick={() => navigate("/chat")}>💬</button>
          <button style={s.bottomNavBtn} onClick={() => navigate("/map")}>🗺️<span style={s.bottomNavLabel}>Map</span></button>
          <button style={s.bottomNavBtn} onClick={() => navigate("/chat")}>🤖<span style={s.bottomNavLabel}>AI</span></button>
        </div>
      )}

      <footer style={s.footer}>
        <span style={{ color: "#333345" }}>UrbanMind AI — Smart City Intelligence</span>
      </footer>
    </div>
  );
}

const s = {
  page:            { minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0", paddingBottom: 0 },
  nav:             { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #1E1E2E", background: "#111118", position: "relative", zIndex: 100 },
  navLeft:         { display: "flex", alignItems: "center", gap: 10 },
  logoTitle:       { fontWeight: 700, fontSize: 15, color: "#E8E8F0", letterSpacing: "-0.3px" },
  logoSub:         { fontSize: 11, color: "#555570" },
  navLinks:        { display: "flex", alignItems: "center", gap: 8 },
  navBtn:          { background: "none", border: "none", color: "#8888A8", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 7 },
  navBtnPrimary:   { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 14, cursor: "pointer", padding: "7px 16px", borderRadius: 7, fontWeight: 600 },
  hamburger:       { background: "none", border: "none", color: "#E8E8F0", fontSize: 22, cursor: "pointer", padding: 4 },
  mobileMenu:      { position: "absolute", top: "100%", left: 0, right: 0, background: "#111118", borderBottom: "1px solid #1E1E2E", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8, zIndex: 200 },
  mobileMenuBtn:   { background: "#1A1A28", border: "1px solid #2A2A40", color: "#C0C0D8", fontSize: 14, padding: "12px 16px", borderRadius: 9, cursor: "pointer", textAlign: "left" },
  mobileMenuBtnPrimary: { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 14, fontWeight: 600, padding: "12px 16px", borderRadius: 9, cursor: "pointer", textAlign: "left" },
  hero:            { maxWidth: 700, margin: "0 auto", padding: "48px 20px 40px", textAlign: "center" },
  heroBadge:       { display: "inline-block", background: "#7C3AED22", color: "#A78BFA", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: "1px solid #7C3AED44", marginBottom: 20 },
  heroTitle:       { fontWeight: 800, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 16 },
  heroAccent:      { background: "linear-gradient(135deg,#7C3AED,#4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroDesc:        { color: "#8888A8", lineHeight: 1.7, marginBottom: 28 },
  heroBtns:        { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  btnPrimary:      { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 15, fontWeight: 600, padding: "12px 24px", borderRadius: 10, cursor: "pointer" },
  btnSecondary:    { background: "none", border: "1px solid #2A2A40", color: "#9090B0", fontSize: 15, padding: "12px 24px", borderRadius: 10, cursor: "pointer" },
  statsRow:        { display: "flex", justifyContent: "center", background: "#0D0D15", borderTop: "1px solid #1E1E2E", borderBottom: "1px solid #1E1E2E", overflowX: "auto" },
  statCard:        { flex: "1 1 100px", padding: "14px 16px", borderRight: "1px solid #1E1E2E", textAlign: "center", minWidth: 80 },
  statValue:       { fontSize: 20, fontWeight: 700, color: "#E8E8F0" },
  statLabel:       { fontSize: 10, color: "#555570", textTransform: "uppercase", letterSpacing: "0.5px", margin: "2px 0" },
  statTrend:       { fontSize: 11 },
  section:         { maxWidth: 1100, margin: "0 auto" },
  sectionLabel:    { fontSize: 11, fontWeight: 600, color: "#444460", letterSpacing: 2, marginBottom: 8 },
  sectionTitle:    { fontWeight: 700, color: "#E8E8F0", marginBottom: 24, letterSpacing: "-0.5px" },
  moduleGrid:      { display: "grid", gap: 12 },
  moduleCard:      { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "18px 16px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 6 },
  moduleIcon:      { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  moduleLabel:     { fontSize: 14, fontWeight: 600, color: "#E8E8F0" },
  moduleDesc:      { fontSize: 12, color: "#666680", lineHeight: 1.5 },
  moduleArrow:     { fontSize: 12, fontWeight: 600, marginTop: 2 },
  bottomNav:       { position: "fixed", bottom: 0, left: 0, right: 0, background: "#111118", borderTop: "1px solid #1E1E2E", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 16px", zIndex: 200 },
  bottomNavBtn:    { background: "none", border: "none", color: "#666680", fontSize: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 12px" },
  bottomNavBtnCenter: { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 22, cursor: "pointer", width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -16, boxShadow: "0 4px 16px #7C3AED66" },
  bottomNavLabel:  { fontSize: 10, display: "block" },
  footer:          { textAlign: "center", padding: "20px", borderTop: "1px solid #1E1E2E", fontSize: 12, color: "#333345" },
};