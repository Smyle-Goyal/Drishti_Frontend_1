// Mock File Management API Service
// Simulates multi-stage async upload pipeline & file repository operations

import { mockFileStore } from './mockDataStore';

export async function fetchRecentFiles() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(mockFileStore));
}

export async function uploadFileMock(file, onProgress) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Stage 1: File Selected & Validation
  if (onProgress) onProgress({ stage: 'VALIDATING', percent: 15, message: 'Validating document format and security headers...' });
  await new Promise(resolve => setTimeout(resolve, 400));

  // Stage 2: Uploading payload
  if (onProgress) onProgress({ stage: 'UPLOADING', percent: 45, message: 'Streaming file payload to secure storage vault...' });
  await new Promise(resolve => setTimeout(resolve, 600));

  // Stage 3: Virus scan & AI Processing
  if (onProgress) onProgress({ stage: 'PROCESSING', percent: 80, message: 'Running Drishti OCR & Entity extraction scanner...' });
  await new Promise(resolve => setTimeout(resolve, 700));

  // Stage 4: Completed
  const newFileEntry = {
    id: `FILE_${Date.now().toString().slice(-4)}`,
    name: file.name || "Uploaded_Evidence_Document.pdf",
    size: file.size || 1024000,
    uploadedAt: new Date().toISOString(),
    status: "Completed",
    type: file.type || "application/pdf"
  };

  mockFileStore.unshift(newFileEntry);

  if (onProgress) onProgress({ stage: 'COMPLETED', percent: 100, message: 'File successfully ingested into case record!' });

  return JSON.parse(JSON.stringify(newFileEntry));
}

export async function deleteFileMock(fileId) {
  await new Promise(resolve => setTimeout(resolve, 400));

  const idx = mockFileStore.findIndex(f => f.id === fileId);
  if (idx === -1) {
    throw new Error(`File with ID '${fileId}' not found in database.`);
  }

  mockFileStore.splice(idx, 1);
  return { success: true, deletedId: fileId };
}
