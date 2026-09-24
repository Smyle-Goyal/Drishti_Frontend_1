import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  PhoneCall, 
  MapPin, 
  TrendingUp, 
  ArrowRight, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { ANOMALIES_LIST } from '../data/mockData';

export default function AnomalyDetection({ onHighlightInGraph }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredAnomalies = ANOMALIES_LIST.filter(a => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'Financial' && (a.category.includes('Financial') || a.category.includes('Money'))) return true;
    if (selectedCategory === 'Communication' && a.category.includes('Communication')) return true;
    if (selectedCategory === 'Spatial' && a.category.includes('Spatial')) return true;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100 font-outfit">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[11px] border border-rose-500/30">
              MODULE 5: AUTOMATED ANOMALY & PATTERN DETECTION
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Suspicious Criminal Activity & Anomaly Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Machine Learning and graph traversal algorithms flag layered money laundering, burst call spikes, and co-location anomalies.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          {['ALL', 'Financial', 'Communication', 'Spatial'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnomalies.map(anom => (
          <div 
            key={anom.id}
            className="glass-panel p-6 rounded-2xl space-y-4 border border-rose-500/20 hover:border-rose-500/40 shadow-xl transition"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    anom.severity === 'CRITICAL' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {anom.severity} SEVERITY
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{anom.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{anom.title}</h3>
              </div>

              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {anom.detectedAt}
              </span>
            </div>

            {/* Description Narrative */}
            <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              {anom.description}
            </p>

            {/* Involved Entities */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Flagged Entities Involved:</span>
              <div className="flex flex-wrap gap-1.5">
                {anom.entities.map(e => (
                  <span key={e} className="px-2.5 py-1 bg-slate-900 text-sky-300 rounded-lg text-xs font-mono border border-slate-800">
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-rose-400 font-semibold font-mono text-[11px]">{anom.riskImpact}</span>
              <button
                onClick={() => onHighlightInGraph(anom.entities)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Locate in Knowledge Graph</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
