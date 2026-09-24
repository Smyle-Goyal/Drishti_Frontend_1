import React, { useState } from 'react';
import { API_MODE } from '../api/config';

export default function SettingsPage() {
  const [selectedApiMode, setSelectedApiMode] = useState(API_MODE);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 font-['IBM_Plex_Sans'] text-[#dee4da] select-none">
      {/* Header Banner */}
      <div className="bg-[#171d17] p-4 border border-[#444842]/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#354234] text-[#bccbb8] font-bold">
              SYSTEM CONFIGURATION
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-[#dee4da]">System Preferences</h1>
          <p className="text-[12px] text-[#8e928b] mt-0.5">
            Configure application theme, API integration mode, graph renderer physics, and notification triggers.
          </p>
        </div>
      </div>

      {/* Preferences Sections */}
      <div className="space-y-4 font-['Space_Grotesk']">
        {/* API Integration Mode */}
        <div className="bg-[#171d17] p-4 border border-[#444842]/30 space-y-3">
          <div className="flex justify-between items-center border-b border-[#444842]/20 pb-2">
            <span className="text-[12px] font-bold text-[#bccbb8] uppercase">API SERVICE INTEGRATION MODE</span>
            <span className="text-[10px] bg-[#354234] text-[#dee4da] px-2 py-0.5 font-bold uppercase">
              ACTIVE: {selectedApiMode.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <button
              onClick={() => setSelectedApiMode('mock')}
              className={`p-3 text-left border transition-colors ${
                selectedApiMode === 'mock'
                  ? 'bg-[#354234] text-[#dee4da] border-[#bccbb8]'
                  : 'bg-[#0a100a] text-[#8e928b] border-[#444842]/30 hover:bg-[#1b211b]'
              }`}
            >
              <span className="font-bold block text-[13px] mb-1">Mock API Mode (Development)</span>
              <span className="text-[11px] block text-[#c4c8c0]/80">
                Uses local in-memory stateful mock API layer returning strict backend response contract.
              </span>
            </button>

            <button
              onClick={() => setSelectedApiMode('real')}
              className={`p-3 text-left border transition-colors ${
                selectedApiMode === 'real'
                  ? 'bg-[#354234] text-[#dee4da] border-[#bccbb8]'
                  : 'bg-[#0a100a] text-[#8e928b] border-[#444842]/30 hover:bg-[#1b211b]'
              }`}
            >
              <span className="font-bold block text-[13px] mb-1">Real API Mode (Production)</span>
              <span className="text-[11px] block text-[#c4c8c0]/80">
                Routes API requests directly to production backend REST endpoints (/api/v1/investigation).
              </span>
            </button>
          </div>
        </div>

        {/* Graph Preferences */}
        <div className="bg-[#171d17] p-4 border border-[#444842]/30 space-y-3">
          <span className="text-[12px] font-bold text-[#bccbb8] uppercase block border-b border-[#444842]/20 pb-2">
            GRAPH ENGINE PREFERENCES
          </span>

          <div className="space-y-2 text-[12px]">
            <div className="flex items-center justify-between bg-[#0a100a] p-2.5 border border-[#444842]/30">
              <span>Enable Force-Directed Physics Engine</span>
              <input type="checkbox" defaultChecked className="accent-[#bccbb8] cursor-pointer" />
            </div>

            <div className="flex items-center justify-between bg-[#0a100a] p-2.5 border border-[#444842]/30">
              <span>Show Directional Relationship Markers</span>
              <input type="checkbox" defaultChecked className="accent-[#bccbb8] cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Notifications & Security */}
        <div className="bg-[#171d17] p-4 border border-[#444842]/30 space-y-3">
          <span className="text-[12px] font-bold text-[#bccbb8] uppercase block border-b border-[#444842]/20 pb-2">
            SECURITY & ALERTS
          </span>

          <div className="space-y-2 text-[12px]">
            <div className="flex items-center justify-between bg-[#0a100a] p-2.5 border border-[#444842]/30">
              <span>High Risk Anomaly Threshold Alerts</span>
              <span className="text-[#bbccae] font-bold">ENABLED (LEVEL-4)</span>
            </div>

            <div className="flex items-center justify-between bg-[#0a100a] p-2.5 border border-[#444842]/30">
              <span>Session Encryption</span>
              <span className="text-[#bbccae] font-bold">TLS 1.3 // E2EE ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
