import { useState } from "react";
import { apiClient } from "../../services/apiClient";
import { usePlannerStore } from "../../store/slices/plannerStore";
import { MessageSquare, Send, X, Sparkles, Bot, User, HelpCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "advisor";
  text: string;
}

const quickPrompts = [
  "Is FastTrack pass worth buying?",
  "What is the best order to ride the thrill coasters?",
  "What are the swimwear / dress code rules?",
  "What time does the wave pool turn on?",
];

export default function AdvisorDrawer({ open, onClose }: Props) {
  const { activeRecommendation, parkId, priority } = usePlannerStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    if (!textToSend) setInput("");
    setLoading(true);

    const context = {
      park_id: parkId || "wonderla-chennai",
      priority,
      recommendation: activeRecommendation
        ? {
            recommended_date: activeRecommendation.recommended_date,
            summary: activeRecommendation.summary,
          }
        : null,
    };

    try {
      const res = await apiClient.chat(text, context);
      setMessages((m) => [...m, { role: "advisor", text: res.response }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "advisor",
          text: "I'm currently unable to reach the live intelligence cluster. Please verify your connection or try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-base shadow-glow-brand">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>QueueCut Advisor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-400">Context-aware park intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-brand-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">How can I assist your trip?</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Ask me about ride wait predictions, FastTrack ROI, weather contingency, or dining schedules.
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="space-y-1.5 pt-2 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block px-1">
                  Suggested Questions
                </span>
                {quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 font-medium flex items-center justify-between transition-colors"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3 h-3 text-brand-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  m.role === "user"
                    ? "bg-brand-600 text-white"
                    : "bg-slate-800 text-brand-400 border border-slate-700"
                }`}
              >
                {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-600 text-white rounded-tr-none shadow-md"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none font-medium"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-brand-400 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px]">Analyzing telemetry...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about wait times or rides..."
            className="form-input text-xs py-2.5 flex-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn btn-primary sm:w-auto px-4 py-2.5 text-xs shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
