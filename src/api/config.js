// Global API Configuration
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

export const API_MODE = env.VITE_API_MODE || 'real';
export const API_BASE_URL = env.VITE_API_BASE_URL ;
export const AGENT_API_BASE_URL = env.VITE_AGENT_API_BASE_URL || 'http://localhost:8000';
//export const API_KEY = env.VITE_API_KEY || '';
