
import React, { useState, useEffect, useRef } from "react";

// ID generate karne ka logic helper function mein
const generateNewId = () => "guest-" + crypto.randomUUID();

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const initialMessage = {
    role: "ai",
    content: "Hello! I am your Rentra Mitra assistant. How can I help you today?",
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Local state for guestId taaki hum use control kar sakein
  const [currentGuestId, setCurrentGuestId] = useState(() => {
    let id = localStorage.getItem("guestId");
    if (!id) {
      id = generateNewId();
      localStorage.setItem("guestId", id);
    }
    return id;
  });

  const chatEndRef = useRef(null);

  const COLORS = {
    primary: "#2563eb", 
    primaryDark: "#1e40af",
    bgLight: "#f8fafc",
    userBubble: "#2563eb",
    aiBubble: "#ffffff",
    textDark: "#1e293b",
    textLight: "#64748b"
  };

  // --- FIXED LOGIC: Reset Chat AND Generate New ID ---
  const handleCloseAndReset = () => {
    setIsOpen(false);
    
    // 1. Messages reset karein
    setMessages([initialMessage]);
    
    // 2. Nayi ID generate karein taaki DB mein naya record bane
    const newId = generateNewId();
    localStorage.setItem("guestId", newId);
    setCurrentGuestId(newId);
    
    setInput("");
  };

  const handleOpenChat = () => setIsOpen(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8088/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // currentGuestId use karein jo humne state mein rakha hai
        body: JSON.stringify({ guestId: currentGuestId, question }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "Service unavailable. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "25px", right: "25px", zIndex: 9999, fontFamily: "sans-serif" }}>
      
      {isOpen && (
        <div style={{ width: "330px", height: "480px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 15px 35px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflow: "hidden", position: "absolute", bottom: "75px", right: "0" }}>
          
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "white", padding: "15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", backgroundColor: "#4ade80", borderRadius: "50%" }} />
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>Rent Mitra AI</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>Online Assistant</div>
              </div>
            </div>
            {/* CROSS CLICK PAR ID RESET HOGI */}
            <button onClick={handleCloseAndReset} style={{ background: "none", border: "none", color: "white", fontSize: "22px", cursor: "pointer" }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "15px", overflowY: "auto", backgroundColor: COLORS.bgLight, display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: "14px", fontSize: "13px", backgroundColor: msg.role === "user" ? COLORS.userBubble : COLORS.aiBubble, color: msg.role === "user" ? "#ffffff" : COLORS.textDark, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: msg.role === "ai" ? "1px solid #e2e8f0" : "none" }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ fontSize: "11px", color: COLORS.textLight }}>Mitra is typing...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* Footer */}
          <form onSubmit={handleSendMessage} style={{ padding: "12px", display: "flex", gap: "8px", backgroundColor: "#fff", borderTop: "1px solid #eee" }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." style={{ flex: 1, padding: "10px 15px", borderRadius: "20px", border: "1px solid #e2e8f0", outline: "none", fontSize: "13px" }} />
            <button type="submit" disabled={loading} style={{ width: "38px", height: "38px", borderRadius: "50%", border: "none", backgroundColor: COLORS.primary, color: "white", cursor: "pointer" }}>➤</button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button onClick={handleOpenChat} style={{ width: "55px", height: "55px", borderRadius: "50%", backgroundColor: COLORS.primary, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      )}
    </div>
  );
};

export default ChatBot;