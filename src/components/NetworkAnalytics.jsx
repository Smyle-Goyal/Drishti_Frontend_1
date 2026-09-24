import React, { useState } from 'react';
import { 
  BarChart3, 
  Crown, 
  Share2, 
  Activity, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Info
} from 'lucide-react';

export default function NetworkAnalytics({ nodes, edges }) {
  const [metricSort, setMetricSort] = useState('risk');
  const [selectedTarget, setSelectedTarget] = useState(nodes[0] || null);

  // Filter only persons for HVT Leaderboard
  const persons = nodes.filter(n => n.type === 'PERSON');

  const sortedPersons = [...persons].sort((a, b) => {
    if (metricSort === 'risk') return (b.computedRisk || b.riskScore || 0) - (a.computedRisk || a.riskScore || 0);
    if (metricSort === 'betweenness') return (b.betweenness || 0) - (a.betweenness || 0);
    if (metricSort === 'pagerank') return (b.pageRank || 0) - (a.pageRank || 0);
    return 0;
  });

  // Group by operational cells
  const cells = {
    'Leadership Cell': nodes.filter(n => n.cell === 'Leadership Cell'),
    'Finance Cell': nodes.filter(n => n.cell === 'Finance Cell'),
    'Logistics Cell': nodes.filter(n => n.cell === 'Logistics Cell'),
    'Operations Cell': nodes.filter(n => n.cell === 'Operations Cell'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100 font-outfit">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] border border-purple-500/30">
              MODULE 4: GRAPH ANALYTICS & INFLUENCER IDENTIFICATION
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Key Influencer & High-Value Target (HVT) Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Graph algorithms calculate PageRank, Degree, and Betweenness Centrality to reveal network kingpins and intermediary bridges.
          </p>
        </div>

        {/* Sort Metric Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2">Sort By:</span>
          <button
            onClick={() => setMetricSort('risk')}
            className={`px-3 py-1.5 rounded-lg transition ${metricSort === 'risk' ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40' : 'text-slate-400'}`}
          >
            Risk Score
          </button>
          <button
            onClick={() => setMetricSort('betweenness')}
            className={`px-3 py-1.5 rounded-lg transition ${metricSort === 'betweenness' ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40' : 'text-slate-400'}`}
          >
            Betweenness (Bridge)
          </button>
          <button
            onClick={() => setMetricSort('pagerank')}
            className={`px-3 py-1.5 rounded-lg transition ${metricSort === 'pagerank' ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40' : 'text-slate-400'}`}
          >
            PageRank
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HVT Ranking Leaderboard Table */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" /> High-Value Target (HVT) Ranking
            </span>
            <span className="text-xs font-mono text-slate-500">{sortedPersons.length} Suspects Evaluated</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Suspect Name</th>
                  <th className="py-2.5 px-3">Role / Cell</th>
                  <th className="py-2.5 px-3">Risk Index</th>
                  <th className="py-2.5 px-3">PageRank</th>
                  <th className="py-2.5 px-3">Betweenness</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedPersons.map((p, idx) => {
                  const isSelected = selectedTarget?.id === p.id;
                  const isHighBetweenness = (p.betweenness || 0) > 0.4;
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedTarget(p)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-sky-500/15 border-l-2 border-l-sky-500' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-200 block">{p.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.phone || p.id}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                          {p.role || p.cell || 'Suspect'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-400">
                        {p.computedRisk || p.riskScore}%
                      </td>
                      <td className="py-3 px-3 font-mono text-sky-400">
                        {p.pageRank || 50}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          isHighBetweenness ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-slate-400'
                        }`}>
                          {p.betweenness || '0.12'} {isHighBetweenness && '⚡ BRIDGE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-sky-400 hover:text-sky-200 font-semibold text-[11px] flex items-center gap-1 ml-auto">
                          Details <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainable Risk Score Card for Selected Target */}
        <div className="lg:col-span-4 space-y-4">
          {selectedTarget ? (
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 uppercase">Target Breakdown</span>
                  <h3 className="text-lg font-bold text-slate-100">{selectedTarget.label}</h3>
                </div>
                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full font-mono text-xs font-bold border border-rose-500/30">
                  {selectedTarget.computedRisk || selectedTarget.riskScore}% Risk
                </span>
              </div>

              {/* Explainable Factor List */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Explainable Risk Weight Factors
                </span>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">High Call Frequency (42 Calls)</span>
                    <span className="text-rose-400 font-mono font-bold">+25 pts</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">High Betweenness Centrality</span>
                    <span className="text-purple-400 font-mono font-bold">+20 pts</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Flagged Hawala Transaction</span>
                    <span className="text-amber-400 font-mono font-bold">+18 pts</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Co-located at Manali Safehouse</span>
                    <span className="text-sky-400 font-mono font-bold">+15 pts</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-2xl text-center text-slate-500 text-xs">
              Select a suspect from the HVT leaderboard to view explainable risk factors.
            </div>
          )}

          {/* Operational Sub-Gangs / Cell Clusters */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Community Cell Clusters
            </h4>

            <div className="space-y-2 text-xs">
              {Object.entries(cells).map(([cellName, members]) => (
                <div key={cellName} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{cellName}</span>
                    <span className="text-[10px] font-mono text-indigo-400">{members.length} Entities</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {members.map(m => (
                      <span key={m.id} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded text-[10px] border border-slate-800">
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
