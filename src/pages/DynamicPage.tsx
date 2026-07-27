import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { getApiUrl } from "../lib/api";
import Footer from "../components/Footer";
import GridLines from "../components/GridLines";
import NotFound from "./NotFound";
import { useSiteData } from "../hooks/useSiteData";
import SectionRenderer from "../sections/SectionRenderer";

import { updatePageSEO } from "../lib/seo";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { siteData } = useSiteData();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (page?.title) {
      updatePageSEO({
        title: page.title,
        description: page.meta_desc || page.metaDesc,
        image: page.meta_image || page.metaImage,
        canonicalUrl: window.location.href
      });
    }
  }, [page]);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(getApiUrl(`/pages/${slug}`));
        if (!res.ok) {
          throw new Error("Page not found");
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((p: any) => p.slug === slug);
          if (found) {
            setPage(found);
          } else {
            setError(true);
          }
        } else if (data && (data.title || data.sections)) {
          setPage(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalScroll > 0 ? window.scrollY / totalScroll : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (page) {
      document.title = `${page.title} — Nitwebs`;
      if (page.metaDesc) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", page.metaDesc);
      }
    }
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return <NotFound />;
  }

  return (
    <div className="relative isolate w-full min-h-screen flex flex-col bg-background text-foreground selection:bg-primary-tint selection:text-foreground">
      <GridLines />
      <Header logoConfig={siteData?.logo} scrollProgress={scrollProgress} />
      
      <main className="flex-1 w-full relative z-10 pt-[72px]">
        <SectionRenderer sections={page.sections} />
      </main>

      <Footer logoConfig={siteData?.logo} />
    </div>
  );
}
