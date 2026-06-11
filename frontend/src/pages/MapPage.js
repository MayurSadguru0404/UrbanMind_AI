import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's broken default icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LAYERS = [
  { id: "traffic",       label: "Traffic",     icon: "🚦", color: "#FF6B35" },
  { id: "air_quality",   label: "Air Quality", icon: "🌫️", color: "#4ECDC4" },
  { id: "energy",        label: "Energy",      icon: "⚡", color: "#FFE66D" },
  { id: "water",         label: "Water",       icon: "💧", color: "#4A90E2" },
  { id: "public_safety", label: "Safety",      icon: "🛡️", color: "#A8E6CF" },
];

const INCIDENTS = [
  { id: 1, type: "traffic",       lat: 28.644,  lng: 77.216,  title: "Traffic Jam",        desc: "Heavy congestion on Ring Road NH-48",       severity: "high"   },
  { id: 2, type: "air_quality",   lat: 28.632,  lng: 77.220,  title: "High AQI Zone",      desc: "AQI: 187 — Unhealthy for sensitive groups", severity: "medium" },
  { id: 3, type: "energy",        lat: 28.650,  lng: 77.230,  title: "Grid Overload",      desc: "Sector 7 at 94% grid capacity",             severity: "high"   },
  { id: 4, type: "water",         lat: 28.625,  lng: 77.210,  title: "Pipe Maintenance",   desc: "Scheduled work on main supply line",        severity: "low"    },
  { id: 5, type: "public_safety", lat: 28.640,  lng: 77.205,  title: "Incident Reported",  desc: "Minor accident at intersection 12B",        severity: "medium" },
  { id: 6, type: "traffic",       lat: 28.655,  lng: 77.225,  title: "Road Works",         desc: "Lane closure on NH-24, expect delays",      severity: "medium" },
];

const SEVERITY_COLOR = { high: "#FF6B6B", medium: "#FFE66D", low: "#22C55E" };

export default function MapPage() {
  const navigate = useNavigate();
  const [activeLayers, setActiveLayers] = useState(new Set(LAYERS.map(l => l.id)));
  const [selectedIncident, setSelectedIncident] = useState(null);

  const toggleLayer = (id) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const layerColor = (type) => LAYERS.find(l => l.id === type)?.color || "#888";
  const visible = INCIDENTS.filter(i => activeLayers.has(i.type));

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <span style={s.title}>🗺️ City Live Map</span>
        </div>
        <div style={s.headerRight}>
          <button style={s.chatBtn} onClick={() => navigate("/chat")}>Open Chat →</button>
          <button style={s.dashBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </div>

      <div style={s.body}>
        {/* LAYER PANEL */}
        <div style={s.panel}>
          <div style={s.panelTitle}>Map Layers</div>
          {LAYERS.map(layer => (
            <button
              key={layer.id}
              style={{ ...s.layerBtn, ...(activeLayers.has(layer.id) ? { ...s.layerActive, borderColor: layer.color + "66", background: layer.color + "11" } : {}) }}
              onClick={() => toggleLayer(layer.id)}
            >
              <span style={{ ...s.layerIcon, background: layer.color + "22", color: layer.color }}>{layer.icon}</span>
              <span style={s.layerLabel}>{layer.label}</span>
              <div style={{ ...s.layerCheck, background: activeLayers.has(layer.id) ? layer.color : "transparent", borderColor: activeLayers.has(layer.id) ? layer.color : "#2A2A40" }}>
                {activeLayers.has(layer.id) && <span style={{ color: "white", fontSize: 9 }}>✓</span>}
              </div>
            </button>
          ))}

          {selectedIncident && (
            <div style={s.incidentCard}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={s.incidentTitle}>{selectedIncident.title}</span>
                <button style={s.closeBtn} onClick={() => setSelectedIncident(null)}>✕</button>
              </div>
              <div style={{ ...s.severityBadge, background: SEVERITY_COLOR[selectedIncident.severity] + "22", color: SEVERITY_COLOR[selectedIncident.severity] }}>
                {selectedIncident.severity.toUpperCase()}
              </div>
              <p style={s.incidentDesc}>{selectedIncident.desc}</p>
              <button style={s.askBtn} onClick={() => navigate(`/chat?module=${selectedIncident.type}`)}>
                Ask AI about this →
              </button>
            </div>
          )}

          <div style={s.legend}>
            <div style={s.legendTitle}>Severity</div>
            {Object.entries(SEVERITY_COLOR).map(([k, v]) => (
              <div key={k} style={s.legendRow}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: v }} />
                <span style={s.legendLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAP */}
        <div style={s.mapWrap}>
          <MapContainer center={[28.640, 77.216]} zoom={13} style={{ width: "100%", height: "100%" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {visible.map(inc => (
              <React.Fragment key={inc.id}>
                <Circle
                  center={[inc.lat, inc.lng]}
                  radius={300}
                  pathOptions={{ color: layerColor(inc.type), fillColor: layerColor(inc.type), fillOpacity: 0.15, weight: 1.5 }}
                />
                <Marker
                  position={[inc.lat, inc.lng]}
                  eventHandlers={{ click: () => setSelectedIncident(inc) }}
                >
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, minWidth: 160 }}>
                      <strong>{inc.title}</strong>
                      <p style={{ margin: "4px 0 0", color: "#666" }}>{inc.desc}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:          { height: "100vh", display: "flex", flexDirection: "column", background: "#0A0A0F" },
  header:        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#111118", borderBottom: "1px solid #1E1E2E", flexShrink: 0, height: 52 },
  headerLeft:    { display: "flex", alignItems: "center", gap: 14 },
  backBtn:       { background: "none", border: "none", color: "#555570", fontSize: 13, cursor: "pointer" },
  title:         { fontSize: 15, fontWeight: 600, color: "#E8E8F0" },
  headerRight:   { display: "flex", gap: 8 },
  chatBtn:       { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 7, cursor: "pointer" },
  dashBtn:       { background: "none", border: "1px solid #2A2A40", color: "#7070A0", fontSize: 13, padding: "6px 12px", borderRadius: 7, cursor: "pointer" },
  body:          { flex: 1, display: "flex", overflow: "hidden" },
  panel:         { width: 220, background: "#111118", borderRight: "1px solid #1E1E2E", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" },
  panelTitle:    { fontSize: 10, fontWeight: 600, color: "#333345", letterSpacing: 1, textTransform: "uppercase", padding: "0 4px 6px" },
  layerBtn:      { display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", background: "none", border: "1px solid transparent", borderRadius: 8, cursor: "pointer", color: "#7070A0", width: "100%", transition: "all 0.15s" },
  layerActive:   { color: "#E8E8F0" },
  layerIcon:     { width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 },
  layerLabel:    { fontSize: 12, fontWeight: 500, flex: 1, textAlign: "left" },
  layerCheck:    { width: 16, height: 16, borderRadius: 4, border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" },
  incidentCard:  { background: "#1A1A28", border: "1px solid #2A2A40", borderRadius: 9, padding: "12px", marginTop: 8 },
  incidentTitle: { fontSize: 13, fontWeight: 600, color: "#E8E8F0" },
  closeBtn:      { background: "none", border: "none", color: "#555570", cursor: "pointer", fontSize: 13 },
  severityBadge: { display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, marginBottom: 6, letterSpacing: "0.5px" },
  incidentDesc:  { fontSize: 12, color: "#8888A8", lineHeight: 1.5, margin: "0 0 10px" },
  askBtn:        { width: "100%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 12, fontWeight: 600, padding: "7px", borderRadius: 7, cursor: "pointer" },
  legend:        { marginTop: "auto", padding: "10px 4px 0", borderTop: "1px solid #1E1E2E" },
  legendTitle:   { fontSize: 10, fontWeight: 600, color: "#333345", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  legendRow:     { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  legendLabel:   { fontSize: 11, color: "#666680" },
  mapWrap:       { flex: 1, position: "relative" },
};