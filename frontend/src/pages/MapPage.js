import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CITY_COORDS = {
  "Pune": [18.5204, 73.8567], "Mumbai": [19.0760, 72.8777], "Delhi": [28.7041, 77.1025],
  "Bangalore": [12.9716, 77.5946], "Hyderabad": [17.3850, 78.4867], "Chennai": [13.0827, 80.2707],
  "Kolkata": [22.5726, 88.3639], "Ahmedabad": [23.0225, 72.5714], "Jaipur": [26.9124, 75.7873],
  "Lucknow": [26.8467, 80.9462], "Nagpur": [21.1458, 79.0882], "Surat": [21.1702, 72.8311],
  "Patna": [25.5941, 85.1376], "Nashik": [19.9975, 73.7898], "Indore": [22.7196, 75.8577],
};

const RISK_COLOR    = { High: "#FF6B6B", Medium: "#FFE66D", Low: "#22C55E" };
const RISK_RADIUS   = { High: 18000, Medium: 14000, Low: 10000 };
const SEVERITY_COLOR = { high: "#FF6B6B", medium: "#FFE66D", low: "#22C55E" };

function makeIncidentIcon(severity) {
  const color = SEVERITY_COLOR[severity] || "#FFE66D";
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:2px solid #0A0A0F;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 0 8px ${color}88;">⚠️</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12],
  });
}

function FlyToCity({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.[0] && coords?.[1]) map.flyTo([coords[0], coords[1]], 12, { duration: 1.8, easeLinearity: 0.25 });
  }, [coords, map]);
  return null;
}

function ResetView({ trigger }) {
  const map = useMap();
  useEffect(() => {
    if (trigger) map.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  }, [trigger, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [cities, setCities]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCity, setSelectedCity]       = useState(null);
  const [searchQuery, setSearchQuery]         = useState("");
  const [searchResult, setSearchResult]       = useState(null);
  const [searchError, setSearchError]         = useState("");
  const [flyTo, setFlyTo]                     = useState(null);
  const [resetTrigger, setResetTrigger]       = useState(0);
  const [filterRisk, setFilterRisk]           = useState("All");
  const [searching, setSearching]             = useState(false);
  const [incidents, setIncidents]             = useState([]);
  const [trafficFlow, setTrafficFlow]         = useState(null);
  const [showIncidents, setShowIncidents]     = useState(true);
  const [trafficLoading, setTrafficLoading]   = useState(false);
  const [panelOpen, setPanelOpen]             = useState(false);
  const [isMobile, setIsMobile]               = useState(window.innerWidth < 768);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/monitor`)
      .then(r => r.json())
      .then(data => {
        const enriched = (data.cities || []).map(city => ({
          ...city,
          lat: city.lat || CITY_COORDS[city.city]?.[0],
          lng: city.lng || CITY_COORDS[city.city]?.[1],
        })).filter(c => c.lat && c.lng);
        setCities(enriched);
      })
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, []);

  const fetchTrafficData = async (cityName) => {
    setTrafficLoading(true);
    setTrafficFlow(null);
    setIncidents([]);
    try {
      const [flowRes, incRes] = await Promise.all([
        fetch(`${API_BASE}/traffic/flow/${encodeURIComponent(cityName)}`),
        fetch(`${API_BASE}/traffic/incidents/${encodeURIComponent(cityName)}`),
      ]);
      if (flowRes.ok) setTrafficFlow(await flowRes.json());
      if (incRes.ok) { const d = await incRes.json(); setIncidents(d.incidents || []); }
    } catch (e) {}
    finally { setTrafficLoading(false); }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSearchError(""); setSearchResult(null); setSearching(true);
    setTrafficFlow(null); setIncidents([]);
    try {
      const res = await fetch(`${API_BASE}/city/${encodeURIComponent(query)}`);
      if (!res.ok) { const err = await res.json(); setSearchError(err.detail || `"${query}" not found.`); return; }
      const data = await res.json();
      const lat = data.lat, lng = data.lng;
      if (!lat || !lng) { setSearchResult({ ...data, noCoords: true }); return; }
      const enriched = { ...data, lat, lng };
      setSearchResult(enriched); setSelectedCity(enriched); setFlyTo([lat, lng]);
      setCities(prev => prev.find(c => c.city.toLowerCase() === data.city.toLowerCase()) ? prev : [...prev, enriched]);
      if (isMobile) setPanelOpen(true);
      await fetchTrafficData(data.city);
    } catch (err) {
      setSearchError("Could not reach backend.");
    } finally { setSearching(false); }
  };

  const handleCityClick = async (city) => {
    setSelectedCity(city); setFlyTo([city.lat, city.lng]);
    setSearchQuery(city.city); setSearchResult(city); setSearchError("");
    if (isMobile) setPanelOpen(true);
    await fetchTrafficData(city.city);
  };

  const handleReset = () => {
    setSearchQuery(""); setSearchResult(null); setSelectedCity(null);
    setSearchError(""); setFlyTo(null); setTrafficFlow(null);
    setIncidents([]); setResetTrigger(t => t + 1); setPanelOpen(false);
  };

  const visibleCities = filterRisk === "All" ? cities : cities.filter(c => c.traffic_risk === filterRisk);

  const PanelContent = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, height: "100%", overflowY: "auto" }}>
      {/* SEARCH */}
      <div style={s.panelTitle}>Search Any City</div>
      <div style={s.searchBox}>
        <input ref={searchRef} style={s.searchInput} value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSearchError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="e.g. Mumbai, Tokyo..." />
        <button style={s.searchBtn} onClick={handleSearch} disabled={searching}>
          {searching ? "..." : "→"}
        </button>
      </div>
      {searchError && <div style={s.searchError}>{searchError}</div>}

      {/* RESULT CARD */}
      {searchResult && (
        <div style={s.resultCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={s.resultCity}>{searchResult.city}</span>
            <button style={s.closeBtn} onClick={handleReset}>✕</button>
          </div>
          {searchResult.noCoords ? (
            <div style={s.notMonitored}>Location data unavailable</div>
          ) : (
            <>
              {searchResult.traffic_risk && (
                <div style={{ ...s.riskBadge, background: RISK_COLOR[searchResult.traffic_risk] + "22", color: RISK_COLOR[searchResult.traffic_risk] }}>
                  {searchResult.traffic_risk} Traffic Risk
                </div>
              )}
              <div style={s.resultStats}>
                <div style={s.resultStat}><span style={s.statIcon}>🌡️</span><span>{searchResult.temperature?.toFixed(1)}°C</span></div>
                <div style={s.resultStat}><span style={s.statIcon}>💧</span><span>{searchResult.humidity}% humidity</span></div>
                <div style={s.resultStat}><span style={s.statIcon}>☁️</span><span style={{ textTransform: "capitalize" }}>{searchResult.weather_condition}</span></div>
              </div>
              {searchResult.ai_insight && (
                <div style={s.aiInsight}>
                  <span style={s.aiLabel}>🧠 AI Insight</span>
                  <p style={s.aiText}>{searchResult.ai_insight}</p>
                </div>
              )}
              {trafficLoading && <div style={s.trafficLoading}>⏳ Fetching live traffic...</div>}
              {trafficFlow && !trafficLoading && (
                <div style={s.flowCard}>
                  <span style={s.aiLabel}>🚦 Live Traffic Flow</span>
                  <div style={s.flowRow}><span style={s.flowLabel}>Current Speed</span><span style={s.flowValue}>{trafficFlow.current_speed_kmh} km/h</span></div>
                  <div style={s.flowRow}><span style={s.flowLabel}>Free Flow</span><span style={s.flowValue}>{trafficFlow.free_flow_speed_kmh} km/h</span></div>
                  <div style={s.flowRow}>
                    <span style={s.flowLabel}>Congestion</span>
                    <span style={{ ...s.flowValue, color: trafficFlow.congestion_percent >= 60 ? "#FF6B6B" : trafficFlow.congestion_percent >= 30 ? "#FFE66D" : "#22C55E" }}>
                      {trafficFlow.congestion_percent}% — {trafficFlow.congestion_level}
                    </span>
                  </div>
                  <div style={s.congestionBarWrap}>
                    <div style={{ ...s.congestionBar, width: `${trafficFlow.congestion_percent}%`, background: trafficFlow.congestion_percent >= 60 ? "#FF6B6B" : trafficFlow.congestion_percent >= 30 ? "#FFE66D" : "#22C55E" }} />
                  </div>
                  <div style={s.incidentCount}>⚠️ {incidents.length} live incident{incidents.length !== 1 ? "s" : ""}</div>
                </div>
              )}
              <button style={s.askBtn} onClick={() => navigate("/chat?module=traffic")}>Ask AI about {searchResult.city} →</button>
            </>
          )}
        </div>
      )}

      {/* FILTER */}
      <div style={{ marginTop: 4 }}>
        <div style={s.panelTitle}>Filter by Risk</div>
        <div style={s.filterRow}>
          {["All", "High", "Medium", "Low"].map(r => (
            <button key={r} style={{ ...s.filterBtn, ...(filterRisk === r ? { background: r === "All" ? "#7C3AED22" : RISK_COLOR[r] + "22", color: r === "All" ? "#A78BFA" : RISK_COLOR[r], borderColor: r === "All" ? "#7C3AED44" : RISK_COLOR[r] + "44" } : {}) }}
              onClick={() => setFilterRisk(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* CITY LIST */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={s.panelTitle}>Live Cities {filterRisk !== "All" && `· ${filterRisk}`}</div>
        {loading ? <div style={s.loadingText}>Loading...</div>
          : visibleCities.length === 0 ? <div style={s.loadingText}>No cities</div>
          : visibleCities.map(city => (
            <button key={city.city} style={{ ...s.cityItem, ...(selectedCity?.city === city.city ? s.cityItemActive : {}) }}
              onClick={() => handleCityClick(city)}>
              <div style={{ flex: 1 }}>
                <div style={s.cityName}>{city.city}</div>
                <div style={s.cityWeather}>{city.weather_condition} · {city.temperature?.toFixed(1)}°C</div>
              </div>
              <div style={{ ...s.riskDot, background: RISK_COLOR[city.traffic_risk] || "#888", boxShadow: `0 0 5px ${RISK_COLOR[city.traffic_risk] || "#888"}88` }} />
            </button>
          ))}
      </div>

      {/* LEGEND */}
      <div style={s.legend}>
        <div style={s.legendTitle}>Traffic Risk</div>
        {Object.entries(RISK_COLOR).map(([k, v]) => (
          <div key={k} style={s.legendRow}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: v }} />
            <span style={s.legendLabel}>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <span style={s.title}>🗺️ {isMobile ? "Map" : "City Live Map"}</span>
          {!loading && <span style={s.cityCount}>{cities.length} cities</span>}
          {incidents.length > 0 && <span style={s.incidentBadge}>⚠️ {incidents.length}</span>}
        </div>
        <div style={s.headerRight}>
          {isMobile ? (
            <button style={s.panelToggleBtn} onClick={() => setPanelOpen(v => !v)}>
              {panelOpen ? "✕ Close" : "🔍 Search"}
            </button>
          ) : (
            <>
              {incidents.length > 0 && (
                <button style={{ ...s.toggleBtn, ...(showIncidents ? s.toggleActive : {}) }}
                  onClick={() => setShowIncidents(v => !v)}>
                  {showIncidents ? "Hide Incidents" : "Show Incidents"}
                </button>
              )}
              <button style={s.chatBtn} onClick={() => navigate("/chat")}>Chat →</button>
              <button style={s.dashBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
            </>
          )}
        </div>
      </div>

      <div style={{ ...s.body, flexDirection: isMobile ? "column" : "row" }}>

        {/* PANEL — desktop: sidebar | mobile: bottom sheet */}
        {!isMobile ? (
          <div style={s.panel}><PanelContent /></div>
        ) : panelOpen ? (
          <>
            <div style={s.mobileOverlay} onClick={() => setPanelOpen(false)} />
            <div style={s.mobilePanel}><PanelContent /></div>
          </>
        ) : null}

        {/* MAP */}
        <div style={{ ...s.mapWrap, height: isMobile ? "calc(100vh - 52px)" : "100%" }}>
          {loading && (
            <div style={s.mapOverlay}>
              <div style={s.mapLoading}>🗺️ Loading live city data...</div>
            </div>
          )}

          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ width: "100%", height: "100%" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {flyTo && <FlyToCity coords={flyTo} key={`${flyTo[0]}-${flyTo[1]}`} />}
            <ResetView trigger={resetTrigger} />

            {visibleCities.map(city => (
              <React.Fragment key={city.city}>
                <Circle center={[city.lat, city.lng]} radius={RISK_RADIUS[city.traffic_risk] || 12000}
                  pathOptions={{ color: RISK_COLOR[city.traffic_risk] || "#888", fillColor: RISK_COLOR[city.traffic_risk] || "#888", fillOpacity: selectedCity?.city === city.city ? 0.25 : 0.08, weight: selectedCity?.city === city.city ? 2 : 1 }} />
                <Marker position={[city.lat, city.lng]} eventHandlers={{ click: () => handleCityClick(city) }}>
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, minWidth: 170 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{city.city}</div>
                      <span style={{ background: (RISK_COLOR[city.traffic_risk] || "#888") + "22", color: RISK_COLOR[city.traffic_risk] || "#888", padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {city.traffic_risk} Risk
                      </span>
                      <div style={{ color: "#666", marginTop: 8, fontSize: 12 }}>🌡️ {city.temperature?.toFixed(1)}°C &nbsp; 💧 {city.humidity}%</div>
                      <div style={{ color: "#888", marginTop: 3, fontSize: 12, textTransform: "capitalize" }}>☁️ {city.weather_condition}</div>
                      {city.ai_insight && (
                        <div style={{ marginTop: 8, padding: "6px 8px", background: "#f5f5ff", borderRadius: 5, fontSize: 11, color: "#444", lineHeight: 1.5 }}>
                          🧠 {city.ai_insight}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {showIncidents && incidents.map((inc, i) => (
              <Marker key={`inc-${i}`} position={[inc.lat, inc.lng]} icon={makeIncidentIcon(inc.severity)}>
                <Popup>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, minWidth: 170 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ background: SEVERITY_COLOR[inc.severity] + "22", color: SEVERITY_COLOR[inc.severity], padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, marginRight: 6 }}>
                        {inc.severity?.toUpperCase()}
                      </span>
                      Traffic Incident
                    </div>
                    <p style={{ margin: "0 0 6px", color: "#333", lineHeight: 1.4 }}>{inc.description}</p>
                    {inc.from && <p style={{ margin: "0 0 2px", fontSize: 11, color: "#666" }}>📍 From: {inc.from}</p>}
                    {inc.to && <p style={{ margin: "0 0 2px", fontSize: 11, color: "#666" }}>📍 To: {inc.to}</p>}
                    {inc.delay_seconds > 0 && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#FF6B35", fontWeight: 600 }}>⏱ Delay: ~{Math.round(inc.delay_seconds / 60)} min</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {(flyTo || searchResult) && (
            <button style={s.resetMapBtn} onClick={handleReset}>🗺️ Show All</button>
          )}

          {trafficFlow && incidents.length > 0 && (
            <div style={s.trafficSummary}>
              <span style={{ fontWeight: 600, color: "#E8E8F0" }}>{searchResult?.city}</span>
              <span style={{ color: trafficFlow.congestion_percent >= 60 ? "#FF6B6B" : trafficFlow.congestion_percent >= 30 ? "#FFE66D" : "#22C55E", fontWeight: 600 }}>
                {trafficFlow.congestion_level}
              </span>
              <span style={{ color: "#FF6B35" }}>⚠️ {incidents.length}</span>
            </div>
          )}

          {/* Mobile floating search button */}
          {isMobile && !panelOpen && (
            <button style={s.mobileSearchFab} onClick={() => setPanelOpen(true)}>🔍</button>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:             { height: "100vh", display: "flex", flexDirection: "column", background: "#0A0A0F" },
  header:           { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#111118", borderBottom: "1px solid #1E1E2E", flexShrink: 0, height: 52 },
  headerLeft:       { display: "flex", alignItems: "center", gap: 8 },
  backBtn:          { background: "none", border: "none", color: "#555570", fontSize: 13, cursor: "pointer" },
  title:            { fontSize: 14, fontWeight: 600, color: "#E8E8F0" },
  cityCount:        { fontSize: 11, color: "#22C55E", background: "#22C55E22", padding: "2px 7px", borderRadius: 10, border: "1px solid #22C55E33" },
  incidentBadge:    { fontSize: 11, color: "#FF6B35", background: "#FF6B3522", padding: "2px 7px", borderRadius: 10, border: "1px solid #FF6B3533" },
  headerRight:      { display: "flex", gap: 6, alignItems: "center" },
  toggleBtn:        { background: "none", border: "1px solid #2A2A40", color: "#555570", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" },
  toggleActive:     { borderColor: "#FF6B3544", color: "#FF6B35", background: "#FF6B3511" },
  panelToggleBtn:   { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  chatBtn:          { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 7, cursor: "pointer" },
  dashBtn:          { background: "none", border: "1px solid #2A2A40", color: "#7070A0", fontSize: 12, padding: "5px 10px", borderRadius: 7, cursor: "pointer" },
  body:             { flex: 1, display: "flex", overflow: "hidden" },
  panel:            { width: 245, background: "#111118", borderRight: "1px solid #1E1E2E", padding: "10px 8px", display: "flex", flexDirection: "column", overflowY: "hidden" },
  mobileOverlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300 },
  mobilePanel:      { position: "fixed", bottom: 0, left: 0, right: 0, background: "#111118", borderTop: "1px solid #2A2A40", borderRadius: "16px 16px 0 0", padding: "16px 14px", maxHeight: "75vh", overflowY: "auto", zIndex: 400, display: "flex", flexDirection: "column", gap: 6 },
  panelTitle:       { fontSize: 9, fontWeight: 600, color: "#333345", letterSpacing: 1, textTransform: "uppercase", padding: "0 2px 4px" },
  searchBox:        { display: "flex", gap: 6, marginBottom: 2 },
  searchInput:      { flex: 1, background: "#161622", border: "1px solid #2A2A40", borderRadius: 7, padding: "8px 10px", color: "#E8E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" },
  searchBtn:        { width: 36, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", borderRadius: 7, color: "white", cursor: "pointer", fontSize: 16 },
  searchError:      { fontSize: 11, color: "#FF6B6B", padding: "0 2px 2px" },
  resultCard:       { background: "#1A1A28", border: "1px solid #2A2A40", borderRadius: 9, padding: "10px", marginBottom: 4, flexShrink: 0 },
  resultCity:       { fontSize: 14, fontWeight: 700, color: "#E8E8F0" },
  closeBtn:         { background: "none", border: "none", color: "#555570", cursor: "pointer", fontSize: 14 },
  notMonitored:     { fontSize: 11, color: "#666680", marginTop: 4 },
  riskBadge:        { display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, marginBottom: 6, letterSpacing: "0.5px" },
  resultStats:      { display: "flex", flexDirection: "column", gap: 4, marginBottom: 6 },
  resultStat:       { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9090B0" },
  statIcon:         { fontSize: 13 },
  aiInsight:        { background: "#0D0D15", border: "1px solid #2A2A3A", borderRadius: 6, padding: "7px", marginBottom: 6 },
  aiLabel:          { fontSize: 10, fontWeight: 600, color: "#7C3AED", display: "block", marginBottom: 4 },
  aiText:           { fontSize: 11, color: "#8888A8", lineHeight: 1.5, margin: 0 },
  trafficLoading:   { fontSize: 11, color: "#555570", padding: "5px 0", textAlign: "center" },
  flowCard:         { background: "#0D0D15", border: "1px solid #2A2A3A", borderRadius: 6, padding: "8px", marginBottom: 6 },
  flowRow:          { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  flowLabel:        { fontSize: 11, color: "#666680" },
  flowValue:        { fontSize: 12, fontWeight: 600, color: "#C0C0D8" },
  congestionBarWrap:{ height: 4, background: "#1E1E2E", borderRadius: 2, overflow: "hidden", marginBottom: 5 },
  congestionBar:    { height: "100%", borderRadius: 2, transition: "width 0.5s ease" },
  incidentCount:    { fontSize: 11, color: "#FF6B35", paddingTop: 4, borderTop: "1px solid #2A2A3A" },
  askBtn:           { width: "100%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", fontSize: 12, fontWeight: 600, padding: "8px", borderRadius: 7, cursor: "pointer" },
  filterRow:        { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 },
  filterBtn:        { background: "none", border: "1px solid #2A2A40", color: "#555570", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" },
  cityItem:         { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px", background: "none", border: "1px solid transparent", borderRadius: 7, cursor: "pointer", textAlign: "left" },
  cityItemActive:   { background: "#1A1A28", border: "1px solid #2A2A40" },
  cityName:         { fontSize: 12, fontWeight: 600, color: "#C0C0D8" },
  cityWeather:      { fontSize: 10, color: "#555570", textTransform: "capitalize", marginTop: 1 },
  riskDot:          { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  loadingText:      { fontSize: 12, color: "#444460", padding: "8px 2px" },
  legend:           { padding: "8px 2px 0", borderTop: "1px solid #1E1E2E", flexShrink: 0 },
  legendTitle:      { fontSize: 9, fontWeight: 600, color: "#333345", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  legendRow:        { display: "flex", alignItems: "center", gap: 6, marginBottom: 3 },
  legendLabel:      { fontSize: 11, color: "#666680" },
  mapWrap:          { flex: 1, position: "relative" },
  mapOverlay:       { position: "absolute", inset: 0, background: "#0A0A0F99", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  mapLoading:       { fontSize: 15, color: "#7070A0" },
  resetMapBtn:      { position: "absolute", bottom: 20, right: 20, zIndex: 1000, background: "#111118", border: "1px solid #2A2A40", color: "#9090B0", borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer", boxShadow: "0 2px 12px #00000088" },
  trafficSummary:   { position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "#111118EE", border: "1px solid #2A2A40", borderRadius: 20, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, boxShadow: "0 2px 12px #00000088", backdropFilter: "blur(8px)", whiteSpace: "nowrap" },
  mobileSearchFab:  { position: "absolute", bottom: 80, right: 16, zIndex: 1000, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", color: "white", width: 48, height: 48, borderRadius: "50%", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 16px #7C3AED66", display: "flex", alignItems: "center", justifyContent: "center" },
};