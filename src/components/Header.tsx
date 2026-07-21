import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import NitwebsLogo from "./NitwebsLogo";
import StaggeredMenu from "./StaggeredMenu";
import type { StaggeredMenuItem, StaggeredMenuSocialItem } from "./StaggeredMenu";
import SpecularButton from "./ui/SpecularButton";
import ThemeToggle from "./ThemeToggle";
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
  { label: "Services", type: "scroll", target: "services", children: [] },
  { label: "Work",     type: "scroll", target: "showcase", children: [] },
  { label: "Process",  type: "scroll", target: "process",  children: [] },
  { label: "Platform", type: "scroll", target: "platform", children: [] }
];

export default function Header({ logoConfig, scrollProgress }: HeaderProps) {
  const { isTransitioned, shouldPlay, setLogoConfig } = useIntroAnimation();
  const [links, setLinks] = useState<NavLinkData[]>(DEFAULT_LINKS);
  const [ctaLabel, setCtaLabel] = useState("Get Started");
  const [ctaType, setCtaType] = useState<"scroll" | "page" | "url">("scroll");
  const [ctaTarget, setCtaTarget] = useState("contact");
  
  const [headerSolid, setHeaderSolid] = useState(false);
  const [socials, setSocials] = useState<StaggeredMenuSocialItem[]>([
    { label: "LinkedIn", link: "https://linkedin.com" },
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" }
  ]);
  const [showThemeToggle, setShowThemeToggle] = useState(true);

  useEffect(() => {
    if (logoConfig) {
      setLogoConfig(logoConfig);
    }
  }, [logoConfig, setLogoConfig]);

  useEffect(() => {
    // Fetch dynamic nav links
    fetch("http://localhost:5000/api/nav")
      .then((res) => {
        if (!res.ok) throw new Error("Navigation API offline");
        return res.json();
      })
      .then((data) => {
        if (data.links && data.links.length > 0) {
          setLinks(data.links);
        }
        if (data.ctaLabel) setCtaLabel(data.ctaLabel);
        if (data.ctaType) setCtaType(data.ctaType);
        if (data.ctaTarget) setCtaTarget(data.ctaTarget);
      })
      .catch((err) => {
        console.warn("Navigation API offline, using fallback static navLinks:", err.message);
      });

    // Fetch footer socials for staggered menu
    fetch("http://localhost:5000/api/footer")
      .then((res) => {
        if (!res.ok) throw new Error("Footer API offline");
        return res.json();
      })
      .then((data) => {
        if (data.social && data.social.length > 0) {
          setSocials(data.social.map((s: any) => ({
            label: s.platform,
            link: s.href
          })));
        }
      })
      .catch((err) => {
        console.warn("Footer API offline or error, using default socials:", err.message);
      });

    // Fetch site content for the theme-toggle visibility setting
    fetch("http://localhost:5000/api/content")
      .then((res) => {
        if (!res.ok) throw new Error("Content API offline");
        return res.json();
      })
      .then((data) => {
        setShowThemeToggle(data?.theme?.showThemeToggle !== false);
      })
      .catch((err) => {
        console.warn("Content API offline, defaulting theme toggle to visible:", err.message);
      });

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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        headerSolid ? "bg-background/90 backdrop-blur-sm border-b border-border" : "bg-transparent"
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
              <NitwebsLogo logoConfig={logoConfig} className="h-7 w-auto" />
            </motion.div>
          ) : (
            <div className="h-7 w-[120px]" />
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-end gap-7 flex-1 mr-6">
          {links.map((link) => {
            const hasChildren = link.children && link.children.length > 0;
            return (
              <div key={link.label} className="relative group py-2">
                {hasChildren ? (
                  <>
                    <button className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    
                    <div className="absolute top-full left-0 mt-2 min-w-[240px] bg-background border border-border rounded-xl shadow-lg p-2 hidden group-hover:flex flex-col gap-1 z-50">
                      {link.children.map((child) => {
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
                    <button onClick={() => handleScrollToSection(link.target)} className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer block">
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
          {showThemeToggle && <ThemeToggle />}
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
          logoConfig={logoConfig}
          items={staggeredItems}
          socialItems={socials}
          onScrollToSection={handleScrollToSection}
          showThemeToggle={showThemeToggle}
        />
      </div>
    </header>
  );
}
