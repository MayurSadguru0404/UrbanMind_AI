import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API_BASE = "http://localhost:8000";

const TRAFFIC_DATA = [
  { hour: "6am", load: 22 }, { hour: "7am", load: 45 }, { hour: "8am", load: 78 },
  { hour: "9am", load: 82 }, { hour: "10am", load: 60 }, { hour: "11am", load: 55 },
  { hour: "12pm", load: 67 }, { hour: "1pm", load: 70 }, { hour: "2pm", load: 58 },
  { hour: "3pm", load: 62 }, { hour: "4pm", load: 75 }, { hour: "5pm", load: 88 },
  { hour: "6pm", load: 84 }, { hour: "7pm", load: 65 }, { hour: "8pm", load: 40 },
];

const AQI_DATA = [
  { day: "Mon", aqi: 62 }, { day: "Tue", aqi: 58 }, { day: "Wed", aqi: 71 },
  { day: "Thu", aqi: 68 }, { day: "Fri", aqi: 75 }, { day: "Sat", aqi: 55 }, { day: "Sun", aqi: 48 },
];

const KPI_CARDS = [
  { label: "Population",      value: "3.2M",   trend: "+1.2%", up: true,  icon: "👥", color: "#7C3AED" },
  { label: "Active Sensors",  value: "12,847", trend: "+24",   up: true,  icon: "📡", color: "#4ECDC4" },
  { label: "Avg AQI Today",   value: "68",     trend: "-3 pts",up: false, icon: "🌫️", color: "#FF6B35" },
  { label: "Grid Load",       value: "78%",    trend: "+4%",   up: true,  icon: "⚡", color: "#FFE66D" },
  { label: "Water Pressure",  value: "Normal", trend: "Stable",up: true,  icon: "💧", color: "#4A90E2" },
  { label: "Open Incidents",  value: "3",      trend: "-2",    up: false, icon: "🛡️", color: "#A8E6CF" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.ok ? setBackendStatus("online") : setBackendStatus("error"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const statusColor = { online: "#22C55E", offline: "#FF6B6B", checking: "#FFE66D", error: "#FF6B6B" };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <div style={s.title}>
            <div style={s.logoIcon}>U</div>
            <span style={s.titleText}>City Dashboard</span>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={{ ...s.statusPill, background: statusColor[backendStatus] + "22", color: statusColor[backendStatus], border: `1px solid ${statusColor[backendStatus]}44` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[backendStatus] }} />
            Backend {backendStatus}
          </div>
          <button style={s.chatBtn} onClick={() => navigate("/chat")}>Open Chat →</button>
        </div>
      </div>

      <div style={s.body}>
        {/* KPI ROW */}
        <div style={s.kpiGrid}>
          {KPI_CARDS.map(k => (
            <div key={k.label} style={s.kpiCard}>
              <div style={{ ...s.kpiIcon, background: k.color + "22", color: k.color }}>{k.icon}</div>
              <div>
                <div style={s.kpiValue}>{k.value}</div>
                <div style={s.kpiLabel}>{k.label}</div>
              </div>
              <div style={{ ...s.kpiTrend, color: k.up ? "#22C55E" : "#FF6B6B" }}>{k.trend}</div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW */}
        <div style={s.chartsRow}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>🚦 Traffic Load — Today</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={TRAFFIC_DATA} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "#161622", border: "1px solid #2A2A40", borderRadius: 8, color: "#E8E8F0", fontSize: 12 }} />
                <Bar dataKey="load" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Road load %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartTitle}>🌫️ Air Quality Index — This Week</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={AQI_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555570", fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 90]} />
                <Tooltip contentStyle={{ background: "#161622", border: "1px solid #2A2A40", borderRadius: 8, color: "#E8E8F0", fontSize: 12 }} />
                <Line type="monotone" dataKey="aqi" stroke="#4ECDC4" strokeWidth={2} dot={{ fill: "#4ECDC4", r: 4 }} name="AQI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={s.actionsCard}>
          <div style={s.chartTitle}>Quick Actions</div>
          <div style={s.actionsRow}>
            {[
              { label: "Traffic in Mumbai",      module: "traffic", icon: "🚦", color: "#FF6B35" },
{ label: "Weather in Delhi",       module: "weather", icon: "🌤️", color: "#4ECDC4" },
{ label: "Pune → Mumbai Route",    module: "route",   icon: "🗺️", color: "#A78BFA" },
{ label: "Risk Report Bangalore",  module: "risk",    icon: "⚠️", color: "#FFE66D" },
{ label: "Travel Advisory Chennai",module: "traffic", icon: "🚌", color: "#88D8B0" },
{ label: "Open City Map",          module: null,      icon: "🗺️", color: "#7C3AED", nav: "/map" },
            ].map(a => (
              <button
                key={a.label}
                style={{ ...s.actionBtn, borderColor: "#1E1E2E" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = a.color + "55"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1E1E2E"}
                onClick={() => navigate(a.nav || `/chat?module=${a.module}`)}
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

const s = {
  page:       { minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0" },
  header:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#111118", borderBottom: "1px solid #1E1E2E" },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  backBtn:    { background: "none", border: "none", color: "#555570", fontSize: 13, cursor: "pointer" },
  title:      { display: "flex", alignItems: "center", gap: 8 },
  logoIcon:   { width: 28, height: 28, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white" },
  titleText:  { fontWeight: 700, fontSize: 16, color: "#E8E8F0" },
  headerRight:{ display: "flex", alignItems: "center", gap: 10 },
  statusPill: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "5px 10px", borderRadius: 20 },
  chatBtn:    { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 7, cursor: "pointer" },
  body:       { padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 },
  kpiGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 },
  kpiCard:    { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "16px", display: "flex", alignItems: "center", gap: 12 },
  kpiIcon:    { width: 40, height: 40, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  kpiValue:   { fontSize: 20, fontWeight: 700, color: "#E8E8F0" },
  kpiLabel:   { fontSize: 11, color: "#555570", textTransform: "uppercase", letterSpacing: "0.4px" },
  kpiTrend:   { marginLeft: "auto", fontSize: 12, fontWeight: 600, flexShrink: 0 },
  chartsRow:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  chartCard:  { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "18px 20px" },
  chartTitle: { fontSize: 14, fontWeight: 600, color: "#C0C0D8", marginBottom: 16 },
  actionsCard:{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "18px 20px" },
  actionsRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 },
  actionBtn:  { display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid", borderRadius: 8, padding: "10px 14px", cursor: "pointer", transition: "border-color 0.2s", color: "#C0C0D8", fontSize: 13 },
  actionIcon: { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  actionLabel:{ fontSize: 13, fontWeight: 500 },
};