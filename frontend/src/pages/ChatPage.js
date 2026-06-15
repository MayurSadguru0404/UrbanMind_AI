import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const MODULES = [
  { id: "traffic", icon: "🚦", label: "Traffic & Travel", color: "#FF6B35" },
  { id: "weather", icon: "🌤️", label: "Weather",          color: "#4ECDC4" },
  { id: "route",   icon: "🗺️", label: "Route Planning",   color: "#A78BFA" },
  { id: "risk",    icon: "⚠️", label: "Risk Assessment",  color: "#FFE66D" },
];

const SUGGESTIONS = [
  "What is the traffic situation in Mumbai today?",
  "How is the weather in Delhi right now?",
  "Should I travel from Pune to Mumbai today?",
  "What is the traffic risk in Bangalore?",
  "Give me a travel advisory for Chennai.",
  "Weather and road conditions in Hyderabad?",
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialModule = searchParams.get("module") || null;

  const [activeModule, setActiveModule] = useState(initialModule);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Welcome to UrbanMind AI. Select a module or ask me anything about your city.", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text, timestamp: new Date() }]);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);
    setSidebarOpen(false);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, history: messages.map(m => ({ role: m.role, text: m.content })) }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const reply = data.ai_explanation || data.response || data.answer || JSON.stringify(data);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant", content: reply,
        module: activeModule, sources: data.sources || [], timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant", isError: true, timestamp: new Date(),
        content: `Could not reach the backend.\n\nError: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  }, [activeModule, loading, messages]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const mod = MODULES.find(m => m.id === activeModule);

  const SidebarContent = () => (
    <>
      <div style={s.sidebarHeader}>
        {isMobile ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Logo size={28} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#E8E8F0" }}>UrbanMind</span>
            </div>
            <button style={s.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
        ) : (
          <>
            <button style={s.backBtn} onClick={() => navigate("/")}>← Back</button>
            <Logo size={28} />
          </>
        )}
      </div>

      <div style={s.navSection}>
        <div style={s.navLabel}>MODULES</div>
        {MODULES.map(m => (
          <button
            key={m.id}
            style={{ ...s.navItem, ...(activeModule === m.id ? s.navItemActive : {}) }}
            onClick={() => { setActiveModule(m.id); setSidebarOpen(false); }}
          >
            <span style={{ ...s.navIcon, background: m.color + "22", color: m.color }}>{m.icon}</span>
            <span style={s.navName}>{m.label}</span>
            {activeModule === m.id && <div style={s.navDot} />}
          </button>
        ))}
        <button
          style={{ ...s.navItem, ...(activeModule === null ? s.navItemActive : {}), marginTop: 8 }}
          onClick={() => { setActiveModule(null); setSidebarOpen(false); }}
        >
          <span style={{ ...s.navIcon, background: "#7C3AED22", color: "#7C3AED" }}>🧠</span>
          <span style={s.navName}>All Modules</span>
          {activeModule === null && <div style={s.navDot} />}
        </button>
      </div>

      <div style={s.sidebarFooter}>
        <div style={s.statusDot} />
        <span style={s.statusText}>UrbanMind AI</span>
      </div>
    </>
  );

  return (
    <div style={s.page}>
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      {!isMobile ? (
        <aside style={s.sidebar}>
          <SidebarContent />
        </aside>
      ) : (
        <aside style={{ ...s.sidebar, ...s.mobileSidebar, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
          <SidebarContent />
        </aside>
      )}

      {/* MAIN */}
      <div style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isMobile && (
              <button style={s.menuBtn} onClick={() => setSidebarOpen(true)}>☰</button>
            )}
            <div style={s.headerTitle}>
              <span style={{ fontSize: 18 }}>{mod ? mod.icon : "🏙️"}</span>
              <span style={{ fontSize: isMobile ? 13 : 15 }}>{mod ? mod.label : "City Overview"}</span>
            </div>
          </div>
          <div style={s.headerActions}>
            {!isMobile && (
              <>
                <button style={s.headerBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
                <button style={s.headerBtn} onClick={() => navigate("/map")}>Map</button>
              </>
            )}
            <button style={s.clearBtn} onClick={() => {
              setMessages([{ id: 1, role: "assistant", content: "Chat cleared. What would you like to know?", timestamp: new Date() }]);
            }}>↺</button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.chatArea}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} isMobile={isMobile} />
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
                  onClick={() => { sendMessage(q); setShowSuggestions(false); }}>{q}</button>
              ))}
            </div>
          )}
          {mod && (
            <div style={{ ...s.moduleBadge, background: mod.color + "22", color: mod.color }}>
              {mod.icon} {mod.label}
            </div>
          )}
          <div style={s.inputRow}>
            <button style={s.iconBtn} onClick={() => setShowSuggestions(v => !v)} title="Suggestions">💡</button>
            <textarea
              ref={textareaRef}
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
          {!isMobile && <div style={s.inputHint}>Enter to send · Shift+Enter for new line</div>}
        </div>

        {/* Mobile bottom nav */}
        {isMobile && (
          <div style={s.mobileBottomNav}>
            <button style={s.mobileNavBtn} onClick={() => navigate("/")}>🏠</button>
            <button style={s.mobileNavBtn} onClick={() => navigate("/dashboard")}>📊</button>
            <button style={s.mobileNavBtn} onClick={() => navigate("/map")}>🗺️</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMobile }) {
  const isUser = msg.role === "user";
  const mod = MODULES.find(m => m.id === msg.module);
  const time = msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function formatResponse(text) {
    const sentences = text
      .replace(/\.\s+([A-Z])/g, ".\n$1")
      .replace(/,\s+(For|The|As|Overall|However|This|It's|Drivers|Consider|Whether)/g, ".\n$1")
      .split("\n").map(s => s.trim()).filter(Boolean);
    return { summary: sentences[0], details: sentences.slice(1) };
  }

  const { summary, details } = isUser ? { summary: msg.content, details: [] } : formatResponse(msg.content);

  return (
    <div style={{ ...s.msg, ...(isUser ? s.msgUser : {}), maxWidth: isMobile ? "90%" : "720px" }}>
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
          fontSize: isMobile ? 13 : 13,
        }}>
          {isUser ? (
            <p style={{ margin: 0 }}>{msg.content}</p>
          ) : (
            <div>
              <p style={{ margin: "0 0 10px", color: "#E8E8F0", fontWeight: 500, lineHeight: 1.6, paddingBottom: 10, borderBottom: "1px solid #2A2A3A" }}>
                {summary}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {details.map((sentence, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: mod ? mod.color : "#7C3AED", flexShrink: 0, marginTop: 7 }} />
                    <span style={{ fontSize: 13, color: "#B0B0CC", lineHeight: 1.65 }}>{sentence}</span>
                  </div>
                ))}
              </div>
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
            <span key={delay} style={{ width: 6, height: 6, borderRadius: "50%", background: "#555570", display: "inline-block", animation: `bounce 1.2s ${delay}ms infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:            { display: "flex", height: "100vh", background: "#0A0A0F", overflow: "hidden" },
  overlay:         { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 150 },
  sidebar:         { width: 240, minWidth: 240, background: "#111118", borderRight: "1px solid #1E1E2E", display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto", zIndex: 160 },
  mobileSidebar:   { position: "fixed", top: 0, left: 0, height: "100vh", transition: "transform 0.25s ease", boxShadow: "4px 0 20px #00000088" },
  sidebarHeader:   { padding: "16px 12px 10px", borderBottom: "1px solid #1E1E2E" },
  backBtn:         { background: "none", border: "none", color: "#555570", fontSize: 13, cursor: "pointer", marginBottom: 12, padding: 0, display: "block" },
  closeBtn:        { background: "none", border: "none", color: "#555570", fontSize: 18, cursor: "pointer" },
  navSection:      { padding: "10px 6px", flex: 1 },
  navLabel:        { fontSize: 9, fontWeight: 600, color: "#333345", letterSpacing: 1, padding: "8px 8px 4px", textTransform: "uppercase" },
  navItem:         { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 8px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", color: "#7070A0", textAlign: "left" },
  navItemActive:   { background: "#1A1A28", color: "#E8E8F0" },
  navIcon:         { width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 },
  navName:         { fontSize: 13, fontWeight: 500, flex: 1 },
  navDot:          { width: 5, height: 5, borderRadius: "50%", background: "#7C3AED" },
  sidebarFooter:   { padding: "10px 14px", borderTop: "1px solid #1E1E2E", display: "flex", alignItems: "center", gap: 6 },
  statusDot:       { width: 6, height: 6, borderRadius: "50%", background: "#22C55E" },
  statusText:      { fontSize: 11, color: "#444460" },
  main:            { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  header:          { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#111118", borderBottom: "1px solid #1E1E2E", height: 52, flexShrink: 0 },
  menuBtn:         { background: "none", border: "none", color: "#E8E8F0", fontSize: 20, cursor: "pointer", padding: "2px 6px" },
  headerTitle:     { display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#E8E8F0" },
  headerActions:   { display: "flex", gap: 6, alignItems: "center" },
  headerBtn:       { background: "none", border: "1px solid #2A2A40", color: "#7070A0", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" },
  clearBtn:        { background: "none", border: "1px solid #2A2A40", color: "#555570", borderRadius: 6, padding: "5px 10px", fontSize: 13, cursor: "pointer" },
  chatArea:        { flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 },
  msg:             { display: "flex", gap: 8 },
  msgUser:         { marginLeft: "auto", flexDirection: "row-reverse" },
  msgBody:         { display: "flex", flexDirection: "column", gap: 4, maxWidth: "100%" },
  avatar:          { width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, alignSelf: "flex-end" },
  avatarBot:       { background: "#1A1A28" },
  avatarUser:      { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "white", fontSize: 11, fontWeight: 700 },
  modTag:          { fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, width: "fit-content" },
  bubble:          { padding: "10px 12px", borderRadius: 10, lineHeight: 1.65, wordBreak: "break-word" },
  bubbleBot:       { background: "#161622", border: "1px solid #1E1E2E", color: "#C8C8E0", borderRadius: "10px 10px 10px 3px" },
  bubbleUser:      { background: "rgba(124,58,237,0.13)", border: "1px solid rgba(124,58,237,0.27)", color: "#E8E8F0", borderRadius: "10px 10px 3px 10px" },
  bubbleError:     { background: "rgba(255,107,53,0.1)", borderColor: "rgba(255,107,53,0.3)" },
  msgTime:         { fontSize: 10, color: "#333345" },
  inputArea:       { padding: "8px 10px 10px", background: "#0D0D15", borderTop: "1px solid #1E1E2E", flexShrink: 0 },
  suggestions:     { background: "#161622", border: "1px solid #2A2A3A", borderRadius: 9, padding: 10, marginBottom: 8, display: "flex", flexDirection: "column", gap: 2, maxHeight: 200, overflowY: "auto" },
  suggestLabel:    { fontSize: 10, color: "#444460", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  suggestBtn:      { textAlign: "left", background: "none", border: "none", color: "#7070A0", fontSize: 13, padding: "6px 6px", borderRadius: 5, cursor: "pointer" },
  moduleBadge:     { fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5, width: "fit-content", marginBottom: 5 },
  inputRow:        { display: "flex", alignItems: "flex-end", gap: 6, background: "#161622", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, padding: "5px 6px" },
  iconBtn:         { width: 30, height: 30, background: "#1E1E2E", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  textarea:        { flex: 1, background: "none", border: "none", outline: "none", color: "#D0D0E8", fontSize: 14, resize: "none", lineHeight: 1.5, padding: "4px 0", fontFamily: "inherit", maxHeight: 100, overflowY: "auto" },
  sendBtn:         { width: 32, height: 32, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", borderRadius: 8, cursor: "pointer", color: "white", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  inputHint:       { fontSize: 10, color: "#222230", textAlign: "center", marginTop: 4 },
  mobileBottomNav: { display: "flex", justifyContent: "space-around", padding: "8px 0", background: "#111118", borderTop: "1px solid #1E1E2E" },
  mobileNavBtn:    { background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: "4px 16px" },
};