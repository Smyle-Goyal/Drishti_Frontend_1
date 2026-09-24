import React, { useState, useEffect } from 'react';
import { getTimelineData } from '../services/timelineService';

export default function TimelinePage({ activeCaseId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTimeline() {
      setLoading(true);
      setError(null);
      try {
        const res = await getTimelineData(activeCaseId);
        setEvents(res);
      } catch (err) {
        setError(err.message || 'Failed to fetch timeline events from API service.');
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, [activeCaseId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#8e928b] font-['Space_Grotesk'] text-[12px] flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[24px] text-[#bccbb8] animate-spin">progress_activity</span>
        <span className="uppercase tracking-wider">Fetching Chronological Event Intelligence from API...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-[#ffb4ab] font-['Space_Grotesk'] space-y-2">
        <span className="material-symbols-outlined text-[32px]">warning</span>
        <p className="text-[14px] font-bold">TIMELINE API ERROR</p>
        <p className="text-[11px] text-[#8e928b]">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-['IBM_Plex_Sans'] text-[#dee4da]">
      {/* Header Banner */}
      <div className="bg-[#171d17] p-4 border border-[#444842]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#354234] text-[#bccbb8] font-bold">
              TEMPORAL INTELLIGENCE REPLAY
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-[#dee4da]">Chronological Network Event Sequence</h1>
          <p className="text-[12px] text-[#8e928b] mt-0.5">
            Dynamic timeline constructed from backend <code className="text-[#bccbb8]">events[]</code> API response with resolved entity names.
          </p>
        </div>
        <span className="font-['Space_Grotesk'] text-[11px] text-[#bbccae] font-bold bg-[#0a100a] px-3 py-1.5 border border-[#444842]/30">
          {events.length} CHRONOLOGICAL EVENTS LOGGED
        </span>
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative border-l-2 border-[#444842]/40 ml-4 md:ml-8 space-y-6 pb-6 select-none">
        {events.map((evt, idx) => (
          <div key={evt.eventId} className="relative pl-6 md:pl-10">
            {/* Timeline Node Dot */}
            <div className="absolute -left-3 top-0.5 w-6 h-6 bg-[#354234] border-2 border-[#bccbb8] flex items-center justify-center text-[#bccbb8]">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
            </div>

            {/* Event Box */}
            <div className="bg-[#171d17] p-4 border border-[#444842]/30 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#444842]/20 pb-2">
                <div className="flex items-center gap-2 font-['Space_Grotesk']">
                  <span className="text-[11px] font-bold text-[#bccbb8] bg-[#354234] px-2 py-0.5">
                    {evt.date}
                  </span>
                  <span className="text-[10px] uppercase text-[#8e928b] bg-[#0a100a] px-2 py-0.5 border border-[#444842]/30">
                    TYPE: {evt.type}
                  </span>
                </div>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#8e928b]">EVENT ID: {evt.eventId}</span>
              </div>

              {/* Resolved Location Name (Requirement #5) */}
              <div className="flex items-center gap-2 text-[12px]">
                <span className="material-symbols-outlined text-[16px] text-[#bccbb8]">pin_drop</span>
                <span className="text-[#8e928b] font-['Space_Grotesk']">LOCATION:</span>
                <span className="font-['Space_Grotesk'] text-[#dee4da] font-bold">{evt.locationName}</span>
                <span className="text-[10px] text-[#8e928b] font-mono">({evt.location})</span>
              </div>

              {/* Resolved Participant Names (Requirement #5) */}
              <div className="flex items-start gap-2 text-[12px]">
                <span className="material-symbols-outlined text-[16px] text-[#bbccae] mt-0.5">group</span>
                <span className="text-[#8e928b] font-['Space_Grotesk']">PARTICIPANTS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {evt.participantNames.map((pName, pIdx) => (
                    <span key={pIdx} className="font-['Space_Grotesk'] text-[11px] bg-[#0a100a] text-[#bccbb8] px-2 py-0.5 border border-[#444842]/40 font-semibold">
                      {pName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
