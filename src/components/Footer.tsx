import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiUrl } from "../lib/api";
import { 
  FaLinkedin, 
  FaTwitter, 
  FaXTwitter, 
  FaGithub, 
  FaInstagram, 
  FaYoutube 
} from "react-icons/fa6";
import { 
  Globe
} from "lucide-react";
import NitwebsLogo from "./NitwebsLogo";
import GridDivider from "./GridDivider";
import { useIntroAnimation } from "../context/IntroContext";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

interface FooterSocialLink {
  platform: string;
  href: string;
  icon?: string;
}

interface FooterBottomLink {
  label: string;
  href: string;
}

interface FooterPlatform {
  name: string;
  imageUrl?: string;
  link?: string;
}

interface FooterProps {
  logoConfig?: { mode: string; text?: string; imageUrl?: string };
}

interface FooterData {
  tagline: string;
  columns: FooterColumn[];
  social: FooterSocialLink[];
  bottomLinks: FooterBottomLink[];
  platforms: FooterPlatform[];
  copyright: string;
}

const DEFAULT_FOOTER: FooterData = {
  tagline: "Building software that builds businesses.",
  columns: [
    {
      heading: "Services",
      links: [
        { label: "AI Engineering", href: "#services" },
        { label: "Custom Software", href: "#services" },
        { label: "Web & Mobile", href: "#services" },
        { label: "Automation", href: "#services" }
      ]
    },
    {
      heading: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Our Work", href: "#showcase" },
        { label: "Process", href: "#process" },
        { label: "Contact", href: "#contact" },
        { label: "Careers", href: "/careers" }
      ]
    }
  ],
  social: [
    { platform: "LinkedIn", href: "https://linkedin.com", icon: "Linkedin" },
    { platform: "Twitter",  href: "https://twitter.com", icon: "Twitter" }
  ],
  bottomLinks: [
    { label: "Privacy Policy",  href: "#" },
    { label: "Terms of Service", href: "#" }
  ],
  platforms: [],
  copyright: `© ${new Date().getFullYear()} Nitwebs Inc. All rights reserved.`
};

const iconMap: Record<string, any> = {
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  xtwitter: FaXTwitter,
  x: FaXTwitter,
  github: FaGithub,
  instagram: FaInstagram,
  youtube: FaYoutube
};

const getInitialFooter = (): FooterData => {
  try {
    const cached = localStorage.getItem("nitwebs_footer_links");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {}
  return DEFAULT_FOOTER;
};

export default function Footer({ logoConfig: propsLogoConfig }: FooterProps) {
  const { logoConfig: contextLogoConfig, setLogoConfig } = useIntroAnimation();
  const effectiveLogoConfig = propsLogoConfig || contextLogoConfig;
  const [footerData, setFooterData] = useState<FooterData>(getInitialFooter);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch footer structure (columns, tagline, etc.)
    fetch(getApiUrl("/footer"))
      .then((res) => {
        if (!res.ok) throw new Error("Footer API offline");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === "object") {
          const merged: FooterData = {
            tagline: data.tagline || DEFAULT_FOOTER.tagline,
            columns: (Array.isArray(data.columns) && data.columns.length > 0) ? data.columns : DEFAULT_FOOTER.columns,
            social: (Array.isArray(data.social) && data.social.length > 0) ? data.social : DEFAULT_FOOTER.social,
            bottomLinks: (Array.isArray(data.bottomLinks) && data.bottomLinks.length > 0) ? data.bottomLinks : DEFAULT_FOOTER.bottomLinks,
            platforms: Array.isArray(data.platforms) ? data.platforms : DEFAULT_FOOTER.platforms,
            copyright: data.copyright || DEFAULT_FOOTER.copyright
          };
          setFooterData(merged);
          try {
            localStorage.setItem("nitwebs_footer_links", JSON.stringify(merged));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.warn("Footer API offline, using fallback static footer defaults:", err.message);
      });

    // Override social links from the global /api/content socialLinks field if available
    fetch(getApiUrl("/content"))
      .then((res) => {
        if (!res.ok) throw new Error("Content API offline");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.socialLinks) && data.socialLinks.length > 0) {
          setFooterData((prev) => ({ 
            ...prev, 
            social: data.socialLinks.map((s: any) => ({
              platform: s.platform || "Social",
              href: s.href || s.url || "#",
              icon: s.icon || s.platform
            }))
          }));
        }
        if (data?.logo) {
          setLogoConfig(data.logo);
        }
      })
      .catch(() => {
        // Silently fall back to footer API social links
      });
  }, [setLogoConfig]);

  const getSocialIcon = (iconName?: string, platform?: string) => {
    const key = (iconName || platform || "").toLowerCase();
    return iconMap[key] || Globe;
  };

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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      handleScrollToSection(href.substring(1));
    } else if (href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const socialList = (Array.isArray(footerData?.social) && footerData.social.length > 0) ? footerData.social : DEFAULT_FOOTER.social;
  const columnsList = (Array.isArray(footerData?.columns) && footerData.columns.length > 0) ? footerData.columns : DEFAULT_FOOTER.columns;
  const platformsList = Array.isArray(footerData?.platforms) ? footerData.platforms : [];

  return (
    <footer className="relative bg-surface/30">
      <GridDivider />
      
      {/* Top multi-column section */}
      <div className={`max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 ${platformsList.length > 0 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        
        {/* Column 1: Logo & Tagline */}
        <div className="lg:col-span-2 flex flex-col items-start gap-4">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <NitwebsLogo logoConfig={effectiveLogoConfig} />
          </Link>
          <p className="text-secondary-text text-sm max-w-sm leading-relaxed mt-2">
            {footerData?.tagline || DEFAULT_FOOTER.tagline}
          </p>
          
          {/* Social Row */}
          <div className="flex gap-3.5 mt-4">
            {socialList.map((soc, idx) => {
              const Icon = getSocialIcon(soc.icon, soc.platform);
              return (
                <a 
                  key={soc.platform + idx} 
                  href={soc.href || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-secondary-text hover:text-foreground hover:border-foreground transition-all duration-200"
                  title={soc.platform}
                >
                  <Icon className="w-4.5 h-4.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Dynamic content columns */}
        {columnsList.map((col, cIdx) => (
          <div key={cIdx} className="flex flex-col gap-4">
            <span className="text-xs font-mono text-primary tracking-widest uppercase mb-1">
              {col.heading}
            </span>
            <ul className="flex flex-col gap-3">
              {(col.links || []).map((link, lIdx) => (
                <li key={link.label + lIdx}>
                  <a 
                    href={link.href || "#"} 
                    onClick={(e) => handleLinkClick(e, link.href || "#")}
                    className="text-sm text-secondary-text hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Platform / listing badges */}
        {platformsList.length > 0 && (
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono text-primary tracking-widest uppercase mb-1">
              As Featured On
            </span>
            <div className="flex flex-col gap-3.5">
              {platformsList.map((platform, idx) => {
                const badge = (
                  <div className="py-1 flex items-center justify-start transition-all duration-200 hover:scale-[1.02] origin-left">
                    {platform.imageUrl ? (
                      <img src={platform.imageUrl} alt={platform.name} className="h-6 max-w-[130px] object-contain object-left" />
                    ) : (
                      <span className="text-sm font-medium text-secondary-text hover:text-foreground whitespace-nowrap transition-colors">{platform.name}</span>
                    )}
                  </div>
                );
                return platform.link ? (
                  <a
                    key={platform.name + idx}
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={platform.name}
                    className="w-fit block"
                  >
                    {badge}
                  </a>
                ) : (
                  <div key={platform.name + idx} title={platform.name} className="w-fit">
                    {badge}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-secondary-text">
          {footerData?.copyright || DEFAULT_FOOTER.copyright}
        </span>
      </div>
    </footer>
  );
}
