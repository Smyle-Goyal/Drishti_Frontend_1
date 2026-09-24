import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Calendar, ShieldAlert, PhoneCall, DollarSign, MapPin, FileText, Loader2, Users } from 'lucide-react';
import { getTimelineData } from '../services/timelineService';

export default function TimelineReplay() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadTimeline() {
      setLoading(true);
      try {
        const events = await getTimelineData();
        setTimelineEvents(events);
        if (events.length > 0) {
          setCurrentStep(events.length - 1);
        }
      } catch (err) {
        setError(err.message || "Failed to load timeline events from API.");
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (timelineEvents.length === 0) return;
      setIsPlaying(true);
      let step = currentStep >= timelineEvents.length - 1 ? 0 : currentStep;
      const interval = setInterval(() => {
        step++;
        setCurrentStep(step);
        if (step >= timelineEvents.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
        }
      }, 1500);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'WIRE_TRANSFER': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'CALL_SPIKE': return <PhoneCall className="w-4 h-4 text-sky-400" />;
      case 'SURVEILLANCE_SIGHTING': return <MapPin className="w-4 h-4 text-amber-400" />;
      case 'CHECKPOINT_INTERCEPT': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default: return <FileText className="w-4 h-4 text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-slate-400 space-y-3 font-outfit">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs font-mono">Loading dynamic timeline events from API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-outfit">
        <p className="text-sm text-rose-400 font-bold mb-2">Error loading timeline</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  const activeEvent = timelineEvents[currentStep] || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100 font-outfit">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/30">
              MODULE 6: TEMPORAL INTELLIGENCE & NETWORK REPLAY
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Dynamic Multi-Source Event Timeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Replay chronological sequence of events derived from backend <code className="text-amber-300 font-mono">events[]</code> API response.
          </p>
        </div>

        {/* Time Slider Play Controls */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <button
            onClick={togglePlay}
            className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold hover:bg-amber-400 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
          </button>
          <div className="text-xs">
            <span className="text-slate-400 text-[10px] block">TIMELINE REPLAY</span>
            <span className="font-mono text-amber-300 font-bold">
              Step {currentStep + 1} of {timelineEvents.length} ({activeEvent.date})
            </span>
          </div>
          <button
            onClick={() => setCurrentStep(0)}
            className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Time Slider Bar */}
      {timelineEvents.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>{timelineEvents[0]?.date}</span>
            <span className="text-amber-400 font-bold">{activeEvent?.date}</span>
            <span>{timelineEvents[timelineEvents.length - 1]?.date}</span>
          </div>
          <input
            type="range"
            min="0"
            max={timelineEvents.length - 1}
            value={currentStep}
            onChange={(e) => setCurrentStep(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      )}

      {/* Vertical Timeline Events Tree */}
      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 space-y-6 pb-6">
        {timelineEvents.map((evt, idx) => {
          const isActive = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div 
              key={evt.eventId}
              className={`relative pl-6 md:pl-10 transition-all ${
                isActive ? 'opacity-100' : 'opacity-30'
              }`}
            >
              {/* Timeline Dot Icon */}
              <div className={`absolute -left-3.5 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                isCurrent
                  ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/40 scale-110'
                  : isActive
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}>
                {getEventIcon(evt.type)}
              </div>

              {/* Event Content Box */}
              <div className={`glass-panel p-5 rounded-2xl border transition ${
                isCurrent ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-slate-800/80'
              }`}>
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {evt.date}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {evt.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {evt.eventId}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-2">{evt.type.replace('_', ' ')}</h3>

                {/* Resolved Location Name (Requirement #5) */}
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-amber-300">{evt.locationName}</span>
                  <span className="text-[10px] font-mono text-slate-500">({evt.location})</span>
                </div>

                {/* Resolved Participant Names (Requirement #5) */}
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <Users className="w-3.5 h-3.5 text-sky-400 mt-0.5" />
                  <span className="text-slate-400">Participants:</span>
                  <div className="flex flex-wrap gap-1">
                    {evt.participantNames.map((name, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 bg-slate-900 text-sky-300 rounded font-mono text-[11px] border border-slate-800">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
