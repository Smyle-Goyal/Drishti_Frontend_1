import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  RefreshCw,
  AlertTriangle,
  FileQuestion,
  Loader2,
  X, 
  Bot,
  User,
  Phone,
  Building,
  Truck,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { getInvestigationData, getEntityDetails, refreshBackendData } from '../services/investigationService';
import { transformBackendToVisFormat } from '../utils/graphAdapter';

const NODE_COLORS = {
  PERSON: { background: '#f43f5e', border: '#fda4af', highlight: '#ff4d6d' },       // Rose
  ORGANIZATION: { background: '#a855f7', border: '#d8b4fe', highlight: '#c084fc' }, // Purple
  PHONE: { background: '#0284c7', border: '#38bdf8', highlight: '#0ea5e9' },        // Sky Blue
  VEHICLE: { background: '#059669', border: '#34d399', highlight: '#10b981' },      // Emerald
  LOCATION: { background: '#d97706', border: '#fcd34d', highlight: '#f59e0b' },     // Amber
  BANK_ACCOUNT: { background: '#e11d48', border: '#fb7185', highlight: '#f43f5e' }, // Deep Rose
  CASE: { background: '#64748b', border: '#94a3b8', highlight: '#cbd5e1' }          // Slate
};

export default function GraphExplorer({ onSelectTargetForAI }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  // API Async States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState({ entities: [], relationships: [], events: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detail Panel API State
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [entityDetailsData, setEntityDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Filters & Controls
  const [filterType, setFilterType] = useState('ALL');
  const [minRisk, setMinRisk] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('force');

  // Load Investigation Data from API Service on Mount
  const loadData = async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInvestigationData(options);
      setApiResponse(res);
    } catch (err) {
      setError(err.message || "Failed to load investigation data from API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Dynamic Backend Update (Requirement #3)
  const handleSimulateBackendUpdate = async () => {
    setIsRefreshing(true);
    try {
      const updated = await refreshBackendData();
      setApiResponse(updated);
    } catch (err) {
      setError("Failed to fetch live API updates.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Transform Backend API Contract -> Vis Nodes & Edges via Adapter
  const { nodes, edges } = transformBackendToVisFormat(apiResponse.entities, apiResponse.relationships);

  // Filtered nodes and edges for UI view
  const filteredNodes = nodes.filter(n => {
    const matchesType = filterType === 'ALL' || n.type === filterType;
    const matchesRisk = (n.computedRisk || n.riskScore || 0) >= minRisk;
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (n.aliases && n.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesType && matchesRisk && matchesSearch;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to));

  // Initialize & Update Vis Network Graph Canvas
  useEffect(() => {
    if (!containerRef.current || loading || error || nodes.length === 0) return;

    const visNodes = new DataSet(
      filteredNodes.map(n => {
        const colors = NODE_COLORS[n.type] || NODE_COLORS.PERSON;
        const risk = n.computedRisk || n.riskScore || 50;
        const size = Math.max(18, Math.min(38, 16 + (risk / 100) * 20));

        return {
          id: n.id,
          label: n.label,
          shape: n.type === 'PERSON' ? 'dot' : n.type === 'ORGANIZATION' ? 'diamond' : n.type === 'LOCATION' ? 'triangle' : 'box',
          size: size,
          font: { color: '#f8fafc', face: 'Inter', size: 12, strokeWidth: 2, strokeColor: '#0f172a' },
          color: {
            background: colors.background,
            border: colors.border,
            highlight: { background: colors.highlight, border: '#ffffff' }
          },
          borderWidth: risk > 85 ? 3 : 1,
          shadow: risk > 85 ? { enabled: true, color: colors.background, size: 15 } : false,
          title: `<strong>${n.label}</strong><br/>ID: ${n.id}<br/>Type: ${n.type}<br/>Confidence: ${(n.confidence * 100).toFixed(0)}%`
        };
      })
    );

    const visEdges = new DataSet(
      filteredEdges.map(e => ({
        id: e.id,
        from: e.from,
        to: e.to,
        label: e.label,
        font: { color: '#94a3b8', face: 'JetBrains Mono', size: 10, strokeWidth: 2, strokeColor: '#07090e' },
        color: { color: e.type === 'financial' ? '#ef4444' : e.type === 'communication' ? '#38bdf8' : '#64748b', highlight: '#f59e0b' },
        width: Math.max(1, (e.weight || 5) / 3),
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        smooth: { type: 'continuous' }
      }))
    );

    const options = {
      nodes: { shadow: true },
      edges: { smooth: true },
      physics: {
        enabled: layoutMode === 'force',
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 120,
          springConstant: 0.04
        }
      },
      layout: {
        hierarchical: layoutMode === 'hierarchical' ? { direction: 'UD', sortMethod: 'directed' } : false
      },
      interaction: { hover: true, tooltipDelay: 100, zoomView: true }
    };

    const network = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);
    networkRef.current = network;

    // Handle Node Click -> Fetch Details via API Layer (Requirement #4)
    network.on('selectNode', async (params) => {
      if (params.nodes.length > 0) {
        const selectedId = params.nodes[0];
        setSelectedEntityId(selectedId);
        setDetailsLoading(true);
        try {
          const details = await getEntityDetails(selectedId);
          setEntityDetailsData(details);
        } catch (err) {
          console.error("Error fetching entity details:", err);
        } finally {
          setDetailsLoading(false);
        }
      }
    });

    network.on('deselectNode', () => {
      setSelectedEntityId(null);
      setEntityDetailsData(null);
    });

    return () => {
      network.destroy();
    };
  }, [loading, error, filterType, minRisk, searchQuery, layoutMode, nodes.length, edges.length]);

  const handleResetView = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] bg-slate-950 flex overflow-hidden">
      {/* Main Canvas Area */}
      <div className="relative flex-1 h-full flex flex-col">
        {/* Top Control Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl">
          {/* Entity Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-sky-400" /> Filter:
            </span>
            {['ALL', 'PERSON', 'ORGANIZATION', 'PHONE', 'VEHICLE', 'LOCATION', 'BANK_ACCOUNT', 'CASE'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  filterType === type 
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search entity name/ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:border-sky-500 focus:outline-none w-44 font-outfit"
              />
            </div>

            {/* Minimum Risk Slider */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
              <span>Min Risk:</span>
              <input
                type="range"
                min="0"
                max="90"
                value={minRisk}
                onChange={(e) => setMinRisk(Number(e.target.value))}
                className="w-16 accent-sky-500 cursor-pointer"
              />
              <span className="font-mono text-sky-400 font-bold text-[11px]">{minRisk}%</span>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setLayoutMode('force')}
                className={`px-2 py-1 rounded ${layoutMode === 'force' ? 'bg-sky-500/20 text-sky-300 font-medium' : 'text-slate-400'}`}
              >
                Physics
              </button>
              <button
                onClick={() => setLayoutMode('hierarchical')}
                className={`px-2 py-1 rounded ${layoutMode === 'hierarchical' ? 'bg-sky-500/20 text-sky-300 font-medium' : 'text-slate-400'}`}
              >
                Tree
              </button>
            </div>

            {/* Dynamic Backend Refresh Button (Requirement #3) */}
            <button
              onClick={handleSimulateBackendUpdate}
              disabled={isRefreshing}
              title="Simulate Dynamic Backend API Update"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Simulate API Update</span>
            </button>

            {/* Reset View Button */}
            <button
              onClick={handleResetView}
              title="Reset Zoom & Pan"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LOADING STATE (Requirement #3) */}
        {loading && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-3">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            <p className="text-xs font-mono text-slate-300">Fetching investigation graph from API service...</p>
          </div>
        )}

        {/* ERROR STATE (Requirement #3) */}
        {!loading && error && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100">API Data Load Failure</h3>
            <p className="text-xs text-slate-400 max-w-md">{error}</p>
            <button
              onClick={() => loadData()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition"
            >
              Retry API Request
            </button>
          </div>
        )}

        {/* EMPTY STATE (Requirement #3) */}
        {!loading && !error && filteredNodes.length === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-300">No Graph Entities Returned</h3>
            <p className="text-xs text-slate-500">The current API response or filter parameters returned 0 graph nodes.</p>
            <button
              onClick={() => { setFilterType('ALL'); setMinRisk(0); setSearchQuery(''); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* SUCCESSFUL STATE: Vis Network Canvas (Requirement #3) */}
        {!loading && !error && apiResponse.entities.length > 0 && (
          <div 
            ref={containerRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" 
          />
        )}

        {/* Bottom Legend Bar */}
        <div className="absolute bottom-4 left-4 z-10 hidden md:flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Backend Entity Types:</span>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-slate-300">Person</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span className="text-slate-300">Organization</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span><span className="text-slate-300">Phone</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-slate-300">Vehicle</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-slate-300">Location</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span><span className="text-slate-300">Bank Account</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span><span className="text-slate-300">Case</span></div>
        </div>
      </div>

      {/* RIGHT-SIDE ENTITY DETAILS PANEL (Requirement #4) */}
      {selectedEntityId && (
        <aside className="w-96 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl p-5 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200 z-20">
          {detailsLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
              <span className="text-xs font-mono">Fetching entity details from API...</span>
            </div>
          ) : entityDetailsData ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      {entityDetailsData.entity.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      ID: {entityDetailsData.entity.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 font-outfit">{entityDetailsData.entity.name}</h2>
                  {entityDetailsData.entity.role && (
                    <p className="text-xs text-slate-400">{entityDetailsData.entity.role}</p>
                  )}
                </div>

                <button 
                  onClick={() => { setSelectedEntityId(null); setEntityDetailsData(null); }}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Confidence & Metrics Gauges */}
              <div className="py-4 border-b border-slate-800 grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">AI Confidence</span>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {(entityDetailsData.entity.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Direct Connections</span>
                  <p className="text-base font-bold font-mono text-sky-400 mt-0.5">
                    {entityDetailsData.relationships.length}
                  </p>
                </div>
              </div>

              {/* Intelligence Summary */}
              <div className="py-3 border-b border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  API Intelligence Summary
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                  {entityDetailsData.entity.details || "Indexed entity returned by mock API with active relationships across surveillance and financial records."}
                </p>
              </div>

              {/* Related Entities & Relationships List */}
              <div className="py-3 border-b border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Relationships ({entityDetailsData.relationships.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {entityDetailsData.relationships.map((rel, idx) => {
                    const otherId = rel.source === entityDetailsData.entity.id ? rel.target : rel.source;
                    const otherEntity = entityDetailsData.relatedEntities.find(e => e.id === otherId);
                    return (
                      <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <span className="text-slate-200 font-medium block">{otherEntity ? otherEntity.name : otherId}</span>
                          <span className="text-[10px] text-sky-400 font-mono">{rel.relation}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">{(rel.confidence * 100).toFixed(0)}% Conf</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Relevant Events List */}
              <div className="py-3 flex-1 overflow-y-auto space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Relevant Events ({entityDetailsData.events.length})
                </span>
                {entityDetailsData.events.length > 0 ? (
                  <div className="space-y-2">
                    {entityDetailsData.events.map(evt => (
                      <div key={evt.eventId} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-amber-400 font-bold">{evt.type}</span>
                          <span className="text-slate-500 font-mono">{evt.date}</span>
                        </div>
                        <p className="text-slate-300 font-medium">Event ID: {evt.eventId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific events logged for this entity.</p>
                )}
              </div>

              {/* Action Button: "Know More with AI" (Requirement #4) */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectTargetForAI(entityDetailsData.entity)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition"
                >
                  <Bot className="w-4 h-4" />
                  <span>Know More with AI</span>
                </button>
              </div>
            </>
          ) : null}
        </aside>
      )}
    </div>
  );
}
