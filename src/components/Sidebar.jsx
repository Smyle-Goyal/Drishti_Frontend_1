import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'hub' },
    { id: 'top-suspects', label: 'Top Suspects', icon: 'person_alert' },
    { id: 'file-ingestion', label: 'File Ingestion', icon: 'folder_open' },
    { id: 'ocr-ingestion', label: 'OCR Ingestion', icon: 'document_scanner' },
    { id: 'timeline', label: 'Timeline', icon: 'history_toggle_off' },
    { id: 'ai-copilot', label: 'AI Copilot', icon: 'psychology' },
    { id: 'settings', label: 'Settings', icon: 'tune' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#171d17] border-r border-[#444842]/30 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-3 flex items-center gap-2 border-b border-[#444842]/30 bg-[#0a100a]/60">
          <div className="w-7 h-7 bg-[#354234] flex items-center justify-center text-[#bccbb8]">
            <span className="material-symbols-outlined text-[18px]">security</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] text-[14px] font-bold uppercase tracking-wider text-[#bccbb8]">
              DRISHTI
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#8e928b]">
              CRIMINAL INTEL CORE
            </span>
          </div>
        </div>

        {/* Module Sub-bar */}
        <div className="px-3 py-1 border-b border-[#444842]/20 bg-[#171d17]/40 flex items-center justify-between">
          <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b]">
            NAVIGATION MODULES
          </span>
          <span className="font-['Space_Grotesk'] text-[11px] text-[#bbccae]">
            NODE_OS v4.2
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 text-left transition-colors font-['Space_Grotesk'] text-[14px] ${
                  isActive
                    ? 'bg-[#354234] text-[#9fae9c] font-semibold'
                    : 'text-[#c4c8c0] hover:bg-[#252c25] hover:text-[#dee4da]'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#bccbb8]' : 'text-[#8e928b]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Footer */}
      <div className="border-t border-[#444842]/30 bg-[#0a100a]/80 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#252c25] border border-[#444842] flex items-center justify-center text-[#bccbb8]">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-['Space_Grotesk'] text-[13px] font-semibold text-[#dee4da] truncate">
              Agent Maya Rao
            </span>
            <span className="text-[11px] text-[#c4c8c0] truncate">
              Sr. Criminal Intel Analyst
            </span>
          </div>
        </div>
        <div className="pt-2 border-t border-[#444842]/20 flex items-center justify-between">
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#8e928b]">
            CLEARANCE:
          </span>
          <span className="font-['Space_Grotesk'] text-[10px] bg-[#93000a]/40 text-[#ffb4ab] px-1.5 py-0.5 border border-[#ffb4ab]/30 uppercase font-semibold">
            LEVEL-4 / TOP SECRET
          </span>
        </div>
      </div>
    </aside>
  );
}
