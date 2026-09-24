// Real Document & File Management API Handler
// Controller: com.project.tekathon.drishti.controller.DocumentController

import { apiClient } from '../client.js';

// POST /api/cases/{caseId}/documents/upload
// Form parameter: 'file' (MultipartFile, Required)
export async function uploadDocumentReal(file, options = {}) {
  const caseId = options.caseId;
  if (!caseId) {
    throw new Error('Missing active case ID for document upload.');
  }
  const formData = new FormData();
  formData.append('file', file); // Exact field name 'file' from DocumentController spec!
  
  if (options.documentType) formData.append('documentType', options.documentType);
  if (options.title) formData.append('title', options.title || file.name);
  if (options.source) formData.append('source', options.source);

  return await apiClient(`/api/cases/${caseId}/documents/upload`, {
    method: 'POST',
    body: formData,
    isFormData: true
  });
}

// GET /api/cases/{caseId}/documents
export async function fetchRecentDocumentsReal(caseId) {
  if (!caseId) {
    throw new Error('Missing active case ID to fetch documents.');
  }
  return await apiClient(`/api/cases/${caseId}/documents`);
}

// GET /api/documents/{documentId}
export async function fetchDocumentByIdReal(documentId) {
  return await apiClient(`/api/documents/${documentId}`);
}

// DELETE /api/documents/{documentId}
export async function deleteDocumentReal(documentId) {
  return await apiClient(`/api/documents/${documentId}`, {
    method: 'DELETE'
  });
}
