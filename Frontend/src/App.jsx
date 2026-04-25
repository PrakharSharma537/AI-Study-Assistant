import { useState, useRef, useEffect } from "react";

const DSA_TOPICS = [
  "Arrays & Hashing", "Two Pointers", "Sliding Window",
  "Binary Search", "Linked Lists", "Trees & BST",
  "Graphs & BFS/DFS", "Dynamic Programming", "Heaps", "Tries"
];

const QUICK_QUESTIONS = [
  "Explain time complexity of quicksort",
  "What is a balanced BST?",
  "Difference between BFS and DFS?",
  "When to use dynamic programming?",
];

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "18px 22px" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: "50%", background: "#7EE8A2",
        display: "inline-block",
        animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`
      }} />
    ))}
  </div>
);

const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative", margin: "12px 0", borderRadius: 10, overflow: "hidden", background: "#0d1117", border: "1px solid #30363d" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#161b22", borderBottom: "1px solid #30363d" }}>
        <span style={{ color: "#7EE8A2", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{lang || "code"}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ background: copied ? "#7EE8A2" : "transparent", border: "1px solid " + (copied ? "#7EE8A2" : "#30363d"), color: copied ? "#0d1117" : "#8b949e", borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "14px 16px", overflowX: "auto", fontSize: 13, lineHeight: 1.7, color: "#e6edf3", fontFamily: "'JetBrains Mono', monospace" }}>{code}</pre>
    </div>
  );
};

const renderMessage = (text) => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
      if (match) return <CodeBlock key={i} lang={match[1]} code={match[2].trim()} />;
    }
    return (
      <span key={i} style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
        {part.split(/(\*\*.*?\*\*|`[^`]+`)/g).map((seg, j) => {
          if (seg.startsWith("**") && seg.endsWith("**"))
            return <strong key={j} style={{ color: "#7EE8A2", fontWeight: 700 }}>{seg.slice(2, -2)}</strong>;
          if (seg.startsWith("`") && seg.endsWith("`"))
            return <code key={j} style={{ background: "rgba(126,232,162,0.12)", color: "#7EE8A2", padding: "2px 6px", borderRadius: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88em" }}>{seg.slice(1, -1)}</code>;
          return seg;
        })}
      </span>
    );
  });
};

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! I'm your DSA Expert 🧠\n\nAsk me anything about **Data Structures & Algorithms** — from Big-O analysis to dynamic programming, trees, graphs, and beyond.\n\nWhat do you want to crack today?", id: 0 }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput("");

    const userMsg = { role: "user", text: question, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: messages
            .filter(m => m.role === "user" || m.role === "assistant")
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.text }]
            }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.answer, id: Date.now() + 1 }]);
    } catch (err) {
      console.error("Frontend fetch error:", err);
      setMessages(prev => [...prev, { role: "assistant", text: `⚠️ Error: ${err.message}`, id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", text: "Chat cleared! Ready for new questions 🚀", id: Date.now() }]);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #080c10; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a3140; border-radius: 4px; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(126,232,162,0.15); }
          50% { box-shadow: 0 0 35px rgba(126,232,162,0.3); }
        }
        .msg-enter { animation: fadeSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .send-btn:hover { transform: scale(1.05); background: #7EE8A2 !important; color: #080c10 !important; }
        .send-btn:active { transform: scale(0.97); }
        .topic-pill:hover { background: rgba(126,232,162,0.15) !important; border-color: #7EE8A2 !important; color: #7EE8A2 !important; transform: translateX(4px); }
        .quick-q:hover { background: rgba(126,232,162,0.08) !important; border-color: rgba(126,232,162,0.3) !important; transform: translateX(3px); }
        .clear-btn:hover { color: #ff6b6b !important; border-color: #ff6b6b !important; }
        textarea:focus { outline: none; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .sidebar.open { display: flex !important; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; width: 280px !important; }
          .chat-area { width: 100% !important; }
          .header-title { font-size: 20px !important; }
        }
      `}</style>

      <div style={{ display: "flex", height: "100vh", background: "#080c10", fontFamily: "'DM Sans', sans-serif", color: "#e6edf3", overflow: "hidden", position: "relative" }}>

        {/* Ambient background */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(126,232,162,0.04) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(88,166,255,0.04) 0%, transparent 70%)", borderRadius: "50%" }} />
        </div>

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{
          width: 260, minWidth: 260, background: "rgba(13,17,23,0.95)", borderRight: "1px solid #1a2030",
          display: "flex", flexDirection: "column", zIndex: 10, backdropFilter: "blur(20px)", flexShrink: 0
        }}>
          <div style={{ padding: "28px 22px 20px", borderBottom: "1px solid #1a2030" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7EE8A2, #58a6ff)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, animation: "glowPulse 3s ease-in-out infinite" }}>
                ⚡
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>DSA Expert</div>
                <div style={{ fontSize: 11, color: "#4a5568", marginTop: 1 }}>AI-Powered DSA Assistant</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 16px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 10, paddingLeft: 6 }}>TOPICS</div>
            {DSA_TOPICS.map(topic => (
              <button key={topic} className="topic-pill"
                onClick={() => { setActiveTopic(topic); sendMessage(`Explain ${topic} with examples`); setSidebarOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 3,
                  background: activeTopic === topic ? "rgba(126,232,162,0.1)" : "transparent",
                  border: "1px solid " + (activeTopic === topic ? "rgba(126,232,162,0.3)" : "transparent"),
                  color: activeTopic === topic ? "#7EE8A2" : "#8b949e",
                  borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8
                }}>
                <span style={{ fontSize: 8, color: activeTopic === topic ? "#7EE8A2" : "#2a3140" }}>◆</span>
                {topic}
              </button>
            ))}

            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#4a5568", letterSpacing: 2, margin: "20px 0 10px", paddingLeft: 6 }}>QUICK ASK</div>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} className="quick-q"
                onClick={() => { sendMessage(q); setSidebarOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 4,
                  background: "transparent", border: "1px solid transparent",
                  color: "#6e7681", borderRadius: 8, cursor: "pointer", fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", lineHeight: 1.4
                }}>
                → {q}
              </button>
            ))}
          </div>

          <div style={{ padding: "14px 16px", borderTop: "1px solid #1a2030", display: "flex", gap: 8 }}>
            <button className="clear-btn" onClick={clearChat} style={{
              flex: 1, padding: "8px", background: "transparent", border: "1px solid #2a3140",
              color: "#6e7681", borderRadius: 8, cursor: "pointer", fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s"
            }}>clear chat</button>
            <button style={{
              padding: "8px 12px", background: "rgba(88,166,255,0.1)", border: "1px solid rgba(88,166,255,0.2)",
              color: "#58a6ff", borderRadius: 8, cursor: "pointer", fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace"
            }}>docs</button>
          </div>
        </aside>

        {/* Main chat */}
        <div className="chat-area" style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
          <header style={{
            padding: "18px 28px", borderBottom: "1px solid #1a2030",
            background: "rgba(8,12,16,0.8)", backdropFilter: "blur(20px)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                background: "transparent", border: "none", color: "#8b949e",
                cursor: "pointer", fontSize: 18, padding: "4px 8px"
              }}>☰</button>
              <h1 className="header-title" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>
                DSA <span style={{ color: "#7EE8A2" }}>Expert</span>
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7EE8A2", boxShadow: "0 0 8px #7EE8A2" }} />
              <span style={{ fontSize: 12, color: "#7EE8A2", fontFamily: "'JetBrains Mono', monospace" }}>online</span>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((msg) => (
              <div key={msg.id} className="msg-enter" style={{
                display: "flex", gap: 14, flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-start", maxWidth: "100%"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: msg.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  background: msg.role === "user" ? "linear-gradient(135deg, #58a6ff, #388bfd)" : "linear-gradient(135deg, #7EE8A2, #56d68a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                  boxShadow: msg.role === "user" ? "0 4px 12px rgba(88,166,255,0.2)" : "0 4px 12px rgba(126,232,162,0.2)"
                }}>
                  {msg.role === "user" ? "👤" : "⚡"}
                </div>
                <div style={{
                  maxWidth: "75%", padding: "14px 18px",
                  background: msg.role === "user" ? "linear-gradient(135deg, rgba(88,166,255,0.12), rgba(56,139,253,0.08))" : "rgba(22,27,34,0.8)",
                  border: "1px solid " + (msg.role === "user" ? "rgba(88,166,255,0.2)" : "#1a2030"),
                  borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  fontSize: 14, lineHeight: 1.7, backdropFilter: "blur(10px)"
                }}>
                  {renderMessage(msg.text)}
                  <div style={{ marginTop: 8, fontSize: 10, color: "#4a5568", fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg-enter" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px 10px 10px 2px", background: "linear-gradient(135deg, #7EE8A2, #56d68a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
                <div style={{ background: "rgba(22,27,34,0.8)", border: "1px solid #1a2030", borderRadius: "4px 18px 18px 18px", backdropFilter: "blur(10px)" }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: "16px 24px 24px", borderTop: "1px solid #1a2030",
            background: "rgba(8,12,16,0.9)", backdropFilter: "blur(20px)", flexShrink: 0
          }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {["Binary search tree", "Merge sort", "Dijkstra's algo", "Hash tables"].map(chip => (
                <button key={chip} onClick={() => sendMessage(`Explain ${chip}`)} style={{
                  padding: "5px 12px", background: "rgba(126,232,162,0.06)", border: "1px solid rgba(126,232,162,0.15)",
                  color: "#7EE8A2", borderRadius: 20, cursor: "pointer", fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap"
                }}
                  onMouseEnter={e => e.target.style.background = "rgba(126,232,162,0.12)"}
                  onMouseLeave={e => e.target.style.background = "rgba(126,232,162,0.06)"}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div style={{
              display: "flex", gap: 12, alignItems: "flex-end",
              background: "rgba(22,27,34,0.8)", border: "1px solid #2a3140",
              borderRadius: 16, padding: "12px 16px", transition: "border-color 0.2s"
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(126,232,162,0.4)"}
              onBlurCapture={e => e.currentTarget.style.borderColor = "#2a3140"}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about any DSA concept, algorithm, or problem..."
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", color: "#e6edf3",
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: "none",
                  lineHeight: 1.6, maxHeight: 160, minHeight: 24,
                  caretColor: "#7EE8A2", overflowY: "auto"
                }}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: input.trim() && !loading ? "rgba(126,232,162,0.15)" : "rgba(126,232,162,0.04)",
                  border: "1px solid " + (input.trim() && !loading ? "rgba(126,232,162,0.4)" : "#2a3140"),
                  color: input.trim() && !loading ? "#7EE8A2" : "#2a3140",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, transition: "all 0.2s"
                }}>
                {loading ? "⋯" : "↑"}
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#2a3140", fontFamily: "'JetBrains Mono', monospace" }}>
              shift+enter for newline · enter to send
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
