import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, ArrowUpRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteData } from "../hooks/useSiteData";

interface SolutionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onScrollToSection?: (targetId: string) => void;
}

type TabType = "services" | "industries" | "hire";

// Custom SVGs — original geometric concept, accent color uses site primary token
function TrianglesGraphic({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,15 85,80 15,80" stroke="currentColor" strokeWidth="2" fill="none" />
      <polygon points="50,15 67.5,47.5 32.5,47.5" fill="hsl(var(--primary))" />
      <line x1="50" y1="15" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" />
      <line x1="32.5" y1="47.5" x2="67.5" y2="47.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function InvertedTriangleGraphic({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,85 15,20 85,20" stroke="currentColor" strokeWidth="2" fill="none" />
      <polygon points="50,85 32.5,52.5 67.5,52.5" fill="hsl(var(--primary))" />
      <line x1="15" y1="20" x2="85" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="50" y1="20" x2="50" y2="85" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CirclesGraphic({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="75" cy="50" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M 45 20 A 30 30 0 0 1 75 50 A 22 22 0 0 1 45 50 Z" fill="hsl(var(--primary))" opacity="0.9" />
    </svg>
  );
}

function BoxTrianglesGraphic({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="2" fill="none" />
      <polygon points="20,20 45,20 20,60" fill="hsl(var(--primary))" />
      <polygon points="80,80 55,80 80,40" fill="hsl(var(--primary))" />
      <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}


export default function SolutionsDrawer({
  isOpen,
  onClose,
  onScrollToSection
}: SolutionsDrawerProps) {
  const { siteData } = useSiteData();
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLinkClick = (path: string, type: "page" | "scroll" = "page") => {
    onClose();
    if (type === "scroll" && onScrollToSection) {
      onScrollToSection(path);
    } else {
      const target = path.startsWith("/") ? path : `/${path}`;
      navigate(target);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[99900] flex justify-end w-screen h-screen overflow-hidden overscroll-contain"
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99901]"
          />

          {/* Side Drawer Panel */}
          <motion.div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-[99902] w-full max-w-4xl h-full bg-background text-foreground border-l border-border shadow-2xl flex flex-col overflow-hidden overscroll-contain"
          >
            {/* Top Bar Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-background/95 backdrop-blur shrink-0">
              <h2 className="text-xl sm:text-2xl font-headline font-normal text-foreground tracking-tight">
                Solutions
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-secondary-text hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close Solutions menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Content Body */}
            <div
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto flex flex-col md:flex-row overscroll-contain"
            >
              {/* Left Column: Category Tabs */}
              <div className="w-full md:w-64 border-r-0 md:border-r border-border p-6 flex flex-col justify-between shrink-0 bg-surface/20">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab("services")}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left font-headline text-base sm:text-lg transition-all cursor-pointer ${
                      activeTab === "services"
                        ? "bg-foreground text-background font-normal shadow-sm"
                        : "text-secondary-text font-normal hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>Services</span>
                    {activeTab === "services" ? (
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 shrink-0 opacity-60" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("industries")}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left font-headline text-base sm:text-lg transition-all cursor-pointer ${
                      activeTab === "industries"
                        ? "bg-foreground text-background font-normal shadow-sm"
                        : "text-secondary-text font-normal hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>Industries</span>
                    {activeTab === "industries" ? (
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 shrink-0 opacity-60" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("hire")}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left font-headline text-base sm:text-lg transition-all cursor-pointer ${
                      activeTab === "hire"
                        ? "bg-foreground text-background font-normal shadow-sm"
                        : "text-secondary-text font-normal hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>Hire Talent</span>
                    {activeTab === "hire" ? (
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 shrink-0 opacity-60" />
                    )}
                  </button>
                </div>

                {/* Bottom Left: Social Links */}
                {(() => {
                  const socials: any[] = siteData?.socialLinks || [];
                  if (socials.length === 0) return null;
                  return (
                    <div className="mt-8 md:mt-auto pt-6 border-t border-border/60 flex flex-col gap-3">
                      <span className="text-[10px] font-mono text-secondary-text tracking-widest uppercase">Follow Us</span>
                      <div className="flex flex-wrap gap-2">
                        {socials.map((soc: any, i: number) => (
                          <a
                            key={i}
                            href={soc.href || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={soc.platform}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-secondary-text hover:text-primary hover:border-primary/40 transition-all text-xs font-sans"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              {soc.icon === "linkedin" && <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>}
                              {(soc.icon === "twitter" || soc.icon === "xtwitter" || soc.icon === "x") && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>}
                              {soc.icon === "github" && <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>}
                              {soc.icon === "instagram" && <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>}
                              {soc.icon === "youtube" && <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>}
                              {(soc.icon === "globe" || !["linkedin","twitter","xtwitter","x","github","instagram","youtube"].includes(soc.icon)) && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>}
                            </svg>
                            <span>{soc.platform}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>


              {/* Right Column: Dynamic Content Boxes */}
              <div
                data-lenis-prevent="true"
                data-lenis-prevent-wheel="true"
                data-lenis-prevent-touch="true"
                onWheel={(e) => e.stopPropagation()}
                className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto overscroll-contain"
              >
                {activeTab === "services" && (
                  <div className="flex flex-col gap-6">
                    {(() => {
                      const adminServices = siteData?.services;
                      const drawerBlocks = siteData?.solutionsDrawer?.services;
                      
                      let blocksToRender: any[] = [];
                      if (Array.isArray(drawerBlocks) && drawerBlocks.length > 0) {
                        blocksToRender = drawerBlocks;
                      } else if (Array.isArray(adminServices) && adminServices.length > 0) {
                        blocksToRender = [
                          {
                            category: "Our Services",
                            items: adminServices.map((s: any) => ({
                              title: s.title,
                              link: s.link || "",
                              slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                            }))
                          }
                        ];
                      } else {
                        blocksToRender = [
                          {
                            category: "Build",
                            items: [
                              { title: "Custom Applications", slug: "custom-applications", link: "/custom-applications" },
                              { title: "Enterprise Solutions", slug: "enterprise-solutions", link: "/enterprise-solutions" },
                              { title: "eCommerce & Digital Storefronts", slug: "ecommerce-solutions", link: "/ecommerce-solutions" },
                              { title: "No-Code/Low-Code Solutions", slug: "no-code-solutions", link: "/no-code-solutions" },
                              { title: "Custom Web Development", slug: "custom-web-development", link: "/custom-web-development" },
                              { title: "SaaS Development", slug: "saas-development", link: "/saas-development" },
                              { title: "Cloud & DevOps", slug: "cloud-devops", link: "/cloud-devops" },
                              { title: "Mobile App Development", slug: "mobile-app-development", link: "/mobile-app-development" },
                              { title: "CMS Development", slug: "cms-development", link: "/cms-development" },
                            ]
                          },
                          {
                            category: "Grow",
                            items: [
                              { title: "Performance Marketing Services", slug: "performance-marketing", link: "/performance-marketing" },
                              { title: "eCommerce Growth Solutions", slug: "ecommerce-growth", link: "/ecommerce-growth" },
                              { title: "UX Optimization & Accessibility", slug: "ux-optimization", link: "/ux-optimization" },
                              { title: "IT Strategy & Process Optimization", slug: "it-strategy", link: "/it-strategy" },
                              { title: "Application Maintenance & Support", slug: "application-maintenance", link: "/application-maintenance" },
                              { title: "IT Staff Augmentation Services", slug: "staff-augmentation", link: "/staff-augmentation" },
                              { title: "B2B Lead Generation Solutions", slug: "lead-generation", link: "/lead-generation" },
                            ]
                          }
                        ];
                      }

                      return blocksToRender.map((block: any, bIdx: number) => {
                        const visibleItems = (block.items || []).filter((item: any) => {
                          // Show item if it has a non-empty link, slug, or title
                          const target = item.link || item.slug || item.title;
                          return Boolean(target && String(target).trim() !== "");
                        });

                        if (visibleItems.length === 0) return null;

                      return (
                        <div
                          key={block.category + bIdx}
                          className="border border-border/80 rounded-2xl p-6 bg-surface/30 backdrop-blur-sm relative overflow-hidden transition-all hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl sm:text-2xl font-headline font-normal text-foreground border-b border-foreground/40 pb-1 inline-block">
                                {block.category}
                              </h3>
                            </div>
                            {bIdx % 2 === 0 ? (
                              <TrianglesGraphic className="w-14 h-14 text-foreground/80 shrink-0" />
                            ) : (
                              <InvertedTriangleGraphic className="w-14 h-14 text-foreground/80 shrink-0" />
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            {visibleItems.map((item: any) => {
                              const destination = item.link || item.slug;
                              return (
                                <button
                                  key={item.title}
                                  onClick={() => handleLinkClick(destination)}
                                  className="text-left text-xs sm:text-sm font-sans text-secondary-text hover:text-foreground transition-colors py-1 cursor-pointer flex items-center gap-2 group"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-text/40 group-hover:bg-primary transition-all shrink-0" />
                                  <span>{item.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                  </div>
                )}

                {activeTab === "industries" && (
                  <div className="flex flex-col gap-6">
                    {((Array.isArray(siteData?.industries) && siteData.industries.length > 0) ? siteData.industries : [
                      {
                        title: "Industrial, Mobility & Infrastructure",
                        subheading: "Manufacturing, Construction, Automotive",
                        tags: ["Manufacturing", "Real Estate & Construction", "Mobility & Automotive", "Travel & Hospitality"]
                      },
                      {
                        title: "Digital, Consumer & Media",
                        subheading: "eCommerce, SaaS, Telecom",
                        tags: ["Ecommerce & Retail", "B2B SaaS", "Telecommunications", "Media & Entertainment"]
                      },
                      {
                        title: "Regulated & Public Services",
                        subheading: "Finance, Healthcare, Government",
                        tags: ["Banking & Finance", "Government & Public Sector", "Healthcare & Wellness"]
                      }
                    ]).map((ind: any, iIdx: number) => {
                      const rawTags = ind.tags || [];
                      const tagsList = Array.isArray(rawTags)
                        ? rawTags
                        : (typeof rawTags === "string" ? rawTags.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
                      const title = ind.title || ind.name || `Industry Domain ${iIdx + 1}`;

                      // Only show sub-links if non-empty
                      const visibleTags = tagsList.filter((tag: string) => Boolean(tag && tag.trim() !== ""));

                      return (
                        <div
                          key={title + iIdx}
                          className="border border-border/80 rounded-2xl p-6 bg-surface/30 backdrop-blur-sm relative overflow-hidden transition-all hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg sm:text-xl font-headline font-normal text-foreground leading-snug">
                                {title}
                              </h3>
                              {ind.subheading && (
                                <p className="text-xs font-sans text-secondary-text/80 mt-1">
                                  {ind.subheading}
                                </p>
                              )}
                            </div>
                            {iIdx % 3 === 0 && <InvertedTriangleGraphic className="w-12 h-12 text-foreground/80 shrink-0" />}
                            {iIdx % 3 === 1 && <CirclesGraphic className="w-12 h-12 text-foreground/80 shrink-0" />}
                            {iIdx % 3 === 2 && <BoxTrianglesGraphic className="w-12 h-12 text-foreground/80 shrink-0" />}
                          </div>

                          {visibleTags.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                              {visibleTags.map((tag: string) => {
                                const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                                return (
                                  <button
                                    key={tag}
                                    onClick={() => handleLinkClick(ind.link || slug)}
                                    className="text-left text-xs sm:text-sm font-sans text-secondary-text hover:text-foreground transition-colors py-1 cursor-pointer flex items-center gap-2 group"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-text/40 group-hover:bg-primary transition-all shrink-0" />
                                    <span>{tag}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "hire" && (
                  <div className="flex flex-col gap-6">
                    {(siteData?.solutionsDrawer?.hire || [
                      {
                        category: "Dedicated Engineers & Specialists",
                        items: [
                          { title: "Full-Stack Engineers", slug: "hire-fullstack", link: "/hire-fullstack" },
                          { title: "AI & ML Specialists", slug: "hire-ai-ml", link: "/hire-ai-ml" },
                          { title: "Cloud Architects", slug: "hire-cloud-architect", link: "/hire-cloud-architect" },
                          { title: "DevOps Engineers", slug: "hire-devops", link: "/hire-devops" },
                          { title: "Frontend Developers", slug: "hire-frontend", link: "/hire-frontend" },
                          { title: "Mobile App Developers", slug: "hire-mobile", link: "/hire-mobile" },
                        ]
                      },
                      {
                        category: "Product, Design & QA Talent",
                        items: [
                          { title: "UI/UX Designers", slug: "hire-ui-ux", link: "/hire-ui-ux" },
                          { title: "Product Managers", slug: "hire-product-managers", link: "/hire-product-managers" },
                          { title: "QA & Automation Engineers", slug: "hire-qa", link: "/hire-qa" },
                          { title: "Solution Architects", slug: "hire-architects", link: "/hire-architects" },
                        ]
                      }
                    ]).map((block: any, hIdx: number) => {
                      const visibleItems = (block.items || []).filter((item: any) => {
                        const target = item.link !== undefined ? item.link : item.slug;
                        return Boolean(target && String(target).trim() !== "");
                      });

                      if (visibleItems.length === 0) return null;

                      return (
                        <div
                          key={block.category + hIdx}
                          className="border border-border/80 rounded-2xl p-6 bg-surface/30 backdrop-blur-sm relative overflow-hidden transition-all hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg sm:text-xl font-headline font-normal text-foreground">
                                {block.category}
                              </h3>
                            </div>
                            {hIdx % 2 === 0 ? (
                              <TrianglesGraphic className="w-14 h-14 text-foreground/80 shrink-0" />
                            ) : (
                              <CirclesGraphic className="w-14 h-14 text-foreground/80 shrink-0" />
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            {visibleItems.map((item: any) => {
                              const destination = item.link || item.slug;
                              return (
                                <button
                                  key={item.title}
                                  onClick={() => handleLinkClick(destination)}
                                  className="text-left text-xs sm:text-sm font-sans text-secondary-text hover:text-foreground transition-colors py-1 cursor-pointer flex items-center gap-2 group"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-text/40 group-hover:bg-primary transition-all shrink-0" />
                                  <span>{item.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
