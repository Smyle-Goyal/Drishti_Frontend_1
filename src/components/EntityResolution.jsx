import React, { useState } from 'react';
import { UserCheck, CheckCircle, XCircle, AlertCircle, ArrowRightLeft, Shield, Sparkles, Fingerprint } from 'lucide-react';
import { ENTITY_RESOLUTION_CANDIDATES } from '../data/mockData';

export default function EntityResolution({ onMergeEntities }) {
  const [candidates, setCandidates] = useState(ENTITY_RESOLUTION_CANDIDATES);
  const [resolvedIds, setResolvedIds] = useState(new Set());

  const handleMerge = (cand) => {
    onMergeEntities(cand);
    setResolvedIds(prev => new Set([...prev, cand.id]));
  };

  const handleDismiss = (candId) => {
    setResolvedIds(prev => new Set([...prev, candId]));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100 font-outfit">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] border border-indigo-500/30">
              MODULE 3: SMART ENTITY RESOLUTION
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Identity Fusion & Alias Disambiguation Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Drishti AI automatically scans disparate crime reports to detect when multiple records refer to the same suspect.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <Fingerprint className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-slate-400 block text-[10px]">PENDING MATCHES</span>
            <span className="font-semibold text-indigo-300 font-mono">
              {candidates.length - resolvedIds.size} Duplicate Candidate Pairs
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Match Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {candidates.map(cand => {
          const isResolved = resolvedIds.has(cand.id);

          return (
            <div 
              key={cand.id}
              className={`glass-panel p-6 rounded-2xl transition-all border ${
                isResolved ? 'opacity-40 border-slate-800' : 'border-indigo-500/30 shadow-lg shadow-indigo-500/5'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Side 1: Primary Entity */}
                <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      RECORD A (Primary)
                    </span>
                    <span className="text-xs text-sky-400 font-mono">{cand.primary.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{cand.primary.label}</h3>
                  <div className="text-xs space-y-1 text-slate-400">
                    {cand.primary.phone && <div>Phone: <strong className="text-sky-300 font-mono">{cand.primary.phone}</strong></div>}
                    {cand.primary.vehicle && <div>Vehicle: <strong className="text-emerald-300 font-mono">{cand.primary.vehicle}</strong></div>}
                    {cand.primary.org && <div>Org: <strong className="text-purple-300">{cand.primary.org}</strong></div>}
                  </div>
                </div>

                {/* Center Match Confidence Badge */}
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-indigo-500/40 flex items-center justify-center mb-1">
                    <span className="text-lg font-bold font-mono text-indigo-400">{cand.confidence}%</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI MATCH CONFIDENCE</span>
                  <ArrowRightLeft className="w-4 h-4 text-slate-500 my-1 hidden lg:block" />
                </div>

                {/* Side 2: Duplicate Suspect Entity */}
                <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      RECORD B (Duplicate Candidate)
                    </span>
                    <span className="text-xs text-indigo-400 font-mono">{cand.secondary.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{cand.secondary.label}</h3>
                  <div className="text-xs space-y-1 text-slate-400">
                    {cand.secondary.phone && <div>Phone: <strong className="text-sky-300 font-mono">{cand.secondary.phone}</strong></div>}
                    {cand.secondary.vehicle && <div>Vehicle: <strong className="text-emerald-300 font-mono">{cand.secondary.vehicle}</strong></div>}
                    {cand.secondary.location && <div>Location: <strong className="text-amber-300">{cand.secondary.location}</strong></div>}
                  </div>
                </div>
              </div>

              {/* Match Rationale Checklist */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Supporting Evidence Rationale:</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {cand.rationale.map((r, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resolution Action Buttons */}
                {!isResolved ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDismiss(cand.id)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
                    >
                      Keep Separate
                    </button>
                    <button
                      onClick={() => handleMerge(cand)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Merge Identical Entities</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    ✓ Identity Merged in Graph
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
