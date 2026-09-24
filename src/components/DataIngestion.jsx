import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Truck, 
  DollarSign, 
  User, 
  RefreshCw,
  Trash2,
  Loader2,
  FileUp,
  AlertCircle
} from 'lucide-react';
import { extractEntitiesFromText, extractRelationshipsFromText } from '../utils/nlpEngine';
//import { SAMPLE_DOCUMENTS } from '../data/mockData';
import { getRecentFiles, uploadFile, deleteFile } from '../services/fileService';

export default function DataIngestion({ onIngestNewGraphData }) {
  const [selectedDocId, setSelectedDocId] = useState('doc1');
  const [rawText, setRawText] = useState(SAMPLE_DOCUMENTS[0].content);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [extractedResult, setExtractedResult] = useState(null);

  // File Upload State & Recent Files API State (Requirement #6)
  const [recentFiles, setRecentFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [fileProgress, setFileProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch Recent Files from API Service on Mount
  const fetchFilesFromApi = async () => {
    setLoadingFiles(true);
    setFetchError(null);
    try {
      const files = await getRecentFiles();
      setRecentFiles(files);
    } catch (err) {
      console.error("Failed to fetch recent files:", err);
      setFetchError(err.message || "Failed to fetch files from server.");
      setRecentFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFilesFromApi();
  }, []);

  // Handle Real File Input Upload via Async File API Service (Requirement #6)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setFileProgress({ stage: 'SELECTED', percent: 5, message: 'File selected. Initializing API upload...' });

    try {
      await uploadFile(file, (progress) => {
        setFileProgress(progress);
      });
      // Refresh Recent Files from Service after upload succeeds
      await fetchFilesFromApi();
      setTimeout(() => {
        setFileProgress(null);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setFileProgress({ stage: 'FAILED', percent: 0, message: err.message || 'File upload failed.' });
      setIsUploading(false);
    }
  };

  // Handle File Deletion via Async File API Service (Requirement #6)
  const handleDeleteFile = async (fileId) => {
    setDeletingId(fileId);
    try {
      // Call mock delete API first
      await deleteFile(fileId);
      // Re-fetch files from service only after API succeeds
      await fetchFilesFromApi();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectSample = (doc) => {
    setSelectedDocId(doc.id);
    setRawText(doc.content);
    setExtractedResult(null);
  };

  const handleProcessNLP = () => {
    setIsProcessing(true);
    setProcessingStep(1);
    setExtractedResult(null);

    // Multi-stage AI Extraction Pipeline simulation
    setTimeout(() => { setProcessingStep(2); }, 600);
    setTimeout(() => { setProcessingStep(3); }, 1200);

    setTimeout(() => {
      const entities = extractEntitiesFromText(rawText);
      const relationships = extractRelationshipsFromText(rawText, entities);
      setExtractedResult({ entities, relationships });
      setIsProcessing(false);
      setProcessingStep(4);
    }, 1800);
  };

  const handleInjectToGraph = () => {
    if (!extractedResult) return;
    onIngestNewGraphData(extractedResult);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100 font-outfit">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[11px] border border-sky-500/30">
              MODULE 2: MULTI-SOURCE INGESTION & FILE API
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">AI Entity & File Ingestion Service</h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload document evidence via asynchronous File API or extract entities directly using Drishti NLP.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px]">FILE API SERVICE</span>
            <span className="font-semibold text-emerald-400 font-mono">Mock API Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Documents & File Upload */}
        <div className="lg:col-span-6 space-y-4">
          {/* File Upload Box (Requirement #6) */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileUp className="w-4 h-4 text-emerald-400" /> Upload Case File via Mock File API
            </h3>

            <div className="relative border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-xl p-6 text-center bg-slate-950/60 transition cursor-pointer group">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-sky-400 mx-auto mb-2 group-hover:scale-110 transition" />
              <p className="text-xs font-semibold text-slate-200">Click or drag FIR document to upload</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Supports PDF, DOCX, CSV, TXT files</p>
            </div>

            {/* Asynchronous Upload Progress Monitor (Requirement #6) */}
            {fileProgress && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-sky-400 font-bold">{fileProgress.stage}</span>
                  <span className="text-slate-400">{fileProgress.percent}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${fileProgress.percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-300 font-mono">{fileProgress.message}</p>
              </div>
            )}
          </div>

          {/* Sample Selector & Text Area */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" /> Or Select Sample Narrative Document
            </label>

            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_DOCUMENTS.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectSample(doc)}
                  className={`p-3 rounded-xl text-left border text-xs transition-all ${
                    selectedDocId === doc.id
                      ? 'bg-sky-500/15 border-sky-500/50 text-sky-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-100">{doc.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{doc.date}</span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono block">{doc.type}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Raw Crime Narrative Text
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste narrative text here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={handleProcessNLP}
              disabled={isProcessing || !rawText.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
                  <span>Running Drishti NLP Extractor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Run Drishti AI Entity & Relationship Extractor</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Recent Files via API Service & Extracted Output */}
        <div className="lg:col-span-6 space-y-4">
          {/* RECENT FILES PANEL (Requirement #6) */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" /> Recent Files (Fetched via File API Service)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{recentFiles.length} files</span>
            </div>

            {loadingFiles ? (
              <div className="p-6 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Loading recent files from backend API...</span>
              </div>
            ) : fetchError ? (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 space-y-2 text-center">
                <p className="font-semibold">{fetchError}</p>
                <button
                  onClick={fetchFilesFromApi}
                  className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white font-mono text-[11px] rounded"
                >
                  Retry Connection
                </button>
              </div>
            ) : recentFiles.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center italic">No files uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {recentFiles.map(file => (
                  <div key={file.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-100 block">{file.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {file.id} • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                        {file.status}
                      </span>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={deletingId === file.id}
                        title="Delete file via File API"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition disabled:opacity-50"
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extracted NLP Results */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Discovered NLP Entities & Relationships
            </h3>

            {extractedResult ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                    Extracted Entities (NER)
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                        <User className="w-3 h-3 text-rose-400" /> Persons:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {extractedResult.entities.persons.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[11px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3 text-sky-400" /> Phones:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {extractedResult.entities.phones.map(ph => (
                          <span key={ph} className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-mono text-[11px]">
                            {ph}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleInjectToGraph}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                >
                  <Database className="w-4 h-4" />
                  <span>Inject Extracted Intelligence into Main Knowledge Graph</span>
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">Click "Run Drishti AI Extractor" to analyze raw narrative text.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
