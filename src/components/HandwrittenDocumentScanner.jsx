import React, { useState } from 'react';
import { AGENT_API_BASE_URL } from '../api/config';

export default function HandwrittenDocumentScanner({ activeCaseId = 'CASE-HAWALA-2026', onOpenInCopilot }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('HANDWRITTEN_NOTE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError('Invalid file format. Please upload a PDF, PNG, or JPG document.');
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', activeCaseId || 'CASE-HAWALA-2026');
    formData.append('document_id', `DOC_NOTE_${Date.now()}`);
    formData.append('document_type', documentType);

    try {
      const res = await fetch(`${AGENT_API_BASE_URL}/agent/process-handwritten`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData,
      });

      if (!res.ok) {
        let errText = res.statusText;
        try {
          const errJson = await res.json();
          errText = errJson.detail || errJson.message || errJson.error || JSON.stringify(errJson);
        } catch (e) {}
        throw new Error(`Server returned status ${res.status}: ${errText}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Handwritten OCR error:', err);
      setError(err.message || 'Failed to process handwritten document.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (result?.transcribed_text) {
      navigator.clipboard.writeText(result.transcribed_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInCopilot = () => {
    if (onOpenInCopilot && result) {
      const summary = result.investigative_summary || result.transcribed_text?.slice(0, 200);
      const queryPrompt = `Analyze forensic handwritten evidence from document ${result.filename || result.document_id}: ${summary}`;
      onOpenInCopilot(queryPrompt);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-['IBM_Plex_Sans'] text-[#dee4da]">
      {/* Header Banner */}
      <div className="bg-[#171d17] p-5 border border-[#444842]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#354234] text-[#bccbb8] font-bold">
              FORENSIC VISION AI • OCR ENGINE
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] bg-[#252c25] border border-[#444842]/40 text-[#8e928b] px-2 py-0.5 font-mono">
              CASE: {activeCaseId || 'CASE-HAWALA-2026'}
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-[#dee4da]">
            Handwritten Evidence Analyzer & OCR Scanner
          </h1>
          <p className="text-[12px] text-[#8e928b] mt-0.5">
            Upload seized chits, confession diaries, and handwritten notes for Vision AI transcription, entity parsing, and case database sync.
          </p>
        </div>

        {result && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#252c25] hover:bg-[#354234] text-[#bccbb8] border border-[#444842]/40 text-[12px] font-['Space_Grotesk'] font-bold uppercase transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Scan Another Document</span>
          </button>
        )}
      </div>

      {/* Upload State Card (when no result yet or resetting) */}
      {!result && (
        <div className="bg-[#171d17] p-6 border border-[#444842]/30 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[12px] uppercase tracking-wider text-[#bccbb8] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              EVIDENCE DOCUMENT DROPZONE
            </span>
            <span className="text-[11px] text-[#8e928b] font-['Space_Grotesk'] uppercase">
              PDF, PNG, JPG (MAX 25MB)
            </span>
          </div>

          {/* Document Type Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <label className="text-[11px] font-['Space_Grotesk'] uppercase tracking-wider text-[#8e928b] min-w-[120px]">
              Document Type:
            </label>
            <div className="flex flex-wrap gap-2 flex-1">
              {[
                { id: 'HANDWRITTEN_NOTE', label: 'Handwritten Note' },
                { id: 'SEIZED_SLIP', label: 'Seized Hawala Slip' },
                { id: 'CASE_DIARY', label: 'Case Diary Entry' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDocumentType(t.id)}
                  className={`px-2.5 py-1 text-[11px] font-['Space_Grotesk'] uppercase transition-colors border ${
                    documentType === t.id
                      ? 'bg-[#354234] border-[#bccbb8] text-[#dee4da] font-bold'
                      : 'bg-[#0a100a] border-[#444842]/30 text-[#8e928b] hover:text-[#c4c8c0]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            className={`relative border-2 border-dashed p-8 text-center transition-colors cursor-pointer group ${
              isDragOver
                ? 'border-[#bccbb8] bg-[#1b251b]'
                : file
                ? 'border-[#354234] bg-[#0d140d]'
                : 'border-[#444842] hover:border-[#bccbb8] bg-[#0a100a]'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className={`material-symbols-outlined text-[44px] mb-2 transition-transform group-hover:scale-105 ${
              file ? 'text-[#9fae9c]' : 'text-[#8e928b]'
            }`}>
              {file ? 'task' : 'upload_file'}
            </span>
            <p className="font-['Space_Grotesk'] text-[14px] font-bold text-[#dee4da]">
              {file ? file.name : 'Drag and drop handwritten document, or click to browse'}
            </p>
            <p className="text-[11px] text-[#8e928b] mt-1 font-['Space_Grotesk']">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB • Ready for Forensic Extraction`
                : 'Supports PDF, PNG, JPG files containing handwritten notes, chits, and ledgers'}
            </p>
          </div>

          {/* Action Button / Progress */}
          {loading ? (
            <div className="p-4 bg-[#0a100a] border border-[#444842]/40 space-y-3">
              <div className="flex items-center justify-between text-[12px] font-['Space_Grotesk']">
                <span className="text-[#bccbb8] font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Analyzing handwriting with Forensic Vision AI...
                </span>
                <span className="text-[#8e928b]">Ollama Vision Inference</span>
              </div>
              <div className="w-full bg-[#1b211b] h-1.5 overflow-hidden">
                <div className="bg-[#bccbb8] h-full w-full animate-pulse" />
              </div>
              <p className="text-[11px] text-[#8e928b]">
                Reading stroke trajectories, transcribing text, parsing suspects, hawala amounts, and bank accounts...
              </p>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full py-3 bg-[#354234] hover:bg-[#435342] disabled:opacity-40 disabled:hover:bg-[#354234] text-[#dee4da] font-['Space_Grotesk'] text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">biometrics</span>
              <span>Scan & Extract Intelligence</span>
            </button>
          )}

          {error && (
            <div className="p-4 bg-[#2a1616] border border-[#93000a] text-[#ffb4ab] text-[12px] font-['Space_Grotesk'] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-[#ffb4ab] mt-0.5">error</span>
              <div>
                <strong className="block font-bold">Extraction Error:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results State (Side-by-Side Breakdown) */}
      {result && (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="p-4 bg-[#141d14] border border-[#354234] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-[13px] text-[#bccbb8] font-['Space_Grotesk']">
              <span className="material-symbols-outlined text-[20px] text-[#9fae9c]">verified</span>
              <span className="font-bold">Document Processed & Indexed in Vector DB</span>
              {result.document_id && (
                <span className="text-[11px] bg-[#252c25] px-2 py-0.5 text-[#8e928b] font-mono border border-[#444842]/30">
                  {result.document_id}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] font-['Space_Grotesk']">
              {result.confidence_score !== undefined && (
                <span className="bg-[#252c25] text-[#bccbb8] border border-[#444842]/40 px-2.5 py-1 font-bold">
                  CONFIDENCE: {(result.confidence_score * 100).toFixed(0)}%
                </span>
              )}
              {result.db_sync?.status && (
                <span className="bg-[#1b251b] text-[#9fae9c] border border-[#354234] px-2 py-1 uppercase font-semibold">
                  DB SYNC: {result.db_sync.status}
                </span>
              )}
            </div>
          </div>

          {/* Side-by-Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel: Verbatim Transcription */}
            <div className="lg:col-span-6 bg-[#171d17] p-5 border border-[#444842]/30 space-y-3 flex flex-col">
              <div className="flex justify-between items-center pb-2 border-b border-[#444842]/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#bccbb8]">history_edu</span>
                  <h3 className="font-['Space_Grotesk'] text-[13px] font-bold text-[#dee4da] uppercase tracking-wider">
                    Verbatim OCR Transcription
                  </h3>
                </div>
                <button
                  onClick={handleCopyText}
                  className="px-2.5 py-1 bg-[#252c25] hover:bg-[#354234] text-[#bccbb8] border border-[#444842]/40 text-[11px] font-['Space_Grotesk'] font-bold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex-1 bg-[#0a100a] p-4 border border-[#444842]/30 overflow-y-auto max-h-[380px]">
                <pre className="text-[12px] leading-relaxed text-[#dee4da] whitespace-pre-wrap font-mono select-text">
                  {result.transcribed_text || 'No transcribed text returned.'}
                </pre>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#8e928b] font-['Space_Grotesk']">
                <span>FILE: {result.filename || file?.name || 'Document'}</span>
                <span>TYPE: {result.document_type || documentType}</span>
              </div>
            </div>

            {/* Right Panel: Extracted Forensic Entities */}
            <div className="lg:col-span-6 bg-[#171d17] p-5 border border-[#444842]/30 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#444842]/20">
                <span className="material-symbols-outlined text-[18px] text-[#bccbb8]">fingerprint</span>
                <h3 className="font-['Space_Grotesk'] text-[13px] font-bold text-[#dee4da] uppercase tracking-wider">
                  Extracted Forensic Entities
                </h3>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {/* Suspects & Persons */}
                {result.extracted_entities?.persons?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8e928b] font-['Space_Grotesk'] font-bold block">
                      Suspects & Persons ({result.extracted_entities.persons.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.extracted_entities.persons.map((p, i) => (
                        <div key={i} className="p-2 bg-[#0a100a] border border-[#444842]/40 text-[11px] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#bccbb8]">person</span>
                          <span className="font-['Space_Grotesk'] font-bold text-[#dee4da]">{p.name || p}</span>
                          {p.role && (
                            <span className="text-[10px] bg-[#354234] text-[#9fae9c] px-1.5 py-0.2 rounded uppercase">
                              {p.role}
                            </span>
                          )}
                          {p.notes && <span className="text-[10px] text-[#8e928b]">({p.notes})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monetary Amounts / Hawala */}
                {result.extracted_entities?.monetary_amounts?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8e928b] font-['Space_Grotesk'] font-bold block">
                      Financial Amounts / Hawala ({result.extracted_entities.monetary_amounts.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.extracted_entities.monetary_amounts.map((m, i) => (
                        <div key={i} className="p-2 bg-[#0a100a] border border-[#354234] text-[11px] font-mono flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#9fae9c]">payments</span>
                          <span className="text-[#9fae9c] font-bold">
                            ₹{m.amount || m} {m.currency}
                          </span>
                          {m.context && <span className="text-[10px] text-[#8e928b] font-['Space_Grotesk']">({m.context})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bank Accounts */}
                {result.extracted_entities?.bank_accounts?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8e928b] font-['Space_Grotesk'] font-bold block">
                      Bank Accounts ({result.extracted_entities.bank_accounts.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.extracted_entities.bank_accounts.map((acc, i) => (
                        <div key={i} className="p-2 bg-[#0a100a] border border-[#444842]/40 text-[11px] font-mono flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#bccbb8]">account_balance</span>
                          <span className="text-[#dee4da] font-bold">{acc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicles */}
                {result.extracted_entities?.vehicles?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8e928b] font-['Space_Grotesk'] font-bold block">
                      Vehicles ({result.extracted_entities.vehicles.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.extracted_entities.vehicles.map((v, i) => (
                        <div key={i} className="p-2 bg-[#0a100a] border border-[#444842]/40 text-[11px] font-mono flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#bccbb8]">directions_car</span>
                          <span className="text-[#dee4da]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phones */}
                {result.extracted_entities?.phone_numbers?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8e928b] font-['Space_Grotesk'] font-bold block">
                      Phone Numbers ({result.extracted_entities.phone_numbers.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.extracted_entities.phone_numbers.map((ph, i) => (
                        <div key={i} className="p-2 bg-[#0a100a] border border-[#444842]/40 text-[11px] font-mono flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#bccbb8]">call</span>
                          <span className="text-[#dee4da]">{ph}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations & Dates */}
                {(result.extracted_entities?.locations?.length > 0 || result.extracted_entities?.dates?.length > 0) && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8e928b] font-['Space_Grotesk'] font-bold block">
                      Locations & Timestamps
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(result.extracted_entities.locations || []).map((loc, i) => (
                        <div key={`loc-${i}`} className="p-2 bg-[#0a100a] border border-[#444842]/40 text-[11px] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#bccbb8]">location_on</span>
                          <span className="text-[#dee4da]">{loc}</span>
                        </div>
                      ))}
                      {(result.extracted_entities.dates || []).map((d, i) => (
                        <div key={`date-${i}`} className="p-2 bg-[#0a100a] border border-[#444842]/40 text-[11px] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#8e928b]">calendar_today</span>
                          <span className="text-[#dee4da]">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Card: Investigative Summary & Action Buttons */}
          {result.investigative_summary && (
            <div className="bg-[#171d17] p-5 border border-[#354234] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 max-w-3xl">
                <span className="text-[10px] font-['Space_Grotesk'] uppercase tracking-wider text-[#9fae9c] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AI Investigative Summary & Forensic Assessment
                </span>
                <p className="text-[13px] text-[#dee4da] leading-relaxed">
                  {result.investigative_summary}
                </p>
              </div>

              {onOpenInCopilot && (
                <button
                  onClick={handleOpenInCopilot}
                  className="px-4 py-2.5 bg-[#354234] hover:bg-[#435342] text-[#dee4da] font-['Space_Grotesk'] text-[12px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 border border-[#bccbb8]/40"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Investigate with Copilot</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
