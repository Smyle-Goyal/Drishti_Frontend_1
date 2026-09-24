import React, { useState, useEffect } from 'react';
import { getRecentFiles, uploadFile, deleteFile } from '../services/fileService';

export default function FileIngestionPage({ activeCase, onUploadSuccess, onNavigateToDashboard }) {
  const activeCaseId = activeCase ? activeCase.caseId : null;
  const [recentFiles, setRecentFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFiles = async (targetCaseId) => {
    const cId = targetCaseId || activeCaseId;
    if (!cId) {
      setLoadingFiles(false);
      return;
    }
    setLoadingFiles(true);
    setFetchError(null);
    try {
      const files = await getRecentFiles(cId);
      setRecentFiles(files);
    } catch (err) {
      console.error("Error fetching recent files from backend:", err);
      setFetchError(err.message || 'Failed to connect to backend document repository.');
      setRecentFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (activeCaseId) {
      // fetchFiles(activeCaseId);
    }
  }, [activeCaseId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!activeCaseId) {
      alert("No active case selected.");
      return;
    }

    setIsUploading(true);
    setUploadProgress({ stage: 'SELECTED', percent: 10, message: 'File selected. Uploading to DocumentController...' });

    try {
      const uploadRes = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      }, { caseId: activeCaseId });

      if (onUploadSuccess) {
        onUploadSuccess(uploadRes);
      }

      setUploadProgress({
        stage: 'PROCESSED & SYNCED',
        percent: 100,
        message: 'Document processed by NLP! Extracted entities have been synced to the Case Graph.',
        completed: true
      });
      setIsUploading(false);
    } catch (err) {
      console.error("File upload error:", err);
      setUploadProgress({ stage: 'FAILED', percent: 0, message: err.message || 'File upload failed.' });
      setIsUploading(false);
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    setDeletingId(fileId);
    try {
      // Execute real DELETE request to backend (Requirement #9)
      await deleteFile(fileId);
      // Re-fetch files list from backend after delete succeeds
      await fetchFiles();
    } catch (err) {
      console.error("File delete error:", err);
      alert(`Delete error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-['IBM_Plex_Sans'] text-[#dee4da]">
      {/* Header Banner */}
      <div className="bg-[#171d17] p-4 border border-[#444842]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#354234] text-[#bccbb8] font-bold">
              FILE INGESTION & OCR ENGINE
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-[#dee4da]">Evidence Document Ingestion Vault</h1>
          <p className="text-[12px] text-[#8e928b] mt-0.5">
            Upload FIR narrative reports, call detail records (CDR), and financial audits into the Drishti intelligence database.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Upload Dropzone Box */}
        <div className="bg-[#171d17] p-5 border border-[#444842]/30 space-y-4">
          <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#bccbb8] font-bold block">
            EVIDENCE UPLOAD DOCK
          </span>

          <div className="relative border border-dashed border-[#444842] hover:border-[#bccbb8] p-8 text-center bg-[#0a100a] transition-colors cursor-pointer group">
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="material-symbols-outlined text-[36px] text-[#bccbb8] mb-2 group-hover:scale-105 transition-transform">
              upload_file
            </span>
            <p className="font-['Space_Grotesk'] text-[13px] font-bold text-[#dee4da]">Browse or Drag Investigation File</p>
            <p className="text-[10px] text-[#8e928b] mt-1 font-['Space_Grotesk'] uppercase">PDF, DOCX, CSV, TXT (MAX 50MB)</p>
          </div>

          {/* Upload Progress Tracker */}
          {uploadProgress && (
            <div className={`p-3 bg-[#0a100a] border space-y-2 font-['Space_Grotesk'] ${uploadProgress.stage === 'FAILED' ? 'border-[#93000a]' : 'border-[#444842]/40'}`}>
              <div className="flex justify-between items-center text-[11px]">
                <span className={`font-bold uppercase ${uploadProgress.stage === 'FAILED' ? 'text-[#ffb4ab]' : 'text-[#bccbb8]'}`}>
                  {uploadProgress.stage}
                </span>
                <span className="text-[#8e928b]">{uploadProgress.percent}%</span>
              </div>
              <div className="w-full bg-[#1b211b] h-1.5 flex">
                <div 
                  className={`h-full transition-all duration-300 ${uploadProgress.stage === 'FAILED' ? 'bg-[#ffb4ab]' : 'bg-[#bccbb8]'}`}
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
              <p className={`text-[10px] ${uploadProgress.stage === 'FAILED' ? 'text-[#ffb4ab]' : 'text-[#c4c8c0]'}`}>
                {uploadProgress.message}
              </p>
              {uploadProgress.completed && onNavigateToDashboard && (
                <button
                  type="button"
                  onClick={onNavigateToDashboard}
                  className="mt-2 w-full py-2 bg-[#354234] hover:bg-[#435342] text-[#dee4da] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-[#bccbb8]/40"
                >
                  <span className="material-symbols-outlined text-[15px]">hub</span>
                  <span>View Updated Case Graph</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 
          INGESTED FILES SECTION (Temporarily commented out - section for now only contains file upload)
        <div className="lg:col-span-7 bg-[#171d17] p-5 border border-[#444842]/30 space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#bccbb8] font-bold">
              INGESTED EVIDENCE FILES
            </span>
            {!loadingFiles && !fetchError && (
              <span className="font-['Space_Grotesk'] text-[10px] text-[#8e928b]">{recentFiles.length} RECORDED</span>
            )}
          </div>

          {loadingFiles ? (
            <div className="p-10 text-center text-[#8e928b] font-['Space_Grotesk'] text-[12px] flex flex-col items-center justify-center gap-2 bg-[#0a100a] border border-[#444842]/30">
              <span className="material-symbols-outlined text-[24px] text-[#bccbb8] animate-spin">progress_activity</span>
              <span>Fetching documents from Drishti Repository API...</span>
            </div>
          ) : fetchError ? (
            <div className="p-6 bg-[#2a1616] border border-[#93000a] text-[#ffb4ab] font-['Space_Grotesk'] text-[12px] flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex items-center gap-2 font-bold text-[13px]">
                <span className="material-symbols-outlined text-[20px] text-[#ffb4ab]">warning</span>
                <span>Document Repository API Unavailable</span>
              </div>
              <p className="text-[11px] text-[#ffb4ab]/80 max-w-md">
                {fetchError}
              </p>
              <button
                onClick={fetchFiles}
                className="mt-1 px-3 py-1.5 bg-[#93000a] hover:bg-[#ffb4ab] hover:text-[#273426] text-[#ffffff] font-bold text-[11px] uppercase transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>RETRY CONNECTION</span>
              </button>
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="p-10 border border-dashed border-[#444842]/40 bg-[#0a100a] text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#8e928b]">folder_open</span>
              <p className="font-['Space_Grotesk'] text-[13px] font-bold text-[#dee4da]">No files uploaded yet</p>
              <p className="text-[11px] text-[#8e928b]">Use the Evidence Upload Dock to ingest FIR reports, CDR CSVs, or financial audits.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentFiles.map(file => (
                <div key={file.id} className="p-3 bg-[#0a100a] border border-[#444842]/30 flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#252c25] border border-[#444842]/40 flex items-center justify-center text-[#bccbb8]">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['Space_Grotesk'] font-bold text-[#dee4da]">{file.name}</span>
                      <span className="font-['Space_Grotesk'] text-[10px] text-[#8e928b]">
                        ID: {file.id} • {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadedAt ? file.uploadedAt.split('T')[0] : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-['Space_Grotesk'] text-[10px] bg-[#354234] text-[#bccbb8] px-2 py-0.5 uppercase font-semibold">
                      {file.status}
                    </span>
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deletingId === file.id}
                      title="Delete document"
                      className="p-1.5 text-[#8e928b] hover:text-[#ffb4ab] hover:bg-[#252c25] transition-colors disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${deletingId === file.id ? 'animate-spin' : ''}`}>
                        {deletingId === file.id ? 'progress_activity' : 'delete'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        */}
      </div>
    </div>
  );
}
