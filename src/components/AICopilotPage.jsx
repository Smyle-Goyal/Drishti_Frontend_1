import React, { useState, useEffect } from 'react';
import { queryCopilot } from '../services/copilotService';

export default function AICopilotPage({ targetEntity, activeCaseId }) {
  // Session ID Management: Generate once per conversation session (Requirement #4)
  const [sessionId, setSessionId] = useState(() => `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'bot',
      answer: 'Drishti Agentic AI Assistant ready. Enter an investigation query regarding entities, FIR records, wire transfers, or surveillance reports.',
      findings: [],
      evidence: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Pre-load target entity query if navigated from Dashboard "Know More with AI"
  useEffect(() => {
    if (targetEntity) {
      const prompt = `Synthesize intelligence analysis for target entity ${targetEntity.name} (ID: ${targetEntity.id})`;
      setInputQuery(prompt);
      handleSendMessage(prompt, targetEntity);
    }
  }, [targetEntity]);

  // Handle starting a brand new conversation with a NEW session_id (Requirement #4)
  const handleNewConversation = () => {
    const newSession = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setSessionId(newSession);
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        sender: 'bot',
        answer: 'New conversation session initialized. Enter your query to begin analysis.',
        findings: [],
        evidence: []
      }
    ]);
  };

  const handleSendMessage = async (textToSend, entityContext = null) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg = { 
      id: `msg-${Date.now()}`, 
      sender: 'user', 
      text: query 
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      // Send query with consistent session_id and active case_id (Requirements #1, #2, #4, #5)
      const res = await queryCopilot(query, {
        sessionId: sessionId,
        caseId: activeCaseId
      });

      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        answer: res.answer,
        findings: res.findings,
        evidence: res.evidence,
        confidence: res.confidence,
        sessionId: res.sessionId
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Agent Endpoint Error:", err);
      const errorMsg = {
        id: `msg-err-${Date.now()}`,
        sender: 'bot',
        isError: true,
        answer: `Agent Investigation Service Error: ${err.message || "Failed to reach Agentic AI endpoint."}`,
        findings: [],
        evidence: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 font-['IBM_Plex_Sans'] text-[#dee4da]">
      {/* Header Banner */}
      <div className="bg-[#171d17] p-4 border border-[#444842]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#354234] border border-[#bccbb8] flex items-center justify-center text-[#bccbb8]">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <h1 className="font-['Space_Grotesk'] text-xl font-bold text-[#dee4da]">Drishti Agentic AI Assistant</h1>
            <p className="text-[12px] text-[#8e928b]">
              Real-time multi-agent reasoning, evidence graph traversal, and automated case synthesis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right font-['Space_Grotesk'] text-[10px]">
            <span className="text-[#8e928b] uppercase">SESSION ID: <strong className="text-[#bccbb8]">{sessionId}</strong></span>
            <span className="text-[#8e928b] uppercase">CASE ID: <strong className="text-[#bbccae]">{activeCaseId}</strong></span>
          </div>
          <button
            onClick={handleNewConversation}
            className="px-3 py-1.5 bg-[#252c25] hover:bg-[#354234] text-[#dee4da] border border-[#444842]/40 text-[11px] font-['Space_Grotesk'] uppercase font-bold transition-colors flex items-center gap-1"
            title="Start new conversation session"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>NEW SESSION</span>
          </button>
        </div>
      </div>

      {/* Target Entity Context Banner */}
      {targetEntity && (
        <div className="bg-[#1b211b] p-3 border border-[#bccbb8]/40 flex items-center justify-between text-[12px] font-['Space_Grotesk']">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#bccbb8] text-[18px]">info</span>
            <span>Target Entity Context: <strong className="text-[#bccbb8]">{targetEntity.name}</strong> ({targetEntity.id})</span>
          </div>
          <span className="text-[10px] uppercase bg-[#354234] text-[#dee4da] px-2 py-0.5">{targetEntity.type}</span>
        </div>
      )}

      {/* Main Chat Conversation Container */}
      <div className="bg-[#171d17] border border-[#444842]/30 h-[560px] flex flex-col justify-between p-4">
        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-[12px] ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className={`w-8 h-8 ${msg.isError ? 'bg-[#93000a]' : 'bg-[#252c25]'} border border-[#444842]/40 flex items-center justify-center text-[#bccbb8] shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {msg.isError ? 'warning' : 'smart_toy'}
                  </span>
                </div>
              )}

              <div className={`max-w-3xl p-4 border space-y-3 ${
                msg.sender === 'user'
                  ? "bg-[#354234] text-[#dee4da] border-[#bccbb8]/40 font-['Space_Grotesk']"
                  : msg.isError
                    ? "bg-[#2a1616] text-[#ffb4ab] border-[#93000a]"
                    : "bg-[#0a100a] text-[#dee4da] border-[#444842]/40 font-['IBM_Plex_Sans']"
              }`}>
                {/* User Message Text */}
                {msg.sender === 'user' && (
                  <p className="leading-relaxed font-semibold">{msg.text}</p>
                )}

                {/* Bot Answer (Requirement #7) */}
                {msg.sender === 'bot' && msg.answer && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-['Space_Grotesk'] border-b border-[#444842]/20 pb-1 mb-2">
                      <span className="text-[#bccbb8] font-bold uppercase tracking-wider">AI AGENT ANALYSIS</span>
                      {msg.confidence !== null && msg.confidence !== undefined && (
                        <span className="text-[#bbccae] font-mono">
                          CONFIDENCE: {(msg.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] leading-relaxed whitespace-pre-wrap">
                      {msg.answer}
                    </div>
                  </div>
                )}

                {/* Agent Findings (Requirement #7) */}
                {msg.sender === 'bot' && Array.isArray(msg.findings) && msg.findings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#444842]/30 space-y-2 font-['Space_Grotesk']">
                    <span className="text-[10px] uppercase font-bold text-[#bccbb8] tracking-wider block">
                      INVESTIGATIVE FINDINGS ({msg.findings.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.findings.map((finding, idx) => (
                        <div key={idx} className="p-2.5 bg-[#1b211b] border border-[#444842]/40 text-[11px] space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-[#bbccae] font-bold uppercase">
                              {finding.type || finding.finding_type || 'FINDING'}
                            </span>
                            {finding.source && (
                              <span className="text-[#8e928b] font-mono">Source: {finding.source}</span>
                            )}
                          </div>
                          <p className="text-[#dee4da]">
                            {finding.description || finding.details || (typeof finding === 'string' ? finding : JSON.stringify(finding))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent Evidence Sources (Requirement #7) */}
                {msg.sender === 'bot' && Array.isArray(msg.evidence) && msg.evidence.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#444842]/30 space-y-2 font-['Space_Grotesk']">
                    <span className="text-[10px] uppercase font-bold text-[#bbccae] tracking-wider block">
                      SUPPORTING EVIDENCE SOURCES ({msg.evidence.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {msg.evidence.map((ev, idx) => (
                        <div key={idx} className="p-2 bg-[#1b211b] border border-[#444842]/30 text-[11px] space-y-0.5">
                          <div className="flex justify-between items-center text-[10px] text-[#bccbb8] font-bold">
                            <span>{ev.document_id || ev.documentId || 'EVIDENCE DOC'}</span>
                            <span className="text-[#8e928b]">{ev.document_type || ev.type || 'SOURCE'}</span>
                          </div>
                          <p className="text-[#c4c8c0] text-[10px]">
                            {ev.relevant_text || ev.description || (typeof ev === 'string' ? ev : JSON.stringify(ev))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 bg-[#252c25] border border-[#444842]/40 flex items-center justify-center text-[#c4c8c0] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator while Agent is Investigating (Requirement #11) */}
          {isTyping && (
            <div className="flex gap-2 text-[11px] text-[#8e928b] font-['Space_Grotesk'] items-center bg-[#0a100a] p-3 border border-[#444842]/30 w-fit">
              <span className="material-symbols-outlined text-[18px] text-[#bccbb8] animate-spin">progress_activity</span>
              <span>Agent investigating query for case {activeCaseId} (Session: {sessionId})...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#444842]/30">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isTyping}
            placeholder="Ask AI Copilot (e.g. 'Who are the top suspects in FIR-238?')..."
            className="flex-1 bg-[#0a100a] text-[#dee4da] placeholder:text-[#8e928b]/60 text-[12px] px-3 py-2.5 border border-[#444842]/40 focus:outline-none focus:border-[#bccbb8] font-['IBM_Plex_Sans'] disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isTyping}
            className="px-4 py-2.5 bg-[#354234] hover:bg-[#bccbb8] hover:text-[#273426] text-[#dee4da] font-['Space_Grotesk'] text-[12px] font-bold uppercase transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>SEND</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
