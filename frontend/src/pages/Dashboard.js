import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import Logo from "../components/Logo";

const API_BASE = "http://localhost:8000";

const RISK_COLOR = { High: "#FF6B6B", Medium: "#FFE66D", Low: "#22C55E" };

// Custom recharts tooltip
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#161622", border: "1px solid #2A2A40",
      borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#E8E8F0",
    }}>
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
  const [backendStatus, setBackendStatus]   = useState("checking");
  const [monitorData, setMonitorData]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [lastUpdated, setLastUpdated]       = useState(null);

  // Fetch health + monitor data
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.ok ? setBackendStatus("online") : setBackendStatus("error"))
      .catch(() => setBackendStatus("offline"));

    fetch(`${API_BASE}/monitor`)
      .then(r => r.json())
      .then(data => {
        setMonitorData(data);
        setLastUpdated(new Date());
      })
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

  // Derive KPIs from real monitor data
  const cities      = monitorData?.cities || [];
  const totalCities = monitorData?.total_cities || 0;
  const criticalCities = monitorData?.critical_cities || 0;

  const avgTemp = cities.length
    ? (cities.reduce((s, c) => s + (c.temperature || 0), 0) / cities.length).toFixed(1)
    : "—";

  const avgHumidity = cities.length
    ? Math.round(cities.reduce((s, c) => s + (c.humidity || 0), 0) / cities.length)
    : "—";

  const highRisk   = cities.filter(c => c.traffic_risk === "High").length;
  const mediumRisk = cities.filter(c => c.traffic_risk === "Medium").length;
  const lowRisk    = cities.filter(c => c.traffic_risk === "Low").length;

  const hottest = cities.length
    ? cities.reduce((a, b) => (a.temperature > b.temperature ? a : b))
    : null;

  const coldest = cities.length
    ? cities.reduce((a, b) => (a.temperature < b.temperature ? a : b))
    : null;

  const KPI_CARDS = [
    { label: "Cities Monitored",  value: loading ? "…" : totalCities,        icon: "🏙️", color: "#7C3AED", trend: "Live",                            up: true  },
    { label: "Critical Cities",   value: loading ? "…" : criticalCities,     icon: "🚨", color: "#FF6B6B", trend: criticalCities > 0 ? "⚠ Alert" : "✓ Clear", up: criticalCities === 0 },
    { label: "High Risk",         value: loading ? "…" : highRisk,           icon: "🔴", color: "#FF6B6B", trend: `${mediumRisk} medium`,             up: false },
    { label: "Avg Temperature",   value: loading ? "…" : `${avgTemp}°C`,     icon: "🌡️", color: "#FF6B35", trend: "Real-time",                       up: true  },
    { label: "Avg Humidity",      value: loading ? "…" : `${avgHumidity}%`,  icon: "💧", color: "#4A90E2", trend: "Real-time",                       up: true  },
    { label: "Low Risk Cities",   value: loading ? "…" : lowRisk,            icon: "✅", color: "#22C55E", trend: "Safe to travel",                  up: true  },
  ];

  // Chart data — temperature per city (bar chart)
  const tempChartData = cities
    .slice(0, 10)
    .map(c => ({ city: c.city.slice(0, 3), temp: parseFloat(c.temperature?.toFixed(1) || 0) }));

  // Risk distribution (bar chart)
  const riskChartData = [
    { label: "High",   count: highRisk,   color: "#FF6B6B" },
    { label: "Medium", count: mediumRisk, color: "#FFE66D" },
    { label: "Low",    count: lowRisk,    color: "#22C55E" },
  ];

  // Humidity chart
  const humidityData = cities
    .slice(0, 10)
    .map(c => ({ city: c.city.slice(0, 3), humidity: c.humidity || 0 }));

  const statusColor = { online: "#22C55E", offline: "#FF6B6B", checking: "#FFE66D", error: "#FF6B6B" };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <div style={s.titleRow}>
            <Logo size={28} />
            <span style={s.titleText}>City Dashboard</span>
          </div>
          {lastUpdated && (
            <span style={s.lastUpdated}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <div style={s.headerRight}>
          <div style={{
            ...s.statusPill,
            background: statusColor[backendStatus] + "22",
            color: statusColor[backendStatus],
            border: `1px solid ${statusColor[backendStatus]}44`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[backendStatus] }} />
            Backend {backendStatus}
          </div>
          <button style={s.refreshBtn} onClick={refresh} disabled={loading}>
            {loading ? "⏳" : "↺"} Refresh
          </button>
          <button style={s.chatBtn} onClick={() => navigate("/chat")}>Open Chat →</button>
        </div>
      </div>

      <div style={s.body}>

        {/* KPI GRID */}
        <div style={s.kpiGrid}>
          {KPI_CARDS.map(k => (
            <div key={k.label} style={s.kpiCard}>
              <div style={{ ...s.kpiIcon, background: k.color + "22", color: k.color }}>{k.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={s.kpiValue}>{k.value}</div>
                <div style={s.kpiLabel}>{k.label}</div>
              </div>
              <div style={{ ...s.kpiTrend, color: k.up ? "#22C55E" : "#FF6B6B" }}>{k.trend}</div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW 1 */}
        <div style={s.chartsRow}>

          {/* Temperature per city */}
          <div style={s.chartCard}>
            <div style={s.chartHeader}>
              <div style={s.chartTitle}>🌡️ Temperature by City</div>
              <div style={s.chartSub}>Live from OpenWeatherMap</div>
            </div>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tempChartData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                  <XAxis dataKey="city" tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} unit="°" />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="temp" radius={[4, 4, 0, 0]} name="Temp" unit="°C">
                    {tempChartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.temp >= 35 ? "#FF6B6B" : entry.temp >= 28 ? "#FFE66D" : "#4ECDC4"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Risk distribution */}
          <div style={s.chartCard}>
            <div style={s.chartHeader}>
              <div style={s.chartTitle}>🚦 Traffic Risk Distribution</div>
              <div style={s.chartSub}>Across all monitored cities</div>
            </div>
            {loading ? <ChartSkeleton /> : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={riskChartData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#555570", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Cities">
                      {riskChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Risk pills */}
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

        {/* CHARTS ROW 2 */}
        <div style={s.chartsRow}>

          {/* Humidity chart */}
          <div style={s.chartCard}>
            <div style={s.chartHeader}>
              <div style={s.chartTitle}>💧 Humidity by City</div>
              <div style={s.chartSub}>Current humidity levels (%)</div>
            </div>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                  <XAxis dataKey="city" tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="humidity" stroke="#4A90E2" strokeWidth={2} dot={{ fill: "#4A90E2", r: 4 }} name="Humidity" unit="%" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* City highlights */}
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
                {cities.filter(c => c.traffic_risk === "High").map(c => (
                  <div key={c.city} style={s.highlightRow}>
                    <div style={{ ...s.highlightIcon, background: "#FF6B3522", color: "#FF6B35" }}>⚠️</div>
                    <div>
                      <div style={s.highlightLabel}>High Risk Alert</div>
                      <div style={s.highlightValue}>{c.city} — {c.weather_condition}</div>
                    </div>
                  </div>
                ))}
                {cities.length === 0 && (
                  <div style={s.noData}>No data available. Start the backend.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LIVE CITIES TABLE */}
        <div style={s.tableCard}>
          <div style={s.chartHeader}>
            <div style={s.chartTitle}>📋 All Monitored Cities</div>
            <div style={s.chartSub}>{totalCities} cities · live weather + risk</div>
          </div>
          {loading ? (
            <div style={s.noData}>Loading city data...</div>
          ) : cities.length === 0 ? (
            <div style={s.noData}>No cities loaded. Make sure backend is running.</div>
          ) : (
            <div style={s.tableWrap}>
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
                    <tr
                      key={city.city}
                      style={{ ...s.tr, background: i % 2 === 0 ? "transparent" : "#0D0D1588" }}
                    >
                      <td style={s.td}>
                        <span style={s.cityName}>{city.city}</span>
                      </td>
                      <td style={{ ...s.td, textTransform: "capitalize", color: "#9090B0" }}>
                        {city.weather_condition}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          color: city.temperature >= 35 ? "#FF6B6B"
                               : city.temperature >= 28 ? "#FFE66D"
                               : "#4ECDC4",
                          fontWeight: 600,
                        }}>
                          {city.temperature?.toFixed(1)}°C
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#9090B0" }}>{city.humidity}%</td>
                      <td style={s.td}>
                        <span style={{
                          background: (RISK_COLOR[city.traffic_risk] || "#888") + "22",
                          color: RISK_COLOR[city.traffic_risk] || "#888",
                          padding: "2px 8px", borderRadius: 4,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {city.traffic_risk}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#666680", fontSize: 11, maxWidth: 220 }}>
                        {city.ai_insight
                          ? city.ai_insight.slice(0, 80) + (city.ai_insight.length > 80 ? "…" : "")
                          : "—"}
                      </td>
                      <td style={s.td}>
                        <button
                          style={s.tableBtn}
                          onClick={() => navigate(`/chat?module=traffic`)}
                        >
                          Ask AI →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div style={s.actionsCard}>
          <div style={s.chartTitle}>⚡ Quick Actions</div>
          <div style={s.actionsRow}>
            {[
              { label: "Traffic in Mumbai",       icon: "🚦", color: "#FF6B35", nav: "/chat?module=traffic" },
              { label: "Weather in Delhi",         icon: "🌤️", color: "#4ECDC4", nav: "/chat?module=weather" },
              { label: "Pune → Mumbai Route",      icon: "🗺️", color: "#A78BFA", nav: "/chat?module=route"   },
              { label: "Risk Report Bangalore",    icon: "⚠️", color: "#FFE66D", nav: "/chat?module=risk"    },
              { label: "Travel Advisory Chennai",  icon: "🚌", color: "#88D8B0", nav: "/chat?module=traffic" },
              { label: "Open City Map",            icon: "🗺️", color: "#7C3AED", nav: "/map"                 },
            ].map(a => (
              <button
                key={a.label}
                style={{ ...s.actionBtn, borderColor: "#1E1E2E" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = a.color + "55"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1E1E2E"}
                onClick={() => navigate(a.nav)}
              >
                <span style={{ ...s.actionIcon, background: a.color + "22", color: a.color }}>{a.icon}</span>
                <span style={s.actionLabel}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#333345", fontSize: 13 }}>Loading data...</span>
    </div>
  );
}

const s = {
  page:          { minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0" },
  header:        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", background: "#111118", borderBottom: "1px solid #1E1E2E", flexShrink: 0 },
  headerLeft:    { display: "flex", alignItems: "center", gap: 14 },
  backBtn:       { background: "none", border: "none", color: "#555570", fontSize: 13, cursor: "pointer" },
  titleRow:      { display: "flex", alignItems: "center", gap: 8 },
  titleText:     { fontWeight: 700, fontSize: 16, color: "#E8E8F0" },
  lastUpdated:   { fontSize: 11, color: "#444460" },
  headerRight:   { display: "flex", alignItems: "center", gap: 10 },
  statusPill:    { display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "5px 10px", borderRadius: 20 },
  refreshBtn:    { background: "none", border: "1px solid #2A2A40", color: "#7070A0", fontSize: 13, padding: "6px 12px", borderRadius: 7, cursor: "pointer" },
  chatBtn:       { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 7, cursor: "pointer" },
  body:          { padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 },
  kpiGrid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 },
  kpiCard:       { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 },
  kpiIcon:       { width: 40, height: 40, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  kpiValue:      { fontSize: 20, fontWeight: 700, color: "#E8E8F0" },
  kpiLabel:      { fontSize: 11, color: "#555570", textTransform: "uppercase", letterSpacing: "0.4px" },
  kpiTrend:      { marginLeft: "auto", fontSize: 11, fontWeight: 600, flexShrink: 0 },
  chartsRow:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  chartCard:     { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "16px 18px" },
  chartHeader:   { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 },
  chartTitle:    { fontSize: 13, fontWeight: 600, color: "#C0C0D8" },
  chartSub:      { fontSize: 11, color: "#444460" },
  riskPills:     { display: "flex", gap: 8, marginTop: 12 },
  riskPill:      { fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  highlights:    { display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" },
  highlightRow:  { display: "flex", alignItems: "center", gap: 12 },
  highlightIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  highlightLabel:{ fontSize: 11, color: "#555570", textTransform: "uppercase", letterSpacing: "0.4px" },
  highlightValue:{ fontSize: 14, fontWeight: 600, color: "#E8E8F0", marginTop: 1 },
  tableCard:     { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "16px 18px", overflowX: "auto" },
  tableWrap:     { overflowX: "auto" },
  table:         { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:            { textAlign: "left", padding: "8px 12px", color: "#444460", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #1E1E2E" },
  tr:            { borderBottom: "1px solid #1A1A2A", transition: "background 0.15s" },
  td:            { padding: "10px 12px", color: "#C0C0D8", verticalAlign: "middle" },
  cityName:      { fontWeight: 600, color: "#E8E8F0" },
  tableBtn:      { background: "none", border: "1px solid #2A2A40", color: "#7070A0", borderRadius: 5, padding: "4px 8px", fontSize: 11, cursor: "pointer" },
  noData:        { color: "#444460", fontSize: 13, padding: "20px 0", textAlign: "center" },
  actionsCard:   { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "16px 18px" },
  actionsRow:    { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 },
  actionBtn:     { display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid", borderRadius: 8, padding: "10px 14px", cursor: "pointer", transition: "border-color 0.2s", color: "#C0C0D8" },
  actionIcon:    { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  actionLabel:   { fontSize: 13, fontWeight: 500 },
};