import React, { useState, useEffect } from 'react';
import { getTopSuspects, getPersonHypothesis, getFallbackAvatar } from '../services/suspectService';

export default function TopSuspectsPage({ activeCaseId = 'CASE-HAWALA-2026', onInvestigateSuspect }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeHypothesisId, setActiveHypothesisId] = useState(null);
  const [hypothesisData, setHypothesisData] = useState({});
  const [loadingHypothesisId, setLoadingHypothesisId] = useState(null);

  const toggleHypothesis = async (personId) => {
    if (activeHypothesisId === personId) {
      setActiveHypothesisId(null);
      return;
    }
    setActiveHypothesisId(personId);
    if (!hypothesisData[personId]) {
      setLoadingHypothesisId(personId);
      try {
        const res = await getPersonHypothesis(personId, activeCaseId);
        setHypothesisData(prev => ({ ...prev, [personId]: res }));
      } catch (err) {
        console.error("Error loading hypothesis:", err);
      } finally {
        setLoadingHypothesisId(null);
      }
    }
  };

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await getTopSuspects(activeCaseId);
      setData(res);
    } catch (err) {
      console.error('Error fetching top suspects:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCaseId]);

  const suspects = data?.top_suspects || [];

  const filteredSuspects = suspects.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.person_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterLevel === 'CRITICAL') return s.risk_score >= 90;
    if (filterLevel === 'HIGH') return s.risk_score >= 75 && s.risk_score < 90;
    if (filterLevel === 'MEDIUM') return s.risk_score < 75;
    return true;
  });

  const getRiskColor = (score) => {
    if (score >= 90) return {
      badge: 'bg-[#93000a]/50 text-[#ffb4ab] border-[#ffb4ab]/40',
      bar: 'bg-[#ffb4ab]',
      accent: 'text-[#ffb4ab]',
      border: 'border-[#ffb4ab]/30'
    };
    if (score >= 75) return {
      badge: 'bg-[#5a2800]/50 text-[#ffb77c] border-[#ffb77c]/40',
      bar: 'bg-[#ffb77c]',
      accent: 'text-[#ffb77c]',
      border: 'border-[#ffb77c]/30'
    };
    return {
      badge: 'bg-[#4a3800]/50 text-[#ffdf9f] border-[#ffdf9f]/40',
      bar: 'bg-[#ffdf9f]',
      accent: 'text-[#ffdf9f]',
      border: 'border-[#ffdf9f]/30'
    };
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { text: '#1 TOP TARGET', bg: 'bg-[#d4af37]/20 text-[#f3e5ab] border-[#d4af37]/50' };
    if (rank === 2) return { text: '#2 SECONDARY', bg: 'bg-[#c0c0c0]/20 text-[#e0e0e0] border-[#c0c0c0]/50' };
    if (rank === 3) return { text: '#3 CONDUIT', bg: 'bg-[#cd7f32]/20 text-[#f5d0a9] border-[#cd7f32]/50' };
    return { text: `#${rank}`, bg: 'bg-[#252c25] text-[#8e928b] border-[#444842]/40' };
  };

  const handleCopySummary = (suspect) => {
    const text = `SUSPECT DOSSIER: ${suspect.name} (${suspect.person_id})\nRole: ${suspect.role}\nRisk: ${suspect.risk_score}% (${suspect.risk_level})\nFunds Linked: ${suspect.key_metrics?.total_funds_linked}\nSummary: ${suspect.involvement_summary}\nAction: ${suspect.recommended_action}`;
    navigator.clipboard.writeText(text);
    setCopiedId(suspect.person_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-['IBM_Plex_Sans'] text-[#dee4da]">
      {/* Header Banner */}
      <div className="bg-[#171d17] p-5 border border-[#444842]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#354234] text-[#bccbb8] font-bold">
              LAW ENFORCEMENT INTELLIGENCE • RISK ANALYZER
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] bg-[#252c25] border border-[#444842]/40 text-[#8e928b] px-2 py-0.5 font-mono">
              DOSSIER: {activeCaseId || 'CASE-HAWALA-2026'}
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] bg-[#0a100a] text-[#8e928b] px-2 py-0.5 border border-[#444842]/30">
              ANALYZED: {suspects.length} PERSONS
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[#dee4da] tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[26px]">person_alert</span>
            Top Suspects Leaderboard
          </h1>
          <p className="text-xs text-[#8e928b] mt-1">
            Automated multi-factor forensic ranking synthesizing financial volume, network centrality, telecom frequency, and seized physical evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-[#252c25] hover:bg-[#354234] border border-[#444842]/40 text-[#bccbb8] text-xs font-['Space_Grotesk'] uppercase tracking-wider transition-all disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
            {isRefreshing ? 'Scoring...' : 'Recalculate Scores'}
          </button>
        </div>
      </div>

      {/* Multi-Factor Forensic Weights Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 select-none">
        <div className="bg-[#171d17]/80 border border-[#444842]/30 p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#252c25] border border-[#444842]/40 flex items-center justify-center text-[#ffb77c]">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#dee4da]">Financial Volume</span>
              <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#ffb77c]">30%</span>
            </div>
            <p className="text-[11px] text-[#8e928b] mt-0.5 leading-snug">
              Laundered amounts, shell accounts, wire velocity
            </p>
          </div>
        </div>

        <div className="bg-[#171d17]/80 border border-[#444842]/30 p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#252c25] border border-[#444842]/40 flex items-center justify-center text-[#bccbb8]">
            <span className="material-symbols-outlined text-[18px]">hub</span>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#dee4da]">Network Hierarchy</span>
              <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#bccbb8]">25%</span>
            </div>
            <p className="text-[11px] text-[#8e928b] mt-0.5 leading-snug">
              Graph centrality, associates controlled, syndicate ranks
            </p>
          </div>
        </div>

        <div className="bg-[#171d17]/80 border border-[#444842]/30 p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#252c25] border border-[#444842]/40 flex items-center justify-center text-[#ffb4ab]">
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#dee4da]">Physical Evidence</span>
              <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#ffb4ab]">25%</span>
            </div>
            <p className="text-[11px] text-[#8e928b] mt-0.5 leading-snug">
              Seized diaries, Angadia notes, CCTV & field reports
            </p>
          </div>
        </div>

        <div className="bg-[#171d17]/80 border border-[#444842]/30 p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#252c25] border border-[#444842]/40 flex items-center justify-center text-[#dee4da]">
            <span className="material-symbols-outlined text-[18px]">perm_phone_msg</span>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#dee4da]">Telecom Intensity</span>
              <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#dee4da]">20%</span>
            </div>
            <p className="text-[11px] text-[#8e928b] mt-0.5 leading-snug">
              CDR frequency, burner devices, call duration spikes
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#171d17] p-4 border border-[#444842]/30 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#8e928b]">
            search
          </span>
          <input
            type="text"
            placeholder="Search suspect, role, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a100a] border border-[#444842]/40 text-[#dee4da] pl-9 pr-3 py-1.5 text-xs font-['Space_Grotesk'] placeholder:text-[#8e928b] focus:outline-none focus:border-[#bccbb8]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e928b] hover:text-[#dee4da]"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 self-start md:self-auto flex-wrap">
          <span className="text-[11px] font-['Space_Grotesk'] text-[#8e928b] uppercase mr-1">Risk Filter:</span>
          {[
            { id: 'ALL', label: 'All Suspects' },
            { id: 'CRITICAL', label: 'Critical (90%+)', color: 'text-[#ffb4ab]' },
            { id: 'HIGH', label: 'High (75-89%)', color: 'text-[#ffb77c]' },
            { id: 'MEDIUM', label: 'Medium (<75%)', color: 'text-[#ffdf9f]' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterLevel(f.id)}
              className={`px-2.5 py-1 text-xs font-['Space_Grotesk'] tracking-wider border transition-colors ${
                filterLevel === f.id
                  ? 'bg-[#354234] text-[#bccbb8] border-[#bccbb8]/60 font-semibold'
                  : 'bg-[#0a100a] text-[#8e928b] border-[#444842]/30 hover:text-[#dee4da]'
              }`}
            >
              <span className={f.color || ''}>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suspects Cards Feed */}
      {loading ? (
        <div className="bg-[#171d17] border border-[#444842]/30 p-12 text-center flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-3xl animate-spin text-[#bccbb8]">
            progress_activity
          </span>
          <p className="font-['Space_Grotesk'] text-sm text-[#8e928b] uppercase tracking-wider">
            Synthesizing Multi-Factor Forensic Scores...
          </p>
        </div>
      ) : filteredSuspects.length === 0 ? (
        <div className="bg-[#171d17] border border-[#444842]/30 p-12 text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-4xl text-[#8e928b]">
            manage_search
          </span>
          <p className="font-['Space_Grotesk'] text-base text-[#dee4da] font-semibold">
            No suspects matched your search criteria
          </p>
          <p className="text-xs text-[#8e928b]">
            Try adjusting your query or resetting the risk filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setFilterLevel('ALL'); }}
            className="mt-2 text-xs text-[#bccbb8] underline font-['Space_Grotesk'] uppercase"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuspects.map((suspect) => {
            const riskStyle = getRiskColor(suspect.risk_score);
            const rankStyle = getRankBadge(suspect.rank);

            return (
              <div
                key={suspect.person_id}
                className={`bg-[#171d17] border ${riskStyle.border} p-5 transition-all hover:bg-[#1a211a] flex flex-col gap-4 relative overflow-hidden`}
              >
                {/* Accent border top indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${riskStyle.bar}`} />

                {/* Card Top Row: Rank, Identity, Risk Score */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                  {/* Suspect Identity */}
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={suspect.avatar_placeholder || getFallbackAvatar(suspect.name)}
                        alt={suspect.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getFallbackAvatar(suspect.name);
                        }}
                        className="w-14 h-14 rounded-sm border border-[#444842] object-cover bg-[#0a100a]"
                      />
                      <span className="absolute -bottom-1 -right-1 font-['Space_Grotesk'] text-[10px] font-bold bg-[#0a100a] text-[#dee4da] px-1 border border-[#444842]/50">
                        #{suspect.rank}
                      </span>
                    </div>

                    {/* Name & Role */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-['Space_Grotesk'] text-[10px] font-bold px-2 py-0.5 border uppercase ${rankStyle.bg}`}>
                          {rankStyle.text}
                        </span>
                        <span className="font-mono text-xs text-[#8e928b] bg-[#0a100a] px-1.5 py-0.5 border border-[#444842]/30">
                          {suspect.person_id}
                        </span>
                        <span className="font-['Space_Grotesk'] text-[10px] text-[#bccbb8] bg-[#354234]/50 px-2 py-0.5 border border-[#bccbb8]/20 uppercase">
                          {suspect.status}
                        </span>
                      </div>
                      <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#dee4da] mt-1 tracking-wide">
                        {suspect.name}
                      </h2>
                      <span className="text-xs text-[#ffb77c] font-['Space_Grotesk'] font-medium">
                        {suspect.role}
                      </span>
                    </div>
                  </div>

                  {/* Risk Score Dial Box */}
                  <div className="flex items-center gap-3 bg-[#0a100a]/70 p-2.5 border border-[#444842]/30 min-w-[200px] justify-between">
                    <div className="flex flex-col">
                      <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b]">
                        FORENSIC RISK SCORE
                      </span>
                      <span className={`font-['Space_Grotesk'] text-2xl font-bold ${riskStyle.accent}`}>
                        {suspect.risk_score}%
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-['Space_Grotesk'] text-[10px] font-bold px-2 py-0.5 border uppercase ${riskStyle.badge}`}>
                        {suspect.risk_level}
                      </span>
                      <span className="text-[10px] text-[#8e928b] mt-1 font-mono">
                        PRIORITY LEVEL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#444842]/20">
                  <div className="bg-[#0a100a] p-2.5 border border-[#444842]/30">
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b] block">
                      Linked Funds (₹)
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-[#ffb77c] block mt-0.5">
                      {suspect.key_metrics?.total_funds_linked || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-[#0a100a] p-2.5 border border-[#444842]/30">
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b] block">
                      Known Associates
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-[#dee4da] block mt-0.5">
                      {suspect.key_metrics?.associates_count || 0} Entities
                    </span>
                  </div>
                  <div className="bg-[#0a100a] p-2.5 border border-[#444842]/30">
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b] block">
                      Telecom Intercepts
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-[#dee4da] block mt-0.5">
                      {suspect.key_metrics?.calls_recorded || 0} Calls
                    </span>
                  </div>
                  <div className="bg-[#0a100a] p-2.5 border border-[#444842]/30">
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b] block">
                      Physical Sightings
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-[#ffb4ab] block mt-0.5">
                      {suspect.key_metrics?.surveillance_sightings || 0} Sighted
                    </span>
                  </div>
                </div>

                {/* Involvement Summary */}
                <div className="bg-[#0f150f] p-3 border border-[#444842]/30 text-xs text-[#c4c8c0] leading-relaxed">
                  <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#bccbb8] uppercase mr-2 tracking-wide">
                    Forensic Briefing:
                  </span>
                  {suspect.involvement_summary}
                </div>

                {/* Critical Evidence & Recommended Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Critical Evidence */}
                  <div className="bg-[#0a100a] p-3 border border-[#444842]/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-['Space_Grotesk'] uppercase tracking-wider text-[#ffb4ab] font-bold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Direct Seizure & Forensic Evidence
                    </div>
                    <ul className="space-y-1.5">
                      {(suspect.critical_evidence || []).map((ev, idx) => (
                        <li key={idx} className="text-xs text-[#dee4da] flex items-start gap-2">
                          <span className="text-[#8e928b] mt-0.5">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action */}
                  <div className="bg-[#0a100a] p-3 border border-[#444842]/30 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-['Space_Grotesk'] uppercase tracking-wider text-[#ffb77c] font-bold">
                        <span className="material-symbols-outlined text-[16px]">gavel</span>
                        Recommended Operational Action
                      </div>
                      <p className="text-xs text-[#dee4da] mt-2 leading-relaxed bg-[#252c25]/40 p-2 border border-[#444842]/30">
                        {suspect.recommended_action}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#444842]/20 flex-wrap">
                      <button
                        onClick={() => toggleHypothesis(suspect.person_id)}
                        className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 border text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider transition-colors ${
                          activeHypothesisId === suspect.person_id
                            ? 'bg-[#ffb77c]/20 border-[#ffb77c] text-[#ffb77c]'
                            : 'bg-[#252c25] hover:bg-[#354234] border-[#444842]/40 text-[#dee4da]'
                        }`}
                        title="View Forensic Hypothesis (Analysis of Competing Hypotheses)"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {activeHypothesisId === suspect.person_id ? 'visibility_off' : 'lightbulb'}
                        </span>
                        <span>{activeHypothesisId === suspect.person_id ? 'Hide Theory' : 'Forensic Hypothesis'}</span>
                      </button>
                      <button
                        onClick={() => onInvestigateSuspect && onInvestigateSuspect(suspect)}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 bg-[#354234] hover:bg-[#445443] border border-[#bccbb8]/40 text-[#bccbb8] text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        Investigate
                      </button>
                      <button
                        onClick={() => handleCopySummary(suspect)}
                        className="px-3 py-2 bg-[#252c25] hover:bg-[#354234] border border-[#444842]/40 text-[#8e928b] hover:text-[#dee4da] text-xs font-['Space_Grotesk'] transition-colors"
                        title="Copy suspect summary"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {copiedId === suspect.person_id ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Forensic Hypothesis (ACH) Expanded Drawer */}
                {activeHypothesisId === suspect.person_id && (
                  <div className="mt-2 pt-3 border-t border-[#444842]/50 bg-[#0a100a] p-4 border border-[#bccbb8]/20 space-y-4">
                    {loadingHypothesisId === suspect.person_id ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#bccbb8]">
                        <span className="material-symbols-outlined text-2xl animate-spin text-[#ffb77c]">progress_activity</span>
                        <span className="font-['Space_Grotesk'] text-xs uppercase tracking-wider text-[#8e928b]">
                          Running Analysis of Competing Hypotheses (ACH Engine)...
                        </span>
                      </div>
                    ) : hypothesisData[suspect.person_id] ? (
                      (() => {
                        const hyp = hypothesisData[suspect.person_id];
                        const primary = hyp.primary_hypothesis || {};
                        const alt = hyp.alternative_hypothesis || {};
                        const deception = hyp.deception_cover_analysis || hyp.deception_and_cover_analysis || hyp.deception_analysis || {};

                        // Safe property extractions to prevent rendering raw objects as React children
                        const primaryTitle = typeof primary.title === 'string' ? primary.title : (typeof primary.theory === 'string' ? primary.theory : 'Primary Crime Theory');
                        const primaryProb = primary.probability_score != null ? String(primary.probability_score) : '88';
                        const primaryConf = typeof primary.confidence_level === 'string' ? primary.confidence_level : 'HIGH';

                        const modusOperandi = typeof primary.modus_operandi === 'object' && primary.modus_operandi !== null
                          ? (primary.modus_operandi.fact || primary.modus_operandi.description || primary.modus_operandi.text || primary.modus_operandi.summary || '')
                          : (typeof primary.modus_operandi === 'string' ? primary.modus_operandi : '');

                        const falsificationTest = typeof primary.falsification_test === 'object' && primary.falsification_test !== null
                          ? (primary.falsification_test.test || primary.falsification_test.criteria || primary.falsification_test.audit || primary.falsification_test.description || primary.falsification_test.fact || '')
                          : (typeof primary.falsification_test === 'string' ? primary.falsification_test : '');

                        const tacticalRec = typeof primary.tactical_recommendation === 'object' && primary.tactical_recommendation !== null
                          ? (primary.tactical_recommendation.action || primary.tactical_recommendation.recommendation || primary.tactical_recommendation.text || '')
                          : (typeof primary.tactical_recommendation === 'string' ? primary.tactical_recommendation : '');

                        const altTitle = typeof alt.title === 'string' ? alt.title : (typeof alt.theory === 'string' ? alt.theory : 'Alternative Competing Hypothesis');
                        const altProb = alt.probability_score != null ? String(alt.probability_score) : '25';
                        const altConf = typeof alt.confidence_level === 'string' ? alt.confidence_level : 'LOW';
                        const altSummary = typeof alt.summary === 'object' && alt.summary !== null
                          ? (alt.summary.description || alt.summary.text || alt.summary.fact || '')
                          : (typeof alt.summary === 'string' ? alt.summary : (typeof alt.theory === 'string' ? alt.theory : ''));

                        const commFront = typeof deception.commercial_front === 'object' && deception.commercial_front !== null
                          ? (deception.commercial_front.name || deception.commercial_front.business || deception.commercial_front.description || '')
                          : (typeof deception.commercial_front === 'string' ? deception.commercial_front : '');

                        const rawVuln = deception.vulnerabilities || deception.vulnerability;
                        let vulnerabilitiesList = [];
                        if (Array.isArray(rawVuln)) {
                          vulnerabilitiesList = rawVuln.map(v => typeof v === 'object' && v !== null ? (v.fact || v.description || v.text || '') : String(v));
                        } else if (typeof rawVuln === 'object' && rawVuln !== null) {
                          vulnerabilitiesList = [rawVuln.fact || rawVuln.description || rawVuln.text || ''];
                        } else if (typeof rawVuln === 'string' && rawVuln) {
                          vulnerabilitiesList = [rawVuln];
                        }

                        return (
                          <div className="space-y-4">
                            {/* ACH Header Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#444842]/30">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="material-symbols-outlined text-[#ffb77c] text-[20px]">psychology</span>
                                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#dee4da] uppercase tracking-wider">
                                  Analysis of Competing Hypotheses (ACH)
                                </span>
                                <span className="text-[10px] font-mono bg-[#252c25] text-[#bccbb8] px-2 py-0.5 border border-[#444842]/40">
                                  {hyp.case_id}
                                </span>
                              </div>
                              <button
                                onClick={() => setActiveHypothesisId(null)}
                                className="self-end sm:self-auto text-xs text-[#8e928b] hover:text-[#dee4da] flex items-center gap-1 font-['Space_Grotesk']"
                              >
                                <span>Collapse</span>
                                <span className="material-symbols-outlined text-[14px]">expand_less</span>
                              </button>
                            </div>

                            {/* Primary Hypothesis Card */}
                            <div className="bg-[#171d17] border border-[#ffb4ab]/30 p-3.5 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-['Space_Grotesk'] uppercase text-[#ffb4ab] font-bold tracking-wider block">
                                    PRIMARY HYPOTHESIS • CRIME THEORY
                                  </span>
                                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#dee4da] mt-0.5">
                                    {primaryTitle}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2 bg-[#0a100a] px-3 py-1.5 border border-[#444842]/40 self-start sm:self-auto">
                                  <span className="text-[11px] font-['Space_Grotesk'] text-[#8e928b] uppercase">Probability:</span>
                                  <span className="font-['Space_Grotesk'] text-sm font-bold text-[#ffb4ab]">
                                    {primaryProb}%
                                  </span>
                                  <span className="text-[9px] uppercase font-['Space_Grotesk'] px-1.5 py-0.5 bg-[#93000a]/50 text-[#ffb4ab] border border-[#ffb4ab]/30 font-bold">
                                    {primaryConf}
                                  </span>
                                </div>
                              </div>

                              {/* Modus Operandi */}
                              {modusOperandi && (
                                <div className="bg-[#0a100a] p-3 border border-[#444842]/30">
                                  <span className="text-[10px] font-['Space_Grotesk'] uppercase text-[#bccbb8] font-bold tracking-wide block mb-1">
                                    Modus Operandi (M.O.):
                                  </span>
                                  <p className="text-xs text-[#c4c8c0] leading-relaxed">
                                    {modusOperandi}
                                  </p>
                                </div>
                              )}

                              {/* Supporting Evidence Citations (Array of Objects: {type, record_id, fact}) */}
                              {primary.supporting_evidence && Array.isArray(primary.supporting_evidence) && primary.supporting_evidence.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-['Space_Grotesk'] uppercase text-[#8e928b] font-bold tracking-wide block">
                                    Supporting Database Citations & Evidence ({primary.supporting_evidence.length}):
                                  </span>
                                  <ul className="space-y-1.5">
                                    {primary.supporting_evidence.map((ev, i) => {
                                      if (typeof ev === 'object' && ev !== null) {
                                        const recordId = ev.record_id || ev.id || '';
                                        const evType = ev.type || '';
                                        const factText = ev.fact || ev.description || ev.evidence || ev.text || '';
                                        return (
                                          <li key={i} className="text-xs text-[#dee4da] bg-[#0a100a] p-2.5 border border-[#444842]/20 flex items-start gap-2.5">
                                            <span className="material-symbols-outlined text-[15px] text-[#bccbb8] shrink-0 mt-0.5">check_circle</span>
                                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                {evType && (
                                                  <span className="text-[9px] font-['Space_Grotesk'] font-bold uppercase px-1.5 py-0.5 bg-[#252c25] text-[#bccbb8] border border-[#444842]/40">
                                                    {String(evType)}
                                                  </span>
                                                )}
                                                {recordId && (
                                                  <span className="text-[10px] font-mono font-bold text-[#ffb77c]">
                                                    {String(recordId)}
                                                  </span>
                                                )}
                                              </div>
                                              {factText && (
                                                <p className="text-xs text-[#c4c8c0] leading-relaxed">
                                                  {String(factText)}
                                                </p>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      }
                                      return (
                                        <li key={i} className="text-xs text-[#dee4da] bg-[#0a100a] p-2.5 border border-[#444842]/20 flex items-start gap-2.5">
                                          <span className="material-symbols-outlined text-[15px] text-[#bccbb8] shrink-0 mt-0.5">check_circle</span>
                                          <span className="text-[#c4c8c0] leading-relaxed">{String(ev)}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}

                              {/* Contradicting Facts & Intelligence Gaps */}
                              {primary.contradicting_facts && Array.isArray(primary.contradicting_facts) && primary.contradicting_facts.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-['Space_Grotesk'] uppercase text-[#ffdf9f] font-bold tracking-wide block">
                                    Contradicting Facts & Intelligence Gaps ({primary.contradicting_facts.length}):
                                  </span>
                                  <ul className="space-y-1.5">
                                    {primary.contradicting_facts.map((cf, i) => {
                                      if (typeof cf === 'object' && cf !== null) {
                                        const recordId = cf.record_id || cf.id || '';
                                        const cfType = cf.type || '';
                                        const factText = cf.fact || cf.description || cf.evidence || cf.text || '';
                                        return (
                                          <li key={i} className="text-xs text-[#dee4da] bg-[#0a100a] p-2.5 border border-[#444842]/20 flex items-start gap-2.5">
                                            <span className="material-symbols-outlined text-[15px] text-[#ffdf9f] shrink-0 mt-0.5">info</span>
                                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                              {(cfType || recordId) && (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  {cfType && (
                                                    <span className="text-[9px] font-['Space_Grotesk'] font-bold uppercase px-1.5 py-0.5 bg-[#252c25] text-[#ffdf9f] border border-[#444842]/40">
                                                      {String(cfType)}
                                                    </span>
                                                  )}
                                                  {recordId && (
                                                    <span className="text-[10px] font-mono font-bold text-[#ffb77c]">
                                                      {String(recordId)}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                              {factText && (
                                                <p className="text-xs text-[#c4c8c0] leading-relaxed">
                                                  {String(factText)}
                                                </p>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      }
                                      return (
                                        <li key={i} className="text-xs text-[#dee4da] bg-[#0a100a] p-2.5 border border-[#444842]/20 flex items-start gap-2.5">
                                          <span className="material-symbols-outlined text-[15px] text-[#ffdf9f] shrink-0 mt-0.5">info</span>
                                          <span className="text-[#c4c8c0] leading-relaxed">{String(cf)}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}

                              {/* Critical Falsification Test */}
                              {falsificationTest && (
                                <div className="bg-[#241a00]/40 border border-[#ffdf9f]/30 p-3 space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-['Space_Grotesk'] uppercase text-[#ffdf9f] font-bold tracking-wider">
                                    <span className="material-symbols-outlined text-[14px]">science</span>
                                    Critical Falsification Test (Audit Criteria):
                                  </div>
                                  <p className="text-xs text-[#dee4da] leading-relaxed">
                                    {falsificationTest}
                                  </p>
                                </div>
                              )}

                              {/* Tactical Law Enforcement Recommendation */}
                              {tacticalRec && (
                                <div className="bg-[#1b211b] border border-[#bccbb8]/30 p-3 space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-['Space_Grotesk'] uppercase text-[#bccbb8] font-bold tracking-wider">
                                    <span className="material-symbols-outlined text-[14px]">shield</span>
                                    Tactical Law Enforcement Recommendation:
                                  </div>
                                  <p className="text-xs text-[#dee4da] leading-relaxed font-mono">
                                    {tacticalRec}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Bottom Row: Alternative Theory & Deception Cover */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Alternative Competing Hypothesis */}
                              <div className="bg-[#171d17] border border-[#444842]/40 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-['Space_Grotesk'] uppercase text-[#8e928b] font-bold tracking-wider">
                                    ALTERNATIVE COMPETING HYPOTHESIS
                                  </span>
                                  <span className="text-[11px] font-['Space_Grotesk'] text-[#8e928b] font-bold">
                                    {altProb}% {altConf}
                                  </span>
                                </div>
                                <h4 className="font-['Space_Grotesk'] text-xs font-bold text-[#dee4da]">
                                  {altTitle}
                                </h4>
                                <p className="text-xs text-[#8e928b] leading-relaxed">
                                  {altSummary || "Alternative commercial scenario under investigation."}
                                </p>
                              </div>

                              {/* Deception & Cover Analysis */}
                              <div className="bg-[#171d17] border border-[#444842]/40 p-3 space-y-2">
                                <span className="text-[10px] font-['Space_Grotesk'] uppercase text-[#ffb77c] font-bold tracking-wider block">
                                  DECEPTION & COVER ANALYSIS
                                </span>
                                {commFront && (
                                  <div className="text-xs">
                                    <span className="text-[#8e928b] font-['Space_Grotesk'] uppercase text-[10px] mr-1.5">Commercial Front:</span>
                                    <span className="text-[#dee4da]">{commFront}</span>
                                  </div>
                                )}
                                {vulnerabilitiesList.length > 0 && (
                                  <div className="text-xs space-y-1">
                                    <span className="text-[#ffb77c] font-['Space_Grotesk'] uppercase text-[10px] block">
                                      Vulnerabilities ({vulnerabilitiesList.length}):
                                    </span>
                                    {vulnerabilitiesList.map((vuln, vIdx) => (
                                      <p key={vIdx} className="text-[#c4c8c0] leading-relaxed pl-2 border-l border-[#ffb77c]/40">
                                        {vuln}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-xs text-[#8e928b] p-3 text-center">
                        Unable to load forensic hypothesis. Please ensure backend agent is reachable.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
