import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSiteDataContext } from "../context/SiteDataContext";
import { motion } from "motion/react";
import NitwebsLogo from "./NitwebsLogo";
import StaggeredMenu from "./StaggeredMenu";
import type { StaggeredMenuItem, StaggeredMenuSocialItem } from "./StaggeredMenu";
import SpecularButton from "./ui/SpecularButton";
import SolutionsDrawer from "./SolutionsDrawer";
import { useIntroAnimation } from "../context/IntroContext";

interface NavChild {
  label: string;
  type: "scroll" | "page" | "url";
  target: string;
  description?: string;
}

interface NavLinkData {
  label: string;
  type: "scroll" | "page" | "url";
  target: string;
  children: NavChild[];
}

interface HeaderProps {
  logoConfig?: { mode: string; text?: string; imageUrl?: string };
  scrollProgress: number;
}

const DEFAULT_LINKS: NavLinkData[] = [
  { label: "Home",       type: "page",   target: "/",          children: [] },
  { label: "Services",   type: "scroll", target: "services",   children: [] },
  { label: "About",      type: "scroll", target: "about",      children: [] },
  { label: "Work",       type: "scroll", target: "showcase",   children: [] },
  { label: "Industries", type: "scroll", target: "industries", children: [] },
  { label: "Contact",    type: "scroll", target: "contact",    children: [] },
  { label: "Careers",    type: "page",   target: "/careers",   children: [] }
];

const getInitialLinks = (): NavLinkData[] => {
  try {
    const cached = localStorage.getItem("nitwebs_nav_links");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_LINKS;
};

export default function Header({ logoConfig: propsLogoConfig, scrollProgress }: HeaderProps) {
  const { isTransitioned, shouldPlay, logoConfig: contextLogoConfig, setLogoConfig } = useIntroAnimation();
  const effectiveLogoConfig = propsLogoConfig || contextLogoConfig;
  const [links, setLinks] = useState<NavLinkData[]>(getInitialLinks);
  const [ctaLabel, setCtaLabel] = useState("Get Started");
  const [ctaType, setCtaType] = useState<"scroll" | "page" | "url">("scroll");
  const [ctaTarget, setCtaTarget] = useState("contact");
  
  const [headerSolid, setHeaderSolid] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [socials, setSocials] = useState<StaggeredMenuSocialItem[]>([
    { label: "LinkedIn", link: "https://linkedin.com" },
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" }
  ]);

  const { siteData, navData } = useSiteDataContext();

  useEffect(() => {
    if (propsLogoConfig) {
      setLogoConfig(propsLogoConfig);
    }
  }, [propsLogoConfig, setLogoConfig]);

  useEffect(() => {
    // Dynamic nav links, sourced from the shared SiteDataProvider fetch
    if (!navData) return;
    if (navData.links && navData.links.length > 0) {
      setLinks(navData.links);
      try {
        localStorage.setItem("nitwebs_nav_links", JSON.stringify(navData.links));
      } catch (e) {}
    }
    if (navData.ctaLabel) setCtaLabel(navData.ctaLabel);
    if (navData.ctaType) setCtaType(navData.ctaType);
    if (navData.ctaTarget) setCtaTarget(navData.ctaTarget);
  }, [navData]);

  useEffect(() => {
    // Site content — single source for socials, logo config, theme toggle
    if (!siteData) return;
    if (siteData.logo) {
      setLogoConfig(siteData.logo);
    }
    // Social Links admin panel → SiteContent.socialLinks is the single source of truth
    if (siteData.socialLinks && siteData.socialLinks.length > 0) {
      setSocials(siteData.socialLinks.map((s: any) => ({
        label: s.platform || "Social",
        link: s.href || s.url || "#"
      })));
    }
  }, [siteData, setLogoConfig]);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderSolid(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (targetId: string) => {
    const cleanId = targetId ? targetId.replace(/^#/, "") : "";
    if (!cleanId) return;

    if (cleanId === "hero" || cleanId === "home" || cleanId === "top") {
      const heroEl = document.getElementById("hero");
      if (heroEl) {
        heroEl.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.history.pushState(null, "", "/#hero");
      return;
    }

    const el = document.getElementById(cleanId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `/#${cleanId}`);
    } else {
      window.location.href = `/#${cleanId}`;
    }
  };

  const handleCtaClick = () => {
    if (ctaType === "scroll") {
      handleScrollToSection(ctaTarget);
    } else if (ctaType === "page") {
      window.location.href = ctaTarget;
    } else if (ctaType === "url") {
      window.open(ctaTarget, "_blank", "noopener,noreferrer");
    }
  };

  const staggeredItems: StaggeredMenuItem[] = links.flatMap((link): StaggeredMenuItem[] => {
    const hasChildren = link.children && link.children.length > 0;
    if (hasChildren) {
      return [
        { label: link.label, ariaLabel: link.label, link: "", isHeader: true },
        ...link.children.map((child) => ({
          label: child.label,
          ariaLabel: child.label,
          link: child.target,
          type: child.type as any,
          isChild: true
        }))
      ];
    }
    return [
      {
        label: link.label,
        ariaLabel: link.label,
        link: link.target,
        type: link.type as any
      }
    ];
  });

  staggeredItems.push({
    label: ctaLabel,
    ariaLabel: ctaLabel,
    link: ctaTarget,
    type: ctaType as any,
    isCta: true
  });

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-0 lg:h-auto ${
        headerSolid ? "lg:bg-background/90 lg:backdrop-blur-sm lg:border-b lg:border-border" : "bg-transparent"
      }`}
    >
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-primary z-[999] transition-all duration-75"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <div className="max-w-6xl mx-auto px-6 hidden lg:flex items-center h-[72px]">
        <Link
          id="header-logo-container"
          to="/"
          className="flex items-center mr-10 h-7 w-[120px] shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {(!shouldPlay || isTransitioned) ? (
            <motion.div
              layoutId="site-logo-main"
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 24,
                mass: 0.8,
              }}
              className="flex items-center"
            >
              <NitwebsLogo logoConfig={effectiveLogoConfig} className="h-7 w-auto" />
            </motion.div>
          ) : (
            <div className="h-7 w-[120px]" />
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-end gap-7 flex-1 mr-6">
          {(links || []).map((link) => {
            const hasChildren = Array.isArray(link.children) && link.children.length > 0;
            return (
              <div key={link.label} className="relative group py-2">
                {hasChildren ? (
                  <>
                    <button className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    
                    <div className="absolute top-full left-0 mt-2 min-w-[240px] bg-background border border-border rounded-xl shadow-lg p-2 hidden group-hover:flex flex-col gap-1 z-50">
                      {(link.children || []).map((child) => {
                        if (child.type === "page") {
                          return (
                            <Link 
                              key={child.label} 
                              to={child.target} 
                              className="px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left block"
                            >
                              <div className="text-sm font-semibold text-foreground">{child.label}</div>
                              {child.description && <div className="text-xs text-secondary-text mt-0.5">{child.description}</div>}
                            </Link>
                          );
                        } else if (child.type === "url") {
                          return (
                            <a 
                              key={child.label} 
                              href={child.target} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left block"
                            >
                              <div className="text-sm font-semibold text-foreground">{child.label}</div>
                              {child.description && <div className="text-xs text-secondary-text mt-0.5">{child.description}</div>}
                            </a>
                          );
                        } else {
                          return (
                            <button 
                              key={child.label} 
                              onClick={() => handleScrollToSection(child.target)} 
                              className="px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left block w-full"
                            >
                              <div className="text-sm font-semibold text-foreground">{child.label}</div>
                              {child.description && <div className="text-xs text-secondary-text mt-0.5">{child.description}</div>}
                            </button>
                          );
                        }
                      })}
                    </div>
                  </>
                ) : (
                  link.type === "page" ? (
                    <Link to={link.target} className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer block">
                      {link.label}
                    </Link>
                  ) : link.type === "url" ? (
                    <a href={link.target} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer block">
                      {link.label}
                    </a>
                  ) : (
                    <button 
                      onClick={() => {
                        if (link.label === "Solutions" || link.label === "Services") {
                          setIsDrawerOpen(true);
                        } else {
                          handleScrollToSection(link.target);
                        }
                      }} 
                      className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-5 relative">
          <SpecularButton
            onClick={handleCtaClick}
            size="sm"
            radius={12}
            tint="hsl(var(--foreground))"
            tintOpacity={1}
            textColor="hsl(var(--background))"
            lineColor="hsl(var(--primary))"
            baseColor="hsl(var(--border))"
            className="px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap"
            thickness={2.5}
            intensity={2}
          >
            <span>{ctaLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </SpecularButton>
        </div>
      </div>

      {/* Mobile Staggered Menu */}
      <div className="lg:hidden w-full">
        <StaggeredMenu
          logoConfig={effectiveLogoConfig}
          items={staggeredItems}
          socialItems={socials}
          onScrollToSection={(target) => {
            if (target === "solutions" || target === "services") {
              setIsDrawerOpen(true);
            } else {
              handleScrollToSection(target);
            }
          }}
        />
      </div>

      {/* Side Drawer Component */}
      <SolutionsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onScrollToSection={handleScrollToSection}
      />
    </header>
  );
}
