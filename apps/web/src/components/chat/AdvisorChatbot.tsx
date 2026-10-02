import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "../../services/apiClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm the **QueueCut Advisor** 🎢\n\nAsk me anything about crowd levels, best visit times, ticket prices, or which parks to visit this weekend!",
  timestamp: new Date(),
};

const SUGGESTIONS = [
  "Best time to visit Wonderla Chennai?",
  "Is it crowded on weekends?",
  "Which park has the lowest wait times?",
  "Compare weekday vs weekend prices",
];

export default function AdvisorChatbot() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const ctx = {
        parks: ["wonderla-chennai", "mgm-dizzee-chennai", "black-thunder-coimbatore"],
        current_date: new Date().toISOString().split("T")[0],
      };
      const res = await apiClient.chat(trimmed, ctx);
      setMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: res.response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      const isServiceDown = err instanceof Error && err.message.includes("503");
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: isServiceDown
            ? "Our AI advisor is temporarily offline (Gemini API). Please check back shortly, or browse park data directly on the Explore page. 🙏"
            : "I couldn't process your request right now. Please try again in a moment.",
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /** Render message content — basic markdown (bold, newlines) */
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, li) => {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <span key={li}>
          {parts.map((p, pi) =>
            pi % 2 === 1 ? <strong key={pi} className="text-white">{p}</strong> : p
          )}
          {li < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* ── FAB ── */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center
                    bg-gradient-to-br from-qc-teal-500 to-qc-teal-700 text-white
                    hover:shadow-glow-teal hover:-translate-y-1 transition-all duration-300
                    ${isOpen ? "hidden" : "flex"}`}
        aria-label="Open AI Advisor"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-qc-coral-500 border-2 border-slate-950 animate-pulse" />
      </motion.button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 20,  scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 left-4 z-50 max-w-sm ml-auto flex flex-col
                       bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-slate-900/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-qc-teal-500 to-qc-teal-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-white">QueueCut Advisor</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-slate-500 text-[10px]">AI-powered · Gemini</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-qc-teal-500/20 border border-qc-teal-500/30"
                      : msg.error
                        ? "bg-red-500/20 border border-red-500/30"
                        : "bg-slate-800/80 border border-white/[0.06]"
                  }`}>
                    {msg.role === "user"
                      ? <User className="w-3.5 h-3.5 text-qc-teal-400" />
                      : msg.error
                        ? <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        : <Bot className="w-3.5 h-3.5 text-slate-400" />
                    }
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-qc-teal-600/25 text-white border border-qc-teal-500/20 rounded-tr-md"
                        : msg.error
                          ? "bg-red-500/10 text-red-300 border border-red-500/20 rounded-tl-md"
                          : "bg-slate-800/70 text-slate-300 border border-white/[0.05] rounded-tl-md"
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-800/80 border border-white/[0.06] flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="bg-slate-800/70 border border-white/[0.05] rounded-2xl rounded-tl-md px-3.5 py-2.5 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    <span className="text-xs text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/[0.06] text-slate-400 text-[11px] hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/[0.06] flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about crowds, prices, best times..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:border-qc-teal-500/40 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-qc-teal-600 text-white flex items-center justify-center hover:bg-qc-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
