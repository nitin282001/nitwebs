import { useEffect, useState } from "react";

import { getApiUrl } from "../lib/api";
import { DEFAULT_SITE_DATA } from "../lib/defaultSiteData";

export function useSiteData() {
  const [siteData, setSiteData] = useState<any>(() => {
    try {
      const sessionCached = sessionStorage.getItem("nitwebs_site_data_cache");
      if (sessionCached) return JSON.parse(sessionCached);
      const localCached = localStorage.getItem("nitwebs_site_data_cache");
      if (localCached) return JSON.parse(localCached);
      return DEFAULT_SITE_DATA;
    } catch (e) {
      return DEFAULT_SITE_DATA;
    }
  });
  const [loading, setLoading] = useState(!siteData);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 1500);

    const loadContent = async () => {
      try {
        const res = await fetch(getApiUrl("/content"), { signal: controller.signal });
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
          localStorage.setItem("nitwebs_site_data_cache", JSON.stringify(data));
        } catch (e) {}
      } catch (err) {
        console.warn("API offline or slow. Using static content fallbacks.");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    loadContent();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return { siteData, loading, setSiteData };
}
