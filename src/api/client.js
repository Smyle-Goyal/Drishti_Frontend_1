// Central Reusable HTTP API Client for Drishti Backend
// Connects to Spring Boot controllers using exact backend API specification

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) || 'http://localhost:8080';
const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) || (typeof process !== 'undefined' && process.env && process.env.VITE_API_KEY) || '';

export async function apiClient(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, isFormData = false, queryParams = {} } = options;

  // Construct URL with query parameters
  let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.append(key, val);
    }
  });
  const queryString = searchParams.toString();
  if (queryString) {
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  // Construct headers
  const requestHeaders = { 
    'ngrok-skip-browser-warning': 'true',
    ...headers 
  };
  if (!isFormData && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  if (API_KEY) {
    requestHeaders['Authorization'] = `Bearer ${API_KEY}`;
  }

  // Request options
  const fetchOptions = {
    method,
    headers: requestHeaders
  };

  if (body) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (response.status === 204) {
    return { success: true };
  }

  if (!response.ok) {
    let errorDetails = response.statusText;
    try {
      const errJson = await response.json();
      errorDetails = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch (e) {
      // payload was not JSON
    }
    const error = new Error(`API Error ${response.status}: ${errorDetails}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}
