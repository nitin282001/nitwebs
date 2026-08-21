import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { getApiUrl } from "../lib/api";
import { DEFAULT_SITE_DATA } from "../lib/defaultSiteData";

const CONTENT_CACHE_KEY = "nitwebs_site_data_cache";
const NAV_CACHE_KEY = "nitwebs_nav_data_cache";
const FOOTER_CACHE_KEY = "nitwebs_footer_data_cache";

function readCache(key: string): any {
  try {
    const cached = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return null;
}

function writeCache(key: string, data: unknown) {
  try {
    const json = JSON.stringify(data);
    sessionStorage.setItem(key, json);
    localStorage.setItem(key, json);
  } catch (e) {}
}

// Retries a flaky/overloaded API response before giving up. Hostinger shared
// hosting intermittently returns 503s under concurrent load, and a single
// failed attempt used to mean permanently showing placeholder content.
async function fetchWithRetry(url: string, attempts = 3, delayMs = 600, timeoutMs = 8000): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { "Cache-Control": "no-cache" } });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

interface SiteDataContextValue {
  siteData: any;
  navData: any;
  footerData: any;
  loading: boolean;
  setSiteData: (data: any) => void;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<any>(() => readCache(CONTENT_CACHE_KEY) || DEFAULT_SITE_DATA);
  const [navData, setNavData] = useState<any>(() => readCache(NAV_CACHE_KEY));
  const [footerData, setFooterData] = useState<any>(() => readCache(FOOTER_CACHE_KEY));
  const [loading, setLoading] = useState(true);
  const fetchedOnce = useRef(false);

  useEffect(() => {
    // Guards against React re-running effects (e.g. route-driven remounts of
    // the provider's subtree) firing this fetch trio more than once.
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    fetchWithRetry(getApiUrl("/content"))
      .then((data) => {
        setSiteData(data);
        writeCache(CONTENT_CACHE_KEY, data);
        if (data?.logo?.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.getElementsByTagName("head")[0].appendChild(link);
          }
          link.href = data.logo.faviconUrl;
        }
      })
      .catch(() => {
        console.warn("Content API unreachable after retries. Using cached/static fallback.");
      })
      .finally(() => setLoading(false));

    fetchWithRetry(getApiUrl("/nav"))
      .then((data) => {
        setNavData(data);
        writeCache(NAV_CACHE_KEY, data);
      })
      .catch(() => {
        console.warn("Nav API unreachable after retries. Using cached/static fallback.");
      });

    fetchWithRetry(getApiUrl("/footer"))
      .then((data) => {
        setFooterData(data);
        writeCache(FOOTER_CACHE_KEY, data);
      })
      .catch(() => {
        console.warn("Footer API unreachable after retries. Using cached/static fallback.");
      });
  }, []);

  return (
    <SiteDataContext.Provider value={{ siteData, navData, footerData, loading, setSiteData }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteDataContext() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error("useSiteDataContext must be used within a SiteDataProvider");
  }
  return ctx;
}
