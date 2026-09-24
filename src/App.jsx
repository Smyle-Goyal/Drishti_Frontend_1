import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './components/DashboardPage';
import FileIngestionPage from './components/FileIngestionPage';
import TimelinePage from './components/TimelinePage';
import AICopilotPage from './components/AICopilotPage';
import HandwrittenDocumentScanner from './components/HandwrittenDocumentScanner';
import TopSuspectsPage from './components/TopSuspectsPage';
import SettingsPage from './components/SettingsPage';

import { getInvestigationData, registerUploadedNlpResult } from './services/investigationService';
import { getCases } from './services/caseService';

export default function App() {
  // Navigation State for the 5 Stitch Pages: 'dashboard' | 'file-ingestion' | 'timeline' | 'ai-copilot' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [investigationData, setInvestigationData] = useState({ entities: [], relationships: [], events: [] });
  const [casesList, setCasesList] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [aiTargetQuery, setAiTargetQuery] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastDataRefresh, setLastDataRefresh] = useState(() => Date.now());

  // Load real API cases on mount
  useEffect(() => {
    async function loadApiData() {
      try {
        const cases = await getCases();
        if (Array.isArray(cases) && cases.length > 0) {
          setCasesList(cases);
          setActiveCase(cases[0]);
        }
      } catch (err) {
        console.error("Error loading API data in App.jsx:", err);
      }
    }
    loadApiData();
  }, []);

  // Sync Header telemetry counts whenever activeCase changes
  useEffect(() => {
    if (!activeCase?.caseId) return;
    async function syncCaseData() {
      try {
        const data = await getInvestigationData({ caseId: activeCase.caseId });
        setInvestigationData(data);
      } catch (err) {
        console.warn("Could not sync Header counts for case:", activeCase.caseId, err.message);
      }
    }
    syncCaseData();
  }, [activeCase]);

  // Handler: Select a different case from Header dropdown
  const handleSelectCase = (selectedCase) => {
    setActiveCase(selectedCase);
  };

  // Handler: Navigate from Dashboard "Know More with AI" to AI Copilot page with entity context
  const handleSelectTargetForAI = (entity) => {
    setAiTargetQuery(entity);
    setActiveTab('ai-copilot');
  };

  // Handler: Navigate from Top Suspects leaderboard to AI Copilot page
  const handleInvestigateSuspect = (suspect) => {
    setAiTargetQuery({
      name: suspect.name,
      id: suspect.person_id
    });
    setActiveTab('ai-copilot');
  };

  // Handler: Handle real-time file upload success to sync NLP extractions to graph
  const handleUploadSuccess = async (uploadRes) => {
    if (uploadRes?.nlpResult && activeCase?.caseId) {
      registerUploadedNlpResult(activeCase.caseId, uploadRes.nlpResult);
    }
    // Immediately refresh investigationData for Header telemetry counts
    if (activeCase?.caseId) {
      try {
        const updated = await getInvestigationData({ caseId: activeCase.caseId });
        setInvestigationData(updated);
      } catch (e) {}
    }
    setLastDataRefresh(Date.now());
  };

  return (
    <div className="bg-[#0f150f] min-h-screen text-[#dee4da] font-['IBM_Plex_Sans'] antialiased selection:bg-[#354234] selection:text-[#dee4da]">
      {/* Fixed Left Sidebar (Stitch Design) */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Fixed Top Header (Stitch Design with Real Case Switcher & Search) */}
        <Header 
          entityCount={investigationData.entities.length}
          relationshipCount={investigationData.relationships.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCase={activeCase}
          casesList={casesList}
          onSelectCase={handleSelectCase}
        />

        {/* Main Content Area switching between the 5 Stitch Pages */}
        <main className="relative pt-14 bg-[#0f150f] flex-1 w-full">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              searchQuery={searchQuery}
              onSelectTargetForAI={handleSelectTargetForAI}
              activeCase={activeCase}
              lastDataRefresh={lastDataRefresh}
            />
          )}

          {activeTab === 'top-suspects' && (
            <TopSuspectsPage 
              activeCaseId={activeCase?.caseId}
              onInvestigateSuspect={handleInvestigateSuspect}
            />
          )}

          {activeTab === 'file-ingestion' && (
            <FileIngestionPage 
              activeCase={activeCase}
              onUploadSuccess={handleUploadSuccess}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'ocr-ingestion' && (
            <HandwrittenDocumentScanner 
              activeCaseId={activeCase?.caseId || 'CASE-HAWALA-2026'}
              onOpenInCopilot={(prompt) => {
                setAiTargetQuery({ name: prompt, id: 'OCR_EVIDENCE' });
                setActiveTab('ai-copilot');
              }}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelinePage 
              activeCaseId={activeCase?.caseId}
            />
          )}

          {activeTab === 'ai-copilot' && (
            <AICopilotPage 
              targetEntity={aiTargetQuery}
              activeCaseId={activeCase?.caseId}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
}
