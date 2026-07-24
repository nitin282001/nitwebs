export const API_BASE = import.meta.env.PROD
  ? "/api" 
  : "http://localhost:5000/api";

export const getApiUrl = (endpoint: string) => {
  return `${API_BASE}${endpoint}`;
};

export const getSubmitUrl = (endpoint: string) => {
  return `${API_BASE}${endpoint}`;
};

export const getUploadUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  
  const base = import.meta.env.PROD
    ? ""
    : "http://localhost:5000";
  return `${base}${url}`;
};

