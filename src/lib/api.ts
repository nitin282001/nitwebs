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
  let cleanUrl = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
  
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }
  
  if (!cleanUrl.startsWith("/")) {
    cleanUrl = "/" + cleanUrl;
  }

  const base = import.meta.env.PROD
    ? ""
    : "http://localhost:5000";
  return `${base}${cleanUrl}`;
};

