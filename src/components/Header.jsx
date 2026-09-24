import React, { useState, useRef, useEffect } from 'react';
import { API_MODE } from '../api/config';

export default function Header({ entityCount, relationshipCount, searchQuery, onSearchChange, activeCase, casesList = [], onSelectCase }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dossier dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-[#EFE9DD] border-b border-[#D9D0C4] z-40 px-4 flex items-center justify-between gap-4 select-none">
      {/* Active Dossier & Status */}
      <div className="flex items-center gap-3">
        {/* Active Dossier Trigger & Menu Container */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="case-dropdown-trigger flex items-center bg-[#FFFDF8] px-3 py-1.5 border border-[#D9D0C4] rounded gap-2.5 cursor-pointer hover:bg-[#EFE9DD] transition-colors"
          >
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#756E69] font-bold tracking-wider">
                ACTIVE DOSSIER
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-['Space_Grotesk'] text-[13px] text-[#6F1D32] font-bold tracking-tight">
                  #{activeCase ? activeCase.caseId : 'LOADING...'}
                </span>
                <span className="text-[11px] text-[#292625] font-medium truncate max-w-[180px]">
                  ({activeCase ? activeCase.title : 'Select Case'})
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#292625] text-[18px] select-none">
              {dropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </div>

          {/* Real Cases Dropdown Menu — strictly drops DOWN */}
          {dropdownOpen && (
            <div className="case-dropdown-menu">
              <span className="case-dropdown-header">
                AVAILABLE BACKEND DOSSIERS ({casesList.length})
              </span>
              <div className="case-dropdown-list">
                {casesList.length === 0 ? (
                  <p className="text-[11px] text-[#756E69] px-2 py-2 italic">Loading backend cases...</p>
                ) : (
                  casesList.map(c => {
                    const isSelected = activeCase && activeCase.caseId === c.caseId;
                    return (
                      <div
                        key={c.caseId}
                        onClick={() => {
                          onSelectCase && onSelectCase(c);
                          setDropdownOpen(false);
                        }}
                        className={`case-dropdown-item ${isSelected ? 'active' : ''}`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="case-id">#{c.caseId}</span>
                          <span className="case-title line-clamp-1">{c.title}</span>
                        </div>
                        <span className="case-status shrink-0">
                          {c.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Investigation Status Pill */}
        <div className="hidden xl:flex items-center gap-1.5 header-live-badge px-2.5 py-1.5">
          <span className="w-2 h-2 rounded-none bg-[#2e7d32] animate-pulse"></span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#360112] font-bold tracking-wider">
            LIVE INVESTIGATION — {entityCount} ENTITIES / {relationshipCount} RELATIONS ({API_MODE.toUpperCase()} API)
          </span>
        </div>
      </div>

      {/* Global Functional Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="header-search-container">
          <div className="header-search-icon-box">
            <span className="material-symbols-outlined header-search-icon">
              search
            </span>
          </div>
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search entities (Rahul, P001, 9876543210, Sector 17, Global Apex)..."
            className="header-search-input"
          />
          <div className="header-search-actions">
            {searchQuery && (
              <button 
                onClick={() => onSearchChange && onSearchChange('')}
                className="header-search-clear-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
            <kbd className="header-search-kbd">
              CMD+K
            </kbd>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 header-tls-badge px-2.5 py-1.5">
          <span className="material-symbols-outlined text-[14px]">encrypted</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wide font-semibold">
            TLS 1.3 // E2EE
          </span>
        </div>

        <button
          className="header-ctrl-btn p-1.5 flex items-center"
          title="Quick Filters"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </button>

        <button
          className="header-ctrl-btn relative p-1.5 flex items-center"
          title="Alerts"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5449] rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
