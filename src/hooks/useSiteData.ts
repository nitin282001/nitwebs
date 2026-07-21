import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

export function useSiteData() {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/content`);
        if (!res.ok) throw new Error("API content failed");
        const data = await res.json();
        setSiteData(data);
      } catch (err) {
        console.warn("Express backend API offline or content empty. Using static content fallbacks.");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  return { siteData, loading, setSiteData };
}
