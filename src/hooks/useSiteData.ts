import { useEffect, useState } from "react";

import { getApiUrl } from "../lib/api";

export function useSiteData() {
  const [siteData, setSiteData] = useState<any>(() => {
    try {
      const cached = sessionStorage.getItem("nitwebs_site_data_cache");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(!siteData);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch(getApiUrl("/content"));
        if (!res.ok) throw new Error("API content failed");
        const data = await res.json();
        if (data?.logo?.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.getElementsByTagName("head")[0].appendChild(link);
          }
          link.href = data.logo.faviconUrl;
        }
        setSiteData(data);
        try {
          sessionStorage.setItem("nitwebs_site_data_cache", JSON.stringify(data));
        } catch (e) {}
      } catch (err) {
        console.warn("API offline or content empty. Using static content fallbacks.");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  return { siteData, loading, setSiteData };
}
