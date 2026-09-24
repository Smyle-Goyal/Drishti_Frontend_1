import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Network, 
  Share2,
  RefreshCw,
  User,
  Info
} from 'lucide-react';
import { queryCopilot } from '../services/copilotService';

export default function AICopilot({ targetQuery, onHighlightPathInGraph }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "Greetings Officer. I am Drishti AI Copilot, your automated criminal intelligence assistant. Ask me anything regarding network relationships, key intermediaries, suspicious wire transfers, or FIR evidence.",
      chips: [
        "How are Rahul Saxena and Global Apex Trading connected?",
        "Who acts as the main bridge between Finance Cell and Leadership?",
        "Show suspicious financial activity involving Vikas Verma.",
        "Which suspects were present at Safehouse B-42?"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Handle entity context passed via "Know More with AI" (Requirement #4)
  useEffect(() => {
    if (targetQuery) {
      const initialText = `Tell me about ${targetQuery.name || targetQuery.label} (ID: ${targetQuery.id})`;
      setInputQuery(initialText);
      handleSendMessage(initialText, targetQuery);
    }
  }, [targetQuery]);

  const handleSendMessage = async (textToSend, entityContext = null) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { id: `msg-${Date.now()}`, sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      const res = await queryCopilot(query, entityContext || targetQuery);
      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: res.text,
        path: res.path
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: "Error processing query against intelligence graph service."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-slate-100 font-outfit">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Drishti AI Investigation Copilot</h1>
            <p className="text-xs text-slate-400">
              Natural language intelligence inquiry, graph pathfinding, and automated evidence synthesis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>API Copilot Service Online</span>
        </div>
      </div>

      {/* Target Entity Banner if navigated via "Know More with AI" */}
      {targetQuery && (
        <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-between text-xs text-sky-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400" />
            <span>Active Target Entity Context: <strong>{targetQuery.name || targetQuery.label}</strong> ({targetQuery.id})</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20">{targetQuery.type}</span>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="glass-panel p-5 rounded-2xl h-[500px] flex flex-col justify-between space-y-4">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-400" />
                </div>
              )}

              <div className={`max-w-2xl p-4 rounded-2xl space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none shadow-lg shadow-sky-600/20'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}>
                <p className="leading-relaxed font-sans">{msg.text}</p>

                {/* Evidence Path trace if present */}
                {msg.path && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold block">
                      Discovered Evidence Path ({msg.path.length} Nodes)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.path.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span className="px-2.5 py-1 bg-slate-950 text-slate-200 rounded font-mono text-[11px] border border-slate-800 font-bold">
                            {step.node.label || step.node.name}
                          </span>
                          {idx < msg.path.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-sky-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Chips */}
                {msg.chips && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 transition"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-sky-400 animate-bounce" />
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 flex items-center gap-2 font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Traversing knowledge graph & synthesizing evidence...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Drishti AI (e.g., 'How are Rahul and Vikas connected?')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none font-outfit"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim()}
            className="p-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-sky-600/25 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
