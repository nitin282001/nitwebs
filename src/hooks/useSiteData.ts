import { useSiteDataContext } from "../context/SiteDataContext";

// Backed by SiteDataProvider so every caller shares one fetch instead of
// each mount independently hitting the API.
export function useSiteData() {
  return useSiteDataContext();
}
