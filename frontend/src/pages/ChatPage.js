import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

function ChatPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // AUTO SCROLL FIXED
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  const handleChat = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);

    const currentQuery = query;
    setQuery("");

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  query: currentQuery,
  history: messages,
}),
      });

      const data = await response.json();

      const aiMessage = {
        role: "ai",
        text: data.ai_explanation,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Backend connection failed.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#343541] text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 bg-[#202123] border-b border-gray-700">
        <h1 className="text-xl font-bold">UrbanMind AI</h1>

        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          Dashboard
        </Link>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-8">

          {messages.length === 0 && (
            <div className="text-gray-400 text-center mt-20">
              Start asking about cities...
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
  className={`max-w-[75%] p-4 rounded-2xl whitespace-pre-wrap break-words leading-7 ${
    msg.role === "user"
      ? "bg-blue-500 text-white"
      : "bg-[#444654] text-white"
  }`}
>
  {msg.text}
</div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400">UrbanMind AI is thinking...</div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT BOX */}
      <div className="p-4 bg-[#40414F] border-t border-gray-700">
        <div className="max-w-3xl mx-auto flex gap-3">

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about cities..."
            className="flex-1 p-3 rounded-xl bg-[#343541] border border-gray-600 resize-none outline-none"
            rows={1}
          />

          <button
            onClick={handleChat}
            className="px-5 bg-green-500 hover:bg-green-600 rounded-xl"
          >
            Send
          </button>

        </div>
      </div>
    </div>
  );
}

export default ChatPage;