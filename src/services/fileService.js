// File Management Service Abstraction
// Controller: com.project.tekathon.drishti.controller.DocumentController

import {
  uploadDocumentReal,
  fetchRecentDocumentsReal,
  deleteDocumentReal
} from '../api/real/realFileApi.js';

export async function getRecentFiles(caseId) {
  const docs = await fetchRecentDocumentsReal(caseId);
  if (!Array.isArray(docs)) {
    return [];
  }
  return docs.map(doc => ({
    id: doc.documentId || doc.id,
    name: doc.title || doc.fileName || doc.name || `Document_${doc.documentId || doc.id}`,
    size: doc.fileSize || doc.size || 1024000,
    uploadedAt: doc.createdAt || doc.uploadedAt || new Date().toISOString(),
    status: doc.status || 'Completed',
    type: doc.documentType || doc.type || 'application/pdf'
  }));
}

export async function uploadFile(file, onProgress, options = {}) {
  if (onProgress) onProgress({ stage: 'UPLOADING', percent: 30, message: 'Uploading document to backend DocumentController API...' });
  const res = await uploadDocumentReal(file, {
    caseId: options.caseId,
    title: file.name,
    documentType: options.documentType || file.type
  });
  if (onProgress) onProgress({ stage: 'COMPLETED', percent: 100, message: 'Document successfully processed by backend!' });
  return {
    id: res.documentId || res.id,
    name: res.title || res.fileName || file.name,
    size: file.size,
    uploadedAt: res.createdAt || new Date().toISOString(),
    status: res.status || 'Completed',
    type: res.documentType || file.type,
    nlpResult: res.nlpResult || null,
    rawResponse: res
  };
}

export async function deleteFile(fileId) {
  await deleteDocumentReal(fileId);
  return { success: true, deletedId: fileId };
}
