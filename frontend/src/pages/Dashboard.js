import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import Logo from "../components/Logo";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const RISK_COLOR = { High: "#FF6B6B", Medium: "#FFE66D", Low: "#22C55E" };

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#161622", border: "1px solid #2A2A40", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#E8E8F0" }}>
      <div style={{ color: "#888", marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#E8E8F0", fontWeight: 600 }}>
          {p.name}: {p.value}{p.unit || ""}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState("checking");
  const [monitorData, setMonitorData]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab]         = useState("overview"); // overview | cities | charts

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let attempts = 0;
    const check = () => {
      fetch(`${API_BASE}/health`)
        .then(r => { if (r.ok) setBackendStatus("online"); else setBackendStatus("error"); })
        .catch(() => { attempts++; if (attempts < 5) setTimeout(check, 5000); else setBackendStatus("offline"); });
    };
    check();

    fetch(`${API_BASE}/monitor`)
      .then(r => r.json())
      .then(data => { setMonitorData(data); setLastUpdated(new Date()); })
      .catch(() => setMonitorData(null))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch(`${API_BASE}/monitor`)
      .then(r => r.json())
      .then(data => { setMonitorData(data); setLastUpdated(new Date()); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const cities       = monitorData?.cities || [];
  const totalCities  = monitorData?.total_cities || 0;
  const criticalCities = monitorData?.critical_cities || 0;
  const avgTemp      = cities.length ? (cities.reduce((s, c) => s + (c.temperature || 0), 0) / cities.length).toFixed(1) : "—";
  const avgHumidity  = cities.length ? Math.round(cities.reduce((s, c) => s + (c.humidity || 0), 0) / cities.length) : "—";
  const highRisk     = cities.filter(c => c.traffic_risk === "High").length;
  const mediumRisk   = cities.filter(c => c.traffic_risk === "Medium").length;
  const lowRisk      = cities.filter(c => c.traffic_risk === "Low").length;
  const hottest      = cities.length ? cities.reduce((a, b) => a.temperature > b.temperature ? a : b) : null;
  const coldest      = cities.length ? cities.reduce((a, b) => a.temperature < b.temperature ? a : b) : null;

  const KPI_CARDS = [
    { label: "Cities",      value: loading ? "…" : totalCities,      icon: "🏙️", color: "#7C3AED", trend: "Live",       up: true  },
    { label: "Critical",    value: loading ? "…" : criticalCities,   icon: "🚨", color: "#FF6B6B", trend: criticalCities > 0 ? "⚠ Alert" : "✓ Clear", up: criticalCities === 0 },
    { label: "High Risk",   value: loading ? "…" : highRisk,         icon: "🔴", color: "#FF6B6B", trend: `${mediumRisk} medium`, up: false },
    { label: "Avg Temp",    value: loading ? "…" : `${avgTemp}°C`,   icon: "🌡️", color: "#FF6B35", trend: "Real-time",  up: true  },
    { label: "Humidity",    value: loading ? "…" : `${avgHumidity}%`,icon: "💧", color: "#4A90E2", trend: "Real-time",  up: true  },
    { label: "Low Risk",    value: loading ? "…" : lowRisk,          icon: "✅", color: "#22C55E", trend: "Safe",       up: true  },
  ];

  const tempChartData  = cities.slice(0, 10).map(c => ({ city: c.city.slice(0, 3), temp: parseFloat(c.temperature?.toFixed(1) || 0) }));
  const riskChartData  = [
    { label: "High", count: highRisk, color: "#FF6B6B" },
    { label: "Med",  count: mediumRisk, color: "#FFE66D" },
    { label: "Low",  count: lowRisk, color: "#22C55E" },
  ];
  const humidityData   = cities.slice(0, 10).map(c => ({ city: c.city.slice(0, 3), humidity: c.humidity || 0 }));
  const statusColor    = { online: "#22C55E", offline: "#FF6B6B", checking: "#FFE66D", error: "#FF6B6B" };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={24} />
            {!isMobile && <span style={s.titleText}>City Dashboard</span>}
          </div>
          {lastUpdated && !isMobile && (
            <span style={s.lastUpdated}>Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          )}
        </div>
        <div style={s.headerRight}>
          <div style={{ ...s.statusPill, background: statusColor[backendStatus] + "22", color: statusColor[backendStatus], border: `1px solid ${statusColor[backendStatus]}44` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[backendStatus] }} />
            {isMobile ? backendStatus : `Backend ${backendStatus}`}
          </div>
          <button style={s.refreshBtn} onClick={refresh} disabled={loading}>{loading ? "⏳" : "↺"}</button>
          {!isMobile && <button style={s.chatBtn} onClick={() => navigate("/chat")}>Open Chat →</button>}
        </div>
      </div>

      {/* MOBILE TABS */}
      {isMobile && (
        <div style={s.tabs}>
          {["overview", "charts", "cities"].map(tab => (
            <button
              key={tab}
              style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" ? "📊 Overview" : tab === "charts" ? "📈 Charts" : "🏙️ Cities"}
            </button>
          ))}
        </div>
      )}

      <div style={{ ...s.body, padding: isMobile ? "12px" : "20px 28px" }}>

        {/* KPI GRID — always visible */}
        {(!isMobile || activeTab === "overview") && (
          <div style={{ ...s.kpiGrid, gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {KPI_CARDS.map(k => (
              <div key={k.label} style={s.kpiCard}>
                <div style={{ ...s.kpiIcon, background: k.color + "22", color: k.color }}>{k.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...s.kpiValue, fontSize: isMobile ? 18 : 20 }}>{k.value}</div>
                  <div style={s.kpiLabel}>{k.label}</div>
                </div>
                <div style={{ ...s.kpiTrend, color: k.up ? "#22C55E" : "#FF6B6B" }}>{k.trend}</div>
              </div>
            ))}
          </div>
        )}

        {/* CHARTS */}
        {(!isMobile || activeTab === "charts") && (
          <>
            <div style={{ ...s.chartsRow, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              <div style={s.chartCard}>
                <div style={s.chartHeader}>
                  <div style={s.chartTitle}>🌡️ Temperature by City</div>
                  <div style={s.chartSub}>Live · OpenWeatherMap</div>
                </div>
                {loading ? <ChartSkeleton /> : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={tempChartData} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                      <XAxis dataKey="city" tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="temp" radius={[4, 4, 0, 0]} name="Temp" unit="°C">
                        {tempChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.temp >= 35 ? "#FF6B6B" : entry.temp >= 28 ? "#FFE66D" : "#4ECDC4"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={s.chartCard}>
                <div style={s.chartHeader}>
                  <div style={s.chartTitle}>🚦 Traffic Risk</div>
                  <div style={s.chartSub}>All monitored cities</div>
                </div>
                {loading ? <ChartSkeleton /> : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={riskChartData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "#555570", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<DarkTooltip />} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Cities">
                          {riskChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={s.riskPills}>
                      {riskChartData.map(r => (
                        <div key={r.label} style={{ ...s.riskPill, background: r.color + "22", color: r.color, border: `1px solid ${r.color}44` }}>
                          {r.count} {r.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ ...s.chartsRow, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              <div style={s.chartCard}>
                <div style={s.chartHeader}>
                  <div style={s.chartTitle}>💧 Humidity by City</div>
                  <div style={s.chartSub}>Current humidity (%)</div>
                </div>
                {loading ? <ChartSkeleton /> : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={humidityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                      <XAxis dataKey="city" tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip content={<DarkTooltip />} />
                      <Line type="monotone" dataKey="humidity" stroke="#4A90E2" strokeWidth={2} dot={{ fill: "#4A90E2", r: 3 }} name="Humidity" unit="%" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={s.chartCard}>
                <div style={s.chartHeader}>
                  <div style={s.chartTitle}>🏆 City Highlights</div>
                  <div style={s.chartSub}>Notable stats right now</div>
                </div>
                {loading ? <ChartSkeleton /> : (
                  <div style={s.highlights}>
                    {hottest && (
                      <div style={s.highlightRow}>
                        <div style={{ ...s.highlightIcon, background: "#FF6B6B22", color: "#FF6B6B" }}>🔥</div>
                        <div>
                          <div style={s.highlightLabel}>Hottest City</div>
                          <div style={s.highlightValue}>{hottest.city} — {hottest.temperature?.toFixed(1)}°C</div>
                        </div>
                      </div>
                    )}
                    {coldest && (
                      <div style={s.highlightRow}>
                        <div style={{ ...s.highlightIcon, background: "#4ECDC422", color: "#4ECDC4" }}>❄️</div>
                        <div>
                          <div style={s.highlightLabel}>Coolest City</div>
                          <div style={s.highlightValue}>{coldest.city} — {coldest.temperature?.toFixed(1)}°C</div>
                        </div>
                      </div>
                    )}
                    {cities.filter(c => c.traffic_risk === "High").slice(0, 2).map(c => (
                      <div key={c.city} style={s.highlightRow}>
                        <div style={{ ...s.highlightIcon, background: "#FF6B3522", color: "#FF6B35" }}>⚠️</div>
                        <div>
                          <div style={s.highlightLabel}>High Risk Alert</div>
                          <div style={s.highlightValue}>{c.city} — {c.weather_condition}</div>
                        </div>
                      </div>
                    ))}
                    {cities.length === 0 && <div style={s.noData}>No data. Start the backend.</div>}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CITIES TABLE */}
        {(!isMobile || activeTab === "cities") && (
          <div style={s.tableCard}>
            <div style={s.chartHeader}>
              <div style={s.chartTitle}>📋 Monitored Cities</div>
              <div style={s.chartSub}>{totalCities} cities · live data</div>
            </div>
            {loading ? (
              <div style={s.noData}>Loading...</div>
            ) : cities.length === 0 ? (
              <div style={s.noData}>No cities. Make sure backend is running.</div>
            ) : isMobile ? (
              /* Mobile: card layout instead of table */
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cities.map(city => (
                  <div key={city.city} style={s.cityCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={s.cityCardName}>{city.city}</span>
                      <span style={{
                        background: (RISK_COLOR[city.traffic_risk] || "#888") + "22",
                        color: RISK_COLOR[city.traffic_risk] || "#888",
                        padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                      }}>
                        {city.traffic_risk}
                      </span>
                    </div>
                    <div style={s.cityCardRow}>
                      <span style={s.cityCardStat}>🌡️ {city.temperature?.toFixed(1)}°C</span>
                      <span style={s.cityCardStat}>💧 {city.humidity}%</span>
                      <span style={{ ...s.cityCardStat, textTransform: "capitalize" }}>☁️ {city.weather_condition}</span>
                    </div>
                    {city.ai_insight && (
                      <div style={s.cityCardInsight}>{city.ai_insight.slice(0, 80)}…</div>
                    )}
                    <button style={s.tableBtn} onClick={() => navigate("/chat?module=traffic")}>Ask AI →</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["City", "Condition", "Temp", "Humidity", "Risk", "AI Insight", "Action"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((city, i) => (
                      <tr key={city.city} style={{ ...s.tr, background: i % 2 === 0 ? "transparent" : "#0D0D1588" }}>
                        <td style={s.td}><span style={s.cityName}>{city.city}</span></td>
                        <td style={{ ...s.td, textTransform: "capitalize", color: "#9090B0" }}>{city.weather_condition}</td>
                        <td style={s.td}>
                          <span style={{ color: city.temperature >= 35 ? "#FF6B6B" : city.temperature >= 28 ? "#FFE66D" : "#4ECDC4", fontWeight: 600 }}>
                            {city.temperature?.toFixed(1)}°C
                          </span>
                        </td>
                        <td style={{ ...s.td, color: "#9090B0" }}>{city.humidity}%</td>
                        <td style={s.td}>
                          <span style={{ background: (RISK_COLOR[city.traffic_risk] || "#888") + "22", color: RISK_COLOR[city.traffic_risk] || "#888", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {city.traffic_risk}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: "#666680", fontSize: 11, maxWidth: 200 }}>
                          {city.ai_insight ? city.ai_insight.slice(0, 80) + "…" : "—"}
                        </td>
                        <td style={s.td}>
                          <button style={s.tableBtn} onClick={() => navigate("/chat?module=traffic")}>Ask AI →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* QUICK ACTIONS — overview tab only */}
        {(!isMobile || activeTab === "overview") && (
          <div style={s.actionsCard}>
            <div style={s.chartTitle}>⚡ Quick Actions</div>
            <div style={{ ...s.actionsRow, gap: isMobile ? 8 : 10 }}>
              {[
                { label: "Traffic Mumbai",  icon: "🚦", color: "#FF6B35", nav: "/chat?module=traffic" },
                { label: "Weather Delhi",   icon: "🌤️", color: "#4ECDC4", nav: "/chat?module=weather" },
                { label: "Pune→Mumbai",     icon: "🗺️", color: "#A78BFA", nav: "/chat?module=route"   },
                { label: "Risk Bangalore",  icon: "⚠️", color: "#FFE66D", nav: "/chat?module=risk"    },
                { label: "Chennai Travel",  icon: "🚌", color: "#88D8B0", nav: "/chat?module=traffic" },
                { label: "City Map",        icon: "🗺️", color: "#7C3AED", nav: "/map"                 },
              ].map(a => (
                <button
                  key={a.label}
                  style={{ ...s.actionBtn, flex: isMobile ? "1 1 calc(50% - 4px)" : "0 1 auto" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = a.color + "55"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1E1E2E"}
                  onClick={() => navigate(a.nav)}
                >
                  <span style={{ ...s.actionIcon, background: a.color + "22", color: a.color }}>{a.icon}</span>
                  <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 500, color: "#C0C0D8" }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div style={s.mobileBottomNav}>
          <button style={s.mobileNavBtn} onClick={() => navigate("/")}>🏠<span style={s.mobileNavLabel}>Home</span></button>
          <button style={{ ...s.mobileNavBtn, color: "#A78BFA" }}>📊<span style={s.mobileNavLabel}>Dashboard</span></button>
          <button style={s.mobileNavBtnCenter} onClick={() => navigate("/chat")}>💬</button>
          <button style={s.mobileNavBtn} onClick={() => navigate("/map")}>🗺️<span style={s.mobileNavLabel}>Map</span></button>
          <button style={s.mobileNavBtn} onClick={() => navigate("/chat")}>🤖<span style={s.mobileNavLabel}>AI</span></button>
        </div>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#333345", fontSize: 13 }}>Loading...</span>
    </div>
  );
}

const s = {
  page:            { minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0", paddingBottom: 70 },
  header:          { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#111118", borderBottom: "1px solid #1E1E2E", flexShrink: 0 },
  headerLeft:      { display: "flex", alignItems: "center", gap: 10 },
  backBtn:         { background: "none", border: "none", color: "#555570", fontSize: 13, cursor: "pointer" },
  titleText:       { fontWeight: 700, fontSize: 15, color: "#E8E8F0" },
  lastUpdated:     { fontSize: 11, color: "#444460" },
  headerRight:     { display: "flex", alignItems: "center", gap: 8 },
  statusPill:      { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "4px 8px", borderRadius: 20 },
  refreshBtn:      { background: "none", border: "1px solid #2A2A40", color: "#7070A0", fontSize: 14, padding: "5px 10px", borderRadius: 7, cursor: "pointer" },
  chatBtn:         { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 7, cursor: "pointer" },
  tabs:            { display: "flex", background: "#0D0D15", borderBottom: "1px solid #1E1E2E" },
  tab:             { flex: 1, background: "none", border: "none", color: "#555570", fontSize: 12, fontWeight: 500, padding: "10px 4px", cursor: "pointer", borderBottom: "2px solid transparent" },
  tabActive:       { color: "#A78BFA", borderBottom: "2px solid #7C3AED" },
  body:            { display: "flex", flexDirection: "column", gap: 14 },
  kpiGrid:         { display: "grid", gap: 10 },
  kpiCard:         { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 },
  kpiIcon:         { width: 38, height: 38, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 },
  kpiValue:        { fontWeight: 700, color: "#E8E8F0" },
  kpiLabel:        { fontSize: 10, color: "#555570", textTransform: "uppercase", letterSpacing: "0.4px" },
  kpiTrend:        { marginLeft: "auto", fontSize: 10, fontWeight: 600, flexShrink: 0, textAlign: "right" },
  chartsRow:       { display: "grid", gap: 12 },
  chartCard:       { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "14px 16px" },
  chartHeader:     { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
  chartTitle:      { fontSize: 13, fontWeight: 600, color: "#C0C0D8" },
  chartSub:        { fontSize: 10, color: "#444460" },
  riskPills:       { display: "flex", gap: 8, marginTop: 10 },
  riskPill:        { fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  highlights:      { display: "flex", flexDirection: "column", gap: 10 },
  highlightRow:    { display: "flex", alignItems: "center", gap: 10 },
  highlightIcon:   { width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 },
  highlightLabel:  { fontSize: 10, color: "#555570", textTransform: "uppercase", letterSpacing: "0.4px" },
  highlightValue:  { fontSize: 13, fontWeight: 600, color: "#E8E8F0", marginTop: 1 },
  tableCard:       { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "14px 16px" },
  table:           { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:              { textAlign: "left", padding: "8px 10px", color: "#444460", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #1E1E2E" },
  tr:              { borderBottom: "1px solid #1A1A2A" },
  td:              { padding: "9px 10px", color: "#C0C0D8", verticalAlign: "middle" },
  cityName:        { fontWeight: 600, color: "#E8E8F0" },
  tableBtn:        { background: "none", border: "1px solid #2A2A40", color: "#7070A0", borderRadius: 5, padding: "4px 8px", fontSize: 11, cursor: "pointer" },
  noData:          { color: "#444460", fontSize: 13, padding: "20px 0", textAlign: "center" },
  cityCard:        { background: "#161622", border: "1px solid #1E1E2E", borderRadius: 9, padding: "12px" },
  cityCardName:    { fontWeight: 700, fontSize: 14, color: "#E8E8F0" },
  cityCardRow:     { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 },
  cityCardStat:    { fontSize: 12, color: "#9090B0", textTransform: "capitalize" },
  cityCardInsight: { fontSize: 11, color: "#666680", marginBottom: 8, lineHeight: 1.4 },
  actionsCard:     { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "14px 16px" },
  actionsRow:      { display: "flex", flexWrap: "wrap", marginTop: 10 },
  actionBtn:       { display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid #1E1E2E", borderRadius: 8, padding: "10px 12px", cursor: "pointer", margin: "0 6px 6px 0", transition: "border-color 0.2s" },
  actionIcon:      { width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 },
  mobileBottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#111118", borderTop: "1px solid #1E1E2E", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 14px", zIndex: 200 },
  mobileNavBtn:    { background: "none", border: "none", color: "#666680", fontSize: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "2px 8px" },
  mobileNavBtnCenter: { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 20, cursor: "pointer", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -12, boxShadow: "0 4px 14px #7C3AED66" },
  mobileNavLabel:  { fontSize: 10, display: "block" },
};