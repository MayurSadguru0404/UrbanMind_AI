import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:8000";

const MODULES = [
  { id: "traffic",       icon: "🚦", label: "Traffic",     color: "#FF6B35" },
  { id: "air_quality",   icon: "🌫️", label: "Air Quality", color: "#4ECDC4" },
  { id: "energy",        icon: "⚡", label: "Energy",      color: "#FFE66D" },
  { id: "water",         icon: "💧", label: "Water",       color: "#4A90E2" },
  { id: "public_safety", icon: "🛡️", label: "Safety",      color: "#A8E6CF" },
  { id: "waste",         icon: "♻️", label: "Waste",       color: "#88D8B0" },
];

const SUGGESTIONS = [
  "What are the peak traffic hours in the city center?",
  "How is air quality trending this week?",
  "Which areas have the highest energy consumption?",
  "Are there any water supply issues reported today?",
  "What emergency incidents happened in the last 24 hours?",
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialModule = searchParams.get("module") || null;

  const [activeModule, setActiveModule] = useState(initialModule);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Welcome to UrbanMind AI. Select a module from the sidebar or ask me anything about your city.", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text, timestamp: new Date() }]);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, history: messages.map(m => ({ role: m.role, text: m.content })) }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const reply = data.ai_explaination || data.response || data.answer || JSON.stringify(data);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant", content: reply,
        module: activeModule, sources: data.sources || [], timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant", isError: true, timestamp: new Date(),
        content: `Could not reach the backend at ${API_BASE}.\n\nMake sure the FastAPI server is running:\n  cd backend\n  uvicorn main:app --reload\n\nError: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  }, [activeModule, loading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const mod = MODULES.find(m => m.id === activeModule);

  return (
    <div style={s.page}>
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Back</button>
          <div style={s.logo}>
            <div style={s.logoIcon}>U</div>
            <div>
              <div style={s.logoTitle}>UrbanMind</div>
              <div style={s.logoSub}>City Intelligence</div>
            </div>
          </div>
        </div>

        <div style={s.navSection}>
          <div style={s.navLabel}>MODULES</div>
          {MODULES.map(m => (
            <button
              key={m.id}
              style={{ ...s.navItem, ...(activeModule === m.id ? s.navItemActive : {}) }}
              onClick={() => setActiveModule(m.id)}
            >
              <span style={{ ...s.navIcon, background: m.color + "22", color: m.color }}>{m.icon}</span>
              <span style={s.navName}>{m.label}</span>
              {activeModule === m.id && <div style={s.navDot} />}
            </button>
          ))}
          <button
            style={{ ...s.navItem, ...(activeModule === null ? s.navItemActive : {}), marginTop: 8 }}
            onClick={() => setActiveModule(null)}
          >
            <span style={{ ...s.navIcon, background: "#7C3AED22", color: "#7C3AED" }}>🧠</span>
            <span style={s.navName}>All Modules</span>
            {activeModule === null && <div style={s.navDot} />}
          </button>
        </div>

        <div style={s.sidebarFooter}>
          <div style={s.statusDot} />
          <span style={s.statusText}>Backend at {API_BASE}</span>
        </div>
      </aside>

      {/* MAIN */}
      <div style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerTitle}>
            <span style={{ fontSize: 20 }}>{mod ? mod.icon : "🏙️"}</span>
            <span>{mod ? `${mod.label} Intelligence` : "City Overview"}</span>
          </div>
          <div style={s.headerActions}>
            <button style={s.headerBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button style={s.headerBtn} onClick={() => navigate("/map")}>Map</button>
            <button style={s.clearBtn} onClick={() => {
              setMessages([{ id: 1, role: "assistant", content: "Chat cleared. What would you like to know?", timestamp: new Date() }]);
            }}>↺ Clear</button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.chatArea}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {loading && <TypingIndicator mod={mod} />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={s.inputArea}>
          {showSuggestions && (
            <div style={s.suggestions}>
              <div style={s.suggestLabel}>Suggested queries</div>
              {SUGGESTIONS.map((q, i) => (
                <button key={i} style={s.suggestBtn}
                  onMouseEnter={e => e.target.style.color = "#C0C0D8"}
                  onMouseLeave={e => e.target.style.color = "#7070A0"}
                  onClick={() => { sendMessage(q); setShowSuggestions(false); }}>{q}</button>
              ))}
            </div>
          )}
          {mod && (
            <div style={{ ...s.moduleBadge, background: mod.color + "22", color: mod.color }}>
              {mod.icon} {mod.label} mode
            </div>
          )}
          <div style={s.inputRow}>
            <button style={s.iconBtn} onClick={() => setShowSuggestions(v => !v)} title="Suggestions">💡</button>
            <textarea
              style={s.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={mod ? `Ask about ${mod.label.toLowerCase()}...` : "Ask anything about your city..."}
              rows={1}
              disabled={loading}
            />
            <button
              style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
              disabled={!input.trim() || loading}
              onClick={() => sendMessage(input)}
            >→</button>
          </div>
          <div style={s.inputHint}>Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const mod = MODULES.find(m => m.id === msg.module);
  const time = msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ ...s.msg, ...(isUser ? s.msgUser : {}) }}>
      <div style={{ ...s.avatar, ...(isUser ? s.avatarUser : s.avatarBot) }}>
        {isUser ? "U" : (mod ? mod.icon : "🏙️")}
      </div>
      <div style={{ ...s.msgBody, ...(isUser ? { alignItems: "flex-end" } : {}) }}>
        {!isUser && mod && (
          <div style={{ ...s.modTag, background: mod.color + "22", color: mod.color }}>{mod.label}</div>
        )}
        <div style={{
          ...s.bubble,
          ...(isUser ? s.bubbleUser : s.bubbleBot),
          ...(msg.isError ? s.bubbleError : {}),
        }}>
          {msg.content.split("\n").map((line, i) => (
            <p key={i} style={{ margin: "0 0 3px" }}>{line || <br />}</p>
          ))}
          {msg.sources?.length > 0 && (
            <div style={s.sources}>
              <span style={s.sourcesLabel}>Sources</span>
              {msg.sources.map((src, i) => <span key={i} style={s.sourceChip}>{src}</span>)}
            </div>
          )}
        </div>
        <div style={s.msgTime}>{time}</div>
      </div>
    </div>
  );
}

function TypingIndicator({ mod }) {
  return (
    <div style={s.msg}>
      <div style={{ ...s.avatar, ...s.avatarBot }}>{mod ? mod.icon : "🏙️"}</div>
      <div style={s.msgBody}>
        <div style={{ ...s.bubble, ...s.bubbleBot, display: "flex", gap: 4, alignItems: "center", padding: "14px 16px" }}>
          {[0, 200, 400].map(delay => (
            <span key={delay} style={{
              width: 6, height: 6, borderRadius: "50%", background: "#555570", display: "inline-block",
              animation: `bounce 1.2s ${delay}ms infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:          { display: "flex", height: "100vh", background: "#0A0A0F", overflow: "hidden" },
  sidebar:       { width: 240, minWidth: 240, background: "#111118", borderRight: "1px solid #1E1E2E", display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" },
  sidebarHeader: { padding: "16px 12px 10px", borderBottom: "1px solid #1E1E2E" },
  backBtn:       { background: "none", border: "none", color: "#555570", fontSize: 13, cursor: "pointer", marginBottom: 12, padding: 0 },
  logo:          { display: "flex", alignItems: "center", gap: 8 },
  logoIcon:      { width: 32, height: 32, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "white" },
  logoTitle:     { fontWeight: 700, fontSize: 13, color: "#E8E8F0" },
  logoSub:       { fontSize: 10, color: "#555570" },
  navSection:    { padding: "10px 6px", flex: 1 },
  navLabel:      { fontSize: 9, fontWeight: 600, color: "#333345", letterSpacing: 1, padding: "8px 8px 4px", textTransform: "uppercase" },
  navItem:       { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", color: "#7070A0", textAlign: "left", transition: "all 0.15s" },
  navItemActive: { background: "#1A1A28", color: "#E8E8F0" },
  navIcon:       { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 },
  navName:       { fontSize: 13, fontWeight: 500, flex: 1 },
  navDot:        { width: 5, height: 5, borderRadius: "50%", background: "#7C3AED" },
  sidebarFooter: { padding: "10px 14px", borderTop: "1px solid #1E1E2E", display: "flex", alignItems: "center", gap: 6 },
  statusDot:     { width: 6, height: 6, borderRadius: "50%", background: "#22C55E" },
  statusText:    { fontSize: 11, color: "#444460" },
  main:          { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  header:        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#111118", borderBottom: "1px solid #1E1E2E", height: 54, flexShrink: 0 },
  headerTitle:   { display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#E8E8F0" },
  headerActions: { display: "flex", gap: 8, alignItems: "center" },
  headerBtn:     { background: "none", border: "1px solid #2A2A40", color: "#7070A0", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" },
  clearBtn:      { background: "none", border: "1px solid #2A2A40", color: "#555570", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" },
  chatArea:      { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14 },
  msg:           { display: "flex", gap: 8, maxWidth: "720px" },
  msgUser:       { marginLeft: "auto", flexDirection: "row-reverse" },
  msgBody:       { display: "flex", flexDirection: "column", gap: 4, maxWidth: "100%" },
  avatar:        { width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, alignSelf: "flex-end" },
  avatarBot:     { background: "#1A1A28" },
  avatarUser:    { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "white", fontSize: 12, fontWeight: 700 },
  modTag:        { fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4, width: "fit-content" },
  bubble:        { padding: "10px 13px", borderRadius: 10, fontSize: 13, lineHeight: 1.65, wordBreak: "break-word" },
  bubbleBot:     { background: "#161622", border: "1px solid #1E1E2E", color: "#C8C8E0", borderRadius: "10px 10px 10px 3px" },
  bubbleUser:    { background: "rgba(124,58,237,0.13)", border: "1px solid rgba(124,58,237,0.27)", color: "#E8E8F0", borderRadius: "10px 10px 3px 10px" },
  bubbleError:   { background: "rgba(255,107,53,0.1)", borderColor: "rgba(255,107,53,0.3)" },
  sources:       { marginTop: 8, paddingTop: 8, borderTop: "1px solid #2A2A3A", display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" },
  sourcesLabel:  { fontSize: 11, color: "#444460" },
  sourceChip:    { fontSize: 11, background: "#1E1E2E", color: "#6666A0", padding: "2px 7px", borderRadius: 4 },
  msgTime:       { fontSize: 10, color: "#333345" },
  inputArea:     { padding: "10px 14px 14px", background: "#0D0D15", borderTop: "1px solid #1E1E2E", flexShrink: 0 },
  suggestions:   { background: "#161622", border: "1px solid #2A2A3A", borderRadius: 9, padding: 10, marginBottom: 10, display: "flex", flexDirection: "column", gap: 2 },
  suggestLabel:  { fontSize: 10, color: "#444460", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  suggestBtn:    { textAlign: "left", background: "none", border: "none", color: "#7070A0", fontSize: 13, padding: "5px 6px", borderRadius: 5, cursor: "pointer", transition: "color 0.15s" },
  moduleBadge:   { fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 5, width: "fit-content", marginBottom: 6 },
  inputRow:      { display: "flex", alignItems: "flex-end", gap: 6, background: "#161622", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, padding: "5px 6px" },
  iconBtn:       { width: 30, height: 30, background: "#1E1E2E", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  textarea:      { flex: 1, background: "none", border: "none", outline: "none", color: "#D0D0E8", fontSize: 13, resize: "none", lineHeight: 1.5, padding: "4px 0", fontFamily: "inherit", maxHeight: 120, overflowY: "auto" },
  sendBtn:       { width: 30, height: 30, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", borderRadius: 7, cursor: "pointer", color: "white", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity 0.15s" },
  inputHint:     { fontSize: 10, color: "#222230", textAlign: "center", marginTop: 5 },
};